/**
 * Аудит точності граматичного двигуна: випадкова вибірка збігів і свідомих
 * пропусків (`skipped`) із книжки бібліотеки → модель як суддя → частка згоди
 * по кожному `ruleId`.
 *
 *   npm run grammar:audit -- [slug] [--matches 200] [--skips 100] [--seed 1]
 *
 * Суддя — РІВНО той самий `SYSTEM` з `review.ts`, що працює в бойовому
 * розборі: аудит міряє згоду двигуна з тим шаром, який його доповнює, а не з
 * абстрактною істиною. З ANTHROPIC_API_KEY суддя викликається через SDK
 * (`review()`); без ключа — через Claude CLI, як у процедурі розмітки з
 * `docs/library-prompt.md`.
 *
 * Вибірка детермінована: той самий seed дає ті самі шматки й ті самі збіги,
 * тому два прогони можна порівнювати між собою.
 *
 * Судиться ШМАТОК ЦІЛКОМ — так само, як він судиться в `review.ts`, — а
 * оцінюються лише вибрані з нього збіги: згода для збігу — суддя розмітив
 * проміжок, що перетинається, тим самим часом; згода для пропуску — суддя
 * там не розмітив нічого.
 *
 * Шляхи імпортів ВІДНОСНІ, з розширенням `.ts`, — як і в інших скриптах:
 * файл виконує `tsx` поза Next.js.
 */
import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import { chunkText, chunksOf, type Chunk } from '../src/lib/analyzer/chunks.ts';
import { SYSTEM, review, type ReviewedMatch } from '../src/lib/analyzer/review.ts';
import { tokenize, type AnalyzedToken } from '../src/lib/analyzer/tenses.ts';
import { wordTokens } from '../src/lib/analyzer/words.ts';
import { analyzeGrammar, type GrammarMatch, type GrammarSkip } from '../src/lib/grammar/index.ts';
import { isTenseKey } from '../src/types/content.ts';

const LIBRARY_DIR = path.join(process.cwd(), 'src/content/library');
const run = promisify(execFile);

/**
 * Скільки прикладів брати з одного шматка. Без цієї межі перші ж один-два
 * шматки закрили б усю квоту, і аудит міряв би точність на одному розділі
 * замість усієї книжки.
 */
const MATCHES_PER_CHUNK = 30;
const SKIPS_PER_CHUNK = 20;

/** Скільки прикладів незгоди друкувати на правило — досить, щоб побачити характер помилки. */
const EXAMPLES_PER_RULE = 3;

interface Options {
  slug: string;
  matchQuota: number;
  skipQuota: number;
  seed: number;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { slug: 'alice-in-wonderland', matchQuota: 200, skipQuota: 100, seed: 1 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]?.trim();
    if (arg === undefined || arg === '') continue;
    if (arg === '--matches') options.matchQuota = Number(argv[++i]);
    else if (arg === '--skips') options.skipQuota = Number(argv[++i]);
    else if (arg === '--seed') options.seed = Number(argv[++i]);
    else if (!arg.startsWith('--')) options.slug = arg;
    else throw new Error(`Незрозумілий аргумент "${arg}"`);
  }
  if (![options.matchQuota, options.skipQuota, options.seed].every(Number.isInteger)) {
    throw new Error('--matches, --skips і --seed мусять бути цілими числами');
  }
  return options;
}

/** mulberry32 — досить випадковості для вибірки, і жодних залежностей. */
function rngOf(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: readonly T[], rng: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/** Та сама нумерація слів, що в `review.ts`: порядковий номер, а не індекс токена. */
function numbered(words: { raw: string }[]): string {
  return words.map((word, order) => `${order}:${word.raw}`).join(' ');
}

/**
 * Суддя без ключа: Claude CLI з тим самим системним промптом. Схему інструмента
 * через CLI не передати, тому відповідь просимо голим JSON і розбираємо самі —
 * усе, що не пройшло перевірку меж і часу, мовчки відкидається, як і в
 * `review.accept`.
 */
async function judgeByCli(text: string): Promise<ReviewedMatch[]> {
  const words = wordTokens(tokenize(text));
  const system =
    `${SYSTEM}\n\n` +
    'Output: return ONLY a JSON object {"matches":[{"from":<int>,"to":<int>,"tense":"<key>"}]} ' +
    'with the word indices exactly as numbered in the input. No prose, no code fences.';

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';
  const { stdout } = await run(
    'claude',
    ['-p', '--model', model, '--system-prompt', system, numbered(words)],
    { maxBuffer: 64 * 1024 * 1024, timeout: 20 * 60 * 1000 },
  );

  const raw = stdout.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  const parsed: unknown = JSON.parse(raw);
  const matches = (parsed as { matches?: unknown }).matches;
  if (!Array.isArray(matches)) return [];

  const out: ReviewedMatch[] = [];
  for (const item of matches) {
    if (typeof item !== 'object' || item === null) continue;
    const { from, to, tense } = item as { from?: unknown; to?: unknown; tense?: unknown };
    if (!Number.isInteger(from) || !Number.isInteger(to) || !isTenseKey(tense)) continue;
    const start = words[from as number];
    const end = words[to as number];
    if (start === undefined || end === undefined || (from as number) > (to as number)) continue;
    out.push({ from: start.index, to: end.index, tense });
  }
  return out;
}

async function judge(text: string): Promise<ReviewedMatch[]> {
  if (process.env.ANTHROPIC_API_KEY) {
    const result = await review(text);
    if (result === null) throw new Error('review() не відповів попри наявний ключ');
    return result.matches;
  }
  return judgeByCli(text);
}

function overlaps(a: { from: number; to: number }, b: { from: number; to: number }): boolean {
  return a.from <= b.to && b.from <= a.to;
}

/** Слова конструкції з ±5 словами довкола — прикладом незгоди читається саме це. */
function snippet(tokens: AnalyzedToken[], span: { from: number; to: number }): string {
  const words = wordTokens(tokens);
  const start = words.findIndex((word) => word.index >= span.from);
  let end = start;
  while (end + 1 < words.length && (words[end + 1]?.index ?? Infinity) <= span.to) end += 1;
  if (start < 0) return '';
  const before = words.slice(Math.max(0, start - 5), start).map((w) => w.raw);
  const inside = words.slice(start, end + 1).map((w) => w.raw);
  const after = words.slice(end + 1, end + 6).map((w) => w.raw);
  return `…${before.join(' ')} «${inside.join(' ')}» ${after.join(' ')}…`;
}

interface RuleScore {
  total: number;
  agreed: number;
  examples: string[];
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const storyFile = path.join(LIBRARY_DIR, options.slug, 'story.txt');
  if (!existsSync(storyFile)) throw new Error(`${storyFile}: файла немає`);
  const text = readFileSync(storyFile, 'utf8');

  const tokens = tokenize(text);
  const chunks: Chunk[] = chunksOf(tokens);
  const rng = rngOf(options.seed);

  console.log(
    `${options.slug}: ${chunks.length} шматків; вибірка ${options.matchQuota} збігів + ` +
      `${options.skipQuota} пропусків, seed ${options.seed}, суддя — ${
        process.env.ANTHROPIC_API_KEY ? 'SDK (review)' : 'Claude CLI'
      }`,
  );

  const byRule = new Map<string, RuleScore>();
  const score = (ruleId: string, agreed: boolean, example: string): void => {
    const entry = byRule.get(ruleId) ?? { total: 0, agreed: 0, examples: [] };
    entry.total += 1;
    if (agreed) entry.agreed += 1;
    else if (entry.examples.length < EXAMPLES_PER_RULE) entry.examples.push(example);
    byRule.set(ruleId, entry);
  };

  let matchesTaken = 0;
  let matchesAgreed = 0;
  let skipsTaken = 0;
  let skipsAgreed = 0;
  // Незгода незгоді не рівня: «суддя каже інший час» — суперечність, а «суддя
  // не бачить збігу» найчастіше межа повноти самого судді. Рахуємо окремо.
  let retensed = 0;
  let unseen = 0;

  for (const chunk of shuffled(chunks, rng)) {
    if (matchesTaken >= options.matchQuota && skipsTaken >= options.skipQuota) break;

    // Двигун і суддя дивляться на той самий текст шматка, тому координати
    // токенів у них спільні за побудовою — жодних зсувів додавати не треба.
    const piece = chunkText(tokens, chunk);
    const engine = analyzeGrammar(piece);
    const pieceTokens = tokenize(piece);

    const wantMatches = Math.min(MATCHES_PER_CHUNK, options.matchQuota - matchesTaken);
    const wantSkips = Math.min(SKIPS_PER_CHUNK, options.skipQuota - skipsTaken);
    const sampleMatches: GrammarMatch[] = shuffled(engine.matches, rng).slice(0, Math.max(0, wantMatches));
    const sampleSkips: GrammarSkip[] = shuffled(engine.skipped, rng).slice(0, Math.max(0, wantSkips));
    if (sampleMatches.length === 0 && sampleSkips.length === 0) continue;

    const judged = await judge(piece);

    // Суддя, що побачив у шматку на дві сотні конструкцій одну-дві, не суддя:
    // його відповідь обвалилась (обрив виводу чи відмова інструмента). Такий
    // шматок НЕ судиться — зарахувати його означало б записати всі збіги в
    // незгоду, а всі пропуски в згоду, тобто зіпсувати обидва числа разом.
    if (judged.length < engine.matches.length * 0.2) {
      console.log(
        `  шматок [${chunk.start}-${chunk.end}]: суддя побачив ${judged.length} з ` +
          `${engine.matches.length} — відповідь обвалилась, шматок пропущено`,
      );
      continue;
    }

    console.log(
      `  шматок [${chunk.start}-${chunk.end}]: двигун ${engine.matches.length} збігів / ` +
        `${engine.skipped.length} пропусків, суддя ${judged.length}; ` +
        `у вибірку ${sampleMatches.length}+${sampleSkips.length}`,
    );

    for (const match of sampleMatches) {
      const agreed = judged.some((j) => overlaps(j, match) && j.tense === match.tense);
      matchesTaken += 1;
      if (agreed) matchesAgreed += 1;
      const verdict = judged.find((j) => overlaps(j, match));
      if (!agreed) {
        if (verdict === undefined) unseen += 1;
        else retensed += 1;
      }
      const note = verdict === undefined ? 'суддя не бачить збігу' : `суддя каже ${verdict.tense}`;
      score(match.ruleId, agreed, `${snippet(pieceTokens, match)} — двигун ${match.tense}, ${note}`);
    }

    for (const skip of sampleSkips) {
      const verdict = judged.find((j) => overlaps(j, skip));
      const agreed = verdict === undefined;
      skipsTaken += 1;
      if (agreed) skipsAgreed += 1;
      const note = verdict === undefined ? '' : ` — суддя каже ${verdict.tense}`;
      score(skip.ruleId, agreed, `${snippet(pieceTokens, skip)}${note}`);
    }
  }

  console.log('\n=== згода по правилах ===');
  const rows = [...byRule.entries()].sort((a, b) => a[1].agreed / a[1].total - b[1].agreed / b[1].total);
  for (const [ruleId, entry] of rows) {
    const share = Math.round((entry.agreed / entry.total) * 100);
    console.log(`  ${ruleId.padEnd(20)} ${String(entry.agreed).padStart(3)}/${String(entry.total).padEnd(3)} ${String(share).padStart(3)}%`);
    for (const example of entry.examples) console.log(`      ${example}`);
  }

  const total = matchesTaken + skipsTaken;
  const agreed = matchesAgreed + skipsAgreed;
  console.log('\n=== підсумок ===');
  console.log(`  збіги:    ${matchesAgreed}/${matchesTaken} (${Math.round((matchesAgreed / Math.max(1, matchesTaken)) * 100)}%)`);
  console.log(`    незгода: інший час ${retensed}, суддя не бачить ${unseen}`);
  console.log(`  пропуски: ${skipsAgreed}/${skipsTaken} (${Math.round((skipsAgreed / Math.max(1, skipsTaken)) * 100)}%)`);
  console.log(`  разом:    ${agreed}/${total} (${Math.round((agreed / Math.max(1, total)) * 100)}%)`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

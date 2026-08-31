/**
 * Перегляд зміни правил У СЛОВАХ до коміту артефакту: що двигун (`analyzeGrammar`)
 * розмітив би зараз проти того, що лежить у `matches.json` бібліотеки.
 *
 *   npm run grammar:diff -- <slug>
 *
 * Друкує три списки з ±5 слів контексту — додані збіги, зниклі та змінені
 * (інший час або інша межа), — і підсумок по часах. Це те, що читає рев'юер
 * PR поруч із перегенерованим `matches.json`: індекси токенів у файлі очам
 * нічого не кажуть, а слова з контекстом — кажуть усе.
 *
 * Скрипт нічого не пише — тільки читає й друкує. Перегенерація артефакту
 * лишається за `import-book.mts`.
 *
 * Шляхи імпортів ВІДНОСНІ, з розширенням `.ts`, — як і в інших скриптах:
 * файл виконує `tsx` поза Next.js.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { analyzeGrammar, type GrammarMatch } from '../src/lib/grammar/index.ts';
import { tokenize, type Match } from '../src/lib/analyzer/tenses.ts';
import { wordTokens } from '../src/lib/analyzer/words.ts';
import { parseArtifact, toTokenMatches } from '../src/lib/library/artifact.ts';

const LIBRARY_DIR = path.join(process.cwd(), 'src/content/library');

/** Скільки слів контексту з кожного боку конструкції. */
const CONTEXT_WORDS = 5;

const USAGE = `Порівняти поточний matches.json зі свіжою розміткою двигуна.

  npm run grammar:diff -- <slug>

<slug> — каталог у src/content/library/, наприклад alice-in-wonderland.`;

interface Change {
  /** Розмітка з артефакту; відсутня в доданих. */
  old?: Match;
  /** Свіжий збіг двигуна; відсутній у зниклих. */
  fresh?: GrammarMatch;
}

/**
 * Обидва списки відсортовані за `from` і без внутрішніх перекриттів, тому
 * порівняння — це один прохід двома вказівниками. Збіги, що перетинаються,
 * вважаються «тим самим місцем»: однакові час і межі — без змін, інакше —
 * змінений. Один старий проти двох нових (правило розрізало конструкцію)
 * дасть «змінений» плюс «доданий» — рев'юеру видно обидві половини.
 */
function diff(current: Match[], fresh: GrammarMatch[]): { added: Change[]; removed: Change[]; changed: Change[] } {
  const added: Change[] = [];
  const removed: Change[] = [];
  const changed: Change[] = [];

  let i = 0;
  let j = 0;
  while (i < current.length || j < fresh.length) {
    const old = current[i];
    const now = fresh[j];

    if (old === undefined) {
      if (now !== undefined) added.push({ fresh: now });
      j += 1;
      continue;
    }
    if (now === undefined) {
      removed.push({ old });
      i += 1;
      continue;
    }

    if (old.to < now.from) {
      removed.push({ old });
      i += 1;
      continue;
    }
    if (now.to < old.from) {
      added.push({ fresh: now });
      j += 1;
      continue;
    }

    if (old.tense !== now.tense || old.from !== now.from || old.to !== now.to) {
      changed.push({ old, fresh: now });
    }
    i += 1;
    j += 1;
  }

  return { added, removed, changed };
}

/** Порядковий номер слова (з 0) для індексу токена — щоб різати контекст словами, а не токенами. */
function wordOrderOf(words: { index: number }[]): Map<number, number> {
  return new Map(words.map((word, order) => [word.index, order]));
}

/**
 * «…five words «had never seen» five words…» — конструкція в лапках, довкола
 * контекст. Межі збігу завжди на словах (так їх дають і двигун, і артефакт),
 * тому пряме звернення до таблиці не промахується.
 */
function snippet(
  words: { index: number; raw: string }[],
  orderOf: Map<number, number>,
  span: { from: number; to: number },
): string {
  const start = orderOf.get(span.from);
  const end = orderOf.get(span.to);
  if (start === undefined || end === undefined) return '(межа збігу не на слові)';

  const before = words.slice(Math.max(0, start - CONTEXT_WORDS), start).map((w) => w.raw);
  const inside = words.slice(start, end + 1).map((w) => w.raw);
  const after = words.slice(end + 1, end + 1 + CONTEXT_WORDS).map((w) => w.raw);

  return `${before.join(' ')} «${inside.join(' ')}» ${after.join(' ')}`.trim();
}

function label(change: Change): string {
  const { old, fresh } = change;
  if (old && fresh) {
    const tense = old.tense === fresh.tense ? fresh.tense : `${old.tense} → ${fresh.tense}`;
    return `[${tense}, ${fresh.ruleId}]`;
  }
  if (fresh) return `[${fresh.tense}, ${fresh.ruleId}]`;
  if (old) return `[${old.tense}]`;
  return '';
}

function printList(
  title: string,
  list: Change[],
  words: { index: number; raw: string }[],
  orderOf: Map<number, number>,
): void {
  console.log(`\n=== ${title}: ${list.length} ===`);
  for (const change of list) {
    const span = change.fresh ?? change.old;
    if (span === undefined) continue;
    const context = snippet(words, orderOf, span);
    const was =
      change.old && change.fresh
        ? ` (було: «${words
            .slice(orderOf.get(change.old.from) ?? 0, (orderOf.get(change.old.to) ?? 0) + 1)
            .map((w) => w.raw)
            .join(' ')}» ${change.old.tense})`
        : '';
    console.log(`  ${label(change)} …${context}…${was}`);
  }
}

function countByTense(matches: { tense: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const match of matches) counts.set(match.tense, (counts.get(match.tense) ?? 0) + 1);
  return counts;
}

function main(): void {
  const slug = process.argv[2]?.trim();
  if (slug === undefined || slug === '' || slug.startsWith('--')) {
    console.error(USAGE);
    process.exit(1);
  }

  const dir = path.join(LIBRARY_DIR, slug);
  const storyFile = path.join(dir, 'story.txt');
  const matchesFile = path.join(dir, 'matches.json');
  if (!existsSync(storyFile) || !existsSync(matchesFile)) {
    console.error(`${dir}: немає story.txt або matches.json.\n\n${USAGE}`);
    process.exit(1);
  }

  const text = readFileSync(storyFile, 'utf8');
  const artifact = parseArtifact(JSON.parse(readFileSync(matchesFile, 'utf8')), matchesFile);
  const current = toTokenMatches(text, artifact);

  const result = analyzeGrammar(text);
  const words = wordTokens(tokenize(text));
  const orderOf = wordOrderOf(words);

  console.log(
    `${slug}: в артефакті ${current.length} збігів (${artifact.seededBy}), ` +
      `двигун дає ${result.matches.length} (правила v${result.rulesVersion})`,
  );

  const { added, removed, changed } = diff(current, result.matches);
  printList('додані двигуном', added, words, orderOf);
  printList('зниклі', removed, words, orderOf);
  printList('змінені (час або межа)', changed, words, orderOf);

  console.log('\n=== підсумок по часах (артефакт → двигун) ===');
  const was = countByTense(current);
  const now = countByTense(result.matches);
  for (const tense of new Set([...was.keys(), ...now.keys()])) {
    const before = was.get(tense) ?? 0;
    const after = now.get(tense) ?? 0;
    const delta = after - before;
    console.log(`  ${tense.padEnd(4)} ${String(before).padStart(5)} → ${String(after).padStart(5)}  (${delta >= 0 ? '+' : ''}${delta})`);
  }
}

main();

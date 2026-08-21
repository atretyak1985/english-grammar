/**
 * Внесення книжки в бібліотеку: PDF, `.txt` або URL → три файли артефакту в
 * `src/content/library/<slug>/` (`story.txt`, `story.json`, `matches.json`),
 * готові до `npm run db:seed`.
 *
 * Досі цей крок був ручним: `docs/library-prompt.md` описує, як оператор ріже
 * текст, нумерує слова наскрізно й розмічає кожен шматок через Claude CLI.
 * Найтендітніше місце тієї процедури — саме нумерація: зсув на ОДНЕ слово
 * розмічує не ту конструкцію на весь залишок книжки і на око невидимий. Тут
 * нумерацію рахує той самий код, що й читалка (`chunksOf`, `wordTokens`), тому
 * зсуву не може бути за побудовою, а не за уважністю оператора.
 *
 * Скрипт нічого не пише в базу — лише файли. Засів лишається окремим кроком
 * (`seed-library.mts`), і поділ тут не формальний: артефакт мусить полежати в
 * репозиторії під переглядом, перш ніж стати публічною сторінкою.
 *
 * Шляхи імпортів ВІДНОСНІ, з розширенням `.ts`, — як і в `seed-library.mts`:
 * файл виконує `tsx` поза Next.js, і alias `@/` для нього не діє.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { chunksOf, chunkText, type Chunk } from '../src/lib/analyzer/chunks.ts';
import { findMatches, tokenize, type AnalyzedToken, type Match } from '../src/lib/analyzer/tenses.ts';
import { wordTokens } from '../src/lib/analyzer/words.ts';
import { review } from '../src/lib/analyzer/review.ts';
import { normalizeExtractedText } from '../src/lib/extract/types.ts';
import {
  ARTIFACT_FORMAT,
  parseArtifact,
  toTokenMatches,
  validate,
  type Artifact,
  type ArtifactChunk,
  type ArtifactMatch,
} from '../src/lib/library/artifact.ts';

const LIBRARY_DIR = path.join(process.cwd(), 'src/content/library');

interface Options {
  input: string;
  slug: string;
  title: string;
  author: string;
  source: string;
  license: string;
  sourceUrl: string;
  sortOrder: number;
  /** Уточнити розмітку моделлю замість локальних правил. */
  useReview: boolean;
}

const USAGE = `Внести книжку в бібліотеку.

Переноси рядків працюють у прямому виклику, бо зворотний слеш тут поза лапками:

  npm run import-book -- --in <файл|URL> --slug <slug> \\
    --title "Назва" --author "Автор" \\
    --source "Project Gutenberg" --license "public domain" \\
    --source-url "https://..." [--sort-order 1] [--review]

Через make ARGS доводиться писати ОДНИМ рядком: усередині лапок зворотний слеш
рядка не переносить, а лишається в значенні, і Make виконує тільки перший рядок.

  make import-book ARGS='--in <файл|URL> --slug <slug> --title "Назва" --author "Автор" --source "Project Gutenberg" --license "public domain" --source-url "https://..."'

  --in          PDF, .txt або http(s) URL. Шапку й підвал Project Gutenberg
                скрипт зрізає сам.
  --review      розмітити моделлю (потрібен ANTHROPIC_API_KEY, платний виклик
                на кожен шматок). Типово — локальні правила, безкоштовно й
                без мережі.
`;

function parseArgs(argv: string[]): Options {
  const raw = new Map<string, string>();
  let useReview = false;

  /**
   * Аргументи нормалізуються ДО розбору: обрізаються з боків, а порожні
   * відкидаються. Це не косметика, а конкретний випадок — `make import-book
   * ARGS='…'` із перенесенням рядка всередині лапок. Зворотний слеш там не
   * переносить рядок, а лишається в значенні, тому Make виконує лише перший
   * рядок і в argv прилітає аргумент з одних пробілів. Розбирати його як
   * введення означало б звинувачувати людину в тому, що зробила оболонка.
   */
  const args: string[] = [];
  for (const item of argv) {
    const trimmed = item.trim();
    if (trimmed === '') continue;
    if (trimmed === '\\') {
      throw new Error(
        "У аргументах лишився зворотний слеш. Усередині ARGS='…' він не переносить рядок, а " +
          'потрапляє в значення — через це Make виконує лише перший рядок. Запишіть ARGS одним ' +
          'рядком або викличте `npm run import-book -- …` напряму.',
      );
    }
    args.push(trimmed);
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === undefined) continue;
    if (arg === '--review') {
      useReview = true;
      continue;
    }
    if (!arg.startsWith('--')) throw new Error(`Незрозумілий аргумент "${arg}".\n\n${USAGE}`);
    const value = args[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Аргумент ${arg} без значення.\n\n${USAGE}`);
    }
    raw.set(arg.slice(2), value);
    i += 1;
  }

  function required(key: string): string {
    const value = raw.get(key);
    if (value === undefined || value.length === 0) {
      throw new Error(`Не задано --${key}.\n\n${USAGE}`);
    }
    return value;
  }

  const slug = required('slug');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    // Slug стає сегментом URL (`/library/<slug>`) і назвою каталогу водночас.
    throw new Error(`--slug "${slug}" мусить бути у вигляді kebab-case: лише малі літери, цифри й дефіси.`);
  }

  const sortOrderRaw = raw.get('sort-order') ?? '0';
  const sortOrder = Number(sortOrderRaw);
  if (!Number.isInteger(sortOrder)) {
    throw new Error(`--sort-order мусить бути цілим числом, отримано "${sortOrderRaw}".`);
  }

  return {
    input: required('in'),
    slug,
    title: required('title'),
    author: required('author'),
    source: required('source'),
    license: required('license'),
    sourceUrl: required('source-url'),
    sortOrder,
    useReview,
  };
}

/**
 * Текстовий шар PDF без обрізання. `extractPdf` тут не підходить навмисно: він
 * ріже текст на `MAX_TEXT_CHARS` (120 тис. знаків) — межа аналізатора, де довгий
 * текст лише сповільнює підсвітку. Книжка в бібліотеці розбирається один раз
 * під час засіву, тому та межа обрізала б половину роману без жодної причини.
 */
async function readPdf(file: string): Promise<string> {
  const { extractText, getDocumentProxy } = await import('unpdf');
  const bytes = new Uint8Array(readFileSync(file));
  const pdf = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  const normalized = normalizeExtractedText(text);
  if (normalized.replace(/\s/g, '').length < totalPages * 20) {
    throw new Error(
      `${file}: у PDF немає текстового шару — це скан. Розпізнати його цим скриптом не можна.`,
    );
  }
  console.log(`прочитано PDF: ${totalPages} стор.`);
  return normalized;
}

/**
 * Шапка й підвал Project Gutenberg. Їх треба зрізати саме тут, до нарізки на
 * шматки: ліцензійний текст — це кілька сотень слів, які зсунули б межі всіх
 * шматків і потрапили б у підсвітку як звичайна проза.
 */
function stripGutenberg(text: string): string {
  const start = text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i);
  const end = text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^*]*\*\*\*/i);
  if (start?.index === undefined && end?.index === undefined) return text;

  const from = start?.index === undefined ? 0 : start.index + start[0].length;
  const to = end?.index ?? text.length;
  console.log('зрізано шапку/підвал Project Gutenberg');
  return text.slice(from, to).trim();
}

async function readInput(spec: string): Promise<string> {
  if (/^https?:\/\//.test(spec)) {
    const response = await fetch(spec);
    if (!response.ok) throw new Error(`${spec}: ${response.status} ${response.statusText}`);
    console.log(`завантажено ${spec}`);
    return normalizeExtractedText(await response.text());
  }
  if (spec.toLowerCase().endsWith('.pdf')) return readPdf(spec);
  return normalizeExtractedText(readFileSync(spec, 'utf8'));
}

/**
 * Розмітка моделлю, шматок за шматком. Індекси, які повертає `review`, —
 * відносні до тексту шматка, тому додається `chunk.start`: текст шматка
 * склеєний з тих самих токенів (`chunkText`), і його `tokenize` дає ту саму
 * послідовність, тому зсув — просте додавання, а не пошук відповідності.
 *
 * Шматок, на якому модель не відповіла, НЕ лишається порожнім: у нього
 * підставляються локальні правила. Порожній шматок посеред книжки виглядав би
 * як сторінка без жодного дієслова — тихіша й гірша поломка, ніж трохи грубіша
 * розмітка.
 */
async function markupByReview(tokens: AnalyzedToken[], chunks: Chunk[]): Promise<Match[]> {
  const all: Match[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const text = chunkText(tokens, chunk);
    const result = await review(text);

    if (result === null) {
      const local = findMatches(tokens).filter(
        (match) => match.from >= chunk.start && match.to <= chunk.end,
      );
      console.warn(
        `шматок ${index + 1}/${chunks.length}: модель не відповіла — лишаються локальні правила (${local.length} збігів)`,
      );
      all.push(...local);
      continue;
    }

    for (const match of result.matches) {
      all.push({ from: match.from + chunk.start, to: match.to + chunk.start, tense: match.tense });
    }
    console.log(
      `шматок ${index + 1}/${chunks.length}: ${result.matches.length} збігів, ` +
        `${result.usage.input} вх. / ${result.usage.output} вих. токенів`,
    );
  }

  return all.sort((a, b) => a.from - b.from);
}

/**
 * Індекси токенів → номери слів з 1, наскрізно, згруповані по шматках. Це
 * зворотний бік `toTokenMatches`, і рахується він тією самою таблицею
 * `wordTokens` — інакше два переклади між тими самими координатами розійшлися б,
 * а розбіжність тут зсуває розмітку на весь текст.
 *
 * Збіг, що перетинає межу шматків, відкидається з попередженням. Причина
 * практична: засів розкладає збіги по шматках умовою `from >= start && to <= end`
 * (`seed-library.mts`), тому такий збіг не потрапив би НІ в один шматок і зник
 * би молча. Трапитись це може лише на жорсткому розрізі `CHUNK_MAX_WORDS`
 * посеред речення.
 */
function toArtifactChunks(tokens: AnalyzedToken[], chunks: Chunk[], matches: Match[]): ArtifactChunk[] {
  const words = wordTokens(tokens);
  const wordNumber = new Map<number, number>(words.map((word, i) => [word.index, i + 1]));

  return chunks.map((chunk, index) => {
    const firstWord = wordNumber.get(chunk.start);
    const lastWord = wordNumber.get(chunk.end);
    if (firstWord === undefined || lastWord === undefined) {
      throw new Error(`шматок ${index}: межі [${chunk.start}-${chunk.end}] не є словами`);
    }

    const inChunk: ArtifactMatch[] = [];
    for (const match of matches) {
      if (match.from < chunk.start || match.from > chunk.end) continue;

      const word = wordNumber.get(match.from);
      const last = wordNumber.get(match.to);
      if (word === undefined || last === undefined) continue;

      if (match.to > chunk.end) {
        console.warn(
          `шматок ${index}: збіг зі слова ${word} перетинає межу шматка — відкинуто`,
        );
        continue;
      }

      inChunk.push({ word, length: last - word + 1, tense: match.tense });
    }

    return { index, firstWord, lastWord, matches: inChunk };
  });
}

function countByTense(chunks: ArtifactChunk[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const chunk of chunks) {
    for (const match of chunk.matches) counts[match.tense] = (counts[match.tense] ?? 0) + 1;
  }
  return counts;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const text = stripGutenberg(await readInput(options.input));
  if (text.length === 0) throw new Error(`${options.input}: після нормалізації текст порожній.`);

  const tokens = tokenize(text);
  const chunks = chunksOf(tokens);
  const words = wordTokens(tokens).length;
  console.log(`${words} слів, ${chunks.length} шматків`);

  const matches = options.useReview
    ? await markupByReview(tokens, chunks)
    : findMatches(tokens);

  const artifact: Artifact = {
    format: ARTIFACT_FORMAT,
    seededBy: options.useReview ? 'claude-cli' : 'local-rules',
    ...(options.useReview && process.env.ANTHROPIC_MODEL
      ? { seedModel: process.env.ANTHROPIC_MODEL }
      : {}),
    chunks: toArtifactChunks(tokens, chunks, matches),
  };

  const dir = path.join(LIBRARY_DIR, options.slug);
  const matchesFile = path.join(dir, 'matches.json');

  // Перевіряємо РІВНО те, що ляже у файл: прогін через JSON туди й назад ловить
  // усе, що не переживає серіалізації, і запускає той самий строгий парсер, який
  // потім побачить засів. Написати артефакт, який `db:seed` відкине, скрипт не
  // має права — інакше помилку знайде оператор, а не автор.
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  const parsed = parseArtifact(JSON.parse(serialized), matchesFile);
  validate(text, parsed, toTokenMatches(text, parsed), matchesFile);

  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'story.txt'), text.endsWith('\n') ? text : `${text}\n`);
  writeFileSync(matchesFile, serialized);
  writeFileSync(
    path.join(dir, 'story.json'),
    `${JSON.stringify(
      {
        title: options.title,
        author: options.author,
        source: options.source,
        license: options.license,
        sourceUrl: options.sourceUrl,
        sortOrder: options.sortOrder,
      },
      null,
      2,
    )}\n`,
  );

  console.log('---');
  console.log(`записано src/content/library/${options.slug}/`);
  console.log(`розмітка: ${artifact.seededBy}`);
  for (const [tense, count] of Object.entries(countByTense(artifact.chunks))) {
    console.log(`  ${tense}: ${count}`);
  }
  console.log('далі: npm run db:seed');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

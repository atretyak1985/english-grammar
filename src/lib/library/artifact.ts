import { chunksOf } from '@/lib/analyzer/chunks';
import { findMatches, tokenize, type Match } from '@/lib/analyzer/tenses';
import { wordTokens } from '@/lib/analyzer/words';
import type { TenseKey } from '@/types/content';

/**
 * Формат артефакту `matches.json` (CONCEPT 9 / фаза 2): розмітка часів у
 * НОМЕРАХ СЛІВ, наскрізно по всьому оповіданню, а не всередині шматка. Це та
 * сама система координат, у якій відповідає модель (`review.ts`) — оператор
 * читає й перевіряє артефакт як текст, а не як індекси у внутрішньому масиві
 * токенів, яких у файлі ніде не видно.
 */

/** Єдина підтримувана версія формату. Зміна формату — це нове число, не патч. */
export const ARTIFACT_FORMAT = 1;

/** Один збіг у координатах слів: перше слово конструкції і скільки слів вона займає. */
export interface ArtifactMatch {
  /** Номер першого слова конструкції, з 1. */
  word: number;
  /** Скільки слів у конструкції, завжди >= 1. */
  length: number;
  tense: TenseKey;
}

/** Один шматок артефакту — межі й розмітка всередині нього. */
export interface ArtifactChunk {
  /** Порядковий номер шматка, з 0 — той самий порядок, що дає `chunksOf`. */
  index: number;
  /** Номер першого слова шматка, з 1. */
  firstWord: number;
  /** Номер останнього слова шматка, включно. */
  lastWord: number;
  matches: ArtifactMatch[];
}

export interface Artifact {
  format: 1;
  /** Хто розмітив: 'claude-cli' для засіву моделлю, 'local-rules' для смоук-прикладу. */
  seededBy: string;
  /** Модель, якщо розмітка від Claude CLI; для локальних правил не заповнюється. */
  seedModel?: string;
  chunks: ArtifactChunk[];
}

const TENSE_KEYS: readonly TenseKey[] = ['ps', 'pc', 'pp'];

/**
 * Мінімальна частка очевидних локальних Past Simple, яку мусить підтвердити
 * артефакт (`validate`, перевірка 5). Нижче цього порога розбіжність майже
 * завжди означає зсув нумерації слів на весь текст, а не іншу думку моделі:
 * реальні розходження трапляються на межових конструкціях («had lunch» проти
 * «had finished»), а не на формах, які тут рахуються, — вони очевидні за
 * побудовою `findMatches`.
 */
export const MIN_LOCAL_OVERLAP = 0.6;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Шлях до поля для повідомлення про помилку: `''` — корінь, інакше `a.b[0].c`. */
function child(path: string, key: string): string {
  return path === '' ? key : `${path}.${key}`;
}

function at(path: string, i: number): string {
  return `${path}[${i}]`;
}

function fail(file: string, path: string, message: string): never {
  const location = path === '' ? '(корінь)' : path;
  throw new Error(`${file}: ${location} — ${message}`);
}

/** Кидає, якщо в об'єкті є поле поза дозволеним набором — на БУДЬ-ЯКОМУ рівні. */
function checkKeys(file: string, path: string, obj: Record<string, unknown>, allowed: readonly string[]): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) fail(file, child(path, key), 'невідоме поле');
  }
}

/** Ціле число, не менше за `min`; типова помилка полів word/length/index/firstWord/lastWord. */
function requireInt(file: string, path: string, value: unknown, min: number): number {
  if (!Number.isInteger(value) || (value as number) < min) {
    fail(file, path, `мусить бути цілим числом ≥ ${min}, отримано ${JSON.stringify(value)}`);
  }
  return value as number;
}

function parseMatch(raw: unknown, file: string, path: string): ArtifactMatch {
  if (!isPlainObject(raw)) fail(file, path, 'збіг мусить бути обʼєктом');
  checkKeys(file, path, raw, ['word', 'length', 'tense']);

  const word = requireInt(file, child(path, 'word'), raw.word, 1);
  const length = requireInt(file, child(path, 'length'), raw.length, 1);

  if (typeof raw.tense !== 'string' || !TENSE_KEYS.includes(raw.tense as TenseKey)) {
    fail(file, child(path, 'tense'), `невідомий час ${JSON.stringify(raw.tense)}`);
  }

  return { word, length, tense: raw.tense as TenseKey };
}

function parseChunk(raw: unknown, file: string, path: string): ArtifactChunk {
  if (!isPlainObject(raw)) fail(file, path, 'шматок мусить бути обʼєктом');
  checkKeys(file, path, raw, ['index', 'firstWord', 'lastWord', 'matches']);

  const index = requireInt(file, child(path, 'index'), raw.index, 0);
  const firstWord = requireInt(file, child(path, 'firstWord'), raw.firstWord, 1);
  const lastWord = requireInt(file, child(path, 'lastWord'), raw.lastWord, 1);
  if (lastWord < firstWord) {
    fail(
      file,
      child(path, 'lastWord'),
      `мусить бути не меншим за firstWord (${firstWord}), отримано ${lastWord}`,
    );
  }

  if (!Array.isArray(raw.matches)) fail(file, child(path, 'matches'), 'відсутнє обовʼязкове поле-масив');
  const matchesPath = child(path, 'matches');
  const matches = raw.matches.map((item, i) => parseMatch(item, file, at(matchesPath, i)));

  return { index, firstWord, lastWord, matches };
}

/**
 * Строгий парсер `matches.json`. Кидає з назвою файлу й точним шляхом до поля
 * при будь-якому відхиленні від формату — оператор має бачити, де саме
 * розмітка не відповідає контракту, без читання коду.
 */
export function parseArtifact(raw: unknown, file: string): Artifact {
  if (!isPlainObject(raw)) fail(file, '', 'артефакт мусить бути обʼєктом');
  checkKeys(file, '', raw, ['format', 'seededBy', 'seedModel', 'chunks']);

  if (raw.format !== ARTIFACT_FORMAT) {
    fail(file, 'format', `очікується ${ARTIFACT_FORMAT}, отримано ${JSON.stringify(raw.format)}`);
  }

  if (typeof raw.seededBy !== 'string' || raw.seededBy.length === 0) {
    fail(file, 'seededBy', 'відсутнє або порожнє обовʼязкове поле');
  }

  if (raw.seedModel !== undefined && typeof raw.seedModel !== 'string') {
    fail(file, 'seedModel', 'мусить бути рядком, якщо задане');
  }

  if (!Array.isArray(raw.chunks)) fail(file, 'chunks', 'відсутнє обовʼязкове поле-масив');
  const chunks = raw.chunks.map((item, i) => parseChunk(item, file, at('chunks', i)));

  return {
    format: ARTIFACT_FORMAT,
    seededBy: raw.seededBy,
    ...(raw.seedModel !== undefined ? { seedModel: raw.seedModel } : {}),
    chunks,
  };
}

/**
 * Переклад номерів слів (з 1, наскрізно) у індекси токенів — тим самим
 * способом, що `review.ts`: через `wordTokens(tokenize(text))`, спільну
 * таблицю відповідності «порядковий номер слова → індекс токена». Друга,
 * незалежно написана версія цього перекладу — головний ризик фази: розбіжність
 * у хоч одному слові зсунула б усю розмітку бібліотеки.
 *
 * Виходу за межі тут НЕ перевіряємо: це робота `validate`, яка виконується
 * ПІСЛЯ цього перекладу і саме тому мусить дивитись на номери слів в артефакті,
 * а не лише на вже перекладені (і потенційно обрізані) індекси токенів.
 */
export function toTokenMatches(text: string, artifact: Artifact): Match[] {
  const words = wordTokens(tokenize(text));

  const matches: Match[] = [];
  for (const chunk of artifact.chunks) {
    for (const match of chunk.matches) {
      const from = words[match.word - 1]?.index ?? 0;
      const to = words[match.word - 1 + match.length - 1]?.index ?? 0;
      matches.push({ from, to, tense: match.tense });
    }
  }

  return matches.sort((a, b) => a.from - b.from);
}

function rangesOverlap(a: { from: number; to: number }, b: { from: number; to: number }): boolean {
  return a.from <= b.to && b.from <= a.to;
}

/**
 * Перевірка артефакту проти самого тексту. П'ять перевірок, кожна кидає
 * ОКРЕМО зі своїм повідомленням — щоб оператор бачив причину без коду.
 *
 * Порядок має значення: межі шматків (4) перевіряються перед порогом
 * перетину з локальними правилами (5), бо зсув нарізки шматків дає обидві
 * помилки одразу, а перша називає причину точніше.
 */
export function validate(text: string, artifact: Artifact, matches: Match[], file: string): void {
  const tokens = tokenize(text);
  const words = wordTokens(tokens);
  const totalWords = words.length;

  // 1. Межі виходять за кількість слів у тексті.
  for (const chunk of artifact.chunks) {
    for (const match of chunk.matches) {
      const lastWord = match.word + match.length - 1;
      if (match.word < 1 || lastWord > totalWords) {
        fail(
          file,
          `chunks[${chunk.index}]`,
          `слово ${match.word} (довжина ${match.length}) виходить за межі тексту — усього ${totalWords} слів`,
        );
      }
    }
  }

  // 2. Діапазони перетинаються між собою (масив уже відсортований за `from`).
  for (let i = 1; i < matches.length; i += 1) {
    const prev = matches[i - 1];
    const curr = matches[i];
    if (prev && curr && rangesOverlap(prev, curr)) {
      fail(
        file,
        '',
        `перетин діапазонів: [${prev.from}-${prev.to}] і [${curr.from}-${curr.to}]`,
      );
    }
  }

  // 3. Час не з TenseKey — перевіряємо самі matches, а не артефакт: вони можуть
  // прийти й не з parseArtifact.
  for (const match of matches) {
    if (!TENSE_KEYS.includes(match.tense)) {
      fail(file, '', `невідомий час "${String(match.tense)}" у діапазоні [${match.from}-${match.to}]`);
    }
  }

  // 4. Межі шматків не збігаються з chunksOf(tokenize(text)).
  const realChunks = chunksOf(tokens);
  if (realChunks.length !== artifact.chunks.length) {
    fail(
      file,
      'chunks',
      `кількість шматків не збігається: chunksOf дає ${realChunks.length}, артефакт — ${artifact.chunks.length}`,
    );
  }

  const wordNumberOfToken = new Map<number, number>(words.map((w, i) => [w.index, i + 1]));

  for (let i = 0; i < realChunks.length; i += 1) {
    const real = realChunks[i];
    const declared = artifact.chunks[i];
    if (!real || !declared) continue;

    const expectedFirst = wordNumberOfToken.get(real.start);
    const expectedLast = wordNumberOfToken.get(real.end);
    if (declared.firstWord !== expectedFirst || declared.lastWord !== expectedLast) {
      fail(
        file,
        `chunks[${i}]`,
        `межі не збігаються з chunksOf: очікується firstWord=${expectedFirst}, lastWord=${expectedLast}, ` +
          `в артефакті firstWord=${declared.firstWord}, lastWord=${declared.lastWord}`,
      );
    }
  }

  // 5. Перетин з локальними правилами нижче порога — майже завжди зсув нумерації.
  const localPastSimple = findMatches(tokens).filter((match) => match.tense === 'ps');
  if (localPastSimple.length > 0) {
    const confirmed = localPastSimple.filter((local) =>
      matches.some((candidate) => rangesOverlap(local, candidate)),
    ).length;
    const overlap = confirmed / localPastSimple.length;

    if (overlap < MIN_LOCAL_OVERLAP) {
      fail(
        file,
        '',
        `підтверджено лише ${confirmed}/${localPastSimple.length} очевидних Past Simple ` +
          `(${Math.round(overlap * 100)}%) — нижче порога ${Math.round(MIN_LOCAL_OVERLAP * 100)}%, ` +
          'це майже завжди зсув нумерації слів, а не інша думка моделі',
      );
    }
  }
}

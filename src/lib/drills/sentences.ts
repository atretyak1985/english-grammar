import type { AnalyzedToken, Match } from '@/lib/analyzer/tenses';
import type { TenseKey } from '@/types/content';

/**
 * Речення для вправ — з тих самих токенів і тієї самої розмітки, що бачить
 * читач у тексті. Вправа не вигадує прикладів: «скласти речення» й
 * «заповнити пропуск» беруть рядки з книжки, яку людина читає, тому час,
 * що підсвітиться після відповіді, — той самий, що був підсвічений на
 * сторінці.
 */

/** Межі речення в індексах токенів — від першого слова до останнього включно. */
export interface SentenceRange {
  from: number;
  to: number;
}

/** Збіг часу в межах речення — у номерах слів речення, з нуля. */
export interface SentenceMatch {
  from: number;
  to: number;
  tense: TenseKey;
}

export interface DrillSentence {
  /** Слова так, як вони стоять у тексті, з пунктуацією при них. */
  words: string[];
  matches: SentenceMatch[];
  /** Назва тексту — підпис «звідки це» під вправою. */
  source: string;
}

export interface SentenceLimits {
  minWords: number;
  maxWords: number;
}

/** Складати з чипів довше за десять слів — уже не вправа, а мозаїка. */
export const ORDER_LIMITS: SentenceLimits = { minWords: 5, maxWords: 10 };

/** У пропуску речення читається цілком, тому може бути довшим. */
export const GAP_LIMITS: SentenceLimits = { minWords: 5, maxWords: 16 };

/**
 * Скорочення з крапкою, яка не закінчує речення. «Mr. Dursley» інакше
 * розпадався б на два речення з одного слова.
 */
const ABBREVIATIONS = new Set(['mr', 'mrs', 'ms', 'dr', 'st', 'vs', 'etc', 'no', 'jr', 'sr']);

/** Крапка, знак питання чи оклику — можливо, з лапкою або дужкою після них. */
const TERMINATOR = /[.!?]+["'”’)\]]*$/;

/** Ініціал: «J. Smith» — одна літера з крапкою. */
const INITIAL = /^[A-Z]\.$/;

function endsSentence(raw: string): boolean {
  const trimmed = raw.trim();
  if (!TERMINATOR.test(trimmed)) return false;
  if (INITIAL.test(trimmed)) return false;
  const bare = trimmed.replace(/[^A-Za-z]/g, '').toLowerCase();
  return !ABBREVIATIONS.has(bare);
}

/**
 * Ділить токени на речення. Межа — крапка/знак питання/оклику в кінці слова
 * або порожній рядок між абзацами: заголовок розділу без крапки все одно не
 * має злипатися з першим реченням під ним.
 */
export function splitSentences(tokens: AnalyzedToken[]): SentenceRange[] {
  const ranges: SentenceRange[] = [];
  let start: number | null = null;
  let last: number | null = null;

  const close = () => {
    if (start !== null && last !== null) ranges.push({ from: start, to: last });
    start = null;
    last = null;
  };

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token) continue;

    if (token.word === null) {
      if (token.raw.includes('\n')) close();
      continue;
    }

    start ??= i;
    last = i;
    if (endsSentence(token.raw)) close();
  }
  close();

  return ranges;
}

/**
 * Слово, яке можна показати чипом: літери, апострофи, дефіси і пунктуація
 * навколо. Цифри, зірочки, підкреслення — ознака службового рядка, а не
 * речення з книжки.
 */
const CLEAN_WORD = /^["'“‘(]?[A-Za-z][A-Za-z'’-]*[,.;:!?]*["'”’)]?$/;

/** «CHAPTER I», «THE END» — заголовки, не речення. */
function isShouting(word: string): boolean {
  const letters = word.replace(/[^A-Za-z]/g, '');
  return letters.length > 1 && letters === letters.toUpperCase();
}

/**
 * Речення, придатні для вправи: у межах довжини, з чистих слів і хоча б з
 * однією підсвіченою конструкцією. Індекси збігів переводяться з токенів у
 * номери слів речення — компонентам не потрібно знати, що між словами були
 * пробільні токени.
 */
export function drillSentences(
  tokens: AnalyzedToken[],
  matches: readonly Match[],
  source: string,
  limits: SentenceLimits,
): DrillSentence[] {
  const sorted = [...matches].sort((a, b) => a.from - b.from);
  const out: DrillSentence[] = [];
  let matchCursor = 0;

  for (const range of splitSentences(tokens)) {
    const words: string[] = [];
    const wordIndexOf = new Map<number, number>();
    let clean = true;

    for (let i = range.from; i <= range.to; i += 1) {
      const token = tokens[i];
      if (!token) continue;
      const raw = token.raw.trim();
      if (raw === '') continue;
      // Токен без слова, але не пробіл — цифра, тире, зірочка: не наш рядок
      if (token.word === null || !CLEAN_WORD.test(raw) || isShouting(raw)) {
        clean = false;
        break;
      }
      wordIndexOf.set(i, words.length);
      words.push(raw);
    }

    // Збіги йдуть за порядком, тому курсор лише рухається вперед
    while (matchCursor < sorted.length && (sorted[matchCursor]?.to ?? 0) < range.from) {
      matchCursor += 1;
    }

    if (!clean || words.length < limits.minWords || words.length > limits.maxWords) continue;

    const inside: SentenceMatch[] = [];
    for (let m = matchCursor; m < sorted.length; m += 1) {
      const match = sorted[m];
      if (!match || match.from > range.to) break;
      const from = wordIndexOf.get(match.from);
      const to = wordIndexOf.get(match.to);
      if (from === undefined || to === undefined) continue;
      inside.push({ from, to, tense: match.tense });
    }

    if (inside.length === 0) continue;
    out.push({ words, matches: inside, source });
  }

  return out;
}

/**
 * Рівномірна вибірка: `limit` елементів, розкиданих по всьому списку. Для
 * книжки це означає речення з усіх глав, а не перші сорок рядків першої.
 */
export function sampleEvenly<T>(items: readonly T[], limit: number): T[] {
  if (items.length <= limit) return [...items];
  const step = items.length / limit;
  const out: T[] = [];
  for (let i = 0; i < limit; i += 1) {
    const item = items[Math.floor(i * step)];
    if (item !== undefined) out.push(item);
  }
  return out;
}

/** Перемішування Фішера — Йетса; повертає нову копію. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/** Речення одним рядком — для підпису результату і для пошуку прикладів. */
export function sentenceText(words: readonly string[]): string {
  return words.join(' ');
}

/**
 * Детермінований генератор для `shuffle` (mulberry32). Потрібен там, де
 * порядок має бути випадковим, але сталим між рендерами: пари слово —
 * значення перемішуються один раз на сеанс, а не на кожен запис у кеш
 * словника.
 */
export function seededRandom(seed: number): () => number {
  let state = Math.floor(seed * 0xffffffff) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

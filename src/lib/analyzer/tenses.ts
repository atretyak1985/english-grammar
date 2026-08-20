import { V2_FORMS } from '@/data/irregular-verbs';
import type { TenseKey } from '@/types/content';

/**
 * Розпізнавання минулих часів у довільному тексті (CONCEPT 4.1).
 *
 * Текст ділиться на слова зі збереженням пробілів і проходиться один раз
 * зліва вправо. Правила застосовуються в порядку — ПЕРШЕ ЗБІЖНЕ ВИГРАЄ:
 *
 *   1. was / were / wasn't / weren't + …ing   → Past Continuous
 *   2. had / hadn't + слово                    → Past Perfect
 *   3. did / didn't + слово                    → Past Simple
 *   4. слово зі списку неправильних (V2)       → Past Simple
 *   5. закінчення -ed                          → Past Simple
 *
 * Допоміжне і смислове дієслово підсвічуються як ОДНА конструкція — саме
 * зв'язку «had + V3» треба навчитися бачити.
 *
 * Це розпізнавання за шаблонами, а не синтаксичний розбір: `-ed` у прикметнику
 * («a tired engineer») буде позначене як Past Simple. Для навчальної підсвітки
 * цього достатньо, помилкові збіги самі стають предметом розбору.
 */

/** Прислівники, які носії ставлять між допоміжним і смисловим дієсловом. */
const INNER_ADVERBS = new Set([
  'already',
  'always',
  'constantly',
  'ever',
  'forever',
  'just',
  'never',
  'only',
  'still',
]);

/** Після had тут стоїть присвійне «мав», а не допоміжне: «I had a laptop». */
const DETERMINERS = new Set([
  'a',
  'an',
  'the',
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
  'no',
  'some',
  'any',
  'two',
  'three',
  'several',
  'enough',
  'lunch',
  'dinner',
  'breakfast',
]);

const WAS_WERE = new Set(['was', 'were', "wasn't", "weren't"]);
const HAD = new Set(['had', "hadn't"]);
const DID = new Set(['did', "didn't"]);

export interface AnalyzedToken {
  /** Токен як у джерелі — з пунктуацією і пробілами */
  raw: string;
  /** Нормалізоване слово (нижній регістр, без пунктуації) або null для пробілів */
  word: string | null;
  /** Час, якщо токен входить у знайдену конструкцію */
  tense: TenseKey | null;
  /** Перший токен конструкції — щоб намалювати її однією групою */
  startsMatch: boolean;
  /** Останній токен конструкції */
  endsMatch: boolean;
}

export interface TenseStat {
  count: number;
  /** До трьох знайдених форм — показуємо в панелі статистики */
  examples: string[];
}

export interface AnalysisResult {
  tokens: AnalyzedToken[];
  stats: Record<TenseKey, TenseStat>;
  /** Скільки всього слів у тексті */
  wordCount: number;
}

export const TENSE_LABELS: Record<TenseKey, string> = {
  ps: 'Past Simple',
  pc: 'Past Continuous',
  pp: 'Past Perfect',
};

/** Прибирає пунктуацію з країв слова, лишає внутрішній апостроф: didn't, wasn't. */
export function normalizeWord(raw: string): string | null {
  const word = raw
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/^[^a-z']+/, '')
    .replace(/[^a-z']+$/, '');
  return /[a-z]/.test(word) ? word : null;
}

function isIngForm(word: string | null): boolean {
  return word !== null && word.length > 4 && word.endsWith('ing');
}

function isEdForm(word: string | null): boolean {
  return word !== null && word.length > 3 && word.endsWith('ed');
}

function isVerbCandidate(word: string | null): boolean {
  return word !== null && word.length > 1 && !word.endsWith("n't");
}

/**
 * Знайдена конструкція як пара меж у масиві токенів. Ту саму форму повертає
 * розбір моделлю (`review.ts`) — тому серверні збіги лягають на текст тим самим
 * кодом, що й локальні, і розходження між двома підсвітками неможливе за
 * побудовою.
 */
export interface Match {
  from: number;
  to: number;
  tense: TenseKey;
}

/**
 * Індекс наступного значущого слова після позиції `from`, з можливим
 * прислівником між допоміжним і смисловим дієсловом.
 */
function nextWordIndex(tokens: AnalyzedToken[], from: number): number | null {
  let seenAdverb = false;
  for (let i = from + 1; i < tokens.length; i += 1) {
    const word = tokens[i]?.word;
    if (!word) continue;
    if (!seenAdverb && (INNER_ADVERBS.has(word) || word.endsWith('ly'))) {
      seenAdverb = true;
      continue;
    }
    return i;
  }
  return null;
}

/**
 * Ділення тексту на токени зі збереженням пробілів. Винесено окремо, бо це
 * ЄДИНЕ джерело нумерації: і локальні правила, і модель адресують слова
 * номерами в цьому масиві, тому розділяти текст двома різними способами не
 * можна навіть випадково.
 */
export function tokenize(text: string): AnalyzedToken[] {
  return text.split(/(\s+)/).map((raw) => ({
    raw,
    word: /^\s*$/.test(raw) ? null : normalizeWord(raw),
    tense: null,
    startsMatch: false,
    endsMatch: false,
  }));
}

export function findMatches(tokens: AnalyzedToken[]): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const word = tokens[i]?.word;
    if (!word) continue;

    // 1. was/were + …ing → Past Continuous
    if (WAS_WERE.has(word)) {
      const next = nextWordIndex(tokens, i);
      if (next !== null && isIngForm(tokens[next]?.word ?? null)) {
        matches.push({ from: i, to: next, tense: 'pc' });
        i = next;
        continue;
      }
    }

    // 2. had/hadn't + слово → Past Perfect
    if (HAD.has(word)) {
      const next = nextWordIndex(tokens, i);
      const nextWord = next === null ? null : (tokens[next]?.word ?? null);
      if (next !== null && isVerbCandidate(nextWord) && !DETERMINERS.has(nextWord ?? '')) {
        matches.push({ from: i, to: next, tense: 'pp' });
        i = next;
        continue;
      }
    }

    // 3. did/didn't + слово → Past Simple
    if (DID.has(word)) {
      const next = nextWordIndex(tokens, i);
      if (next !== null && isVerbCandidate(tokens[next]?.word ?? null)) {
        matches.push({ from: i, to: next, tense: 'ps' });
        i = next;
        continue;
      }
    }

    // 4. неправильне дієслово у формі V2 → Past Simple
    if (V2_FORMS.has(word)) {
      matches.push({ from: i, to: i, tense: 'ps' });
      continue;
    }

    // 5. закінчення -ed → Past Simple
    if (isEdForm(word)) {
      matches.push({ from: i, to: i, tense: 'ps' });
    }
  }

  return matches;
}

/**
 * Розмальовує токени за списком збігів і рахує статистику. Токени МУТУЮТЬСЯ, і
 * саме тому кожен виклик має отримувати свіжий `tokenize`: накласти другий
 * набір збігів на вже розмічений масив означало б додати нову підсвітку, не
 * знявши стару.
 */
export function applyMatches(tokens: AnalyzedToken[], matches: Match[]): AnalysisResult {
  for (const match of matches) {
    for (let i = match.from; i <= match.to; i += 1) {
      const token = tokens[i];
      if (token) token.tense = match.tense;
    }
    const startToken = tokens[match.from];
    const endToken = tokens[match.to];
    if (startToken) startToken.startsMatch = true;
    if (endToken) endToken.endsMatch = true;
  }

  return {
    tokens,
    stats: statsOf(tokens, matches),
    wordCount: tokens.filter((token) => token.word !== null).length,
  };
}

/**
 * Скільки конструкцій кожного часу дає цей список збігів. Рахується окремо від
 * розмальовування, бо панель статистики і підсвітка живляться РІЗНИМИ списками:
 * підсвічено весь документ (де ще немає розбору моделлю — локальними
 * правилами), а рахувати треба лише розібране, інакше числа обіцяли б точність,
 * якої в них немає.
 */
export function statsOf(tokens: AnalyzedToken[], matches: Match[]): Record<TenseKey, TenseStat> {
  const stats: Record<TenseKey, TenseStat> = {
    ps: { count: 0, examples: [] },
    pc: { count: 0, examples: [] },
    pp: { count: 0, examples: [] },
  };

  for (const match of matches) {
    const parts: string[] = [];
    for (let i = match.from; i <= match.to; i += 1) {
      const token = tokens[i];
      if (token?.word) parts.push(token.word);
    }

    const stat = stats[match.tense];
    stat.count += 1;
    const example = parts.join(' ');
    if (stat.examples.length < 3 && !stat.examples.includes(example)) {
      stat.examples.push(example);
    }
  }

  return stats;
}

/**
 * Зшиває розбір моделлю з локальним. Локальний збіг відкидається, щойно він
 * ХОЧ ЯК перетинається з розібраним проміжком, а не лише коли лежить у ньому
 * цілком: там, де модель уже висловилася, її слово остаточне, і залишок
 * шаблонного збігу на межі дав би дві підсвітки на одному токені.
 */
export function mergeMatches(
  local: Match[],
  model: Match[],
  ranges: { start: number; end: number }[],
): Match[] {
  const analyzed = (match: Match) =>
    ranges.some((range) => match.from <= range.end && match.to >= range.start);

  return [...local.filter((match) => !analyzed(match)), ...model].sort((a, b) => a.from - b.from);
}

/** Розбір локальними правилами: працює миттєво, без мережі й без ключа. */
export function analyzeText(text: string): AnalysisResult {
  const tokens = tokenize(text);
  return applyMatches(tokens, findMatches(tokens));
}

/**
 * Розбір за готовим списком збігів — тим, що прийшов з `/api/analyze`. Локальні
 * правила при цьому НЕ застосовуються: відповідь моделі повна, а не доповнення,
 * тому змішування двох списків дало б подвійну розмітку там, де вони збіглися,
 * і залишки хибних збігів там, де модель їх свідомо не назвала.
 */
export function analyzeWithMatches(text: string, matches: Match[]): AnalysisResult {
  return applyMatches(tokenize(text), matches);
}

import { chunkText } from '@/lib/analyzer/chunks';
import { type ReviewedMatch, review } from '@/lib/analyzer/review';
import { type AnalyzedToken, tokenize } from '@/lib/analyzer/tenses';

import type { GrammarMatch } from './index';
import { sentenceSpans } from './tagger';

/**
 * Уточнення моделлю ЛИШЕ хитких збігів двигуна (`uncertain: true`): «'d» — це
 * had чи would, «I am going to work» — рух чи майбутнє. Певні збіги модель не
 * бачить і переписати не може — двигун для них джерело істини, а рахунок за
 * модель росте з кожним зайвим словом.
 *
 * Одиниця уточнення — вікно контексту навколо хиткого збігу, обрізане межами
 * його речення, а не шматок на дві тисячі слів. На «Алісі» це менш як десята
 * частина слів книжки — саме різниця між «модель дочитує спірне» і «модель
 * перечитує все».
 *
 * Це ОДНА логіка на два входи: `scripts/import-book.mts --review` і ручку
 * розбору (`/api/analyze` через `analyzer/cache.ts`). Живе окремо від
 * `index.ts`, бо тягне `review` → `lib/claude`, а сам двигун мережі не
 * потребує і потрапляє в граф імпортів засіву, де Anthropic заборонений.
 *
 * ТІЛЬКИ ДЛЯ СЕРВЕРА — з тих самих причин, що й `index.ts`.
 */

/** Проміжок токенів, який піде моделі: речення (або злиті сусідні) з хитким збігом. */
export interface RefinePiece {
  start: number;
  end: number;
  /** Скільки СЛІВ у проміжку — рівно стільки спишеться з квоти за його уточнення. */
  words: number;
}

export interface RefinePlan {
  tokens: AnalyzedToken[];
  pieces: RefinePiece[];
  /** Сума слів усіх проміжків — вартість уточнення, відома ДО виклику моделі. */
  words: number;
}

function wordsBetween(tokens: readonly AnalyzedToken[], start: number, end: number): number {
  let count = 0;
  for (let i = start; i <= end; i += 1) if (tokens[i]?.word != null) count += 1;
  return count;
}

/**
 * Скільки слів контексту дістає модель обабіч хиткого збігу. Вистачає, щоб
 * розсудити «'d» проти would чи «read» проти минулого: рішення живе в сусідніх
 * словах, а не в дальніх підрядних. Ширше вікно на «Алісі» з її довгими
 * вікторіанськими реченнями подвоювало б рахунок, не міняючи вердиктів.
 */
const CONTEXT_WORDS = 6;

/**
 * Вікно навколо збігу: до `CONTEXT_WORDS` слів у кожен бік, але не за межі
 * `[limitStart, limitEnd]` (звичайно — межі речення). Краї завжди слова:
 * текст проміжку збирається злиттям токенів від першого, і пробіл на краю
 * зсунув би нумерацію відповіді моделі.
 */
function widen(
  tokens: readonly AnalyzedToken[],
  from: number,
  to: number,
  limitStart: number,
  limitEnd: number,
): { start: number; end: number } {
  let start = from;
  let seen = 0;
  for (let i = from - 1; i >= limitStart && seen < CONTEXT_WORDS; i -= 1) {
    if (tokens[i]?.word != null) {
      seen += 1;
      start = i;
    }
  }
  let end = to;
  seen = 0;
  for (let i = to + 1; i <= limitEnd && seen < CONTEXT_WORDS; i += 1) {
    if (tokens[i]?.word != null) {
      seen += 1;
      end = i;
    }
  }
  return { start, end };
}

/**
 * План уточнення: які проміжки тексту потрібні моделі і скільки це слів.
 * Рахується окремо від самого уточнення, бо викликач мусить знати ціну
 * наперед — квота й троттлінг вирішують «чи платити» ще до першого запиту.
 */
export function planPieces(text: string, matches: readonly GrammarMatch[]): RefinePlan {
  const tokens = tokenize(text);
  const uncertain = matches.filter((match) => match.uncertain);
  if (uncertain.length === 0) return { tokens, pieces: [], words: 0 };

  const sentences = sentenceSpans(text);

  // Кожен хиткий збіг дає вікно контексту, обрізане межами свого речення.
  // Збіг поза всіма реченнями (розбивка речень — теж евристика) не губиться:
  // вікно просто не має чим обрізатись, крім країв тексту.
  const spans = uncertain.map((match) => {
    const sentence = sentences.find((span) => match.from <= span.end && span.start <= match.to);
    return widen(tokens, match.from, match.to, sentence?.start ?? 0, sentence?.end ?? tokens.length - 1);
  });
  spans.sort((a, b) => a.start - b.start);

  // Сусідні вибрані речення зливаються: між ними лише пробільний токен, і два
  // окремі запити коштували б два системні промпти замість одного.
  const pieces: RefinePiece[] = [];
  for (const span of spans) {
    const previous = pieces[pieces.length - 1];
    if (previous !== undefined && span.start - previous.end <= 2) {
      previous.end = Math.max(previous.end, span.end);
      continue;
    }
    pieces.push({ start: span.start, end: span.end, words: 0 });
  }
  for (const piece of pieces) piece.words = wordsBetween(tokens, piece.start, piece.end);

  return { tokens, pieces, words: pieces.reduce((sum, piece) => sum + piece.words, 0) };
}

/** Вердикт моделі щодо одного хиткого збігу. */
export type Verdict =
  | { kind: 'confirmed'; match: GrammarMatch }
  | { kind: 'retensed'; match: GrammarMatch }
  | { kind: 'dropped'; match: null };

/**
 * Зводить відповідь моделі на проміжку з одним хитким збігом. Використовується
 * і синхронним уточненням нижче, і забиранням батча (`analyzer/batch.ts`) —
 * дві копії цієї логіки рано чи пізно розійшлися б у тому, чий час перемагає.
 */
export function verdictFor(
  match: GrammarMatch,
  pieceStart: number,
  reviewed: readonly ReviewedMatch[],
): Verdict {
  const verdict = reviewed.find(
    (candidate) => candidate.from + pieceStart <= match.to && match.from <= candidate.to + pieceStart,
  );

  // Модель не бачить тут конструкції — двигун сумнівався недарма.
  if (verdict === undefined) return { kind: 'dropped', match: null };

  // Перевірений збіг перестає бути хитким: межу вирішено, і клієнт має право
  // показувати його як певний. Час — від моделі, межі — від двигуна:
  // координати звірені з `tokenize`, і розширювати їх відповіддю моделі
  // означало б ризикнути перетином із сусіднім певним збігом.
  const settled: GrammarMatch = { from: match.from, to: match.to, tense: match.tense, ruleId: match.ruleId };
  if (verdict.tense === match.tense) return { kind: 'confirmed', match: settled };
  return { kind: 'retensed', match: { ...settled, tense: verdict.tense } };
}

/** Збіги після уточнення: перевірені підмінені, зняті прибрані, порядок відновлено. */
export function applyVerdicts(
  matches: readonly GrammarMatch[],
  refined: ReadonlyMap<GrammarMatch, GrammarMatch | null>,
): GrammarMatch[] {
  return matches
    .map((match) => (refined.has(match) ? refined.get(match) : match))
    .filter((match): match is GrammarMatch => match !== null && match !== undefined)
    .sort((a, b) => a.from - b.from);
}

export interface Refinement {
  /** Ті самі збіги, відсортовані за `from`: певні — незмінні, хиткі — уточнені. */
  matches: GrammarMatch[];
  /** Скільки хитких збігів переглянуто моделлю. */
  checked: number;
  /** Модель підтвердила час двигуна. */
  confirmed: number;
  /** Модель назвала інший час — межі лишаються двигуновими. */
  retensed: number;
  /** Модель не бачить тут конструкції — збіг прибрано. */
  dropped: number;
  /** Скільки СЛІВ реально пішло моделі — рівно стільки має списати квота. */
  words: number;
  /** null — модель недоступна (немає ключа) або жоден проміжок не потребував уточнення. */
  usage: { input: number; output: number } | null;
}

function passThrough(matches: readonly GrammarMatch[]): Refinement {
  return {
    matches: [...matches],
    checked: 0,
    confirmed: 0,
    retensed: 0,
    dropped: 0,
    words: 0,
    usage: null,
  };
}

/**
 * Проганяє через модель речення з хиткими збігами і зводить відповідь назад у
 * координати документа. Проміжок, на якому модель не відповіла, лишається як
 * є: груба розмітка двигуна краща за діру посеред тексту.
 *
 * `plan` передається, коли викликач уже рахував його для квоти, — щоб не
 * платити за розбивку речень двічі; без нього план рахується тут.
 */
export async function refineUncertain(
  text: string,
  matches: readonly GrammarMatch[],
  log: (line: string) => void = () => {},
  plan?: RefinePlan,
): Promise<Refinement> {
  const uncertain = matches.filter((match) => match.uncertain);
  if (uncertain.length === 0) return passThrough(matches);

  const { tokens, pieces } = plan ?? planPieces(text, matches);
  const result = passThrough(matches);
  let reviewedPieces = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  const refined = new Map<GrammarMatch, GrammarMatch | null>();

  for (const [index, piece] of pieces.entries()) {
    const reviewed = await review(chunkText(tokens, piece));
    if (reviewed === null) {
      log(`проміжок ${index + 1}/${pieces.length}: модель недоступна — хиткі збіги лишаються як є`);
      continue;
    }

    reviewedPieces += 1;
    inputTokens += reviewed.usage.input;
    outputTokens += reviewed.usage.output;
    result.words += piece.words;

    const inPiece = uncertain.filter((match) => match.from >= piece.start && match.to <= piece.end);
    for (const match of inPiece) {
      const verdict = verdictFor(match, piece.start, reviewed.matches);
      refined.set(match, verdict.match);
      result.checked += 1;
      result[verdict.kind === 'confirmed' ? 'confirmed' : verdict.kind === 'retensed' ? 'retensed' : 'dropped'] += 1;
    }
    log(
      `проміжок ${index + 1}/${pieces.length}: ${inPiece.length} хитких, ${piece.words} слів, ` +
        `${reviewed.usage.input} вх. / ${reviewed.usage.output} вих. токенів`,
    );
  }

  result.matches = applyVerdicts(matches, refined);
  result.usage = reviewedPieces > 0 ? { input: inputTokens, output: outputTokens } : null;
  return result;
}

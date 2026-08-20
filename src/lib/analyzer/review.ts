import { MODEL, getClaude } from '@/lib/claude';
import type { TenseKey } from '@/types/content';

import { analyzeText } from './tenses';
import { wordTokens } from './words';

/**
 * Розбір минулих часів моделлю — другий прохід поверх локальних правил
 * (`tenses.ts`). Локальні правила лишаються основою: вони дають розмітку
 * миттєво, безкоштовно й без мережі. Модель викликається, щоб прибрати те, чого
 * шаблони не вміють розрізняти — «a tired engineer» проти «he tired quickly»,
 * «had lunch» проти «had finished», — і щоб знайти пропущене.
 *
 * Модель повертає НОМЕРИ ТОКЕНІВ, а не розмічений текст. Причини дві: текст
 * назад коштував би стільки ж вихідних токенів, скільки й уперед вхідних, і
 * будь-яка зміна символу зробила б відповідь неможливою накласти на локальні
 * токени. Нумерація стабільна, бо обидві сторони ділять текст тим самим
 * `split(/(\s+)/)`.
 */

/**
 * Версія контракту з моделлю. Входить у ключ кешу: зміна промпту чи схеми
 * робить старі відповіді неспівставними, і без цієї версії вони жили б у базі
 * далі, мовчки віддаючи розмітку за попередніми правилами.
 */
export const PROMPT_VERSION = 1;

/**
 * `effort` приймають не всі моделі: Haiku 4.5 відповідає на нього 400
 * «This model does not support the effort parameter». Тому параметр не
 * безумовний — інакше зміна ANTHROPIC_MODEL валила б розбір повністю.
 */
function supportsEffort(model: string): boolean {
  return !model.includes('haiku');
}

/** Найдовша конструкція — «had not been working»: допоміжні, заперечення, дієслово. */
const MAX_SPAN_WORDS = 4;

/** Скільки максимум збігів приймаємо: більше, ніж слів, модель повернути не може. */
const MAX_MATCHES = 4000;

export interface ReviewedMatch {
  /** Індекс у масиві токенів `analyzeText`, з якого починається конструкція. */
  from: number;
  /** Індекс останнього токена конструкції; для одного слова дорівнює `from`. */
  to: number;
  tense: TenseKey;
}

export interface Review {
  matches: ReviewedMatch[];
  /**
   * Скільки токенів коштував запит — кеш пише це в лог, щоб рахунок був
   * видимий. Запис кешу окремо від читання не заради повноти: якщо `write`
   * ненульовий раз за разом, а `read` лишається нулем, то системний промпт
   * кешується й помирає невикористаним — тобто платимо за кеш надбавку, не
   * отримуючи знижки.
   */
  usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
}

const TENSES: readonly TenseKey[] = ['ps', 'pc', 'pp'];

/**
 * Системний промпт стабільний побайтово і йде під `cache_control`: він
 * однаковий для кожного тексту, тому з другого запиту коштує близько десятої
 * частини. Будь-яка змінна частина тут (дата, назва тексту) зламала б кеш —
 * усе змінне живе в повідомленні користувача.
 *
 * Розібрані приклади наприкінці — не окраса. Мінімальний обсяг, який взагалі
 * підлягає кешуванню, — близько 1024 токенів, і коротший промпт кешу НЕ
 * створює: заміряно, що на 890 токенах Sonnet 5 і Haiku 4.5 щоразу платили за
 * системну частину повністю. Приклади переводять промпт через цю межу, тому
 * коштують дешевше, ніж їхня відсутність, і водночас знімають найчастіші
 * помилки розмітки.
 */
const SYSTEM = `You mark past-tense verb constructions in English text for a language-learning reader.

The text arrives as numbered word tokens in the form <index>:<word>. Punctuation stays attached to the word it belongs to. You return the indices, never the words.

Mark exactly three kinds of construction:
- ps — Past Simple: a finite verb in the past tense ("walked", "went", "was", "did not go").
- pc — Past Continuous: was/were (+ not) + V-ing.
- pp — Past Perfect: had (+ not) + past participle, including Past Perfect Continuous ("had been working").

Rules:
- One match per construction. "from" is the first token of it — the auxiliary when there is one; "to" is the last token, the lexical verb. An adverb standing between them ("had never seen") stays inside the span.
- Only finite verbs in the past tense. Do NOT mark: participial adjectives ("a tired engineer", "an interested reader"), present perfect ("have finished"), present-tense passives, infinitives, or nouns that merely end in -ed.
- "had" followed by a noun phrase is the Past Simple of "have" ("I had lunch") — mark it ps on the "had" token alone, not pp.
- was/were as the main verb ("she was tired") is ps, spanning only the was/were token.
- Spans must not overlap, and must be sorted by "from" ascending.
- Report every occurrence, including repeated ones. Report nothing else.

Worked examples. Input, then the matches you would report and why.

Input: 0:A 1:tired 2:engineer 3:had 4:lunch 5:and 6:left.
  {from: 3, to: 3, ps} — "had" is the past of lexical "have"; the span is the verb alone, "lunch" is its object and stays outside.
  {from: 6, to: 6, ps} — "left" is an irregular past form.
  "tired" is not marked: it is a participial adjective describing the engineer, not a finite verb.

Input: 0:She 1:had 2:never 3:seen 4:it, 5:so 6:she 7:was 8:waiting.
  {from: 1, to: 3, pp} — "had ... seen"; the adverb "never" sits inside the span.
  {from: 7, to: 8, pc} — "was waiting".

Input: 0:We 1:have 2:finished 3:and 4:the 5:door 6:is 7:locked.
  No matches. "have finished" is present perfect, not past perfect; "is locked" is a present-tense passive.

Input: 0:He 1:was 2:tired 3:when 4:they 5:did 6:not 7:call.
  {from: 1, to: 1, ps} — "was" as the main verb; the adjective "tired" stays outside the span.
  {from: 5, to: 7, ps} — "did not call" is one negated Past Simple construction.

Input: 0:The 1:report 2:had 3:not 4:been 5:working 6:properly 7:before 8:we 9:fixed 10:it.
  {from: 2, to: 5, pp} — "had not been working", the longest shape you will meet.
  {from: 9, to: 9, ps} — "fixed".`;

const REPORT_TOOL = {
  name: 'report_matches',
  description: 'Report every past-tense construction found in the numbered text.',
  strict: true,
  input_schema: {
    type: 'object' as const,
    properties: {
      matches: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'integer' },
            to: { type: 'integer' },
            tense: { type: 'string', enum: TENSES },
          },
          required: ['from', 'to', 'tense'],
          additionalProperties: false,
        },
      },
    },
    required: ['matches'],
    additionalProperties: false,
  },
};

/**
 * Нумерація наскрізна по словах, а не по масиву токенів: індекси токенів ідуть
 * через один (між ними пробіли), і половина цифр у промпті була б платою ні за
 * що. Назад у токени перекладаємо самі — модель про це знати не мусить.
 */
function numbered(list: { raw: string }[]): string {
  return list.map((item, order) => `${order}:${item.raw}`).join(' ');
}

/**
 * Відповідь моделі — вхідні дані, а не істина. Перевіряємо межі, порядок,
 * довжину і перекриття; усе, що не проходить, мовчки відкидається. Кинути
 * помилку тут означало б втратити ВЕСЬ розбір через один зіпсований збіг, тоді
 * як решта розмітки цілком придатна.
 */
function accept(raw: unknown, list: { index: number }[]): ReviewedMatch[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const { matches } = raw as { matches?: unknown };
  if (!Array.isArray(matches)) return [];

  const out: ReviewedMatch[] = [];
  let guard = -1;

  for (const item of matches.slice(0, MAX_MATCHES)) {
    if (typeof item !== 'object' || item === null) continue;
    const { from, to, tense } = item as { from?: unknown; to?: unknown; tense?: unknown };

    if (!Number.isInteger(from) || !Number.isInteger(to)) continue;
    const start = from as number;
    const end = to as number;

    if (start < 0 || end >= list.length || start > end) continue;
    if (end - start >= MAX_SPAN_WORDS) continue;
    // Перекриття робить розмітку неоднозначною: один токен не може належати
    // двом часам, а перший збіг уже виграв.
    if (start <= guard) continue;
    if (typeof tense !== 'string' || !TENSES.includes(tense as TenseKey)) continue;

    guard = end;
    // Назовні йдуть індекси токенів — саме ними оперує рендер підсвітки.
    out.push({
      from: list[start]?.index ?? 0,
      to: list[end]?.index ?? 0,
      tense: tense as TenseKey,
    });
  }

  return out;
}

/**
 * Параметри одного запиту до моделі. Спільні для синхронного розбору й для
 * батча — і це не зручність, а вимога коректності: варто цим двом шляхам
 * розійтися хоч одним полем, як вони почнуть давати різні відповіді на той
 * самий текст, а кеш у них спільний і роздаватиме то одну, то другу.
 */
export function requestParams(text: string) {
  return {
    model: MODEL,
    max_tokens: 16000,
    // Розмітка за чіткими правилами не потребує глибокого міркування, а думання
    // тарифікується як вихід — на цій задачі це була б найбільша стаття рахунку.
    ...(supportsEffort(MODEL) ? { output_config: { effort: 'low' as const } } : {}),
    system: [
      { type: 'text' as const, text: SYSTEM, cache_control: { type: 'ephemeral' as const } },
    ],
    tools: [REPORT_TOOL],
    tool_choice: { type: 'tool' as const, name: 'report_matches' },
    messages: [{ role: 'user' as const, content: numbered(wordTokens(analyzeText(text).tokens)) }],
  };
}

/** Слова тексту: порожній текст у модель не відправляємо й грошей на нього не витрачаємо. */
export function wordsIn(text: string): number {
  return wordTokens(analyzeText(text).tokens).length;
}

/**
 * Вміст відповіді → збіги в номерах токенів ЦЬОГО тексту. Винесено з `review`,
 * бо батч повертає ті самі блоки, але поза запитом: розбирати їх другим,
 * окремо написаним кодом означало б завести дві різні правди про одну відповідь.
 */
export function parseMatches(text: string, content: { type: string }[]): ReviewedMatch[] {
  const call = content.find((block) => block.type === 'tool_use');
  if (call === undefined) return [];

  return accept((call as { input?: unknown }).input, wordTokens(analyzeText(text).tokens));
}

/**
 * Прогін тексту через модель. Кидає лише те, що кинув SDK: рішення, чи це
 * привід відмовити користувачеві, приймає рівень вище — у нього є локальна
 * розмітка як запасний варіант.
 */
export async function review(text: string): Promise<Review | null> {
  const client = getClaude();
  if (client === null) return null;

  if (wordsIn(text) === 0) {
    return { matches: [], usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
  }

  const response = await client.messages.create(requestParams(text));

  return {
    matches: parseMatches(text, response.content),
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      cacheWrite: response.usage.cache_creation_input_tokens ?? 0,
    },
  };
}

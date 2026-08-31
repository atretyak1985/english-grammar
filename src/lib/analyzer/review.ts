import { MODEL, getClaude } from '@/lib/claude';
import { TENSE_KEYS, isTenseKey, type TenseKey } from '@/types/content';

import { analyzeText, normalizeWord } from './tenses';
import { wordTokens } from './words';

/**
 * Розбір минулих і теперішніх часів моделлю — другий прохід поверх локальних
 * правил (`tenses.ts`). Локальні правила лишаються основою: вони дають розмітку
 * миттєво, безкоштовно й без мережі. Модель викликається, щоб прибрати те, чого
 * шаблони не вміють розрізняти — «a tired engineer» проти «he tired quickly»,
 * «had lunch» проти «had finished», — і щоб знайти пропущене.
 *
 * Для теперішніх часів модель не доповнення, а основне джерело. Present Simple
 * без допоміжного дієслова шаблоном не видно взагалі: «we deploy» — це чиста
 * основа, а «it scales» відрізняється від іменника в множині лише за роллю в
 * реченні. Локальний шар дає тут щонайбільше `do` / `does`, тому все інше
 * приходить саме звідси.
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
export const PROMPT_VERSION = 4;

/**
 * `effort` приймають не всі моделі: Haiku 4.5 відповідає на нього 400
 * «This model does not support the effort parameter». Тому параметр не
 * безумовний — інакше зміна ANTHROPIC_MODEL валила б розбір повністю.
 */
function supportsEffort(model: string): boolean {
  return !model.includes('haiku');
}

/**
 * Найдовша справжня конструкція — пʼять слів: «is not going to work». Форми на
 * `will` вкладаються в чотири («won't have been working»), але періфрастичне
 * майбутнє з запереченням довше, і обрізати його означало б віддати читачеві
 * половину конструкції.
 */
const MAX_SPAN_WORDS = 5;

/** Скільки максимум збігів приймаємо: більше, ніж слів, модель повернути не може. */
const MAX_MATCHES = 4000;

/**
 * Займенники, які модель час від часу затягує в проміжок разом із дієсловом:
 * «I think» замість «think», «we expected» замість «expected». Промпт це
 * забороняє прямою вимогою, але заборона в промпті — це прохання, а не
 * гарантія, тому межу підрізаємо самі.
 *
 * Це не косметика. Підсвітка вчить, ДЕ конструкція починається, і зайвий
 * займенник у ній повідомляє неправду: нібито підмет — частина дієслівної
 * форми. Помилка тим шкідливіша, що виглядає впевнено.
 *
 * Скорочень тут немає й бути не може: у «I've» підмет зрощений з допоміжним в
 * один токен, відрізати його нема як, і сам токен справді починає конструкцію.
 */
const BARE_SUBJECTS = new Set([
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'there',
  'this',
  'that',
]);

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
// Експортовано для аудиту точності (`scripts/grammar-audit.mts`): суддею там
// мусить бути РІВНО той промпт, що й у бойовому розборі, інакше аудит міряв
// би згоду з кимось іншим.
export const SYSTEM = `You mark verb constructions in English text for a language-learning reader — a Ukrainian speaker studying the past, present and future tenses.

The text arrives as numbered word tokens in the form <index>:<word>. Punctuation stays attached to the word it belongs to. You return the indices, never the words.

Mark exactly nine kinds of construction — three aspects across three times:
- ps — Past Simple: a finite past-tense verb ("walked", "went", "was", "did not go").
- pc — Past Continuous: was/were (+ not) + V-ing.
- pp — Past Perfect: had (+ not) + past participle, including Past Perfect Continuous ("had been working").
- prs — Present Simple: a finite present-tense verb ("deploy", "scales", "is", "does not know").
- prc — Present Continuous: am/is/are (+ not) + V-ing.
- prp — Present Perfect: have/has (+ not) + past participle, including Present Perfect Continuous ("has been working").
- fs — Future Simple: will/shall (+ not) + bare verb ("will deploy", "won't be ready"), and also "be going to" + bare verb ("is going to fail").
- fc — Future Continuous: will (+ not) + be + V-ing ("will be waiting").
- fp — Future Perfect: will (+ not) + have + past participle, including Future Perfect Continuous ("will have been running").

Spans:
- One match per construction. "from" is its first token — the auxiliary when there is one; "to" is the last token, the lexical verb. An adverb standing between them ("had never seen", "have already fixed") stays inside the span.
- A contracted auxiliary is glued to its subject in one token ("I've", "she's", "they're", "I'm"). That whole token is the first token of the span; you cannot split it.
- A finite verb with no auxiliary spans that ONE token alone. Never reach backwards into the subject: "we expected" is a single match on "expected", and "the service scales" is a single match on "scales". A copula or lexical "have"/"had" behaves the same way — what follows it is its complement, not part of the verb.
- An adverb belongs inside a span only when it stands BETWEEN an auxiliary and its lexical verb ("have already checked"). An adverb before a bare verb stays outside: "usually run" is a match on "run" alone.
- Spans must not overlap, must be sorted by "from" ascending, and are never longer than four tokens.
- Report every occurrence, including repeated ones. Report nothing else.

Choosing between the labels:
- The past/present split is this reader's hardest problem — settle it first. "I fixed it" is ps; "I have fixed it" is prp. A named finished time ("yesterday", "in 2019", "an hour ago", "last week") forces ps and rules prp out.
- "have"/"has" followed by a noun phrase is lexical "have" and belongs to Present Simple: "I have two reports" is prs on "have" alone. The same shape in the past ("I had lunch") is ps on "had" alone.
- "'s" is either "is" or "has": before V-ing it is "is" (prc), before a past participle it is "has" (prp). Before a noun it is a possessive and not a verb at all.
- am/is/are used as the main verb ("she is tired", "the service is down", "the door is locked") is prs, spanning only that token. was/were in the same role is ps.
- A PRESENT form carrying future meaning stays present. "The train leaves at six" is prs, "We are meeting the vendor on Thursday" is prc, even though both talk about the future: the label follows the form, not the moment being described. Only will/shall and "be going to" make it future.
- "be going to" is fs only when a bare verb follows it: "I am going to deploy" is fs. When a noun phrase follows, it is literal movement and stays Present Continuous: "I am going to the office" is prc on "am going". If the following word could be either ("I am going to work"), prefer prc.

Do NOT mark:
- participial adjectives ("a tired engineer", "an interested reader");
- infinitives ("to deploy"), imperatives ("check the logs"), or a bare stem governed by a modal OTHER than will/shall ("can deploy", "should know", "must ship", "might break") — and never mark those modals themselves. will and shall are the exception: they build Future Simple and the span covers both words;
- nouns that merely end in -ed or -s. A plural noun ("the logs", "two releases") is not a Present Simple verb: mark a word prs only when it is the finite verb of its clause.

Worked examples. Input, then the matches you would report and why.

Input: 0:A 1:tired 2:engineer 3:had 4:lunch 5:and 6:left.
  {from: 3, to: 3, ps} — "had" is lexical "have" in the past; "lunch" is its object and stays outside.
  {from: 6, to: 6, ps} — "left" is an irregular past form.
  "tired" is not marked: a participial adjective describing the engineer, not a finite verb.

Input: 0:She 1:had 2:never 3:seen 4:it, 5:so 6:she 7:was 8:waiting.
  {from: 1, to: 3, pp} — "had ... seen"; the adverb "never" sits inside the span.
  {from: 7, to: 8, pc} — "was waiting".

Input: 0:We 1:have 2:already 3:finished, 4:but 5:I 6:sent 7:the 8:invoice 9:yesterday.
  {from: 1, to: 3, prp} — "have already finished": no time is named, the result is what matters now.
  {from: 6, to: 6, ps} — "sent": "yesterday" names a finished period, so this is Past Simple, never Present Perfect.

Input: 0:I've 1:been 2:waiting 3:and 4:she's 5:working 6:while 7:he's 8:gone.
  {from: 0, to: 2, prp} — "I've been waiting" is Present Perfect Continuous; the contraction token starts the span.
  {from: 4, to: 5, prc} — "she's working": before V-ing the "'s" is "is".
  {from: 7, to: 8, prp} — "he's gone": before a past participle the "'s" is "has".

Input: 0:Our 1:service 2:handles 3:a 4:million 5:requests 6:and 7:the 8:logs 9:look 10:fine.
  {from: 2, to: 2, prs} — "handles" is the finite present verb of its clause; "Our service" is its subject and stays outside the span.
  {from: 9, to: 9, prs} — "look" is the finite present verb; a bare stem is still Present Simple.
  "requests" and "logs" are not marked: plural nouns, not verbs.

Input: 0:He 1:doesn't 2:know 3:yet, 4:and 5:he 6:has 7:two 8:reports.
  {from: 1, to: 2, prs} — "doesn't know" is one negated Present Simple construction.
  {from: 6, to: 6, prs} — "has" is lexical "have" here; "two reports" is its object.

Input: 0:The 1:job 2:had 3:not 4:been 5:working 6:before 7:we 8:fixed 9:it.
  {from: 2, to: 5, pp} — "had not been working".
  {from: 8, to: 8, ps} — "fixed".

Input: 0:I'll 1:call 2:you 3:when 4:the 5:build 6:finishes, 7:and 8:by 9:Friday 10:we 11:will 12:have 13:shipped 14:it.
  {from: 0, to: 1, fs} — "I'll call": the contraction token starts the span.
  {from: 6, to: 6, prs} — "finishes": after "when" the form is present, so the label is present even though the meaning is future.
  {from: 11, to: 13, fp} — "will have shipped".

Input: 0:She 1:is 2:going 3:to 4:resign, 5:but 6:right 7:now 8:she 9:is 10:going 11:to 12:the 13:office.
  {from: 1, to: 4, fs} — "is going to resign": a bare verb follows, so this is the "be going to" future.
  {from: 9, to: 10, prc} — "is going" to the office is literal movement; "to the office" is a noun phrase and stays outside the span.

Input: 0:At 1:six 2:we 3:will 4:be 5:waiting, 6:and 7:the 8:report 9:will 10:be 11:ready.
  {from: 3, to: 5, fc} — "will be waiting".
  {from: 9, to: 10, fs} — "will be" with an adjective after it is Future Simple of "be"; "ready" stays outside.`;

const REPORT_TOOL = {
  name: 'report_matches',
  description: 'Report every past- or present-tense verb construction found in the numbered text.',
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
            tense: { type: 'string', enum: TENSE_KEYS },
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
function accept(raw: unknown, list: { index: number; raw: string }[]): ReviewedMatch[] {
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
    if (!isTenseKey(tense)) continue;

    guard = end;

    // Підрізаємо голий підмет на початку проміжку. Тільки коли далі ще є що
    // підсвічувати: односкладний збіг на самому займеннику модель не робить, а
    // якби зробила, порожнього проміжку з нього виходити не має.
    const first = normalizeWord(list[start]?.raw ?? '');
    const begin = start < end && first !== null && BARE_SUBJECTS.has(first) ? start + 1 : start;

    // Назовні йдуть індекси токенів — саме ними оперує рендер підсвітки.
    out.push({
      from: list[begin]?.index ?? 0,
      to: list[end]?.index ?? 0,
      tense,
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

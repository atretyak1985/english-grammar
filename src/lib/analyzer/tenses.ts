import { V2_FORMS, V3_FORMS } from '@/data/irregular-verbs';
import type { TenseKey } from '@/types/content';

/**
 * Розпізнавання минулих і теперішніх часів у довільному тексті (CONCEPT 4.1).
 *
 * Текст ділиться на слова зі збереженням пробілів і проходиться один раз
 * зліва вправо. Правила застосовуються в порядку — ПЕРШЕ ЗБІЖНЕ ВИГРАЄ:
 *
 *   1. was / were / wasn't / weren't + …ing    → Past Continuous
 *   2. had / hadn't + слово                     → Past Perfect
 *   3. did / didn't + слово                     → Past Simple
 *   4. have / has / 've / 's + been + …ing      → Present Perfect
 *   5. have / has / 've / 's + V3               → Present Perfect
 *   6. am / is / are / 'm / 're / 's + …ing     → Present Continuous
 *   7. do / does / don't / doesn't + слово      → Present Simple
 *   8. will / 'll / won't + have + been + …ing  → Future Perfect
 *   9. will / 'll / won't + have + V3           → Future Perfect
 *  10. will / 'll / won't + be + …ing           → Future Continuous
 *  11. will / 'll / won't + слово               → Future Simple
 *  12. слово зі списку неправильних (V2)        → Past Simple
 *  13. закінчення -ed                           → Past Simple
 *
 * Допоміжне і смислове дієслово підсвічуються як ОДНА конструкція — саме
 * зв'язку «had + V3» чи «have been + V-ing» треба навчитися бачити.
 *
 * Це розпізнавання за шаблонами, а не синтаксичний розбір, і межі шару варто
 * знати чесно:
 *
 * — `-ed` у прикметнику («a tired engineer») буде позначене як Past Simple;
 * — `'s` перед `-ing` після справжнього присвійного («the team's working
 *   style») дасть хибний Present Continuous — розрізнити їх без розбору
 *   речення неможливо;
 * — у питаннях підмет стоїть між допоміжним і смисловим дієсловом, тому
 *   «did you see» і «do you deploy» позначаться проміжком по підмет: час
 *   названий правильно, межі — приблизно;
 * — **Present Simple без допоміжного локально не видно взагалі.** «We deploy
 *   on Fridays» — це чиста основа дієслова, а «it scales» відрізняється від
 *   іменника в множині лише за контекстом. Тому цей час знаходить майже
 *   винятково модель (`review.ts`), а локальний шар дає його тільки там, де є
 *   `do` / `does`. Це не недогляд, а межа шаблонного підходу: правило, яке
 *   ловило б кожне слово на `-s`, підсвітило б половину іменників у тексті;
 * — **`be going to` локально теж не розпізнається.** «I am going to deploy» —
 *   майбутнє, а «I am going to the office» — рух, і на поверхні вони
 *   однакові: різниця лише в тому, іменник далі чи дієслово. «I am going to
 *   work» двозначне навіть для людини. Тому цю форму лишено моделі, а
 *   локально вона поки виглядає як Present Continuous («am going»).
 *
 * Майбутні часи, натомість, розпізнаються надійно: `will` — слово однозначне,
 * без другого значення й без омонімів серед іменників, тому шаблон тут дає
 * майже те саме, що дала б модель.
 *
 * Для навчальної підсвітки цього достатньо: локальний шар з'являється миттєво
 * й безкоштовно, а розбір моделлю приходить поверх нього і має остаточне слово.
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
const HAVE = new Set(['have', 'has', "haven't", "hasn't"]);
const BE_PRESENT = new Set(['am', 'is', 'are', "isn't", "aren't"]);
const DO_PRESENT = new Set(['do', 'does', "don't", "doesn't"]);
/**
 * `shall` тут не для повноти таблиці: у британських документах і питаннях
 * («Shall we start?») він живий, а вести його окремим часом не варто — це той
 * самий Future Simple.
 */
const WILL = new Set(['will', "won't", 'shall', "shan't"]);

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
  prs: 'Present Simple',
  prc: 'Present Continuous',
  prp: 'Present Perfect',
  fs: 'Future Simple',
  fc: 'Future Continuous',
  fp: 'Future Perfect',
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

/** Третя форма: неправильна зі списку або правильна на -ed (V3 = V2). */
function isV3Form(word: string | null): boolean {
  return word !== null && (V3_FORMS.has(word) || isEdForm(word));
}

/**
 * Що приховує скорочення, приклеєне до підмета одним токеном. Розрізняє їх не
 * саме скорочення, а те, що стоїть далі, — і це та сама двозначність, про яку
 * попереджає теорія: `she's working` це `is`, `she's worked` це `has`.
 *
 * `'d` тут немає навмисно: за ним ховаються і `had`, і `would`, а розрізнити їх
 * без розбору речення не вийде. Локальний шар просто мовчить, і слово дістає
 * розмітку від моделі.
 */
function contraction(word: string | null): 'be' | 'have' | 'will' | 'either' | null {
  if (word === null) return null;
  if (word.endsWith("'m") || word.endsWith("'re")) return 'be';
  if (word.endsWith("'ve")) return 'have';
  if (word.endsWith("'ll")) return 'will';
  if (word.endsWith("'s")) return 'either';
  return null;
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

    // 4-5. have / has / 've / 's + been + …ing або + V3 → Present Perfect
    //
    // Perfect Continuous («have been working») складено в той самий ключ, що й
    // простий перфект, — так само, як Past Perfect Continuous лежить у `pp`.
    // Це рішення теорії, а не спрощення розбору: тема подає обидві форми одним
    // розділом, і підсвітка не має розказувати іншу історію.
    const asHave = HAVE.has(word) || contraction(word) === 'have';
    if (asHave || contraction(word) === 'either') {
      const next = nextWordIndex(tokens, i);
      const nextWord = next === null ? null : (tokens[next]?.word ?? null);

      // have been working — дивимось на слово ЗА `been`
      if (next !== null && nextWord === 'been') {
        const third = nextWordIndex(tokens, next);
        if (third !== null && isIngForm(tokens[third]?.word ?? null)) {
          matches.push({ from: i, to: third, tense: 'prp' });
          i = third;
          continue;
        }
      }

      // have finished / has seen — тільки справжня третя форма. Порівняно з
      // правилом для `had` це навмисно вужче: `have` куди частіше буває
      // смисловим («I have two reports»), і вільне правило підсвітило б
      // половину володіння в тексті.
      if (next !== null && isV3Form(nextWord) && !DETERMINERS.has(nextWord ?? '')) {
        matches.push({ from: i, to: next, tense: 'prp' });
        i = next;
        continue;
      }
    }

    // 6. am / is / are / 'm / 're / 's + …ing → Present Continuous
    if (BE_PRESENT.has(word) || contraction(word) === 'be' || contraction(word) === 'either') {
      const next = nextWordIndex(tokens, i);
      if (next !== null && isIngForm(tokens[next]?.word ?? null)) {
        matches.push({ from: i, to: next, tense: 'prc' });
        i = next;
        continue;
      }
    }

    // 7. do / does / don't / doesn't + слово → Present Simple
    if (DO_PRESENT.has(word)) {
      const next = nextWordIndex(tokens, i);
      if (next !== null && isVerbCandidate(tokens[next]?.word ?? null)) {
        matches.push({ from: i, to: next, tense: 'prs' });
        i = next;
        continue;
      }
    }

    // 8-11. will / 'll / won't + … → майбутні часи
    //
    // Порядок перевірок від довшого до коротшого, і це важливо: «will have
    // finished» мусить стати перфектом ЩЕ ДО того, як спрацює загальне правило
    // «will + слово», інакше конструкція розпалася б на Future Simple плюс
    // окремо підсвічене дієслово.
    if (WILL.has(word) || contraction(word) === 'will') {
      const next = nextWordIndex(tokens, i);
      const nextWord = next === null ? null : (tokens[next]?.word ?? null);

      if (next !== null) {
        // will have been working
        if (nextWord === 'have') {
          const third = nextWordIndex(tokens, next);
          const thirdWord = third === null ? null : (tokens[third]?.word ?? null);

          if (third !== null && thirdWord === 'been') {
            const fourth = nextWordIndex(tokens, third);
            if (fourth !== null && isIngForm(tokens[fourth]?.word ?? null)) {
              matches.push({ from: i, to: fourth, tense: 'fp' });
              i = fourth;
              continue;
            }
          }

          // will have finished — але НЕ «will have lunch»: там `have` смислове,
          // і це звичайний Future Simple, який дожене правило нижче.
          if (third !== null && isV3Form(thirdWord) && !DETERMINERS.has(thirdWord ?? '')) {
            matches.push({ from: i, to: third, tense: 'fp' });
            i = third;
            continue;
          }
        }

        // will be working
        if (nextWord === 'be') {
          const third = nextWordIndex(tokens, next);
          if (third !== null && isIngForm(tokens[third]?.word ?? null)) {
            matches.push({ from: i, to: third, tense: 'fc' });
            i = third;
            continue;
          }
        }

        // will deploy · will be fine · will have lunch — усе це Future Simple.
        // Проміжок тягнеться до наступного слова, бо саме зв'язку «will + V»
        // читач і має побачити цілою.
        if (isVerbCandidate(nextWord)) {
          matches.push({ from: i, to: next, tense: 'fs' });
          i = next;
          continue;
        }
      }
    }

    // 12. неправильне дієслово у формі V2 → Past Simple
    if (V2_FORMS.has(word)) {
      matches.push({ from: i, to: i, tense: 'ps' });
      continue;
    }

    // 13. закінчення -ed → Past Simple
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
    prs: { count: 0, examples: [] },
    prc: { count: 0, examples: [] },
    prp: { count: 0, examples: [] },
    fs: { count: 0, examples: [] },
    fc: { count: 0, examples: [] },
    fp: { count: 0, examples: [] },
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

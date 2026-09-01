import { IRREGULAR_VERBS } from '@/data/irregular-verbs';
import type { TenseKey } from '@/types/content';

/**
 * Варіанти для «заповнити пропуск»: правильна форма з тексту й три хибні —
 * та сама дія в інших часах. Хибні варіанти не вигадуються словником, а
 * виводяться з форми, що стоїть у реченні: з «walked» виходять «was
 * walking» і «had walked», з «had seen» — «saw» і «was seeing».
 *
 * Тому тут не потрібна основа дієслова: усі три потрібні форми (V2, V3,
 * -ing) виводяться одна з одної. Для неправильних дієслів — за таблицею з
 * теми, для правильних — за орфографічними правилами -ed ↔ -ing, які не
 * вимагають знати, де в основі стояло «e».
 */

/** Часи, для яких пропуск має сенс: у кожного є форма й є з чим сплутати. */
export const GAP_TENSES = ['ps', 'pc', 'pp', 'prp', 'prc'] as const satisfies readonly TenseKey[];

export type GapTense = (typeof GAP_TENSES)[number];

export function isGapTense(tense: TenseKey): tense is GapTense {
  return (GAP_TENSES as readonly TenseKey[]).includes(tense);
}

/**
 * Чому саме ця форма — коротко й українською. Не пояснення до конкретного
 * речення, а правило, за яким цю конструкцію впізнають: після відповіді
 * людина бачить речення з підсвіткою і це правило поруч.
 */
export const GAP_WHY: Record<GapTense, string> = {
  ps: 'Past Simple — завершена дія або крок оповіді в минулому: що сталося, одне за одним. Форма V2: walked, went.',
  pc: 'Past Continuous — процес у певний момент минулого, часто тло для іншої події: was/were + V-ing.',
  pp: 'Past Perfect — дія, що сталася ДО іншої минулої дії: had + V3. Показує, що було раніше.',
  prp: 'Present Perfect — результат, який є на тепер: have/has + V3. Коли саме — неважливо, важливо, що вже є.',
  prc: 'Present Continuous — процес зараз або тимчасовий стан: am/is/are + V-ing.',
};

/** Три форми, потрібні для будь-якої з пʼяти конструкцій. */
interface VerbForms {
  v2: string;
  v3: string;
  ing: string;
}

interface IrregularForms {
  v1: string;
  v2: string;
  v3: string;
}

/** Будь-яка форма з таблиці → її рядок. Для be форми не потрібні (див. gapOptions). */
const IRREGULAR_BY_FORM = new Map<string, IrregularForms>();
for (const verb of IRREGULAR_VERBS) {
  for (const form of [verb.v1, ...verb.v2.split('/'), ...verb.v3.split('/')]) {
    const key = form.toLowerCase();
    if (!IRREGULAR_BY_FORM.has(key)) IRREGULAR_BY_FORM.set(key, verb);
  }
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/** Один голосний кластер — односкладове слово: run, sit, hope. */
function isMonosyllabic(word: string): boolean {
  return (word.match(/[aeiouy]+/g) ?? []).length === 1;
}

/** Двоскладові з наголосом на другому складі — подвоюють як односкладові. */
const DOUBLING_EXCEPTIONS = new Set([
  'begin',
  'forget',
  'forgive',
  'forbid',
  'upset',
  'admit',
  'occur',
  'prefer',
  'refer',
  'regret',
  'commit',
  'permit',
]);

/** Приголосна після короткого голосного подвоюється: run → running, sit → sitting. */
function doublesFinal(base: string): boolean {
  const last = base[base.length - 1];
  const prev = base[base.length - 2];
  if (!last || !prev) return false;
  if (VOWELS.has(last) || 'wxy'.includes(last)) return false;
  if (!VOWELS.has(prev)) return false;
  return isMonosyllabic(base) || DOUBLING_EXCEPTIONS.has(base);
}

/** -ing з основи: make → making, lie → lying, run → running, see → seeing. */
export function ingFromBase(base: string): string {
  if (base.endsWith('ie')) return `${base.slice(0, -2)}ying`;
  if (base.endsWith('e') && !/(ee|ye|oe)$/.test(base)) return `${base.slice(0, -1)}ing`;
  if (doublesFinal(base)) return `${base}${base[base.length - 1]}ing`;
  return `${base}ing`;
}

/**
 * -ing з правильної -ed форми, не знаючи основи: hoped → hoping, hopped →
 * hopping, tried → trying, agreed → agreeing. Літера «e» тут не потрібна:
 * вона однаково зникає перед -ing.
 */
function ingFromEd(ed: string): string {
  if (ed.endsWith('ied')) return `${ed.slice(0, -3)}ying`;
  if (ed.endsWith('eed')) return `${ed.slice(0, -1)}ing`;
  return `${ed.slice(0, -2)}ing`;
}

/** -ed з правильної -ing форми: hoping → hoped, trying → tried, seeing → (нерегулярне). */
function edFromIng(ing: string): string {
  const stem = ing.slice(0, -3);
  const last = stem[stem.length - 1] ?? '';
  const prev = stem[stem.length - 2] ?? '';
  if (last === 'y' && !VOWELS.has(prev)) return `${stem.slice(0, -1)}ied`;
  if (last === 'e') return `${stem}d`;
  return `${stem}ed`;
}

/** Основа неправильного дієслова з його -ing форми: making → make, running → run. */
function irregularFromIng(ing: string): IrregularForms | null {
  const stem = ing.slice(0, -3);
  const candidates = [stem, `${stem}e`];
  if (stem.endsWith('y')) candidates.push(`${stem.slice(0, -1)}ie`);
  if (stem.length > 1 && stem[stem.length - 1] === stem[stem.length - 2]) {
    candidates.push(stem.slice(0, -1));
  }
  for (const candidate of candidates) {
    const verb = IRREGULAR_BY_FORM.get(candidate);
    if (verb && verb.v1 === candidate) return verb;
  }
  return null;
}

/** Перша з кількох форм через «/»: «was/were» → «was». */
function first(form: string): string {
  return form.split('/')[0] ?? form;
}

/**
 * Три форми з того, що стоїть у реченні. `null`, коли форму не впізнати —
 * таке речення у вправу не потрапляє, це краще за вигадану форму.
 */
function formsOf(surface: string, tense: GapTense): VerbForms | null {
  const irregular = tense === 'pc' || tense === 'prc' ? irregularFromIng(surface) : IRREGULAR_BY_FORM.get(surface);

  if (irregular) {
    if (irregular.v1 === 'be') return null;
    return { v2: first(irregular.v2), v3: first(irregular.v3), ing: ingFromBase(irregular.v1) };
  }

  switch (tense) {
    case 'ps':
    case 'pp':
    case 'prp': {
      if (!surface.endsWith('ed') || surface.length < 4) return null;
      return { v2: surface, v3: surface, ing: ingFromEd(surface) };
    }
    case 'pc':
    case 'prc': {
      if (!surface.endsWith('ing') || surface.length < 5) return null;
      const ed = edFromIng(surface);
      return { v2: ed, v3: ed, ing: surface };
    }
  }
}

type Person = '1sg' | '3sg' | 'pl';

const PLURAL_SUBJECTS = new Set(['we', 'they', 'you', 'people', 'both', 'all', 'these', 'those']);

/**
 * Особа для допоміжного дієслова: з підмета, якщо він стоїть просто перед
 * конструкцією, інакше з допоміжного, що вже є в тексті. Коли жодного
 * джерела немає, третя особа однини — найчастіша в оповіді.
 */
function personOf(subject: string | null, aux: string | null): Person {
  if (subject === 'i') return '1sg';
  if (subject && PLURAL_SUBJECTS.has(subject)) return 'pl';
  if (subject && ['he', 'she', 'it'].includes(subject)) return '3sg';
  if (aux === 'were' || aux === 'have' || aux === 'are') return 'pl';
  if (aux === 'am') return '1sg';
  return '3sg';
}

const PAST_BE: Record<Person, string> = { '1sg': 'was', '3sg': 'was', pl: 'were' };
const PRESENT_BE: Record<Person, string> = { '1sg': 'am', '3sg': 'is', pl: 'are' };
const PRESENT_HAVE: Record<Person, string> = { '1sg': 'have', '3sg': 'has', pl: 'have' };

/** Порядок хибних варіантів: спершу сусіди з тієї ж родини часів. */
const DISTRACTORS: Record<GapTense, GapTense[]> = {
  ps: ['pc', 'pp', 'prp', 'prc'],
  pc: ['ps', 'pp', 'prp', 'prc'],
  pp: ['ps', 'pc', 'prp', 'prc'],
  prp: ['ps', 'pp', 'pc', 'prc'],
  prc: ['pc', 'prp', 'ps', 'pp'],
};

const OPTION_COUNT = 4;

/** Допоміжні, перед якими або після яких дієслово вже не те, що здається. */
const AUXILIARIES = new Set([
  'was',
  'were',
  'had',
  'has',
  'have',
  'is',
  'are',
  'am',
  'be',
  'been',
  'being',
  'did',
  'do',
  'does',
  'will',
]);

function lower(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^a-z']+|[^a-z']+$/g, '');
}

function capitalize(form: string): string {
  return form.charAt(0).toUpperCase() + form.slice(1);
}

export interface GapChoice {
  /** Правильна форма — так, як вона стоїть у тексті, з великої літери, якщо треба. */
  correct: string;
  /** Правильна і три хибні в сталому порядку; перемішує компонент. */
  options: string[];
}

/**
 * Варіанти для одного пропуску.
 *
 * @param matchWords слова конструкції як у тексті («had», «seen»)
 * @param tense      час конструкції
 * @param before     слово перед конструкцією — щоб узгодити допоміжне з підметом
 *
 * `null` для конструкцій, які не розкладаються на «допоміжне + смислове»:
 * заперечення, питання, прислівник усередині, скорочення, дієслово be, три
 * слова й більше. Вправа мовчки бере інше речення.
 */
export function gapOptions(
  matchWords: readonly string[],
  tense: TenseKey,
  before: string | null,
): GapChoice | null {
  if (!isGapTense(tense)) return null;
  if (matchWords.length === 0 || matchWords.length > 2) return null;

  const words = matchWords.map(lower);
  if (words.some((word) => word === '' || word.includes("'") || word === 'not')) return null;

  const surface = words[words.length - 1] ?? '';
  const aux = words.length === 2 ? (words[0] ?? null) : null;

  if (tense === 'ps' && (aux !== null || AUXILIARIES.has(surface))) return null;
  if (tense !== 'ps' && aux === null) return null;
  if (AUXILIARIES.has(surface)) return null;

  const subject = before === null ? null : lower(before);
  if (subject !== null && AUXILIARIES.has(subject)) return null;

  const forms = formsOf(surface, tense);
  if (!forms) return null;

  const person = personOf(subject, aux);
  const byTense: Record<GapTense, string> = {
    ps: forms.v2,
    pc: `${PAST_BE[person]} ${forms.ing}`,
    pp: `had ${forms.v3}`,
    prp: `${PRESENT_HAVE[person]} ${forms.v3}`,
    prc: `${PRESENT_BE[person]} ${forms.ing}`,
  };

  // Правильний варіант — з тексту, а не з таблиці: узгодження з підметом у
  // тексті завжди правильне, а виведене — лише здогад.
  const correct = words.join(' ');
  const options = [correct];
  for (const other of DISTRACTORS[tense]) {
    const candidate = byTense[other];
    if (!options.includes(candidate)) options.push(candidate);
    if (options.length === OPTION_COUNT) break;
  }
  if (options.length < OPTION_COUNT) return null;

  const upper = /^[A-Z]/.test(matchWords[0] ?? '');
  return {
    correct: upper ? capitalize(correct) : correct,
    options: upper ? options.map(capitalize) : options,
  };
}

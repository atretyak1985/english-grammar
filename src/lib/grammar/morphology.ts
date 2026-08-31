import { IRREGULAR_BY_V1, V2_FORMS, V2_ONLY, V3_FORMS, V3_ONLY } from '@/data/irregular-verbs';

/**
 * Форма дієслова за самим словом і лемою від теґера. Двигун розрізняє часи
 * не за літерами, а за формами: «had + V3» це Past Perfect незалежно від того,
 * «had seen» це чи «had finished», — тому тут одне місце, де літери
 * перетворюються на форми, а правила (`rules.ts`) літер уже не бачать.
 *
 * `past-or-participle` — чесна відповідь для правильних дієслів і групи B
 * неправильних: «finished» чи «sent» без допоміжного невідомо, V2 це чи V3.
 * Розв'язує це контекст у правилах, а не вгадування тут.
 */
export type VerbForm = 'base' | 's' | 'ing' | 'past' | 'participle' | 'past-or-participle';

/** Усі форми, які можуть стояти після had/have/will have. */
export const PARTICIPLE_LIKE: readonly VerbForm[] = ['participle', 'past-or-participle'];

const BE_FORMS: Record<string, VerbForm> = {
  be: 'base',
  am: 's',
  is: 's',
  are: 's',
  "'m": 's',
  "'re": 's',
  "'s": 's',
  was: 'past',
  were: 'past',
  been: 'participle',
  being: 'ing',
};

const HAVE_FORMS: Record<string, VerbForm> = {
  have: 'base',
  "'ve": 'base',
  has: 's',
  had: 'past-or-participle',
  having: 'ing',
};

/** Усі поверхневі форми be — щоб не залежати від леми wink («being» він лематизує як being). */
export const BE_WORDS: ReadonlySet<string> = new Set(Object.keys(BE_FORMS));

const DO_FORMS: Record<string, VerbForm> = {
  do: 'base',
  does: 's',
  did: 'past',
  done: 'participle',
  doing: 'ing',
};

/**
 * Модальні як окрема таблиця: форм у них немає, і будь-яка спроба вивести
 * «форму» з літер (would → -d?) дала б сміття. will і shall тут теж — це той
 * самий клас слів, а що вони будують Future Simple, знають правила.
 */
export const MODALS: ReadonlySet<string> = new Set([
  'will',
  "'ll",
  'wo', // wink ділить won't на wo + n't
  'shall',
  'sha', // так само shan't
  'would',
  "'d",
  'should',
  'can',
  'ca', // can't
  'could',
  'may',
  'might',
  'must',
  'ought',
]);

/**
 * Дієприкметникові прикметники: «a tired engineer», «she was interested».
 * Морфологічно це V3, і теґер часом віддає їх як ADJ, а часом як VERB, — але
 * правило відновлення (`verb-groups.ts`) не має перетворювати їх на дієслова,
 * бо в тексті вони майже завжди означають стан, а не дію.
 */
export const PARTICIPIAL_ADJECTIVES: ReadonlySet<string> = new Set([
  'aged',
  'alarmed',
  'amazed',
  'amused',
  'annoyed',
  'ashamed',
  'astonished',
  'beloved',
  'bewildered',
  'bored',
  'complicated',
  'concerned',
  'confused',
  'contented',
  'crowded',
  'delighted',
  'depressed',
  'determined',
  'devoted',
  'disappointed',
  'disgusted',
  'distinguished',
  'dressed',
  'educated',
  'embarrassed',
  'engaged',
  'excited',
  'exhausted',
  'experienced',
  'fascinated',
  'frightened',
  'interested',
  'involved',
  'limited',
  'located',
  'married',
  'mixed',
  'offended',
  'pleased',
  'prepared',
  'puzzled',
  'qualified',
  'related',
  'relaxed',
  'relieved',
  'retired',
  'satisfied',
  'scared',
  'shocked',
  'sophisticated',
  'supposed',
  'surprised',
  'terrified',
  'thrilled',
  'tired',
  'united',
  'used',
  'worried',
]);

/**
 * Слова на -ed, які не є минулим часом: іменники й прикметники, що просто так
 * закінчуються. Без цього списку «hundred» чи «wicked» проходили б як V2.
 */
const NOT_PAST_ED: ReadonlySet<string> = new Set([
  'bleed',
  'breed',
  'creed',
  'crooked',
  'deed',
  'dogged',
  'feed',
  'greed',
  'hatred',
  'hundred',
  'indeed',
  'jagged',
  'kindred',
  'naked',
  'need',
  'ragged',
  'reed',
  'rugged',
  'sacred',
  'seed',
  'shed',
  'shred',
  'sled',
  'speed',
  'weed',
  'wicked',
  'wretched',
]);

/**
 * Чи схоже слово на правильне минуле за самими літерами — без леми. Потрібно
 * там, де леми немає або вона не допомагає: теґер віддав слово як ADJ і
 * лему поставив рівну слову («hurried» → «hurried»).
 */
export function looksLikeRegularPast(word: string): boolean {
  return (
    word.length >= 4 &&
    word.endsWith('ed') &&
    !word.endsWith('eed') &&
    !NOT_PAST_ED.has(word) &&
    !V1_LIKE_ED.has(word)
  );
}

/** Основи, що самі закінчуються на -ed і є дієсловами: «need», «succeed» — у списку -eed, а ці ні. */
const V1_LIKE_ED: ReadonlySet<string> = new Set(['embed', 'shred', 'wed', 'bed', 'red']);

/**
 * Основа збігається з V2 («put», «cut», «read», «beat») або з V3 («come»,
 * «run», «become»): у такому слові без допоміжного не видно, минуле це,
 * теперішнє чи дієприкметник. Правила ставлять на нього прапорець
 * `uncertain`, а не вгадують.
 */
export function isBaseHomograph(word: string, lemma?: string): boolean {
  const entry = IRREGULAR_BY_V1.get(lemma ?? word) ?? IRREGULAR_BY_V1.get(word);
  if (!entry || entry.v1 !== word) return false;
  return entry.v2.split('/').includes(word) || entry.v3.split('/').includes(word);
}

/**
 * Чи може слово бути цією формою. Для більшості слів це просто `verbForm`, а
 * омографи основи й V2 («put», «read») підходять і як основа: після did чи
 * модального вони можуть бути лише нею.
 */
export function hasForm(word: string, lemma: string | undefined, form: VerbForm): boolean {
  if (verbForm(word, lemma) === form) return true;
  return form === 'base' && isBaseHomograph(word, lemma);
}

export function verbForm(word: string, lemma?: string): VerbForm {
  const be = BE_FORMS[word];
  if (be) return be;
  const have = HAVE_FORMS[word];
  if (have) return have;
  const doForm = DO_FORMS[word];
  if (doForm) return doForm;
  if (MODALS.has(word)) return 'base';

  // Неправильне за лемою: теґер знає, що «lay» тут від lie, а не основа lay.
  const entry = IRREGULAR_BY_V1.get(lemma ?? word);
  if (entry) {
    const v2 = entry.v2.split('/');
    const v3 = entry.v3.split('/');
    const isV2 = v2.includes(word);
    const isV3 = v3.includes(word);
    if (isV2 && isV3) return 'past-or-participle';
    if (isV2) return 'past';
    if (isV3) return 'participle';
    if (word === entry.v1) return 'base';
  } else {
    // Без леми — за глобальними множинами форм.
    if (V2_FORMS.has(word) && V3_FORMS.has(word)) return 'past-or-participle';
    if (V2_ONLY.has(word)) return 'past';
    if (V3_ONLY.has(word)) return 'participle';
  }

  if (word.length > 4 && word.endsWith('ing')) return 'ing';
  if (looksLikeRegularPast(word)) return 'past-or-participle';
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 2) {
    // Лема відмінна від слова означає, що теґер зняв закінчення: scales → scale.
    // Без леми покладаємось на саме закінчення — краще, ніж нічого.
    if (lemma === undefined || lemma !== word) return 's';
  }
  return 'base';
}

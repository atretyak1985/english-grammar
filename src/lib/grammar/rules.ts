import type { TenseKey } from '@/types/content';

import { MODALS, PARTICIPLE_LIKE, hasForm, isBaseHomograph, verbForm, type VerbForm } from './morphology';
import type { TaggedWord } from './tagger';
import type { VerbGroup } from './verb-groups';

/**
 * Правила часів над ФОРМАМИ дієслів, а не над літерами. Кожне правило — це
 * послідовність умов на ланцюжок дієслів групи (`verb-groups.ts`): «had +
 * [been] + V3» замість «had + будь-яке слово». Порядок — від довшого до
 * коротшого, перше збіжне виграє, як і в `findMatches`: інакше «will have
 * finished» розпадалося б на Future Simple плюс окреме дієслово.
 *
 * `tense: null` — вердикт «це не фінітна форма»: інфінітив, дієприкметник без
 * допоміжного, самотнє модальне. Такі групи повертаються як `skipped`, щоб
 * наступний шар знав, що слово розглянуто й відкинуто свідомо, а не пропущено.
 */

/** Номер набору правил. Входить у результат: зміна правил робить старі збіги неспівставними. */
export const RULES_VERSION = 1;

export type RuleTopic = 'past-tenses' | 'present-tenses' | 'future-tenses';

/**
 * Одна умова на слово ланцюжка. Умови всередині кроку поєднуються «і»;
 * значення в масивах — «або». Порожній крок збігається з будь-яким словом.
 */
export interface Step {
  /** Леми від теґера (після нормалізації апострофа). */
  lemma?: readonly string[];
  /** Поверхнева форма — там, де лема wink не надійна: 's, 'd, going. */
  word?: readonly string[];
  form?: readonly VerbForm[];
  /** Крок можна пропустити. */
  optional?: true;
}

export interface GrammarRule {
  /** 'pp.had-v3', 'ps.did-v1', 'skip.infinitive' … */
  id: string;
  /** null — вердикт «не фінітна форма». */
  tense: TenseKey | null;
  topic: RuleTopic;
  /** Slug розділу теми, де про цю форму розказано. */
  section: string;
  /** Послідовність умов на ланцюжок дієслів. */
  pattern: readonly Step[];
  example: string;
  note?: string;
  /**
   * Двигун сам знає, що межа тут хитка: «'d» — це і had, і would; «'s» перед
   * -ed — і has, і is. Збіг дістає `uncertain: true` — це вхід для розбору
   * моделлю (фаза 3).
   */
  uncertain?: (chain: readonly TaggedWord[]) => boolean;
}

// Допоміжні — за поверхневим словом, а не за лемою: wink лематизує «being» як
// being, а «'s» — як be і тоді, коли це has. Форми цих слів скінченні, тож
// список надійніший за лему.
const WILL: Step = { word: ['will', "'ll", 'wo', 'shall', 'sha'] };
const HAVE_PRESENT: Step = { word: ['have', "'ve", 'has'] };
const HAVE_BASE: Step = { word: ['have', "'ve"] };
const HAD: Step = { word: ['had'] };
const BE_BASE: Step = { word: ['be'] };
const BEEN: Step = { word: ['been'] };
const BEEN_OPTIONAL: Step = { word: ['been'], optional: true };
const BEING: Step = { word: ['being'] };
const BE_PRESENT: Step = { word: ['am', 'is', 'are', "'m", "'re", "'s"] };
const BE_PAST: Step = { word: ['was', 'were'] };
const DO_PRESENT: Step = { word: ['do', 'does'] };
const DID: Step = { word: ['did'] };
const V3: Step = { form: PARTICIPLE_LIKE };
const V3_OR_VING: Step = { form: [...PARTICIPLE_LIKE, 'ing'] };
const VING: Step = { form: ['ing'] };
const V1: Step = { form: ['base'] };
const GOING_TO: readonly Step[] = [{ word: ['going'] }, { word: ['to'] }, V1];

/** Модальні, після яких основа — не час, а модальність; will/shall і could — окремо. */
const SKIP_MODALS = ['would', 'should', 'might', 'must', 'can', 'ca', 'may', 'ought', "'d"];

/**
 * Основа після going to, яка так само часто буває іменником: «I am going to
 * work» двозначне навіть для людини.
 */
const NOUN_VERB_HOMOGRAPHS: ReadonlySet<string> = new Set([
  'work',
  'play',
  'walk',
  'run',
  'sleep',
  'rest',
  'fight',
  'dance',
  'practice',
  'study',
  'tea',
  'dinner',
  'bed',
  'school',
  'church',
  'town',
]);

const last = (chain: readonly TaggedWord[]): TaggedWord | undefined => chain[chain.length - 1];

const lastIsAmbiguousParticiple = (chain: readonly TaggedWord[]): boolean => {
  const word = last(chain);
  return word !== undefined && verbForm(word.lower, word.lemma) === 'past-or-participle';
};

export const RULES: readonly GrammarRule[] = [
  // ── Майбутні ────────────────────────────────────────────────────────────
  {
    id: 'fp.will-have-v3',
    tense: 'fp',
    topic: 'future-tenses',
    section: 'future-perfect',
    pattern: [WILL, HAVE_BASE, BEEN_OPTIONAL, V3_OR_VING],
    example: 'will have finished · will have been running',
    note: 'Perfect Continuous складено в той самий ключ, що й простий перфект — як у темі.',
  },
  {
    id: 'fc.will-be-ving',
    tense: 'fc',
    topic: 'future-tenses',
    section: 'future-continuous',
    pattern: [WILL, BE_BASE, VING],
    example: 'will be waiting',
  },
  {
    id: 'fs.will-v1',
    tense: 'fs',
    topic: 'future-tenses',
    section: 'will',
    pattern: [WILL, V1],
    example: "will deploy · shall be late · I'll call",
    note: '«will be ready» — це Future Simple дієслова be; Continuous потребує -ing.',
  },
  {
    id: 'fs.going-to',
    tense: 'fs',
    topic: 'future-tenses',
    section: 'going-to',
    pattern: [BE_PRESENT, ...GOING_TO],
    example: 'is going to resign',
    uncertain: (chain) => NOUN_VERB_HOMOGRAPHS.has(last(chain)?.lower ?? ''),
  },
  {
    id: 'pc.was-going-to',
    tense: 'pc',
    topic: 'future-tenses',
    section: 'going-to',
    pattern: [BE_PAST, ...GOING_TO],
    example: 'was going to happen',
    note: 'Майбутнє в минулому — розділ ④ теми going to; за формою це Past Continuous.',
    uncertain: (chain) => NOUN_VERB_HOMOGRAPHS.has(last(chain)?.lower ?? ''),
  },

  // ── Перфекти ────────────────────────────────────────────────────────────
  {
    id: 'pp.had-v3',
    tense: 'pp',
    topic: 'past-tenses',
    section: 'past-perfect',
    pattern: [HAD, BEEN_OPTIONAL, V3_OR_VING],
    example: 'had seen · had not been working',
  },
  {
    id: "pp.'d-v3",
    tense: 'pp',
    topic: 'past-tenses',
    section: 'past-perfect',
    pattern: [{ word: ["'d"] }, BEEN_OPTIONAL, V3_OR_VING],
    example: "he'd finished",
    note: "«'d» — це і had, і would; перед V3 читається як had, але межа хитка.",
    uncertain: () => true,
  },
  {
    id: 'prp.have-v3',
    tense: 'prp',
    topic: 'present-tenses',
    section: 'present-perfect',
    pattern: [HAVE_PRESENT, BEEN_OPTIONAL, V3_OR_VING],
    example: 'have finished · has been working',
  },
  {
    id: "prp.'s-v3",
    tense: 'prp',
    topic: 'present-tenses',
    section: 'present-perfect',
    pattern: [{ word: ["'s"] }, BEEN_OPTIONAL, V3],
    example: "he's gone",
    note: "«'s» перед третьою формою — це has. Перед словом, що буває й прикметником («he's finished»), — під сумнівом.",
    uncertain: lastIsAmbiguousParticiple,
  },
  {
    id: "prp.'s-been-ving",
    tense: 'prp',
    topic: 'present-tenses',
    section: 'present-perfect',
    pattern: [{ word: ["'s"] }, BEEN, VING],
    example: "she's been working",
  },

  // ── Тривалі ─────────────────────────────────────────────────────────────
  {
    id: 'pc.was-ving',
    tense: 'pc',
    topic: 'past-tenses',
    section: 'past-continuous',
    pattern: [BE_PAST, VING],
    example: 'was reading',
  },
  {
    id: 'prc.be-ving',
    tense: 'prc',
    topic: 'present-tenses',
    section: 'present-continuous',
    pattern: [BE_PRESENT, VING],
    example: "am reviewing · she's working",
  },

  // ── Пасив: be + V3 ─────────────────────────────────────────────────────
  // Час пасиву — час його be: «was called» це Past Simple, «is made up» —
  // Present Simple. Ключі ті самі, що й в активі: тема окремого пасиву не має,
  // а підсвітка не повинна мовчати на половині дієслів оповіді.
  {
    id: 'pc.was-being-v3',
    tense: 'pc',
    topic: 'past-tenses',
    section: 'past-continuous',
    pattern: [BE_PAST, BEING, V3],
    example: 'was being paid',
  },
  {
    id: 'prc.be-being-v3',
    tense: 'prc',
    topic: 'present-tenses',
    section: 'present-continuous',
    pattern: [BE_PRESENT, BEING, V3],
    example: 'is being built',
  },
  {
    id: 'ps.was-v3',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [BE_PAST, V3],
    example: 'was called · were gone',
  },
  {
    id: 'prs.be-v3',
    tense: 'prs',
    topic: 'present-tenses',
    section: 'present-simple',
    pattern: [BE_PRESENT, V3],
    example: 'is made up of sobs',
    uncertain: (chain) => chain[0]?.lower === "'s",
  },
  {
    id: 'fs.will-be-v3',
    tense: 'fs',
    topic: 'future-tenses',
    section: 'will',
    pattern: [WILL, BE_BASE, V3],
    example: 'will be given',
  },

  // ── Прості з допоміжним ─────────────────────────────────────────────────
  {
    id: 'ps.did-v1',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [DID, V1],
    example: "didn't know · nor did Alice think",
  },
  {
    id: 'prs.do-v1',
    tense: 'prs',
    topic: 'present-tenses',
    section: 'present-simple',
    pattern: [DO_PRESENT, V1],
    example: "doesn't know · Do cats eat bats?",
  },
  {
    id: 'ps.modal-past',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [{ word: ['could'] }, V1],
    example: "couldn't answer",
    note: 'could + V1 — минуле від can; за рішенням власника це Past Simple, а не пропуск.',
  },

  // ── Лексичні be і have ──────────────────────────────────────────────────
  {
    id: 'ps.was-lexical',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [BE_PAST],
    example: 'was very deep · there were no mice',
  },
  {
    id: 'prs.be-lexical',
    tense: 'prs',
    topic: 'present-tenses',
    section: 'present-simple',
    pattern: [BE_PRESENT],
    example: "is this New Zealand · that's very like a mouse",
    uncertain: (chain) => chain[0]?.lower === "'s",
  },
  {
    id: 'ps.had-lexical',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [HAD],
    example: 'had no idea · had lunch',
  },
  {
    id: 'prs.have-lexical',
    tense: 'prs',
    topic: 'present-tenses',
    section: 'present-simple',
    pattern: [HAVE_PRESENT],
    example: 'has two reports',
  },

  // ── Самотнє дієслово ────────────────────────────────────────────────────
  {
    id: 'ps.v2',
    tense: 'ps',
    topic: 'past-tenses',
    section: 'past-simple',
    pattern: [{ form: ['past', 'past-or-participle'] }],
    example: 'went · looked · hurried',
    note: 'V2 = V3 без допоміжного читається як Past Simple: дієприкметник без допоміжного в оповіді рідкість. Омограф основи («put», «read») — під сумнівом.',
    uncertain: (chain) => {
      const word = chain[0];
      return word !== undefined && isBaseHomograph(word.lower, word.lemma);
    },
  },
  {
    id: 'prs.v1',
    tense: 'prs',
    topic: 'present-tenses',
    section: 'present-simple',
    pattern: [{ form: ['base', 's'] }],
    example: 'think · scales · people that walk',
    note: 'Основа після модального чи «to» сюди не доходить — її раніше забирає skip.infinitive.',
    uncertain: (chain) => {
      const word = chain[0];
      return word !== undefined && isBaseHomograph(word.lower, word.lemma);
    },
  },

  // ── Не фінітні форми ────────────────────────────────────────────────────
  {
    id: 'skip.infinitive',
    tense: null,
    topic: 'future-tenses',
    section: 'will',
    pattern: [{ word: SKIP_MODALS }, {}, { optional: true }, { optional: true }],
    example: 'to deploy · would be worth · made her feel · might catch',
    note: 'Основа після «to», після модального (крім will/shall/could) чи після каузатива з додатком.',
  },
  {
    id: 'skip.participle',
    tense: null,
    topic: 'past-tenses',
    section: 'past-perfect',
    pattern: [{ form: ['ing', 'participle'] }, { optional: true }, { optional: true }],
    example: 'burning with curiosity · written up · having finished',
  },
  {
    id: 'skip.modal',
    tense: null,
    topic: 'future-tenses',
    section: 'will',
    pattern: [{ word: [...SKIP_MODALS, 'could', 'will', "'ll", 'wo', 'shall', 'sha'] }],
    example: 'as well as she could',
  },
  {
    id: 'skip.unknown',
    tense: null,
    topic: 'past-tenses',
    section: 'decision',
    pattern: [],
    example: 'ланцюжок, що не підійшов під жодне правило',
    note: 'Запобіжник: групу не можна мовчки загубити, навіть якщо форми в ній не склалися.',
  },
];

export const RULE_BY_ID: ReadonlyMap<string, GrammarRule> = new Map(RULES.map((rule) => [rule.id, rule]));

function stepMatches(step: Step, word: TaggedWord): boolean {
  if (step.lemma && !step.lemma.includes(word.lemma)) return false;
  if (step.word && !step.word.includes(word.lower)) return false;
  // Модальне не має форм: «could» — не основа, і крок «V1» його не приймає.
  // Інакше самотнє «as well as she could» ставало б Present Simple.
  if (step.form && !step.word && !step.lemma && MODALS.has(word.lower)) return false;
  if (step.form && !step.form.some((form) => hasForm(word.lower, word.lemma, form))) return false;
  return true;
}

/**
 * Шаблон мусить покрити ланцюжок ЦІЛКОМ: «had + been» без третього слова —
 * це не Past Perfect Continuous без дієслова, а перфект від be, і його ловить
 * той самий шаблон із пропущеним необов'язковим кроком. Тому — з поверненням.
 */
function patternMatches(pattern: readonly Step[], chain: readonly TaggedWord[], s = 0, c = 0): boolean {
  if (s === pattern.length) return c === chain.length;
  const step = pattern[s];
  if (!step) return false;
  const word = chain[c];
  if (word && stepMatches(step, word) && patternMatches(pattern, chain, s + 1, c + 1)) return true;
  return step.optional === true && patternMatches(pattern, chain, s + 1, c);
}

export interface Verdict {
  rule: GrammarRule;
  uncertain: boolean;
}

/**
 * Перше збіжне правило для групи. Інфінітив вирішується до правил: «to have
 * wondered» за формами — чистий Present Perfect, і лише «to» перед ним каже,
 * що часу тут немає.
 */
export function judge(group: VerbGroup): Verdict {
  const chain = group.chain;
  const fallback = RULE_BY_ID.get('skip.unknown');
  if (!fallback) throw new Error('skip.unknown must exist');

  if (group.infinitive) {
    const rule = RULE_BY_ID.get('skip.infinitive') ?? fallback;
    return { rule, uncertain: false };
  }

  for (const rule of RULES) {
    if (rule.id === 'skip.unknown') continue;
    if (!patternMatches(rule.pattern, chain)) continue;
    const uncertain = group.recovered || (rule.uncertain?.(chain) ?? false);
    return { rule, uncertain };
  }
  return { rule: fallback, uncertain: false };
}

import type { TenseKey } from '@/types/content';

/**
 * Картки правил двигуна для КЛІЄНТА: назва конструкції, формула і розділ
 * теорії, куди веде пояснення. Це відповідь картки слова на «чому це Past
 * Perfect» — рядок «Past Perfect · had + V3» з посиланням у тему.
 *
 * Модуль навмисно не імпортує `rules.ts`: той тягне морфологію з таблицями
 * форм, а цей мусить лишатися легким і безпечним для клієнтського бандла.
 * Синхронність із правилами тримає тест (`cards.test.ts`): кожне правило з
 * часом має картку, кожна картка — живе правило й реальний розділ теорії.
 */
export interface RuleCard {
  tense: TenseKey;
  /** Формула конструкції — те, що стоїть у картці після назви часу: «had + V3». */
  formula: string;
  topic: 'past-tenses' | 'present-tenses' | 'future-tenses';
  section: string;
  /** Застереження до формули, якщо конструкція цього потребує. */
  note?: string;
}

export const RULE_CARDS: Record<string, RuleCard> = {
  // ── Майбутні ──────────────────────────────────────────────────────────────
  'fp.will-have-v3': {
    tense: 'fp',
    formula: 'will + have + V3',
    topic: 'future-tenses',
    section: 'future-perfect',
  },
  'fc.will-be-ving': {
    tense: 'fc',
    formula: 'will + be + V-ing',
    topic: 'future-tenses',
    section: 'future-continuous',
  },
  'fs.will-v1': {
    tense: 'fs',
    formula: 'will + V1',
    topic: 'future-tenses',
    section: 'will',
  },
  'fs.going-to': {
    tense: 'fs',
    formula: 'am/is/are + going to + V1',
    topic: 'future-tenses',
    section: 'going-to',
  },
  'pc.was-going-to': {
    tense: 'pc',
    formula: 'was/were + going to + V1',
    topic: 'future-tenses',
    section: 'going-to',
    note: 'Майбутнє в минулому: за формою Past Continuous, за змістом — план, що дивиться вперед.',
  },

  // ── Перфекти ──────────────────────────────────────────────────────────────
  'pp.had-v3': {
    tense: 'pp',
    formula: 'had + V3',
    topic: 'past-tenses',
    section: 'past-perfect',
  },
  "pp.'d-v3": {
    tense: 'pp',
    formula: "'d (= had) + V3",
    topic: 'past-tenses',
    section: 'past-perfect',
    note: "«'d» — це і had, і would; перед V3 читається як had.",
  },
  'prp.have-v3': {
    tense: 'prp',
    formula: 'have/has + V3',
    topic: 'present-tenses',
    section: 'present-perfect',
  },
  "prp.'s-v3": {
    tense: 'prp',
    formula: "'s (= has) + V3",
    topic: 'present-tenses',
    section: 'present-perfect',
    note: "«'s» перед третьою формою — це has.",
  },
  "prp.'s-been-ving": {
    tense: 'prp',
    formula: "'s been + V-ing",
    topic: 'present-tenses',
    section: 'present-perfect',
  },

  // ── Тривалі ───────────────────────────────────────────────────────────────
  'pc.was-ving': {
    tense: 'pc',
    formula: 'was/were + V-ing',
    topic: 'past-tenses',
    section: 'past-continuous',
  },
  'prc.be-ving': {
    tense: 'prc',
    formula: 'am/is/are + V-ing',
    topic: 'present-tenses',
    section: 'present-continuous',
  },

  // ── Пасив: час пасиву — час його be ──────────────────────────────────────
  'pc.was-being-v3': {
    tense: 'pc',
    formula: 'was/were + being + V3',
    topic: 'past-tenses',
    section: 'past-continuous',
    note: 'Пасив: час визначає being, а V3 називає дію.',
  },
  'prc.be-being-v3': {
    tense: 'prc',
    formula: 'am/is/are + being + V3',
    topic: 'present-tenses',
    section: 'present-continuous',
    note: 'Пасив: час визначає being, а V3 називає дію.',
  },
  'ps.was-v3': {
    tense: 'ps',
    formula: 'was/were + V3',
    topic: 'past-tenses',
    section: 'past-simple',
    note: 'Пасив: «was called» — минулий простий дієслова be.',
  },
  'prs.be-v3': {
    tense: 'prs',
    formula: 'am/is/are + V3',
    topic: 'present-tenses',
    section: 'present-simple',
    note: 'Пасив: «is made» — теперішній простий дієслова be.',
  },
  'fs.will-be-v3': {
    tense: 'fs',
    formula: 'will + be + V3',
    topic: 'future-tenses',
    section: 'will',
    note: 'Пасив: «will be given» — майбутній простий дієслова be.',
  },

  // ── Прості з допоміжним ───────────────────────────────────────────────────
  'ps.did-v1': {
    tense: 'ps',
    formula: 'did + V1',
    topic: 'past-tenses',
    section: 'past-simple',
    note: 'Минулий час забирає собі did — смислове дієслово повертається до основи.',
  },
  'prs.do-v1': {
    tense: 'prs',
    formula: 'do/does + V1',
    topic: 'present-tenses',
    section: 'present-simple',
  },
  'ps.modal-past': {
    tense: 'ps',
    formula: 'could + V1',
    topic: 'past-tenses',
    section: 'past-simple',
    note: 'could — минуле від can.',
  },

  // ── Лексичні be і have ────────────────────────────────────────────────────
  'ps.was-lexical': {
    tense: 'ps',
    formula: 'was/were',
    topic: 'past-tenses',
    section: 'past-simple',
  },
  'prs.be-lexical': {
    tense: 'prs',
    formula: 'am/is/are',
    topic: 'present-tenses',
    section: 'present-simple',
  },
  'ps.had-lexical': {
    tense: 'ps',
    formula: 'had + додаток',
    topic: 'past-tenses',
    section: 'past-simple',
    note: 'Лексичне have: «had lunch» — не перфект, бо далі не V3.',
  },
  'prs.have-lexical': {
    tense: 'prs',
    formula: 'have/has + додаток',
    topic: 'present-tenses',
    section: 'present-simple',
    note: 'Лексичне have: «has two reports» — не перфект, бо далі не V3.',
  },

  // ── Самотнє дієслово ──────────────────────────────────────────────────────
  'ps.v2': {
    tense: 'ps',
    formula: 'V2',
    topic: 'past-tenses',
    section: 'past-simple',
  },
  'prs.v1': {
    tense: 'prs',
    formula: 'V1 / V-s',
    topic: 'present-tenses',
    section: 'present-simple',
  },
};

/** Посилання в розділ теорії, який пояснює правило. */
export function theoryHref(card: RuleCard): string {
  return `/topics/${card.topic}/${card.section}`;
}

/* ---------- формули розділів теорії ---------- */

/** Шматок рядка формули: текст із роллю або без неї. Ролі — ті самі, що K/Neg/Q у блоках теорії. */
export type FormulaPart = string | { role: 'key' | 'neg' | 'q'; text: string };

export interface FormulaLineData {
  sign?: '+' | '−' | '?';
  parts: FormulaPart[];
  comment?: string;
}

export interface TenseFormulaData {
  lines: FormulaLineData[];
  note?: string;
}

/**
 * Рядки `<Formula>` розділів теорії — ДАНИМИ, поруч із картками правил, а не
 * JSX у MDX: теорія і підсвітка читають ту саму таблицю, і формула, яку бачить
 * читач у темі, за побудовою та сама, що й у картці слова. Поки що охоплені
 * минулі часи; теперішні/майбутні переїдуть сюди, коли їхні розділи
 * підключаться до `<FormulaOf>`.
 */
export const TENSE_FORMULAS: Partial<Record<TenseKey, TenseFormulaData>> = {
  ps: {
    lines: [
      {
        sign: '+',
        parts: ['I / you / he / she / it / we / they ', { role: 'key', text: '+ V2' }],
        comment: 'worked, went, built — 2-га форма',
      },
      {
        sign: '−',
        parts: ['Підмет ', { role: 'neg', text: "+ did not (didn't) + V1" }],
        comment: "didn't work, didn't go — 1-ша форма!",
      },
      {
        sign: '?',
        parts: [{ role: 'q', text: 'Did' }, ' + підмет ', { role: 'q', text: '+ V1' }, ' … ?'],
        comment: 'Did you deploy? — НЕ «Did you deployed?»',
      },
      {
        sign: '?',
        parts: ['Wh- + ', { role: 'q', text: 'did' }, ' + підмет ', { role: 'q', text: '+ V1' }, ' … ?'],
        comment: 'Where did you go? What did he say?',
      },
    ],
    note: "Короткі відповіді: Yes, I did. / No, I didn't.",
  },
  pc: {
    lines: [
      {
        sign: '+',
        parts: [
          'I / he / she / it ',
          { role: 'key', text: 'was' },
          ' + V-ing · you / we / they ',
          { role: 'key', text: 'were' },
          ' + V-ing',
        ],
      },
      {
        sign: '−',
        parts: ['Підмет ', { role: 'neg', text: "+ wasn't / weren't + V-ing" }],
      },
      {
        sign: '?',
        parts: [{ role: 'q', text: 'Was / Were' }, ' + підмет + V-ing … ?'],
        comment: 'тут НЕМАЄ did — was/were уже допоміжні',
      },
      {
        sign: '?',
        parts: ['What ', { role: 'q', text: 'were' }, ' you ', { role: 'q', text: 'doing' }, ' at 9 p.m.?'],
        comment: 'класичне питання про момент',
      },
    ],
    note: "Короткі відповіді: Yes, I was. / No, I wasn't.",
  },
  pp: {
    lines: [
      {
        sign: '+',
        parts: ['Підмет ', { role: 'key', text: '+ had + V3' }],
        comment: 'I had finished, she had gone, they had built',
      },
      {
        sign: '−',
        parts: ['Підмет ', { role: 'neg', text: "+ hadn't + V3" }],
        comment: "I hadn't seen it before",
      },
      {
        sign: '?',
        parts: [{ role: 'q', text: 'Had' }, ' + підмет ', { role: 'q', text: '+ V3' }, ' … ?'],
        comment: 'Had you tested it?',
      },
    ],
    note: "Скорочення: I'd / you'd / he'd = I had (або I would — зрозуміло з контексту). Короткі відповіді: Yes, I had. / No, I hadn't.",
  },
};

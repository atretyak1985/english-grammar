import type { ReactNode } from 'react';

/** Рівень складності теми — впливає на колір точки в сайдбарі й смужки на картці. */
export type Level = 'a2' | 'b1' | 'b2' | 'c1';

/**
 * Девʼять конструкцій, які застосунок розрізняє наскрізь: теорія, підсвітка,
 * схеми. Це рівно матриця 3 × 3 — три види на три часи, — і саме тому вони
 * розмічені двома осями, а не одним списком.
 *
 * Колір означає ВИД (Simple, Continuous, Perfect). Стиль підкреслення означає
 * ЧАС: минулий — суцільне, теперішній — штрихове, майбутній — подвійне. Тому
 * синій — це «простий» і в `ps`, і в `prs`, і в `fs`, а фіолетовий — «перфект»
 * у всіх трьох часах.
 *
 * Практична вигода саме там, де в темі «Теперішні часи» головна пастка:
 * Present Perfect проти Past Simple — це фіолетовий проти синього, і різниця
 * видна ще до того, як читач навів курсор на підпис.
 */
export const TENSE_KEYS = [
  'ps',
  'pc',
  'pp',
  'prs',
  'prc',
  'prp',
  'fs',
  'fc',
  'fp',
] as const;

export type TenseKey = (typeof TENSE_KEYS)[number];

/**
 * Чи це взагалі відомий ключ. Потрібно у трьох місцях — схема інструмента для
 * моделі, перевірка її відповіді й читання кешу з бази, — і саме тому живе
 * тут одне. Три копії списку розійшлися б рівно на наступній конструкції:
 * забути оновити перевірку кешу означало б мовчки відкидати цілий розібраний
 * текст і платити за нього повторно.
 */
export function isTenseKey(value: unknown): value is TenseKey {
  return typeof value === 'string' && (TENSE_KEYS as readonly string[]).includes(value);
}

/** Вид конструкції — задає колір. */
export type Aspect = 'simple' | 'continuous' | 'perfect';

/** Час конструкції — задає стиль підкреслення. */
export type TenseTime = 'past' | 'present' | 'future';

export const TENSE_ASPECT: Record<TenseKey, Aspect> = {
  ps: 'simple',
  pc: 'continuous',
  pp: 'perfect',
  prs: 'simple',
  prc: 'continuous',
  prp: 'perfect',
  fs: 'simple',
  fc: 'continuous',
  fp: 'perfect',
};

export const TENSE_TIME: Record<TenseKey, TenseTime> = {
  ps: 'past',
  pc: 'past',
  pp: 'past',
  prs: 'present',
  prc: 'present',
  prp: 'present',
  fs: 'future',
  fc: 'future',
  fp: 'future',
};

/**
 * Класи кольору за видом. Токени лишилися з іменами `--ps` / `--pc` / `--pp`
 * з часів, коли застосунок знав лише минулі часи; тепер вони означають вид, а
 * не час. Перейменування зачепило б тему Tailwind, обидві теми оформлення і
 * всі схеми, не змінивши ані пікселя — тому лишаємо імена й фіксуємо значення
 * тут. Класи мусять бути літералами: Tailwind збирає їх статичним пошуком.
 */
export const ASPECT_TEXT: Record<Aspect, string> = {
  simple: 'text-ps',
  continuous: 'text-pc',
  perfect: 'text-pp',
};

/**
 * Як конструкція виглядає підсвіченою в тексті. Живе тут, а не в екрані
 * аналізатора, бо тепер цим користуються двоє: сам аналізатор і картка-легенда
 * у темі, яка цей код і пояснює. Дві копії розійшлися б рівно тоді, коли
 * легенда почала б обіцяти не те, що читач бачить.
 */
export const TENSE_HIGHLIGHT: Record<TenseKey, string> = {
  ps: 'text-ps bg-ps-bg border-b-2 border-ps',
  pc: 'text-pc bg-pc-bg border-b-2 border-pc',
  pp: 'text-pp bg-pp-bg border-b-2 border-pp',
  prs: 'text-ps bg-ps-bg border-b-2 border-dashed border-ps',
  prc: 'text-pc bg-pc-bg border-b-2 border-dashed border-pc',
  prp: 'text-pp bg-pp-bg border-b-2 border-dashed border-pp',
  // Майбутні йдуть підкресленням, а не рамкою: `border-style: double` на
  // рядковому елементі не роздільна — на трьох пікселях браузер малює її
  // суцільною, і майбутнє ставало б неможливо відрізнити від минулого.
  // Заміряно на скріншоті, а не припущено.
  fs: 'text-ps bg-ps-bg underline decoration-double decoration-1 underline-offset-[3px]',
  fc: 'text-pc bg-pc-bg underline decoration-double decoration-1 underline-offset-[3px]',
  fp: 'text-pp bg-pp-bg underline decoration-double decoration-1 underline-offset-[3px]',
};

/** Розділ усередині теми: власна сторінка, рядок у сайдбарі та якір у повному вигляді. */
export interface TopicSection {
  /** id елемента <Section> — якір на сторінці «все одним полотном» і ключ прогресу */
  id: string;
  /** Латинський слаг — сегмент URL розділу: /topics/<тема>/<slug> */
  slug: string;
  /** Номер, як у тексті теми */
  n: number;
  title: string;
  /** Коротка назва для сайдбара, якщо повна занадто довга */
  short?: string;
  /** 1–2 речення на картці розділу в змісті теми */
  lede?: string;
}

export interface TopicMeta {
  slug: string;
  /** Назва в списках і сайдбарі */
  title: string;
  /** 1–2 речення на картці теми */
  desc: string;
  level: Level;
  tags: string[];
  ready: boolean;
  sections: TopicSection[];
  /** SEO-заголовок сторінки */
  pageTitle?: string;
  /** SEO-опис сторінки */
  description?: string;
  /** Надпис над заголовком у герой-блоці теми */
  kicker?: string;
  /** Заголовок у герой-блоці (може відрізнятися від назви в списку) */
  heroTitle?: string;
  /** Абзац під заголовком */
  heroLede?: string;
  heroChips?: string[];
  /** Слова з теми для блоку «Слова з цієї теми» на сторінці теми (CONCEPT 5.2) */
  words?: string[];
  /** Головна пастка теми — картка збоку на сторінці розділу */
  trap?: TopicTrap;
}

/**
 * Одна помилка, яку українці роблять у цій темі найчастіше.
 *
 * Це не витяг із розділу помилок, а його вістря: людина бачить картку збоку
 * від будь-якого розділу, тому вона мусить читатися сама по собі, без
 * контексту навколо. Текст сталий і живе в описі теми, а не в MDX, — інакше
 * його довелося б дублювати на кожній сторінці розділу.
 */
export interface TopicTrap {
  /** Помилкова фраза — те, що людина впізнає за собою */
  quote: string;
  /** Чому так не можна і що замість того */
  body: string;
  /** Слово всередині `body`, на якому тримається пояснення — виділяється жирним */
  strong?: string;
}

/** Питання тесту. Формат перенесено з window.QUIZ_QUESTIONS без втрат. */
export interface QuizQuestion {
  /** Текст питання, ___ на місці пропуску */
  q: ReactNode;
  /** Переклад-підказка українською */
  hint?: ReactNode;
  options: string[];
  /** Індекс правильного варіанта, з нуля */
  answer: number;
  /** Пояснення «чому саме так» — показується після відповіді */
  why: ReactNode;
}

/** Вправа з кнопкою «Відповідь». */
export interface DrillItem {
  /** Завдання: українське речення, речення з дужками або речення з помилкою */
  q: ReactNode;
  /** Правильна відповідь */
  a: ReactNode;
  /** Інші переклади, які теж вважаємо збігом — правильний завжди не один */
  accepted?: string[];
  /** Пояснення під відповіддю */
  hint?: ReactNode;
}

/** Блок вправ — свій заголовок і своя кнопка «показати всі». */
export interface DrillBlock {
  id: string;
  title: string;
  lede?: string;
  items: DrillItem[];
}

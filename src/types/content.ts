import type { ReactNode } from 'react';

/** Рівень складності теми — впливає на колір точки в сайдбарі й смужки на картці. */
export type Level = 'a2' | 'b1' | 'b2' | 'c1';

/** Три часи, які застосунок розрізняє кольором наскрізь: теорія, підсвітка, схеми. */
export type TenseKey = 'ps' | 'pc' | 'pp';

/** Розділ усередині теми: рядок у сайдбарі та якір у контенті. */
export interface TopicSection {
  /** id елемента <Section> у MDX — за ним працює скрол і позначка «прочитано» */
  id: string;
  /** Номер, як у тексті теми */
  n: number;
  title: string;
  /** Коротка назва для сайдбара, якщо повна занадто довга */
  short?: string;
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

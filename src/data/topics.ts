import { meta as articles } from '@/content/topics/articles/meta';
import { meta as pastTenses } from '@/content/topics/past-tenses/meta';
import { meta as futureTenses } from '@/content/topics/future-tenses/meta';
import { meta as presentTenses } from '@/content/topics/present-tenses/meta';
import type { Level, TopicMeta } from '@/types/content';

/* ============================================================
   СПИСОК ТЕМ САЙТУ
   ------------------------------------------------------------
   Готова тема живе у src/content/topics/<slug>/ і сама описує себе
   у meta.ts — тут її треба лише додати в масив.
   Заплановані теми описуються прямо тут, поки немає контенту.
   ============================================================ */

function planned(topic: Omit<TopicMeta, 'sections' | 'ready' | 'tags'>): TopicMeta {
  return { ...topic, sections: [], ready: false, tags: ['у планах'] };
}

export const TOPICS: readonly TopicMeta[] = [
  pastTenses,
  presentTenses,
  futureTenses,
  articles,

  planned({
    slug: 'conditionals',
    title: 'Умовні речення',
    desc: 'Zero, First, Second, Third conditional і змішані. Коли would, коли had.',
    level: 'b2',
  }),
  planned({
    slug: 'modals',
    title: 'Модальні дієслова',
    desc: 'can / could / may / must / should / have to. Ввічливість, ймовірність, обовʼязок.',
    level: 'b1',
  }),
  planned({
    slug: 'phrasal-verbs',
    title: 'Фразові дієслова',
    desc: 'look into, put off, sort out, run over. Те, що відрізняє живу мову від перекладеного документа.',
    level: 'b2',
  }),
  planned({
    slug: 'prepositions',
    title: 'Прийменники',
    desc: 'in / on / at, by / until, for / since / during. Найдрібніші слова з найбільшою кількістю помилок.',
    level: 'b1',
  }),
  planned({
    slug: 'passive',
    title: 'Пасивний стан',
    desc: 'The bug was fixed. Коли пасив доречний, а коли робить текст важким.',
    level: 'b2',
  }),
];

export const READY_TOPICS = TOPICS.filter((topic) => topic.ready);

export function topicBySlug(slug: string): TopicMeta | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

/** Колір точки рівня в сайдбарі та смужки на картці. */
export const LEVEL_COLOR: Record<Level, string> = {
  a2: 'bg-ok',
  b1: 'bg-ps',
  b2: 'bg-pc',
  c1: 'bg-pp',
};

export const LEVEL_BORDER: Record<Level, string> = {
  a2: 'border-t-ok',
  b1: 'border-t-ps',
  b2: 'border-t-pc',
  c1: 'border-t-pp',
};

export const LEVEL_LABEL: Record<Level, string> = {
  a2: 'A2',
  b1: 'B1',
  b2: 'B2',
  c1: 'C1',
};

import { meta as articles } from '@/content/topics/articles/meta';
import { meta as conditionals } from '@/content/topics/conditionals/meta';
import { meta as modals } from '@/content/topics/modals/meta';
import { meta as passive } from '@/content/topics/passive/meta';
import { meta as pastTenses } from '@/content/topics/past-tenses/meta';
import { meta as phrasalVerbs } from '@/content/topics/phrasal-verbs/meta';
import { meta as futureTenses } from '@/content/topics/future-tenses/meta';
import { meta as presentTenses } from '@/content/topics/present-tenses/meta';
import { meta as sentenceStructure } from '@/content/topics/sentence-structure/meta';
import { meta as prepositions } from '@/content/topics/prepositions/meta';
import { meta as reportedSpeech } from '@/content/topics/reported-speech/meta';
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
  sentenceStructure,
  articles,
  conditionals,
  modals,
  prepositions,
  phrasalVerbs,
  passive,
  reportedSpeech,

  planned({
    slug: 'quantifiers',
    title: 'Злічуване й незлічуване',
    desc: 'much / many, few / little, some / any. Чому information без -s і що робити з money.',
    level: 'a2',
    image: '/topics/quantifiers.jpg',
    imageAlt:
      'Терези: рука кладе монети (many, few) проти глека, з якого сиплеться пісок money та information (much, little)',
  }),
  planned({
    slug: 'gerund-infinitive',
    title: 'Герундій та інфінітив',
    desc: 'enjoy doing, want to do, stop doing проти stop to do. Яке дієслово тягне -ing, а яке — to.',
    level: 'b1',
    image: '/topics/gerund-infinitive.jpg',
    imageAlt: 'Розвилка за словом stop: бурштинова петля -ing (процес) і синя стрілка to (намір)',
  }),
  planned({
    slug: 'comparison',
    title: 'Ступені порівняння',
    desc: 'bigger, more interesting, as…as, the…the. І чому more better не буває.',
    level: 'a2',
    image: '/topics/comparison.jpg',
    imageAlt:
      'Сходинки big → bigger → the biggest, кран піднімає блок more, збоку перекреслене more better',
  }),
  planned({
    slug: 'pronouns',
    title: 'Займенники',
    desc: "its / it's, my / mine, myself. Дрібні слова, які виказують рівень швидше за часи.",
    level: 'a2',
    image: '/topics/pronouns.jpg',
    imageAlt:
      'Кільце з ключами it’s, my, mine, myself і лупа, що збільшує апостроф; позаду двері з замковою щілиною',
  }),
  planned({
    slug: 'word-formation',
    title: 'Словотвір',
    desc: 'un-, re-, -less, -ful, -tion. Як з одного кореня зібрати пів словника — і чому bored ≠ boring.',
    level: 'b1',
    image: '/topics/word-formation.jpg',
    imageAlt:
      'Цеглинка-корінь build, до якої клацають un-, re-, -less, -ful, -tion; унизу маски bored і boring',
  }),
  planned({
    slug: 'relative-clauses',
    title: 'Відносні речення',
    desc: 'who / which / that, defining і non-defining. Коли кома — стиль, а коли вона змінює зміст.',
    level: 'b2',
    image: '/topics/relative-clauses.jpg',
    imageAlt:
      'Потяг: локомотив «The train», вагон «which is fast,» (non-defining) і вантажний «that carries coal» (defining)',
  }),
  planned({
    slug: 'inversion',
    title: 'Інверсія та емфаза',
    desc: 'Not only did we…, It was John who… Як розставляти наголоси в реченні, а не звучати як підручник.',
    level: 'c1',
    image: '/topics/inversion.jpg',
    imageAlt:
      'Потяг «Sings» із вагоном «the band» і фігура, що вистрибує вперед у промінь світла — емфатична інверсія',
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

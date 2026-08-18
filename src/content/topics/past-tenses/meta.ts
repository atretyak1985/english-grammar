import type { TopicMeta } from '@/types/content';

/**
 * Опис теми: те, що потрібно сайдбару, картці на головній і <head> сторінки.
 * Розділи перелічені явно — за їхніми id працює скрол, позначка «прочитано»
 * і смужка прогресу.
 */
export const meta: TopicMeta = {
  slug: 'past-tenses',
  title: 'Минулі часи',
  desc: 'Past Simple, Past Continuous, Past Perfect (+ Perfect Continuous). Коли який вживати, як їх не плутати і чому «робив» ≠ was doing.',
  level: 'b1',
  tags: ['14 розділів', '200+ прикладів', 'тест', 'вправи'],
  ready: true,

  pageTitle: 'Минулі часи: Past Simple, Past Continuous, Past Perfect',
  description:
    'Минулі часи англійської з поясненнями українською: Past Simple, Past Continuous, Past Perfect. Правила, 200+ прикладів з перекладом, мінімальні пари, помилки українців, вправи і тест.',
  kicker: 'Повний курс · рівень A2 → C1',
  heroTitle: 'Past Simple · Past Continuous · Past Perfect',
  heroLede:
    'Понад 200 прикладів із перекладом, розбір історій речення за реченням, переклад з української, вправи з відповідями і тест. Усі пояснення — українською.',
  heroChips: [
    '📖 14 розділів',
    '✍️ 200+ прикладів з перекладом',
    '🔍 Розбір «чому саме цей час»',
    '🧩 Вправи з відповідями',
  ],

  sections: [
    { n: 1, id: 'big', title: 'Головна ідея — три фігури на лінії часу', short: 'Ідея' },
    { n: 2, id: 'simple', title: 'Past Simple — простий минулий', short: 'Past Simple' },
    { n: 3, id: 'cont', title: 'Past Continuous — минулий тривалий', short: 'Past Continuous' },
    { n: 4, id: 'perf', title: 'Past Perfect — передминулий', short: 'Past Perfect' },
    { n: 5, id: 'markers', title: 'Слова-маркери: ago, for, since, by, while', short: 'Маркери' },
    { n: 6, id: 'compare', title: 'Порівняння і мінімальні пари', short: 'Порівняння' },
    { n: 7, id: 'stories', title: 'Три історії з повним розбором', short: 'Історії' },
    { n: 8, id: 'translate', title: 'Переклад з української — 25 речень', short: 'Переклад' },
    { n: 9, id: 'traps', title: 'Десять помилок українців', short: 'Помилки' },
    { n: 10, id: 'decide', title: 'Схема вибору часу — 15 секунд', short: 'Схема' },
    { n: 11, id: 'exercises', title: 'Вправи з відповідями', short: 'Вправи' },
    { n: 12, id: 'quiz', title: 'Тест — 20 питань', short: 'Тест' },
    { n: 13, id: 'cheat', title: 'Шпаргалка', short: 'Шпаргалка' },
    { n: 14, id: 'plan', title: 'План практики на 14 днів', short: 'План' },
  ],

  /** Слова з прикладів теми — для блоку «Слова з цієї теми» (CONCEPT 5.2) */
  words: [
    'deploy',
    'migration',
    'review',
    'outage',
    'release',
    'invoice',
    'standup',
    'firmware',
    'exhausted',
    'rehearse',
    'churn',
    'spike',
    'pager',
    'hover',
  ],
};

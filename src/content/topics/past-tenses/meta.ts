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
  tags: ['15 розділів', '200+ прикладів', 'тест', 'вправи'],
  ready: true,
  image: '/topics/past-tenses.jpg',
  imageAlt:
    'Лінія часу під заголовком «Минулі часи»: бурштинова крапка Past Simple, бурштиновий відрізок Past Continuous і фіолетова стрілка назад Past Perfect',

  pageTitle: 'Минулі часи: Past Simple, Past Continuous, Past Perfect',
  description:
    'Минулі часи англійської з поясненнями українською: Past Simple, Past Continuous, Past Perfect. Правила, 200+ прикладів з перекладом, мінімальні пари, помилки українців, вправи і тест.',
  kicker: 'Повний курс · рівень A2 → C1',
  heroTitle: 'Past Simple · Past Continuous · Past Perfect',
  heroLede:
    'Понад 200 прикладів із перекладом, розбір історій речення за реченням, переклад з української, вправи з відповідями і тест. Усі пояснення — українською.',
  heroChips: [
    '📖 15 розділів',
    '✍️ 200+ прикладів з перекладом',
    '🔍 Розбір «чому саме цей час»',
    '🧩 Вправи з відповідями',
  ],

  sections: [
    {
      n: 1,
      id: 'big',
      slug: 'idea',
      title: 'Головна ідея — три фігури на лінії часу',
      short: 'Ідея',
      lede: 'Крапка, лінія і крок назад: інтуїція, з якої виростають усі правила.',
    },
    {
      n: 2,
      id: 'simple',
      slug: 'past-simple',
      title: 'Past Simple — простий минулий',
      short: 'Past Simple',
      lede: 'Основний робочий час: форма, випадки вживання, короткі відповіді.',
    },
    {
      n: 3,
      id: 'cont',
      slug: 'past-continuous',
      title: 'Past Continuous — минулий тривалий',
      short: 'Past Continuous',
      lede: 'was/were + V-ing: процес, фон, перервана дія і дієслова стану.',
    },
    {
      n: 4,
      id: 'perf',
      slug: 'past-perfect',
      title: 'Past Perfect — передминулий',
      short: 'Past Perfect',
      lede: 'had + V3: минуле в минулому, причина і коли його краще не вживати.',
    },
    {
      n: 5,
      id: 'markers',
      slug: 'markers',
      title: 'Слова-маркери: ago, for, since, by, while',
      short: 'Маркери',
      lede: 'Слова, які самі підказують час. Розбір найчастішої плутанини.',
    },
    {
      n: 6,
      id: 'compare',
      slug: 'comparison',
      title: 'Порівняння і мінімальні пари',
      short: 'Порівняння',
      lede: 'Одне речення, змінено один час — і сенс інший. Найкорисніший розділ.',
    },
    {
      n: 7,
      id: 'stories',
      slug: 'stories',
      title: 'Три історії з повним розбором',
      short: 'Історії',
      lede: 'Живий текст речення за реченням: чому саме цей час у кожному.',
    },
    {
      n: 8,
      id: 'translate',
      slug: 'translation',
      title: 'Переклад з української — 25 речень',
      short: 'Переклад',
      lede: 'Найкорисніша вправа: перекладіть, не підглядаючи у відповіді.',
    },
    {
      n: 9,
      id: 'traps',
      slug: 'mistakes',
      title: 'Десять помилок українців',
      short: 'Помилки',
      lede: 'Помилки, що йдуть від української: вид дієслова, did + V2, зайвий had.',
    },
    {
      n: 10,
      id: 'decide',
      slug: 'decision',
      title: 'Схема вибору часу — 15 секунд',
      short: 'Схема',
      lede: 'Три питання, які доводять до потрібного часу за п’ятнадцять секунд.',
    },
    {
      n: 11,
      id: 'exercises',
      slug: 'exercises',
      title: 'Вправи з відповідями',
      short: 'Вправи',
      lede: 'Розкрийте дужки, виправте помилку, поставте питання — з поясненнями.',
    },
    {
      n: 12,
      id: 'quiz',
      slug: 'quiz',
      title: 'Тест — 20 питань',
      short: 'Тест',
      lede: 'Кожна відповідь із розбором «чому». Нижче 85% — вертайтесь до теорії.',
    },
    {
      n: 13,
      id: 'history',
      slug: 'history',
      title: 'Три епохи в одному часі',
      // «Історія» сплуталося б із розділом 7 «Три історії з повним розбором»
      short: 'Походження',
      lede: 'Звідки взялися did, was + V-ing і had + V3 — і чому вони поводяться по-різному.',
    },
    {
      n: 14,
      id: 'cheat',
      slug: 'cheatsheet',
      title: 'Шпаргалка',
      short: 'Шпаргалка',
      lede: 'Усе вище стисло, однією карткою. Зробіть скріншот.',
    },
    {
      n: 15,
      id: 'plan',
      slug: 'plan',
      title: 'План практики на 14 днів',
      short: 'План',
      lede: 'По 15 хвилин на день: що саме робити кожного дня двох тижнів.',
    },
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

import type { TopicMeta } from '@/types/content';

/**
 * Опис теми: те, що потрібно сайдбару, картці на головній і <head> сторінки.
 * Розділи перелічені явно — за їхніми id працює скрол, позначка «прочитано»
 * і смужка прогресу.
 *
 * Колірні ключі читаються як вид: `fs` — Simple, `fc` — Continuous, `fp` —
 * Perfect. У розділі 5 навмисно стоять `prs` і `prc`: теперішні форми, що
 * говорять про майбутнє, мусять і виглядати теперішніми, інакше розділ
 * суперечив би сам собі.
 */
export const meta: TopicMeta = {
  slug: 'future-tenses',
  title: 'Майбутні часи',
  desc: 'will, going to, теперішні форми про майбутнє, Future Continuous і Perfect. Головна пастка українців: will на все.',
  level: 'b1',
  tags: ['19 розділів', '200+ прикладів', 'тест', 'вправи'],
  ready: true,

  pageTitle: 'Майбутні часи: will, going to, Future Continuous, Future Perfect',
  description:
    'Майбутній час англійської з поясненнями українською: will, be going to, теперішні форми про майбутнє, Future Continuous, Future Perfect і Perfect Continuous. Коли яку форму брати, 200+ прикладів з перекладом, помилки українців, вправи і тест.',
  kicker: 'Повний курс · рівень A2 → C1',
  heroTitle: 'will · going to · Future Continuous · Future Perfect',
  heroLede:
    'В англійській немає одного майбутнього часу — є кілька форм, і вибір між ними означає різні речі. Головна пастка українців — will на все — розібрана окремим розділом. Понад 200 прикладів із перекладом, вправи з відповідями і тест. Усі пояснення — українською.',
  heroChips: [
    '📖 19 розділів',
    '✍️ 200+ прикладів з перекладом',
    '🎯 will чи going to — окремий розділ',
    '🧩 Вправи з відповідями',
  ],

  sections: [
    {
      n: 1,
      id: 'big',
      slug: 'idea',
      title: 'Головна ідея — майбутнього часу в англійській немає',
      short: 'Ідея',
      lede: 'Замість одного часу — кілька форм, і кожна означає своє ставлення до події.',
    },
    {
      n: 2,
      id: 'will',
      slug: 'will',
      title: 'will — рішення, обіцянка, прогноз',
      short: 'will',
      lede: 'Найвідоміша форма і найбільш переоцінена: що вона справді означає й де її не ставлять.',
    },
    {
      n: 3,
      id: 'gonna',
      slug: 'going-to',
      title: 'be going to — намір і прогноз за ознаками',
      short: 'going to',
      lede: 'Рішення, ухвалене раніше, і передбачення з видимої причини. Плюс майбутнє в минулому.',
    },
    {
      n: 4,
      id: 'vsgoing',
      slug: 'will-vs-going-to',
      title: 'will чи going to — головна пастка',
      short: 'will чи going to',
      lede: 'Обидва перекладаються «я зроблю». Одне питання, яке вирішує все.',
    },
    {
      n: 5,
      id: 'present',
      slug: 'present-forms',
      title: 'Теперішні форми про майбутнє: розклад і домовленість',
      short: 'Теперішні форми',
      lede: 'Тут will буде помилкою, і саме на цьому мовлення українців звучить неживо.',
    },
    {
      n: 6,
      id: 'cont',
      slug: 'future-continuous',
      title: 'Future Continuous — буде відбуватися',
      short: 'Future Continuous',
      lede: 'will be + V-ing: процес у майбутній момент. І чому «буду робити» ≠ will be doing.',
    },
    {
      n: 7,
      id: 'perf',
      slug: 'future-perfect',
      title: 'Future Perfect — буде вже зроблено (+ Perfect Continuous)',
      short: 'Future Perfect',
      lede: 'will have + V3: завершиться до майбутньої точки. Час дедлайнів і звітів.',
    },
    {
      n: 8,
      id: 'markers',
      slug: 'markers',
      title: 'Слова-маркери: by, until, in, within, this time next week',
      short: 'Маркери',
      lede: 'by чи until — різниця, на якій зривають дедлайни. І як сказати «через тиждень».',
    },
    {
      n: 9,
      id: 'compare',
      slug: 'comparison',
      title: 'Порівняння і мінімальні пари',
      short: 'Порівняння',
      lede: 'Одне речення, змінено форму — і сенс інший. Найкорисніший розділ.',
    },
    {
      n: 10,
      id: 'highlight',
      slug: 'highlight',
      title: 'Як ці форми виглядають в аналізаторі',
      short: 'Підсвітка',
      lede: 'Колір означає вид, лінія — час. Одна картка на всі девʼять конструкцій сайту.',
    },
    {
      n: 11,
      id: 'stories',
      slug: 'stories',
      title: 'Три тексти з повним розбором',
      short: 'Тексти',
      lede: 'Живий текст речення за реченням: чому саме ця форма в кожному.',
    },
    {
      n: 12,
      id: 'translate',
      slug: 'translation',
      title: 'Переклад з української — 25 речень',
      short: 'Переклад',
      lede: 'Найкорисніша вправа: перекладіть, не підглядаючи у відповіді.',
    },
    {
      n: 13,
      id: 'traps',
      slug: 'mistakes',
      title: 'Десять помилок українців',
      short: 'Помилки',
      lede: 'will на все, will після if, shall із підручника 1985 року.',
    },
    {
      n: 14,
      id: 'decide',
      slug: 'decision',
      title: 'Схема вибору форми — 15 секунд',
      short: 'Схема',
      lede: 'Три питання, які доводять до потрібної форми за пʼятнадцять секунд.',
    },
    {
      n: 15,
      id: 'exercises',
      slug: 'exercises',
      title: 'Вправи з відповідями',
      short: 'Вправи',
      lede: 'Розкрийте дужки, виправте помилку, виберіть між will і going to.',
    },
    {
      n: 16,
      id: 'quiz',
      slug: 'quiz',
      title: 'Тест — 20 питань',
      short: 'Тест',
      lede: 'Кожна відповідь із розбором «чому». Нижче 85% — вертайтесь до теорії.',
    },
    {
      n: 17,
      id: 'history',
      slug: 'history',
      title: 'Чому в англійській немає майбутнього часу',
      short: 'Походження',
      lede: 'will колись означало «хотіти», shall — «бути винним». Звідси вся система.',
    },
    {
      n: 18,
      id: 'cheat',
      slug: 'cheatsheet',
      title: 'Шпаргалка',
      short: 'Шпаргалка',
      lede: 'Усе вище стисло, однією карткою. Зробіть скріншот.',
    },
    {
      n: 19,
      id: 'plan',
      slug: 'plan',
      title: 'План практики на 14 днів',
      short: 'План',
      lede: 'По 15 хвилин на день: що саме робити кожного дня двох тижнів.',
    },
  ],

  /** Слова з прикладів теми — для блоку «Слова з цієї теми» (CONCEPT 5.2) */
  words: [
    'rollout',
    'cutover',
    'freeze',
    'kickoff',
    'milestone',
    'forecast',
    'runway',
    'downtime',
    'quota',
    'renewal',
    'headcount',
    'onboarding',
    'estimate',
    'postpone',
  ],
};

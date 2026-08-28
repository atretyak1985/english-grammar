import type { TopicMeta } from '@/types/content';

/**
 * Опис теми: те, що потрібно сайдбару, картці на головній і <head> сторінки.
 * Розділи перелічені явно — за їхніми id працює скрол, позначка «прочитано»
 * і смужка прогресу.
 *
 * Колірні ключі TenseKey тут читаються як вид, а не як час: ps — Simple,
 * pc — Continuous, pp — Perfect. Тому синій, помаранчевий і фіолетовий
 * означають у теперішніх часах те саме, що й у минулих, і читач переносить
 * уже вивчену колірну звичку без переучування.
 */
export const meta: TopicMeta = {
  slug: 'present-tenses',
  title: 'Теперішні часи',
  desc: 'Present Simple, Present Continuous, Present Perfect. Головна пастка українців: Present Perfect vs Past Simple.',
  level: 'b1',
  tags: ['17 розділів', '200+ прикладів', 'тест', 'вправи'],
  ready: true,

  pageTitle: 'Теперішні часи: Present Simple, Present Continuous, Present Perfect',
  description:
    'Теперішні часи англійської з поясненнями українською: Present Simple, Present Continuous, Present Perfect і Perfect Continuous. Правила, 200+ прикладів з перекладом, розбір пастки Present Perfect vs Past Simple, помилки українців, вправи і тест.',
  kicker: 'Повний курс · рівень A2 → C1',
  heroTitle: 'Present Simple · Present Continuous · Present Perfect',
  heroLede:
    'Головна пастка українців — Present Perfect замість Past Simple — розібрана окремим розділом. Понад 200 прикладів із перекладом, розбір текстів речення за реченням, переклад з української, вправи з відповідями і тест. Усі пояснення — українською.',
  heroChips: [
    '📖 17 розділів',
    '✍️ 200+ прикладів з перекладом',
    '🎯 Perfect чи Past Simple — окремий розділ',
    '🧩 Вправи з відповідями',
  ],

  sections: [
    {
      n: 1,
      id: 'big',
      slug: 'idea',
      title: 'Головна ідея — «теперішній» не означає «зараз»',
      short: 'Ідея',
      lede: 'Три теперішні часи майже не про цю мить. Інтуїція, з якої виростають усі правила.',
    },
    {
      n: 2,
      id: 'simple',
      slug: 'present-simple',
      title: 'Present Simple — простий теперішній',
      short: 'Present Simple',
      lede: 'Те, що взагалі так є: форма, злощасне -s, do/does, шість випадків уживання.',
    },
    {
      n: 3,
      id: 'cont',
      slug: 'present-continuous',
      title: 'Present Continuous — теперішній тривалий',
      short: 'Present Continuous',
      lede: 'am/is/are + V-ing: зараз, цими днями, тимчасово — і чому дієслова стану сюди не йдуть.',
    },
    {
      n: 4,
      id: 'perf',
      slug: 'present-perfect',
      title: 'Present Perfect — теперішній перфект (+ Perfect Continuous)',
      short: 'Present Perfect',
      lede: 'have/has + V3: минула дія, яка досі має значення. Час без українського відповідника.',
    },
    {
      n: 5,
      id: 'vspast',
      slug: 'perfect-vs-past',
      title: 'Present Perfect чи Past Simple — головна пастка',
      short: 'Perfect чи Past',
      lede: 'Обидва перекладаються «я зробив». Один тест із двох слів, який вирішує все.',
    },
    {
      n: 6,
      id: 'markers',
      slug: 'markers',
      title: 'Слова-маркери: already, yet, just, still, for, since, ever',
      short: 'Маркери',
      lede: 'Маленькі слова, які самі називають час. І місце в реченні, де їх ставлять носії.',
    },
    {
      n: 7,
      id: 'compare',
      slug: 'comparison',
      title: 'Порівняння і мінімальні пари',
      short: 'Порівняння',
      lede: 'Одне речення, змінено один час — і сенс інший. Найкорисніший розділ.',
    },
    {
      n: 8,
      id: 'future',
      slug: 'future',
      title: 'Теперішній час про майбутнє',
      short: 'Про майбутнє',
      lede: 'Розклад, домовленість і що після when та if. Тут will буде помилкою.',
    },
    {
      n: 9,
      id: 'stories',
      slug: 'stories',
      title: 'Три тексти з повним розбором',
      short: 'Тексти',
      lede: 'Живий текст речення за реченням: чому саме цей час у кожному.',
    },
    {
      n: 10,
      id: 'translate',
      slug: 'translation',
      title: 'Переклад з української — 25 речень',
      short: 'Переклад',
      lede: 'Найкорисніша вправа: перекладіть, не підглядаючи у відповіді.',
    },
    {
      n: 11,
      id: 'traps',
      slug: 'mistakes',
      title: 'Десять помилок українців',
      short: 'Помилки',
      lede: 'Помилки, що йдуть від української: забуте -s, зайвий Continuous, Perfect із «yesterday».',
    },
    {
      n: 12,
      id: 'decide',
      slug: 'decision',
      title: 'Схема вибору часу — 15 секунд',
      short: 'Схема',
      lede: 'Три питання, які доводять до потрібного часу за п’ятнадцять секунд.',
    },
    {
      n: 13,
      id: 'exercises',
      slug: 'exercises',
      title: 'Вправи з відповідями',
      short: 'Вправи',
      lede: 'Розкрийте дужки, виправте помилку, виберіть між Perfect і Past — з поясненнями.',
    },
    {
      n: 14,
      id: 'quiz',
      slug: 'quiz',
      title: 'Тест — 20 питань',
      short: 'Тест',
      lede: 'Кожна відповідь із розбором «чому». Нижче 85% — вертайтесь до теорії.',
    },
    {
      n: 15,
      id: 'history',
      slug: 'history',
      title: 'Звідки взялися -s, be + ing і have + V3',
      short: 'Походження',
      lede: 'Чому -s лишилося одне на всю парадигму і чому «маю зроблене» стало часом.',
    },
    {
      n: 16,
      id: 'cheat',
      slug: 'cheatsheet',
      title: 'Шпаргалка',
      short: 'Шпаргалка',
      lede: 'Усе вище стисло, однією карткою. Зробіть скріншот.',
    },
    {
      n: 17,
      id: 'plan',
      slug: 'plan',
      title: 'План практики на 14 днів',
      short: 'План',
      lede: 'По 15 хвилин на день: що саме робити кожного дня двох тижнів.',
    },
  ],

  /** Слова з прикладів теми — для блоку «Слова з цієї теми» (CONCEPT 5.2) */
  /*
    Пастка теми — перша помилка з розділу «Типові помилки»: -s у третій
    особі однини зникає, бо в українській дієслово узгоджується з підметом
    завжди, і мозок не бачить в англійському закінченні нічого важливого.
  */
  trap: {
    quote: 'She know about the outage.',
    body: 'У третій особі однини дієслово бере -s: she knows. Це найдешевша у виправленні помилка теми.',
    strong: '-s',
  },
  words: [
    'commute',
    'maintain',
    'onboard',
    'backlog',
    'vendor',
    'latency',
    'refactor',
    'escalate',
    'roadmap',
    'retention',
    'threshold',
    'handover',
    'sprint',
    'lately',
  ],
};

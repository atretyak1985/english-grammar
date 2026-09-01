import type { TopicMeta } from '@/types/content';

/**
 * Опис теми: те, що потрібно сайдбару, картці на головній і <head> сторінки.
 * Розділи перелічені явно — за їхніми id працює скрол, позначка «прочитано»
 * і смужка прогресу.
 *
 * Модальні — тема не про часи, тому колірних ключів виду тут немає:
 * підсвітка в аналізаторі розрізняє часи, а не модальні, і розділу
 * «як це виглядає в підсвітці» в темі навмисно нема.
 */
export const meta: TopicMeta = {
  slug: 'modals',
  title: 'Модальні дієслова',
  desc: 'can / could / may / must / should / have to. Ввічливість, ймовірність, обовʼязок.',
  level: 'b1',
  tags: ['18 розділів', '200+ прикладів', 'тест', 'вправи'],
  ready: true,

  pageTitle: 'Модальні дієслова в англійській: can, must, should, might — повний розбір',
  description:
    'Модальні дієслова англійської з поясненнями українською: can/could/be able to, must/have to, should, may/might, will/would. Два поверхи значень — правила світу і ймовірність, шкала тиску від поради до наказу, mustn’t проти don’t have to, modal + have + V3, 200+ прикладів з перекладом, помилки українців, вправи і тест.',
  kicker: 'Повний курс · рівень B1 → B2',
  heroTitle: 'can · must · should · might',
  heroLede:
    'Модальне дієслово каже не що відбувається, а як ви до цього ставитесь: можна, треба, варто чи, мабуть, так і є. Уся система — це десяток коротких слів на двох поверхах значень. Понад 200 прикладів із перекладом, вправи з відповідями і тест. Усі пояснення — українською.',
  heroChips: [
    '📖 18 розділів',
    '✍️ 200+ прикладів з перекладом',
    '🎯 Два поверхи значень',
    '🧩 Вправи з відповідями',
  ],

  sections: [
    {
      n: 1,
      id: 'big',
      slug: 'idea',
      title: 'Головна ідея — дієслово ставлення, а не дії',
      short: 'Ідея',
      lede: 'Дія та сама — go, be, work. Модальне додає вашу позицію: можна, треба чи, мабуть.',
    },
    {
      n: 2,
      id: 'ability',
      slug: 'ability',
      title: 'can / could / be able to — уміння й можливість',
      short: 'can / could',
      lede: 'Що я вмію і що тут можливо. І чому «я зміг учора відкрити файл» — не could.',
    },
    {
      n: 3,
      id: 'permission',
      slug: 'permission',
      title: 'Дозвіл і прохання: can / could / may / would you',
      short: 'Прохання',
      lede: 'Драбина ввічливості: від can you до would you mind. Минула форма — це дистанція, а не час.',
    },
    {
      n: 4,
      id: 'duty',
      slug: 'obligation',
      title: 'must / have to / need to — обовʼязок і заборона',
      short: 'must / have to',
      lede: 'Хто тисне — ви чи правила. І головна пастка теми: mustn’t це «не можна», а не «не мусиш».',
    },
    {
      n: 5,
      id: 'advice',
      slug: 'advice',
      title: 'should / ought to / had better — порада',
      short: 'should',
      lede: 'Мʼякий тиск: варто, слід, краще б. І чому had better звучить як попередження.',
    },
    {
      n: 6,
      id: 'prob',
      slug: 'probability',
      title: 'Ймовірність: must / may / might / can’t',
      short: 'Ймовірність',
      lede: 'Другий поверх системи: ті самі слова оцінюють шанси. He must be tired — «він, мабуть, утомився».',
    },
    {
      n: 7,
      id: 'past',
      slug: 'past-modals',
      title: 'Modal + have + V3 — жаль, докір і здогад про минуле',
      short: 'modal + have',
      lede: 'should have done, must have seen, could have been. Три слова, які англійська каже про минуле, що не сталося.',
    },
    {
      n: 8,
      id: 'wills',
      slug: 'will-would',
      title: 'will / would — обіцянки, відмови, звички',
      short: 'will / would',
      lede: 'will — теж модальне: рішення, обіцянка, відмова. The door won’t open — двері «відмовляються».',
    },
    {
      n: 9,
      id: 'compare',
      slug: 'comparison',
      title: 'Порівняння і мінімальні пари',
      short: 'Порівняння',
      lede: 'Одне речення, змінено лише модальне — і сенс інший. Найкорисніший розділ.',
    },
    {
      n: 10,
      id: 'stories',
      slug: 'stories',
      title: 'Три тексти з повним розбором',
      short: 'Тексти',
      lede: 'Живий текст речення за реченням: чому саме це модальне в кожному місці.',
    },
    {
      n: 11,
      id: 'translate',
      slug: 'translation',
      title: 'Переклад з української — 25 речень',
      short: 'Переклад',
      lede: 'Найкорисніша вправа: перекладіть, не підглядаючи у відповіді.',
    },
    {
      n: 12,
      id: 'traps',
      slug: 'mistakes',
      title: 'Десять помилок українців',
      short: 'Помилки',
      lede: 'He can to swim, I must to go, mustn’t замість don’t have to — і як виправити кожну назавжди.',
    },
    {
      n: 13,
      id: 'decide',
      slug: 'decision',
      title: 'Схема вибору модального — 15 секунд',
      short: 'Схема',
      lede: 'Три питання, які доводять до потрібного модального за пʼятнадцять секунд.',
    },
    {
      n: 14,
      id: 'exercises',
      slug: 'exercises',
      title: 'Вправи з відповідями',
      short: 'Вправи',
      lede: 'Виберіть модальне, виправте помилку, поясніть різницю між парами.',
    },
    {
      n: 15,
      id: 'quiz',
      slug: 'quiz',
      title: 'Тест — 20 питань',
      short: 'Тест',
      lede: 'Кожна відповідь із розбором «чому». Нижче 85% — вертайтесь до теорії.',
    },
    {
      n: 16,
      id: 'history',
      slug: 'history',
      title: 'Звідки взялися модальні — і чому в них немає -s',
      short: 'Походження',
      lede: 'can колись означало «знати», may — «мати силу». Їхні дивацтва — скамʼянілості давньої граматики.',
    },
    {
      n: 17,
      id: 'cheat',
      slug: 'cheatsheet',
      title: 'Шпаргалка',
      short: 'Шпаргалка',
      lede: 'Усе вище стисло, однією карткою. Зробіть скріншот.',
    },
    {
      n: 18,
      id: 'plan',
      slug: 'plan',
      title: 'План практики на 14 днів',
      short: 'План',
      lede: 'По 15 хвилин на день: що саме робити кожного дня двох тижнів.',
    },
  ],

  /** Слова з прикладів теми — для блоку «Слова з цієї теми» (CONCEPT 5.2) */
  words: [
    'deadline',
    'permission',
    'requirement',
    'badge',
    'helmet',
    'traffic',
    'refund',
    'approval',
    'draft',
    'receipt',
    'attachment',
    'warehouse',
    'outage',
    'estimate',
  ],
};

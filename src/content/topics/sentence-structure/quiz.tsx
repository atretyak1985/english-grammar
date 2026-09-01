import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на місця, де українці ламають порядок найчастіше. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'I ___ this idea.',
    hint: 'Мені дуже подобається ця ідея.',
    options: ['very like', 'really like', 'like very'],
    answer: 1,
    why: (
      <>
        <i>very</i> саме по собі до дієслова не чіпляється — це найвідоміша калька з «дуже
        люблю». Перед дієсловом працює <b>really</b>, у кінці — <i>very much</i>.
      </>
    ),
  },
  {
    q: 'The dog sees the cat. — Хто кого бачить?',
    options: ['Пес бачить кота', 'Кіт бачить пса', 'Невідомо: порядок вільний'],
    answer: 0,
    why: (
      <>
        Перший слот — діяч, слот після дієслова — обʼєкт. Закінчень, які б це сказали, в
        англійській немає, тому переставити слова «для стилю» не можна: зміст перевернеться.
      </>
    ),
  },
  {
    q: '___ cold in the office.',
    hint: 'В офісі холодно.',
    options: ['Is', 'It is', 'There is'],
    answer: 1,
    why: (
      <>
        Речення без підмета не буває. Стан («холодно», «пізно», «дощить») тримає порожнє{' '}
        <b>it</b>. <i>There is</i> вводить «є щось» — це інший випадок.
      </>
    ),
  },
  {
    q: '___ a problem with the build.',
    hint: 'Є проблема зі збіркою.',
    options: ['It is', 'There is', 'Is'],
    answer: 1,
    why: (
      <>
        «Є / існує щось» → <b>There is</b>. Порівняйте з попереднім питанням: <i>it</i> — про
        стан, <i>there</i> — про існування.
      </>
    ),
  },
  {
    q: 'Where ___?',
    hint: 'Де вона працює?',
    options: ['she works', 'does she work', 'works she'],
    answer: 1,
    why: (
      <>
        Питальне слово не скасовує інверсії: далі однаково <i>does</i> + підмет + V1. ✗{' '}
        <i>Where she works?</i> — найчастіша помилка в питаннях.
      </>
    ),
  },
  {
    q: 'Who ___ the window?',
    hint: 'Хто розбив вікно?',
    options: ['did break', 'broke', 'did broke'],
    answer: 1,
    why: (
      <>
        Питання до підмета — єдиний випадок без <i>did</i>: <i>who</i> сам стоїть у слоті «хто»,
        тому порядок лишається стверджувальним.
      </>
    ),
  },
  {
    q: 'He ___ for the stand-up.',
    hint: 'Він зазвичай спізнюється на стендап.',
    options: ['usually is late', 'is usually late', 'is late usually'],
    answer: 1,
    why: (
      <>
        Прислівник частоти стоїть перед основним дієсловом, але ПІСЛЯ <i>be</i>: ✗{' '}
        <i>usually is late</i>.
      </>
    ),
  },
  {
    q: 'She speaks ___.',
    hint: 'Вона вільно говорить англійською.',
    options: ['fluently English', 'English fluently', 'fluent English speech'],
    answer: 1,
    why: (
      <>
        Між дієсловом і додатком ніхто не встає. Спочатку додаток (<i>English</i>), потім спосіб
        дії (<i>fluently</i>).
      </>
    ),
  },
  {
    q: 'I sent ___.',
    hint: 'Я надіслав їй звіт.',
    options: ['to her the report', 'her the report', 'the report her'],
    answer: 1,
    why: (
      <>
        Кому без прийменника — одразу після дієслова: <i>sent her the report</i>. Хочете{' '}
        <i>to</i> — тоді після додатка: <i>sent the report to her</i>. Змішувати не можна.
      </>
    ),
  },
  {
    q: 'I bought an ___ jacket.',
    hint: 'Я купив стару шкіряну куртку.',
    options: ['old leather', 'leather old', 'old, leather'],
    answer: 0,
    why: (
      <>
        Черга прикметників: вік стоїть перед матеріалом — <i>old leather</i>. Носій цю чергу не
        вчив, але порушення чує миттєво.
      </>
    ),
  },
  {
    q: "I ___ about the change.",
    hint: 'Я нічого не знаю про зміну.',
    options: ["don't know nothing", "don't know anything", 'not know anything'],
    answer: 1,
    why: (
      <>
        Одне заперечення на речення. <i>don&apos;t</i> уже заперечив — далі <i>anything</i>.
        Другий правильний варіант існує (<i>I know nothing</i>), але серед відповідей його нема.
      </>
    ),
  },
  {
    q: 'Виберіть правильне питання.',
    hint: 'Тобі подобається новий дизайн?',
    options: [
      'You like the new design?',
      'Like you the new design?',
      'Do you like the new design?',
    ],
    answer: 2,
    why: (
      <>
        Українською питання робить інтонація, англійською — інверсія. У Present Simple власного
        двигуна нема, тому наперед їде <b>do</b>.
      </>
    ),
  },
  {
    q: 'Why ___ the meeting?',
    hint: 'Чому вони скасували зустріч?',
    options: ['they cancelled', 'did they cancel', 'did they cancelled'],
    answer: 1,
    why: (
      <>
        Минулий час у питанні переїздить у <i>did</i>, дієслово вертається до початкової форми:
        ✗ <i>did they cancelled</i>.
      </>
    ),
  },
  {
    q: 'I have ___ the invoice.',
    hint: 'Я вже схвалив рахунок.',
    options: ['approved already', 'already approved', 'approved yet'],
    answer: 1,
    why: (
      <>
        <i>already</i> живе між допоміжним і основним дієсловом: <i>have already approved</i>.
      </>
    ),
  },
  {
    q: "We haven't received the parts ___.",
    hint: 'Ми ще не отримали деталі.',
    options: ['yet', 'already', 'still'],
    answer: 0,
    why: (
      <>
        У запереченні «ще не» — це <b>yet</b>, і його місце — самий кінець речення.
      </>
    ),
  },
  {
    q: "I'll see you ___.",
    hint: 'Побачимось в офісі у вівторок.',
    options: ['on Tuesday at the office', 'at the office on Tuesday', 'at Tuesday the office'],
    answer: 1,
    why: (
      <>
        Порядок хвостів: <b>де → коли</b>. Місце стоїть перед часом — <i>at the office on
        Tuesday</i>.
      </>
    ),
  },
  {
    q: 'Can ___ with the boxes?',
    hint: 'Можеш допомогти мені з коробками?',
    options: ['you help me', 'you me help', 'help you me'],
    answer: 0,
    why: (
      <>
        Після модального порядок звичайний: підмет → дієслово → додаток. <i>me</i> — одразу після{' '}
        <i>help</i>, без прийменника.
      </>
    ),
  },
  {
    q: '___ to sign the contract today.',
    hint: 'Важливо підписати контракт сьогодні.',
    options: ['Is important', 'There is important', 'It is important'],
    answer: 2,
    why: (
      <>
        Слот підмета мусить бути зайнятий — його тримає порожнє <b>it</b>, а справжній зміст
        стоїть в інфінітиві: <i>It is important to sign…</i>
      </>
    ),
  },
  {
    q: 'She ___ her passwords.',
    hint: 'Вона ніколи не записує паролі.',
    options: ['never writes down', 'writes never down', 'writes down never'],
    answer: 0,
    why: (
      <>
        <i>never</i> — прислівник частоти, його місце перед основним дієсловом. І це вже
        заперечення: ✗ <i>doesn&apos;t never write</i>.
      </>
    ),
  },
  {
    q: 'Наголос «Звіт написав САМЕ Тарас» англійською — це:',
    options: [
      'It was Taras who wrote the report.',
      'Wrote the report Taras.',
      'The report wrote Taras.',
    ],
    answer: 0,
    why: (
      <>
        Англійська не переставляє слова — вона перебудовує речення: <b>It was … who…</b> Інші два
        варіанти ламають слоти, і другий узагалі каже, що звіт щось написав.
      </>
    ),
  },
];

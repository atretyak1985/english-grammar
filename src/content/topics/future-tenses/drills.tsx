import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Майбутні часи».
   Розділ 12 — переклад з української (25 речень, чотири блоки).
   Розділ 15 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — will',
  items: [
    {
      q: '— Принтер не працює. — Добре, я подзвоню в підтримку.',
      a: "— The printer is broken. — OK, I'll call support.",
      accepted: ['OK, I will call support.'],
      hint: (
        <>
          Рішення народилося в цю мить → <i>will</i>. Тут <i>going to</i> було б неправильно.
        </>
      ),
    },
    {
      q: 'Я надішлю тобі кошторис до кінця дня, обіцяю.',
      a: "I'll send you the estimate by the end of the day, I promise.",
      hint: (
        <>
          Обіцянка — класичне <i>will</i>. І <i>by</i>, а не <i>until</i>: дія одноразова.
        </>
      ),
    },
    {
      q: 'Думаю, вони не погодяться на таку ціну.',
      a: "I don't think they'll agree to that price.",
      accepted: ["I think they won't agree to that price."],
      hint: (
        <>
          Носії заперечують <b>перше</b> дієслово: <i>I don&apos;t think they will</i>, а не{' '}
          <i>I think they won&apos;t</i>. Друге теж можливе, але звучить різкіше.
        </>
      ),
    },
    {
      q: 'Не хвилюйся, я тобі допоможу.',
      a: "Don't worry, I'll help you.",
      hint: 'Пропозиція допомоги в момент мовлення → will.',
    },
    {
      q: 'Реліз не поїде цієї пʼятниці.',
      a: "The release won't go out this Friday.",
      hint: (
        <>
          <i>won&apos;t</i> = will not. У мовленні повна форма звучить підкреслено, майже сердито.
        </>
      ),
    },
    {
      q: 'Тобі сподобається новий дашборд.',
      a: "You'll like the new dashboard.",
      hint: 'Прогноз-думка без жодних видимих ознак → will.',
    },
    {
      q: 'Я подзвоню, щойно міграція завершиться.',
      a: "I'll call you as soon as the migration finishes.",
      hint: (
        <>
          Після <i>as soon as</i> — теперішній час. ✗ <i>as soon as the migration will finish</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — be going to і теперішні форми',
  items: [
    {
      q: 'Я збираюся переписати цей модуль наступного тижня.',
      a: "I'm going to rewrite that module next week.",
      hint: 'Намір, ухвалений до розмови → going to.',
    },
    {
      q: 'Обережно — воно зараз впаде.',
      a: "Careful — it's going to fall.",
      hint: (
        <>
          Видима ознака перед очима → <i>going to</i>. З <i>will</i> це була б просто думка.
        </>
      ),
    },
    {
      q: 'Ми зустрічаємось із вендором у четвер о третій.',
      a: "We're meeting the vendor at three on Thursday.",
      hint: 'Домовленість із часом → Present Continuous, а не will.',
    },
    {
      q: 'Потяг відходить о 6:40.',
      a: 'The train leaves at 6:40.',
      hint: 'Розклад → Present Simple. Це не моє рішення взагалі.',
    },
    {
      q: 'Кікоф починається в понеділок, а код-фриз — у середу.',
      a: 'The kickoff starts on Monday and the code freeze begins on Wednesday.',
      hint: 'Обидві події з програми → Present Simple.',
    },
    {
      q: 'Що ти робиш у пʼятницю ввечері?',
      a: 'What are you doing on Friday evening?',
      hint: (
        <>
          Найзвичайніше питання про плани. <i>What will you do</i> звучить книжно.
        </>
      ),
    },
    {
      q: 'Я збирався тобі подзвонити, але зустріч затягнулась.',
      a: 'I was going to call you, but the meeting ran over.',
      hint: (
        <>
          <i>was going to</i> = «збирався, але не зробив». Майбутнє в минулому.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — Future Continuous і Future Perfect',
  items: [
    {
      q: 'Завтра о десятій я буду запускати міграцію.',
      a: "At ten tomorrow I'll be running the migration.",
      hint: 'Названий момент + процес → will be + V-ing.',
    },
    {
      q: 'До пʼятниці ми вже випустимо виправлення.',
      a: "By Friday we'll have shipped the fix.",
      hint: (
        <>
          <i>by</i> + завершення до точки → will have + V3.
        </>
      ),
    },
    {
      q: 'У червні я працюватиму тут уже шість років.',
      a: "In June I'll have been working here for six years.",
      hint: 'Скільки часу триватиме до майбутньої точки → will have been + V-ing.',
    },
    {
      q: 'Ви будете користуватися переговорною після обіду?',
      a: 'Will you be using the meeting room after lunch?',
      hint: (
        <>
          Ввічливе питання про обставини. <i>Will you use…</i> прозвучало б як прохання
          поступитися.
        </>
      ),
    },
    {
      q: 'На той час, коли клієнт підключиться, ми вже все розгорнемо.',
      a: "By the time the client joins, we'll have deployed everything.",
      hint: (
        <>
          <i>By the time</i> + теперішній час у підрядному, перфект у головному.
        </>
      ),
    },
    {
      q: 'Не дзвони о шостій — я буду вести дзвінок.',
      a: "Don't call at six — I'll be on a call.",
      accepted: ["Don't call at six — I'll be running a call."],
      hint: (
        <>
          <i>be</i> — дієслово стану, тому тут звичайне <i>will be</i>, а не <i>will be being</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — змішані, найскладніші',
  items: [
    {
      q: 'Я буду працювати над цим завтра.',
      a: "I'll work on it tomorrow.",
      accepted: ["I'm going to work on it tomorrow."],
      hint: (
        <>
          Пастка виду: українське «буду працювати» — це <b>не</b> Future Continuous. ✗{' '}
          <i>I&apos;ll be working on it tomorrow</i> означало б «саме в той момент буду посеред
          роботи».
        </>
      ),
    },
    {
      q: 'Якщо тести не пройдуть, ми відкладемо реліз.',
      a: "If the tests don't pass, we'll postpone the release.",
      hint: (
        <>
          Після <i>if</i> — теперішній час, <i>will</i> лишається в головній частині.
        </>
      ),
    },
    {
      q: 'Я скажу тобі, коли знатиму більше.',
      a: "I'll tell you when I know more.",
      hint: (
        <>
          ✗ <i>when I will know</i>. Після <i>when</i> у значенні «коли настане момент» — теперішній
          час.
        </>
      ),
    },
    {
      q: 'До того часу, як ти прочитаєш це, я вже вилечу.',
      a: "By the time you read this, I'll have left.",
      hint: 'Два майбутні моменти: один — точка відліку, другий завершується до неї.',
    },
    {
      q: 'Наступного тижня я не працюю — я їду до Берліна.',
      a: "I'm not working next week — I'm flying to Berlin.",
      hint: (
        <>
          Дві домовленості поспіль → Present Continuous двічі. ✗ <i>I won&apos;t work</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_BLOCKS = [TRANSLATE_A, TRANSLATE_B, TRANSLATE_C, TRANSLATE_D];

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — розкрийте дужки',
  items: [
    {
      q: 'I (call) ___ you as soon as the build (finish) ___.',
      a: "'ll call … finishes",
      hint: (
        <>
          Після <i>as soon as</i> — теперішній час.
        </>
      ),
    },
    {
      q: 'By Friday we (ship) ___ the fix.',
      a: "'ll have shipped",
      hint: (
        <>
          <i>by</i> + точка в майбутньому → Future Perfect.
        </>
      ),
    },
    {
      q: 'Look at those logs — the disk (run) ___ out of space.',
      a: "is going to run",
      hint: 'Видима ознака перед очима → going to.',
    },
    {
      q: 'The train (leave) ___ at 6:40, so we (meet) ___ at the station at 6:15.',
      a: "leaves … are meeting",
      hint: 'Розклад → Present Simple. Домовленість → Present Continuous.',
    },
    {
      q: 'At ten tomorrow I (run) ___ the cutover, so don’t call.',
      a: "'ll be running",
      hint: 'Названий момент + процес → Future Continuous.',
    },
    {
      q: '— The printer is broken again. — OK, I (look) ___ at it.',
      a: "'ll look",
      hint: 'Рішення в момент мовлення → will.',
    },
    {
      q: 'In June she (work) ___ here for six years.',
      a: "'ll have been working",
      hint: (
        <>
          Скільки часу триватиме до точки → Future Perfect Continuous. Варіант{' '}
          <i>will have worked</i> теж приймають.
        </>
      ),
    },
    {
      q: 'I (not / work) ___ next Monday — it’s a public holiday.',
      a: "'m not working",
      hint: (
        <>
          Це вже вирішено календарем → Present Continuous. <i>won&apos;t work</i> звучало б як
          відмова.
        </>
      ),
    },
    {
      q: 'If the vendor (not / reply) ___ by Wednesday, we (escalate) ___.',
      a: "doesn't reply … 'll escalate",
      hint: (
        <>
          Після <i>if</i> — теперішній, <i>will</i> у головній частині.
        </>
      ),
    },
    {
      q: 'I (be) ___ going to tell you, but you (already / leave) ___.',
      a: 'was … had already left',
      hint: 'Майбутнє в минулому + крок назад від нього.',
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  items: [
    {
      q: 'I will tell you when the migration will finish.',
      a: 'I will tell you when the migration finishes.',
      hint: (
        <>
          Після <i>when</i> — теперішній час.
        </>
      ),
    },
    {
      q: 'If it will rain, we will move the demo inside.',
      a: 'If it rains, we will move the demo inside.',
      hint: (
        <>
          Після <i>if</i> — теперішній час.
        </>
      ),
    },
    {
      q: 'I will meet the vendor on Thursday, it is already in the calendar.',
      a: "I'm meeting the vendor on Thursday, it's already in the calendar.",
      hint: 'Домовленість із датою → Present Continuous.',
    },
    {
      q: 'Look, the server is falling over — it will crash.',
      a: "Look, the server is falling over — it's going to crash.",
      hint: (
        <>
          Ознака перед очима → <i>going to</i>.
        </>
      ),
    },
    {
      q: 'I shall send you the report tomorrow.',
      a: "I'll send you the report tomorrow.",
      hint: (
        <>
          <i>shall</i> у значенні простого майбутнього застаріле. Живе воно тільки в питаннях
          («Shall we start?») і в юридичних текстах.
        </>
      ),
    },
    {
      q: 'The train will leave at 6:40 every morning.',
      a: 'The train leaves at 6:40 every morning.',
      hint: (
        <>
          <i>every morning</i> плюс розклад → Present Simple.
        </>
      ),
    },
    {
      q: 'By Friday we will ship the fix.',
      a: "By Friday we'll have shipped the fix.",
      hint: (
        <>
          <i>by</i> + точка → перфект. Без нього речення означає «у пʼятницю», а не «до пʼятниці».
        </>
      ),
    },
    {
      q: 'I will be working on it tomorrow, I promise.',
      a: "I'll work on it tomorrow, I promise.",
      hint: (
        <>
          Обіцянка — це простий <i>will</i>. Continuous робить із неї опис процесу в певний момент.
        </>
      ),
    },
    {
      q: 'We are going to postpone it, I decide that just now.',
      a: "We'll postpone it, I've just decided.",
      hint: (
        <>
          Рішення в цю мить → <i>will</i>, не <i>going to</i>.
        </>
      ),
    },
    {
      q: 'Wait until the tests will pass.',
      a: 'Wait until the tests pass.',
      hint: (
        <>
          Після <i>until</i> — теперішній час.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — will чи going to',
  lede: 'Виберіть форму і сформулюйте, що саме в ситуації її вирішило.',
  items: [
    {
      q: '— We are out of coffee. — OK, I ___ (buy) some.',
      a: "'ll buy — рішення народилося в цю мить",
    },
    {
      q: 'I ___ (buy) a new laptop — I have been saving up for months.',
      a: "'m going to buy — намір давній, гроші вже відкладені",
    },
    {
      q: 'Those clouds are black. It ___ (rain).',
      a: "'s going to rain — ознака перед очима",
    },
    {
      q: 'I think it ___ (rain) tomorrow, but who knows.',
      a: "'ll rain — просто думка, жодних ознак",
    },
    {
      q: 'The phone is ringing. — I ___ (get) it.',
      a: "'ll get it — реакція на те, що сталося щойно",
    },
    {
      q: 'Why have you brought the toolbox? — I ___ (fix) the printer.',
      a: "'m going to fix — намір був до питання",
    },
    {
      q: 'This ___ (not / work), I can see it already.',
      a: "isn't going to work — висновок з видимих ознак",
    },
    {
      q: 'Nobody knows what ___ (happen) to the market next year.',
      a: "will happen — прогноз без ознак, до того ж далеке майбутнє",
    },
  ],
};

import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на вибір форми, а не на побудову. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: '— The printer is broken again. — OK, I ___ support.',
    hint: '— Принтер знову не працює. — Добре, я подзвоню в підтримку.',
    options: ["'m going to call", "'ll call", 'call'],
    answer: 1,
    why: (
      <>
        Рішення народилося в цю мить, як реакція на почуте → <b>will</b>. Форма{' '}
        <i>going to</i> сказала б, що ви планували це ще до розмови.
      </>
    ),
  },
  {
    q: 'Why have you brought the toolbox? — I ___ the printer.',
    hint: 'Чому ти приніс інструменти? — Я збираюся полагодити принтер.',
    options: ["'ll fix", "'m going to fix", 'fix'],
    answer: 1,
    why: (
      <>
        Інструменти в руках — доказ, що намір був <i>до</i> питання. Це і є <b>going to</b>.
      </>
    ),
  },
  {
    q: 'We ___ the vendor at three on Thursday — it’s in the calendar.',
    hint: 'Ми зустрічаємось із вендором у четвер о третій — це вже в календарі.',
    options: ['will meet', "'re meeting", 'meet'],
    answer: 1,
    why: 'Домовленість із конкретним часом → Present Continuous. Найприродніший варіант у мовленні.',
  },
  {
    q: 'The train ___ at 6:40, so we should leave now.',
    hint: 'Потяг відходить о 6:40, тож треба виходити.',
    options: ['leaves', 'will leave', 'is leaving'],
    answer: 0,
    why: 'Розклад — не ваше рішення, а властивість світу → Present Simple.',
  },
  {
    q: 'I’ll call you when the migration ___.',
    hint: 'Я подзвоню, коли міграція завершиться.',
    options: ['will finish', 'finishes', 'is going to finish'],
    answer: 1,
    why: (
      <>
        Після <b>when</b>, <b>as soon as</b>, <b>after</b>, <b>until</b>, <b>if</b> майбутнє
        позначається теперішнім часом. Друге <i>will</i> у реченні не ставлять.
      </>
    ),
  },
  {
    q: 'By Friday we ___ the fix.',
    hint: 'До пʼятниці ми вже випустимо виправлення.',
    options: ['will ship', "'ll have shipped", "'ll be shipping"],
    answer: 1,
    why: (
      <>
        <b>by</b> + точка в майбутньому = «до цього моменту вже готово» → Future Perfect. Варіант{' '}
        <i>will ship</i> означав би «у пʼятницю», а не «до пʼятниці».
      </>
    ),
  },
  {
    q: 'At ten tomorrow I ___ the cutover, so don’t call me.',
    hint: 'Завтра о десятій я буду проводити перехід, тож не дзвони.',
    options: ["'ll run", "'ll be running", "'ll have run"],
    answer: 1,
    why: 'Названий момент майбутнього + процес, що вже триватиме → Future Continuous.',
  },
  {
    q: 'Look at those black clouds. It ___.',
    hint: 'Подивись на ті чорні хмари. Зараз буде дощ.',
    options: ["will rain", "'s going to rain", 'rains'],
    answer: 1,
    why: (
      <>
        Ознака перед очима → <b>going to</b>. З <i>will</i> це була б просто думка про погоду.
      </>
    ),
  },
  {
    q: 'I ___ on it tomorrow, I promise.',
    hint: 'Я буду працювати над цим завтра, обіцяю.',
    options: ["'ll be working", "'ll work", 'work'],
    answer: 1,
    why: (
      <>
        Пастка виду: українське «буду працювати» — це <b>не</b> Future Continuous. Обіцянка — це
        простий <i>will</i>, а <i>will be working</i> означало б «у той момент буду посеред роботи».
      </>
    ),
  },
  {
    q: 'In June she ___ here for six years.',
    hint: 'У червні вона працюватиме тут уже шість років.',
    options: ["'ll work", "'ll be working", "'ll have been working"],
    answer: 2,
    why: 'Скільки часу триватиме до майбутньої точки → Future Perfect Continuous.',
  },
  {
    q: 'I ___ next Monday — it’s a public holiday.',
    hint: 'Наступного понеділка я не працюю — це державне свято.',
    options: ["won't work", "'m not working", "don't work"],
    answer: 1,
    why: (
      <>
        Це вже вирішено календарем → Present Continuous. <i>won&apos;t work</i> прозвучало б як
        відмова працювати.
      </>
    ),
  },
  {
    q: 'I ___ to tell you, but you had already left.',
    hint: 'Я збирався тобі сказати, але ти вже пішов.',
    options: ['will go', 'was going', 'am going'],
    answer: 1,
    why: (
      <>
        <b>was going to</b> — майбутнє в минулому: намір був, але не здійснився.
      </>
    ),
  },
  {
    q: '___ the meeting room after lunch?',
    hint: 'Ви будете користуватися переговорною після обіду?',
    options: ['Will you use', 'Will you be using', 'Do you use'],
    answer: 1,
    why: (
      <>
        Future Continuous робить питання ввічливим: воно про обставини. <i>Will you use…</i>{' '}
        прозвучало б як прохання поступитися кімнатою.
      </>
    ),
  },
  {
    q: 'I don’t think they ___ to that price.',
    hint: 'Думаю, вони не погодяться на таку ціну.',
    options: ["'ll agree", "won't agree", 'agree'],
    answer: 0,
    why: (
      <>
        Носії заперечують <b>перше</b> дієслово: <i>I don&apos;t think they will</i>. Варіант{' '}
        <i>I think they won&apos;t</i> граматичний, але звучить різкіше й рідше.
      </>
    ),
  },
  {
    q: 'Wait ___ the tests pass.',
    hint: 'Почекай, поки тести пройдуть.',
    options: ['until', 'by', 'while'],
    answer: 0,
    why: (
      <>
        <b>until</b> — «доки не». <i>by</i> вимагає точки («by Friday»), а <i>while</i> означало б
        «поки вони йдуть».
      </>
    ),
  },
  {
    q: 'The rollout starts ___ two weeks.',
    hint: 'Розгортання починається через два тижні.',
    options: ['after', 'in', 'for'],
    answer: 1,
    why: (
      <>
        «Через N часу» про майбутнє — це <b>in two weeks</b>. Пастка з української: ✗{' '}
        <i>after two weeks</i> означає «після якогось двотижневого періоду».
      </>
    ),
  },
  {
    q: 'I ___ you the report tomorrow.',
    hint: 'Я надішлю тобі звіт завтра.',
    options: ['shall send', "'ll send", 'send'],
    answer: 1,
    why: (
      <>
        <b>shall</b> у значенні простого майбутнього застаріле — воно вижило лише в питаннях («Shall
        we start?») і в юридичних текстах. Підручники 80-х вчили інакше.
      </>
    ),
  },
  {
    q: 'By the time you read this, I ___.',
    hint: 'До того часу, як ти прочитаєш це, я вже вилечу.',
    options: ["'ll leave", "'ll have left", 'leave'],
    answer: 1,
    why: (
      <>
        Дві майбутні події: <i>read</i> — точка відліку (теперішній час після <i>by the time</i>), а
        відʼїзд завершується до неї → Future Perfect.
      </>
    ),
  },
  {
    q: 'This ___, I can see it already.',
    hint: 'Це не спрацює, я вже бачу.',
    options: ["won't work", "isn't going to work", "doesn't work"],
    answer: 1,
    why: (
      <>
        «Я вже бачу» — це і є видима ознака, отже <b>going to</b>. Варіант <i>won&apos;t work</i>{' '}
        теж можливий, але передає рішення чи відмову, а не висновок із ознак.
      </>
    ),
  },
  {
    q: 'The kickoff ___ on Monday and I ___ the demo.',
    hint: 'Кікоф починається в понеділок, і демо показую я.',
    options: ['starts … am giving', 'will start … will give', 'is starting … give'],
    answer: 0,
    why: (
      <>
        Найкорисніше питання тесту: в одному реченні дві різні форми. Кікоф — <b>програма</b>, тому
        Present Simple; демо — <b>моя домовленість</b>, тому Present Continuous. Жодного{' '}
        <i>will</i> тут не потрібно.
      </>
    ),
  },
];

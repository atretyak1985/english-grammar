import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на головну пастку: Perfect чи Past Simple. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'I ___ here for six years and I still like it.',
    hint: 'Я працюю тут шість років — і мені досі подобається.',
    options: ['work', 'am working', "'ve worked"],
    answer: 2,
    why: (
      <>
        Період почався в минулому й триває досі → Present Perfect. Українською тут теперішній час, і
        саме тому <i>I work here for six years</i> здається правильним. Воно неправильне.
      </>
    ),
  },
  {
    q: 'She ___ about the outage — nobody told her.',
    hint: 'Вона не знає про збій — їй ніхто не сказав.',
    options: ["doesn't know", "isn't knowing", "doesn't knows"],
    answer: 0,
    why: (
      <>
        <b>know</b> — дієслово стану, форми з -ing немає. І <i>-s</i> уже сидить у <i>does</i>, тому
        далі початкова форма.
      </>
    ),
  },
  {
    q: 'I ___ the invoice yesterday afternoon.',
    hint: 'Я надіслав рахунок учора вдень.',
    options: ["'ve sent", 'sent', 'send'],
    answer: 1,
    why: (
      <>
        <i>yesterday</i> — закритий момент минулого. З ним Present Perfect неможливий, хоч
        українською обидва варіанти звучали б як «надіслав».
      </>
    ),
  },
  {
    q: 'We ___ two releases this week.',
    hint: 'Цього тижня ми випустили два релізи.',
    options: ['shipped', "'ve shipped", 'are shipping'],
    answer: 1,
    why: (
      <>
        <i>this week</i> ще не скінчився — період відкритий, до нього можна додати третій реліз →
        Present Perfect.
      </>
    ),
  },
  {
    q: '___ you ___ my message about the roadmap?',
    hint: 'Ти бачив моє повідомлення про роадмеп?',
    options: ['Did … saw', 'Have … seen', 'Have … saw'],
    answer: 1,
    why: (
      <>
        Питання про результат зараз («воно в тебе вже є?») → have + V3. Форма <i>saw</i> — це V2,
        після <i>have</i> потрібне <i>seen</i>.
      </>
    ),
  },
  {
    q: 'The train ___ at 6:40, so we should leave now.',
    hint: 'Потяг відходить о 6:40, тож треба виходити.',
    options: ['leaves', 'is leaving', 'will leave'],
    answer: 0,
    why: 'Розклад, таблиця, розпорядок — Present Simple, навіть коли йдеться про майбутнє.',
  },
  {
    q: "I can't talk — I ___ to the vendor right now.",
    hint: 'Не можу говорити — я саме розмовляю з вендором.',
    options: ['talk', "'m talking", "'ve talked"],
    answer: 1,
    why: (
      <>
        <i>right now</i> — процес у цю хвилину → am/is/are + V-ing.
      </>
    ),
  },
  {
    q: 'How long ___ you ___ for their reply?',
    hint: 'Скільки ти вже чекаєш на їхню відповідь?',
    options: ['are … waiting', 'have … been waiting', 'do … wait'],
    answer: 1,
    why: (
      <>
        <b>How long</b> про дію, що почалась раніше й досі триває → Present Perfect Continuous.
      </>
    ),
  },
  {
    q: 'When ___ you ___ the company?',
    hint: 'Коли ти прийшов у компанію?',
    options: ['did … join', 'have … joined', 'are … joining'],
    answer: 0,
    why: (
      <>
        <b>When</b> питає про конкретний момент у минулому, а Present Perfect саме моменту й не
        називає. Тому <i>When have you…</i> неможливе — це одна з найчастіших помилок українців.
      </>
    ),
  },
  {
    q: 'He ___ to main without review — it drives me mad.',
    hint: 'Він постійно пушить у main без ревʼю — це мене дратує.',
    options: ['always pushes', "'s always pushing", "has always pushed"],
    answer: 1,
    why: (
      <>
        Continuous + <b>always</b> = скарга, а не статистика. <i>He always pushes</i> — нейтральний
        факт, без емоції.
      </>
    ),
  },
  {
    q: 'I ___ for the team lead this month.',
    hint: 'Цього місяця я підміняю тімліда.',
    options: ['cover', "'m covering", "'ve covered"],
    answer: 1,
    why: (
      <>
        Тимчасова ситуація з видимими краями → Continuous. <i>I cover for him</i> означало б, що це
        моя постійна роль.
      </>
    ),
  },
  {
    q: "She's not on the call — she ___ the company.",
    hint: 'Її немає на дзвінку — вона пішла з компанії.',
    options: ['left', "'s left", 'leaves'],
    answer: 1,
    why: (
      <>
        Важливий наслідок для теперішнього, дату не називаємо. <i>She left in March</i> було б Past
        Simple — там уже названий момент.
      </>
    ),
  },
  {
    q: 'Our service ___ about a million requests a day.',
    hint: 'Наш сервіс обробляє близько мільйона запитів на день.',
    options: ['handle', 'handles', 'is handling'],
    answer: 1,
    why: (
      <>
        Постійна характеристика → Present Simple, третя особа однини → <b>handles</b>. Забуте{' '}
        <i>-s</i> — помилка номер один у цій темі.
      </>
    ),
  },
  {
    q: "I'll call you as soon as the migration ___.",
    hint: 'Я подзвоню, щойно міграція завершиться.',
    options: ['will finish', 'finishes', 'is finishing'],
    answer: 1,
    why: (
      <>
        Після <b>when</b>, <b>as soon as</b>, <b>after</b>, <b>until</b>, <b>if</b> майбутнє
        позначається теперішнім часом. Друге <i>will</i> у реченні не ставлять.
      </>
    ),
  },
  {
    q: 'We ___ the migration ___.',
    hint: 'Ми ще не завершили міграцію.',
    options: ["haven't finished … yet", "didn't finish … yet", "don't finish … already"],
    answer: 0,
    why: (
      <>
        <b>yet</b> у кінці заперечення = «ще ні, але очікується». Природна пара саме з Present
        Perfect.
      </>
    ),
  },
  {
    q: 'He ___ two direct reports and no budget.',
    hint: 'У нього двоє підлеглих і жодного бюджету.',
    options: ['is having', 'has', 'has been having'],
    answer: 1,
    why: (
      <>
        <b>have</b> у значенні «мати» — стан. З -ing воно вживається лише як дія:{' '}
        <i>having lunch</i>, <i>having a call</i>.
      </>
    ),
  },
  {
    q: 'The latency ___ since we added the new index.',
    hint: 'Латентність зростає, відколи ми додали новий індекс.',
    options: ['grows', 'is growing', 'has been growing'],
    answer: 2,
    why: (
      <>
        <b>since</b> задає початок періоду, який триває → Perfect Continuous. Наголос саме на тому,
        що процес не спинився.
      </>
    ),
  },
  {
    q: 'This is the third time I ___ about the handover.',
    hint: 'Я питаю про передачу справ уже третій раз.',
    options: ['ask', "'ve asked", 'am asking'],
    answer: 1,
    why: (
      <>
        Конструкція <b>It is the first / second / third time…</b> тягне за собою Present Perfect.
      </>
    ),
  },
  {
    q: 'We ___ the vendor on Thursday — it’s in the calendar.',
    hint: 'Ми зустрічаємось із вендором у четвер — це вже в календарі.',
    options: ['meet', "'re meeting", "'ve met"],
    answer: 1,
    why: 'Домовленість із конкретною датою → Present Continuous про майбутнє. Найприродніший варіант у мовленні.',
  },
  {
    q: 'The service ___ down twice today and once yesterday.',
    hint: 'Сервіс падав двічі сьогодні й один раз учора.',
    options: [
      "has gone down twice today and went down once yesterday",
      'went down twice today and yesterday',
      "has gone down twice today and has gone down once yesterday",
    ],
    answer: 0,
    why: (
      <>
        Найкорисніше питання тесту: в одному реченні два часи, бо два різні періоди. <i>today</i>{' '}
        відкритий → Perfect, <i>yesterday</i> закритий → Past Simple.
      </>
    ),
  },
];

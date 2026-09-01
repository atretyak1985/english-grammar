import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на місця, де українці ламають умовні найчастіше. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'If it ___ tomorrow, we will cancel the picnic.',
    hint: 'Якщо завтра буде дощ, ми скасуємо пікнік.',
    options: ['will rain', 'rains', 'would rain'],
    answer: 1,
    why: (
      <>
        If-частина описує ситуацію, а не прогнозує — їй належить Present Simple. Українське
        «буде дощ» тягне will у переклад, але will живе лише в результаті. Помилка №1 теми.
      </>
    ),
  },
  {
    q: 'If I ___ the answer, I would tell you.',
    hint: 'Якби я знав відповідь, я б сказав.',
    options: ['would know', 'knew', 'know'],
    answer: 1,
    why: (
      <>
        «Якби» про сьогодні — second: Past Simple в умові. <i>would</i> у if-частині не буває
        ніколи — це дзеркальна до will помилка.
      </>
    ),
  },
  {
    q: 'If you press F5, the page ___.',
    hint: 'Якщо натиснути F5, сторінка перезавантажується.',
    options: ['will reload', 'reloads', 'would reload'],
    answer: 1,
    why: (
      <>
        Спрацьовує щоразу, if ≈ when — це zero: Present Simple в обох плечах. will перетворив би
        правило на одноразовий прогноз.
      </>
    ),
  },
  {
    q: 'If I ___ you, I would take the offer.',
    options: ['was', 'were', 'am'],
    answer: 1,
    why: (
      <>
        Формула поради бере умовне <b>were</b> для всіх осіб — уламок старого умовного способу.
        <i>was</i> проскакує в розмові, але в письмі й тестах очікують were.
      </>
    ),
  },
  {
    q: 'If we ___ the migration, the release wouldn’t have failed.',
    hint: 'Якби ми протестували міграцію, реліз би не впав.',
    options: ['tested', 'had tested', 'would have tested'],
    answer: 1,
    why: (
      <>
        Розбір польотів — third: у if-частині Past Perfect. <i>tested</i> зсунув би розмову в
        уявне сьогодні, а would have в умові не буває.
      </>
    ),
  },
  {
    q: 'What ___ if the investor had said no?',
    hint: 'Що б ти зробив, якби інвестор тоді відмовився?',
    options: ['would you do', 'would you have done', 'did you do'],
    answer: 1,
    why: (
      <>
        Умова в Past Perfect — минула розвилка, тому й результат про тоді: <b>would have +
        V3</b>. <i>would you do</i> означало б наслідок у теперішньому — це вже змішаний тип.
      </>
    ),
  },
  {
    q: 'If I had saved the file, I ___ it now.',
    hint: 'Якби я зберіг файл, я б зараз його не переписував.',
    options: ["wouldn't have rewritten", "wouldn't be rewriting", "didn't rewrite"],
    answer: 1,
    why: (
      <>
        Маркер <b>now</b>: наслідок триває зараз, тому would + V1 (тут у тривалій формі), без
        have. Причина в минулому + наслідок у теперішньому = змішаний тип.
      </>
    ),
  },
  {
    q: "I'll call you as soon as I ___.",
    hint: 'Я подзвоню, щойно приїду.',
    options: ['will arrive', 'arrive', 'would arrive'],
    answer: 1,
    why: (
      <>
        Закон if-частини накриває всі слова часу: після <i>as soon as, when, until</i> —
        теперішній час, хоч ідеться про майбутнє.
      </>
    ),
  },
  {
    q: '___ you hurry, we’ll miss the train.',
    hint: 'Якщо не поквапишся, ми пропустимо потяг.',
    options: ['If', 'Unless', 'In case'],
    answer: 1,
    why: (
      <>
        «Якщо не» одним словом — <b>unless</b>, і після нього ствердна форма: заперечення вже
        вбудоване. If дав би протилежний зміст, in case — це страховка наперед.
      </>
    ),
  },
  {
    q: 'Take an umbrella ___ it rains.',
    hint: 'Візьми парасольку — раптом дощ.',
    options: ['if', 'in case', 'unless'],
    answer: 1,
    why: (
      <>
        Парасольку беруть <i>до</i> дощу, про всяк випадок — це <b>in case</b>. З if вийшло б
        «візьми, коли вже падатиме».
      </>
    ),
  },
  {
    q: 'I wish I ___ more time for side projects.',
    hint: 'Шкода, що в мене мало часу на власні проєкти.',
    options: ['would have', 'had', 'have'],
    answer: 1,
    why: (
      <>
        Жаль про зараз — wish + Past Simple. wish + would про себе не працює: would там — лише
        про чужі звички й речі поза вашим контролем.
      </>
    ),
  },
  {
    q: 'I wish I ___ that job last spring.',
    hint: 'Шкода, що я не взяв ту роботу минулої весни.',
    options: ['took', 'had taken', 'would take'],
    answer: 1,
    why: (
      <>
        Жаль про минулу весну — wish + <b>Past Perfect</b>: та сама глибина, що в third
        conditional. <i>took</i> означало б жаль про теперішній стан.
      </>
    ),
  },
  {
    q: 'I wish he ___ his phone in meetings.',
    hint: 'Та вимкнув би він уже звук на нарадах!',
    options: ['muted', 'would mute', 'had muted'],
    answer: 1,
    why: (
      <>
        Роздратування чужою повторюваною звичкою — <b>wish + would</b>. Це єдине місце, де would
        стоїть одразу після wish — і лише про інших.
      </>
    ),
  },
  {
    q: 'If we won this tender, we would double the team. — Що каже мовець?',
    options: ['Тендер майже виграно', 'У перемогу він не дуже вірить', 'Тендер уже програно'],
    answer: 1,
    why: (
      <>
        Past Simple + would — second: уявне, малоймовірне. Якби він вірив у перемогу, сказав би
        first: <i>If we win…, we will…</i> Про програний тендер було б third: <i>If we had
        won…</i>
      </>
    ),
  },
  {
    q: 'You can work remotely ___ you join the daily call.',
    hint: 'Можеш працювати віддалено — за умови, що будеш на дейлі.',
    options: ['unless', 'as long as', 'even if'],
    answer: 1,
    why: (
      <>
        Дозвіл з умовою-вимогою — <b>as long as</b> («за умови, що / поки»). unless перевернув
        би зміст, even if — «навіть якщо».
      </>
    ),
  },
  {
    q: 'If she ___ more careful, she wouldn’t have deleted the database.',
    hint: 'Якби вона була уважніша, вона б не видалила базу.',
    options: ['had been', 'were', 'would be'],
    answer: 1,
    why: (
      <>
        Уважність — риса, актуальна й зараз: Past Simple (were). Наслідок — одна минула подія:
        would have + V3. Змішаний тип: кожне плече бере граматику свого часу. <i>had been</i>{' '}
        теж граматично можливе, але означало б «якби була уважніша тоді, в той вечір».
      </>
    ),
  },
  {
    q: 'Де кома зайва?',
    options: [
      'If it rains, we stay home.',
      'We stay home, if it rains.',
      'If you need help, just ping me.',
    ],
    answer: 1,
    why: (
      <>
        Кома ставиться лише коли if-частина стоїть <b>першою</b>. Другою — без коми: <i>We stay
        home if it rains.</i>
      </>
    ),
  },
  {
    q: "If we'd known about the leak, we would've fixed it. — Що таке 'd?",
    options: ['would', 'had', 'did'],
    answer: 1,
    why: (
      <>
        Перед V3 (<i>known</i>) — це <b>had</b>: Past Perfect умови third. <i>would</i>{' '}
        скорочується так само (’d), але стоїть перед V1: <i>I’d know</i>. Розрізняє їх наступна
        форма дієслова.
      </>
    ),
  },
  {
    q: 'I hope you ___ the exam next week.',
    hint: 'Сподіваюсь, ти складеш іспит наступного тижня.',
    options: ['passed', 'pass', 'would pass'],
    answer: 1,
    why: (
      <>
        <b>hope</b> — не wish: він живе в реальному світі й бере звичайні часи без зсувів.
        Зсунете час після hope — і побажання перетвориться на зітхання.
      </>
    ),
  },
  {
    q: 'Even if we ___ now, we will still be late.',
    hint: 'Навіть якщо вийдемо зараз, ми все одно запізнимось.',
    options: ['will leave', 'leave', 'left'],
    answer: 1,
    why: (
      <>
        even if — той самий закон if-частини: без will. А <i>left</i> зробило б умову уявною
        (second) — але друге плече з will каже, що план цілком реальний.
      </>
    ),
  },
];

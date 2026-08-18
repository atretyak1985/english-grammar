import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Минулі часи».
   Розділ 8 — переклад з української (25 речень, чотири блоки).
   Розділ 11 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — Past Simple',
  items: [
    {
      q: 'Учора я задеплоїв нову версію.',
      a: 'Yesterday I deployed the new version.',
      hint: (
        <>
          Past Simple: є <i>yesterday</i>. Не <i>have deployed</i>!
        </>
      ),
    },
    {
      q: 'Він не прийшов на стендап.',
      a: "He didn't come to the standup.",
      hint: (
        <>
          Після <i>didn&apos;t</i> — початкова форма <i>come</i>, а не <i>came</i>.
        </>
      ),
    },
    {
      q: 'Коли ти почав працювати в цій компанії?',
      a: 'When did you start working at this company?',
      hint: (
        <>
          Питання «коли» про минуле → тільки Past Simple. Ніколи <i>When have you started</i>.
        </>
      ),
    },
    {
      q: 'Ми прожили в Києві вісім років.',
      a: 'We lived in Kyiv for eight years.',
      hint: (
        <>
          Період закінчився → Simple + <i>for</i>. Якби досі жили: <i>We have lived…</i>
        </>
      ),
    },
    {
      q: 'Раніше я грав на гітарі щодня.',
      a: 'I used to play guitar every day.',
      hint: (
        <>
          «Раніше, а зараз ні» → <i>used to + V1</i>. Варіант <i>I played guitar every day</i> теж
          правильний, але менш виразний.
        </>
      ),
    },
    {
      q: 'Я не був на тій зустрічі.',
      a: "I wasn't at that meeting.",
      hint: (
        <>
          З <i>be</i> ніякого <i>didn&apos;t</i>: ✗ <i>I didn&apos;t was</i>.
        </>
      ),
    },
    {
      q: 'Скільки коштував ремонт?',
      a: 'How much did the repair cost?',
      hint: (
        <>
          <i>cost</i> — неправильне дієслово, але після <i>did</i> це не має значення: форма
          початкова.
        </>
      ),
    },
    {
      q: 'Збій тривав сорок хвилин.',
      a: 'The outage lasted forty minutes.',
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — Past Continuous',
  items: [
    {
      q: 'О восьмій вечора я ще працював.',
      a: 'At 8 p.m. I was still working.',
      hint: (
        <>
          Конкретний момент + процес → Continuous. <i>still</i> ставиться після <i>was</i>.
        </>
      ),
    },
    {
      q: 'Я їхав додому, коли подзвонив клієнт.',
      a: 'I was driving home when the client called.',
      hint: (
        <>
          Довга дія (Continuous) + коротка після <i>when</i> (Simple).
        </>
      ),
    },
    {
      q: 'Поки вона презентувала, я робив нотатки.',
      a: 'While she was presenting, I was taking notes.',
      hint: 'Дві паралельні довгі дії → обидві в Continuous.',
    },
    {
      q: 'Що ти робив учора о шостій?',
      a: 'What were you doing at six yesterday?',
      hint: (
        <>
          Не <i>What did you do</i> — це питання про послідовність подій, а не про момент.
        </>
      ),
    },
    {
      q: 'Він постійно змінював вимоги. (з роздратуванням)',
      a: 'He was constantly changing the requirements.',
      hint: (
        <>
          Continuous + <i>always / constantly</i> = емоція, не нейтральний факт.
        </>
      ),
    },
    {
      q: 'Я хотів запитати, чи можемо перенести дзвінок.',
      a: 'I was wondering if we could move the call.',
      hint: "Найкорисніша ввічлива формула. Запам'ятайте цілим блоком.",
    },
    {
      q: 'Я не знав, що вона вже пішла.',
      a: "I didn't know she had already left.",
      hint: (
        <>
          ✗ <i>I wasn&apos;t knowing</i> — <i>know</i> це дієслово стану. А «вже пішла» — крок назад
          → Past Perfect.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — Past Perfect',
  items: [
    {
      q: 'Коли я приїхав, зустріч уже закінчилась.',
      a: 'When I arrived, the meeting had already finished.',
      hint: (
        <>
          <i>already</i> ставиться між <i>had</i> і V3.
        </>
      ),
    },
    {
      q: 'Деплой упав, бо ми не запустили тести.',
      a: "The deploy failed because we hadn't run the tests.",
      hint: (
        <>
          Причина завжди раніша за наслідок. <i>run — ran — run</i>.
        </>
      ),
    },
    {
      q: 'До того я ніколи не бачив такої помилки.',
      a: 'I had never seen an error like that before.',
    },
    {
      q: 'Він сказав, що вже надіслав рахунок.',
      a: 'He said he had already sent the invoice.',
      hint: 'Непряма мова: «I sent» → «he had sent».',
    },
    {
      q: 'Якби ми додали моніторинг, ми б помітили це раніше.',
      a: 'If we had added monitoring, we would have caught it earlier.',
      hint: (
        <>
          Третій умовний: <i>If + had + V3, … would have + V3</i>.
        </>
      ),
    },
    {
      q: 'На момент, коли клієнт підключився, ми вже все виправили.',
      a: 'By the time the client joined, we had already fixed everything.',
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — змішані, найскладніші',
  items: [
    {
      q: 'Я писав звіт, коли зрозумів, що видалив дані.',
      a: 'I was writing the report when I realised I had deleted the data.',
      hint: 'Усі три часи в одному реченні: процес → подія → крок назад.',
    },
    {
      q: 'Вона була виснажена — вона працювала з шостої ранку.',
      a: 'She was exhausted — she had been working since 6 a.m.',
      hint: 'Past Perfect Continuous: важлива саме тривалість процесу.',
    },
    {
      q: 'Спершу я відкрив логи, потім знайшов причину і задеплоїв фікс.',
      a: 'First I opened the logs, then I found the root cause and deployed a fix.',
      hint: (
        <>
          Проста хронологія → Past Simple усюди. Ніякого <i>had</i>!
        </>
      ),
    },
    {
      q: 'Я збирався тобі подзвонити, але зустріч затягнулась.',
      a: 'I was going to call you, but the meeting ran over.',
      hint: (
        <>
          <i>was going to</i> = «збирався, але не зробив». <i>run over</i> = затягнутись за
          розкладом.
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
      q: 'I (write) ___ the report when the fire alarm (go off) ___.',
      a: 'was writing … went off',
      hint: 'Довга дія + коротке переривання.',
    },
    {
      q: 'By the time we (arrive) ___, the demo (already / start) ___.',
      a: 'arrived … had already started',
      hint: (
        <>
          <i>By the time</i> → перша дія в Past Perfect.
        </>
      ),
    },
    {
      q: 'She (not / know) ___ about the change because nobody (tell) ___ her.',
      a: "didn't know … had told",
      hint: (
        <>
          <i>know</i> — стан, тому Simple. Причина раніша → Past Perfect.
        </>
      ),
    },
    {
      q: 'What ___ you ___ (do) at 10 p.m. yesterday?',
      a: 'were … doing',
      hint: 'Питання про момент → Continuous.',
    },
    {
      q: 'First I (open) ___ the logs, then I (find) ___ the bug.',
      a: 'opened … found',
      hint: 'Проста хронологія → Past Simple.',
    },
    {
      q: 'While the team (test) ___, I (write) ___ the release notes.',
      a: 'was testing … was writing',
      hint: 'Дві паралельні довгі дії.',
    },
    {
      q: 'It (be) ___ the first time I ___ (fly) a drone that big.',
      a: 'was … had flown',
      hint: (
        <>
          <i>It was the first time</i> → Past Perfect.
        </>
      ),
    },
    {
      q: 'He (say) ___ he ___ (finish) the migration the night before.',
      a: 'said … had finished',
      hint: 'Непряма мова, зсув назад.',
    },
    {
      q: '___ you ___ (see) the alert this morning?',
      a: 'Did … see',
      hint: 'Ранок закінчився → Past Simple, а не Present Perfect.',
    },
    {
      q: 'The road (be) ___ wet because it ___ (rain).',
      a: 'was … had rained',
      hint: (
        <>
          Або <b>had been raining</b> — якщо наголос на тривалості дощу.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  items: [
    {
      q: 'Did you sent the report?',
      a: 'Did you send the report?',
      hint: (
        <>
          Після <i>did</i> — початкова форма.
        </>
      ),
    },
    {
      q: 'I have finished the task yesterday.',
      a: 'I finished the task yesterday.',
      hint: (
        <>
          <i>yesterday</i> несумісне з Present Perfect.
        </>
      ),
    },
    {
      q: 'I was knowing that already.',
      a: 'I knew that already.',
      hint: (
        <>
          <i>know</i> — дієслово стану.
        </>
      ),
    },
    {
      q: 'When I have arrived, they already left.',
      a: 'When I arrived, they had already left.',
      hint: 'Дві помилки: час прибуття → Simple; те, що сталося раніше → Perfect.',
    },
    {
      q: 'It happened during I was on the call.',
      a: 'It happened while I was on the call.',
      hint: (
        <>
          <i>during</i> + іменник, <i>while</i> + речення.
        </>
      ),
    },
    {
      q: "I didn't was at the office.",
      a: "I wasn't at the office.",
      hint: (
        <>
          <i>be</i> не вживає <i>did</i>.
        </>
      ),
    },
    {
      q: 'Yesterday I had gone to the client and had discussed the scope.',
      a: 'Yesterday I went to the client and discussed the scope.',
      hint: 'Надмірний Past Perfect — тут проста хронологія.',
    },
    {
      q: 'I was working there since five years.',
      a: 'I worked there for five years.',
      hint: (
        <>
          Дві помилки: <i>for</i> замість <i>since</i>, і завершений період → Simple.
        </>
      ),
    },
    {
      q: "Why you didn't tell me?",
      a: "Why didn't you tell me?",
      hint: 'Інверсія: допоміжне дієслово перед підметом.',
    },
    {
      q: 'He was always push to main without review.',
      a: 'He was always pushing to main without review.',
      hint: (
        <>
          Після <i>was</i> потрібна форма -ing.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — обʼєднайте два речення, показавши порядок подій',
  lede: 'Використайте when / by the time / before / after і потрібний час.',
  items: [
    {
      q: 'The team left the office. + I got there.',
      a: 'By the time I got there, the team had left the office.',
    },
    {
      q: 'We ran the tests. + We deployed.',
      a: 'After we ran the tests, we deployed.',
      hint: (
        <>
          Тут <i>after</i> уже показує порядок — Past Perfect зайвий.
        </>
      ),
    },
    {
      q: 'She was presenting. + The projector died.',
      a: 'She was presenting when the projector died.',
    },
    {
      q: 'I forgot to update the firmware. + The drone lost signal.',
      a: 'The drone lost signal because I had forgotten to update the firmware.',
    },
    {
      q: 'I sent the email. + She called me.',
      a: 'I had just sent the email when she called me.',
      hint: (
        <>
          <i>just</i> між <i>had</i> і V3 — «щойно».
        </>
      ),
    },
  ],
};

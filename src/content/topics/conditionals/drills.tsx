import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Умовні речення».
   Розділ 11 — переклад з української (25 речень, чотири блоки).
   Розділ 14 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — реальні умови: zero і first',
  items: [
    {
      q: 'Якщо натиснути цю кнопку, принтер перезавантажується.',
      a: 'If you press this button, the printer restarts.',
      hint: (
        <>
          Правило, що діє щоразу, — zero: Present Simple в обох плечах. Українське неозначене
          «натиснути» англійською бере підмет you.
        </>
      ),
    },
    {
      q: 'Якщо тести пройдуть, ми викотимо реліз у пʼятницю.',
      a: 'If the tests pass, we will deploy the release on Friday.',
      accepted: ['If the tests pass, we will ship the release on Friday.'],
      hint: (
        <>
          Українське майбутнє «пройдуть» лишається в українській: у if-частині — <i>pass</i>,
          will живе тільки в результаті.
        </>
      ),
    },
    {
      q: 'Якщо я запізнюся, починайте без мене.',
      a: 'If I am late, start without me.',
      hint: (
        <>
          Результат-наказ: формула first не ламається, if-частина та сама — Present Simple. ✗{' '}
          <i>If I will be late</i>.
        </>
      ),
    },
    {
      q: 'Я подзвоню тобі, щойно приїду.',
      a: 'I will call you as soon as I arrive.',
      accepted: ["I'll call you as soon as I arrive.", 'I will call you as soon as I get there.'],
      hint: (
        <>
          Закон if-частини накриває і слова часу: після <i>as soon as</i> — теперішній час, ✗{' '}
          <i>as soon as I will arrive</i>.
        </>
      ),
    },
    {
      q: 'Якщо клієнт не заплатить до пʼятниці, ми призупинимо проєкт.',
      a: "If the client doesn't pay by Friday, we will pause the project.",
      accepted: ["If the client doesn't pay by Friday, we will suspend the project."],
      hint: (
        <>
          Заперечення в умові — звичайне <i>doesn’t</i>, без will: прогнозує лише друге плече.
        </>
      ),
    },
    {
      q: 'Якщо вода закипає, вона перетворюється на пару.',
      a: 'If water boils, it turns into steam.',
      accepted: ['When water boils, it turns into steam.'],
      hint: <>Закон природи — zero, і if тут вільно міняється на when.</>,
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — уявне сьогодні: second',
  items: [
    {
      q: 'Якби я мав більше часу, я б вивчив польську.',
      a: 'If I had more time, I would learn Polish.',
      hint: (
        <>
          «Б» у результаті + мова про зараз = second: Past Simple в умові, would у результаті. ✗{' '}
          <i>If I would have more time</i>.
        </>
      ),
    },
    {
      q: 'На твоєму місці я б погодився.',
      a: 'If I were you, I would agree.',
      accepted: ['If I were you, I would accept.', 'If I were in your place, I would agree.'],
      hint: (
        <>
          Формула поради: <b>If I were you</b> — умовне were для всіх осіб. was у письмі не
          ставте.
        </>
      ),
    },
    {
      q: 'Якби офіс був ближче, я б їздив на роботу велосипедом.',
      a: 'If the office were closer, I would cycle to work.',
      accepted: [
        'If the office was closer, I would cycle to work.',
        'If the office were closer, I would ride a bike to work.',
      ],
      hint: <>Офіс і зараз далеко — уявне сьогодні, а не минуле: Past Simple + would.</>,
    },
    {
      q: 'Що б ти зробив, якби виграв мільйон?',
      a: 'What would you do if you won a million?',
      hint: (
        <>
          Питання будує результатне плече: <i>What would you do…</i> If-частина стоїть другою —
          коми немає.
        </>
      ),
    },
    {
      q: 'Якби ми не орендували офіс, ми могли б найняти ще одного розробника.',
      a: "If we didn't rent the office, we could hire another developer.",
      accepted: ["If we didn't rent an office, we could hire one more developer."],
      hint: (
        <>
          «Могли б» — <i>could</i> у результаті замість would: та сама формула second, інший
          модальний відтінок.
        </>
      ),
    },
    {
      q: 'Я б не хвилювався: гарантія ще діє.',
      a: "I wouldn't worry: the warranty is still valid.",
      accepted: ["I wouldn't worry, the warranty is still valid."],
      hint: (
        <>
          If-частина зникла, бо очевидна з контексту («якби я був тобою») — would сам тримає
          уявність.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — минуле, якого не було: third і змішані',
  items: [
    {
      q: 'Якби ми зробили бекап, ми б відновили все за годину.',
      a: 'If we had made a backup, we would have restored everything in an hour.',
      hint: (
        <>
          Розмова після катастрофи: обидві форми довгі — had + V3 в умові, would have + V3 у
          результаті.
        </>
      ),
    },
    {
      q: 'Якби ти сказав мені вчора, я б не купив квитки.',
      a: "If you had told me yesterday, I wouldn't have bought the tickets.",
      hint: (
        <>
          «Вчора» — якір у минулому, тому third. Скорочене <i>If you told me…</i> зʼїхало б у
          теперішнє.
        </>
      ),
    },
    {
      q: 'Що б ви зробили, якби інвестор тоді відмовився?',
      a: 'What would you have done if the investor had said no?',
      accepted: ['What would you have done if the investor had refused?'],
      hint: (
        <>
          Питання про минулу розвилку: <i>would you have done</i> + if + Past Perfect.
        </>
      ),
    },
    {
      q: 'Якби я зберіг файл, я б зараз його не переписував.',
      a: "If I had saved the file, I wouldn't be rewriting it now.",
      hint: (
        <>
          Змішаний: причина вчора (had saved), наслідок триває зараз (wouldn’t be rewriting +{' '}
          <b>now</b>). Have після would тут не потрібне.
        </>
      ),
    },
    {
      q: 'Якби він був уважніший, він би не видалив базу.',
      a: "If he were more careful, he wouldn't have deleted the database.",
      accepted: ["If he was more careful, he wouldn't have deleted the database."],
      hint: (
        <>
          Змішаний навпаки: неуважність — риса й зараз (were), видалена база — одна минула подія
          (wouldn’t have deleted).
        </>
      ),
    },
    {
      q: 'Ми могли б встигнути, якби виїхали на годину раніше.',
      a: 'We could have made it if we had left an hour earlier.',
      accepted: ['We could have made it in time if we had left an hour earlier.'],
      hint: (
        <>
          «Могли б (тоді)» — <i>could have + V3</i>. If-частина друга — без коми.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — unless, in case, I wish',
  items: [
    {
      q: 'Ми пропустимо дедлайн, якщо не поквапимось.',
      a: "We'll miss the deadline unless we hurry.",
      accepted: ["We will miss the deadline unless we hurry.", "We'll miss the deadline if we don't hurry."],
      hint: (
        <>
          unless = «якщо не», заперечення вже вбудоване: ✗ <i>unless we don’t hurry</i>.
        </>
      ),
    },
    {
      q: 'Візьми зарядний — раптом телефон сяде.',
      a: 'Take the charger in case your phone dies.',
      accepted: ['Take a charger in case your phone dies.'],
      hint: (
        <>
          «Раптом» — маркер страховки наперед: <b>in case</b>, не if. З if вийшло б «візьмеш,
          коли вже сяде».
        </>
      ),
    },
    {
      q: 'Можеш працювати віддалено — за умови, що будеш на дейлі.',
      a: 'You can work remotely as long as you join the daily call.',
      accepted: [
        'You can work remotely as long as you join the daily.',
        'You can work remotely provided that you join the daily call.',
      ],
      hint: (
        <>
          Умова-контракт: <b>as long as</b> або <b>provided (that)</b>. І без will після них.
        </>
      ),
    },
    {
      q: 'Шкода, що в мене так мало часу.',
      a: 'I wish I had more time.',
      hint: (
        <>
          Жаль про зараз → wish + Past Simple. Українське «шкода, що мало» англійською
          розвертається в «хотів би мати більше».
        </>
      ),
    },
    {
      q: 'Краще б ми забронювали готель раніше.',
      a: 'I wish we had booked the hotel earlier.',
      accepted: ['If only we had booked the hotel earlier.'],
      hint: <>Жаль про минуле → wish + Past Perfect. if only — те саме, лише емоційніше.</>,
    },
    {
      q: 'Та вимкнув би він уже звук на телефоні на нарадах!',
      a: 'I wish he would mute his phone in meetings.',
      hint: (
        <>
          Роздратування чужою звичкою → wish + would. Про себе так не можна: ✗{' '}
          <i>I wish I would…</i>
        </>
      ),
    },
    {
      q: 'Навіть якби вони подвоїли ставку, я б не погодився.',
      a: "Even if they doubled the offer, I wouldn't agree.",
      accepted: ["I wouldn't agree even if they doubled the offer."],
      hint: (
        <>
          even if + та сама механіка second: Past Simple в умові, would у результаті.
        </>
      ),
    },
  ],
};

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — розкрийте дужки',
  lede: 'У кожному реченні визначте реальність — і поверніть ручку на потрібний щабель.',
  items: [
    {
      q: <>If the meeting (run) late, I (text) you.</>,
      a: <>If the meeting <b>runs</b> late, I <b>will text</b> you.</>,
      hint: 'Реальний план на сьогодні — first: Present Simple в умові, will у результаті.',
    },
    {
      q: <>If I (be) you, I (apply) for that position.</>,
      a: <>If I <b>were</b> you, I <b>would apply</b> for that position.</>,
      hint: 'Порада = If I were you + would. Умовне were — для всіх осіб.',
    },
    {
      q: <>If you (heat) ice, it (melt).</>,
      a: <>If you <b>heat</b> ice, it <b>melts</b>.</>,
      hint: 'Закон природи — zero: Present Simple в обох плечах.',
    },
    {
      q: <>If we (know) about the traffic, we (leave) earlier yesterday.</>,
      a: <>If we <b>had known</b> about the traffic, we <b>would have left</b> earlier yesterday.</>,
      hint: '«Учора» — якір у минулому: third, обидві форми довгі.',
    },
    {
      q: <>If she (not/spend) everything on the trip, she (not/be) broke now.</>,
      a: <>If she <b>hadn’t spent</b> everything on the trip, she <b>wouldn’t be</b> broke now.</>,
      hint: 'Змішаний: витратила тоді (Past Perfect), сидить без грошей зараз (would + V1, маркер now).',
    },
    {
      q: <>I (wait) here until the review (finish).</>,
      a: <>I <b>will wait</b> here until the review <b>finishes</b>.</>,
      hint: 'until — слово часу, після нього will не ставлять: закон if-частини діє і тут.',
    },
    {
      q: <>What you (do) if you (win) the lottery tomorrow?</>,
      a: <>What <b>would</b> you <b>do</b> if you <b>won</b> the lottery tomorrow?</>,
      hint: 'Лотерея — мрія, а не план: second навіть про завтра. Реальність важливіша за слово tomorrow.',
    },
    {
      q: <>I wish I (take) that offer last spring.</>,
      a: <>I wish I <b>had taken</b> that offer last spring.</>,
      hint: 'Жаль про минулу весну → wish + Past Perfect.',
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  lede: 'У кожному реченні рівно одна помилка. Усі десять — з розділу 12.',
  items: [
    {
      q: <>If it will rain tomorrow, we’ll move the demo online.</>,
      a: <>If it <b>rains</b> tomorrow, we’ll move the demo online.</>,
      hint: 'Помилка ①: will не заходить у if-частину. Прогнозує лише результат.',
    },
    {
      q: <>If I would know the password, I would log in myself.</>,
      a: <>If I <b>knew</b> the password, I would log in myself.</>,
      hint: 'Помилка ②: would у if-частині не буває. Уявне сьогодні — Past Simple.',
    },
    {
      q: <>If we would have tested the migration, we would have caught the bug.</>,
      a: <>If we <b>had tested</b> the migration, we would have caught the bug.</>,
      hint: 'Та сама помилка ② у third: в умові — Past Perfect, would have — лише в результаті.',
    },
    {
      q: <>Unless you don’t confirm today, we’ll give the slot to someone else.</>,
      a: <>Unless you <b>confirm</b> today, we’ll give the slot to someone else.</>,
      hint: 'Помилка ⑥: unless уже містить «не». Друге заперечення перевертає зміст.',
    },
    {
      q: <>Take your laptop if the client wants to see a live demo.</>,
      a: <>Take your laptop <b>in case</b> the client wants to see a live demo.</>,
      hint: 'Помилка ⑦: ноутбук беруть заздалегідь, про всяк випадок — це in case, не if.',
    },
    {
      q: <>I wish I would have more experience with Kubernetes.</>,
      a: <>I wish I <b>had</b> more experience with Kubernetes.</>,
      hint: 'Помилка ⑧: про себе wish + would не працює. Жаль про зараз — wish + Past Simple.',
    },
    {
      q: <>We’ll send the contract<b>,</b> if legal approves it today.</>,
      a: <>We’ll send the contract if legal approves it today.</>,
      hint: 'Помилка ⑤: if-частина стоїть другою — кома не потрібна.',
    },
    {
      q: <>If you told me about the bug yesterday, I wouldn’t have shipped the release.</>,
      a: <>If you <b>had told</b> me about the bug yesterday, I wouldn’t have shipped the release.</>,
      hint: 'Помилка ④: результат уже в third (wouldn’t have shipped), а умова застрягла в second. «Учора» вимагає had + V3.',
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — доберіть тип',
  lede: 'Ситуація описана українською. Назвіть тип і складіть речення — потім звірте.',
  items: [
    {
      q: <>Ви пояснюєте новенькому правило команди: падає білд — відкочуємо останній коміт.</>,
      a: <>Zero: <b>If the build fails, we roll back the last commit.</b></>,
      hint: 'Правило, що діє щоразу, без прогнозів — Present Simple в обох плечах.',
    },
    {
      q: <>Ви домовляєтесь із колегою про завтра: якщо він закінчить рев’ю до обіду — ви зіллєте гілку ввечері.</>,
      a: <>First: <b>If you finish the review before noon, I will merge the branch tonight.</b></>,
      hint: 'Реальний план на конкретний день. У if-частині — finish, без will.',
    },
    {
      q: <>Ви мрієте вголос: зарплата вдвічі більша — і ви б уже не знімали, а купували квартиру.</>,
      a: <>Second: <b>If I earned twice as much, I would buy a flat instead of renting.</b></>,
      hint: 'Мрія про уявне сьогодні: Past Simple + would.',
    },
    {
      q: <>Розбір польотів: сервер упав уночі, бо ніхто не налаштував алерти ще місяць тому.</>,
      a: <>Third: <b>If we had set up the alerts a month ago, we would have noticed the crash immediately.</b></>,
      hint: 'Минуле, якого не переграти: had + V3 → would have + V3.',
    },
    {
      q: <>Той самий розбір, але наслідок триває досі: сервер досі лежить.</>,
      a: <>Змішаний: <b>If we had set up the alerts, the server wouldn’t be down now.</b></>,
      hint: 'Причина тоді — Past Perfect; наслідок зараз — would + V1 і маркер now.',
    },
    {
      q: <>Ви попереджаєте: без підтвердження до пʼятниці бронь згорить.</>,
      a: <>First з unless: <b>Unless you confirm by Friday, the booking will be cancelled.</b></>,
      hint: '«Якщо не підтвердиш» — unless + ствердна форма.',
    },
    {
      q: <>Колега щодня приходить на нараду без порядку денного, і вас це дратує.</>,
      a: <>wish + would: <b>I wish he would bring an agenda to the meetings.</b></>,
      hint: 'Скарга на чужу повторювану звичку — третя формула wish.',
    },
    {
      q: <>Ви зітхаєте: торік була можливість перейти в інший відділ, і ви нею не скористались.</>,
      a: <>wish + Past Perfect: <b>I wish I had moved to the other team last year.</b></>,
      hint: 'Жаль про минулу розвилку — wish + had + V3.',
    },
  ],
};

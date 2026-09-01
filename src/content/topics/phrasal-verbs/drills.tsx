import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Фразові дієслова».
   Розділ 12 — переклад з української (25 речень, чотири блоки).
   Розділ 14 — вправи A, B, C.
   Тема без часу: жодного TenseKey тут немає і бути не може.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — займенник іде всередину',
  items: [
    {
      q: 'Вимкни її — я не чую, що каже клієнт.',
      a: 'Turn it off — I can’t hear the client.',
      accepted: ['Turn it off — I cannot hear the client.', 'Switch it off — I can’t hear the client.'],
      hint: (
        <>
          Займенник у розділюваного дієслова має рівно одне місце — посередині. ✗{' '}
          <i>turn off it</i>: так каже майже кожен, бо українське <i>ви-мкни</i> — одне
          нерозривне слово, і <i>turn off</i> здається таким самим.
        </>
      ),
    },
    {
      q: 'Я передзвоню тобі одразу після стендапу.',
      a: 'I’ll call you back right after the standup.',
      accepted: ['I will call you back right after the standup.'],
      hint: (
        <>
          Той самий закон, але додаток — людина: <i>call <b>you</b> back</i>. ✗{' '}
          <i>call back you</i>. Перевірка на слух: наголос падає на <i>BACK</i>, отже{' '}
          <i>back</i> — частка, отже середина є.
        </>
      ),
    },
    {
      q: 'Запиши це, будь ласка — я потім не згадаю.',
      a: 'Write it down, please — I won’t remember later.',
      accepted: [
        'Write it down, please — I will not remember later.',
        'Please write it down — I won’t remember later.',
      ],
      hint: (
        <>
          <i>down</i> тут не «вниз», а «з голови на папір» — та сама метафора в{' '}
          <i>note down</i>, <i>jot down</i>, <i>take down</i>. Займенник знову всередину: ✗{' '}
          <i>write down it</i>.
        </>
      ),
    },
    {
      q: 'Оля забере їх зі школи о четвертій.',
      a: 'Olha will pick them up from school at four.',
      accepted: ['Olha is picking them up from school at four.'],
      hint: (
        <>
          <i>pick up</i> — розділюване, тому <i>them</i> сидить усередині. І без <i>up</i> це
          вже інше дієслово: <i>pick the kids</i> означало б «вибрати дітей».
        </>
      ),
    },
    {
      q: 'Не викидай це — воно мені ще знадобиться.',
      a: 'Don’t throw it away — I’ll still need it.',
      accepted: ['Do not throw it away — I will still need it.'],
      hint: (
        <>
          <i>away</i> — «геть від мене, аж поки не зникне». А позиція та сама: ✗{' '}
          <i>throw away it</i>. З іменником вибір є (<i>throw the box away</i> ·{' '}
          <i>throw away the box</i>), із займенником — немає.
        </>
      ),
    },
    {
      q: 'Вимкни світло в переговорці, яке ми вчора полагодили.',
      a: 'Turn off the light in the meeting room we fixed yesterday.',
      accepted: ['Switch off the light in the meeting room we fixed yesterday.'],
      hint: (
        <>
          Тут додаток довгий, та ще й тягне за собою підрядне речення, тому він іде{' '}
          <b>після частки</b>. <i>Turn the light in the meeting room we fixed yesterday off</i>{' '}
          — граматично бездоганно і нечитабельно: частка відірвалася на вісім слів.
        </>
      ),
    },
    {
      q: 'Гарна думка — я підніму це на ретро.',
      a: 'Good point — I’ll bring it up at the retro.',
      accepted: ['Good point — I will bring it up at the retro.'],
      hint: (
        <>
          Українське «підняти питання» тягне за собою ✗ <i>lift up a question</i>, і носій
          просто не зрозуміє. Питання <i>bring up</i> або <i>raise</i> — а займенник, як
          завжди, посередині.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — робота: фразове замість латинізму',
  items: [
    {
      q: 'Я розберуся й відпишу тобі до кінця дня.',
      a: 'I’ll look into it and get back to you by end of day.',
      accepted: [
        'I will look into it and get back to you by end of day.',
        'I’ll look into it and get back to you by the end of the day.',
      ],
      hint: (
        <>
          ✗ <i>I will investigate this problem and inform you about the results</i> — жодного
          граматичного огріху, і саме тому це помилка №1: текст звучить як перекладений
          документ, а не як людина. <b><i>look into</i> — стандарт ділового письма</b>, а не
          сленг.
        </>
      ),
    },
    {
      q: 'Демо перенесли на наступний тиждень.',
      a: 'The demo has been put off until next week.',
      accepted: [
        'They put the demo off until next week.',
        'The demo has been postponed until next week.',
      ],
      hint: (
        <>
          У Slack і на зустрічі кажуть <i>put off</i>, у реліз-нотах — <i>postpone</i>. Це не
          «правильне й неправильне», а різні жанри. Пастка: у <i>put off</i> є друге значення —
          «відштовхувати».
        </>
      ),
    },
    {
      q: 'Вона придумала гарне обхідне рішення.',
      a: 'She came up with a neat workaround.',
      accepted: ['She came up with a good workaround.'],
      hint: (
        <>
          Три слова — усі три обовʼязкові. ✗ <i>come up a solution</i>: друга частка здається
          надлишковою і «економиться» найчастіше саме тут. Без <i>with</i> речення значить
          «підійшла».
        </>
      ),
    },
    {
      q: 'Пройдімося по порядку денному, поки вони не приєдналися.',
      a: 'Let’s go over the agenda before they join.',
      accepted: ['Let us go over the agenda before they join.'],
      hint: (
        <>
          Наголос падає на <i>GO</i>, а не на <i>over</i>, — отже <i>over</i> прийменник і
          середини немає: ✗ <i>go the agenda over</i>. У письмі той самий сенс несе{' '}
          <i>review</i>.
        </>
      ),
    },
    {
      q: 'Ми виключили DNS і звузили коло до двох сервісів.',
      a: 'We ruled out DNS and narrowed it down to two services.',
      accepted: ['We have ruled out DNS and narrowed it down to two services.'],
      hint: (
        <>
          Обидва — перший ярус регістру: доречні навіть у письмовому звіті, латинізм тут нічого
          не додасть. І обидва розділювані, тому <i>it</i> у <i>narrowed it down</i> стоїть
          усередині.
        </>
      ),
    },
    {
      q: 'Хто підміняє Дена, поки він у відпустці?',
      a: 'Who’s filling in for Dan while he’s away?',
      accepted: ['Who is filling in for Dan while he is away?'],
      hint: (
        <>
          <i>fill in for</i> — підмінити людину; <i>fill in</i> без <i>for</i> — заповнити
          форму, а <i>fill someone in</i> — ввести в курс справи. Одне слово <i>for</i>{' '}
          перевертає і значення, і тип.
        </>
      ),
    },
    {
      q: 'Фінанси ще мають затвердити бюджет.',
      a: 'Finance still needs to sign off on the budget.',
      accepted: ['Finance still has to sign off on the budget.'],
      hint: (
        <>
          <i>sign off on</i> — тричастинне, додаток після обох часток. У британських офісах
          трапляється й <i>sign off the budget</i>, але з <i>on</i> вас зрозуміють скрізь.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — нерозділювані й тричастинні',
  items: [
    {
      q: 'Хто цього тижня відповідає за черговий телефон?',
      a: 'Who’s looking after the on-call phone this week?',
      accepted: ['Who is looking after the on-call phone this week?'],
      hint: (
        <>
          ✗ <i>look the phone after</i> — надто ретельне застосування правила з{' '}
          <i>turn off</i>. Тест наголосу: <i><b>LOOK</b> after</i> — наголос на дієслові, отже{' '}
          <i>after</i> прийменник, отже розділяти нема де.
        </>
      ),
    },
    {
      q: 'Я більше не можу терпіти ці нестабільні тести.',
      a: 'I can’t put up with these flaky tests any longer.',
      accepted: ['I cannot put up with these flaky tests any longer.'],
      hint: (
        <>
          Три слова → не розділюється ніколи, навіть займенником: <i>put up with them</i> ✓,{' '}
          <i>put them up with</i> ✗. Це найпростіший тип за правилами й найважчий для памʼяті.
        </>
      ),
    },
    {
      q: 'Я натрапив на цей стек-трейс у логах.',
      a: 'I came across this stack trace in the logs.',
      accepted: ['I ran into this stack trace in the logs.'],
      hint: (
        <>
          ✗ <i>I came this stack trace across</i>. І окремо про значення: <i>come across</i> —
          натрапити <b>випадково</b>; якщо шукали навмисно, це <i>find</i> або{' '}
          <i>track down</i>.
        </>
      ),
    },
    {
      q: 'Це залежить від навантаження на сервер.',
      a: 'It depends on the server load.',
      accepted: ['That depends on the server load.'],
      hint: (
        <>
          Українське «залежати <b>від</b>» перекладається в лоб і дає ✗ <i>depends from</i> —
          одна з найвпізнаваніших кальок. Англійська закріпила свій прийменник довільно:{' '}
          <i>depend on</i>, <i>wait for</i>, <i>listen to</i>.
        </>
      ),
    },
    {
      q: 'Я чекаю на відповідь замовника — без неї не почнемо.',
      a: 'I’m waiting for the client’s answer — we can’t start without it.',
      accepted: ['I am waiting for the client’s reply — we cannot start without it.'],
      hint: (
        <>
          ✗ <i>waiting on your answer</i>: у британському <i>wait on</i> означає
          «обслуговувати за столом». В американській розмові <i>wait on</i> = <i>wait for</i>{' '}
          трапляється, але для листа беріть <i>for</i>.
        </>
      ),
    },
    {
      q: 'З нетерпінням чекаю зустрічі з вами в понеділок.',
      a: 'I’m looking forward to meeting you on Monday.',
      accepted: ['I look forward to meeting you on Monday.'],
      hint: (
        <>
          Кінцеве <i>to</i> тут прийменник, а не частка інфінітива, тому далі <i>-ing</i>: ✗{' '}
          <i>to meet</i>. Перевірка: після нього можна поставити іменник —{' '}
          <i>look forward to the meeting</i> ✓. Перед часткою інфінітива іменник неможливий.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — побут, гроші, подорожі',
  items: [
    {
      q: 'У нас знову закінчилася кава.',
      a: 'We’ve run out of coffee again.',
      accepted: ['We have run out of coffee again.', 'We ran out of coffee again.'],
      hint: (
        <>
          <i>out</i> — «вичерпалося те, що було всередині». Перед додатком обовʼязкове{' '}
          <i>of</i>: ✗ <i>run out coffee</i>. Без додатка <i>of</i> зникає:{' '}
          <i>We&apos;re running out</i>.
        </>
      ),
    },
    {
      q: 'Я підвезу дітей дорогою в офіс.',
      a: 'I’ll drop the kids off on the way in.',
      accepted: ['I will drop the kids off on the way in.', 'I’ll drop off the kids on the way in.'],
      hint: (
        <>
          Додаток-іменник має обидві позиції: <i>drop the kids off</i> ·{' '}
          <i>drop off the kids</i>. Вибір зникає рівно тоді, коли зʼявляється займенник:
          тільки <i>drop them off</i>.
        </>
      ),
    },
    {
      q: 'Ми виплатили кредит, і рефакторинг таки окупився.',
      a: 'We paid off the loan, and the refactor really paid off.',
      accepted: ['We paid the loan off, and the refactor really paid off.'],
      hint: (
        <>
          Та сама пара слів двічі — і типи різні: <i>pay off the loan</i> розділюване (<i>pay
          it off</i>), а <i>the refactor paid off</i> неперехідне, там розділяти нема чим.
        </>
      ),
    },
    {
      q: 'Увімкни компʼютер і зайди під робочим акаунтом.',
      a: 'Turn on the computer and log in with your work account.',
      accepted: [
        'Turn the computer on and log in with your work account.',
        'Switch on the computer and log in with your work account.',
      ],
      hint: (
        <>
          ✗ <i>Include the computer</i>: корінь «включ-» тягне за собою <i>include</i>, і
          виходить речення, якого носій не зрозуміє взагалі. Прилади — <i>turn on</i> або{' '}
          <i>switch on</i>.
        </>
      ),
    },
    {
      q: 'Ми зробили пересадку в Досі й приземлилися аж уночі.',
      a: 'We stopped over in Doha and touched down late at night.',
      accepted: ['We stopped over in Doha and only touched down at night.'],
      hint: (
        <>
          Обидва неперехідні: додатка немає, отже питання «куди його ставити» не виникає
          взагалі. Саме тому неперехідні — найлегший з чотирьох типів.
        </>
      ),
    },
  ],
};

/* ---------- Розділ 14 — вправи ---------- */

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — поставте додаток на його місце',
  lede: 'У дужках — дієслово й додаток окремо. Складіть їх у правильному порядку. Спершу назвіть тип: якщо середини немає, то й вибору немає.',
  items: [
    {
      q: 'The music is too loud — can you ___? (turn off · it)',
      a: 'turn it off',
      hint: (
        <>
          Розділюване плюс займенник = одна-єдина позиція. ✗ <i>turn off it</i>.
        </>
      ),
    },
    {
      q: 'Your train gets in at seven — I’ll ___ from the station. (pick up · you)',
      a: 'pick you up',
      hint: (
        <>
          Людина-займенник поводиться так само, як <i>it</i>: усередину. ✗{' '}
          <i>pick up you</i>.
        </>
      ),
    },
    {
      q: 'Don’t ___ — I need that box for the monitor. (throw away · it)',
      a: 'throw it away',
      hint: (
        <>
          З іменником були б обидві позиції (<i>throw the box away</i> ·{' '}
          <i>throw away the box</i>); займенник скорочує їх до однієї.
        </>
      ),
    },
    {
      q: 'Who’s going to ___ while she’s on leave? (look after · the on-call phone)',
      a: 'look after the on-call phone',
      hint: (
        <>
          Наголос на <i><b>LOOK</b></i> → <i>after</i> прийменник → середини немає. ✗{' '}
          <i>look the phone after</i>.
        </>
      ),
    },
    {
      q: 'We need to ___ before Friday. (sort out · the permissions)',
      a: 'sort out the permissions · sort the permissions out — правильні обидва',
      hint: (
        <>
          Короткий і вже знайомий додаток охоче йде всередину, новий і наголошений — після
          частки. Саме тому мова тримає два порядки, а не один.
        </>
      ),
    },
    {
      q: 'Please ___ that we agreed on in yesterday’s retro. (write down · every action item)',
      a: 'write down every action item',
      hint: (
        <>
          За додатком тут тягнеться підрядне речення, тому місце йому — після частки. Інакше{' '}
          <i>down</i> опиниться за вісім слів від <i>write</i>.
        </>
      ),
    },
    {
      q: 'I can’t ___ any longer. (put up with · these flaky tests)',
      a: 'put up with these flaky tests',
      hint: (
        <>
          Три слова — жодного руху. Навіть займенник іде після всіх трьох:{' '}
          <i>put up with them</i>.
        </>
      ),
    },
    {
      q: 'Finance still has to ___ before we can hire. (sign off on · the budget)',
      a: 'sign off on the budget',
      hint: (
        <>
          Теж тричастинне. Порівняйте з <i>sign the contract</i>: там звичайне дієслово з
          додатком і жодних часток — тому й порядок інший.
        </>
      ),
    },
    {
      q: 'The release is broken — ___ to 2.4. (roll back · it)',
      a: 'roll it back',
      hint: (
        <>
          <i>Roll back the release</i> ✓ теж правильно — але щойно додаток став займенником,
          вибір зник.
        </>
      ),
    },
    {
      q: 'The kids are fine — my sister ___ on Fridays. (look after · them)',
      a: 'looks after them',
      hint: (
        <>
          Найважливіший пункт вправи: ✗ <i>looks them after</i>. Правило «займенник —
          усередину» діє тільки там, де середина <b>є</b>. У нерозділюваного її немає, і
          займенник нічого не змінює.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — виберіть частку',
  lede: 'Дієслово дано, частки немає. Підказує тільки контекст речення — рівно так це працює і в житті.',
  items: [
    {
      q: 'They liked the demo, but in the end they turned our proposal ___.',
      a: 'down',
      hint: (
        <>
          <i>down</i> = вниз, менше — і звідси «відхилити». Той самий корінь дає{' '}
          <i>turn it up</i> (гучніше), <i>turn it off</i> (вимкнути), <i>turn it in</i>{' '}
          (здати). <b>Різницю несе тільки частка</b>, тому вчити треба її, а не корінь.
        </>
      ),
    },
    {
      q: 'Half the team was sick, so we called the workshop ___.',
      a: 'off',
      hint: (
        <>
          <i>off</i> = відірвати від графіка. І зверніть увагу на межу: <i>call off</i> —
          скасувати зовсім, <i>put off</i> — лише перенести.
        </>
      ),
    },
    {
      q: 'Don’t throw that box ___ — I need it for the monitor.',
      a: 'away',
      hint: (
        <>
          <i>away</i> = геть від мене, аж поки не зникне з поля зору. Так само{' '}
          <i>give away</i>, <i>send away</i>, <i>fade away</i>.
        </>
      ),
    },
    {
      q: 'We’ve run ___ of staging credits again.',
      a: 'out',
      hint: (
        <>
          <i>out</i> = те, що було всередині, скінчилося. Перед додатком тут обовʼязкове{' '}
          <i>of</i>: ✗ <i>run out credits</i>.
        </>
      ),
    },
    {
      q: 'The build server broke ___ twice this week.',
      a: 'down',
      hint: (
        <>
          Та сама частка, що в пункті 1, але тут це не «менше», а «зупинилося». <i>down</i>{' '}
          покриває і зменшення, і запис (<i>write down</i>), і поломку — три сусідні метафори
          одного напрямку.
        </>
      ),
    },
    {
      q: 'Back the database ___ before you run the migration.',
      a: 'up',
      hint: (
        <>
          Рідкісний випадок: тут <i>back</i> — саме дієслово, а <i>up</i> — частка. У{' '}
          <i>back down</i> (відступити) і <i>back off</i> (відчепитися) те саме слово грає ту
          саму роль, а значення розходяться.
        </>
      ),
    },
    {
      q: 'It turned ___ to be a config typo, not a network issue.',
      a: 'out',
      hint: (
        <>
          <i>out</i> = вийшло назовні, стало видно. Звідси ж <i>find out</i>,{' '}
          <i>figure out</i>, <i>point out</i> — усе про появу на видноті.
        </>
      ),
    },
    {
      q: 'Let’s wrap ___ — we’re five minutes over.',
      a: 'up',
      hint: (
        <>
          <i>up</i> = дійшли до верху, тобто до кінця. Так само <i>eat up</i>,{' '}
          <i>use up</i>, <i>finish up</i>.
        </>
      ),
    },
    {
      q: 'The partnership fell ___ two weeks before signing.',
      a: 'through',
      hint: (
        <>
          І одразу межа системи: <i>through</i> зазвичай «пройшов наскрізь до кінця» (
          <i>get through</i>, <i>see it through</i>), а <i>fall through</i> означає рівно
          протилежне — зірвалося. <b>Метафора частки — перша здогадка, а не гарантія.</b>
        </>
      ),
    },
    {
      q: 'Hold ___ a second — I’m putting you through to support.',
      a: 'on',
      hint: (
        <>
          <i>on</i> = контакт, який не уривається, звідси «зачекайте на лінії». А{' '}
          <i>put through</i> у тому ж реченні — пробитися крізь комутатор до потрібної людини.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — обидва речення правильні: у чому різниця',
  lede: 'Тут немає переможця. В обох реченнях пари англійська бездоганна — змінюється значення, а часто ще й тип дієслова. Скажіть уголос, що саме змінилося.',
  items: [
    {
      q: 'He made up an excuse. / Women make up 40 % of the team.',
      a: '«Вигадав» — розділюване: he made it up. «Становлять» — нерозділюване: ✗ make it up. Те саме написання, різні типи.',
      hint: (
        <>
          Показовий випадок усієї теми: розділюваність належить <b>значенню</b>, а не парі
          слів. Ще два значення того самого <i>make up</i>: «помиритися» (неперехідне) і{' '}
          <i>make up for</i> — «надолужити».
        </>
      ),
    },
    {
      q: 'The plane took off an hour late. / Take your coat off.',
      a: 'Літак злетів — неперехідне, розділяти нічого. Зняти одяг — розділюване: take it off.',
      hint: (
        <>
          Тест «чи живе дієслово без додатка» в дії: <i>The plane took off</i> — речення
          завершене, отже <i>off</i> частка, отже з додатком воно розділюється. У{' '}
          <i>take off</i> є ще й «різко піти вгору»: <i>the product took off</i>.
        </>
      ),
    },
    {
      q: 'Let’s run over the numbers. / The meeting ran over.',
      a: 'Перше — пройтися по цифрах разом. Друге — зустріч затягнулася понад відведений час.',
      hint: (
        <>
          <i>over</i> = «понад»: очима понад текстом дає перегляд, вихід понад межу дає
          надлишок. І буквальне значення теж живе: <i>he ran over a cat</i> — переїхав.
        </>
      ),
    },
    {
      q: 'We had to put the demo off. / That third coffee really put me off.',
      a: 'Перше — перенести на пізніше. Друге — відштовхнути, викликати відразу.',
      hint: (
        <>
          Саме через це друге значення в листі клієнту іноді безпечніше написати{' '}
          <i>postpone</i>: воно однозначне. У Slack такої проблеми немає — контекст усе
          вирішує сам.
        </>
      ),
    },
    {
      q: 'He got over the fence. / He got over the flu.',
      a: 'Перше буквальне — переліз. Друге ідіоматичне — одужав.',
      hint: (
        <>
          Діагностика: замініть частку на протилежну. <i>Got under the fence</i> ✓ — сенс
          тримається, отже сполучення вільне і його можна вирахувати. Для «одужав»
          протилежної частки не існує — отже це ідіома, і її треба вивчити.
        </>
      ),
    },
    {
      q: 'They turned down my offer. / Could you turn the music down?',
      a: 'Відхилили пропозицію / зробіть тихіше. Обидва — «вниз», але одне про рішення, друге про величину.',
      hint: (
        <>
          У формальному листі відмову пишуть <i>decline</i>, а не <i>reject</i>:{' '}
          <i>reject</i> звучить жорстко й технічно — <i>the API rejected the payload</i>.
        </>
      ),
    },
    {
      q: 'We’re looking into it. / Security is investigating the breach.',
      a: 'Обидва формальні. look into — норма ділового листа про будь-яку проблему; investigate натякає на розслідування інциденту.',
      hint: (
        <>
          Різниця не в регістрі, а в масштабі. Написати <i>we are investigating</i> про дрібний
          баг — це приблизно як викликати поліцію через розбиту чашку.
        </>
      ),
    },
    {
      q: 'Can you fill in the form? / I’m filling in for Dan this week.',
      a: 'Заповнити форму — розділюване: fill it in. Підмінити людину — тричастинне fill in for, і воно не рухається.',
      hint: (
        <>
          Третя частка перевертає і значення, і тип. Той самий механізм у <i>get on</i> (сісти
          в транспорт) ↔ <i>get on with</i> (ладнати) і в <i>look up</i> ↔{' '}
          <i>look up to</i>.
        </>
      ),
    },
  ],
};

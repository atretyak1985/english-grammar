import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Пасивний стан».
   Розділ 12 — переклад з української (25 речень, чотири блоки).
   Розділ 15 — вправи A, B, C.
   Блоки перекладу згруповані за тим, ЩО саме ламається в перекладі:
   неозначено-особове речення, робочий регістр, каузатив, неособові форми.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — українське речення без підмета',
  lede: '«Баг виправили», «мені дали», «нам не сказали» — діяча немає ні в українському реченні, ні в англійському. Різниця в тому, що англійська мусить когось поставити на перше місце.',
  items: [
    {
      q: 'Баг виправили ще вчора ввечері.',
      a: 'The bug was fixed yesterday evening.',
      accepted: ['The bug was fixed last night.'],
      hint: (
        <>
          Українське «виправили» — неозначено-особове: дієслово в третій особі множини, підмета
          немає взагалі. Англійська порожнього місця перед дієсловом не терпить, тому туди їде
          обʼєкт — <i>the bug</i>. ✗ <i>The bug fixed</i>: без <i>was</i> це активне речення, у
          якому баг сам щось виправив.
        </>
      ),
    },
    {
      q: 'Мені дали новий ноутбук у перший же день.',
      a: 'I was given a new laptop on my first day.',
      accepted: ['I was given a new laptop on day one.'],
      hint: (
        <>
          Українське «мені» — давальний відмінок, і рука тягне ✗ <i>To me was given…</i>{' '}
          Англійська ставить підметом саме людину: <b>I was given</b>. Відмінків у неї немає,
          тому роль показує тільки місце в реченні.
        </>
      ),
    },
    {
      q: 'Нам досі не сказали, коли реліз.',
      a: 'We still haven’t been told when the release is.',
      accepted: [
        'We haven’t been told when the release is yet.',
        'We still have not been told when the release is.',
      ],
      hint: (
        <>
          Present Perfect Passive: <i>have been</i> + V3. Три слова поспіль здаються надлишковими,
          і зазвичай гине середнє — ✗ <i>we haven’t told</i> означало б, що це <b>ми</b> нікому не
          сказали.
        </>
      ),
    },
    {
      q: 'Цей звіт саме зараз перевіряють.',
      a: 'The report is being reviewed right now.',
      accepted: ['The report is being reviewed at the moment.'],
      hint: (
        <>
          Present Continuous Passive: <i>is being</i> + V3. Найгроміздкіша форма теми і
          найчастіше зіпсована: ✗ <i>is reviewing</i> (звіт сам перевіряє), ✗{' '}
          <i>is been reviewed</i> (переплутані <i>being</i> і <i>been</i>).
        </>
      ),
    },
    {
      q: 'Про це вже писали в понеділок.',
      a: 'This was already written about on Monday.',
      accepted: [
        'This has already been written about.',
        'This was already mentioned on Monday.',
      ],
      hint: (
        <>
          Дієслово тут із прийменником — <i>write about</i>, — і в пасиві прийменник нікуди не
          дівається: він лишається <b>після дієслова</b>, хоч і без додатка. Так само{' '}
          <i>The doctor was sent for</i>, <i>The bed hasn’t been slept in</i>.
        </>
      ),
    },
    {
      q: 'О шостій двері зачинили, і ми лишилися всередині.',
      a: 'The doors were closed at six and we were left inside.',
      accepted: ['At six the doors were closed and we were left inside.'],
      hint: (
        <>
          Тут ключова двозначність усієї теми: <i>The doors were closed at six</i> — це дія
          (хтось зачинив). А <i>The doors were closed</i> без часу читається як стан («двері були
          зачинені»). Розрізняє їх обставина часу — про це розділ 2.
        </>
      ),
    },
    {
      q: 'Мене запросили на співбесіду в четвер.',
      a: 'I was invited to an interview on Thursday.',
      accepted: ['I’ve been invited to an interview on Thursday.'],
      hint: (
        <>
          Знову людина стає підметом. Українське «мене» — знахідний відмінок, англійське{' '}
          <i>I</i> — називний: у пасиві обʼєкт дії <b>перестає бути додатком</b> і формально
          стає підметом. Саме тому <i>me</i> тут неможливе.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — робота: звіти, процеси, дедлайни',
  lede: 'Тут пасив доречний і в англійській, і в українській — це його рідна територія. Стежте за часом: він майже завжди не той, який здається першим.',
  items: [
    {
      q: 'Реліз перенесли на наступний тиждень.',
      a: 'The release has been pushed back to next week.',
      accepted: [
        'The release was pushed back to next week.',
        'The release has been postponed until next week.',
      ],
      hint: (
        <>
          Present Perfect, бо наслідок живий: дата вже інша. <i>Was pushed back</i> теж
          правильно — але це розповідь про минулу подію, а не новина, що змінює план.
        </>
      ),
    },
    {
      q: 'Рахунок надішлють до кінця місяця.',
      a: 'The invoice will be sent by the end of the month.',
      accepted: ['The invoice is going to be sent by the end of the month.'],
      hint: (
        <>
          Future Simple Passive: <i>will be</i> + V3, і <i>be</i> тут ніколи не змінюється —
          після модального чи <i>will</i> стоїть завжди гола форма. ✗ <i>will is sent</i>, ✗{' '}
          <i>will been sent</i>.
        </>
      ),
    },
    {
      q: 'Коли ми приїхали, сервер уже перезапустили.',
      a: 'By the time we arrived, the server had already been restarted.',
      accepted: ['When we arrived, the server had already been restarted.'],
      hint: (
        <>
          Past Perfect Passive: <i>had been</i> + V3 — дія, що сталася <b>до</b> іншої минулої
          дії. І зверніть увагу на <i>arrived</i>: <i>arrive</i> неперехідне, пасиву не має
          взагалі, тому в першій половині речення актив і залишається.
        </>
      ),
    },
    {
      q: 'Цю функцію протестували три різні команди.',
      a: 'The feature was tested by three different teams.',
      accepted: ['This feature was tested by three different teams.'],
      hint: (
        <>
          Ось той рідкісний випадок, коли <i>by</i> обовʼязковий: уся суть речення саме в
          кількості команд. Викиньте <i>by three different teams</i> — і речення втратить те,
          заради чого його писали.
        </>
      ),
    },
    {
      q: 'Доступ надають лише після навчання.',
      a: 'Access is granted only after training.',
      accepted: ['Access is only granted after training.'],
      hint: (
        <>
          Present Simple Passive для правила чи регламенту — найтиповіший пасив в інструкціях.
          Діяча немає, бо він неважливий: правило працює однаково, хто б його не застосовував.
        </>
      ),
    },
    {
      q: 'Ці дані більше не зберігаються на наших серверах.',
      a: 'This data is no longer stored on our servers.',
      accepted: ['These data are no longer stored on our servers.'],
      hint: (
        <>
          Українське «-ся» тут справді пасив, і перекладається пасивом. Але воно ж — головна
          пастка теми: у «сталося», «здалося», «повернувся» те саме «-ся» пасивом <b>не</b> є, і
          англійською там буде звичайний актив.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — каузатив і get: зробили не ви',
  lede: 'Українською «я полагодив машину» однаково означає і «сам полагодив», і «здав у сервіс». Англійська ці дві історії розрізняє формою, і плутанина тут коштує дорого.',
  items: [
    {
      q: 'Минулого тижня я віддав машину в ремонт.',
      a: 'I had my car repaired last week.',
      accepted: ['I got my car repaired last week.'],
      hint: (
        <>
          Каузатив <b>have something done</b>: ви замовили роботу, зробив її хтось інший. ✗{' '}
          <i>I repaired my car</i> означає, що ви самі лежали під машиною з ключем — і носій
          зрозуміє це буквально.
        </>
      ),
    },
    {
      q: 'Мені треба підстригтися перед співбесідою.',
      a: 'I need to get my hair cut before the interview.',
      accepted: [
        'I need to have my hair cut before the interview.',
        'I need a haircut before the interview.',
      ],
      hint: (
        <>
          Українське «-ся» тут означає «замовити послугу», і англійською це знову каузатив. ✗{' '}
          <i>I need to cut my hair</i> — ви берете ножиці самі. У <i>cut</i> третя форма
          збігається з першою, тому підказки у вигляді <i>-ed</i> тут не буде.
        </>
      ),
    },
    {
      q: 'Його звільнили в пʼятницю — ніхто не чекав.',
      a: 'He got fired on Friday — nobody saw it coming.',
      accepted: [
        'He was fired on Friday — nobody saw it coming.',
        'He got sacked on Friday — nobody saw it coming.',
      ],
      hint: (
        <>
          <b>get</b> + V3 — розмовний пасив для раптових і зазвичай неприємних подій:{' '}
          <i>got fired</i>, <i>got caught</i>, <i>got promoted</i>. У звіті чи листі керівництву
          буде <i>was fired</i> — зміст той самий, регістр інший.
        </>
      ),
    },
    {
      q: 'У мене в метро вкрали телефон.',
      a: 'I had my phone stolen on the metro.',
      accepted: [
        'My phone was stolen on the metro.',
        'I got my phone stolen on the metro.',
      ],
      hint: (
        <>
          Та сама конструкція <i>have something done</i> — але тут вона означає не замовлення, а
          неприємність, яка сталася з вами. Розрізняє їх лише здоровий глузд: телефон украли не
          на ваше прохання.
        </>
      ),
    },
    {
      q: 'Наступного місяця нам ставлять нову кухню.',
      a: 'We’re having a new kitchen fitted next month.',
      accepted: [
        'We are having a new kitchen fitted next month.',
        'We’re getting a new kitchen fitted next month.',
      ],
      hint: (
        <>
          Каузатив вільно бере будь-який час: <i>have</i> змінюється як звичайне дієслово (
          <i>had</i>, <i>are having</i>, <i>will have</i>), а <i>fitted</i> лишається V3 назавжди.
        </>
      ),
    },
    {
      q: 'Вони одружилися торік у серпні.',
      a: 'They got married last August.',
      accepted: ['They got married in August last year.'],
      hint: (
        <>
          <i>Get married</i> — подія, <i>be married</i> — стан: <i>They’ve been married for ten
          years</i>. Це та сама пара «дія / стан», що й у <i>The door was closed</i> з розділу 2,
          тільки тут її видно неозброєним оком.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — модальні, неособові та безособові',
  lede: 'Скрізь, де в англійському реченні є ще одне дієслово, be просто змінює форму: bare, to be, being, been. Зникнути воно не може ніде.',
  items: [
    {
      q: 'Форму треба підписати до пʼятниці.',
      a: 'The form must be signed by Friday.',
      accepted: [
        'The form has to be signed by Friday.',
        'The form needs to be signed by Friday.',
      ],
      hint: (
        <>
          Після модального — гола форма <i>be</i>, далі V3. ✗ <i>must signed</i> — найчастіша
          помилка в цій конструкції: <i>be</i> здається зайвим, бо в українському «треба
          підписати» ніякої звʼязки немає.
        </>
      ),
    },
    {
      q: 'Це можна було зробити ще місяць тому.',
      a: 'This could have been done a month ago.',
      accepted: ['It could have been done a month ago.'],
      hint: (
        <>
          Чотири слова поспіль: <i>could + have + been + done</i>. Модальне про минуле бере{' '}
          <i>have been</i>, і жодне з цих слів не викидається. Той самий каркас у{' '}
          <i>should have been told</i>, <i>might have been changed</i>.
        </>
      ),
    },
    {
      q: 'Ніхто не любить, коли його перебивають.',
      a: 'Nobody likes being interrupted.',
      accepted: ['No one likes being interrupted.'],
      hint: (
        <>
          Після <i>like</i>, <i>hate</i>, <i>avoid</i>, <i>remember</i> і після будь-якого
          прийменника пасив набирає форми <b>being + V3</b>. ✗ <i>likes to be interrupt</i>, ✗{' '}
          <i>likes be interrupted</i>.
        </>
      ),
    },
    {
      q: 'Кажуть, що запуск відкладуть до березня.',
      a: 'The launch is said to be delayed until March.',
      accepted: [
        'It is said that the launch will be delayed until March.',
        'The launch is expected to be delayed until March.',
      ],
      hint: (
        <>
          Два способи сказати «кажуть»: довгий <i>It is said that…</i> і короткий{' '}
          <i>The launch is said to…</i> Другий елегантніший і частіший у пресі — про обидва
          розділ 9.
        </>
      ),
    },
    {
      q: 'Вважається, що це найстаріший будинок у місті.',
      a: 'It is believed to be the oldest house in the city.',
      accepted: [
        'This is believed to be the oldest house in the city.',
        'It is believed that this is the oldest house in the city.',
      ],
      hint: (
        <>
          Українське «вважається» — це «-ся», яке справді пасив. Англійською —{' '}
          <i>is believed</i>, і після нього йде <i>to be</i>, а не <i>that</i>, щойно підмет
          винесено наперед.
        </>
      ),
    },
    {
      q: 'Мені не подобається, коли зі мною так розмовляють.',
      a: 'I don’t like being spoken to like that.',
      accepted: ['I do not like being spoken to like that.'],
      hint: (
        <>
          Найважчий пункт блоку: <i>speak to somebody</i> — дієслово з прийменником, тому в
          пасиві <i>to</i> лишається висіти в кінці, а перед ним стоїть герундійна форма{' '}
          <i>being spoken</i>. Носій скаже саме так.
        </>
      ),
    },
  ],
};

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — перепишіть у пасиві, не змінюючи часу',
  lede: 'Час має лишитися тим самим: Present Perfect Active стає Present Perfect Passive, а не Past Simple. Діяча зберігайте лише там, де без нього речення втрачає сенс.',
  items: [
    {
      q: 'Someone stole my bike last night.',
      a: 'My bike was stolen last night.',
      hint: (
        <>
          <i>Someone</i> у пасиві не зберігають ніколи: ✗ <i>by someone</i> — це слово не несе
          жодної інформації. Саме тому речення й перевели в пасив.
        </>
      ),
    },
    {
      q: 'They are repairing the road outside our office.',
      a: 'The road outside our office is being repaired.',
      hint: (
        <>
          Present Continuous Passive: <i>is being</i> + V3. Найгроміздкіша з живих форм — і одна
          з найчастіших, бо саме нею описують те, що відбувається просто зараз без вашої участі.
        </>
      ),
    },
    {
      q: 'The team has already deployed the fix.',
      a: 'The fix has already been deployed.',
      hint: (
        <>
          <i>has</i> лишається на місці, між ним і V3 зʼявляється <i>been</i>. Прислівник{' '}
          <i>already</i> сідає туди ж, куди й в активі, — після першого допоміжного.
        </>
      ),
    },
    {
      q: 'We will announce the winner on Friday.',
      a: 'The winner will be announced on Friday.',
      hint: (
        <>
          Після <i>will</i> — гола форма <i>be</i>. Замість <i>we</i> тут нічого не лишається, і
          це нормально: організатор і так відомий з контексту.
        </>
      ),
    },
    {
      q: 'Nobody had cleaned the office before the audit.',
      a: 'The office hadn’t been cleaned before the audit.',
      hint: (
        <>
          Заперечний підмет <i>nobody</i> у пасиві перетворюється на заперечення при дієслові:{' '}
          <i>hadn’t been cleaned</i>. ✗ <i>The office had been cleaned by nobody</i> — граматично
          збирається, англійською не звучить.
        </>
      ),
    },
    {
      q: 'They gave me two weeks to decide.',
      a: 'I was given two weeks to decide.',
      hint: (
        <>
          Два додатки — два можливі пасиви, але англійська бере той, де підмет — людина.{' '}
          <i>Two weeks were given to me</i> граматично правильно і звучить як переклад.
        </>
      ),
    },
    {
      q: 'You must submit the form before Friday.',
      a: 'The form must be submitted before Friday.',
      hint: (
        <>
          Модальне не змінюється, після нього — <i>be</i> + V3. Заразом зникає <i>you</i>, і
          вимога перестає бути особистою: саме тому регламенти пишуть у пасиві.
        </>
      ),
    },
    {
      q: 'Shakespeare wrote Hamlet in about 1600.',
      a: 'Hamlet was written by Shakespeare in about 1600.',
      hint: (
        <>
          Єдиний пункт вправи, де <i>by</i> обовʼязковий: без нього речення втрачає всю свою
          інформацію. Ознака така: діяч — власне імʼя, і воно нове для читача.
        </>
      ),
    },
    {
      q: 'Somebody is following us.',
      a: 'We are being followed.',
      hint: (
        <>
          <i>Us</i> у пасиві стає <i>we</i>: обʼєкт дії формально стає підметом, тому й форма
          займенника міняється на називну. ✗ <i>Us are being followed</i>.
        </>
      ),
    },
    {
      q: 'They explained the new rules to us.',
      a: 'The new rules were explained to us.',
      hint: (
        <>
          Головний пункт вправи. <i>Explain</i>, <i>describe</i>, <i>suggest</i>, <i>announce</i>,{' '}
          <i>mention</i> <b>не</b> пускають людину в підмет: ✗ <i>We were explained the new
          rules</i> — це помилка №3 з розділу 13, і трапляється вона майже в кожного.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — поставте дієслово в потрібну форму',
  lede: 'У дужках — інфінітив. Вирішіть спершу, чи це взагалі пасив: два пункти з десяти в пасив не ставляться, і саме вони найцінніші.',
  items: [
    {
      q: 'The email ___ (send) yesterday afternoon.',
      a: 'was sent',
      hint: (
        <>
          Past Simple Passive. Маркер <i>yesterday afternoon</i> прибиває речення до минулого,
          тому <i>has been sent</i> тут неможливе.
        </>
      ),
    },
    {
      q: 'Look — the road ___ (repair) right now.',
      a: 'is being repaired',
      hint: (
        <>
          <i>Right now</i> вимагає Continuous, а дорога сама себе не ремонтує — отже, пасив.
          Разом: <i>is being</i> + V3. Пропущене <i>being</i> — найчастіша поломка цієї форми.
        </>
      ),
    },
    {
      q: 'This bridge ___ (build) in 1890 and still carries traffic.',
      a: 'was built',
      hint: (
        <>
          Дата в минулому — Past Simple, попри те, що міст стоїть досі. Present Perfect тут
          неможливий саме через <i>in 1890</i>: закінчений період не пускає.
        </>
      ),
    },
    {
      q: 'What ___ (happen) after the meeting?',
      a: 'happened',
      hint: (
        <>
          Пастка. <i>Happen</i> — неперехідне, додатка не має, отже пасиву не має теж. ✗{' '}
          <i>was happened</i> — це помилка №2 з розділу 13, і росте вона з українського
          «сталося» з його оманливим «-ся».
        </>
      ),
    },
    {
      q: 'All the tickets ___ (sell) — we were too late.',
      a: 'have been sold',
      accepted: ['had been sold'],
      hint: (
        <>
          Present Perfect Passive: квитків уже немає <b>зараз</b>, і саме цей наслідок важливий.{' '}
          <i>Had been sold</i> теж можливе — якщо ви розповідаєте історію цілком у минулому.
        </>
      ),
    },
    {
      q: 'The report ___ (must / finish) before Monday morning.',
      a: 'must be finished',
      hint: (
        <>
          Після модального завжди гола <i>be</i>. ✗ <i>must finished</i>, ✗ <i>must is
          finished</i> — обидві помилки від того, що в українському «має бути закінчений» звʼязка
          на своєму місці, а в англійському наказі її ніби не чути.
        </>
      ),
    },
    {
      q: 'She hates ___ (interrupt) in the middle of a sentence.',
      a: 'being interrupted',
      hint: (
        <>
          Після <i>hate</i> йде <i>-ing</i>, а пасив у формі <i>-ing</i> — це <i>being</i> + V3.
          ✗ <i>being interrupt</i>, ✗ <i>be interrupted</i>.
        </>
      ),
    },
    {
      q: 'By the time we got to the kitchen, everything ___ (eat).',
      a: 'had been eaten',
      hint: (
        <>
          Past Perfect Passive: до моменту в минулому. Три слова — <i>had been eaten</i>, — і
          жодне з них не зайве.
        </>
      ),
    },
    {
      q: 'My grandmother ___ (bear) in a village near Poltava.',
      a: 'was born',
      hint: (
        <>
          <i>Be born</i> англійською існує тільки в пасиві: ✗ <i>she born</i>, ✗ <i>she has been
          born</i>. Українське «народилася» з його «-ся» штовхає саме до цих двох варіантів.
        </>
      ),
    },
    {
      q: 'This house ___ (belong) to my grandmother for fifty years.',
      a: 'has belonged',
      hint: (
        <>
          Другий пункт-пастка. <i>Belong</i> — дієслово стану: додатка в нього немає (є{' '}
          <i>to</i> + іменник), тому й пасиву немає. Так само поводяться <i>have</i>,{' '}
          <i>lack</i>, <i>resemble</i>, <i>suit</i>, <i>cost</i>.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — знайдіть помилку і скажіть, звідки вона',
  lede: 'У кожному реченні рівно одна помилка, і кожна з них — калька з української. Виправте речення, а потім назвіть українську конструкцію, яка його зіпсувала: це важливіше за саме виправлення.',
  items: [
    {
      q: 'The accident was happened at seven in the morning.',
      a: 'The accident happened at seven in the morning.',
      hint: (
        <>
          <i>Happen</i> неперехідне — пасиву не має. Джерело помилки: українське «сталося» має
          «-ся», яке виглядає точнісінько як пасивний показник у «будується» чи «зберігається».
          В одному випадку це пасив, у другому — ні, і ззовні вони не відрізняються.
        </>
      ),
    },
    {
      q: 'I was explained the new process on my first day.',
      a: 'The new process was explained to me on my first day.',
      hint: (
        <>
          <i>Explain</i> не пускає людину в підмет — на відміну від <i>give</i>, <i>tell</i>,{' '}
          <i>send</i>. Джерело: українське «мені пояснили» будується так само, як «мені дали», і
          відмінності між цими дієсловами українська не робить.
        </>
      ),
    },
    {
      q: 'My car repaired last week and it works fine now.',
      a: 'My car was repaired last week · I had my car repaired last week.',
      hint: (
        <>
          Пропущене <i>be</i> — і речення перетворилося на активне, у якому машина щось
          полагодила. Джерело: в українському «машину полагодили» звʼязки немає взагалі, тому
          вона й не проситься в переклад.
        </>
      ),
    },
    {
      q: 'The letter was wrote by the CEO himself.',
      a: 'The letter was written by the CEO himself.',
      hint: (
        <>
          Друга форма замість третьої. У пасиві стоїть <b>тільки V3</b>: <i>written</i>,{' '}
          <i>taken</i>, <i>spoken</i>, <i>done</i>. Джерело просте — <i>wrote</i> частіше
          трапляється в текстах, тому першим і спливає в памʼяті.
        </>
      ),
    },
    {
      q: 'His grandfather was died two years ago.',
      a: 'His grandfather died two years ago.',
      hint: (
        <>
          <i>Die</i> неперехідне. Джерело: українське «помер» здається результатом, а не дією, і
          рука тягне звʼязку — як у «був хворий». Так само ✗ <i>was arrived</i>, ✗{' '}
          <i>was gone</i>, ✗ <i>was appeared</i>.
        </>
      ),
    },
    {
      q: 'To me was given a desk by the window.',
      a: 'I was given a desk by the window.',
      hint: (
        <>
          Дослівний давальний відмінок. Джерело: в українській роль показує закінчення, тому
          «мені» можна ставити хоч першим. В англійській роль показує <b>місце</b>, тому на
          першому місці мусить стояти називний відмінок — <i>I</i>.
        </>
      ),
    },
    {
      q: 'I cut my hair yesterday — the salon near the office is great.',
      a: 'I had my hair cut yesterday · I got my hair cut yesterday.',
      hint: (
        <>
          Без каузатива речення означає, що ви стриглися самі — і друга половина фрази цьому
          суперечить. Джерело: українське «підстригся» з «-ся» покриває обидві ситуації, а
          англійська їх розрізняє формою.
        </>
      ),
    },
    {
      q: 'The window is broken by the storm last night.',
      a: 'The window was broken by the storm last night.',
      hint: (
        <>
          <i>Is broken</i> — стан зараз, <i>was broken</i> — подія в минулому, і маркер{' '}
          <i>last night</i> вимагає другого. Джерело: українське «вікно розбите» — це теж стан, і
          речення про подію будується так само.
        </>
      ),
    },
    {
      q: 'It was decided by our team that the launch will be postponed.',
      a: 'Our team decided to postpone the launch.',
      hint: (
        <>
          Граматичних помилок тут нема жодної — і саме тому пункт стоїть у вправі. Діяч названий (
          <i>by our team</i>), отже приховувати нема кого, отже пасив тільки подовжив речення
          вдвічі. Джерело: переконання, що офіційний текст мусить бути безособовим.
        </>
      ),
    },
    {
      q: 'This problem is discussing now at the management level.',
      a: 'This problem is being discussed now at the management level.',
      hint: (
        <>
          Активна форма замість пасивної: за такого написання проблема сама щось обговорює.
          Джерело: українське «обговорюється» має один суфікс на все, тому в перекладі губиться
          саме <i>being</i> — слово, яке й робить форму пасивною.
        </>
      ),
    },
  ],
};

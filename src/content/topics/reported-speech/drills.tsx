import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Непряма мова й узгодження часів».
   Розділ 12 — переклад з української (25 речень, чотири блоки).
   Розділ 15 — вправи A, B, C.
   Блоки перекладу згруповані за типом репліки, бо саме тип визначає
   конструкцію: розповідь, питання, наказ, точне дієслово переказу.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — переказ розповіді',
  lede: 'В українських реченнях час стоїть там, де його поставив мовець: «сказав, що зайнятий». Англійською кожне таке речення доводиться перерахувати від моменту, коли говорите ви.',
  items: [
    {
      q: 'Він сказав, що зайнятий.',
      a: 'He said (that) he was busy.',
      accepted: ['He said he was busy.', 'He said that he was busy.'],
      hint: (
        <>
          Українське «зайнятий» лишається теперішнім, бо міряється від моменту його репліки.
          Англійська міряє від моменту вашого переказу, тому <i>is</i> стає <b>was</b>.{' '}
          <i>He said he is busy</i> теж можливе — але тільки тоді, коли він зайнятий і зараз, і ви
          це підтверджуєте.
        </>
      ),
    },
    {
      q: 'Вона сказала мені, що вже надіслала звіт.',
      a: 'She told me (that) she had already sent the report.',
      accepted: ['She told me she had already sent the report.'],
      hint: (
        <>
          Два рішення в одному реченні. Перше: адресат названий («мені») — отже <b>told</b>, а не{' '}
          <i>said</i>. Друге: «надіслала» вже було минулим, тому зсувається ще на сходинку — у Past
          Perfect (<b>had sent</b>).
        </>
      ),
    },
    {
      q: 'Я сказав, що не знаю відповіді.',
      a: 'I said I didn’t know the answer.',
      accepted: ['I said that I didn’t know the answer.'],
      hint: (
        <>
          Заперечення зсувається так само, як і все інше: <i>don’t know</i> → <b>didn’t know</b>.
          Українська рука тягне ✗ <i>I said I don’t know</i> — форму, яка означала б «я й досі не
          знаю» і в переказі минулої розмови звучить незавершено.
        </>
      ),
    },
    {
      q: 'Оля сказала, що саме зараз працює над цим.',
      a: 'Olha said she was working on it at that moment.',
      accepted: [
        'Olha said she was working on it right then.',
        'Olha said that she was working on it at that moment.',
      ],
      hint: (
        <>
          Зсувається не лише дієслово: <i>now</i> у переказі стає <b>then</b> або{' '}
          <b>at that moment</b>. Залишити <i>now</i> означало б, що вона працює над цим у момент
          вашої розповіді, — а ви переказуєте вчорашню репліку.
        </>
      ),
    },
    {
      q: 'Він написав, що ніколи не був у Львові.',
      a: 'He wrote that he had never been to Lviv.',
      accepted: ['He wrote he had never been to Lviv.'],
      hint: (
        <>
          У репліці стояв Present Perfect (<i>I have never been</i>), і він зсувається у Past
          Perfect. Дієслово переказу не зобовʼязане бути <i>say</i>: <i>write</i>, <i>explain</i>,{' '}
          <i>reply</i>, <i>add</i> працюють за тією самою моделлю.
        </>
      ),
    },
    {
      q: 'Клієнт сказав, що заплатить у пʼятницю.',
      a: 'The client said he would pay on Friday.',
      accepted: ['The client said that he would pay on Friday.'],
      hint: (
        <>
          Українське майбутнє в підрядному стає <b>would</b> — це і є зсув <i>will</i> на сходинку
          назад. ✗ <i>He said he will pay</i> — найчастіша помилка теми після <i>said me</i>.
        </>
      ),
    },
    {
      q: 'Учора вона сказала, що подзвонить завтра.',
      a: 'Yesterday she said she would call today.',
      accepted: ['She said yesterday that she would call today.'],
      hint: (
        <>
          Пастка з обставиною. «Завтра» в її вчорашній репліці — це <b>сьогодні</b> для вас, тому{' '}
          <i>tomorrow</i> у перекладі не лишається. Механічне <i>the next day</i> тут теж хибне: воно
          правильне лише тоді, коли той день уже минув.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — переказ питання',
  lede: 'Українською переказане питання виглядає майже як пряме — порядок слів у нас вільний, і міняти нічого не треба. Англійською міняється все: зникає інверсія, зникає do, зникає знак питання.',
  items: [
    {
      q: 'Він спитав, де я живу.',
      a: 'He asked where I lived.',
      accepted: ['He asked me where I lived.'],
      hint: (
        <>
          Три речі одночасно: прямий порядок слів (<b>I lived</b>, а не <i>did I live</i>),
          відсутність <i>do</i> і відсутність знака питання. ✗{' '}
          <i>He asked where do I live?</i> — усі три помилки в одному реченні.
        </>
      ),
    },
    {
      q: 'Вона спитала, чи я вже обідав.',
      a: 'She asked if I had already had lunch.',
      accepted: [
        'She asked whether I had already had lunch.',
        'She asked me if I had already had lunch.',
      ],
      hint: (
        <>
          Питання без питального слова вводиться через <b>if</b> або <b>whether</b> — це і є
          українське «чи». <i>Whether</i> трохи формальніше й обовʼязкове перед <i>or not</i> та
          перед інфінітивом.
        </>
      ),
    },
    {
      q: 'Мене спитали, коли я зможу почати.',
      a: 'I was asked when I could start.',
      accepted: ['They asked me when I could start.'],
      hint: (
        <>
          Українське «мене спитали» — неозначено-особове, діяча немає. Англійська або ставить пасив
          (<b>I was asked</b>), або вигадує <i>they</i>. Усередині — <i>can</i> → <b>could</b>.
        </>
      ),
    },
    {
      q: 'Я спитав, чи є вільні місця.',
      a: 'I asked if there were any seats available.',
      accepted: ['I asked whether there were any seats available.'],
      hint: (
        <>
          Зворот <i>there is / there are</i> зсувається так само, як звичайне дієслово:{' '}
          <i>there are</i> → <b>there were</b>. Питальна форма <i>are there</i> в переказі
          розвертається у звичайний порядок.
        </>
      ),
    },
    {
      q: 'Він хотів знати, чому ми не відповіли.',
      a: 'He wanted to know why we hadn’t replied.',
      accepted: ['He wanted to know why we had not replied.'],
      hint: (
        <>
          Дієслово переказу необовʼязково <i>ask</i>: <i>want to know</i>, <i>wonder</i>,{' '}
          <i>have no idea</i> вводять непряме питання за тими самими правилами. «Не відповіли» —
          Past Simple у репліці, тому в переказі Past Perfect.
        </>
      ),
    },
    {
      q: 'Вона спитала, що я робитиму у вихідні.',
      a: 'She asked what I would do at the weekend.',
      accepted: ['She asked me what I would do at the weekend.'],
      hint: (
        <>
          <i>What will you do?</i> → <b>what I would do</b>. Питальне слово лишається на місці, а от
          порядок слів після нього — розповідний. ✗ <i>what would I do</i> прозвучить як питання про
          саму себе.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — накази, прохання, поради',
  lede: 'Українське «щоб» тягне за собою підрядне речення — і саме воно псує англійський переклад. Наказ і прохання переказують інфінітивом, без жодного that.',
  items: [
    {
      q: 'Він сказав мені зачекати надворі.',
      a: 'He told me to wait outside.',
      hint: (
        <>
          Модель <b>tell somebody to do</b>: адресат обовʼязковий, підрядного речення немає. ✗{' '}
          <i>He said me to wait</i> — тут дві помилки одразу: <i>say</i> замість <i>tell</i> і
          адресат після <i>say</i> без <i>to</i>.
        </>
      ),
    },
    {
      q: 'Вона попросила мене не запізнюватися.',
      a: 'She asked me not to be late.',
      hint: (
        <>
          Заперечний наказ — це <b>not to do</b>, і <i>not</i> стоїть саме перед <i>to</i>. ✗{' '}
          <i>asked me to not be late</i> зрозуміють, але це не та форма, якої чекають.
        </>
      ),
    },
    {
      q: 'Лікар порадив їй більше відпочивати.',
      a: 'The doctor advised her to rest more.',
      accepted: ['The doctor advised her to get more rest.'],
      hint: (
        <>
          <i>Advise</i> працює за моделлю <b>advise somebody to do</b> — так само як <i>tell</i>,{' '}
          <i>ask</i>, <i>warn</i>, <i>remind</i>, <i>encourage</i>. ✗ <i>advised her that she rests</i>{' '}
          — калька з українського «порадив, щоб вона».
        </>
      ),
    },
    {
      q: 'Нас попередили не відкривати це посилання.',
      a: 'We were warned not to open the link.',
      accepted: ['They warned us not to open the link.'],
      hint: (
        <>
          Знову неозначено-особове речення без діяча — і знову пасив рятує (див. тему «Пасивний
          стан»). Модель зберігається й у пасиві: <b>be warned not to do</b>.
        </>
      ),
    },
    {
      q: 'Він нагадав мені надіслати рахунок.',
      a: 'He reminded me to send the invoice.',
      hint: (
        <>
          <i>Remind</i> без адресата не вживається взагалі: ✗ <i>He reminded to send</i>. Порівняйте
          з <i>remember</i>, у якого адресата немає: <i>I remembered to send it</i>.
        </>
      ),
    },
    {
      q: 'Мама сказала, щоб я подзвонив, коли доїду.',
      a: 'Mum told me to call her when I got there.',
      accepted: ['My mother told me to call her when I got there.'],
      hint: (
        <>
          Українське «щоб» — головна пастка розділу: воно виглядає як підрядне речення, а
          англійською це той самий інфінітив. Друга частина («коли доїду») — звичайне підрядне часу,
          і воно зсувається: <i>when I get there</i> → <b>when I got there</b>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — точне дієслово замість said that',
  lede: 'У всіх шести реченнях можна написати said that — і в усіх шести це буде втрата. Українська підказує дієслово прямо в тексті; треба лише взяти його разом із правильною моделлю.',
  items: [
    {
      q: 'Він визнав, що забув про зустріч.',
      a: 'He admitted forgetting about the meeting.',
      accepted: [
        'He admitted that he had forgotten about the meeting.',
        'He admitted he had forgotten about the meeting.',
      ],
      hint: (
        <>
          <i>Admit</i> — одне з двох дієслів теми, які мають дві моделі: <b>admit doing</b> і{' '}
          <b>admit that…</b>. Обидва варіанти правильні. ✗ <i>admitted to forget</i> — моделі з
          інфінітивом у нього немає.
        </>
      ),
    },
    {
      q: 'Вона відмовилася підписувати договір.',
      a: 'She refused to sign the contract.',
      hint: (
        <>
          <i>Refuse</i> бере тільки інфінітив: <b>refuse to do</b>. ✗ <i>refused signing</i>, ✗{' '}
          <i>refused that she signs</i>. Заперечення вже сидить у самому дієслові, тому <i>not</i>{' '}
          не потрібне.
        </>
      ),
    },
    {
      q: 'Тарас запропонував зачекати до понеділка.',
      a: 'Taras suggested waiting until Monday.',
      accepted: [
        'Taras suggested that we wait until Monday.',
        'Taras suggested we should wait until Monday.',
      ],
      hint: (
        <>
          Найпопулярніша помилка всієї теми: ✗ <i>suggested me to wait</i>. <i>Suggest</i> не бере ані
          адресата, ані інфінітива — тільки <b>-ing</b> або підрядне з <i>that</i>.
        </>
      ),
    },
    {
      q: 'Він пообіцяв, що більше так не робитиме.',
      a: 'He promised not to do it again.',
      accepted: ['He promised that he wouldn’t do it again.'],
      hint: (
        <>
          <i>Promise</i> — теж із двома моделями: <b>promise to do</b> і <b>promise that…</b>. У
          другій працює звичайний зсув: <i>I won’t</i> → <b>he wouldn’t</b>.
        </>
      ),
    },
    {
      q: 'Вони заперечили, що бачили це повідомлення.',
      a: 'They denied seeing the message.',
      accepted: [
        'They denied that they had seen the message.',
        'They denied they had seen the message.',
      ],
      hint: (
        <>
          <i>Deny</i> — це «сказати, що ні», тому другого заперечення в реченні не буде: ✗{' '}
          <i>denied that they hadn’t seen</i> означало б протилежне. Модель — <b>deny doing</b> або{' '}
          <b>deny that…</b>.
        </>
      ),
    },
    {
      q: 'Він поскаржився, що йому ніхто нічого не сказав.',
      a: 'He complained that he hadn’t been told anything.',
      accepted: [
        'He complained that nobody had told him anything.',
        'He complained he hadn’t been told anything.',
      ],
      hint: (
        <>
          <i>Complain</i> бере тільки підрядне з <i>that</i>: ✗ <i>complained to do</i>. Усередині —
          пасив, бо в українському реченні діяча немає («ніхто нічого не сказав» — це не про
          конкретну людину).
        </>
      ),
    },
  ],
};

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — перекажіть репліку',
  lede: 'Уявіть, що переказуєте ці слова наступного дня. Змініть усе, що вказує на «зараз», «тут» і «я»: час дієслова, займенники, обставини. Дієслово переказу беріть просте — said або told me.',
  items: [
    {
      q: 'Olha: «I’m waiting for the file.»',
      a: 'Olha said (that) she was waiting for the file.',
      hint: (
        <>
          Present Continuous → Past Continuous. Вид не змінився — змінився тільки час, і саме тому
          <i> being</i>-частина форми лишилася на місці.
        </>
      ),
    },
    {
      q: 'Taras: «We have finished the migration.»',
      a: 'Taras said (that) they had finished the migration.',
      hint: (
        <>
          Present Perfect → Past Perfect. Займенник <i>we</i> стає <b>they</b>, бо ви не входите до
          його команди; якби входили — лишилося б <i>we</i>.
        </>
      ),
    },
    {
      q: 'Marta (у понеділок): «I’ll call you tomorrow.» — ви переказуєте в середу',
      a: 'Marta said she would call me the next day.',
      accepted: ['Marta said she would call me the following day.'],
      hint: (
        <>
          Три перерахунки одночасно: <i>will</i> → <b>would</b>, <i>you</i> → <b>me</b>,{' '}
          <i>tomorrow</i> → <b>the next day</b>. Пропустити останній — типова помилка: у середу
          «завтра понеділка» означає вівторок, а не четвер.
        </>
      ),
    },
    {
      q: 'He: «I didn’t see your message.»',
      a: 'He said (that) he hadn’t seen my message.',
      hint: (
        <>
          Past Simple → Past Perfect, <i>your</i> → <b>my</b>. Це той єдиний рядок таблиці зсуву, де
          міняється й вид: синій Simple стає фіолетовим Perfect.
        </>
      ),
    },
    {
      q: 'Учителька: «Water boils at 100 °C.»',
      a: 'The teacher said (that) water boils at 100 °C.',
      accepted: ['The teacher said that water boils at 100 degrees.'],
      hint: (
        <>
          Зсуву немає: закон природи не перестав діяти від того, що про нього сказали вчора.{' '}
          <i>Boiled</i> тут теж припустиме й помилкою не вважається — але звучить так, ніби відтоді
          щось змінилося.
        </>
      ),
    },
    {
      q: 'She: «I can’t come on Friday.»',
      a: 'She said (that) she couldn’t come on Friday.',
      hint: (
        <>
          <i>Can</i> → <b>could</b>. Із модальними працює те саме правило зсуву, тільки форм у них
          менше: <i>could</i>, <i>would</i>, <i>should</i>, <i>might</i> уже стоять на дні й далі не
          йдуть.
        </>
      ),
    },
    {
      q: 'The lawyer: «You must sign it today.»',
      a: 'The lawyer said (that) I had to sign it that day.',
      accepted: ['The lawyer told me I had to sign it that day.'],
      hint: (
        <>
          <i>Must</i> зсувається в <b>had to</b> — це єдиний модальний, у якого зсув змінює саме
          слово. <i>Today</i> у переказі минулої розмови стає <b>that day</b>.
        </>
      ),
    },
    {
      q: 'She: «I’ve been living here since 2019.»',
      a: 'She said (that) she had been living there since 2019.',
      hint: (
        <>
          Present Perfect Continuous → Past Perfect Continuous, <i>here</i> → <b>there</b>. Довга
          форма лякає тільки на вигляд: зсувається в ній перше слово, решта стоїть нерухомо.
        </>
      ),
    },
    {
      q: 'He: «Don’t touch the red button.»',
      a: 'He told us not to touch the red button.',
      accepted: ['He warned us not to touch the red button.'],
      hint: (
        <>
          Наказ — це інфінітив, а не підрядне речення. Адресат обовʼязковий: ✗ <i>He said not to
          touch</i> можливе лише в дуже розмовному регістрі, і <i>told us</i> тут точніше.
        </>
      ),
    },
    {
      q: 'She: «Are you coming to the party?»',
      a: 'She asked if I was coming to the party.',
      accepted: ['She asked whether I was coming to the party.'],
      hint: (
        <>
          Питання без питального слова → <b>if / whether</b>, порядок слів прямий, знака питання
          немає. ✗ <i>She asked was I coming?</i> — калька з прямого питання.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — поставте дієслово в потрібну форму',
  lede: 'У дужках — вихідна форма. Вирішіть спершу, чи взагалі потрібен зсув: два пункти з десяти його не мають, і саме вони найцінніші.',
  items: [
    {
      q: 'He said he (be) exhausted after the flight.',
      a: 'He said he was exhausted after the flight.',
      hint: <>Present Simple у репліці → Past Simple у переказі. Базовий зсув, з якого все й починається.</>,
    },
    {
      q: 'She asked me where I (work).',
      a: 'She asked me where I worked.',
      hint: (
        <>
          Непряме питання: прямий порядок слів і зсув часу. ✗ <i>where do I work</i>, ✗{' '}
          <i>where did I work</i> — допоміжного дієслова тут немає взагалі.
        </>
      ),
    },
    {
      q: 'They told us that they (already send) the invoice.',
      a: 'They told us that they had already sent the invoice.',
      hint: (
        <>
          У репліці був Present Perfect або Past Simple — обидва зсуваються в Past Perfect. Прислівник{' '}
          <i>already</i> стоїть на своєму звичайному місці, між <i>had</i> і V3.
        </>
      ),
    },
    {
      q: 'He said he (will) call me back within an hour.',
      a: 'He said he would call me back within an hour.',
      hint: (
        <>
          <i>Will</i> → <b>would</b>. Це не умовний спосіб і не ввічливість, а просто зсунуте
          майбутнє: те, що для нього було попереду, для вас уже могло минути.
        </>
      ),
    },
    {
      q: 'My colleague says the meeting (start) at ten.',
      a: 'My colleague says the meeting starts at ten.',
      hint: (
        <>
          Зсуву немає: дієслово переказу стоїть у теперішньому (<i>says</i>), отже точка відліку не
          рухалася. Так само працюють <i>he says</i>, <i>she tells me</i>, <i>they claim</i>.
        </>
      ),
    },
    {
      q: 'She asked if I (can) help her with the report.',
      a: 'She asked if I could help her with the report.',
      hint: (
        <>
          <i>Can</i> → <b>could</b>, питання без питального слова → <i>if</i>. Два правила в одному
          реченні, і обидва механічні.
        </>
      ),
    },
    {
      q: 'He said he (must) leave before six.',
      a: 'He said he had to leave before six.',
      accepted: ['He said he must leave before six.'],
      hint: (
        <>
          Звичайний зсув — <b>had to</b>. Форма <i>must</i> теж трапляється й лишається, коли
          обовʼязок діє й досі; але у звіті про минулу розмову природніше <i>had to</i>.
        </>
      ),
    },
    {
      q: 'The guide told us that the museum (open) at nine every day.',
      a: 'The guide told us that the museum opens at nine every day.',
      accepted: ['The guide told us that the museum opened at nine every day.'],
      hint: (
        <>
          Другий пункт без зсуву: розклад музею не змінився від того, що екскурсовод сказав про нього
          вчора. <i>Opened</i> не помилка — але воно натякає, що тепер розклад інший.
        </>
      ),
    },
    {
      q: 'She asked what time the train (leave).',
      a: 'She asked what time the train left.',
      accepted: ['She asked what time the train was leaving.'],
      hint: (
        <>
          Тут зсув потрібен: ідеться про конкретний потяг у конкретний день, а не про вічний
          розклад. Порядок слів прямий: <b>the train left</b>, а не <i>did the train leave</i>.
        </>
      ),
    },
    {
      q: 'He admitted (take) the money from the drawer.',
      a: 'He admitted taking the money from the drawer.',
      accepted: ['He admitted that he had taken the money from the drawer.'],
      hint: (
        <>
          Модель <b>admit doing</b>. ✗ <i>admitted to take</i> не буває: інфінітива в <i>admit</i>{' '}
          немає. Варіант із <i>that</i> теж правильний і трохи офіційніший.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — знайдіть помилку і скажіть, звідки вона',
  lede: 'У кожному реченні рівно одна помилка, і кожна — калька з української. Виправте речення, а потім назвіть українську конструкцію, яка його зіпсувала: це важливіше за саме виправлення.',
  items: [
    {
      q: 'He said me that he would be late.',
      a: 'He told me that he would be late.',
      accepted: ['He said to me that he would be late.'],
      hint: (
        <>
          <i>Say</i> не бере адресата без прийменника. Джерело: українське «сказав мені», де
          давальний відмінок чіпляється до дієслова без жодного прийменника, — і рука переносить цю
          звичку дослівно.
        </>
      ),
    },
    {
      q: 'She asked me where do I live.',
      a: 'She asked me where I lived.',
      hint: (
        <>
          Непряме питання будується як розповідне речення. Джерело: українське «спитала, де я живу»
          виглядає точнісінько як пряме питання «Де я живу?», бо в нас порядок слів вільний і
          допоміжних дієслів немає.
        </>
      ),
    },
    {
      q: 'He said he will come tomorrow.',
      a: 'He said he would come the next day.',
      accepted: ['He said he would come the following day.'],
      hint: (
        <>
          Дві помилки одного походження: незсунуте <i>will</i> і незсунуте <i>tomorrow</i>. Джерело:
          українське «сказав, що прийде завтра» лишає обидва слова недоторканими, бо міряє час від
          його репліки, а не від вашої.
        </>
      ),
    },
    {
      q: 'He suggested me to wait until Monday.',
      a: 'He suggested waiting until Monday.',
      accepted: ['He suggested that we wait until Monday.'],
      hint: (
        <>
          <i>Suggest</i> не має ані адресата, ані інфінітива. Джерело: українське «запропонував мені
          зачекати» будується саме так — адресат плюс інфінітив, — і модель переноситься цілком.
        </>
      ),
    },
    {
      q: 'She told that she was busy all morning.',
      a: 'She said that she was busy all morning.',
      accepted: ['She told me that she was busy all morning.'],
      hint: (
        <>
          Дзеркальна до першої: <i>tell</i> без адресата не вживається. Джерело: українське
          «розповіла, що…» адресата не потребує, тому в англійському реченні його просто немає кому
          поставити.
        </>
      ),
    },
    {
      q: 'He asked me if did I need any help.',
      a: 'He asked me if I needed any help.',
      hint: (
        <>
          Після <i>if</i> йде звичайне розповідне речення, а не питальна конструкція. Джерело:
          відчуття, що «це ж усе одно питання», — його підтримує українське «чи», яке справді стоїть і
          в прямому питанні.
        </>
      ),
    },
    {
      q: 'They said me to wait outside.',
      a: 'They told me to wait outside.',
      hint: (
        <>
          Модель <b>tell somebody to do</b>; <i>say</i> у ній не буває взагалі. Джерело: те саме
          українське «сказали мені зачекати» — одне дієслово на всі випадки.
        </>
      ),
    },
    {
      q: 'He said that he is working there since 2019.',
      a: 'He said that he had been working there since 2019.',
      accepted: ['He said he had worked there since 2019.'],
      hint: (
        <>
          Дві поправки: незсунутий час і Continuous замість Perfect Continuous при <i>since</i>.
          Джерело: українське «сказав, що працює там з 2019-го» — теперішній час і в підрядному, і
          при вказівці на початок дії.
        </>
      ),
    },
    {
      q: 'She asked me when will I be ready.',
      a: 'She asked me when I would be ready.',
      hint: (
        <>
          Інверсія в непрямому питанні неможлива, а <i>will</i> зсувається у <i>would</i>. Джерело:
          українське «спитала, коли я буду готовий» — тут ні порядок слів, ні час не міняються.
        </>
      ),
    },
    {
      q: 'He explained me the new rule twice.',
      a: 'He explained the new rule to me twice.',
      hint: (
        <>
          <i>Explain</i> ставить адресата тільки через <i>to</i> — так само поводяться{' '}
          <i>describe</i>, <i>suggest</i>, <i>announce</i>, <i>mention</i>. Джерело: українське
          «пояснив мені» з давальним відмінком, який в англійській нічим не позначений.
        </>
      ),
    },
  ],
};

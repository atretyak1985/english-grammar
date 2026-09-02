import type { QuizQuestion } from '@/types/content';

/**
 * Тест на 20 питань. Кістяк — форма (be в потрібному часі + V3) і три місця,
 * де українська веде рукою в інший бік: неперехідні дієслова, дієслова типу
 * explain і каузатив. Останнє питання не про граматику, а про вибір — бо
 * половина помилок цієї теми граматично бездоганні.
 */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'The road outside our office ___ at the moment.',
    hint: 'Дорогу біля нашого офісу саме зараз ремонтують.',
    options: ['is repairing', 'is being repaired', 'is repaired'],
    answer: 1,
    why: (
      <>
        <i>At the moment</i> вимагає Continuous, а дорога сама себе не ремонтує — отже, пасив.
        Разом виходить <b>is being repaired</b>. <i>Is repaired</i> — це стан або регулярне
        правило, а <i>is repairing</i> робить дорогу виконавцем робіт.
      </>
    ),
  },
  {
    q: 'What ___ after the meeting?',
    hint: 'Що сталося після наради?',
    options: ['was happened', 'has been happened', 'happened'],
    answer: 2,
    why: (
      <>
        <i>Happen</i> — неперехідне: у нього немає додатка, отже нема чого підіймати в підмети,
        отже пасиву не існує. Помилка росте з українського «сталося»: там теж є «-ся», але воно
        не пасивне. Так само поводяться <i>arrive</i>, <i>appear</i>, <i>die</i>, <i>fall</i>,{' '}
        <i>exist</i>.
      </>
    ),
  },
  {
    q: 'I ___ a new laptop on my first day.',
    hint: 'Мені дали новий ноутбук у перший же день.',
    options: ['was given', 'was gave', 'gave'],
    answer: 0,
    why: (
      <>
        Пасив — це <i>be</i> + <b>третя</b> форма: <i>give — gave — given</i>. У дієслів із двома
        додатками англійська виносить у підмет саме людину, тому <b>I was given</b>, а не{' '}
        <i>To me was given</i>.
      </>
    ),
  },
  {
    q: '___ on my very first day at the company.',
    hint: 'Новий процес мені пояснили в перший же день.',
    options: [
      'I was explained the new process',
      'The new process was explained to me',
      'To me was explained the new process',
    ],
    answer: 1,
    why: (
      <>
        <i>Explain</i> — разом із <i>describe</i>, <i>suggest</i>, <i>announce</i>,{' '}
        <i>mention</i>, <i>say</i> — <b>не пускає людину в підмет</b>. Людина лишається після{' '}
        <i>to</i>. Українська різниці між «мені дали» і «мені пояснили» не робить, тому обидва
        речення будуються однаково — і одне з двох виходить хибним.
      </>
    ),
  },
  {
    q: 'The form ___ before Friday.',
    hint: 'Форму треба підписати до пʼятниці.',
    options: ['must signed', 'must be signed', 'must is signed'],
    answer: 1,
    why: (
      <>
        Після модального стоїть <b>гола форма be</b>, і тільки потім V3. Звʼязка здається зайвою,
        бо в українському «треба підписати» її немає взагалі — а без неї англійське речення
        просто розпадається.
      </>
    ),
  },
  {
    q: 'By the time we arrived, the server ___.',
    hint: 'Коли ми приїхали, сервер уже перезапустили.',
    options: ['was already restarted', 'had already been restarted', 'has already been restarted'],
    answer: 1,
    why: (
      <>
        Дія сталася <b>до</b> іншої минулої дії — Past Perfect Passive: <i>had been</i> + V3.
        Заразом зверніть увагу на <i>arrived</i>: <i>arrive</i> неперехідне, тому перша половина
        речення лишається активною.
      </>
    ),
  },
  {
    q: 'Hamlet ___ in about 1600.',
    hint: 'Гамлета написав Шекспір приблизно 1600 року.',
    options: ['was written by Shakespeare', 'was wrote by Shakespeare', 'is written by Shakespeare'],
    answer: 0,
    why: (
      <>
        Тут <i>by</i> обовʼязковий: імʼя автора — і є вся інформація речення. Ознака така —{' '}
        <b>діяч конкретний і новий для читача</b>. У чотирьох пасивних реченнях із пʼяти діяч
        такий, що його викидають; це якраз пʼяте.
      </>
    ),
  },
  {
    q: 'She hates ___ in the middle of a sentence.',
    hint: 'Вона терпіти не може, коли її перебивають на півслові.',
    options: ['to be interrupt', 'being interrupted', 'be interrupted'],
    answer: 1,
    why: (
      <>
        Після <i>hate</i>, <i>like</i>, <i>avoid</i>, <i>remember</i> і після будь-якого
        прийменника пасив набирає форми <b>being + V3</b>. Це та сама звʼязка <i>be</i>, просто в
        герундійній формі — зникнути вона не може ніде.
      </>
    ),
  },
  {
    q: 'His grandfather ___ two years ago.',
    hint: 'Його дідусь помер два роки тому.',
    options: ['was died', 'has been died', 'died'],
    answer: 2,
    why: (
      <>
        <i>Die</i> неперехідне — пасиву не має. Рука тягне звʼязку, бо «помер» відчувається як
        результат, а не дія, і просить конструкції на кшталт «був хворий». Та сама помилка дає ✗{' '}
        <i>was arrived</i>, ✗ <i>was gone</i>, ✗ <i>was appeared</i>.
      </>
    ),
  },
  {
    q: 'I ___ last week — the garage did it in a day.',
    hint: 'Минулого тижня я віддав машину в ремонт — у сервісі впоралися за день.',
    options: ['repaired my car', 'had my car repaired', 'was repaired my car'],
    answer: 1,
    why: (
      <>
        Каузатив <b>have something done</b>: замовили ви, зробив хтось інший. <i>I repaired my
        car</i> означає, що ви лежали під машиною самі — і друга половина речення це спростовує.
        Українське «віддав у ремонт» цю різницю передає словом, англійська — формою.
      </>
    ),
  },
  {
    q: 'He ___ on Friday — nobody saw it coming.',
    hint: 'Його звільнили в пʼятницю — ніхто не чекав.',
    options: ['got fired', 'was firing', 'has fired'],
    answer: 0,
    why: (
      <>
        <b>get + V3</b> — розмовний пасив для раптових і зазвичай неприємних подій:{' '}
        <i>got fired</i>, <i>got caught</i>, <i>got stuck</i>. У звіті чи листі керівництву буде{' '}
        <i>was fired</i>: зміст той самий, регістр інший.
      </>
    ),
  },
  {
    q: 'This bridge ___ in 1890 and still carries traffic.',
    hint: 'Цей міст збудували 1890 року, і він досі тримає рух.',
    options: ['has been built', 'was built', 'is built'],
    answer: 1,
    why: (
      <>
        <i>In 1890</i> — закінчений період, а він Present Perfect не пускає ніколи, хоч би яким
        живим був результат. Пасив тут стоїть саме тому, що будівельники нікого не цікавлять.
      </>
    ),
  },
  {
    q: 'All the tickets ___ — we were too late.',
    hint: 'Усі квитки вже продані — ми запізнилися.',
    options: ['have been sold', 'have sold', 'are selling'],
    answer: 0,
    why: (
      <>
        Present Perfect Passive: важливий саме <b>наслідок зараз</b> — квитків немає.{' '}
        <i>Have sold</i> зробило б квитки продавцями. А от <i>The tickets are selling fast</i> —
        цілком нормальне речення, тільки означає воно інше: «розходяться швидко».
      </>
    ),
  },
  {
    q: 'The launch ___ until March.',
    hint: 'Кажуть, запуск відкладуть до березня.',
    options: ['is said to be delayed', 'says to be delayed', 'is said to delay'],
    answer: 0,
    why: (
      <>
        Коротка безособова конструкція: підмет виноситься наперед, далі <i>is said / believed /
        expected / reported</i> + <i>to be</i> + V3. Довгий варіант — <i>It is said that the launch
        will be delayed</i>. Обидва правильні, короткий частіший у пресі.
      </>
    ),
  },
  {
    q: 'This house ___ to my grandmother for fifty years.',
    hint: 'Цей будинок належить моїй бабусі вже пʼятдесят років.',
    options: ['has been belonged', 'is belonged', 'has belonged'],
    answer: 2,
    why: (
      <>
        <i>Belong</i> — дієслово стану: справжнього додатка в нього немає (є <i>to</i> +
        іменник), тому й пасиву немає. Так само не переводяться в пасив <i>have</i> у значенні
        «володіти», <i>lack</i>, <i>resemble</i>, <i>suit</i>, <i>fit</i>, <i>cost</i>.
      </>
    ),
  },
  {
    q: 'The doctor ___ immediately, but she arrived only an hour later.',
    hint: 'По лікарку одразу послали, але приїхала вона лише за годину.',
    options: ['was sent', 'was sent for', 'was sent to'],
    answer: 1,
    why: (
      <>
        <i>Send for somebody</i> = послати по когось. У пасиві прийменник <b>лишається при
        дієслові</b>, хоч після нього вже нічого немає: <i>was sent for</i>. Так само{' '}
        <i>The problem was dealt with</i>, <i>The bed hadn’t been slept in</i>.
      </>
    ),
  },
  {
    q: 'I ___ in Odesa, but I grew up in Lviv.',
    hint: 'Я народився в Одесі, але виріс у Львові.',
    options: ['born', 'was born', 'have been born'],
    answer: 1,
    why: (
      <>
        <i>Be born</i> існує тільки в пасиві й майже завжди в Past Simple. Українське
        «народився» з його «-ся» штовхає одразу до двох хибних варіантів — до активу без звʼязки
        і до перфекта.
      </>
    ),
  },
  {
    q: 'This whole thing could ___ a month ago.',
    hint: 'Усе це можна було зробити ще місяць тому.',
    options: ['have been done', 'be done', 'have done'],
    answer: 0,
    why: (
      <>
        Модальне про минуле бере <i>have been</i> + V3 — чотири слова поспіль, і жодного не
        викинути: <b>could have been done</b>. Той самий каркас у <i>should have been told</i>,{' '}
        <i>might have been changed</i>.
      </>
    ),
  },
  {
    q: 'Please don’t edit the file — it ___ right now.',
    hint: 'Не редагуй файл, будь ласка: його саме зараз перевіряють.',
    options: ['is reviewed', 'is being reviewed', 'has been reviewed'],
    answer: 1,
    why: (
      <>
        Процес триває просто зараз — Present Continuous Passive. <i>Is reviewed</i> прочиталось
        би як регулярне правило, <i>has been reviewed</i> — як «уже перевірили», і тоді прохання
        не редагувати втрачає сенс.
      </>
    ),
  },
  {
    q: 'Внутрішній лист команді. Який варіант напише носій?',
    hint: 'Наша команда вирішила перенести запуск на березень.',
    options: [
      'It was decided by our team that the launch would be postponed until March.',
      'Our team decided to postpone the launch until March.',
      'The launch was decided to be postponed by our team until March.',
    ],
    answer: 1,
    why: (
      <>
        Граматично правильні всі три — і саме тому це найважливіше питання тесту. Діяч названий (
        <i>our team</i>), отже приховувати нема кого, отже пасив лише подвоїв довжину речення.
        Пасив вмикають тоді, коли діяч невідомий, неважливий або небажаний; тут не збіглося
        жодної з трьох умов.
      </>
    ),
  },
];

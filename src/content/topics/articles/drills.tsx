import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Артиклі».
   Розділ 11 — переклад з української (25 речень, чотири блоки).
   Розділ 14 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — a/an: новий предмет у розмові',
  items: [
    {
      q: 'У мене о третій зустріч.',
      a: 'I have a meeting at three.',
      accepted: ["I've got a meeting at three."],
      hint: (
        <>
          Зустріч — злічувана, одна, і співрозмовник про неї ще не знав → <i>a</i>. Речення без
          артикля (<i>I have meeting</i>) — помилка №1 українців.
        </>
      ),
    },
    {
      q: 'Нам потрібен новий підрядник.',
      a: 'We need a new vendor.',
      accepted: ['We need a new contractor.'],
      hint: 'Будь-який новий, ще не вибраний — «типу» → a.',
    },
    {
      q: 'Це займе годину.',
      a: 'It will take an hour.',
      accepted: ["It'll take an hour.", 'It takes an hour.'],
      hint: (
        <>
          <i>hour</i> починається з голосного <b>звуку</b> /aʊ/ — h німа, тому <i>an</i>.
        </>
      ),
    },
    {
      q: 'Вона інженерка.',
      a: 'She is an engineer.',
      accepted: ["She's an engineer."],
      hint: (
        <>
          Професія в однині завжди бере артикль: ви — один із людей цієї професії. ✗{' '}
          <i>She is engineer</i>.
        </>
      ),
    },
    {
      q: 'Мені прийшов рахунок від хостинг-провайдера.',
      a: 'I got an invoice from a hosting provider.',
      accepted: ['I received an invoice from a hosting provider.'],
      hint: 'Обидва іменники нові для співрозмовника: an перед голосним звуком, a перед приголосним.',
    },
    {
      q: 'Купи парасольку — дощ збирається.',
      a: "Buy an umbrella — it's going to rain.",
      hint: (
        <>
          Будь-яка парасолька → <i>an</i>. А от якби вона стояла біля дверей і ми обоє про неї
          знали — було б <i>take the umbrella</i>.
        </>
      ),
    },
    {
      q: 'Ми знімаємо квартиру в старому будинку.',
      a: 'We rent a flat in an old building.',
      accepted: ['We rent an apartment in an old building.'],
      hint: (
        <>
          Артикль дивиться на <b>наступне слово</b>: a flat, але an old building — <i>old</i>{' '}
          починається з голосного.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — the: ми обоє знаємо, який',
  items: [
    {
      q: 'Зустріч перенесли на пʼятницю.',
      a: 'The meeting has been moved to Friday.',
      accepted: ['The meeting was moved to Friday.', 'They moved the meeting to Friday.'],
      hint: (
        <>
          Та сама зустріч, про яку обоє знаємо → <i>the</i>. Порівняйте з <i>a meeting</i> у
          блоці A: там вона зʼявилась у розмові вперше.
        </>
      ),
    },
    {
      q: 'Надішли мені файл, будь ласка.',
      a: 'Send me the file, please.',
      accepted: ['Please send me the file.'],
      hint: (
        <>
          Обоє знають, про який файл ідеться — інакше прохання не мало б сенсу. ✗{' '}
          <i>Send me file</i>.
        </>
      ),
    },
    {
      q: 'Хто сьогодні на кухні залишив каву?',
      a: 'Who left the coffee in the kitchen today?',
      hint: (
        <>
          Кухня в офісі одна — єдина в спільному просторі → <i>the</i>. І кава конкретна — ось
          вона стоїть.
        </>
      ),
    },
    {
      q: 'Директор хоче бачити звіт до обіду.',
      a: 'The CEO wants to see the report by noon.',
      accepted: ['The director wants to see the report by noon.'],
      hint: 'Директор у компанії один, звіт — той, над яким працюємо. Обидва the.',
    },
    {
      q: 'Інтернет знову впав.',
      a: 'The internet is down again.',
      accepted: ['The internet went down again.'],
      hint: (
        <>
          <i>the internet</i> — усталене the: він один на всіх. Так само <i>the sun</i>,{' '}
          <i>the sky</i>, <i>the world</i>.
        </>
      ),
    },
    {
      q: 'Це найкраще рішення з усіх, що ми розглядали.',
      a: "It's the best solution we've considered.",
      accepted: ['This is the best solution we have considered.'],
      hint: (
        <>
          Найвищий ступінь завжди з <i>the</i>: найкраще — воно одне. <i>the best, the fastest,
          the cheapest</i>.
        </>
      ),
    },
    {
      q: 'Ми з тим самим клієнтом говоримо про те саме вже місяць.',
      a: "We've been talking about the same thing with the same client for a month.",
      hint: (
        <>
          <i>same</i> — завжди <i>the same</i>, без винятків. ✗ <i>a same</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — нульовий артикль і незлічувані',
  items: [
    {
      q: 'Мені потрібна порада.',
      a: 'I need some advice.',
      accepted: ['I need advice.', 'I need a piece of advice.'],
      hint: (
        <>
          <i>advice</i> — незлічуване: ✗ <i>an advice</i>. Голе <i>advice</i>, помʼякшене{' '}
          <i>some advice</i> або порційне <i>a piece of advice</i>.
        </>
      ),
    },
    {
      q: 'Дякую за відгук про реліз.',
      a: 'Thanks for the feedback on the release.',
      accepted: ['Thank you for the feedback on the release.'],
      hint: (
        <>
          <i>feedback</i> — незлічуване, тому ніколи ✗ <i>a feedback</i>. А <i>the</i> тут
          доречне: відгук конкретний, уже отриманий.
        </>
      ),
    },
    {
      q: 'Час — гроші.',
      a: 'Time is money.',
      hint: (
        <>
          Обидва — «розмазня» в загальному сенсі → нульовий артикль. ✗ <i>The time is the
          money</i>.
        </>
      ),
    },
    {
      q: 'Я люблю каву, але сьогоднішня кава жахлива.',
      a: 'I love coffee, but the coffee today is terrible.',
      accepted: ['I love coffee but the coffee today is awful.'],
      hint: (
        <>
          Перша <i>coffee</i> — категорія загалом → нуль. Друга — ось ця конкретна, у чашці →{' '}
          <i>the</i>. Одне слово, два артиклі — і обидва правильні.
        </>
      ),
    },
    {
      q: 'Новини погані: обладнання ще не приїхало.',
      a: "The news is bad: the equipment hasn't arrived yet.",
      hint: (
        <>
          <i>news</i> — однина (✗ <i>news are</i>), <i>equipment</i> — незлічуване (✗{' '}
          <i>equipments</i>). Обидва тут конкретні → the.
        </>
      ),
    },
    {
      q: 'Розробники не люблять зайвих зустрічей.',
      a: "Developers don't like unnecessary meetings.",
      accepted: ['Developers do not like unnecessary meetings.'],
      hint: (
        <>
          Усі розробники як категорія → нульовий артикль. <i>The developers</i> означало б
          конкретну команду, про яку ми обоє знаємо.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — сталі вирази й географія',
  items: [
    {
      q: 'Я вдома, працюю з дому.',
      a: "I'm at home, working from home.",
      accepted: ['I am home, working from home.'],
      hint: (
        <>
          <i>home</i> у сталих виразах живе без артикля: <i>at home, from home, go home</i>. ✗{' '}
          <i>at the home</i>, ✗ <i>go to home</i>.
        </>
      ),
    },
    {
      q: 'Він ще в ліжку — лягли о третій ночі.',
      a: "He's still in bed — we went to bed at 3 a.m.",
      hint: (
        <>
          <i>in bed / go to bed</i> — ліжко як сон, а не як меблі → без артикля. <i>Sit on the
          bed</i> — а от тут це вже предмет.
        </>
      ),
    },
    {
      q: 'Я їжджу на роботу машиною, а колега — автобусом.',
      a: 'I go to work by car, and my colleague goes by bus.',
      accepted: ['I get to work by car and my colleague goes by bus.'],
      hint: (
        <>
          <i>by + транспорт</i> — без артикля: <i>by car, by bus, by train, by plane</i>. І{' '}
          <i>to work</i> теж без.
        </>
      ),
    },
    {
      q: 'Україна більша за Нідерланди.',
      a: 'Ukraine is bigger than the Netherlands.',
      accepted: ['Ukraine is larger than the Netherlands.'],
      hint: (
        <>
          Країни — без артикля, але множинні й «складені» назви беруть the: <i>the
          Netherlands, the USA, the UK</i>. І окремо: ✗ <i>the Ukraine</i> — так писали, коли
          читали назву як «околицю»; незалежна країна — просто <i>Ukraine</i>.
        </>
      ),
    },
    {
      q: 'Дніпро тече через пів країни, а озеро Синевир — у Карпатах.',
      a: 'The Dnipro flows through half the country, and Lake Synevyr is in the Carpathians.',
      hint: (
        <>
          Річки й гірські хребти — з <i>the</i>: <i>the Dnipro, the Carpathians</i>. Озера й
          окремі вершини — без: <i>Lake Synevyr, Mount Hoverla</i>.
        </>
      ),
    },
  ],
};

/* ---------- Розділ 14 — вправи ---------- */

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — вставте a, an, the або нічого',
  lede: 'Читайте вголос повне речення з відповіддю: артиклі ставляться на слух швидше, ніж за правилами.',
  items: [
    {
      q: 'I found ___ bug in ___ payment module we shipped yesterday.',
      a: 'a bug · the payment module',
      hint: 'Баг новий для співрозмовника → a. Модуль конкретний — той, що вчора випустили → the.',
    },
    {
      q: 'Can you send me ___ agenda for ___ tomorrow’s call?',
      a: 'the agenda · без артикля',
      hint: (
        <>
          Порядок денний конкретного дзвінка → the. А <i>tomorrow&apos;s</i> — присвійна форма,
          зʼїдач артикля: після неї нічого не ставиться.
        </>
      ),
    },
    {
      q: 'She gave me ___ useful advice about ___ interview.',
      a: 'some useful advice (або без артикля) · the interview',
      hint: (
        <>
          <i>advice</i> незлічуване: ✗ <i>an advice</i>. Співбесіда конкретна, обом відома → the.
        </>
      ),
    },
    {
      q: '___ sun is shining, and it’s ___ perfect day for a walk.',
      a: 'The sun · a perfect day',
      hint: 'Сонце одне на всіх → the. День — один із можливих гарних днів → a.',
    },
    {
      q: 'He’s ___ engineer at ___ small startup in Lviv.',
      a: 'an engineer · a small startup',
      hint: 'Професія → an (голосний звук). Стартап згадується вперше → a.',
    },
    {
      q: 'I’ll be back in ___ hour — I’m taking ___ kids to school.',
      a: 'an hour · the kids',
      hint: (
        <>
          <i>hour</i> — h німа, звук голосний → an. Діти — свої, конкретні → the. А{' '}
          <i>to school</i> — сталий вираз без артикля.
        </>
      ),
    },
    {
      q: 'We store ___ logs for thirty days, but ___ logs from Friday are missing.',
      a: 'без артикля · the logs',
      hint: 'Перше — логи взагалі, категорія → нуль. Друге — конкретні пʼятничні → the.',
    },
    {
      q: '___ money isn’t ___ problem — ___ problem is time.',
      a: 'Money · a problem · the problem',
      hint: (
        <>
          Гроші загалом → нуль. «Не є проблемою» — однією з можливих → a. «А проблема ось у
          чому» — та сама, щойно названа → the.
        </>
      ),
    },
    {
      q: 'It was ___ honest answer, even if not ___ one I wanted.',
      a: 'an honest answer · the one',
      hint: (
        <>
          <i>honest</i> — h німа → an. <i>the one I wanted</i> — уточнення «саме та» робить
          відповідь єдиною → the.
        </>
      ),
    },
    {
      q: 'They live in ___ Netherlands now, but they’re from ___ Kharkiv.',
      a: 'the Netherlands · без артикля',
      hint: 'Назва-множина → the Netherlands. Місто — без артикля: Kharkiv, Kyiv, London.',
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  lede: 'У кожному реченні рівно одна помилка з артиклем — так, як їх насправді роблять у листах і чатах.',
  items: [
    {
      q: 'I have meeting with the client at four.',
      a: 'I have a meeting with the client at four.',
      hint: 'Однина злічуваного голою не ходить: meeting мусить узяти a, the або my.',
    },
    {
      q: 'She gave me an advice that saved the project.',
      a: 'She gave me advice that saved the project. (або a piece of advice)',
      hint: (
        <>
          <i>advice</i> — незлічуване, «розмазня»: ✗ an advice, ✗ advices.
        </>
      ),
    },
    {
      q: 'The life is too short for bad coffee.',
      a: 'Life is too short for bad coffee.',
      hint: (
        <>
          Абстракції загалом — без артикля: <i>life, love, freedom, happiness</i>. <i>The
          life</i> зʼявляється тільки з уточненням: <i>the life of a freelancer</i>.
        </>
      ),
    },
    {
      q: 'He is best developer in our team.',
      a: 'He is the best developer in our team.',
      hint: 'Найвищий ступінь завжди бере the: найкращий — один.',
    },
    {
      q: 'I read it on internet yesterday.',
      a: 'I read it on the internet yesterday.',
      hint: (
        <>
          <i>the internet</i> — усталене the. Так само <i>the radio</i>, але <i>watch TV</i> —
          без.
        </>
      ),
    },
    {
      q: 'We visited an university campus near the London.',
      a: 'We visited a university campus near London.',
      hint: (
        <>
          <i>university</i> починається зі звуку /juː/ — приголосного → a. Міста — без артикля.
          Дві помилки в одному реченні — обидві про звук і про власні назви.
        </>
      ),
    },
    {
      q: 'Send me the same file one more time — it was a same error.',
      a: 'Send me the same file one more time — it was the same error.',
      hint: (
        <>
          <i>same</i> — тільки <i>the same</i>. «Такий самий» усе одно the: сенс порівняння
          робить його визначеним.
        </>
      ),
    },
    {
      q: 'My wife is in the hospital — she works there as a nurse.',
      a: 'My wife is at the hospital — she works there as a nurse. (або: is in hospital — якби лежала хворою, BrE)',
      hint: (
        <>
          <i>in hospital</i> (BrE) = лежить хвора; <i>in the hospital</i> (AmE) — те саме. Але
          «на роботі в лікарні» — <i>at the hospital</i>: це будівля, а не стан.
        </>
      ),
    },
    {
      q: 'The developers hate the meetings.',
      a: 'Developers hate meetings.',
      hint: (
        <>
          Якщо це «розробники взагалі не люблять зустрічей взагалі» — обидва артиклі зайві.
          З the речення означає: конкретна команда ненавидить конкретні зустрічі — теж
          можливо, але це інше речення.
        </>
      ),
    },
    {
      q: 'I go to the work by the bus.',
      a: 'I go to work by bus.',
      hint: (
        <>
          Сталі вирази: <i>to work</i> — робота як діяльність, <i>by bus</i> — спосіб
          пересування. Обидва без артикля.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — a чи the: поясніть різницю',
  lede: 'Обидва речення в кожній парі граматично правильні. Ваше завдання — сказати, коли яке доречне. Це і є справжнє володіння артиклями.',
  items: [
    {
      q: 'I talked to a manager. / I talked to the manager.',
      a: 'a — якийсь менеджер, один із; the — той самий, наш, відомий обом.',
      hint: (
        <>
          У скарзі в підтримку: <i>I talked to a manager</i> — «мене перемкнули на когось». Про
          свого керівника: <i>the manager</i>.
        </>
      ),
    },
    {
      q: 'We need a designer. / We need the designer.',
      a: 'a — вакансія: будь-який дизайнер; the — покличте нашого, конкретного.',
      hint: 'a відкриває пошук, the вимагає конкретну людину. Однакові слова — різні дії.',
    },
    {
      q: 'She bought a house by the sea. / She bought the house by the sea.',
      a: 'a — ми чуємо про будинок уперше; the — той самий будинок, про який давно говорили.',
      hint: (
        <>
          <i>the house</i> звучить як фінал історії, яку співрозмовник знає: «таки купила».
        </>
      ),
    },
    {
      q: 'There’s a problem with the deploy. / There’s the problem!',
      a: 'a problem — зʼявилась якась проблема; the problem — ось вона, та сама, яку шукали.',
      hint: (
        <>
          <i>There is a…</i> вводить нове — тому після <i>there is</i> майже завжди a.{' '}
          <i>There&apos;s the problem!</i> — вигук знахідки.
        </>
      ),
    },
    {
      q: 'Open a window. / Open the window.',
      a: 'a — будь-яке з кількох; the — те єдине, або те, біля якого стоїмо.',
      hint: 'У кімнаті з одним вікном природне тільки the: воно єдине в спільній ситуації.',
    },
    {
      q: 'He’s a founder of a startup. / He’s the founder of the startup.',
      a: 'a founder of a startup — один із засновників якогось стартапу; the founder of the startup — єдиний засновник того самого стартапу.',
      hint: (
        <>
          <i>a founder</i> припускає співзасновників; <i>the founder</i> каже: засновник один.
          Артикль тут повідомляє факт про компанію.
        </>
      ),
    },
    {
      q: 'I need a minute. / Do you have the time?',
      a: 'a minute — трохи часу, одна хвилина з багатьох; the time — конкретний час на годиннику.',
      hint: (
        <>
          <i>Do you have time?</i> — «маєш час?», <i>Do you have the time?</i> — «котра
          година?». Один артикль перевертає питання.
        </>
      ),
    },
    {
      q: 'Let’s grab a coffee. / The coffee here is great.',
      a: 'a coffee — одна порція, чашка; the coffee here — конкретна кава цього місця.',
      hint: (
        <>
          Незлічуване <i>coffee</i> у значенні «порція» стає злічуваним: <i>two coffees,
          please</i>. Мова торгується з власними правилами, коли зʼявляється чашка.
        </>
      ),
    },
  ],
};

import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Побудова речення».
   Розділ 11 — переклад з української (25 речень, чотири блоки).
   Розділ 14 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — базовий порядок: хто → робить → що → де → коли',
  items: [
    {
      q: 'Менеджер учора схвалив бюджет.',
      a: 'The manager approved the budget yesterday.',
      accepted: ['Yesterday the manager approved the budget.'],
      hint: (
        <>
          Українською «учора» стоїть будь-де. Англійською час — у кінці (або на самому початку),
          але ніколи між дієсловом і додатком: ✗ <i>approved yesterday the budget</i>.
        </>
      ),
    },
    {
      q: 'Я додав файл до листа.',
      a: 'I attached the file to the email.',
      hint: (
        <>
          Рівно за схемою слотів: хто → робить → що → куди. Жодне слово не може перескочити
          через сусіда.
        </>
      ),
    },
    {
      q: 'Ми тримаємо запчастини на складі.',
      a: 'We keep the spare parts at the warehouse.',
      hint: (
        <>
          Місце йде після додатка: ✗ <i>We keep at the warehouse the spare parts</i>.
        </>
      ),
    },
    {
      q: 'Вона дуже любить каву.',
      a: 'She really likes coffee.',
      accepted: ['She likes coffee very much.'],
      hint: (
        <>
          Найвідоміша пастка теми: ✗ <i>She very likes coffee</i>. <i>Very</i> саме по собі до
          дієслова не чіпляється — або <i>really</i> перед дієсловом, або <i>very much</i> у кінці.
        </>
      ),
    },
    {
      q: 'Курʼєр доставив пакунок вчасно.',
      a: 'The courier delivered the package on time.',
      hint: 'Хто → робить → що → як/коли. Порядок той самий у будь-якому часі.',
    },
    {
      q: 'Я надіслав клієнтові рахунок у понеділок.',
      a: 'I sent the client the invoice on Monday.',
      accepted: ['I sent the invoice to the client on Monday.'],
      hint: (
        <>
          Два додатки: <b>кому</b> без прийменника стоїть перед <b>що</b> — або <b>що</b> +{' '}
          <i>to</i> <b>кому</b>. Розділ 7.
        </>
      ),
    },
    {
      q: 'Нам потрібна ця оцінка до дедлайну.',
      a: 'We need the estimate before the deadline.',
      hint: (
        <>
          Українське «нам потрібно» — це англійське <i>we need</i>: підмет обовʼязковий, і це{' '}
          <i>we</i>, а не <i>us</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — питання',
  items: [
    {
      q: 'Ти бачив мій лист?',
      a: 'Did you see my email?',
      accepted: ['Have you seen my email?'],
      hint: (
        <>
          Інтонацією питання не будується: допоміжне дієслово мусить стати перед підметом. ✗{' '}
          <i>You saw my email?</i>
        </>
      ),
    },
    {
      q: 'Де вона працює?',
      a: 'Where does she work?',
      hint: (
        <>
          Питальне слово → допоміжне → підмет → дієслово. ✗ <i>Where she works?</i> І <i>-s</i>{' '}
          уже переїхало в <i>does</i>.
        </>
      ),
    },
    {
      q: 'Хто зламав принтер?',
      a: 'Who broke the printer?',
      hint: (
        <>
          Питання до підмета — єдине без інверсії і без <i>did</i>: <i>who</i> сам стоїть у слоті
          «хто», тому далі звичайний порядок ствердження.
        </>
      ),
    },
    {
      q: 'Скільки коштує доставка?',
      a: 'How much does the delivery cost?',
      accepted: ['How much does delivery cost?'],
      hint: (
        <>
          ✗ <i>How much costs the delivery?</i> — калька. Після питального слова однаково{' '}
          <i>does</i> + підмет + дієслово.
        </>
      ),
    },
    {
      q: 'Можеш нагадати мені про зустріч?',
      a: 'Can you remind me about the meeting?',
      hint: (
        <>
          Модальне дієслово — самé собі двигун: стрибає наперед без <i>do</i>.
        </>
      ),
    },
    {
      q: 'Чому вони скасували рейс?',
      a: 'Why did they cancel the flight?',
      hint: (
        <>
          Минулий час у питанні живе в <i>did</i>, тому далі початкова форма: ✗{' '}
          <i>Why did they cancelled…</i>
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — заперечення, there is та порожнє it',
  items: [
    {
      q: 'Я не знаю відповіді.',
      a: "I don't know the answer.",
      accepted: ['I do not know the answer.'],
      hint: (
        <>
          <i>not</i> не стоїть сам: він чіпляється до допоміжного. Немає двигуна — приїжджає{' '}
          <i>do</i>.
        </>
      ),
    },
    {
      q: 'Вона нічого не сказала.',
      a: 'She said nothing.',
      accepted: ["She didn't say anything."],
      hint: (
        <>
          Одне заперечення на речення: або <i>nothing</i>, або <i>didn&apos;t … anything</i>.
          Разом — ✗ <i>She didn&apos;t say nothing</i>.
        </>
      ),
    },
    {
      q: 'У цій кімнаті є вільна розетка.',
      a: 'There is a free socket in this room.',
      accepted: ["There's a free socket in this room."],
      hint: (
        <>
          Українське «є щось десь» → <i>There is…</i> Слот підмета не може лишитися порожнім.
        </>
      ),
    },
    {
      q: 'Надворі холодно.',
      a: 'It is cold outside.',
      accepted: ["It's cold outside."],
      hint: (
        <>
          ✗ <i>Is cold outside</i>. В українському безособовому реченні підмета нема — в
          англійському його місце займає порожнє <i>it</i>.
        </>
      ),
    },
    {
      q: 'На складі немає коробок.',
      a: 'There are no boxes at the warehouse.',
      accepted: ["There aren't any boxes at the warehouse."],
      hint: (
        <>
          Множина — <i>there are</i>. Заперечення: <i>no</i> + іменник або <i>not any</i>.
        </>
      ),
    },
    {
      q: 'Важливо підписати контракт сьогодні.',
      a: 'It is important to sign the contract today.',
      accepted: ["It's important to sign the contract today."],
      hint: (
        <>
          «Важливо зробити X» → <i>It is important to do X</i>: порожнє <i>it</i> тримає слот
          підмета, поки справжній зміст стоїть в інфінітиві.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — прислівники і український наголос',
  items: [
    {
      q: 'Я завжди перевіряю пошту вранці.',
      a: 'I always check my email in the morning.',
      hint: (
        <>
          Частота — перед основним дієсловом: ✗ <i>I check always…</i>, ✗ <i>Always I check…</i>
        </>
      ),
    },
    {
      q: 'Він зазвичай спізнюється на стендап.',
      a: 'He is usually late for the stand-up.',
      hint: (
        <>
          Із <i>be</i> частота стає ПІСЛЯ нього: ✗ <i>He usually is late</i>.
        </>
      ),
    },
    {
      q: 'Вона вільно розмовляє англійською.',
      a: 'She speaks English fluently.',
      hint: (
        <>
          Спосіб дії — після додатка: ✗ <i>She speaks fluently English</i>. Між дієсловом і
          додатком ніхто не встає.
        </>
      ),
    },
    {
      q: 'Ми ще ведемо переговори про ціну.',
      a: 'We are still negotiating the price.',
      hint: (
        <>
          <i>still</i> живе в середині — після <i>be</i>: ✗ <i>We still are negotiating</i>.
        </>
      ),
    },
    {
      q: 'Цей звіт написала Олена. (наголос на «Олена»)',
      a: 'This report was written by Olena.',
      accepted: ['It was Olena who wrote this report.'],
      hint: (
        <>
          Український наголос порядком слів англійська передає перебудовою: пасив або{' '}
          <i>It was … who…</i> Розділ 9.
        </>
      ),
    },
    {
      q: 'Чернетку я вам надішлю завтра.',
      a: 'I will send you the draft tomorrow.',
      accepted: ['I will send the draft to you tomorrow.'],
      hint: (
        <>
          Український винесений наперед додаток («чернетку…») в англійській вертається у свій
          слот після дієслова.
        </>
      ),
    },
  ],
};

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — зберіть речення зі слів',
  lede: 'Слова подано в довільному порядку. Розставте їх у слоти: хто → робить → що → де → коли.',
  items: [
    {
      q: 'always / I / at home / on Fridays / work',
      a: 'I always work at home on Fridays.',
      hint: 'Частота перед дієсловом, місце перед часом.',
    },
    {
      q: 'the invoice / she / yesterday / sent / to the client',
      a: 'She sent the invoice to the client yesterday.',
      hint: 'Хто → робить → що → кому → коли.',
    },
    {
      q: 'in the kitchen / is / there / coffee machine / a / new',
      a: 'There is a new coffee machine in the kitchen.',
      hint: (
        <>
          «Є щось десь» → <i>There is</i>. Прикметник — перед іменником.
        </>
      ),
    },
    {
      q: 'you / the deadline / did / move / why',
      a: 'Why did you move the deadline?',
      hint: 'Питальне слово → did → підмет → дієслово → додаток.',
    },
    {
      q: 'never / he / his passwords / writes down',
      a: 'He never writes down his passwords.',
      hint: (
        <>
          <i>never</i> — прислівник частоти, місце перед основним дієсловом.
        </>
      ),
    },
    {
      q: 'English / speaks / quite / she / fluently',
      a: 'She speaks English quite fluently.',
      hint: 'Спосіб дії стоїть після додатка, не між дієсловом і додатком.',
    },
    {
      q: 'a / bought / leather / black / bag / I',
      a: 'I bought a black leather bag.',
      hint: (
        <>
          Колір перед матеріалом: <i>black leather</i>, не <i>leather black</i>. Розділ 6.
        </>
      ),
    },
    {
      q: 'me / could / the estimate / you / send / tomorrow',
      a: 'Could you send me the estimate tomorrow?',
      hint: (
        <>
          Модальне наперед, далі підмет. <i>me</i> без прийменника — одразу після дієслова.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — виправте помилку',
  lede: 'У кожному реченні рівно одна помилка порядку слів. Знайдіть і виправте.',
  items: [
    {
      q: 'I very like this idea.',
      a: 'I really like this idea.',
      accepted: ['I like this idea very much.'],
      hint: (
        <>
          <i>very</i> не працює з дієсловом наодинці: <i>really</i> перед дієсловом або{' '}
          <i>very much</i> у кінці.
        </>
      ),
    },
    {
      q: 'Is raining now.',
      a: 'It is raining now.',
      hint: (
        <>
          Речення без підмета не буває. Про погоду підмет — порожнє <i>it</i>.
        </>
      ),
    },
    {
      q: 'She sent to me the file.',
      a: 'She sent me the file.',
      accepted: ['She sent the file to me.'],
      hint: (
        <>
          Або <i>sent me the file</i> (кому без прийменника — першим), або{' '}
          <i>sent the file to me</i>. Змішаний варіант — ні.
        </>
      ),
    },
    {
      q: "I don't know nothing about it.",
      a: "I don't know anything about it.",
      accepted: ['I know nothing about it.'],
      hint: (
        <>
          Два заперечення в одному реченні знищують одне одного. Лишіть одне: <i>don&apos;t …
          anything</i> або <i>nothing</i>.
        </>
      ),
    },
    {
      q: 'Where she works?',
      a: 'Where does she work?',
      hint: (
        <>
          Питальне слово не скасовує інверсії: далі однаково <i>does</i> + підмет + V1.
        </>
      ),
    },
    {
      q: 'He speaks very well English.',
      a: 'He speaks English very well.',
      hint: (
        <>
          Між дієсловом і додатком ніхто не встає. Спосіб дії — після <i>English</i>.
        </>
      ),
    },
    {
      q: 'I saw yesterday him near the office.',
      a: 'I saw him near the office yesterday.',
      hint: (
        <>
          <i>yesterday</i> — у кінець (або на самий початок). Між дієсловом і додатком — ніколи.
        </>
      ),
    },
    {
      q: 'We have in the office a new printer.',
      a: 'We have a new printer in the office.',
      hint: 'Що → де. Додаток стоїть одразу після дієслова, місце — за ним.',
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — поставте слово на його місце',
  lede: 'Перепишіть речення, вставивши слово з дужок туди, де воно живе.',
  items: [
    {
      q: 'She checks her email. (usually)',
      a: 'She usually checks her email.',
      hint: 'Частота — перед основним дієсловом.',
    },
    {
      q: 'They are late for the daily meeting. (often)',
      a: 'They are often late for the daily meeting.',
      hint: (
        <>
          Із <i>be</i> частота йде після нього.
        </>
      ),
    },
    {
      q: 'I have finished the draft. (already)',
      a: 'I have already finished the draft.',
      hint: (
        <>
          <i>already</i> — між допоміжним і основним дієсловом.
        </>
      ),
    },
    {
      q: "We haven't approved the budget. (yet)",
      a: "We haven't approved the budget yet.",
      hint: (
        <>
          <i>yet</i> у запереченні — у самому кінці.
        </>
      ),
    },
    {
      q: 'He explained the problem. (calmly)',
      a: 'He explained the problem calmly.',
      accepted: ['He calmly explained the problem.'],
      hint: (
        <>
          Спосіб дії — після додатка (нейтрально) або перед дієсловом (книжніше). Між{' '}
          <i>explained</i> і <i>the problem</i> — ніколи.
        </>
      ),
    },
    {
      q: 'I will be at the warehouse. (tomorrow morning)',
      a: 'I will be at the warehouse tomorrow morning.',
      hint: 'Місце перед часом: де → коли.',
    },
    {
      q: 'She borrowed my charger. (again)',
      a: 'She borrowed my charger again.',
      hint: (
        <>
          <i>again</i> — типовий кінець речення.
        </>
      ),
    },
  ],
};

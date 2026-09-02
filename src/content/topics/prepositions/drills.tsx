import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Прийменники».
   Розділ 12 — переклад з української (чотири блоки за кластерами).
   Розділ 15 — вправи A, B, C.
   EXERCISE_B: рядки 5, 6, 7, 9, 11, 12, 14, 15 з таблиці помилок
   02-research.md §2 — без перетину з mistakes.mdx (рядки 1, 2, 3, 4,
   8, 10, 16, 17, 22, 25 там уже розібрані).
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — час: at, in, on та межі часу',
  items: [
    {
      q: 'Зустріч призначена на пʼяту годину.',
      a: "The meeting is at five o'clock.",
      hint: (
        <>
          Точна мітка на годиннику — завжди <b>at</b>: <i>at five o&apos;clock, at noon, at
          midnight</i>.
        </>
      ),
    },
    {
      q: 'Я народився в червні.',
      a: 'I was born in June.',
      hint: (
        <>
          Місяць — великий проміжок, обʼєм часу: <b>in</b> June, <i>in</i> 2010, <i>in</i> summer.
        </>
      ),
    },
    {
      q: 'Ми зустрічаємось у понеділок вранці.',
      a: 'We are meeting on Monday morning.',
      hint: (
        <>
          Конкретний день + ранок/день/вечір разом поводяться як один день: <b>on</b> Monday
          morning, не <i>in</i> the Monday morning.
        </>
      ),
    },
    {
      q: 'Я не можу спати вночі, коли так спекотно.',
      a: "I can't sleep at night when it's so hot.",
      hint: (
        <>
          <i>at night</i> — виняток, який треба просто запамʼятати: ніч звучить як проміжок, але
          прийменник — <b>at</b>, як <i>at the weekend</i>.
        </>
      ),
    },
    {
      q: 'Феєрверк почався опівночі.',
      a: 'The fireworks started at midnight.',
      hint: 'Опівніч — точна мить на циферблаті, тому at, а не in чи on.',
    },
    {
      q: 'Я закінчив університет у 2010 році.',
      a: 'I graduated in 2010.',
      hint: 'Рік — великий проміжок часу: in 2010, як in June чи in the 1990s.',
    },
    {
      q: 'Ми завжди готуємо особливу вечерю на мій день народження.',
      a: 'We always cook a special dinner on my birthday.',
      hint: (
        <>
          День народження поводиться як конкретний день: <b>on</b> my birthday, <i>on</i> New
          Year&apos;s Day.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — місце: at, in, on та статичні відносини',
  items: [
    {
      q: 'Курʼєр чекає біля дверей.',
      a: 'The courier is waiting at the door.',
      hint: 'Двері — точка на плані приміщення: at the door, at the entrance.',
    },
    {
      q: 'У кімнаті нікого немає.',
      a: 'There is nobody in the room.',
      hint: 'Кімната — замкнений обʼєм: in the room, in the office, in the box.',
    },
    {
      q: 'Ключі лежать на столі.',
      a: 'The keys are on the table.',
      accepted: ['The keys are lying on the table.'],
      hint: 'Видима поверхня, на якій щось лежить: on the table, on the shelf, on the floor.',
    },
    {
      q: 'Автомобіль припаркований перед будинком.',
      a: 'The car is parked in front of the house.',
      hint: (
        <>
          <i>in front of</i> — протилежність до <i>behind</i>: перед фасадом, а не всередині.
        </>
      ),
    },
    {
      q: 'Банк знаходиться між кафе і аптекою.',
      a: 'The bank is between the café and the pharmacy.',
      hint: (
        <>
          Рівно два орієнтири поруч → <b>between</b>. Для трьох і більше буде <i>among</i>.
        </>
      ),
    },
    {
      q: 'Він сидить поруч зі мною.',
      a: 'He is sitting next to me.',
      accepted: ['He is sitting beside me.'],
      hint: 'next to / beside / near — практично взаємозамінні для «поруч».',
    },
    {
      q: 'Школа розташована навпроти парку.',
      a: 'The school is opposite the park.',
      accepted: ['The school is across from the park.'],
      hint: 'opposite — на протилежному боці (вулиці, площі), обличчям одне до одного.',
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — рух і напрямок',
  items: [
    {
      q: 'Кіт забіг у кімнату.',
      a: 'The cat ran into the room.',
      hint: 'Рух усередину обʼєму: into the room, into the box — не in, яке про статичне місце.',
    },
    {
      q: 'Вона вийшла з офісу о шостій.',
      a: 'She went out of the office at six.',
      accepted: ['She left the office at six.'],
      hint: 'Рух назовні з обʼєму — протилежність до into: out of the office, out of the box.',
    },
    {
      q: 'Ми проїхали крізь тунель.',
      a: 'We drove through the tunnel.',
      hint: 'Через простір наскрізь, з одного кінця в інший: through the tunnel, through the forest.',
    },
    {
      q: 'Вони перейшли через дорогу.',
      a: 'They walked across the road.',
      hint: 'Через поверхню від одного краю до іншого: across the road, across the river.',
    },
    {
      q: 'Кіт заліз на дерево.',
      a: 'The cat climbed up the tree.',
      hint: 'Вертикаль угору: up the tree, up the stairs.',
    },
    {
      q: 'Мʼяч покотився зі сходів.',
      a: 'The ball rolled down the stairs.',
      hint: 'Вертикаль униз: down the stairs, down the hill.',
    },
    {
      q: 'Ми пройшлися навколо озера.',
      a: 'We walked around the lake.',
      accepted: ['We walked round the lake.'],
      hint: 'Контур, замкнене коло: around the lake, around the corner.',
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — залежні прийменники: дієслово, прикметник, іменник',
  items: [
    {
      q: 'Це залежить від погоди.',
      a: 'It depends on the weather.',
      hint: (
        <>
          <i>depend</i> завжди носить <b>on</b>, ніколи <i>from</i> — калька з українського «від».
        </>
      ),
    },
    {
      q: 'Я люблю слухати музику ввечері.',
      a: 'I like listening to music in the evening.',
      accepted: ['I like to listen to music in the evening.'],
      hint: (
        <>
          <i>listen</i> саме по собі неперехідне: обʼєкт приходить тільки через <b>to</b>.
        </>
      ),
    },
    {
      q: 'Ми чекаємо на автобус.',
      a: 'We are waiting for the bus.',
      hint: (
        <>
          <i>wait</i> потребує <b>for</b> перед обʼєктом — українське «чекати щось» без прийменника
          тут не працює.
        </>
      ),
    },
    {
      q: 'Він цікавиться історією.',
      a: 'He is interested in history.',
      hint: 'interested завжди з in, навіть якщо хочеться сказати for за аналогією з responsible for.',
    },
    {
      q: 'Вона боїться павуків.',
      a: 'She is afraid of spiders.',
      hint: 'afraid тягне за собою of, а не from — незважаючи на близькість до hide from.',
    },
    {
      q: 'Я добре граю в шахи.',
      a: 'I am good at chess.',
      hint: 'good at — стандартна пара для навичок і вмінь.',
    },
    {
      q: 'У нас немає причини для занепокоєння.',
      a: 'We have no reason for concern.',
      accepted: ['There is no reason for concern.'],
      hint: 'reason for — один із найчастотніших іменник+прийменник у B1-словнику.',
    },
  ],
};

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — заповніть пропуск',
  lede: 'Вставте правильний прийменник. Усі чотири кластери разом.',
  items: [
    {
      q: "The train leaves ___ 9 o'clock.",
      a: "The train leaves at 9 o'clock.",
      hint: 'Точна мітка на годиннику — at.',
    },
    {
      q: 'She was born ___ 1998.',
      a: 'She was born in 1998.',
      hint: 'Рік — великий проміжок часу — in.',
    },
    {
      q: "We'll meet ___ Friday evening.",
      a: "We'll meet on Friday evening.",
      hint: 'Конкретний день + частина доби разом — on.',
    },
    {
      q: 'The cat is hiding ___ the sofa.',
      a: 'The cat is hiding under the sofa.',
      hint: 'Нижче поверхні — under.',
    },
    {
      q: 'He walked ___ the room without knocking.',
      a: 'He walked into the room without knocking.',
      hint: 'Рух усередину обʼєму — into.',
    },
    {
      q: 'This word is very different ___ its Ukrainian translation.',
      a: 'This word is very different from its Ukrainian translation.',
      accepted: ['This word is very different to its Ukrainian translation.'],
      hint: 'different from — стандарт; different to трапляється в розмовній британській.',
    },
    {
      q: "I'm really good ___ solving puzzles.",
      a: "I'm really good at solving puzzles.",
      hint: 'good at — навичка чи вміння.',
    },
    {
      q: 'They live ___ a small town near Lviv.',
      a: 'They live in a small town near Lviv.',
      hint: 'Місто/містечко як обʼєм, у якому живуть — in.',
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — виправте помилку',
  lede: 'У кожному реченні рівно одна помилка з прийменником — типова калька з української. Знайдіть і виправте.',
  items: [
    {
      q: "I'll call you in Monday.",
      a: "I'll call you on Monday.",
      hint: (
        <>
          Перенесення схеми «in + великий проміжок» (<i>in the morning, in 2024</i>) на конкретний
          день — тут потрібен <b>on</b>.
        </>
      ),
    },
    {
      q: 'We usually have breakfast at the morning.',
      a: 'We usually have breakfast in the morning.',
      hint: (
        <>
          <i>at night</i> і <i>at the weekend</i> — винятки, які хибно поширюють на ранок/день/
          вечір. Там завжди <b>in</b>.
        </>
      ),
    },
    {
      q: 'After work I always go to home.',
      a: 'After work I always go home.',
      hint: (
        <>
          <i>home</i> тут поводиться як прислівник напрямку — прийменник узагалі не потрібен:
          <i> go home</i>, не <i>go to home</i>.
        </>
      ),
    },
    {
      q: 'Please knock before you enter in the room.',
      a: 'Please knock before you enter the room.',
      hint: (
        <>
          <i>enter</i> уже означає «увійти в» — <i>in</i> після нього дублює зміст. Калька з
          українського «увійти в кімнату».
        </>
      ),
    },
    {
      q: 'Can you explain me this rule?',
      a: 'Can you explain this rule to me?',
      hint: (
        <>
          <i>explain</i> не бере особу без прийменника: потрібен <b>to</b> перед адресатом.
          Українська дативна форма («поясни мені») тут не діє.
        </>
      ),
    },
    {
      q: "I'll wait you at the station.",
      a: "I'll wait for you at the station.",
      hint: (
        <>
          <i>wait</i> неперехідне: обʼєкт зʼявляється лише через <b>for</b>, як у <i>wait for
          the bus</i>.
        </>
      ),
    },
    {
      q: 'I usually go to work by foot.',
      a: 'I usually go to work on foot.',
      hint: (
        <>
          Усі інші способи пересування — <i>by bus, by car, by train</i> — але піший хід завжди{' '}
          <b>on foot</b>, без винятку.
        </>
      ),
    },
    {
      q: 'We arrived to the airport two hours early.',
      a: 'We arrived at the airport two hours early.',
      accepted: ['We arrived at the airport 2 hours early.'],
      hint: (
        <>
          Українське «приїхати <b>до</b>» тягне за собою <i>to</i>, але <i>arrive</i> ніколи не
          бере <i>to</i>: <b>arrive at</b> для точки (аеропорт, станція, готель) і{' '}
          <b>arrive in</b> для великого простору (місто, країна).
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — змішаний огляд',
  lede: 'Тут перемішані всі десять розділів теорії, включно з прийменниками транспорту з розділу 10.',
  items: [
    {
      q: 'We arrived ___ the airport two hours early.',
      a: 'We arrived at the airport two hours early.',
      hint: (
        <>
          <i>arrive at</i> для будівлі чи точки на маршруті; <i>arrive in</i> — для міста чи
          країни.
        </>
      ),
    },
    {
      q: "She's been working here ___ three years.",
      a: "She's been working here for three years.",
      hint: 'for + тривалість, скільки саме часу пройшло.',
    },
    {
      q: "I haven't seen him ___ Christmas.",
      a: "I haven't seen him since Christmas.",
      hint: 'since + точка старту, з якої відлічується проміжок.',
    },
    {
      q: 'Please finish the report ___ Friday.',
      a: 'Please finish the report by Friday.',
      hint: 'by — дедлайн: закінчити не пізніше за пʼятницю, можна й раніше.',
    },
    {
      q: 'The shop is closed ___ Sundays.',
      a: 'The shop is closed on Sundays.',
      hint: 'Конкретний день тижня, навіть у множині (кожної неділі) — on.',
    },
    {
      q: 'He jumped ___ the pool.',
      a: 'He jumped into the pool.',
      hint: 'Рух усередину обʼєму води — into.',
    },
    {
      q: 'This dish is famous ___ its spicy sauce.',
      a: 'This dish is famous for its spicy sauce.',
      hint: 'famous for — ще одна пара прикметник+прийменник поза основним списком розділу 8.',
    },
    {
      q: 'She fell asleep ___ the bus on her way home.',
      a: 'She fell asleep on the bus on her way home.',
      hint: (
        <>
          Автобус, потяг, літак — транспорт, у якому можна ходити: із артиклем завжди{' '}
          <b>on the bus</b>, ніколи <i>in the bus</i>, як підказує українське «в автобусі».
          Без артикля, про спосіб узагалі — <i>by bus</i>.
        </>
      ),
    },
  ],
};

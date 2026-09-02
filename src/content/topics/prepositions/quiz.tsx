import type { QuizQuestion } from '@/types/content';

/**
 * Тест на 20 питань, приблизно по два на кожен із десяти теоретичних
 * розділів (1–10): ідея-зум, час at/in/on, місце at/in/on, просторові
 * відносини, рух, тривалість часу, дієслово+прийменник, прикметник+
 * прийменник, іменник+прийменник, порівняльна таблиця й транспорт.
 */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'Яка ідея пояснює at / in / on одразу і в часі, і в місці?',
    options: ['Правило трьох слів напамʼять', 'Точка → поверхня → обʼєм', 'Статика проти руху'],
    answer: 1,
    why: (
      <>
        Зум від точки через поверхню до обʼєму — це не мнемоніка, а один принцип: <i>at</i> —
        конкретна мітка, <i>on</i> — плоска поверхня, <i>in</i> — закритий простір. Він працює і
        для годинника, і для кімнати.
      </>
    ),
  },
  {
    q: 'Яке слово підходить для закритого обʼєму — «in a box» чи «in June»?',
    hint: 'Обидва приклади про один і той самий вид простору.',
    options: ['at', 'on', 'in'],
    answer: 2,
    why: (
      <>
        Коробка й місяць — обидва «обʼєм»: коробка — фізичний простір із межами з усіх боків,
        червень — часовий проміжок, що вміщує в собі багато днів. Тому в обох — <b>in</b>.
      </>
    ),
  },
  {
    q: "I'll see you ___ Friday.",
    hint: 'Побачимось у пʼятницю.',
    options: ['at', 'on', 'in'],
    answer: 1,
    why: (
      <>
        Конкретний день тижня — це «одна клітинка з семи», плоска поверхня в часі: <b>on</b>{' '}
        Friday, <i>on</i> Monday, <i>on</i> my birthday.
      </>
    ),
  },
  {
    q: 'The shop opens ___ 9 a.m.',
    hint: 'Крамниця відчиняється о 9 ранку.',
    options: ['at', 'on', 'in'],
    answer: 0,
    why: (
      <>
        Точна мітка на циферблаті — завжди <b>at</b>: <i>at 9 a.m., at noon, at midnight</i>. Тут
        немає винятків.
      </>
    ),
  },
  {
    q: "She's waiting ___ the bus stop.",
    hint: 'Вона чекає на зупинці.',
    options: ['at', 'in', 'on'],
    answer: 0,
    why: (
      <>
        Зупинка — точка на карті, а не поверхня чи обʼєм: <b>at the bus stop</b>, як <i>at the
        door</i> чи <i>at work</i>.
      </>
    ),
  },
  {
    q: "Look ___ the photo — that's grandma!",
    hint: 'Подивись на фото — це ж бабуся!',
    options: ['on', 'at', 'in'],
    answer: 2,
    why: (
      <>
        Найвідоміша пастка розділу: українське «на фото/картинці» тягне за собою <i>on</i>, але
        англійська бачить малюнок як обʼєм зі своїм внутрішнім світом — тому <b>in the photo</b>.
      </>
    ),
  },
  {
    q: 'The keys are ___ the two books on the shelf.',
    hint: 'Ключі лежать між двома книжками.',
    options: ['between', 'among', 'next to'],
    answer: 0,
    why: (
      <>
        Рівно два орієнтири → <b>between</b>. Якщо орієнтирів три й більше — там уже{' '}
        <i>among</i> (наприклад, <i>among the books</i> про цілу купу).
      </>
    ),
  },
  {
    q: 'The bank is ___ the pharmacy, on the other side of the street.',
    hint: 'Банк на протилежному боці вулиці від аптеки.',
    options: ['opposite', 'behind', 'between'],
    answer: 0,
    why: (
      <>
        Обʼєкти обличчям один до одного через вулицю чи площу — це <b>opposite</b>, окрема пара
        поруч із under/over і in front of/behind.
      </>
    ),
  },
  {
    q: 'The ball rolled ___ the hill and into the lake.',
    hint: 'Мʼяч покотився зі схилу вниз, в озеро.',
    options: ['down', 'through', 'across'],
    answer: 0,
    why: (
      <>
        Рух по вертикалі вниз — <b>down</b>. Пара до нього — <i>up</i> (climb up the hill), а{' '}
        <i>through</i> і <i>across</i> про горизонтальний прохід наскрізь чи через поверхню.
      </>
    ),
  },
  {
    q: 'We drove ___ the tunnel to get to the coast.',
    hint: 'Ми проїхали крізь тунель, щоб дістатись узбережжя.',
    options: ['through', 'across', 'around'],
    answer: 0,
    why: (
      <>
        Наскрізь, з одного кінця простору в інший — <b>through</b> the tunnel. <i>Across</i> було
        б про поверхню (across the road), <i>around</i> — про контур.
      </>
    ),
  },
  {
    q: "I've lived here ___ 2015.",
    hint: 'Я живу тут із 2015 року.',
    options: ['since', 'for', 'during'],
    answer: 0,
    why: (
      <>
        <b>Since</b> позначає точку старту на стрілці часу, від якої й досі триває дія. <i>For</i>{' '}
        назвала б саму довжину (<i>for nine years</i>), а не дату початку.
      </>
    ),
  },
  {
    q: 'Please send the report ___ Friday — after that it will be too late.',
    hint: 'Надішли звіт не пізніше пʼятниці.',
    options: ['by', 'until', 'since'],
    answer: 0,
    why: (
      <>
        <b>By</b> — дедлайн для одноразової дії: завершити не пізніше за межу, можна й раніше.{' '}
        <i>Until</i> означало б «продовжувати без перерви аж до пʼятниці», що тут не той сенс.
      </>
    ),
  },
  {
    q: 'It depends ___ the weather.',
    hint: 'Це залежить від погоди.',
    options: ['from', 'on', 'of'],
    answer: 1,
    why: (
      <>
        <i>depend</i> носить фіксований прийменник <b>on</b> — калька з українського «залежати
        від» дає помилкове <i>from</i>, якого тут немає.
      </>
    ),
  },
  {
    q: 'Can you wait ___ me for five minutes?',
    hint: 'Можеш почекати на мене пʼять хвилин?',
    options: ['me', 'for me', 'to me'],
    answer: 1,
    why: (
      <>
        <i>wait</i> неперехідне: обʼєкт зʼявляється лише через <b>for</b>. Українське «чекати
        мене» (знахідний відмінок без прийменника) тут не працює.
      </>
    ),
  },
  {
    q: 'He is interested ___ history.',
    hint: 'Він цікавиться історією.',
    options: ['for', 'in', 'of'],
    answer: 1,
    why: (
      <>
        <i>interested</i> завжди з <b>in</b>. Часта помилка — переносити <i>for</i> з <i>
        responsible for</i> чи <i>waiting for</i>, але тут інше слово й інший бейдж.
      </>
    ),
  },
  {
    q: "I'm afraid ___ spiders.",
    hint: 'Я боюся павуків.',
    options: ['from', 'of', 'with'],
    answer: 1,
    why: (
      <>
        <b>afraid of</b> — фіксована пара. <i>From</i> сюди потрапляє через близькість до{' '}
        <i>hide from</i>, але це вже інше дієслово з іншим прийменником.
      </>
    ),
  },
  {
    q: 'There is no reason ___ concern.',
    hint: 'Немає причини для занепокоєння.',
    options: ['for', 'of', 'from'],
    answer: 0,
    why: (
      <>
        <b>reason for</b> — одна з найчастотніших пар іменник+прийменник у B1-словнику, поруч з{' '}
        <i>interest in</i> і <i>need for</i>.
      </>
    ),
  },
  {
    q: 'She has a genuine interest ___ art.',
    hint: 'У неї щирий інтерес до мистецтва.',
    options: ['for', 'of', 'in'],
    answer: 2,
    why: (
      <>
        <b>interest in</b> — іменникова пара, паралельна до прикметникової <i>interested in</i>.
        Той самий бейдж, інша частина мови.
      </>
    ),
  },
  {
    q: 'She fell asleep ___ the train on the way home.',
    hint: 'Вона заснула в потязі по дорозі додому.',
    options: ['in', 'on', 'by'],
    answer: 1,
    why: (
      <>
        Потяг, автобус, літак — транспорт, у якому можна ходити: із артиклем завжди <b>on the
        train</b>, ніколи <i>in the train</i>, хоч українське «в потязі» підказує інше. Для
        машини й таксі, навпаки, лишається <i>in</i>: <i>in a car/taxi</i>.
      </>
    ),
  },
  {
    q: 'He always goes to work ___ foot.',
    hint: 'Він завжди ходить на роботу пішки.',
    options: ['by', 'on', 'in'],
    answer: 1,
    why: (
      <>
        Усі інші способи пересування йдуть із <b>by</b> (<i>by bus, by car, by train</i>), але
        піший хід — єдиний виняток: <b>on foot</b>, без варіантів.
      </>
    ),
  },
];

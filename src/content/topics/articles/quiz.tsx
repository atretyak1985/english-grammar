import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на вибір між a/the/нулем у контексті, а не на форму. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'Sorry, I can’t talk — I have ___ meeting in five minutes.',
    hint: 'Вибачте, не можу говорити — у мене за пʼять хвилин зустріч.',
    options: ['a', 'the', '— (нічого)'],
    answer: 0,
    why: (
      <>
        Зустріч зʼявляється в розмові вперше, вона одна і її можна порахувати → <b>a</b>. Голий
        іменник (<i>I have meeting</i>) в однині неможливий — це помилка №1 українців.
      </>
    ),
  },
  {
    q: '___ meeting you scheduled for Friday has been cancelled.',
    hint: 'Зустріч, яку ви призначили на пʼятницю, скасовано.',
    options: ['A', 'The', '— (нічого)'],
    answer: 1,
    why: (
      <>
        Уточнення <i>you scheduled for Friday</i> робить зустріч єдиною і відомою обом →{' '}
        <b>the</b>.
      </>
    ),
  },
  {
    q: 'She gave me ___ about the migration.',
    hint: 'Вона дала мені пораду щодо міграції.',
    options: ['an advice', 'some advice', 'the advices'],
    answer: 1,
    why: (
      <>
        <i>advice</i> — незлічуване: ані <i>an advice</i>, ані множини <i>advices</i> не існує.
        Природно: <b>some advice</b> або <i>a piece of advice</i>.
      </>
    ),
  },
  {
    q: 'It took me ___ hour to find ___ typo.',
    hint: 'Я витратив годину, щоб знайти одну одруківку.',
    options: ['a … the', 'an … a', 'an … the'],
    answer: 1,
    why: (
      <>
        <i>hour</i> починається з голосного <b>звуку</b> /aʊ/ → <b>an</b>. Одруківка для
        співрозмовника нова → <b>a</b>.
      </>
    ),
  },
  {
    q: 'He studied at ___ university in Kharkiv.',
    hint: 'Він навчався в університеті в Харкові.',
    options: ['an', 'a', 'the'],
    answer: 1,
    why: (
      <>
        <i>university</i> починається зі звуку /j/ («ю») — а це приголосний звук → <b>a</b>.
        Правило про a/an дивиться на звук, не на букву.
      </>
    ),
  },
  {
    q: '___ sun was setting when we finally deployed.',
    hint: 'Сонце вже сідало, коли ми нарешті задеплоїли.',
    options: ['A', 'The', '— (нічого)'],
    answer: 1,
    why: (
      <>
        Сонце одне на всіх — співрозмовнику не треба пояснювати, яке саме → <b>the</b>. Так само{' '}
        <i>the sky, the moon, the world, the internet</i>.
      </>
    ),
  },
  {
    q: 'I love ___ coffee, but ___ coffee in our office is undrinkable.',
    hint: 'Я люблю каву, але кава в нашому офісі непитна.',
    options: ['the … the', '— … the', 'a … the'],
    answer: 1,
    why: (
      <>
        Перша <i>coffee</i> — категорія загалом → нульовий артикль. Друга — конкретна, з
        нашого офісу → <b>the</b>.
      </>
    ),
  },
  {
    q: '___ developers hate ___ meetings that could have been an email.',
    hint: 'Розробники ненавидять зустрічі, які могли б бути листом.',
    options: ['The … the', '— … —', '— … the'],
    answer: 1,
    why: (
      <>
        Обидва — категорії загалом: усі розробники, будь-які такі зустрічі → обидва без
        артикля. <i>The developers</i> означало б конкретну команду.
      </>
    ),
  },
  {
    q: 'This is ___ best estimate we can give without a spec.',
    hint: 'Це найкраща оцінка, яку ми можемо дати без специфікації.',
    options: ['a', 'the', '— (нічого)'],
    answer: 1,
    why: (
      <>
        Найвищий ступінь — завжди <b>the</b>: найкраща оцінка одна за визначенням. <i>the
        best, the fastest, the first, the only, the same</i>.
      </>
    ),
  },
  {
    q: 'The tickets are booked — we’re flying to ___ next month.',
    hint: 'Квитки куплені — наступного місяця летимо до Нідерландів.',
    options: ['Netherlands', 'the Netherlands', 'a Netherlands'],
    answer: 1,
    why: (
      <>
        Країни зазвичай без артикля (<i>Ukraine, Poland</i>), але назви-множини і «складені»
        назви беруть the: <b>the Netherlands</b>, <i>the USA, the UK, the Czech Republic</i>.
      </>
    ),
  },
  {
    q: 'I’m ___ now, I’ll call you when I get home.',
    hint: 'Я зараз на роботі, подзвоню, коли дійду додому.',
    options: ['at work', 'at the work', 'at a work'],
    answer: 0,
    why: (
      <>
        <i>at work</i> — сталий вираз: робота як діяльність, а не місце → без артикля. Так
        само <i>go home, in bed, at school, by car</i>.
      </>
    ),
  },
  {
    q: 'Wait, there’s ___ problem. — Yes, and I think I see ___ problem: the cache.',
    hint: 'Стривай, є проблема. — Так, і здається, я бачу, в чому проблема: кеш.',
    options: ['a … the', 'the … a', 'a … a'],
    answer: 0,
    why: (
      <>
        <i>There is a…</i> вводить нове → <b>a</b>. Друга репліка вказує на ту саму, вже
        названу проблему → <b>the</b>. Це головний механізм артиклів: перша згадка — a, далі —
        the.
      </>
    ),
  },
  {
    q: 'She’s ___ — she fixes people’s teeth, not servers.',
    hint: 'Вона стоматологиня — лікує людям зуби, а не сервери.',
    options: ['dentist', 'a dentist', 'the dentist'],
    answer: 1,
    why: (
      <>
        Професія в однині завжди з артиклем: ви один із людей цієї професії → <b>a dentist</b>.
        ✗ <i>She is dentist</i> — так артиклі пропускають найчастіше.
      </>
    ),
  },
  {
    q: 'The demo is tomorrow, so ___ time is exactly what we don’t have.',
    hint: 'Демо завтра, тож часу в нас якраз і немає.',
    options: ['a', 'the', '— (нічого)'],
    answer: 2,
    why: (
      <>
        <i>time</i> у значенні «час узагалі» — незлічуване → нульовий артикль. А от{' '}
        <i>Do you have the time?</i> — це вже «котра година?».
      </>
    ),
  },
  {
    q: 'We hiked in ___ Carpathians and swam in ___ Lake Synevyr.',
    hint: 'Ми ходили в Карпати й купалися в озері Синевир.',
    options: ['the … the', 'the … —', '— … the'],
    answer: 1,
    why: (
      <>
        Гірські хребти — з the: <b>the Carpathians, the Alps</b>. Озера й окремі вершини — без:{' '}
        <b>Lake Synevyr</b>, <i>Mount Hoverla</i>.
      </>
    ),
  },
  {
    q: 'Could you send ___ invoice again? ___ accountant says she never got it.',
    hint: 'Можете надіслати рахунок ще раз? Бухгалтерка каже, що не отримувала.',
    options: ['an … An', 'the … The', 'the … A'],
    answer: 1,
    why: (
      <>
        Рахунок той самий, уже відомий обом → <b>the</b>. Бухгалтерка в компанії одна,
        співрозмовник розуміє, про кого мова → <b>the</b>. Спільне знання — головне мірило.
      </>
    ),
  },
  {
    q: '___ is expensive in this city: rent, food, everything.',
    hint: 'Життя в цьому місті дороге: оренда, їжа, все.',
    options: ['The life', 'Life', 'A life'],
    answer: 1,
    why: (
      <>
        Абстракції загалом ідуть без артикля: <b>Life</b> is expensive. <i>The life</i>{' '}
        зʼявляється лише з уточненням: <i>the life of a sailor</i>.
      </>
    ),
  },
  {
    q: 'My son is ___ — he won’t be home until four.',
    hint: 'Син у школі — до четвертої його вдома не буде.',
    options: ['at school', 'at the school', 'in a school'],
    answer: 0,
    why: (
      <>
        Він там як учень — школа означає діяльність → <b>at school</b> без артикля. <i>At the
        school</i> сказав би батько, який стоїть біля будівлі: там це місце, а не навчання.
      </>
    ),
  },
  {
    q: 'It’s ___ same error as yesterday — check ___ logs from the last deploy.',
    hint: 'Це та сама помилка, що вчора — перевір логи останнього деплою.',
    options: ['a … —', 'the … the', 'the … —'],
    answer: 1,
    why: (
      <>
        <i>same</i> — завжди <b>the same</b>, без винятків. Логи конкретного деплою — обом
        зрозуміло, які → <b>the</b>.
      </>
    ),
  },
  {
    q: 'I bought ___ new phone, but ___ battery died on day one.',
    hint: 'Я купив новий телефон, але батарея сіла першого ж дня.',
    options: ['a … the', 'a … a', 'the … the'],
    answer: 0,
    why: (
      <>
        Телефон новий у розмові → <b>a</b>. Батарея — частина щойно згаданого телефона:
        частини відомого цілого одразу беруть <b>the</b>, без окремого знайомства.
      </>
    ),
  },
];

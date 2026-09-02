import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Половина — на вибір модального в контексті, а не на форму. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'He ___ swim really well — he trained for ten years.',
    hint: 'Він справді добре плаває — тренувався десять років.',
    options: ['can', 'cans', 'can to'],
    answer: 0,
    why: (
      <>
        Модальні не змінюються (жодного -s) і не беруть to: <b>he can swim</b>. Дві інші
        відповіді — дві найчастіші кальки українців.
      </>
    ),
  },
  {
    q: '___ you help me with this ticket?',
    hint: 'Можеш допомогти мені з цим тікетом?',
    options: ['Do you can', 'Can', 'May'],
    answer: 1,
    why: (
      <>
        Питання з модальним — інверсією, без do: <b>Can you help…?</b> May you не вживається у
        проханнях про послугу — may питає лише про дозвіл собі.
      </>
    ),
  },
  {
    q: 'You ___ come to the office on Fridays — remote is fine.',
    hint: 'У пʼятницю приходити в офіс не обовʼязково — можна віддалено.',
    options: ['mustn’t', 'don’t have to', 'can’t'],
    answer: 1,
    why: (
      <>
        «Не обовʼязково» → <b>don’t have to</b>. mustn’t означало б «заборонено зʼявлятися» —
        головна пастка теми: заперечення must забороняє дію, а не знімає обовʼязок.
      </>
    ),
  },
  {
    q: 'You ___ share this document outside the company.',
    hint: 'Цей документ не можна поширювати за межами компанії.',
    options: ['don’t have to', 'mustn’t', 'might not'],
    answer: 1,
    why: (
      <>
        А тут якраз заборона → <b>mustn’t</b>. don’t have to сказало б «можеш і не поширювати —
        як хочеш», що звучало б дивно для конфіденційного документа.
      </>
    ),
  },
  {
    q: 'The lights are off — they ___ have gone home.',
    hint: 'Світло вимкнене — вони, мабуть, пішли додому.',
    options: ['must', 'should', 'can'],
    answer: 0,
    why: (
      <>
        Впевнений здогад про минуле з доказом → <b>must have + V3</b>. should have gone означало
        б «слід було піти», а can у стверджувальних здогадах не вживається.
      </>
    ),
  },
  {
    q: 'It ___ be Anna at the door — she’s in London this week.',
    hint: 'Це не може бути Анна — вона цього тижня в Лондоні.',
    options: ['mustn’t', 'can’t', 'shouldn’t'],
    answer: 1,
    why: (
      <>
        «Точно ні» на шкалі впевненості → <b>can’t be</b>. Протилежність must be — саме can’t
        be, а не mustn’t be: mustn’t живе тільки на поверсі заборон.
      </>
    ),
  },
  {
    q: 'I ___ finish the report yesterday, so I stayed late.',
    hint: 'Учора мені треба було закінчити звіт, тому я затримався.',
    options: ['must', 'had to', 'should'],
    answer: 1,
    why: (
      <>
        Минулого часу в must немає — вчорашній обовʼязок завжди <b>had to</b>. Це протез:
        звичайне дієслово have to у Past Simple.
      </>
    ),
  },
  {
    q: 'Don’t worry, I ___ tell anyone about it.',
    hint: 'Не хвилюйся, я нікому про це не скажу.',
    options: ['won’t', 'can’t', 'mustn’t'],
    answer: 0,
    why: (
      <>
        Обіцянка — це воля: <b>won’t</b> = «не стану, відмовляюся». can’t сказало б «фізично не
        можу», mustn’t — «мені заборонено».
      </>
    ),
  },
  {
    q: '___ I open the window? It’s a bit stuffy.',
    hint: 'Можна я відчиню вікно? Трохи душно.',
    options: ['Must', 'Can', 'Would'],
    answer: 1,
    why: (
      <>
        Дозвіл собі → <b>Can I…?</b> (або ввічливіше Could I / формальніше May I). Would I тут
        не працює: would просить співрозмовника, а не дозволу собі.
      </>
    ),
  },
  {
    q: 'She ___ read when she was four.',
    hint: 'Вона вміла читати вже в чотири роки.',
    options: ['could', 'was able', 'can'],
    answer: 0,
    why: (
      <>
        Загальне вміння в минулому періоді → <b>could</b>. was able — обірваний протез (мусило б
        бути was able to read), can — теперішнє.
      </>
    ),
  },
  {
    q: 'The server was overloaded, but we ___ restore it in an hour.',
    hint: 'Сервер був перевантажений, але ми змогли відновити його за годину.',
    options: ['could', 'were able to', 'can'],
    answer: 1,
    why: (
      <>
        Один конкретний успіх → <b>were able to</b> (або managed to). could — лише про вміння
        взагалі: у стверджувальній історії успіху воно не працює.
      </>
    ),
  },
  {
    q: 'You ___ back up the database before you touch the config.',
    hint: 'Варто зробити бекап бази, перш ніж чіпати конфіг.',
    options: ['should', 'may', 'would'],
    answer: 0,
    why: (
      <>
        Порада → <b>should</b>: розумно зробити, але вирішуєш ти. may дає дозвіл, would тут
        узагалі без ролі.
      </>
    ),
  },
  {
    q: 'He ___ be in a meeting — his status has been «busy» for an hour.',
    hint: 'Він, мабуть, на зустрічі — статус «зайнятий» уже годину.',
    options: ['must', 'has to', 'would'],
    answer: 0,
    why: (
      <>
        Здогад із доказом → <b>must be</b>, поверх ймовірності. has to be сказало б «він
        зобовʼязаний бути на зустрічі» — інший поверх і інший сенс.
      </>
    ),
  },
  {
    q: 'I’m not sure yet — I ___ join you later tonight.',
    hint: 'Ще не знаю — можливо, приєднаюся до вас увечері.',
    options: ['will', 'might', 'must'],
    answer: 1,
    why: (
      <>
        Чесна невизначеність → <b>might</b>: «можливо». will пообіцяло б твердо, must — узагалі
        про обовʼязок. І зверніть увагу: не Maybe I will join — модальне елегантніше.
      </>
    ),
  },
  {
    q: 'Sorry, I ___ come tomorrow — I have a doctor’s appointment.',
    hint: 'Вибач, завтра я не зможу прийти — маю запис до лікаря.',
    options: ['won’t can', 'won’t be able to', 'can’t to'],
    answer: 1,
    why: (
      <>
        Майбутнє від can — протез <b>will/won’t be able to</b>: два модальні поспіль (won’t can)
        неможливі.
      </>
    ),
  },
  {
    q: 'We ___ tested the migration on staging. Now the database is a mess.',
    hint: 'Треба було протестувати міграцію на стейджингу. Тепер у базі безлад.',
    options: ['should have', 'should of', 'must have'],
    answer: 0,
    why: (
      <>
        Слід було, а не зробили → <b>should have + V3</b>. should of — помилка на слух від
        should’ve (її роблять і носії — не переймайте). must have tested означало б «мабуть,
        протестували» — здогад, який суперечить другій половині речення.
      </>
    ),
  },
  {
    q: '___ you mind turning the music down a bit?',
    hint: 'Ви не проти зробити музику трохи тихішою?',
    options: ['Would', 'Could', 'Should'],
    answer: 0,
    why: (
      <>
        Формула найввічливішого прохання — <b>Would you mind + -ing</b>. Could you mind не
        існує; сама конструкція mind вимагає would.
      </>
    ),
  },
  {
    q: 'The printer ___ print again. I’ve restarted it twice.',
    hint: 'Принтер знову не друкує. Я вже двічі його перезапускав.',
    options: ['won’t', 'shouldn’t', 'may not'],
    answer: 0,
    why: (
      <>
        Річ «відмовляється» працювати → <b>won’t</b>. Так носії говорять про вперту техніку:
        won’t start, won’t open, won’t load.
      </>
    ),
  },
  {
    q: 'Visitors ___ wear a badge at all times while on the premises.',
    hint: 'Відвідувачі повинні весь час носити бейдж на території.',
    options: ['must', 'would', 'could'],
    answer: 0,
    why: (
      <>
        Писане правило → <b>must</b>: регламенти, інструкції, таблички. Це другий законний дім
        must поруч із «я сам так вирішив».
      </>
    ),
  },
  {
    q: 'He ___ have forgotten the meeting — I reminded him an hour ago.',
    hint: 'Він не міг забути про зустріч — я нагадав йому годину тому.',
    options: ['mustn’t', 'can’t', 'shouldn’t'],
    answer: 1,
    why: (
      <>
        «Не може бути, щоб» про минуле → <b>can’t have + V3</b>. mustn’t не має здогадного
        значення, а shouldn’t have forgotten означало б докір «дарма забув».
      </>
    ),
  },
];

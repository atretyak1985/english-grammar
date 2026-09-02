import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Модальні дієслова».
   Розділ 11 — переклад з української (25 речень, чотири блоки).
   Розділ 14 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — можу, вмію, прошу: can / could / be able to',
  items: [
    {
      q: 'Вона вміє читати код швидше, ніж я пишу.',
      a: 'She can read code faster than I write it.',
      hint: (
        <>
          Навичка → <i>can</i> + гола основа. Без -s і без to: ✗ <i>she cans</i>, ✗{' '}
          <i>can to read</i>.
        </>
      ),
    },
    {
      q: 'Чи не могли б ви надіслати рахунок ще раз?',
      a: 'Could you send the invoice again?',
      accepted: ['Could you resend the invoice?', 'Could you please send the invoice again?'],
      hint: (
        <>
          Ввічливе прохання про послугу → <i>Could you…?</i> Питання інверсією, без do: ✗{' '}
          <i>Do you could…</i>
        </>
      ),
    },
    {
      q: 'Можна мені піти сьогодні раніше?',
      a: 'Can I leave early today?',
      accepted: ['Could I leave early today?', 'May I leave early today?'],
      hint: (
        <>
          Дозвіл собі: серед своїх — <i>Can I</i>, мʼякше — <i>Could I</i>, формально —{' '}
          <i>May I</i>.
        </>
      ),
    },
    {
      q: 'Учора я не зміг додзвонитися в підтримку.',
      a: "I couldn't reach support yesterday.",
      accepted: ["I wasn't able to reach support yesterday.", "I couldn't get through to support yesterday."],
      hint: (
        <>
          У запереченні could працює і для одного разу: <i>couldn’t</i> = «не зміг». Це в
          стверджувальному «зміг один раз» потрібне was able to.
        </>
      ),
    },
    {
      q: 'Затори були жахливі, але ми змогли встигнути на рейс.',
      a: 'The traffic was terrible, but we were able to catch the flight.',
      accepted: ['The traffic was terrible, but we managed to catch the flight.'],
      hint: (
        <>
          Один конкретний успіх → <i>were able to / managed to</i>, не ✗ <i>could catch</i>:
          could — лише про загальне вміння.
        </>
      ),
    },
    {
      q: 'Наступного тижня я зможу відповідати швидше.',
      a: 'I will be able to reply faster next week.',
      accepted: ["I'll be able to reply faster next week.", 'Next week I will be able to reply faster.'],
      hint: (
        <>
          Майбутнього ✗ <i>will can</i> не існує — тільки протез <i>will be able to</i>.
        </>
      ),
    },
    {
      q: 'Ви не проти, якщо я відчиню вікно?',
      a: 'Would you mind if I opened the window?',
      accepted: ['Would you mind if I open the window?', 'Do you mind if I open the window?'],
      hint: (
        <>
          Верх драбини ввічливості. Відповідь-згода — <i>Not at all</i>: питання буквально «чи
          заперечуєте».
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — мушу, треба, не можна: must / have to',
  items: [
    {
      q: 'Мені треба здати звіт до пʼятниці.',
      a: 'I have to submit the report by Friday.',
      accepted: ['I need to submit the report by Friday.', 'I must submit the report by Friday.'],
      hint: (
        <>
          Зовнішній дедлайн → найприродніше <i>have to / need to</i>. must теж можливе — якщо
          тиснете на себе самі.
        </>
      ),
    },
    {
      q: 'Учора нам довелося затриматись до десятої.',
      a: 'We had to stay until ten yesterday.',
      accepted: ['Yesterday we had to stay until 10.'],
      hint: (
        <>
          Минулого в must немає взагалі: будь-яке вчорашнє «мусили» — <i>had to</i>.
        </>
      ),
    },
    {
      q: 'Приходити в офіс щодня не обовʼязково.',
      a: "You don't have to come to the office every day.",
      accepted: ["You don't need to come to the office every day.", "We don't have to come to the office every day."],
      hint: (
        <>
          «Не обовʼязково» → <i>don’t have to</i>. Написати <i>mustn’t</i> — заборонити
          зʼявлятися: головна пастка теми.
        </>
      ),
    },
    {
      q: 'Цей файл не можна нікому пересилати.',
      a: "You mustn't forward this file to anyone.",
      accepted: ["You can't forward this file to anyone.", 'This file must not be forwarded to anyone.'],
      hint: (
        <>
          А ось тут якраз заборона → <i>mustn’t / can’t</i>. Порівняйте з попереднім реченням —
          українське «не» одне, англійських сенси два.
        </>
      ),
    },
    {
      q: 'Відвідувачі повинні залишати бейдж на рецепції.',
      a: 'Visitors must leave their badges at reception.',
      accepted: ['Visitors have to leave their badges at reception.'],
      hint: (
        <>
          Писане правило → законна територія <i>must</i>. Гола основа: ✗ <i>must to leave</i>.
        </>
      ),
    },
    {
      q: 'Вам доведеться створити новий пароль.',
      a: 'You will have to create a new password.',
      accepted: ["You'll have to create a new password.", 'You will need to create a new password.'],
      hint: (
        <>
          Майбутнього ✗ <i>will must</i> не існує — <i>will have to</i>.
        </>
      ),
    },
    {
      q: 'Тобі справді треба було це купувати?',
      a: 'Did you really have to buy it?',
      accepted: ['Did you really need to buy it?', 'Did you really have to buy that?'],
      hint: (
        <>
          have to — звичайне дієслово: питання через <i>did</i>, а не інверсією. ✗{' '}
          <i>Had you to buy…</i>
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — варто і мабуть: should / might / must be',
  items: [
    {
      q: 'Тобі варто виспатися перед співбесідою.',
      a: 'You should get some sleep before the interview.',
      accepted: ['You should sleep well before the interview.'],
      hint: (
        <>
          Порада → <i>should</i>. Без to: ✗ <i>should to get</i>.
        </>
      ),
    },
    {
      q: 'Він, мабуть, ще на дзвінку — у календарі зустріч до третьої.',
      a: 'He must still be on the call — his calendar shows a meeting till three.',
      accepted: ['He must be still on the call.', 'He must still be on a call.'],
      hint: (
        <>
          Впевнений здогад із доказом → <i>must be</i>. Це поверх ймовірності: ніхто нікого не
          змушує.
        </>
      ),
    },
    {
      q: 'Можливо, я приєднаюся пізніше.',
      a: 'I might join later.',
      accepted: ['I may join later.', 'I might join you later.'],
      hint: (
        <>
          «Можливо» пакується в модальне: <i>might</i>. <i>Maybe I will join</i> — граматично
          так, але щоразу maybe — акцент перекладу.
        </>
      ),
    },
    {
      q: 'Це не може бути правдою.',
      a: "It can't be true.",
      accepted: ['That can’t be true.', "This can't be true."],
      hint: (
        <>
          «Точно ні» → <i>can’t be</i>. Протилежність must be — не mustn’t be!
        </>
      ),
    },
    {
      q: 'Реліз, за ідеєю, має пройти спокійно.',
      a: 'The release should go smoothly.',
      accepted: ['The release should be smooth.'],
      hint: (
        <>
          Обґрунтоване очікування → <i>should</i> на поверсі ймовірності: «якщо все як завжди».
        </>
      ),
    },
    {
      q: 'Краще б нам не чіпати цей конфіг перед демо.',
      a: "We'd better not touch this config before the demo.",
      accepted: ['We had better not touch this config before the demo.'],
      hint: (
        <>
          Порада з наслідками → <i>had better</i>; заперечення — <i>’d better not</i> + гола
          основа.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — минуле, якого не було: modal + have + V3',
  items: [
    {
      q: 'Треба було зробити бекап перед міграцією.',
      a: 'We should have made a backup before the migration.',
      accepted: ['We should have backed up before the migration.', 'I should have made a backup before the migration.'],
      hint: (
        <>
          Слід було, а не зробили → <i>should have + V3</i>. У мові скорочується до{' '}
          <i>should’ve</i> — але на письмі ніколи ✗ <i>should of</i>.
        </>
      ),
    },
    {
      q: 'Вона, мабуть, не отримала мого листа.',
      a: "She must not have received my email.",
      accepted: ["She probably didn't get my email.", "She must have missed my email."],
      hint: (
        <>
          Впевнений здогад про минуле → <i>must (not) have + V3</i>.
        </>
      ),
    },
    {
      q: 'Ми могли втратити всі дані — пощастило.',
      a: 'We could have lost all the data — we got lucky.',
      accepted: ['We could have lost all our data.'],
      hint: (
        <>
          Могло статися, але не сталося → <i>could have + V3</i>.
        </>
      ),
    },
    {
      q: 'Він не міг забути про зустріч — я бачив її в його календарі.',
      a: "He can't have forgotten about the meeting — I saw it in his calendar.",
      accepted: ["He couldn't have forgotten about the meeting."],
      hint: (
        <>
          «Не може бути, щоб» → <i>can’t have + V3</i>: минуле, у яке ви не вірите.
        </>
      ),
    },
    {
      q: 'Принтер знову не друкує.',
      a: "The printer won't print again.",
      accepted: ["The printer won't print.", 'The printer refuses to print again.'],
      hint: (
        <>
          Річ «відмовляється» працювати → <i>won’t</i>. Так носії скаржаться на всю вперту
          техніку: won’t start, won’t open, won’t load.
        </>
      ),
    },
  ],
};

/* ---------- Розділ 14 — вправи ---------- */

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — виберіть модальне',
  lede: 'Читайте вголос повне речення з відповіддю: модальні ставляться на слух швидше, ніж за правилами.',
  items: [
    {
      q: 'You ___ (can / must) be exhausted — you’ve been driving since morning.',
      a: 'must',
      hint: 'Здогад із доказом: «ти, мабуть, виснажений». Поверх ймовірності, верх шкали впевненості.',
    },
    {
      q: 'I ___ (mustn’t / don’t have to) get up early tomorrow — it’s a day off.',
      a: 'don’t have to',
      hint: '«Не обовʼязково вставати», а не «заборонено вставати». Головна пара теми.',
    },
    {
      q: '___ (Could / Must) you pass me the salt, please?',
      a: 'Could',
      hint: 'Прохання про послугу → Could you. Must you сказало б «і що, обовʼязково тобі…» — роздратування.',
    },
    {
      q: 'She ___ (can’t / might not) be in Kyiv — I saw her in the office five minutes ago.',
      a: 'can’t',
      hint: 'Доказ залізний → «точно ні»: can’t be. might not лишило б сумнів, якого тут немає.',
    },
    {
      q: 'We ___ (should / had to) cancel the trip last month because of the storm.',
      a: 'had to',
      hint: 'Минулий вимушений обовʼязок → had to. should + гола основа про минуле не говорить.',
    },
    {
      q: 'Employees ___ (must / would) wear a helmet in the warehouse at all times.',
      a: 'must',
      hint: 'Писане правило безпеки → must. Класика регламентів.',
    },
    {
      q: 'The build ___ (should / can) be ready in ten minutes — it usually takes five.',
      a: 'should',
      hint: '«За ідеєю, має бути» — обґрунтоване очікування: should на поверсі ймовірності.',
    },
    {
      q: 'He said he ___ (might / may to) join us later.',
      a: 'might',
      hint: 'might — і «можливо», і природна форма після минулого he said. may to не існує: модальні без to.',
    },
    {
      q: 'I promise I ___ (won’t / can’t) tell anyone.',
      a: 'won’t',
      hint: 'Обіцянка — воля: won’t = «не стану, відмовляюся». can’t було б «фізично не можу».',
    },
    {
      q: 'You ___ (’d better / should to) apologize before she finds out herself.',
      a: '’d better',
      hint: 'Порада з наслідками поруч → had better + гола основа. should to не існує.',
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  lede: 'У кожному реченні рівно одна помилка з модальним — так, як їх насправді роблять у листах і чатах.',
  items: [
    {
      q: 'He cans speak three languages.',
      a: 'He can speak three languages.',
      hint: 'Модальні не змінюються ніколи: жодного -s у третій особі.',
    },
    {
      q: 'I must to finish this before the demo.',
      a: 'I must finish this before the demo.',
      hint: 'Після модального — гола основа. to тягнеться з українського «мушу закінчиТИ».',
    },
    {
      q: 'Do you can help me with the deploy?',
      a: 'Can you help me with the deploy?',
      hint: 'Питання з модальним — інверсією, без do. do потрібне тільки протезам: Do you have to…?',
    },
    {
      q: 'You mustn’t pay now — the invoice is due next month.',
      a: 'You don’t have to pay now — the invoice is due next month.',
      hint: 'Малося на увазі «можеш не платити», а сказано «не смій платити». mustn’t — завжди заборона.',
    },
    {
      q: 'Sorry, I willn’t be able to come tomorrow.',
      a: 'Sorry, I won’t be able to come tomorrow.',
      hint: 'will + not скорочується нерегулярно: won’t. willn’t не існує.',
    },
    {
      q: 'The traffic was bad, but I could catch the last train.',
      a: 'The traffic was bad, but I was able to catch the last train.',
      accepted: ['…I managed to catch the last train.'],
      hint: 'Один конкретний успіх → was able to / managed to. could — лише загальне вміння в минулому.',
    },
    {
      q: 'You should of seen his face!',
      a: 'You should have seen his face!',
      hint: 'should’ve звучить як should of — але пишеться завжди should have. Помилка, яку роблять і носії.',
    },
    {
      q: 'Will you can review my PR tomorrow?',
      a: 'Will you be able to review my PR tomorrow?',
      hint: 'Два модальні поспіль неможливі: майбутнє від can — will be able to.',
    },
    {
      q: 'He said he can come, but he didn’t.',
      a: 'He said he could come, but he didn’t.',
      hint: 'Після he said минулого часу can зсувається в could — узгодження часів.',
    },
    {
      q: 'You’d better to check the attachment before sending.',
      a: 'You’d better check the attachment before sending.',
      hint: 'had better + гола основа, без to — хоч had і виглядає як звичайне дієслово.',
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — поясніть різницю',
  lede: 'Обидва речення в кожній парі граматично правильні. Ваше завдання — сказати, коли яке доречне. Це і є справжнє володіння модальними.',
  items: [
    {
      q: 'You must call him. / You should call him.',
      a: 'must — наполягаю, це необхідно; should — раджу, але вирішуєш ти.',
      hint: 'Дві сходинки шкали тиску. must від колеги рівного статусу може прозвучати як наказ.',
    },
    {
      q: 'You mustn’t reply. / You don’t have to reply.',
      a: 'mustn’t — відповідати не можна (заборона); don’t have to — можеш не відповідати (свобода).',
      hint: 'Найдорожча пара теми: українське «не мусиш» — це саме don’t have to.',
    },
    {
      q: 'He can’t be at work. / He might not be at work.',
      a: 'can’t — точно не на роботі (докази проти); might not — можливо, не на роботі (просто сумнів).',
      hint: 'Два різні степені впевненості на поверсі ймовірності.',
    },
    {
      q: 'Can I use your laptop? / May I use your laptop?',
      a: 'can — нейтрально, серед своїх; may — формально, до малознайомих чи офіційно.',
      hint: 'Обидва про дозвіл. Різниця — регістр, а не граматика.',
    },
    {
      q: 'He won’t help. / He can’t help.',
      a: 'won’t — відмовляється (не хоче); can’t — не в змозі (не може).',
      hint: 'Воля проти здатності. Про людей — важлива різниця, образитись можна саме через won’t.',
    },
    {
      q: 'We could have won. / We should have won.',
      a: 'could have — була можливість виграти (а не вийшло); should have — мали виграти по справедливості/за розкладом, і не виграли — докір.',
      hint: 'Обидва про нездійснене минуле, але could — про шанс, should — про правильність.',
    },
    {
      q: 'The car won’t start. / The car doesn’t start.',
      a: 'won’t start — «відмовляється» саме зараз, упирається; doesn’t start — констатація загального факту.',
      hint: 'won’t олюднює річ — саме так носій скаржиться на техніку в момент боротьби з нею.',
    },
    {
      q: 'You must be joking. / You are joking.',
      a: 'must be — висновок: «та ти, мабуть, жартуєш!»; are — просто твердження факту.',
      hint: 'must be — жива ідіома недовіри: You must be kidding!',
    },
  ],
};

import type { QuizQuestion } from '@/types/content';

/**
 * Тест на 20 питань. Кістяк — правило займенника і чотири типи: це єдині факти
 * теми, у яких правильна відповідь рівно одна й не залежить від смаку. Решта —
 * вибір частки за контекстом, полісемія й регістр.
 */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'The music is too loud — can you ___, please?',
    hint: 'Музика заголосна — вимкни її, будь ласка.',
    options: ['turn it off', 'turn off it', 'turn off them'],
    answer: 0,
    why: (
      <>
        <i>turn off</i> — розділюване, а займенниковий додаток у такого дієслова стоїть{' '}
        <b>тільки посередині</b>. ✗ <i>turn off it</i> — помилка, яку чути найчастіше: в
        українській «вимкни його» і «його вимкни» однаково можливі, тому позиція не
        сприймається як обовʼязкова.
      </>
    ),
  },
  {
    q: 'Our two cats are fine — the neighbour ___ while we’re away.',
    hint: 'З нашими двома котами все гаразд — поки нас немає, за ними доглядає сусідка.',
    options: ['looks them after', 'looks after to them', 'looks after them'],
    answer: 2,
    why: (
      <>
        <i>look after</i> — прийменникове, нерозділюване. Наголос падає на дієслово (
        <i><b>LOOK</b> after</i>), і це головна ознака: <b>середини просто немає</b>, тому
        займенник іде після обох слів. Правило «займенник — усередину» вимикається разом із
        серединою.
      </>
    ),
  },
  {
    q: 'I can’t ___ these flaky tests any longer.',
    hint: 'Я більше не можу терпіти ці нестабільні тести.',
    options: ['put up', 'put up with', 'put with'],
    answer: 1,
    why: (
      <>
        Три слова — і всі три обовʼязкові: <b>put up with</b>. Друга частка здається
        надлишковою, тому її «економлять» частіше, ніж будь-яку іншу. Додаток завжди після
        всіх трьох: <i>put up with them</i>.
      </>
    ),
  },
  {
    q: 'I’m looking forward to ___ you next week.',
    hint: 'З нетерпінням чекаю зустрічі з вами наступного тижня.',
    options: ['see', 'have seen', 'seeing'],
    answer: 2,
    why: (
      <>
        Кінцеве <i>to</i> тут — <b>прийменник</b>, а не частка інфінітива, тому далі йде{' '}
        <i>-ing</i>. Перевірка на місці: після нього можна поставити іменник —{' '}
        <i>look forward to the meeting</i> ✓. Перед часткою інфінітива іменник неможливий.
      </>
    ),
  },
  {
    q: 'Half the team was sick, so we ___ the workshop.',
    hint: 'Половина команди захворіла, тож ми скасували воркшоп.',
    options: ['put off', 'turned off', 'called off'],
    answer: 2,
    why: (
      <>
        <b>call off</b> = скасувати зовсім, <i>put off</i> = лише перенести на пізніше, а{' '}
        <i>turn off</i> — про прилад. Один напрямок <i>off</i> (відірвати від графіка), три
        різні дієслова.
      </>
    ),
  },
  {
    q: '___ the computer and log in with your work account.',
    hint: 'Увімкни компʼютер і зайди під робочим акаунтом.',
    options: ['Turn on', 'Include', 'Open'],
    answer: 0,
    why: (
      <>
        Прилади вмикають <b>turn on</b> або <i>switch on</i>. ✗ <i>Include the computer</i> —
        корінь «включ-» тягне за собою <i>include</i>, і виходить речення, якого носій не
        зрозуміє взагалі: український префікс і англійська частка збігаються непередбачувано.
      </>
    ),
  },
  {
    q: 'Please ___ that the client asked for on the call.',
    hint: 'Будь ласка, запишіть кожну зміну, яку клієнт попросив на дзвінку.',
    options: ['write every change down', 'write down them', 'write down every change'],
    answer: 2,
    why: (
      <>
        Правило важкого додатка: що довший додаток — а тут за ним ще й підрядне речення, — то
        певніше він іде <b>після частки</b>. Перший варіант граматичний, але <i>down</i>
        відривається від <i>write</i> на пів речення. Другий неможливий: займенник після
        частки не стоїть ніколи.
      </>
    ),
  },
  {
    q: 'The design doc ___ three options for the migration.',
    hint: 'Проєктний документ викладає три варіанти міграції.',
    options: ['sets out', 'sets off', 'sets up'],
    answer: 0,
    why: (
      <>
        Той самий корінь, три різні дієслова: <b>set out</b> = викласти в документі,{' '}
        <i>set up</i> = налаштувати, <i>set off</i> = вирушити або спричинити. В українській
        значення сидить у корені, в англійській — у частці; тому запамʼятовувати треба саме
        частку.
      </>
    ),
  },
  {
    q: 'Women ___ 40 % of the engineering team.',
    hint: 'Жінки становлять 40 % інженерної команди.',
    options: ['make up for', 'make up', 'make out'],
    answer: 1,
    why: (
      <>
        <b>make up</b> = становити, складати. І найцікавіше: у цьому значенні воно{' '}
        <b>не розділюється</b> (✗ <i>make it up</i>), а в значенні «вигадати» — розділюється (
        <i>he made it up</i>). Те саме написання, різні типи. <i>make up for</i> — надолужити.
      </>
    ),
  },
  {
    q: 'Nobody ___ a better name for the service.',
    hint: 'Ніхто не придумав кращої назви для сервісу.',
    options: ['came up', 'came up with', 'came with'],
    answer: 1,
    why: (
      <>
        <b>come up with</b> — тричастинне, і без <i>with</i> речення не просто змінює значення,
        а розсипається: ✗ <i>nobody came up a better name</i> — так не кажуть узагалі. Саме{' '}
        <i>come up</i> існує, але воно неперехідне й означає «виникнути, трапитися» (
        <i>something came up</i>); «підійти до когось» — це <i>come up to</i>.
      </>
    ),
  },
  {
    q: 'How long the import takes ___ the number of retries.',
    hint: 'Скільки триває імпорт, залежить від кількості повторних спроб.',
    options: ['depends from', 'depends of', 'depends on'],
    answer: 2,
    why: (
      <>
        Українське «залежати <b>від</b>» перекладається в лоб і дає ✗ <i>depends from</i> — одна
        з найвпізнаваніших кальок. Англійська закріпила свій прийменник довільно, і вгадати
        його не можна: <b>depend on</b>, <i>wait for</i>, <i>listen to</i>, <i>marry</i> без
        прийменника взагалі.
      </>
    ),
  },
  {
    q: 'We ___ DNS after the third test came back clean.',
    hint: 'Після третього чистого тесту ми виключили DNS.',
    options: ['ruled off', 'ruled out', 'ruled away'],
    answer: 1,
    why: (
      <>
        <b>rule out</b> = виключити з розгляду. Тут <i>out</i> — не «зробити видимим», а
        «прибрати геть за межі»: версія викреслена зі списку, а не показана. Порівняйте з{' '}
        <i>find out</i> чи <i>point out</i>, де <i>out</i> справді про виявлення — одна частка,
        два різні образи. <i>Rule off</i> і <i>rule away</i> не існують.
      </>
    ),
  },
  {
    q: '___ the database before you run the migration.',
    hint: 'Зроби резервну копію бази, перш ніж запускати міграцію.',
    options: ['Back up', 'Back off', 'Back down'],
    answer: 0,
    why: (
      <>
        <b>back up</b> = зробити резервну копію. Тут <i>back</i> — саме дієслово, а <i>up</i> —
        частка, тому те саме слово в <i>back off</i> (відчепитися) і <i>back down</i>{' '}
        (відступити в суперечці) дає зовсім інші значення.
      </>
    ),
  },
  {
    q: 'My train gets in at seven — can you ___ from the station?',
    hint: 'Мій потяг прибуває о сьомій — заберете мене з вокзалу?',
    options: ['pick up me', 'pick me', 'pick me up'],
    answer: 2,
    why: (
      <>
        <i>pick up</i> розділюване, тому <b>me</b> стоїть посередині: ✗ <i>pick up me</i>. А без{' '}
        <i>up</i> це вже інше дієслово — <i>pick me</i> означало б «вибери мене».
      </>
    ),
  },
  {
    q: 'No idea right now — I’ll ___ you on that after the standup.',
    hint: 'Зараз не скажу — повернуся до тебе з цим після стендапу.',
    options: ['revert to', 'get back to', 'return back to'],
    answer: 1,
    why: (
      <>
        <b>get back to someone</b> = відповісти пізніше. <i>Revert to you</i> для носія означає
        «повернутися до попереднього стану» — це найвпізнаваніший маркер не-носійської ділової
        англійської. <i>Return back</i> — плеоназм: <i>return</i> уже містить «назад».
      </>
    ),
  },
  {
    q: 'The partnership ___ two weeks before signing.',
    hint: 'Партнерство зірвалося за два тижні до підписання.',
    options: ['fell through', 'went through', 'got through'],
    answer: 0,
    why: (
      <>
        Найкращий контрприклад теми: <i>through</i> зазвичай «пройшов наскрізь до самого
        кінця» (<i>go through</i>, <i>get through</i>, <i>see it through</i>), а{' '}
        <b>fall through</b> означає рівно протилежне — зірвалося. Система часток пояснює
        більшість дієслів, але не всі.
      </>
    ),
  },
  {
    q: 'Roll ___ to 2.4 — the release is broken.',
    hint: 'Відкоти до 2.4 — реліз зламаний.',
    options: ['back it', 'it back', 'back to it'],
    answer: 1,
    why: (
      <>
        <i>roll back</i> розділюване, тому займенник тільки всередину: <b>roll it back</b>. З
        іменником вибір ще є (<i>roll back the release</i> · <i>roll the release back</i>) — із
        займенником він зникає.
      </>
    ),
  },
  {
    q: 'She ___ everyone on the design team.',
    hint: 'Вона ладнає з усіма в команді дизайну.',
    options: ['gets on', 'gets with on', 'gets on with'],
    answer: 2,
    why: (
      <>
        <b>get on with someone</b> = ладнати (британське; американський відповідник —{' '}
        <i>get along with</i>). Без <i>with</i> це вже <i>get on</i> — «сісти в транспорт».
        Третя частка тут не прикраса, а те, що робить дієслово іншим.
      </>
    ),
  },
  {
    q: 'We ___ a rate limit on the third retry.',
    hint: 'На третій спробі ми наштовхнулися на обмеження частоти запитів.',
    options: ['ran into', 'ran over', 'ran out'],
    answer: 0,
    why: (
      <>
        <b>run into</b> = наштовхнутися — і на проблему, і на людину: <i>I ran into Olha at the
        airport</i>. <i>Run over</i> — переглянути цифри або переїхати, <i>run out</i> —
        вичерпатися, і воно вимагає <i>of</i> перед додатком.
      </>
    ),
  },
  {
    q: 'Dan is on leave, so I’m ___ him until Monday.',
    hint: 'Ден у відпустці, тож до понеділка я його підміняю.',
    options: ['filling in', 'filling in for', 'filling up'],
    answer: 1,
    why: (
      <>
        <b>fill in for someone</b> = підміняти. Без <i>for</i> це <i>fill someone in</i> —
        «ввести в курс справи», і воно розділюване: <i>fill him in</i>. Одне слово <i>for</i>{' '}
        перевертає і значення, і тип дієслова.
      </>
    ),
  },
];

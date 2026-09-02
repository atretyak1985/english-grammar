import type { QuizQuestion } from '@/types/content';

/**
 * Тест на 20 питань. Кістяк — механіка зсуву (часи, модальні, обставини) і
 * три місця, де українська веде рукою в інший бік: say проти tell, порядок
 * слів у непрямому питанні й «щоб» замість інфінітива. Два питання перевіряють
 * зворотне вміння — НЕ зсувати там, де зсув недоречний.
 */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'He said he ___ tired after the flight.',
    hint: 'Він сказав, що втомився після перельоту.',
    options: ['is', 'was', 'has been'],
    answer: 1,
    why: (
      <>
        У репліці стояло <i>I am tired</i> — Present Simple, отже в переказі Past Simple:{' '}
        <b>was</b>. Українська рука тягне <i>is</i>, бо українською «втомився» лишається таким, яким
        його сказали.
      </>
    ),
  },
  {
    q: 'She ___ me that the meeting had been cancelled.',
    hint: 'Вона сказала мені, що нараду скасували.',
    options: ['said', 'told', 'spoke'],
    answer: 1,
    why: (
      <>
        Адресат названий одразу після дієслова — отже <b>told</b>. <i>Say</i> вимагав би{' '}
        <i>said to me</i>, а <i>speak</i> узагалі не вводить підрядного речення. Джерело помилки —
        українське «сказала мені», одне дієслово на обидва випадки.
      </>
    ),
  },
  {
    q: 'He asked me where ___.',
    hint: 'Він спитав мене, де я живу.',
    options: ['do I live', 'I lived', 'did I live'],
    answer: 1,
    why: (
      <>
        Переказане питання будується як розповідне речення: підмет, потім дієслово, жодного{' '}
        <i>do</i> і жодного знака питання. Плюс звичайний зсув часу: <i>live</i> → <b>lived</b>.
      </>
    ),
  },
  {
    q: 'They said they ___ the report the day before.',
    hint: 'Вони сказали, що надіслали звіт напередодні.',
    options: ['sent', 'had sent', 'have sent'],
    answer: 1,
    why: (
      <>
        У репліці був Past Simple (<i>we sent it yesterday</i>), і він зсувається ще на сходинку — у
        Past Perfect. Це єдиний рядок таблиці, де змінюється не лише час, а й вид: Simple стає
        Perfect.
      </>
    ),
  },
  {
    q: 'The teacher said that light ___ faster than sound.',
    hint: 'Учитель сказав, що світло рухається швидше за звук.',
    options: ['travels', 'travelled', 'had travelled'],
    answer: 0,
    why: (
      <>
        Зсуву немає: закон фізики діє й зараз, тому теперішній час доречніший.{' '}
        <i>Travelled</i> граматично можливе й помилкою не вважається — але воно натякає, що відтоді
        щось змінилося.
      </>
    ),
  },
  {
    q: 'She said she ___ me the next day.',
    hint: 'Вона сказала, що подзвонить мені наступного дня.',
    options: ['will call', 'would call', 'has called'],
    answer: 1,
    why: (
      <>
        <i>Will</i> зсувається у <b>would</b>. Це не ввічливість і не умовний спосіб: те, що для неї
        було майбутнім, для вас на момент переказу вже могло минути.
      </>
    ),
  },
  {
    q: 'He told me ___ outside and wait.',
    hint: 'Він сказав мені вийти надвір і зачекати.',
    options: ['that I go', 'to go', 'go'],
    answer: 1,
    why: (
      <>
        Наказ переказують інфінітивом: <b>tell somebody to do</b>. Українське «сказав, щоб я вийшов»
        виглядає як підрядне речення — і саме воно підсовує ✗ <i>told me that I go</i>.
      </>
    ),
  },
  {
    q: 'She asked ___ I needed any help.',
    hint: 'Вона спитала, чи мені потрібна допомога.',
    options: ['that', 'if', 'what'],
    answer: 1,
    why: (
      <>
        Питання без питального слова вводиться через <b>if</b> або <b>whether</b> — це і є українське
        «чи». <i>That</i> вводить лише переказ розповіді, а не питання.
      </>
    ),
  },
  {
    q: 'He said he ___ leave early because of the traffic.',
    hint: 'Він сказав, що мусить виїхати раніше через затори.',
    options: ['must to', 'had to', 'musted'],
    answer: 1,
    why: (
      <>
        <i>Must</i> — єдиний модальний, у якого зсув змінює саме слово: <b>had to</b>. Форма{' '}
        <i>must</i> теж лишається, коли обовʼязок діє й досі, але у звіті про минулу розмову
        природніше <i>had to</i>.
      </>
    ),
  },
  {
    q: 'Which sentence is correct?',
    hint: 'Він запропонував зачекати до понеділка.',
    options: [
      'He suggested me to wait until Monday.',
      'He suggested waiting until Monday.',
      'He suggested me waiting until Monday.',
    ],
    answer: 1,
    why: (
      <>
        <i>Suggest</i> не бере ані адресата, ані інфінітива — тільки <b>-ing</b> або підрядне з{' '}
        <i>that</i>: <i>He suggested that we wait</i>. Українське «запропонував мені зачекати» будує
        саме заборонену модель, тому помилка тримається найдовше.
      </>
    ),
  },
  {
    q: 'Marta said, «I saw him here yesterday.» → Marta said she had seen him ___.',
    hint: 'Марта сказала, що бачила його там напередодні.',
    options: ['here yesterday', 'there the day before', 'there yesterday'],
    answer: 1,
    why: (
      <>
        Зсувається не лише дієслово: <i>here</i> → <b>there</b>, <i>yesterday</i> →{' '}
        <b>the day before</b>. Перерахувати час і забути про місце (або навпаки) — помітніша
        помилка, ніж незсунутий час.
      </>
    ),
  },
  {
    q: 'My sister says she ___ the flat next month.',
    hint: 'Сестра каже, що наступного місяця переїжджає з квартири.',
    options: ['was leaving', 'is leaving', 'had left'],
    answer: 1,
    why: (
      <>
        Дієслово переказу стоїть у теперішньому (<i>says</i>) — отже точка відліку не рухалася і
        зсувати нічого. Так само працюють <i>he tells me</i>, <i>they claim</i>,{' '}
        <i>the message says</i>.
      </>
    ),
  },
  {
    q: 'He ___ taking the money.',
    hint: 'Він визнав, що взяв гроші.',
    options: ['admitted', 'refused', 'promised'],
    answer: 0,
    why: (
      <>
        Модель <b>admit doing</b>. <i>Refuse</i> і <i>promise</i> беруть інфінітив (<i>refused to
        take</i>), тому з <i>-ing</i> вони не поєднуються — і змінили б зміст на протилежний.
      </>
    ),
  },
  {
    q: 'She asked me what time ___.',
    hint: 'Вона спитала, о котрій вирушає потяг.',
    options: ['does the train leave', 'the train left', 'did the train leave'],
    answer: 1,
    why: (
      <>
        Прямий порядок слів після питального звороту <i>what time</i>, плюс зсув:{' '}
        <i>leaves</i> → <b>left</b>. Допоміжне <i>do</i> в непрямому питанні не вживається взагалі.
      </>
    ),
  },
  {
    q: 'He said he ___ in Kyiv since 2019.',
    hint: 'Він сказав, що живе в Києві з 2019 року.',
    options: ['lives', 'has lived', 'had lived'],
    answer: 2,
    why: (
      <>
        У репліці був Present Perfect (<i>I have lived here since 2019</i>), і він зсувається у Past
        Perfect. Вид не змінився — фіолетовий лишився фіолетовим, змінився лише час.
      </>
    ),
  },
  {
    q: 'She ___ not to touch anything on the desk.',
    hint: 'Вона попередила мене нічого не чіпати на столі.',
    options: ['warned me', 'warned to me', 'warned that me'],
    answer: 0,
    why: (
      <>
        Модель <b>warn somebody (not) to do</b>: адресат стоїть одразу після дієслова, без
        прийменника, а <i>not</i> — перед <i>to</i>. Так само поводяться <i>tell</i>, <i>ask</i>,{' '}
        <i>advise</i>, <i>remind</i>.
      </>
    ),
  },
  {
    q: 'Which sentence is correct?',
    hint: 'Він пояснив мені правило.',
    options: [
      'He explained me the rule.',
      'He explained the rule to me.',
      'He explained to me the rule.',
    ],
    answer: 1,
    why: (
      <>
        <i>Explain</i> ставить адресата тільки через <i>to</i>, і той іде після додатка. Разом із{' '}
        <i>describe</i>, <i>suggest</i>, <i>announce</i>, <i>mention</i> це та сама родина, яка не
        пускає людину одразу після дієслова.
      </>
    ),
  },
  {
    q: 'They denied ___ the message.',
    hint: 'Вони заперечили, що бачили це повідомлення.',
    options: ['to see', 'seeing', 'not seeing'],
    answer: 1,
    why: (
      <>
        <i>Deny</i> бере <b>-ing</b> або підрядне з <i>that</i>. Заперечення вже сидить у самому
        дієслові, тому <i>not seeing</i> перевернуло б зміст: вийшло б, що вони заперечують саме те,
        що не бачили.
      </>
    ),
  },
  {
    q: 'He said he ___ what I was talking about.',
    hint: 'Він сказав, що не розуміє, про що я кажу.',
    options: ['doesn’t understand', 'didn’t understand', 'hadn’t understood'],
    answer: 1,
    why: (
      <>
        Заперечення зсувається так само, як і все інше: <i>don’t understand</i> →{' '}
        <b>didn’t understand</b>. Past Perfect тут зайвий — у репліці не було нічого, що сталося
        раніше за саму репліку.
      </>
    ),
  },
  {
    q: 'Тарас щойно поклав слухавку. Що ви скажете колезі поруч?',
    hint: 'Він каже, що затримається на пів години.',
    options: [
      'He said he would be half an hour late.',
      'He says he’ll be half an hour late.',
      'He had said he would be half an hour late.',
    ],
    answer: 1,
    why: (
      <>
        Питання не про граматику, а про дистанцію. Розмова щойно закінчилась, новина ще свіжа — і
        носій візьме теперішнє <i>he says</i> без жодного зсуву. Перший варіант теж правильний, але
        він звучить як переказ учорашньої розмови; третій не звучить ніяк.
      </>
    ),
  },
];

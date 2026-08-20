import type { DrillBlock } from '@/types/content';

/* ============================================================
   Вправи теми «Теперішні часи».
   Розділ 10 — переклад з української (25 речень, чотири блоки).
   Розділ 13 — вправи A, B, C.
   ============================================================ */

export const TRANSLATE_A: DrillBlock = {
  id: 'tr-a',
  title: 'Блок A — Present Simple',
  items: [
    {
      q: 'Я їжджу на роботу метро.',
      a: 'I take the metro to work.',
      accepted: ['I go to work by metro.', 'I commute by metro.'],
      hint: (
        <>
          Регулярна дія → Present Simple. Не <i>I am taking</i>: це не про цю хвилину.
        </>
      ),
    },
    {
      q: 'Вона не знає про зміну.',
      a: "She doesn't know about the change.",
      hint: (
        <>
          <i>-s</i> переходить на <i>does</i>, тому далі початкова форма: ✗{' '}
          <i>doesn&apos;t knows</i>.
        </>
      ),
    },
    {
      q: 'Скільки часу займає деплой?',
      a: 'How long does the deploy take?',
      hint: (
        <>
          Питання без <i>be</i> → <i>does</i> + підмет + V1. Порядок слів обовʼязковий.
        </>
      ),
    },
    {
      q: 'Наш сервіс обробляє близько мільйона запитів на день.',
      a: 'Our service handles about a million requests a day.',
      hint: (
        <>
          Постійна характеристика системи. Третя особа однини → <i>handle<b>s</b></i>.
        </>
      ),
    },
    {
      q: 'Він завжди забуває оновити тікет.',
      a: 'He always forgets to update the ticket.',
      accepted: ["He's always forgetting to update the ticket."],
      hint: (
        <>
          Нейтральний факт → Simple. Якщо хочете додати роздратування — Continuous:{' '}
          <i>He&apos;s always forgetting…</i>
        </>
      ),
    },
    {
      q: 'Потяг відходить о 6:40.',
      a: 'The train leaves at 6:40.',
      hint: 'Розклад — навіть про майбутнє — це Present Simple. Не «will leave».',
    },
    {
      q: 'Ти працюєш у пʼятницю?',
      a: 'Do you work on Friday?',
      accepted: ['Are you working on Friday?'],
      hint: (
        <>
          <i>Do you work…</i> — взагалі, за графіком. <i>Are you working…</i> — конкретно цієї
          пʼятниці. Обидва живі, різниця в масштабі.
        </>
      ),
    },
  ],
};

export const TRANSLATE_B: DrillBlock = {
  id: 'tr-b',
  title: 'Блок B — Present Continuous',
  items: [
    {
      q: 'Я саме дивлюсь твій пул-реквест.',
      a: "I'm looking at your pull request right now.",
      hint: 'Процес у цю хвилину → am/is/are + V-ing.',
    },
    {
      q: 'Цього місяця я підміняю тімліда.',
      a: "I'm covering for the team lead this month.",
      hint: (
        <>
          Тимчасово, з видимими краями періоду. Порівняйте: <i>I cover for him</i> = це моя постійна
          роль.
        </>
      ),
    },
    {
      q: 'Латентність зростає.',
      a: 'The latency is going up.',
      accepted: ['Latency is increasing.'],
      hint: 'Зміна в процесі → Continuous. Дуже частий випадок: get, grow, rise, improve, fall.',
    },
    {
      q: 'Що ти робиш? — Нічого, чекаю на збірку.',
      a: "What are you doing? — Nothing, I'm waiting for the build.",
      hint: (
        <>
          Не <i>What do you do?</i> — це питання про професію.
        </>
      ),
    },
    {
      q: 'Ми зустрічаємось із вендором у четвер. (уже домовлено)',
      a: "We're meeting the vendor on Thursday.",
      hint: 'Домовленість із датою → Continuous про майбутнє. Найприродніший варіант у мовленні.',
    },
    {
      q: 'Він постійно пушить у main без ревʼю. (з роздратуванням)',
      a: "He's always pushing to main without review.",
      hint: (
        <>
          Continuous + <i>always / constantly / forever</i> = емоція, а не нейтральний факт.
        </>
      ),
    },
  ],
};

export const TRANSLATE_C: DrillBlock = {
  id: 'tr-c',
  title: 'Блок C — Present Perfect',
  items: [
    {
      q: 'Я вже виправив цей баг.',
      a: "I've already fixed that bug.",
      hint: (
        <>
          <i>already</i> стоїть між <i>have</i> і V3. Часу не названо — важливий результат.
        </>
      ),
    },
    {
      q: 'Ти вже надіслав рахунок?',
      a: 'Have you sent the invoice yet?',
      accepted: ['Have you already sent the invoice?'],
      hint: (
        <>
          У питанні «вже» — це <i>yet</i> у кінці. <i>already</i> в питанні звучить як здивування:
          «невже вже?».
        </>
      ),
    },
    {
      q: 'Я працюю тут шість років.',
      a: "I've worked here for six years.",
      accepted: ["I've been working here for six years."],
      hint: (
        <>
          Найважливіше речення блоку: українською теперішній час, англійською — Perfect. ✗{' '}
          <i>I work here for six years</i>.
        </>
      ),
    },
    {
      q: 'Я ніколи не бачив такої латентності.',
      a: "I've never seen latency like that.",
      hint: (
        <>
          Досвід за все життя до цього моменту. <i>never</i> — між <i>have</i> і V3, другого
          заперечення не треба.
        </>
      ),
    },
    {
      q: 'Ми ще не завершили міграцію.',
      a: "We haven't finished the migration yet.",
      hint: (
        <>
          <i>yet</i> у кінці = «ще ні, але очікується». Саме воно робить речення природним.
        </>
      ),
    },
    {
      q: 'Вона щойно пішла.',
      a: "She's just left.",
      accepted: ['She just left.'],
      hint: (
        <>
          Британський варіант — <i>has just left</i>, американський частіше <i>just left</i>. Обидва
          зрозуміють.
        </>
      ),
    },
    {
      q: 'Цього тижня я провів три співбесіди.',
      a: "I've done three interviews this week.",
      hint: (
        <>
          <i>this week</i> ще не скінчився → період відкритий → Perfect. Порівняйте:{' '}
          <i>last week I did three</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_D: DrillBlock = {
  id: 'tr-d',
  title: 'Блок D — змішані, найскладніші',
  items: [
    {
      q: 'Я знаю його з університету.',
      a: "I've known him since university.",
      hint: (
        <>
          <i>know</i> — дієслово стану, тому Perfect, а не Perfect Continuous: ✗{' '}
          <i>I&apos;ve been knowing</i>.
        </>
      ),
    },
    {
      q: 'Я чекаю на відповідь від вендора вже два тижні.',
      a: "I've been waiting for the vendor's reply for two weeks.",
      hint: 'Наголос на тривалості процесу, який досі триває → have been + V-ing.',
    },
    {
      q: 'Учора я задеплоїв нову версію, і вона досі працює.',
      a: "I deployed the new version yesterday, and it's still running.",
      hint: (
        <>
          Пастка: <i>yesterday</i> закриває період → Past Simple. А «досі працює» — Continuous.
        </>
      ),
    },
    {
      q: 'Скільки ти вже пишеш цей звіт?',
      a: 'How long have you been writing that report?',
      hint: (
        <>
          <i>How long</i> + процес, що триває → Perfect Continuous. ✗{' '}
          <i>How long are you writing</i>.
        </>
      ),
    },
    {
      q: 'Його немає в офісі — цього тижня він працює з дому.',
      a: "He's not in the office — he's working from home this week.",
      hint: (
        <>
          Обидва <i>&apos;s</i> різні: перший — <i>is</i> (стан), другий — <i>is</i> у Continuous.
          Тимчасово цього тижня, тому не <i>works</i>.
        </>
      ),
    },
  ],
};

export const TRANSLATE_BLOCKS = [TRANSLATE_A, TRANSLATE_B, TRANSLATE_C, TRANSLATE_D];

export const EXERCISE_A: DrillBlock = {
  id: 'ex-a',
  title: 'Вправа A — розкрийте дужки',
  items: [
    {
      q: 'She (not / understand) ___ why the build (fail) ___ every time.',
      a: "doesn't understand … fails",
      hint: (
        <>
          <i>understand</i> — стан, тому Simple. <i>every time</i> → регулярність.
        </>
      ),
    },
    {
      q: 'I (work) ___ on this refactor since Monday.',
      a: "have been working / have worked",
      hint: (
        <>
          <i>since</i> + період, що триває → Perfect. Continuous додає наголос на процесі.
        </>
      ),
    },
    {
      q: 'Sorry, I (call) ___ you back — I (talk) ___ to the vendor right now.',
      a: "will call / am calling … am talking",
      hint: (
        <>
          <i>right now</i> → Continuous. У першій частині природні і <i>I&apos;ll call</i>, і{' '}
          <i>I&apos;m calling</i>.
        </>
      ),
    },
    {
      q: 'How many tickets ___ you ___ (close) this sprint?',
      a: 'have … closed',
      hint: (
        <>
          <i>this sprint</i> ще триває → період відкритий → Present Perfect.
        </>
      ),
    },
    {
      q: 'The train (leave) ___ at 6:40, so we (meet) ___ at the station at 6:15.',
      a: 'leaves … are meeting',
      hint: 'Розклад → Simple. Домовленість → Continuous. Обидва про майбутнє.',
    },
    {
      q: 'He (always / interrupt) ___ me during the standup!',
      a: 'is always interrupting',
      hint: 'Знак оклику підказує емоцію → Continuous з always.',
    },
    {
      q: 'We (not / release) ___ anything yet this quarter.',
      a: "haven't released",
      hint: (
        <>
          <i>yet</i> + відкритий період → Present Perfect.
        </>
      ),
    },
    {
      q: 'If the latency (go) ___ above the threshold, the alert (fire) ___.',
      a: 'goes … fires',
      hint: (
        <>
          Після <i>if</i> — теперішній час, ніякого <i>will</i>. Наслідок теж можна через{' '}
          <i>will fire</i>.
        </>
      ),
    },
    {
      q: 'This is the third time I ___ (ask) about the handover.',
      a: 'have asked',
      hint: (
        <>
          <i>It is the first / third time…</i> → Present Perfect. У минулому було б Past Perfect.
        </>
      ),
    },
    {
      q: 'I (deploy) ___ it last night and it (run) ___ fine since then.',
      a: 'deployed … has been running',
      hint: (
        <>
          <i>last night</i> — закритий період → Past Simple. <i>since then</i> — відкритий →
          Perfect.
        </>
      ),
    },
  ],
};

export const EXERCISE_B: DrillBlock = {
  id: 'ex-b',
  title: 'Вправа B — знайдіть і виправте помилку',
  items: [
    {
      q: 'He work here since 2019.',
      a: 'He has worked here since 2019.',
      hint: (
        <>
          Дві помилки: забуте <i>-s</i> і, головне, <i>since</i> вимагає Perfect.
        </>
      ),
    },
    {
      q: "I've fixed it yesterday.",
      a: 'I fixed it yesterday.',
      hint: (
        <>
          <i>yesterday</i> — закритий момент, з Present Perfect несумісний.
        </>
      ),
    },
    {
      q: 'She doesn’t knows about the outage.',
      a: "She doesn't know about the outage.",
      hint: (
        <>
          <i>-s</i> уже в <i>does</i>. Один раз на все речення.
        </>
      ),
    },
    {
      q: 'I am not understanding this diagram.',
      a: "I don't understand this diagram.",
      hint: (
        <>
          <i>understand</i> — дієслово стану, форми з <i>-ing</i> немає.
        </>
      ),
    },
    {
      q: 'What you do on weekends?',
      a: 'What do you do on weekends?',
      hint: (
        <>
          Без <i>be</i> питання будується через <i>do / does</i>. Інтонацією, як в українській, не
          можна.
        </>
      ),
    },
    {
      q: 'I am living in Kyiv all my life.',
      a: "I've lived in Kyiv all my life.",
      hint: (
        <>
          Період тягнеться від минулого до зараз → Perfect. Continuous зробив би це тимчасовим.
        </>
      ),
    },
    {
      q: 'How long are you waiting for the reply?',
      a: 'How long have you been waiting for the reply?',
      hint: (
        <>
          <i>How long</i> про те, що досі триває → Perfect Continuous.
        </>
      ),
    },
    {
      q: 'When have you joined the team?',
      a: 'When did you join the team?',
      hint: (
        <>
          <i>When</i> питає про конкретний момент → тільки Past Simple. Present Perfect із{' '}
          <i>when</i> неможливий.
        </>
      ),
    },
    {
      q: 'I will tell you when the migration will finish.',
      a: 'I will tell you when the migration finishes.',
      hint: (
        <>
          Після <i>when</i>, <i>after</i>, <i>as soon as</i>, <i>until</i> — теперішній час.
        </>
      ),
    },
    {
      q: 'He is having two direct reports.',
      a: 'He has two direct reports.',
      hint: (
        <>
          <i>have</i> у значенні «мати» — стан. З <i>-ing</i> лише в діях: <i>having lunch</i>,{' '}
          <i>having a call</i>.
        </>
      ),
    },
  ],
};

export const EXERCISE_C: DrillBlock = {
  id: 'ex-c',
  title: 'Вправа C — Present Perfect чи Past Simple',
  lede: 'Виберіть час і сформулюйте, яке саме слово в реченні його вирішило.',
  items: [
    {
      q: 'We ___ (ship) two releases this month.',
      a: "have shipped — «this month» ще триває",
    },
    {
      q: 'We ___ (ship) two releases last month.',
      a: 'shipped — «last month» закрився',
    },
    {
      q: 'I ___ (never / work) with that vendor.',
      a: "have never worked — досвід до цього моменту, часу не названо",
    },
    {
      q: 'I ___ (work) with that vendor in 2021.',
      a: 'worked — названий рік',
    },
    {
      q: '___ you ___ (see) the alert? It ___ (fire) ten minutes ago.',
      a: 'Have … seen … fired',
      hint: (
        <>
          Питання про результат зараз → Perfect. Далі <i>ago</i> → Past Simple.
        </>
      ),
    },
    {
      q: 'She ___ (leave) the company, so she ___ (not / be) on the call.',
      a: "has left … isn't",
      hint: 'Наслідок для теперішнього: пішла — тому її немає. Дату не називаємо.',
    },
    {
      q: 'How long ___ you ___ (be) in this role?',
      a: 'have … been',
      hint: (
        <>
          Роль триває досі. Якби вже не тривала: <i>How long were you in that role?</i>
        </>
      ),
    },
    {
      q: 'The service ___ (go) down twice today and once yesterday.',
      a: 'has gone down twice today and went down once yesterday',
      hint: 'Одне речення — два часи, бо два різні періоди: відкритий і закритий.',
    },
  ],
};

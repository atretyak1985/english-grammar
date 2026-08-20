import type { QuizQuestion } from '@/types/content';

/** Тест на 20 питань. Перенесено з window.QUIZ_QUESTIONS без змін по суті. */
export const QUIZ: readonly QuizQuestion[] = [
  {
    q: 'While I ___ the demo, the projector died.',
    hint: 'Поки я показував демо, проєктор згас.',
    options: ['gave', 'was giving', 'had given'],
    answer: 1,
    why: (
      <>
        Довга дія + коротке переривання. Після <b>while</b> — Past Continuous.
      </>
    ),
  },
  {
    q: 'By the time the investors arrived, we ___ the slides three times.',
    hint: 'Коли інвестори приїхали, ми вже тричі відрепетирували слайди.',
    options: ['rehearsed', 'were rehearsing', 'had rehearsed'],
    answer: 2,
    why: (
      <>
        <b>By the time</b> + дія, завершена раніше → Past Perfect.
      </>
    ),
  },
  {
    q: 'I ___ the invoice yesterday afternoon.',
    hint: 'Я надіслав рахунок учора вдень.',
    options: ['have sent', 'sent', 'was sending'],
    answer: 1,
    why: (
      <>
        Названий завершений час → Past Simple. З <i>yesterday</i> Present Perfect неможливий.
      </>
    ),
  },
  {
    q: 'Did you ___ my message about the release?',
    hint: 'Ти бачив моє повідомлення про реліз?',
    options: ['saw', 'see', 'seen'],
    answer: 1,
    why: (
      <>
        Після <b>did</b> — початкова форма. Минулий час позначено один раз.
      </>
    ),
  },
  {
    q: 'I ___ the answer, so I stayed quiet.',
    hint: 'Я не знав відповіді, тому промовчав.',
    options: ["wasn't knowing", "didn't know", "hadn't known"],
    answer: 1,
    why: (
      <>
        <b>know</b> — дієслово стану, форми з -ing немає.
      </>
    ),
  },
  {
    q: 'When she called, I ___ dinner — I couldn’t pick up.',
    hint: 'Коли вона подзвонила, я готував вечерю.',
    options: ['cooked', 'was cooking', 'had cooked'],
    answer: 1,
    why: 'Готування тривало й не було завершене в момент дзвінка.',
  },
  {
    q: 'He said he ___ the report the night before.',
    hint: 'Він сказав, що закінчив звіт напередодні.',
    options: ['finished', 'was finishing', 'had finished'],
    answer: 2,
    why: (
      <>
        Непряма мова: «I finished it last night» → <i>had finished</i>.
      </>
    ),
  },
  {
    q: 'We ___ in Kyiv for eight years before we moved to Lviv.',
    hint: 'Ми прожили в Києві вісім років, перш ніж переїхали.',
    options: ['lived', 'were living', 'had lived'],
    answer: 0,
    why: (
      <>
        Слово <b>before</b> уже показує порядок — носії беруть Past Simple. Простіший правильний
        варіант виграє.
      </>
    ),
  },
  {
    q: 'At 7 p.m. last night I ___ still ___ on the pull request.',
    hint: 'О 19:00 учора я ще працював над PR.',
    options: ['was … working', 'did … work', 'had … worked'],
    answer: 0,
    why: 'Конкретний час на годиннику + процес → Past Continuous.',
  },
  {
    q: 'The build broke because someone ___ the config file.',
    hint: 'Збірка впала, бо хтось змінив конфіг.',
    options: ['changed', 'was changing', 'had changed'],
    answer: 2,
    why: (
      <>
        Причина сталася <i>до</i> наслідку, і цей порядок — суть речення.
      </>
    ),
  },
  {
    q: 'I ___ never ___ to an investor before that meeting.',
    hint: 'До тієї зустрічі я ніколи не спілкувався з інвестором.',
    options: ['did … speak', 'had … spoken', 'was … speaking'],
    answer: 1,
    why: (
      <>
        <b>never … before</b> + точка відліку в минулому → Past Perfect.
      </>
    ),
  },
  {
    q: 'First I opened the logs, then I ___ the root cause and ___ a hotfix.',
    hint: 'Спершу я відкрив логи, потім знайшов причину і задеплоїв хотфікс.',
    options: ['had found … had pushed', 'found … pushed', 'was finding … was pushing'],
    answer: 1,
    why: 'Проста хронологічна послідовність → Past Simple усюди.',
  },
  {
    q: 'It happened ___ we were running the migration.',
    hint: 'Це сталося, поки ми запускали міграцію.',
    options: ['during', 'while', 'for'],
    answer: 1,
    why: (
      <>
        <b>while</b> + ціле речення. <i>during</i> вимагає іменника: <i>during the migration</i>.
      </>
    ),
  },
  {
    q: 'I ___ there for five years and then moved on.',
    hint: 'Я пропрацював там п’ять років, а потім пішов далі.',
    options: ['was working', 'worked', 'had worked'],
    answer: 1,
    why: 'Завершений період часу → Past Simple. Класична помилка — тягнути сюди Continuous через «працював».',
  },
  {
    q: 'She ___ me three times that morning — it was really annoying.',
    hint: 'Вона дзвонила мені тричі того ранку — це дуже дратувало.',
    options: ['was calling', 'called', 'had called'],
    answer: 0,
    why: (
      <>
        Continuous з відтінком роздратування. <i>called</i> теж граматично вірно, але емоцію передає
        саме Continuous.
      </>
    ),
  },
  {
    q: 'I ___ if you had five minutes to look at this.',
    hint: 'Я хотів запитати, чи є у вас пʼять хвилин глянути на це.',
    options: ['wondered', 'was wondering', 'had wondered'],
    answer: 1,
    why: (
      <>
        <b>I was wondering if…</b> — стандартна ввічлива формула. Запам&apos;ятайте цілим блоком.
      </>
    ),
  },
  {
    q: 'The floor was wet because someone ___ it.',
    hint: 'Підлога була мокра, бо хтось її помив.',
    options: ['washed', 'was washing', 'had washed'],
    answer: 2,
    why: 'Причина сталася раніше за побачений результат → Past Perfect.',
  },
  {
    q: '___ you ___ at the office when the alarm went off?',
    hint: 'Ти був в офісі, коли спрацювала сигналізація?',
    options: ['Did … be', 'Were … you', 'Had … been'],
    answer: 1,
    why: (
      <>
        Правильно: <b>Were you at the office…</b> Дієслово <i>be</i> не вживає <i>did</i>.
      </>
    ),
  },
  {
    q: 'If we ___ the logs earlier, we would have found it in ten minutes.',
    hint: 'Якби ми перевірили логи раніше, ми б знайшли це за десять хвилин.',
    options: ['checked', 'had checked', 'were checking'],
    answer: 1,
    why: (
      <>
        Третій умовний: <b>If + had + V3, … would have + V3</b>.
      </>
    ),
  },
  {
    q: 'She was exhausted — she ___ since six in the morning.',
    hint: 'Вона була виснажена — вона працювала з шостої ранку.',
    options: ['worked', 'was working', 'had been working'],
    answer: 2,
    why: (
      <>
        Past Perfect Continuous: тривалість процесу до точки в минулому + <i>since</i>.
      </>
    ),
  },
];

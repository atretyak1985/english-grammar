/**
 * Схеми теми «Пасивний стан». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 *
 * Колірних кодів тут рівно два, і вони не перетинаються на одній схемі.
 *
 * ① Ролі в реченні (схеми 1, 2, 4): помаранчевий (--pc) — ДІЯЧ, синій
 * (--ps) — ОБʼЄКТ, з яким щось роблять, фіолетовий (--pp) — сама зв’язка
 * `be`, яка тримає граматику. Уся тема — про те, як обʼєкт міняється місцями
 * з діячем, і без кольору на ролях цей обмін не видно.
 *
 * ② Наскрізний код виду застосунку (схема 3, і лише вона): синій — Simple,
 * помаранчевий — Continuous, фіолетовий — Perfect. Там схема розкладає пасив
 * саме по девʼятьох конструкціях, тому чужий локальний код був би гіршим за
 * загальний.
 *
 * Зелений і кораловий усюди означають те саме, що й у решті застосунку:
 * ✓ так кажуть і ✗ так не кажуть.
 */

const TITLE = { fontSize: 14, fontWeight: 800, fontFamily: 'sans-serif' } as const;
const LABEL = {
  fontFamily: 'sans-serif',
  fontSize: 12,
  fontWeight: 700,
  fill: 'var(--ink-3)',
} as const;
const WORD = { fontFamily: 'serif', fontSize: 17, fontWeight: 700, fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;
const TEXT = { fontFamily: 'sans-serif', fontSize: 13.5, fill: 'var(--ink)' } as const;

/* ============================================================
   1 · idea — рокіровка на першому місці речення
   ============================================================ */

/**
 * Головна теза теми на одній картинці: пасив нічого не додає до змісту,
 * він міняє місцями двох учасників. Обʼєкт їде на перше місце, діяч —
 * у хвіст із `by`, а найчастіше зникає зовсім.
 */
export function PassiveSwap() {
  return (
    <svg
      viewBox="0 0 900 400"
      role="img"
      aria-label="Активне речення The team fixed the bug перетворюється на пасивне The bug was fixed by the team"
    >
      <defs>
        <marker
          id="pv-obj"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="4"
          orient="auto"
          fill="var(--ps)"
        >
          <path d="M0,0 L8,4 L0,8 z" />
        </marker>
        <marker
          id="pv-agent"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="4"
          orient="auto"
          fill="var(--pc)"
        >
          <path d="M0,0 L8,4 L0,8 z" />
        </marker>
      </defs>

      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Пасив нічого не додає до змісту — він міняє місцями двох учасників
      </text>

      <text {...LABEL} x={32} y={112}>
        АКТИВ
      </text>
      <text {...LABEL} x={205} y={68} textAnchor="middle">
        діяч
      </text>
      <rect
        x={110}
        y={78}
        width={190}
        height={52}
        rx={10}
        fill="var(--pc-bg)"
        stroke="var(--pc)"
        strokeWidth={1.6}
      />
      <text {...WORD} x={205} y={111} textAnchor="middle" fill="var(--pc-dk)">
        The team
      </text>

      <text {...LABEL} x={410} y={68} textAnchor="middle">
        дія
      </text>
      <rect
        x={330}
        y={78}
        width={160}
        height={52}
        rx={10}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={1.6}
      />
      <text {...WORD} x={410} y={111} textAnchor="middle">
        fixed
      </text>

      <text {...LABEL} x={615} y={68} textAnchor="middle">
        обʼєкт
      </text>
      <rect
        x={520}
        y={78}
        width={190}
        height={52}
        rx={10}
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth={1.6}
      />
      <text {...WORD} x={615} y={111} textAnchor="middle" fill="var(--ps-dk)">
        the bug
      </text>

      <path
        d="M615 136 C 615 196 400 178 216 242"
        fill="none"
        stroke="var(--ps)"
        strokeWidth={2.2}
        markerEnd="url(#pv-obj)"
      />
      <path
        d="M205 136 C 205 196 500 178 678 242"
        fill="none"
        stroke="var(--pc)"
        strokeWidth={2.2}
        strokeDasharray="7 5"
        markerEnd="url(#pv-agent)"
      />

      <text {...LABEL} x={32} y={286}>
        ПАСИВ
      </text>
      <rect
        x={110}
        y={252}
        width={190}
        height={52}
        rx={10}
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth={1.6}
      />
      <text {...WORD} x={205} y={285} textAnchor="middle" fill="var(--ps-dk)">
        The bug
      </text>

      <rect
        x={330}
        y={252}
        width={200}
        height={52}
        rx={10}
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth={1.6}
      />
      <text {...WORD} x={430} y={285} textAnchor="middle" fill="var(--pp-dk)">
        was fixed
      </text>

      <rect
        x={560}
        y={252}
        width={250}
        height={52}
        rx={10}
        fill="none"
        stroke="var(--pc)"
        strokeWidth={1.6}
        strokeDasharray="7 5"
      />
      <text {...WORD} x={685} y={285} textAnchor="middle" fill="var(--pc-dk)">
        (by the team)
      </text>

      <text {...CAPTION} x={205} y={328} textAnchor="middle">
        сюди приїхав обʼєкт
      </text>
      <text {...CAPTION} x={430} y={328} textAnchor="middle">
        be несе час, V3 — значення
      </text>
      <text {...CAPTION} x={685} y={328} textAnchor="middle">
        а звідси діяч найчастіше зникає
      </text>

      <text {...CAPTION} x={450} y={372} textAnchor="middle" fontStyle="italic">
        Суцільна стрілка — обʼєкт переїхав на місце підмета. Пунктир — діяч поїхав у хвіст, і в
        чотирьох реченнях із пʼяти хвоста немає взагалі.
      </text>
    </svg>
  );
}

/* ============================================================
   2 · form — три частини формули
   ============================================================ */

/** Формула пасиву: be тримає граматику, V3 — значення, by-хвіст факультативний. */
export function PassiveFormula() {
  return (
    <svg
      viewBox="0 0 900 320"
      role="img"
      aria-label="Формула пасиву: be плюс третя форма дієслова плюс необовʼязковий by-агент"
    >
      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Уся граматика — у be. Значення — у V3. Діяч — за бажанням
      </text>

      <rect
        x={50}
        y={56}
        width={250}
        height={82}
        rx={12}
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth={1.8}
      />
      <text x={175} y={108} textAnchor="middle" fontFamily="serif" fontSize="30" fontWeight={800} fill="var(--pp-dk)">
        be
      </text>

      <text {...WORD} x={322} y={108} textAnchor="middle" fill="var(--ink-3)">
        +
      </text>

      <rect
        x={345}
        y={56}
        width={250}
        height={82}
        rx={12}
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth={1.8}
      />
      <text x={470} y={108} textAnchor="middle" fontFamily="serif" fontSize="30" fontWeight={800} fill="var(--ps-dk)">
        V3
      </text>

      <text {...WORD} x={617} y={108} textAnchor="middle" fill="var(--ink-3)">
        +
      </text>

      <rect
        x={640}
        y={56}
        width={210}
        height={82}
        rx={12}
        fill="none"
        stroke="var(--pc)"
        strokeWidth={1.8}
        strokeDasharray="7 5"
      />
      <text x={745} y={104} textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight={800} fill="var(--pc-dk)">
        by …
      </text>

      <text {...LABEL} x={175} y={164} textAnchor="middle">
        час · число · особа
      </text>
      <text {...CAPTION} x={175} y={186} textAnchor="middle">
        is · are · was · were
      </text>
      <text {...CAPTION} x={175} y={205} textAnchor="middle">
        has been · will be · being
      </text>

      <text {...LABEL} x={470} y={164} textAnchor="middle">
        не змінюється ніколи
      </text>
      <text {...CAPTION} x={470} y={186} textAnchor="middle">
        fixed · written · taken
      </text>
      <text {...CAPTION} x={470} y={205} textAnchor="middle">
        given · sent · built · done
      </text>

      <text {...LABEL} x={745} y={164} textAnchor="middle">
        необовʼязковий
      </text>
      <text {...CAPTION} x={745} y={186} textAnchor="middle">
        немає в 4 реченнях
      </text>
      <text {...CAPTION} x={745} y={205} textAnchor="middle">
        із пʼяти
      </text>

      <line x1={50} y1={234} x2={850} y2={234} stroke="var(--line)" strokeWidth={1.5} />

      <text {...TEXT} x={50} y={272} fontSize={19} fontFamily="serif">
        The invoice
        <tspan fill="var(--pp-dk)" fontWeight={800}>
          {' '}
          has been{' '}
        </tspan>
        <tspan fill="var(--ps-dk)" fontWeight={800}>
          sent
        </tspan>
        <tspan fill="var(--pc-dk)" fontWeight={800}>
          {' '}
          by the accounting team
        </tspan>
        .
      </text>
      <text {...CAPTION} x={50} y={300}>
        Заберіть <tspan fontStyle="italic">has been</tspan> — і речення розсиплеться. Заберіть
        <tspan fontStyle="italic"> by the accounting team</tspan> — і воно стане тільки кращим.
      </text>
    </svg>
  );
}

/* ============================================================
   3 · tenses — девʼять конструкцій, сім робочих пасивів
   ============================================================ */

type TenseCell = {
  form: string;
  example: string;
  /** Порожня клітинка: форма теоретично існує, а живою мовою не вживається */
  dead?: boolean;
};

const TENSE_ROWS: readonly { time: string; cells: readonly TenseCell[] }[] = [
  {
    time: 'Past',
    cells: [
      { form: 'was / were done', example: 'The bug was fixed.' },
      { form: 'was / were being done', example: 'It was being fixed.' },
      { form: 'had been done', example: 'It had been fixed.' },
    ],
  },
  {
    time: 'Present',
    cells: [
      { form: 'am / is / are done', example: 'The bug is fixed.' },
      { form: 'is / are being done', example: 'It is being fixed.' },
      { form: 'have / has been done', example: 'It has been fixed.' },
    ],
  },
  {
    time: 'Future',
    cells: [
      { form: 'will be done', example: 'The bug will be fixed.' },
      { form: '—', example: 'will be being — не кажуть', dead: true },
      { form: 'will have been done', example: 'It will have been fixed.' },
    ],
  },
];

const ASPECT_COLUMN = [
  { title: 'Simple', color: 'var(--ps)', bg: 'var(--ps-bg)', ink: 'var(--ps-dk)' },
  { title: 'Continuous', color: 'var(--pc)', bg: 'var(--pc-bg)', ink: 'var(--pc-dk)' },
  { title: 'Perfect', color: 'var(--pp)', bg: 'var(--pp-bg)', ink: 'var(--pp-dk)' },
] as const;

const COL_X = [236, 452, 668] as const;
const COL_W = 208;
const ROW_Y = [98, 174, 250] as const;
const ROW_H = 64;

/**
 * Матриця пасиву 3 × 3. Кольори тут — наскрізний код виду застосунку
 * (синій Simple, помаранчевий Continuous, фіолетовий Perfect), бо це рівно
 * ті самі девʼять конструкцій, які підсвічує аналізатор.
 */
export function PassiveTenses() {
  return (
    <svg
      viewBox="0 0 900 390"
      role="img"
      aria-label="Таблиця пасиву в девʼяти часах: was fixed, is being fixed, has been fixed і решта"
    >
      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Змінюється тільки be. Слово fixed не змінюється жодного разу
      </text>

      {ASPECT_COLUMN.map((column, index) => (
        <text
          key={column.title}
          {...LABEL}
          x={COL_X[index]! + COL_W / 2}
          y={84}
          textAnchor="middle"
          fill={column.ink}
        >
          {column.title.toUpperCase()}
        </text>
      ))}

      {TENSE_ROWS.map((row, rowIndex) => (
        <g key={row.time}>
          <text {...LABEL} x={210} y={ROW_Y[rowIndex]! + 38} textAnchor="end" fontSize={13}>
            {row.time}
          </text>
          {row.cells.map((cell, colIndex) => {
            const column = ASPECT_COLUMN[colIndex]!;
            return (
              <g key={`${row.time}-${column.title}`}>
                <rect
                  x={COL_X[colIndex]}
                  y={ROW_Y[rowIndex]}
                  width={COL_W}
                  height={ROW_H}
                  rx={10}
                  fill={cell.dead ? 'var(--surface-2)' : column.bg}
                  stroke={cell.dead ? 'var(--line-strong)' : column.color}
                  strokeWidth={1.5}
                  strokeDasharray={cell.dead ? '6 4' : undefined}
                />
                <text
                  x={COL_X[colIndex]! + COL_W / 2}
                  y={ROW_Y[rowIndex]! + 27}
                  textAnchor="middle"
                  fontFamily="serif"
                  fontSize={15}
                  fontWeight={800}
                  fill={cell.dead ? 'var(--ink-3)' : column.ink}
                >
                  {cell.form}
                </text>
                <text
                  {...CAPTION}
                  x={COL_X[colIndex]! + COL_W / 2}
                  y={ROW_Y[rowIndex]! + 48}
                  textAnchor="middle"
                  fontSize={11.5}
                >
                  {cell.example}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      <text {...CAPTION} x={450} y={342} textAnchor="middle">
        Perfect Continuous пасиву не має взагалі: <tspan fontStyle="italic">has been being fixed</tspan>{' '}
        граматично збирається, але так не пишуть навіть у документах.
      </text>
      <text {...CAPTION} x={450} y={366} textAnchor="middle" fontStyle="italic">
        Девʼять конструкцій активу дають сім робочих пасивів — на дві форми менше вчити.
      </text>
    </svg>
  );
}

/* ============================================================
   4 · two-objects — один актив, два пасиви
   ============================================================ */

/** Дієслова на кшталт give мають два додатки — отже, два можливі пасиви. */
export function TwoObjects() {
  return (
    <svg
      viewBox="0 0 900 340"
      role="img"
      aria-label="They gave Olha a laptop дає два пасиви: Olha was given a laptop і A laptop was given to Olha"
    >
      <defs>
        <marker
          id="pv-two"
          markerWidth="9"
          markerHeight="9"
          refX="7"
          refY="3.5"
          orient="auto"
          fill="var(--line-strong)"
        >
          <path d="M0,0 L7,3.5 L0,7 z" />
        </marker>
      </defs>

      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Два додатки — два пасиви. Англійська майже завжди обирає лівий
      </text>

      <rect
        x={230}
        y={50}
        width={440}
        height={56}
        rx={12}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={1.6}
      />
      <text x={450} y={85} textAnchor="middle" fontFamily="serif" fontSize={18} fontWeight={700} fill="var(--ink)">
        They gave{' '}
        <tspan fill="var(--ps-dk)" fontWeight={800}>
          Olha
        </tspan>{' '}
        <tspan fill="var(--pc-dk)" fontWeight={800}>
          a laptop
        </tspan>
        .
      </text>

      <path d="M380 110 L250 148" stroke="var(--line-strong)" strokeWidth={2} markerEnd="url(#pv-two)" />
      <path d="M520 110 L650 148" stroke="var(--line-strong)" strokeWidth={2} markerEnd="url(#pv-two)" />

      <rect
        x={40}
        y={158}
        width={390}
        height={92}
        rx={12}
        fill="var(--ok-bg)"
        stroke="var(--ok)"
        strokeWidth={1.8}
      />
      <text x={235} y={196} textAnchor="middle" fontFamily="serif" fontSize={17} fontWeight={700} fill="var(--ink)">
        <tspan fill="var(--ps-dk)" fontWeight={800}>
          Olha
        </tspan>{' '}
        was given a laptop.
      </text>
      <text {...CAPTION} x={235} y={222} textAnchor="middle">
        підмет — людина, прийменника немає
      </text>
      <text {...CAPTION} x={235} y={240} textAnchor="middle" fontWeight={700} fill="var(--ok)">
        так кажуть у девʼяти випадках із десяти
      </text>

      <rect
        x={470}
        y={158}
        width={390}
        height={92}
        rx={12}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={1.6}
      />
      <text x={665} y={196} textAnchor="middle" fontFamily="serif" fontSize={17} fontWeight={700} fill="var(--ink)">
        <tspan fill="var(--pc-dk)" fontWeight={800}>
          A laptop
        </tspan>{' '}
        was given <tspan fontWeight={800}>to</tspan> Olha.
      </text>
      <text {...CAPTION} x={665} y={222} textAnchor="middle">
        підмет — річ, і людині потрібне to
      </text>
      <text {...CAPTION} x={665} y={240} textAnchor="middle">
        теж правильно — коли розмова про ноутбук
      </text>

      <rect
        x={230}
        y={272}
        width={440}
        height={44}
        rx={10}
        fill="var(--no-bg)"
        stroke="var(--no)"
        strokeWidth={1.6}
      />
      <text x={450} y={299} textAnchor="middle" fontFamily="serif" fontSize={16} fontWeight={700} fill="var(--coral-tx)">
        ✗ To Olha was given a laptop.
      </text>
    </svg>
  );
}

/* ============================================================
   5 · decision — три питання
   ============================================================ */

const DECISION_STEPS: readonly { n: string; question: readonly string[]; yes: string }[] = [
  { n: '1', question: ['Хто зробив — узагалі відомо?'], yes: 'ПАСИВ · My laptop was stolen.' },
  {
    n: '2',
    question: ['Діяч важливий саме в цьому реченні?'],
    yes: 'ПАСИВ · The road is being repaired.',
  },
  {
    n: '3',
    question: ['Речення підхоплює тему попереднього —', 'і ця тема є обʼєктом дії?'],
    yes: 'ПАСИВ · It was tested by three teams.',
  },
];

/** Схема вибору: три питання підряд, і кожне «ні» вмикає пасив. */
export function PassiveDecision() {
  return (
    <svg
      viewBox="0 0 900 400"
      role="img"
      aria-label="Схема вибору: три питання, після яких стає зрозуміло, потрібен пасив чи актив"
    >
      <defs>
        <marker
          id="pv-flow"
          markerWidth="9"
          markerHeight="9"
          refX="7"
          refY="3.5"
          orient="auto"
          fill="var(--line-strong)"
        >
          <path d="M0,0 L7,3.5 L0,7 z" />
        </marker>
      </defs>

      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Три питання. Перше «ні» — і далі можна не читати
      </text>

      {DECISION_STEPS.map((step, index) => {
        const y = 56 + index * 96;
        return (
          <g key={step.n}>
            <rect
              x={40}
              y={y}
              width={420}
              height={68}
              rx={12}
              fill="var(--surface)"
              stroke="var(--line-strong)"
              strokeWidth={1.6}
            />
            <circle cx={72} cy={y + 34} r={15} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={1.5} />
            <text
              x={72}
              y={y + 39}
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize={14}
              fontWeight={800}
              fill="var(--pp-dk)"
            >
              {step.n}
            </text>
            {step.question.map((line, lineIndex) => (
              <text
                key={line}
                {...TEXT}
                x={98}
                y={y + (step.question.length === 1 ? 39 : 31 + lineIndex * 19)}
              >
                {line}
              </text>
            ))}

            <path
              d={`M460 ${y + 34} L530 ${y + 34}`}
              stroke="var(--line-strong)"
              strokeWidth={2}
              markerEnd="url(#pv-flow)"
            />
            <text {...LABEL} x={495} y={y + 24} textAnchor="middle" fontSize={11}>
              {index === 2 ? 'ТАК' : 'НІ'}
            </text>

            <rect
              x={540}
              y={y + 6}
              width={320}
              height={56}
              rx={10}
              fill="var(--ok-bg)"
              stroke="var(--ok)"
              strokeWidth={1.6}
            />
            <text {...CAPTION} x={700} y={y + 38} textAnchor="middle" fill="var(--ink)" fontWeight={600}>
              {step.yes}
            </text>

            {index < 2 ? (
              <>
                <path
                  d={`M250 ${y + 68} L250 ${y + 96}`}
                  stroke="var(--line-strong)"
                  strokeWidth={2}
                  markerEnd="url(#pv-flow)"
                />
                <text {...LABEL} x={264} y={y + 88} fontSize={11}>
                  ТАК
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      <path d="M250 316 L250 344" stroke="var(--line-strong)" strokeWidth={2} markerEnd="url(#pv-flow)" />
      <text {...LABEL} x={264} y={336} fontSize={11}>
        НІ
      </text>

      <rect
        x={40}
        y={348}
        width={420}
        height={44}
        rx={10}
        fill="var(--pc-bg)"
        stroke="var(--pc)"
        strokeWidth={1.6}
      />
      <text {...TEXT} x={250} y={376} textAnchor="middle" fontWeight={700} fill="var(--pc-dk)">
        АКТИВ · We fixed the bug.
      </text>

      <text {...CAPTION} x={540} y={370} fontStyle="italic">
        Три «ні» поспіль означають, що пасив тут лише подовжить
      </text>
      <text {...CAPTION} x={540} y={388} fontStyle="italic">
        речення на два слова й нічого не додасть.
      </text>
    </svg>
  );
}

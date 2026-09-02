/**
 * Схеми теми «Непряма мова й узгодження часів». Кольори — на змінних теми,
 * тому та сама схема правильно виглядає і в світлій, і в темній темі.
 *
 * Колірних кодів тут два, і вони поділені між схемами, а не змішані на одній.
 *
 * ① Наскрізний код виду застосунку (схема 2): синій — Simple, помаранчевий —
 * Continuous, фіолетовий — Perfect. У таблиці зсуву він працює як доказ:
 * вид при зсуві НЕ міняється, тому майже всі рядки одноколірні, і єдиний
 * двоколірний рядок (Past Simple → Past Perfect, синій → фіолетовий) —
 * це рівно той, на якому спотикаються.
 *
 * ② Що саме перераховують (схеми 1, 3): помаранчевий (--pc) — дієслово й
 * час, синій (--ps) — учасники розмови, фіолетовий (--pp) — обставини часу
 * й місця. Три канали, бо помилка теми зазвичай саме в тому, що перерахували
 * один із трьох, а два лишили як були.
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
   1 · idea — три канали, які перераховують у переказі
   ============================================================ */

type ShiftColumn = {
  /** Що це за частина репліки — підпис над колонкою */
  role: string;
  direct: string;
  reported: string;
  width: number;
  color: string;
  bg: string;
  ink: string;
};

const SHIFT_COLUMNS: readonly ShiftColumn[] = [
  {
    role: 'хто',
    direct: 'I',
    reported: 'she',
    width: 110,
    color: 'var(--ps)',
    bg: 'var(--ps-bg)',
    ink: 'var(--ps-dk)',
  },
  {
    role: 'час',
    direct: 'am working',
    reported: 'was working',
    width: 190,
    color: 'var(--pc)',
    bg: 'var(--pc-bg)',
    ink: 'var(--pc-dk)',
  },
  {
    role: 'чий',
    direct: 'on your ticket',
    reported: 'on my ticket',
    width: 210,
    color: 'var(--ps)',
    bg: 'var(--ps-bg)',
    ink: 'var(--ps-dk)',
  },
  {
    role: 'коли',
    direct: 'now',
    reported: 'that day',
    width: 160,
    color: 'var(--pp)',
    bg: 'var(--pp-bg)',
    ink: 'var(--pp-dk)',
  },
];

/** Х-координати колонок: ширини різні, тому рахуються, а не проставляються. */
const SHIFT_X = SHIFT_COLUMNS.reduce<number[]>((positions, column, index) => {
  const previous = positions[index - 1];
  const previousWidth = SHIFT_COLUMNS[index - 1]?.width ?? 0;
  positions.push(previous === undefined ? 85 : previous + previousWidth + 20);
  return positions;
}, []);

/**
 * Головна теза теми на одній картинці: переказ не переповідає репліку
 * своїми словами — він перераховує в неї три речі, бо точка відліку
 * переїхала з чужого «зараз» у ваше.
 */
export function ReportedShift() {
  return (
    <svg
      viewBox="0 0 900 340"
      role="img"
      aria-label="Репліка I am working on your ticket now перетворюється на переказ she was working on my ticket that day"
    >
      <defs>
        <marker
          id="rs-down"
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
        Переказ не переповідає репліку — він перераховує її у вашу систему координат
      </text>

      <text {...LABEL} x={85} y={62}>
        ПОНЕДІЛОК · ОЛЯ ГОВОРИТЬ
      </text>

      {SHIFT_COLUMNS.map((column, index) => {
        const x = SHIFT_X[index]!;
        const centre = x + column.width / 2;
        return (
          <g key={column.role}>
            <rect
              x={x}
              y={74}
              width={column.width}
              height={54}
              rx={10}
              fill={column.bg}
              stroke={column.color}
              strokeWidth={1.6}
            />
            <text {...WORD} x={centre} y={108} textAnchor="middle" fill={column.ink}>
              {column.direct}
            </text>

            <path
              d={`M${centre} 132 L${centre} 196`}
              stroke="var(--line-strong)"
              strokeWidth={2}
              markerEnd="url(#rs-down)"
            />
            <text {...LABEL} x={centre + 8} y={168} fontSize={11}>
              {column.role}
            </text>

            <rect
              x={x}
              y={202}
              width={column.width}
              height={54}
              rx={10}
              fill={column.bg}
              stroke={column.color}
              strokeWidth={1.6}
            />
            <text {...WORD} x={centre} y={236} textAnchor="middle" fill={column.ink}>
              {column.reported}
            </text>
          </g>
        );
      })}

      <text {...LABEL} x={85} y={280}>
        СЕРЕДА · ВИ ПЕРЕКАЗУЄТЕ · She said…
      </text>

      <text {...CAPTION} x={450} y={310} textAnchor="middle">
        Чотири слова з семи змінилися — і жодне з них не через ввічливість чи стиль.
      </text>
      <text {...CAPTION} x={450} y={330} textAnchor="middle" fontStyle="italic">
        Українською змінився б лише займенник: «Вона сказала, що працює над моїм тікетом».
      </text>
    </svg>
  );
}

/* ============================================================
   2 · backshift — сходинка назад, вид на місці
   ============================================================ */

type BackshiftRow = {
  direct: string;
  reported: string;
  /** Колірна родина виду — ліва і права клітинки можуть відрізнятися */
  from: 'simple' | 'continuous' | 'perfect';
  to: 'simple' | 'continuous' | 'perfect';
  /** Дно сходів: зсуватися вже нікуди */
  floor?: boolean;
};

const ASPECT_INK = {
  simple: { color: 'var(--ps)', bg: 'var(--ps-bg)', ink: 'var(--ps-dk)' },
  continuous: { color: 'var(--pc)', bg: 'var(--pc-bg)', ink: 'var(--pc-dk)' },
  perfect: { color: 'var(--pp)', bg: 'var(--pp-bg)', ink: 'var(--pp-dk)' },
} as const;

const BACKSHIFT_ROWS: readonly BackshiftRow[] = [
  { direct: 'works', reported: 'worked', from: 'simple', to: 'simple' },
  { direct: 'is working', reported: 'was working', from: 'continuous', to: 'continuous' },
  { direct: 'has worked', reported: 'had worked', from: 'perfect', to: 'perfect' },
  { direct: 'worked', reported: 'had worked', from: 'simple', to: 'perfect' },
  { direct: 'had worked', reported: 'had worked', from: 'perfect', to: 'perfect', floor: true },
  { direct: 'will work', reported: 'would work', from: 'simple', to: 'simple' },
];

const BACKSHIFT_Y = 96;
const BACKSHIFT_H = 46;
const BACKSHIFT_GAP = 10;

/**
 * Таблиця зсуву. Кольори — наскрізний код виду застосунку, і саме тому
 * схема доводить головне без жодного підпису: майже кожен рядок
 * одноколірний, бо зсув міняє час, а не вид. Двоколірний рядок один —
 * Past Simple → Past Perfect.
 */
export function Backshift() {
  return (
    <svg
      viewBox="0 0 900 470"
      role="img"
      aria-label="Таблиця узгодження часів: works стає worked, is working стає was working, has worked і worked стають had worked, will стає would"
    >
      <defs>
        <marker
          id="rs-step"
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
        Кожна конструкція відходить на одну сходинку в минуле
      </text>
      <text {...CAPTION} x={450} y={50} textAnchor="middle">
        Колір означає вид. Вид при зсуві не міняється — тому майже всі рядки одноколірні.
      </text>

      <text {...LABEL} x={250} y={82} textAnchor="middle">
        ПРЯМА МОВА · «…»
      </text>
      <text {...LABEL} x={650} y={82} textAnchor="middle">
        ПЕРЕКАЗ · He said (that)…
      </text>

      {BACKSHIFT_ROWS.map((row, index) => {
        const y = BACKSHIFT_Y + index * (BACKSHIFT_H + BACKSHIFT_GAP);
        const from = ASPECT_INK[row.from];
        const to = ASPECT_INK[row.to];
        return (
          <g key={`${row.direct}-${row.reported}`}>
            <rect
              x={90}
              y={y}
              width={320}
              height={BACKSHIFT_H}
              rx={10}
              fill={from.bg}
              stroke={from.color}
              strokeWidth={1.5}
            />
            <text {...WORD} x={250} y={y + 30} textAnchor="middle" fill={from.ink}>
              {row.direct}
            </text>

            <path
              d={`M418 ${y + 23} L482 ${y + 23}`}
              stroke="var(--line-strong)"
              strokeWidth={2}
              strokeDasharray={row.floor ? '6 4' : undefined}
              markerEnd="url(#rs-step)"
            />

            <rect
              x={490}
              y={y}
              width={320}
              height={BACKSHIFT_H}
              rx={10}
              fill={to.bg}
              stroke={to.color}
              strokeWidth={1.5}
            />
            <text {...WORD} x={650} y={y + 30} textAnchor="middle" fill={to.ink}>
              {row.reported}
            </text>

            {row.floor ? (
              <text {...CAPTION} x={824} y={y + 29} fontSize={11.5}>
                дно
              </text>
            ) : null}
          </g>
        );
      })}

      <text {...CAPTION} x={450} y={434} textAnchor="middle">
        Past Perfect — дно сходів: далі в минуле англійська не вміє, тому два різні часи
      </text>
      <text {...CAPTION} x={450} y={452} textAnchor="middle">
        (<tspan fontStyle="italic">worked</tspan> і <tspan fontStyle="italic">had worked</tspan>)
        зустрічаються в переказі в одній формі — і розрізняє їх лише контекст.
      </text>
    </svg>
  );
}

/* ============================================================
   3 · questions — що зникає з питання, коли його переказують
   ============================================================ */

type QuestionChip = {
  text: string;
  width: number;
  /** Слово зникає в переказі — коралова пунктирна рамка */
  gone?: boolean;
  /** Слово, яке міняє форму або місце */
  moved?: boolean;
};

const DIRECT_QUESTION: readonly QuestionChip[] = [
  { text: 'Where', width: 130 },
  { text: 'do', width: 90, gone: true },
  { text: 'you', width: 110, moved: true },
  { text: 'live', width: 120, moved: true },
  { text: '?', width: 60, gone: true },
];

const REPORTED_QUESTION: readonly QuestionChip[] = [
  { text: 'He asked', width: 160 },
  { text: 'where', width: 130 },
  { text: 'I', width: 90, moved: true },
  { text: 'lived', width: 130, moved: true },
  { text: '.', width: 60 },
];

/** Х-координати ряду фішок: центрує рядок будь-якої довжини. */
function rowPositions(chips: readonly QuestionChip[]): number[] {
  const total = chips.reduce((sum, chip) => sum + chip.width, 0) + (chips.length - 1) * 14;
  const start = (900 - total) / 2;
  const positions: number[] = [];
  let x = start;
  for (const chip of chips) {
    positions.push(x);
    x += chip.width + 14;
  }
  return positions;
}

/**
 * Непряме питання. Схема показує не «як побудувати», а що саме
 * викидають: допоміжне do, інверсію і знак питання. Ці три речі
 * і є вся різниця.
 */
export function QuestionOrder() {
  const directX = rowPositions(DIRECT_QUESTION);
  const reportedX = rowPositions(REPORTED_QUESTION);

  return (
    <svg
      viewBox="0 0 900 380"
      role="img"
      aria-label="Пряме питання Where do you live перетворюється на непряме He asked where I lived"
    >
      <defs>
        <marker
          id="rs-q"
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
        Питання, яке переказали, перестає бути питанням
      </text>

      <text {...LABEL} x={40} y={72}>
        ПРЯМЕ ПИТАННЯ
      </text>
      {DIRECT_QUESTION.map((chip, index) => {
        const x = directX[index]!;
        return (
          <g key={`direct-${chip.text}`}>
            <rect
              x={x}
              y={84}
              width={chip.width}
              height={52}
              rx={10}
              fill={chip.gone ? 'var(--no-bg)' : 'var(--surface)'}
              stroke={chip.gone ? 'var(--no)' : 'var(--line-strong)'}
              strokeWidth={1.6}
              strokeDasharray={chip.gone ? '6 4' : undefined}
            />
            <text
              {...WORD}
              x={x + chip.width / 2}
              y={117}
              textAnchor="middle"
              fill={chip.gone ? 'var(--coral-tx)' : 'var(--ink)'}
            >
              {chip.text}
            </text>
          </g>
        );
      })}

      <path
        d="M450 148 L450 190"
        stroke="var(--line-strong)"
        strokeWidth={2}
        markerEnd="url(#rs-q)"
      />
      <text {...LABEL} x={462} y={176} fontSize={11}>
        переказ
      </text>

      <text {...LABEL} x={40} y={196}>
        НЕПРЯМЕ ПИТАННЯ
      </text>
      {REPORTED_QUESTION.map((chip, index) => {
        const x = reportedX[index]!;
        return (
          <g key={`reported-${chip.text}`}>
            <rect
              x={x}
              y={208}
              width={chip.width}
              height={52}
              rx={10}
              fill={chip.moved ? 'var(--ok-bg)' : 'var(--surface)'}
              stroke={chip.moved ? 'var(--ok)' : 'var(--line-strong)'}
              strokeWidth={1.6}
            />
            <text {...WORD} x={x + chip.width / 2} y={241} textAnchor="middle">
              {chip.text}
            </text>
          </g>
        );
      })}

      <text {...TEXT} x={70} y={300} fontWeight={700} fill="var(--coral-tx)">
        ① do / does / did зникає
      </text>
      <text {...CAPTION} x={70} y={320}>
        його роботу вже виконує головне дієслово
      </text>

      <text {...TEXT} x={350} y={300} fontWeight={700} fill="var(--ps-dk)">
        ② порядок слів прямий
      </text>
      <text {...CAPTION} x={350} y={320}>
        підмет перед дієсловом, як у розповіді
      </text>

      <text {...TEXT} x={640} y={300} fontWeight={700} fill="var(--pp-dk)">
        ③ знака питання немає
      </text>
      <text {...CAPTION} x={640} y={320}>
        це вже розповідне речення про питання
      </text>

      <text {...CAPTION} x={450} y={358} textAnchor="middle" fontStyle="italic">
        ✗ He asked where do you live? — тут порушені всі три пункти одночасно.
      </text>
    </svg>
  );
}

/* ============================================================
   4 · reporting-verbs — чотири моделі
   ============================================================ */

type VerbModel = {
  pattern: string;
  example: string;
  verbs: string;
  color: string;
  bg: string;
  ink: string;
};

const VERB_MODELS: readonly VerbModel[] = [
  {
    pattern: '+ (that) + речення',
    example: 'He admitted (that) he had forgotten.',
    verbs: 'say · admit · explain · complain · reply · deny · insist · claim',
    color: 'var(--ps)',
    bg: 'var(--ps-bg)',
    ink: 'var(--ps-dk)',
  },
  {
    pattern: '+ to do',
    example: 'She refused to sign the contract.',
    verbs: 'promise · offer · refuse · agree · threaten · claim',
    color: 'var(--pc)',
    bg: 'var(--pc-bg)',
    ink: 'var(--pc-dk)',
  },
  {
    pattern: '+ -ing',
    example: 'He suggested waiting until Monday.',
    verbs: 'suggest · admit · deny · recommend · apologise for · insist on',
    color: 'var(--pp)',
    bg: 'var(--pp-bg)',
    ink: 'var(--pp-dk)',
  },
  {
    pattern: '+ комусь + to do',
    example: 'They told me to wait outside.',
    verbs: 'tell · ask · advise · warn · remind · invite · order · encourage',
    color: 'var(--ok)',
    bg: 'var(--ok-bg)',
    ink: 'var(--green-tx)',
  },
];

const MODEL_X = [40, 470] as const;
const MODEL_Y = [76, 244] as const;

/** Чотири моделі дієслів переказу. Модель — це те, що йде ПІСЛЯ дієслова. */
export function ReportingModels() {
  return (
    <svg
      viewBox="0 0 900 420"
      role="img"
      aria-label="Чотири моделі дієслів переказу: that плюс речення, to do, -ing, комусь плюс to do"
    >
      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Дієслово переказу вчиться разом зі своєю моделлю — окремо воно не працює
      </text>
      <text {...CAPTION} x={450} y={50} textAnchor="middle">
        Модель — це те, що стоїть після дієслова. Саме її й доводиться запамʼятовувати.
      </text>

      {VERB_MODELS.map((model, index) => {
        const x = MODEL_X[index % 2]!;
        const y = MODEL_Y[Math.floor(index / 2)]!;
        return (
          <g key={model.pattern}>
            <rect
              x={x}
              y={y}
              width={390}
              height={150}
              rx={12}
              fill={model.bg}
              stroke={model.color}
              strokeWidth={1.6}
            />
            <text
              x={x + 20}
              y={y + 36}
              fontFamily="sans-serif"
              fontSize={15}
              fontWeight={800}
              fill={model.ink}
            >
              дієслово {model.pattern}
            </text>
            <text
              x={x + 20}
              y={y + 70}
              fontFamily="serif"
              fontSize={15}
              fontWeight={700}
              fill="var(--ink)"
            >
              {model.example}
            </text>
            <text {...CAPTION} x={x + 20} y={y + 104} fontSize={11.5}>
              {model.verbs.split(' · ').slice(0, 4).join(' · ')}
            </text>
            <text {...CAPTION} x={x + 20} y={y + 124} fontSize={11.5}>
              {model.verbs.split(' · ').slice(4).join(' · ')}
            </text>
          </g>
        );
      })}

      <text {...CAPTION} x={450} y={412} textAnchor="middle" fontStyle="italic">
        Три дієслова стоять у двох моделях одразу: admit, deny і claim. Значення при цьому
        не змінюється — лише те, що йде після них.
      </text>
    </svg>
  );
}

/* ============================================================
   5 · decision — розвилка на три, далі однаково
   ============================================================ */

type Branch = {
  kind: string;
  quote: string;
  reported: string;
  color: string;
  bg: string;
  ink: string;
};

const BRANCHES: readonly Branch[] = [
  {
    kind: 'РОЗПОВІДЬ',
    quote: '«I am tired.»',
    reported: 'He said (that) he was tired.',
    color: 'var(--ps)',
    bg: 'var(--ps-bg)',
    ink: 'var(--ps-dk)',
  },
  {
    kind: 'ПИТАННЯ',
    quote: '«Where do you live?»',
    reported: 'He asked where I lived.',
    color: 'var(--pc)',
    bg: 'var(--pc-bg)',
    ink: 'var(--pc-dk)',
  },
  {
    kind: 'НАКАЗ · ПРОХАННЯ',
    quote: '«Wait outside.»',
    reported: 'He told me to wait outside.',
    color: 'var(--pp)',
    bg: 'var(--pp-bg)',
    ink: 'var(--pp-dk)',
  },
];

const BRANCH_X = [40, 320, 600] as const;

/**
 * Схема вибору. Перше рішення — не про час, а про тип репліки: від нього
 * залежить сама конструкція. Зсув часу й займенники йдуть після і працюють
 * однаково в усіх трьох гілках.
 */
export function ReportedDecision() {
  return (
    <svg
      viewBox="0 0 900 430"
      role="img"
      aria-label="Схема переказу: спершу тип репліки — розповідь, питання чи наказ, потім зсув часу і займенники"
    >
      <defs>
        <marker
          id="rs-flow"
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
        Спершу — що це за репліка. Час і займенники йдуть після, і в усіх трьох однаково
      </text>

      {BRANCHES.map((branch, index) => {
        const x = BRANCH_X[index]!;
        return (
          <g key={branch.kind}>
            <rect
              x={x}
              y={54}
              width={260}
              height={132}
              rx={12}
              fill={branch.bg}
              stroke={branch.color}
              strokeWidth={1.6}
            />
            <text
              x={x + 130}
              y={82}
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize={11.5}
              fontWeight={800}
              letterSpacing={1}
              fill={branch.ink}
            >
              {branch.kind}
            </text>
            <text
              x={x + 130}
              y={112}
              textAnchor="middle"
              fontFamily="serif"
              fontSize={15}
              fontWeight={700}
              fill="var(--ink-2)"
            >
              {branch.quote}
            </text>
            <text
              x={x + 130}
              y={152}
              textAnchor="middle"
              fontFamily="serif"
              fontSize={14.5}
              fontWeight={700}
              fill="var(--ink)"
            >
              {branch.reported}
            </text>

            <path
              d={`M${x + 130} 186 L${x + 130} 232`}
              stroke="var(--line-strong)"
              strokeWidth={2}
              markerEnd="url(#rs-flow)"
            />
          </g>
        );
      })}

      <rect
        x={40}
        y={238}
        width={820}
        height={150}
        rx={12}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={1.6}
      />
      <text {...LABEL} x={64} y={266}>
        ДАЛІ — ОДНАКОВО ДЛЯ ВСІХ ТРЬОХ
      </text>
      <text {...TEXT} x={64} y={296}>
        ① Головне дієслово в минулому (said, asked, told)? — зсуньте час на крок назад
      </text>
      <text {...TEXT} x={64} y={324}>
        ② Перерахуйте учасників: I → he · you → I · my → his
      </text>
      <text {...TEXT} x={64} y={352}>
        ③ Перерахуйте час і місце: now → then · tomorrow → the next day · here → there
      </text>
      <text {...CAPTION} x={64} y={376}>
        Крок ① пропускається, коли сказане досі правда, — це пʼять випадків із розділу 3.
      </text>

      <text {...CAPTION} x={450} y={414} textAnchor="middle" fontStyle="italic">
        Пропустити крок ② чи ③ страшніше, ніж ①: неперерахований займенник міняє зміст,
        а незсунутий час — лише відтінок.
      </text>
    </svg>
  );
}

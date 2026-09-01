/**
 * Схеми теми «Умовні речення». Кольори — на змінних теми, тому та сама
 * схема правильно виглядає і в світлій, і в темній темі.
 *
 * Кольори тут повторюють наскрізний код часів застосунку: синій — прості
 * теперішні форми, жовто-помаранчевий — will/would, фіолетовий — перфект.
 * Це навмисно: у схемах видно, що умовні речення зібрані з тих самих
 * часів, які підсвічує читалка, а не з окремої «умовної» граматики.
 */

const C = {
  /** if-частина в реальних типах: теперішні форми */
  present: { fill: 'var(--ps-bg)', stroke: 'var(--ps)', text: 'var(--ps-dk)' },
  /** зсунуті назад форми (past в уявних) */
  past: { fill: 'var(--pc-bg)', stroke: 'var(--pc)', text: 'var(--pc-dk)' },
  /** would / will — результатне плече */
  result: { fill: 'var(--ok-bg)', stroke: 'var(--ok)', text: 'var(--green-tx)' },
  /** perfect-форми */
  perfect: { fill: 'var(--pp-bg)', stroke: 'var(--pp)', text: 'var(--pp-dk)' },
} as const;

const LABEL = { fontSize: 12, fontWeight: 800, fontFamily: 'sans-serif' } as const;
const SUB = {
  fontSize: 10.5,
  fontWeight: 700,
  fontFamily: 'sans-serif',
  fill: 'var(--ink-3)',
} as const;
const WORD = { fontSize: 13.5, fontWeight: 700, fontFamily: 'serif', fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;

type ColorKey = keyof typeof C;

function Pill({
  x,
  y,
  w,
  color,
  text,
}: {
  x: number;
  y: number;
  w: number;
  color: ColorKey;
  text: string;
}) {
  const c = C[color];
  return (
    <>
      <rect x={x} y={y} width={w} height={34} rx={9} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <text {...WORD} x={x + w / 2} y={y + 22} textAnchor="middle">
        {text}
      </text>
    </>
  );
}

/**
 * Драбина реальності: чотири типи на одній осі. Вниз — менше реальності,
 * і на кожному щаблі час у if-частині відступає на крок у минуле.
 */
export function RealityLadder() {
  const rows: {
    y: number;
    label: string;
    sub: string;
    ifW: number;
    ifColor: ColorKey;
    ifText: string;
    resColor: ColorKey;
    resText: string;
    resW: number;
  }[] = [
    {
      y: 34,
      label: 'ZERO',
      sub: 'завжди так',
      ifW: 250,
      ifColor: 'present',
      ifText: 'If you press it,',
      resColor: 'present',
      resText: 'it restarts.',
      resW: 240,
    },
    {
      y: 92,
      label: 'FIRST',
      sub: 'реальний план',
      ifW: 250,
      ifColor: 'present',
      ifText: 'If you press it,',
      resColor: 'result',
      resText: 'it will restart.',
      resW: 240,
    },
    {
      y: 150,
      label: 'SECOND',
      sub: 'уявне сьогодні',
      ifW: 250,
      ifColor: 'past',
      ifText: 'If you pressed it,',
      resColor: 'result',
      resText: 'it would restart.',
      resW: 240,
    },
    {
      y: 208,
      label: 'THIRD',
      sub: 'не сталося',
      ifW: 250,
      ifColor: 'perfect',
      ifText: 'If you had pressed it,',
      resColor: 'result',
      resText: 'it would have restarted.',
      resW: 300,
    },
  ];

  return (
    <svg
      viewBox="0 0 900 292"
      role="img"
      aria-label="Чотири типи умовних речень на одній осі реальності: що менш реально, то далі в минуле зсувається час"
    >
      {/* вертикальна вісь реальності */}
      <line x1={70} y1={30} x2={70} y2={252} stroke="var(--line-strong)" strokeWidth={2} />
      <polygon points="70,262 64,250 76,250" fill="var(--line-strong)" />
      <text {...SUB} x={26} y={40}>
        реально
      </text>
      <text {...SUB} x={16} y={258}>
        нереально
      </text>

      {rows.map((row) => (
        <g key={row.label}>
          <text {...LABEL} x={110} y={row.y + 15} fill="var(--ink)">
            {row.label}
          </text>
          <text {...SUB} x={110} y={row.y + 30}>
            {row.sub}
          </text>
          <Pill x={230} y={row.y - 4} w={row.ifW} color={row.ifColor} text={row.ifText} />
          <Pill x={230 + row.ifW + 16} y={row.y - 4} w={row.resW} color={row.resColor} text={row.resText} />
        </g>
      ))}

      <text {...CAPTION} x={450} y={286} textAnchor="middle">
        Той самий вимикач. Міняється не подія — міняється, наскільки ви в неї вірите.
      </text>
    </svg>
  );
}

/**
 * Зсув на крок назад: реальність і граматика стоять у різних колонках.
 * Схема для розділу про Second: past simple тут — не про минуле.
 */
export function TimeShift() {
  return (
    <svg
      viewBox="0 0 900 190"
      role="img"
      aria-label="Уявність зсуває час на крок назад: теперішнє говорить минулим часом, минуле — Past Perfect"
    >
      <text {...LABEL} x={140} y={28} textAnchor="middle" fill="var(--ink-3)">
        ПРО ЩО ГОВОРИМО
      </text>
      <text {...LABEL} x={640} y={28} textAnchor="middle" fill="var(--ink-3)">
        ЯКИМ ЧАСОМ ГОВОРИМО
      </text>

      <Pill x={40} y={48} w={200} color="present" text="сьогодні / завтра" />
      <Pill x={540} y={48} w={200} color="past" text="Past Simple" />
      <path d="M 250 65 H 528" stroke="var(--line-strong)" strokeWidth={2} fill="none" />
      <polygon points="536,65 524,59 524,71" fill="var(--line-strong)" />
      <text {...SUB} x={390} y={58} textAnchor="middle">
        крок назад
      </text>

      <Pill x={40} y={118} w={200} color="past" text="учора / тоді" />
      <Pill x={540} y={118} w={200} color="perfect" text="Past Perfect" />
      <path d="M 250 135 H 528" stroke="var(--line-strong)" strokeWidth={2} fill="none" />
      <polygon points="536,135 524,129 524,141" fill="var(--line-strong)" />
      <text {...SUB} x={390} y={128} textAnchor="middle">
        крок назад
      </text>

      <text {...CAPTION} x={450} y={182} textAnchor="middle">
        Далі відступати нікуди: глибше за Past Perfect минулого немає, тому типів лише чотири.
      </text>
    </svg>
  );
}

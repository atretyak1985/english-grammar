/**
 * Схеми теми «Побудова речення». Кольори — на змінних теми, тому та сама
 * схема правильно виглядає і в світлій, і в темній темі.
 *
 * Колір тут означає РОЛЬ у реченні, а не вид дієслова: синій — підмет,
 * кораловий — присудок, фіолетовий — додаток, зелений — місце, жовтий — час.
 * Це інша вісь, ніж наскрізний код часів у застосунку, тому кожна схема
 * підписує свої кольори сама і поза цим файлом вони нічого не означають.
 */

const ROLE = {
  s: { fill: 'var(--ps-bg)', stroke: 'var(--ps)', text: 'var(--ps-dk)' },
  v: { fill: 'var(--coral-bg)', stroke: 'var(--coral)', text: 'var(--coral-dk)' },
  o: { fill: 'var(--pp-bg)', stroke: 'var(--pp)', text: 'var(--pp-dk)' },
  m: { fill: 'var(--ok-bg)', stroke: 'var(--ok)', text: 'var(--green-tx)' },
  t: { fill: 'var(--yellow-bg)', stroke: 'var(--yellow-dk)', text: 'var(--yellow-tx)' },
} as const;

type RoleKey = keyof typeof ROLE;

const LABEL = { fontSize: 12, fontWeight: 800, fontFamily: 'sans-serif' } as const;
const SUB = { fontSize: 10.5, fontWeight: 700, fontFamily: 'sans-serif', fill: 'var(--ink-3)' } as const;
const WORD = { fontSize: 14, fontWeight: 700, fontFamily: 'serif', fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;

/** Цеглинка-слот: заокруглений прямокутник із двома «пухирцями» Лего згори. */
function Brick({
  x,
  w,
  role,
  label,
  sub,
}: {
  x: number;
  w: number;
  role: RoleKey;
  label: string;
  sub: string;
}) {
  const c = ROLE[role];
  const stud = (w - 44) / 3;

  return (
    <>
      <rect x={x + stud} y={16} width={22} height={12} rx={4} fill={c.stroke} opacity={0.55} />
      <rect x={x + stud * 2 + 22} y={16} width={22} height={12} rx={4} fill={c.stroke} opacity={0.55} />
      <rect x={x} y={26} width={w} height={54} rx={10} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <text {...LABEL} x={x + w / 2} y={49} textAnchor="middle" fill={c.text}>
        {label}
      </text>
      <text {...SUB} x={x + w / 2} y={68} textAnchor="middle">
        {sub}
      </text>
    </>
  );
}

const SLOTS: { x: number; w: number; role: RoleKey; label: string; sub: string }[] = [
  { x: 20, w: 140, role: 's', label: 'ХТО', sub: 'підмет' },
  { x: 172, w: 150, role: 'v', label: 'РОБИТЬ', sub: 'присудок' },
  { x: 334, w: 190, role: 'o', label: 'ЩО / КОГО', sub: 'додаток' },
  { x: 536, w: 170, role: 'm', label: 'ДЕ', sub: 'місце' },
  { x: 718, w: 162, role: 't', label: 'КОЛИ', sub: 'час' },
];

/** Рядок прикладу, слова вирівняні по центрах слотів. */
function ExampleRow({ y, words }: { y: number; words: readonly (string | null)[] }) {
  return (
    <>
      {SLOTS.map((slot, index) => {
        const word = words[index];
        if (!word) return null;
        return (
          <text key={slot.label} {...WORD} x={slot.x + slot.w / 2} y={y} textAnchor="middle">
            {word}
          </text>
        );
      })}
    </>
  );
}

/**
 * Потяг слотів — базова схема ствердження. Пʼять цеглинок, під ними два
 * готові речення: видно, що слова змінюються, а гнізда стоять на місці.
 */
export function SlotTrain() {
  return (
    <svg viewBox="0 0 900 220" role="img" aria-label="Пʼять слотів англійського речення: хто, робить, що, де, коли">
      {SLOTS.map((slot) => (
        <Brick key={slot.label} {...slot} />
      ))}
      <ExampleRow y={122} words={['Anna', 'sends', 'the invoice', 'from the office', 'every Friday.']} />
      <ExampleRow y={152} words={['We', 'tested', 'the new build', 'in the lab', 'yesterday.']} />
      <ExampleRow y={182} words={['I', 'left', 'the keys', 'at the warehouse.', null]} />
      <text {...CAPTION} x={450} y={210} textAnchor="middle">
        Слоти не рухаються. Порожній слот просто пропускають — але не переставляють.
      </text>
    </svg>
  );
}

/**
 * Дзеркальна пара: ті самі три слова, поміняли місцями — і пес із котом
 * помінялися ролями. Український інструмент («закінчення скаже, хто кого»)
 * тут не працює, бо закінчень немає.
 */
export function FlipMeaning() {
  const row = (y: number, subject: string, object: string) => (
    <>
      <rect x={130} y={y - 26} width={170} height={38} rx={9} fill={ROLE.s.fill} stroke={ROLE.s.stroke} strokeWidth={2} />
      <text {...WORD} x={215} y={y} textAnchor="middle">
        {subject}
      </text>
      <rect x={320} y={y - 26} width={90} height={38} rx={9} fill={ROLE.v.fill} stroke={ROLE.v.stroke} strokeWidth={2} />
      <text {...WORD} x={365} y={y} textAnchor="middle">
        sees
      </text>
      <rect x={430} y={y - 26} width={170} height={38} rx={9} fill={ROLE.o.fill} stroke={ROLE.o.stroke} strokeWidth={2} />
      <text {...WORD} x={515} y={y} textAnchor="middle">
        {object}
      </text>
    </>
  );

  return (
    <svg viewBox="0 0 900 220" role="img" aria-label="The dog sees the cat проти The cat sees the dog — зміст перевернувся разом із порядком">
      <text {...LABEL} x={215} y={22} textAnchor="middle" fill={ROLE.s.text}>
        ХТО (діяч)
      </text>
      <text {...LABEL} x={515} y={22} textAnchor="middle" fill={ROLE.o.text}>
        КОГО (об’єкт)
      </text>

      {row(66, 'The dog', 'the cat')}
      <text {...CAPTION} x={640} y={70}>
        Пес — мисливець, кіт — жертва.
      </text>

      {row(140, 'The cat', 'the dog')}
      <text {...CAPTION} x={640} y={144}>
        Ті самі слова. Ролі — навпаки.
      </text>

      <text {...CAPTION} x={450} y={200} textAnchor="middle">
        Жодне закінчення не змінилось, бо їх немає. Хто діяч — сказало саме місце в реченні.
      </text>
    </svg>
  );
}

/**
 * Інверсія в питанні: допоміжне дієслово перестрибує через підмет.
 * Дві доріжки, бо випадки різні: у be / have / will / can двигун уже стоїть
 * у реченні, а Present / Past Simple мусять викликати do.
 */
export function InversionScheme() {
  const arrow = (fromX: number, toX: number, y: number, id: string) => (
    <>
      <defs>
        <marker id={id} markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto" fill="var(--coral)">
          <path d="M0,0 L8,4 L0,8 z" />
        </marker>
      </defs>
      <path
        d={`M ${fromX} ${y} C ${fromX} ${y - 34}, ${toX} ${y - 34}, ${toX} ${y}`}
        fill="none"
        stroke="var(--coral)"
        strokeWidth={2.2}
        strokeDasharray="5 4"
        markerEnd={`url(#${id})`}
      />
    </>
  );

  return (
    <svg viewBox="0 0 900 300" role="img" aria-label="Питання будується інверсією: допоміжне дієслово переходить наперед">
      <text {...LABEL} x={20} y={26} fill="var(--ink-2)">
        ДВИГУН УЖЕ Є (be, have, will, can…) — просто переставити
      </text>
      <text {...WORD} x={20} y={72}>
        You <tspan fill="var(--coral)" fontWeight={800}>have</tspan> seen it.
      </text>
      {arrow(66, 320, 58, 'arw-inv-have')}
      <text {...WORD} x={320} y={72}>
        <tspan fill="var(--coral)" fontWeight={800}>Have</tspan> you seen it?
      </text>
      <text {...CAPTION} x={20} y={98}>
        Допоміжне перестрибнуло через підмет — це і є все «правило питань».
      </text>

      <line x1={20} y1={126} x2={880} y2={126} stroke="var(--line)" strokeWidth={2} />

      <text {...LABEL} x={20} y={156} fill="var(--ink-2)">
        ДВИГУНА НЕМА (Present / Past Simple) — приїжджає do / does / did
      </text>
      <text {...WORD} x={20} y={202}>
        She like<tspan fill="var(--coral)" fontWeight={800}>s</tspan> tea.
      </text>
      {arrow(118, 320, 188, 'arw-inv-do')}
      <text {...WORD} x={320} y={202}>
        <tspan fill="var(--coral)" fontWeight={800}>Does</tspan> she like tea?
      </text>
      <text {...CAPTION} x={20} y={228}>
        Граматика (-s, минулий час) переїздить у do: does = do + s, did = do в минулому.
      </text>
      <text {...CAPTION} x={20} y={276}>
        Тому після does та did дієслово завжди в початковій формі: ✗ Does she likes… · ✗ Did you went…
      </text>
    </svg>
  );
}

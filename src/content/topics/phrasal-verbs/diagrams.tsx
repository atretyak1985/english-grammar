/**
 * Схеми теми «Фразові дієслова». Кольори — на змінних теми, тому та сама
 * схема правильно виглядає і в світлій, і в темній темі.
 *
 * Колірний код усередині теми повторює метафору теми, а не вид дієслова:
 * синій — дієслово (напрямок) і клас «розділюване», бурштиновий — частка
 * (маршрут), фіолетовий — клас «нерозділюване». Зелений і кораловий лишаються
 * тим, чим вони є всюди в застосунку: ✓ правильно і ✗ так не кажуть.
 * Тема не про час, тому TenseKey тут немає й бути не може, а ці кольори поза
 * цим файлом нічого не означають.
 */

const TITLE = { fontSize: 14, fontWeight: 800, fontFamily: 'sans-serif' } as const;
const TEXT = { fontFamily: 'sans-serif', fontSize: 13.5, fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;
const LABEL = {
  fontFamily: 'sans-serif',
  fontSize: 12,
  fill: 'var(--ink-3)',
  fontWeight: 700,
} as const;
const WORD = { fontFamily: 'serif', fontSize: 15, fontWeight: 700, fill: 'var(--ink)' } as const;

/* ============================================================
   1 · idea — компас частки
   ============================================================ */

const COMPASS_CENTER = { x: 450, y: 282 } as const;
const NODE_W = 200;
const NODE_H = 62;

type CompassNode = { cx: number; cy: number; particle: string; ua: string };

/** Вісім маршрутів одного дієслова. Порядок — за колом, від верхньої точки. */
const COMPASS_NODES: readonly CompassNode[] = [
  { cx: 450, cy: 58, particle: 'up', ua: 'зайнятися; забрати час' },
  { cx: 742, cy: 134, particle: 'out', ua: 'винести; витягти' },
  { cx: 790, cy: 282, particle: 'on', ua: 'узяти на себе' },
  { cx: 742, cy: 430, particle: 'over', ua: 'перебрати справи' },
  { cx: 450, cy: 506, particle: 'back', ua: 'забрати слова назад' },
  { cx: 158, cy: 430, particle: 'in', ua: 'вбирати; збагнути' },
  { cx: 110, cy: 282, particle: 'off', ua: 'злетіти; зняти' },
  { cx: 158, cy: 134, particle: 'after', ua: 'удатися в когось' },
];

/** Промінь від кола в центрі до межі картки: старт на радіусі, фініш із зазором. */
function spoke(node: CompassNode) {
  const dx = node.cx - COMPASS_CENTER.x;
  const dy = node.cy - COMPASS_CENTER.y;
  const len = Math.hypot(dx, dy);
  const gap = 10;
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : (NODE_W / 2 + gap) / Math.abs(dx);
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : (NODE_H / 2 + gap) / Math.abs(dy);
  const t = Math.min(tx, ty);

  return {
    x1: COMPASS_CENTER.x + (dx / len) * 70,
    y1: COMPASS_CENTER.y + (dy / len) * 70,
    x2: node.cx - dx * t,
    y2: node.cy - dy * t,
  };
}

/**
 * Компас частки: одне дієслово в центрі, вісім часток врізнобіч — і вісім
 * різних українських значень на кінцях. Візуальна теза теми: дієслово задає
 * напрямок, а куди саме ви приїдете, вирішує частка.
 */
export function ParticleCompass() {
  return (
    <svg
      viewBox="0 0 900 570"
      role="img"
      aria-label="Дієслово take в центрі, вісім часток навколо — і вісім різних значень"
    >
      <defs>
        <marker
          id="pv-route"
          markerWidth="9"
          markerHeight="9"
          refX="7"
          refY="3.5"
          orient="auto"
          fill="var(--pc)"
        >
          <path d="M0,0 L7,3.5 L0,7 z" />
        </marker>
      </defs>

      {COMPASS_NODES.map((node) => {
        const s = spoke(node);
        return (
          <line
            key={`route-${node.particle}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="var(--pc)"
            strokeWidth={2}
            markerEnd="url(#pv-route)"
          />
        );
      })}

      {COMPASS_NODES.map((node) => (
        <g key={node.particle}>
          <rect
            x={node.cx - NODE_W / 2}
            y={node.cy - NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            rx={11}
            fill="var(--surface)"
            stroke="var(--line-strong)"
            strokeWidth={1.6}
          />
          <text {...WORD} x={node.cx} y={node.cy - 4} textAnchor="middle">
            take <tspan fill="var(--pc-dk)" fontWeight={800}>{node.particle}</tspan>
          </text>
          <text {...CAPTION} x={node.cx} y={node.cy + 17} textAnchor="middle">
            {node.ua}
          </text>
        </g>
      ))}

      <circle
        cx={COMPASS_CENTER.x}
        cy={COMPASS_CENTER.y}
        r={62}
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth={2.5}
      />
      <text
        x={COMPASS_CENTER.x}
        y={COMPASS_CENTER.y - 2}
        textAnchor="middle"
        fontFamily="serif"
        fontSize="30"
        fontWeight="800"
        fill="var(--ps-dk)"
      >
        take
      </text>
      <text {...CAPTION} x={COMPASS_CENTER.x} y={COMPASS_CENTER.y + 22} textAnchor="middle">
        напрямок
      </text>

      <text {...CAPTION} x={450} y={556} textAnchor="middle" fontStyle="italic">
        одне дієслово в словнику — вісім різних дієслів у мові; різницю зробила частка
      </text>
    </svg>
  );
}

/* ============================================================
   2 · types — чотири типи
   ============================================================ */

const ROW_H = 92;

const VERDICT = {
  move: { fill: 'var(--ps-bg)', stroke: 'var(--ps)', text: 'var(--ps-dk)' },
  stay: { fill: 'var(--pp-bg)', stroke: 'var(--pp)', text: 'var(--pp-dk)' },
  none: { fill: 'var(--surface-2)', stroke: 'var(--line-strong)', text: 'var(--ink-2)' },
} as const;

type TypeRow = {
  y: number;
  name: string;
  sub: string;
  schema: readonly string[];
  example: readonly string[];
  verdict: string;
  tone: keyof typeof VERDICT;
};

const TYPE_ROWS: readonly TypeRow[] = [
  {
    y: 36,
    name: '① Неперехідні',
    sub: 'додатка немає взагалі',
    schema: ['дієслово + частка'],
    example: ['The build server broke down.', 'The plane took off an hour late.'],
    verdict: 'НЕМА ЧОМУ',
    tone: 'none',
  },
  {
    y: 138,
    name: '② Розділювані',
    sub: 'частка, не прийменник',
    schema: ['дієслово + частка + додаток', 'або дієслово + додаток + частка'],
    example: ['turn off the light · turn the light off', 'turn it off ✓ · turn off it ✗'],
    verdict: 'РУХАЄТЬСЯ',
    tone: 'move',
  },
  {
    y: 240,
    name: '③ Нерозділювані',
    sub: 'прийменник, не частка',
    schema: ['дієслово + прийменник', '+ додаток'],
    example: ['look after the kids · look after them', 'look them after ✗'],
    verdict: 'НЕ РУХАЄТЬСЯ',
    tone: 'stay',
  },
  {
    y: 342,
    name: '④ Тричастинні',
    sub: 'частка + прийменник',
    schema: ['дієслово + частка', '+ прийменник + додаток'],
    example: ['I can’t put up with the noise.', 'put it up with ✗ · put up it with ✗'],
    verdict: 'НЕ РУХАЄТЬСЯ',
    tone: 'stay',
  },
];

/** Рядок тексту, вирівняний по вертикальному центру рядка таблиці. */
function rowLineY(top: number, index: number, total: number, step: number) {
  return top + ROW_H / 2 + 5 + (index - (total - 1) / 2) * step;
}

/**
 * Чотири типи одним екраном: схема, живий приклад і головне питання —
 * чи можна взагалі щось поставити між дієсловом і часткою.
 */
export function FourTypes() {
  return (
    <svg
      viewBox="0 0 900 470"
      role="img"
      aria-label="Чотири типи фразових дієслів: схема, приклад і чи рухається додаток"
    >
      <text {...LABEL} x={40} y={22}>
        ТИП
      </text>
      <text {...LABEL} x={200} y={22}>
        СХЕМА
      </text>
      <text {...LABEL} x={450} y={22}>
        ПРИКЛАД
      </text>
      <text {...LABEL} x={811} y={22} textAnchor="middle">
        ДОДАТОК РУХАЄТЬСЯ?
      </text>

      {TYPE_ROWS.map((row) => {
        const tone = VERDICT[row.tone];
        return (
          <g key={row.name}>
            <rect
              x={20}
              y={row.y}
              width={860}
              height={ROW_H}
              rx={12}
              fill="var(--surface-2)"
              stroke="var(--line-strong)"
              strokeWidth={1.5}
            />

            <text
              {...TEXT}
              x={40}
              y={rowLineY(row.y, 0, 2, 20)}
              fontWeight={800}
              fill="var(--ink-2)"
            >
              {row.name}
            </text>
            <text {...CAPTION} x={40} y={rowLineY(row.y, 1, 2, 20)}>
              {row.sub}
            </text>

            {row.schema.map((line, index) => (
              <text
                key={line}
                {...CAPTION}
                x={200}
                y={rowLineY(row.y, index, row.schema.length, 20)}
                fill="var(--ink-2)"
                fontWeight={700}
              >
                {line}
              </text>
            ))}

            {row.example.map((line, index) => (
              <text
                key={line}
                {...WORD}
                x={450}
                y={rowLineY(row.y, index, row.example.length, 22)}
                fontSize={13.5}
              >
                {line}
              </text>
            ))}

            <rect
              x={745}
              y={row.y + 25}
              width={132}
              height={42}
              rx={10}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={1.5}
            />
            <text
              x={811}
              y={row.y + 51}
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="12.5"
              fontWeight="800"
              fill={tone.text}
            >
              {row.verdict}
            </text>
          </g>
        );
      })}

      <text {...CAPTION} x={450} y={460} textAnchor="middle" fontStyle="italic">
        тип — властивість значення, а не написання: make up «вигадати» розділюється, make up
        «становити» — ні
      </text>
    </svg>
  );
}

/* ============================================================
   3 · placement — куди ставити додаток
   ============================================================ */

const OK_BOX = { fill: 'var(--ok-bg)', stroke: 'var(--ok)', strokeWidth: 1.5 } as const;
const NO_BOX = { fill: 'var(--no-bg)', stroke: 'var(--no)', strokeWidth: 1.5 } as const;
const MEH_BOX = { fill: 'var(--yellow-bg)', stroke: 'var(--yellow-dk)', strokeWidth: 1.5 } as const;
const MARK = { fontFamily: 'sans-serif', fontSize: 20, fontWeight: 800 } as const;
const SENTENCE = { fontFamily: 'serif', fontSize: 17, fontWeight: 700, fill: 'var(--ink)' } as const;

/**
 * Правило займенника як картинка: три ваги додатка — займенник, короткий
 * іменник, важка група — і три різні відповіді на те саме питання «куди».
 */
export function PlacementRule() {
  return (
    <svg
      viewBox="0 0 900 440"
      role="img"
      aria-label="turn it off правильно, turn off it неправильно; довгий додаток іде після частки"
    >
      <text {...LABEL} x={20} y={22} fill="var(--ink-2)">
        ДОДАТОК — ЗАЙМЕННИК: тільки посередині, без винятків
      </text>

      <rect {...OK_BOX} x={20} y={34} width={420} height={68} rx={12} />
      <text {...MARK} x={42} y={65} fill="var(--ok)">
        ✓
      </text>
      <text {...SENTENCE} x={68} y={65}>
        turn <tspan fill="var(--ok)" fontWeight={800}>it</tspan> off
      </text>
      <text {...CAPTION} x={68} y={88}>
        займенник завжди між дієсловом і часткою
      </text>

      <rect {...NO_BOX} x={460} y={34} width={420} height={68} rx={12} />
      <text {...MARK} x={482} y={65} fill="var(--no)">
        ✗
      </text>
      <text {...SENTENCE} x={508} y={65}>
        turn off <tspan fill="var(--no)" fontWeight={800}>it</tspan>
      </text>
      <text {...CAPTION} x={508} y={88}>
        так не кажуть ніколи — помилка №1 усієї теми
      </text>

      <text {...LABEL} x={20} y={132} fill="var(--ink-2)">
        ДОДАТОК — КОРОТКИЙ ІМЕННИК: живі обидва порядки
      </text>

      <rect {...OK_BOX} x={20} y={144} width={420} height={68} rx={12} />
      <text {...MARK} x={42} y={175} fill="var(--ok)">
        ✓
      </text>
      <text {...SENTENCE} x={68} y={175}>
        turn off the light
      </text>
      <text {...CAPTION} x={68} y={198}>
        нове, наголошене — після частки
      </text>

      <rect {...OK_BOX} x={460} y={144} width={420} height={68} rx={12} />
      <text {...MARK} x={482} y={175} fill="var(--ok)">
        ✓
      </text>
      <text {...SENTENCE} x={508} y={175}>
        turn the light off
      </text>
      <text {...CAPTION} x={508} y={198}>
        уже відоме обом — усередину
      </text>

      <text {...LABEL} x={20} y={242} fill="var(--ink-2)">
        ДОДАТОК ВАЖКИЙ: частка тримається дієслова
      </text>

      <rect {...OK_BOX} x={20} y={254} width={860} height={68} rx={12} />
      <text {...MARK} x={42} y={285} fill="var(--ok)">
        ✓
      </text>
      <text {...SENTENCE} x={68} y={285}>
        Turn off the light in the corridor we installed yesterday.
      </text>
      <text {...CAPTION} x={68} y={308}>
        частка поруч із дієсловом — речення читається з першого разу
      </text>

      <rect {...MEH_BOX} x={20} y={336} width={860} height={68} rx={12} />
      <text {...MARK} x={42} y={367} fill="var(--yellow-tx)">
        ≈
      </text>
      <text {...SENTENCE} x={68} y={367}>
        Turn the light in the corridor we installed yesterday off.
      </text>
      <text {...CAPTION} x={68} y={390} fill="var(--yellow-tx)">
        граматично бездоганно — і так ніхто не говорить: вісім слів між дієсловом і часткою
      </text>

      <text {...CAPTION} x={450} y={428} textAnchor="middle" fontStyle="italic">
        що довший додаток — то певніше він іде після частки
      </text>
    </svg>
  );
}

/* ============================================================
   17 · cheatsheet — пʼять тестів на розділюваність
   ============================================================ */

const QUESTION = {
  fill: 'var(--surface-2)',
  stroke: 'var(--line-strong)',
  strokeWidth: 1.5,
} as const;
const FLOW_LINE = { stroke: 'var(--line-strong)', strokeWidth: 1.8, fill: 'none' } as const;

type FlowQuestion = { y: number; head: string; body: string };

const FLOW_QUESTIONS: readonly FlowQuestion[] = [
  { y: 10, head: '① Три слова?', body: 'put up with · come up with · look forward to' },
  {
    y: 112,
    head: '② Живе без додатка — у цьому ж значенні?',
    body: 'The plane took off. ✓ · I looked after. ✗',
  },
  {
    y: 214,
    head: '③ Наголос падає на дієслово?',
    body: 'так: LOOK after them · DEAL with it · ні: turn it OFF',
  },
  {
    y: 316,
    head: '④ Додаток змінює стан?',
    body: 'рухається, зникає, вимикається — щось із ним стається',
  },
];

type Outcome = {
  x: number;
  y: number;
  title: string;
  note: string;
  example: string;
  tone: 'move' | 'stay';
};

const FLOW_OUTCOMES: readonly Outcome[] = [
  {
    x: 640,
    y: 96,
    title: 'НЕРОЗДІЛЮВАНЕ',
    note: 'три слова — середини немає',
    example: 'I can’t put up with it.',
    tone: 'stay',
  },
  {
    x: 20,
    y: 198,
    title: 'РОЗДІЛЮВАНЕ',
    note: 'off — частка, отже є середина',
    example: 'take your coat off ✓',
    tone: 'move',
  },
  {
    x: 640,
    y: 300,
    title: 'НЕРОЗДІЛЮВАНЕ',
    note: 'наголос на дієслові — прийменник',
    example: 'look them after ✗',
    tone: 'stay',
  },
  {
    x: 20,
    y: 402,
    title: 'РОЗДІЛЮВАНЕ',
    note: 'частка змінює сам додаток',
    example: 'turn it off · throw it away',
    tone: 'move',
  },
];

/**
 * Пʼять тестів як один прохід згори вниз. Перші чотири відповідають самі,
 * пʼятий — словникова нотація — лишається останньою інстанцією, коли перші
 * чотири не зійшлися.
 */
export function SeparabilityTests() {
  return (
    <svg
      viewBox="0 0 900 630"
      role="img"
      aria-label="Пʼять тестів на розділюваність: від трьох слів до словникової нотації"
    >
      {FLOW_QUESTIONS.map((question) => (
        <g key={question.head}>
          <rect {...QUESTION} x={280} y={question.y} width={340} height={52} rx={10} />
          <text {...TEXT} x={450} y={question.y + 22} textAnchor="middle" fontWeight={700}>
            {question.head}
          </text>
          <text {...CAPTION} x={450} y={question.y + 41} textAnchor="middle">
            {question.body}
          </text>
        </g>
      ))}

      {/* хребет: «ні» веде до наступного тесту */}
      <path {...FLOW_LINE} d="M450 62 L450 112" />
      <path {...FLOW_LINE} d="M450 164 L450 214" />
      <path {...FLOW_LINE} d="M450 266 L450 316" />
      <path {...FLOW_LINE} d="M450 368 L450 506" />
      <text {...LABEL} x={466} y={94}>
        НІ
      </text>
      <text {...LABEL} x={466} y={196}>
        НІ
      </text>
      <text {...LABEL} x={466} y={298}>
        НІ
      </text>
      <text {...LABEL} x={466} y={444}>
        НЕ ЗІЙШЛОСЯ
      </text>

      {/* виходи «так»: непарні тести — праворуч, парні — ліворуч */}
      <path {...FLOW_LINE} d="M620 36 L760 36 L760 96" />
      <path {...FLOW_LINE} d="M280 138 L140 138 L140 198" />
      <path {...FLOW_LINE} d="M620 240 L760 240 L760 300" />
      <path {...FLOW_LINE} d="M280 342 L140 342 L140 402" />
      <text {...LABEL} x={660} y={29}>
        ТАК
      </text>
      <text {...LABEL} x={210} y={131}>
        ТАК
      </text>
      <text {...LABEL} x={660} y={233}>
        ТАК
      </text>
      <text {...LABEL} x={210} y={335}>
        ТАК
      </text>

      {FLOW_OUTCOMES.map((outcome) => {
        const tone = VERDICT[outcome.tone];
        return (
          <g key={`${outcome.title}-${outcome.y}`}>
            <rect
              x={outcome.x}
              y={outcome.y}
              width={240}
              height={76}
              rx={10}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={1.5}
            />
            <text
              {...TITLE}
              x={outcome.x + 120}
              y={outcome.y + 26}
              textAnchor="middle"
              fill={tone.text}
            >
              {outcome.title}
            </text>
            <text {...CAPTION} x={outcome.x + 120} y={outcome.y + 47} textAnchor="middle">
              {outcome.note}
            </text>
            <text
              {...WORD}
              x={outcome.x + 120}
              y={outcome.y + 67}
              textAnchor="middle"
              fontSize={12.5}
            >
              {outcome.example}
            </text>
          </g>
        );
      })}

      <rect
        x={110}
        y={506}
        width={680}
        height={68}
        rx={12}
        fill="var(--surface-2)"
        stroke="var(--line-strong)"
        strokeWidth={1.5}
      />
      <text {...TEXT} x={450} y={532} textAnchor="middle" fontWeight={800}>
        ⑤ Останнє слово — словникова нотація
      </text>
      <text {...CAPTION} x={450} y={554} textAnchor="middle">
        turn sth off — розділюване · look after sb/sth — нерозділюване · put up with sb/sth — три
        слова
      </text>

      <text {...CAPTION} x={450} y={604} textAnchor="middle" fontStyle="italic">
        тести класифікують значення, а не написання: get over the fence і get over the flu — різні
        дієслова
      </text>
    </svg>
  );
}

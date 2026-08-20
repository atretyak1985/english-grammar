/**
 * Схеми теми «Майбутні часи». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 *
 * Колір читається як вид: синій — Simple, помаранчевий — Continuous,
 * фіолетовий — Perfect. Той самий код, що в минулих і теперішніх часах.
 */

function Arrow({ id, color = 'var(--ink-3)' }: { id: string; color?: string }) {
  return (
    <defs>
      <marker
        id={id}
        markerWidth="10"
        markerHeight="10"
        refX="8"
        refY="4"
        orient="auto"
        fill={color}
      >
        <path d="M0,0 L8,4 L0,8 z" />
      </marker>
    </defs>
  );
}

const LANE = { stroke: 'var(--line)', strokeWidth: 2 } as const;
const LANE_TITLE = {
  fontSize: 13,
  fontWeight: 800,
  fill: 'var(--ink-2)',
  fontFamily: 'sans-serif',
} as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;

/** Вертикаль «ЗАРАЗ» — точка, від якої все майбутнє й відлічується. */
function NowLine({
  x,
  y1,
  y2,
  label = true,
}: {
  x: number;
  y1: number;
  y2: number;
  label?: boolean;
}) {
  return (
    <>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />
      {label ? (
        <text
          x={x + 9}
          y={y1 + 12}
          fontSize="13"
          fontWeight="700"
          fill="var(--ink)"
          fontFamily="sans-serif"
        >
          ЗАРАЗ
        </text>
      ) : null}
    </>
  );
}

/**
 * Чотири способи сказати про ту саму подію в майбутньому. Схема навмисно
 * показує не різні моменти, а різні ПІДСТАВИ: сама подія стоїть на однаковій
 * відстані, а відрізняється те, звідки взялася впевненість у ній.
 */
export function TimelineAll() {
  const lanes = [
    {
      y: 74,
      title: 'will — рішення ухвалене саме зараз',
      colour: 'var(--ps)',
      dk: 'var(--ps-dk)',
      caption: 'OK, I will call them. — рішення народилося в цю мить',
    },
    {
      y: 158,
      title: 'be going to — рішення ухвалене раніше',
      colour: 'var(--ps)',
      dk: 'var(--ps-dk)',
      caption: "I'm going to call them. — намір уже був, коли я почав говорити",
    },
    {
      y: 242,
      title: 'Present Continuous — домовлено, дата в календарі',
      colour: 'var(--pc)',
      dk: 'var(--pc-dk)',
      caption: "I'm calling them at four. — час узгоджений з іншою людиною",
    },
    {
      y: 326,
      title: 'Present Simple — розклад, не моє рішення взагалі',
      colour: 'var(--pc)',
      dk: 'var(--pc-dk)',
      caption: 'The call starts at four. — так у програмі',
    },
  ];

  return (
    <svg viewBox="0 0 900 360" role="img" aria-label="Чотири способи сказати про майбутнє">
      <Arrow id="arw-fut-all" />
      {lanes.map((lane) => (
        <g key={lane.y}>
          <text {...LANE_TITLE} x="60" y={lane.y - 22} fill={lane.dk}>
            {lane.title}
          </text>
          <line
            {...LANE}
            x1="60"
            y1={lane.y}
            x2="860"
            y2={lane.y}
            markerEnd="url(#arw-fut-all)"
          />
          <NowLine x={300} y1={lane.y - 16} y2={lane.y + 16} label={false} />
          <circle cx="640" cy={lane.y} r="8" fill={lane.colour} />
          <text {...CAPTION} x="60" y={lane.y + 26}>
            {lane.caption}
          </text>
        </g>
      ))}
      <text
        x="309"
        y="34"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="sans-serif"
      >
        ЗАРАЗ
      </text>
      <text {...CAPTION} x="600" y="34" fontStyle="italic">
        подія в усіх чотирьох однакова — різне те, звідки взялася впевненість
      </text>
    </svg>
  );
}

/**
 * Головна пастка теми: рішення ухвалене в момент мовлення чи раніше. Саме це
 * питання, а не «наскільки далеко подія», вирішує вибір між will і going to.
 */
export function WillVsGoingTo() {
  return (
    <svg viewBox="0 0 900 300" role="img" aria-label="will проти going to: коли ухвалене рішення">
      <Arrow id="arw-fut-vs" color="var(--ps)" />

      <text {...LANE_TITLE} x="40" y="28" fill="var(--ps-dk)">
        WILL — рішення народжується в момент мовлення
      </text>
      <line {...LANE} x1="60" y1="96" x2="860" y2="96" />
      <NowLine x={420} y1={62} y2={130} />
      <circle cx="420" cy="96" r="9" fill="var(--ps)" />
      <path
        d="M 428 88 Q 550 56 690 88"
        stroke="var(--ps)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="5 4"
        markerEnd="url(#arw-fut-vs)"
      />
      <circle cx="700" cy="96" r="8" fill="var(--ps)" opacity=".45" />
      <text {...CAPTION} x="559" y="52" textAnchor="middle" fill="var(--ps-dk)">
        рішення й слова — одночасно
      </text>
      <text {...CAPTION} x="60" y="146">
        {'— The printer is broken. — OK, I will call support. ← вирішив, поки говорив'}
      </text>

      <text {...LANE_TITLE} x="40" y="206" fill="var(--pp)">
        BE GOING TO — рішення вже стояло до розмови
      </text>
      <line {...LANE} x1="60" y1="252" x2="860" y2="252" />
      <circle cx="180" cy="252" r="8" fill="var(--pp)" />
      <text {...CAPTION} x="180" y="238" textAnchor="middle" fill="var(--pp)" fontWeight="700">
        тут вирішив
      </text>
      <NowLine x={420} y1={222} y2={282} label={false} />
      <text {...CAPTION} x="429" y="234" fontWeight="700" fill="var(--ink)">
        ЗАРАЗ кажу
      </text>
      <circle cx="700" cy="252" r="8" fill="var(--pp)" opacity=".45" />
      <text {...CAPTION} x="60" y="292">
        {"— Why the toolbox? — I'm going to fix the printer. ← намір був раніше"}
      </text>
    </svg>
  );
}

/** Future Continuous: процес, який триватиме в названий майбутній момент. */
export function TimelineFutureContinuous() {
  return (
    <svg viewBox="0 0 900 250" role="img" aria-label="Два випадки вживання Future Continuous">
      <text {...LANE_TITLE} x="40" y="26">
        1 · ПРОЦЕС У НАЗВАНИЙ МОМЕНТ МАЙБУТНЬОГО
      </text>
      <line {...LANE} x1="60" y1="84" x2="860" y2="84" />
      <NowLine x={200} y1={58} y2={110} />
      <line
        x1="450"
        y1="84"
        x2="740"
        y2="84"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line x1="595" y1="64" x2="595" y2="104" stroke="var(--ink)" strokeWidth="2.5" />
      <text {...CAPTION} x="595" y="58" textAnchor="middle" fill="var(--ink)" fontWeight="700">
        at 10 tomorrow
      </text>
      <text {...CAPTION} x="60" y="128">
        {"At 10 tomorrow I'll be running the migration. — почнеться раніше, скінчиться пізніше"}
      </text>

      <text {...LANE_TITLE} x="40" y="188">
        2 · ВВІЧЛИВЕ ПИТАННЯ ПРО ЧУЖІ ПЛАНИ — без натиску
      </text>
      <line {...LANE} x1="60" y1="216" x2="860" y2="216" />
      <NowLine x={200} y1={196} y2={236} label={false} />
      <line
        x1="480"
        y1="216"
        x2="700"
        y2="216"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".7"
      />
      <text {...CAPTION} x="60" y="242">
        {'Will you be using the meeting room? — питаю про обставини, а не прошу поступитися'}
      </text>
    </svg>
  );
}

/** Future Perfect: дія завершиться ДО названої майбутньої точки. */
export function TimelineFuturePerfect() {
  return (
    <svg viewBox="0 0 900 260" role="img" aria-label="Future Perfect і Future Perfect Continuous">
      <Arrow id="arw-fut-perf" color="var(--pp)" />

      <text {...LANE_TITLE} x="40" y="26" fill="var(--pp)">
        FUTURE PERFECT — буде вже зроблено до майбутньої точки
      </text>
      <line {...LANE} x1="60" y1="96" x2="860" y2="96" />
      <NowLine x={180} y1={66} y2={126} />
      <circle cx="450" cy="96" r="8" fill="var(--pp)" />
      <text {...CAPTION} x="450" y="82" textAnchor="middle" fill="var(--pp)">
        колись тут
      </text>
      <line x1="660" y1="72" x2="660" y2="120" stroke="var(--ink)" strokeWidth="2.5" />
      <text {...CAPTION} x="668" y="82" fontWeight="700" fill="var(--ink)">
        by Friday
      </text>
      <path
        d="M 458 104 Q 560 132 650 108"
        stroke="var(--pp)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="5 4"
        markerEnd="url(#arw-fut-perf)"
      />
      <text {...CAPTION} x="60" y="146">
        {"By Friday we'll have shipped the fix. — коли саме, не сказано: важливо, що до пʼятниці"}
      </text>

      <text {...LANE_TITLE} x="40" y="206" fill="var(--pp)">
        FUTURE PERFECT CONTINUOUS — скільки часу триватиме до тієї точки
      </text>
      <line {...LANE} x1="60" y1="232" x2="860" y2="232" />
      <line
        x1="240"
        y1="232"
        x2="660"
        y2="232"
        stroke="var(--pp)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".85"
      />
      <line x1="660" y1="212" x2="660" y2="252" stroke="var(--ink)" strokeWidth="2.5" />
      <text {...CAPTION} x="672" y="222" fontWeight="700" fill="var(--ink)">
        in June
      </text>
      <text {...CAPTION} x="240" y="256" fill="var(--pp)">
        {"In June I'll have been working here for six years."}
      </text>
    </svg>
  );
}

/** Схема вибору форми майбутнього за три питання. */
export function DecisionFlow() {
  const question = { fill: 'var(--surface-2)', stroke: 'var(--line-strong)', strokeWidth: 1.5 };
  const line = { stroke: 'var(--line-strong)', strokeWidth: 1.8, fill: 'none' };
  const label = {
    fontFamily: 'sans-serif',
    fontSize: 12,
    fill: 'var(--ink-3)',
    fontWeight: 700,
  } as const;
  const text = { fontFamily: 'sans-serif', fontSize: 13.5, fill: 'var(--ink)' } as const;

  return (
    <svg viewBox="0 0 900 575" role="img" aria-label="Схема вибору форми майбутнього">
      <rect {...question} x="270" y="10" width="360" height="48" rx="10" />
      <text {...text} x="450" y="32" textAnchor="middle" fontWeight="700">
        Це розклад, програма
      </text>
      <text {...text} x="450" y="49" textAnchor="middle" fontWeight="700">
        або таблиця — не моє рішення?
      </text>

      <path {...line} d="M270 34 L145 34 L145 96" />
      <text {...label} x="190" y="27">
        ТАК
      </text>
      <rect
        x="20"
        y="96"
        width="250"
        height="74"
        rx="10"
        fill="var(--pc-bg)"
        stroke="var(--pc)"
        strokeWidth="1.5"
      />
      <text
        x="145"
        y="122"
        textAnchor="middle"
        fill="var(--pc-dk)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        PRESENT SIMPLE
      </text>
      <text {...text} x="145" y="143" textAnchor="middle">
        V1 · V-s
      </text>
      <text
        x="145"
        y="161"
        textAnchor="middle"
        fontSize="12"
        fill="var(--ink-3)"
        fontFamily="sans-serif"
      >
        the train leaves at six
      </text>

      <path {...line} d="M450 58 L450 102" />
      <text {...label} x="468" y="84">
        НІ
      </text>
      <rect {...question} x="270" y="102" width="360" height="48" rx="10" />
      <text {...text} x="450" y="124" textAnchor="middle" fontWeight="700">
        Домовлено з кимось,
      </text>
      <text {...text} x="450" y="141" textAnchor="middle" fontWeight="700">
        дата вже в календарі?
      </text>

      <path {...line} d="M630 126 L755 126 L755 188" />
      <text {...label} x="672" y="119">
        ТАК
      </text>
      <rect
        x="630"
        y="188"
        width="250"
        height="74"
        rx="10"
        fill="var(--pc-bg)"
        stroke="var(--pc)"
        strokeWidth="1.5"
      />
      <text
        x="755"
        y="214"
        textAnchor="middle"
        fill="var(--pc-dk)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        PRESENT CONTINUOUS
      </text>
      <text {...text} x="755" y="235" textAnchor="middle">
        am / is / are + V-ing
      </text>
      <text
        x="755"
        y="253"
        textAnchor="middle"
        fontSize="12"
        fill="var(--ink-3)"
        fontFamily="sans-serif"
      >
        I&apos;m meeting them at four
      </text>

      <path {...line} d="M450 150 L450 196" />
      <text {...label} x="468" y="177">
        НІ
      </text>
      <rect {...question} x="270" y="196" width="360" height="48" rx="10" />
      <text {...text} x="450" y="218" textAnchor="middle" fontWeight="700">
        Намір був ДО цієї розмови
      </text>
      <text {...text} x="450" y="235" textAnchor="middle" fontWeight="700">
        або є видима ознака?
      </text>

      <path {...line} d="M270 220 L137 220 L137 272" />
      <text {...label} x="190" y="213">
        ТАК
      </text>
      <rect
        x="20"
        y="272"
        width="235"
        height="74"
        rx="10"
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth="1.5"
      />
      <text
        x="137"
        y="298"
        textAnchor="middle"
        fill="var(--pp)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        BE GOING TO
      </text>
      <text {...text} x="137" y="319" textAnchor="middle">
        am / is / are going to + V1
      </text>
      <text
        x="137"
        y="337"
        textAnchor="middle"
        fontSize="12"
        fill="var(--ink-3)"
        fontFamily="sans-serif"
      >
        it&apos;s going to rain
      </text>

      <path {...line} d="M450 244 L450 330" />
      <text {...label} x="468" y="292">
        НІ
      </text>
      <rect
        x="270"
        y="330"
        width="360"
        height="82"
        rx="10"
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth="1.5"
      />
      <text
        x="450"
        y="358"
        textAnchor="middle"
        fill="var(--ps-dk)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        WILL
      </text>
      <text {...text} x="450" y="379" textAnchor="middle">
        will + V1 · won&apos;t + V1
      </text>
      <text
        x="450"
        y="400"
        textAnchor="middle"
        fontSize="12"
        fill="var(--ink-3)"
        fontFamily="sans-serif"
      >
        рішення в цю мить · обіцянка · прогноз
      </text>

      <rect
        x="150"
        y="440"
        width="600"
        height="52"
        rx="10"
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth="1.5"
      />
      <text {...text} x="450" y="463" textAnchor="middle" fontWeight="800" fill="var(--pp)">
        Потрібен процес у майбутній момент → will be + V-ing
      </text>
      <text
        x="450"
        y="482"
        textAnchor="middle"
        fontSize="12.5"
        fill="var(--pp)"
        fontFamily="sans-serif"
      >
        Потрібно «буде вже готово до…» → will have + V3
      </text>

      <rect
        x="150"
        y="504"
        width="600"
        height="54"
        rx="10"
        fill="var(--ok-bg)"
        stroke="var(--ok)"
        strokeWidth="1.5"
      />
      <text {...text} x="450" y="527" textAnchor="middle" fontWeight="800" fill="var(--ok)">
        І перед усім цим: після when, if, as soon as, until, before —
      </text>
      <text
        x="450"
        y="547"
        textAnchor="middle"
        fontSize="12.5"
        fill="var(--ok)"
        fontFamily="sans-serif"
      >
        теперішній час, і жодного will у цій частині речення.
      </text>
    </svg>
  );
}

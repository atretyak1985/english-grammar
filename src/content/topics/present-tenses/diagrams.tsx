/**
 * Схеми теми «Теперішні часи». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 *
 * Колір читається як вид: синій — Simple, помаранчевий — Continuous,
 * фіолетовий — Perfect. Той самий код, що й у минулих часах, тому картинка
 * підказує вид ще до того, як читач розбере підпис.
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
const LANE_TITLE = { fontSize: 13, fontWeight: 800, fill: 'var(--ink-2)', fontFamily: 'sans-serif' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;

/** Вертикаль «ЗАРАЗ» — спільна точка відліку для всіх трьох теперішніх часів. */
function NowLine({ x, y1, y2, label = true }: { x: number; y1: number; y2: number; label?: boolean }) {
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
 * Три теперішні часи навколо однієї вертикалі «зараз». Минулі часи різняться
 * порядком подій, теперішні — тим, як їхній охват лежить відносно цієї миті,
 * тому тут три смуги, а не одна лінія.
 */
export function TimelineAll() {
  const dots = [100, 190, 280, 370, 460, 550, 640, 730, 820];

  return (
    <svg viewBox="0 0 900 350" role="img" aria-label="Три теперішні часи відносно моменту «зараз»">
      <Arrow id="arw-pres-all" color="var(--pp)" />
      <NowLine x={640} y1={14} y2={322} />

      <text {...LANE_TITLE} x="60" y="44" fill="var(--ps-dk)">
        PRESENT SIMPLE — взагалі так є, регулярно
      </text>
      <line {...LANE} x1="60" y1="78" x2="860" y2="78" />
      {dots.map((cx) => (
        <circle key={cx} cx={cx} cy="78" r="6" fill="var(--ps)" />
      ))}
      <text {...CAPTION} x="60" y="104">
        I deploy on Fridays. — крапки розкидані по всій лінії, «зараз» нічим не виділене
      </text>

      <text {...LANE_TITLE} x="60" y="164" fill="var(--pc-dk)">
        PRESENT CONTINUOUS — у процесі саме тепер
      </text>
      <line {...LANE} x1="60" y1="198" x2="860" y2="198" />
      <line
        x1="520"
        y1="198"
        x2="770"
        y2="198"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <text {...CAPTION} x="60" y="224">
        {"I'm reviewing a pull request. — лінія накрила «зараз»: почалось раніше, ще не скінчилось"}
      </text>

      <text {...LANE_TITLE} x="60" y="252" fill="var(--pp)">
        PRESENT PERFECT — сталося раніше, а важливе тут
      </text>
      <line {...LANE} x1="60" y1="310" x2="860" y2="310" />
      <circle cx="250" cy="310" r="8" fill="var(--pp)" />
      <path
        d="M 258 302 Q 445 268 630 302"
        stroke="var(--pp)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="5 4"
        markerEnd="url(#arw-pres-all)"
      />
      <text {...CAPTION} x="445" y="278" textAnchor="middle" fill="var(--pp)" fontStyle="italic">
        {'«результат дотягнувся до зараз»'}
      </text>
      <text {...CAPTION} x="60" y="340">
        {"I've fixed the bug. — коли саме, не сказано і не важливо: важливо, що зараз він виправлений"}
      </text>
    </svg>
  );
}

/** Present Simple: регулярна дія розкидана по лінії та постійний факт як тло. */
export function TimelinePresentSimple() {
  const dots = [110, 200, 290, 380, 470, 560, 650, 740, 830];

  return (
    <svg viewBox="0 0 900 250" role="img" aria-label="Два випадки вживання Present Simple">
      <NowLine x={560} y1={44} y2={104} />
      <text {...LANE_TITLE} x="40" y="26">
        1 · РЕГУЛЯРНА ДІЯ — розкидані крапки, не привʼязані до цієї миті
      </text>
      <line {...LANE} x1="60" y1="78" x2="860" y2="78" />
      {dots.map((cx) => (
        <circle key={cx} cx={cx} cy="78" r="6.5" fill="var(--ps)" />
      ))}
      <text {...CAPTION} x="60" y="106">
        I take the metro to work. · We ship every second Thursday.
      </text>

      <NowLine x={560} y1={168} y2={228} label={false} />
      <text {...LANE_TITLE} x="40" y="150">
        2 · ПОСТІЙНИЙ ФАКТ АБО СТАН — суцільне тло без початку й кінця
      </text>
      <line {...LANE} x1="60" y1="202" x2="860" y2="202" />
      <line
        x1="60"
        y1="202"
        x2="860"
        y2="202"
        stroke="var(--ps)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".4"
      />
      <text {...CAPTION} x="60" y="230">
        Water boils at 100 °C. · The service runs on ECS. · I know Python.
      </text>
    </svg>
  );
}

/** Present Continuous: зараз, тимчасовий період і домовленість на майбутнє. */
export function TimelinePresentContinuous() {
  return (
    <svg viewBox="0 0 900 420" role="img" aria-label="Три випадки вживання Present Continuous">
      <text {...LANE_TITLE} x="40" y="26">
        1 · ПРЯМО ЗАРАЗ — коротка лінія навколо цієї миті
      </text>
      <line {...LANE} x1="60" y1="80" x2="860" y2="80" />
      <line
        x1="380"
        y1="80"
        x2="620"
        y2="80"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <NowLine x={500} y1={54} y2={106} />
      <text {...CAPTION} x="60" y="126">
        {"I'm writing the release notes. — Я пишу нотатки до релізу (в цю хвилину)."}
      </text>

      <text {...LANE_TITLE} x="40" y="186">
        2 · ТИМЧАСОВО, ЦИМИ ДНЯМИ — довга лінія, але з видимими краями
      </text>
      <line {...LANE} x1="60" y1="240" x2="860" y2="240" />
      <line
        x1="200"
        y1="240"
        x2="780"
        y2="240"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".8"
      />
      <line x1="200" y1="222" x2="200" y2="258" stroke="var(--pc-dk)" strokeWidth="1.8" />
      <line x1="780" y1="222" x2="780" y2="258" stroke="var(--pc-dk)" strokeWidth="1.8" />
      <NowLine x={500} y1={214} y2={266} label={false} />
      <text {...CAPTION} x="60" y="286">
        {"I'm covering for the team lead this month. — не обовʼязково в цю секунду, але період обмежений."}
      </text>

      <text {...LANE_TITLE} x="40" y="346">
        3 · ДОМОВЛЕНІСТЬ НА МАЙБУТНЄ — крапка справа від «зараз»
      </text>
      <line {...LANE} x1="60" y1="386" x2="860" y2="386" />
      <NowLine x={300} y1={362} y2={410} />
      <circle cx="640" cy="386" r="9" fill="var(--pc)" />
      <text {...CAPTION} x="640" y="372" textAnchor="middle" fill="var(--pc-dk)" fontWeight="700">
        {"I'm meeting the vendor on Thursday."}
      </text>
      <text {...CAPTION} x="640" y="408" textAnchor="middle">
        домовлено, дата в календарі
      </text>
    </svg>
  );
}

/** Present Perfect: результат, досвід і період, що не закінчився. */
export function TimelinePresentPerfect() {
  return (
    <svg viewBox="0 0 900 400" role="img" aria-label="Три випадки вживання Present Perfect">
      <Arrow id="arw-pres-perf" color="var(--pp)" />

      <text {...LANE_TITLE} x="40" y="26">
        1 · РЕЗУЛЬТАТ ВАЖЛИВИЙ ТУТ — час дії не називають
      </text>
      <line {...LANE} x1="60" y1="86" x2="860" y2="86" />
      <circle cx="220" cy="86" r="9" fill="var(--pp)" />
      <text {...CAPTION} x="220" y="112" textAnchor="middle">
        коли — невідомо
      </text>
      <path
        d="M 230 78 Q 400 34 588 78"
        stroke="var(--pp)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="5 4"
        markerEnd="url(#arw-pres-perf)"
      />
      <NowLine x={600} y1={58} y2={112} />
      <text {...CAPTION} x="410" y="48" textAnchor="middle" fill="var(--pp)" fontStyle="italic">
        {"I've fixed the bug. → баг зараз виправлений"}
      </text>

      <text {...LANE_TITLE} x="40" y="176">
        2 · ДОСВІД — будь-коли до цього моменту
      </text>
      <line {...LANE} x1="60" y1="236" x2="860" y2="236" />
      {[150, 260, 370, 480].map((cx) => (
        <circle key={cx} cx={cx} cy="236" r="7" fill="var(--pp)" opacity=".8" />
      ))}
      <path
        d="M 130 214 L 130 204 L 600 204 L 600 214"
        stroke="var(--pp)"
        strokeWidth="1.6"
        fill="none"
      />
      <text {...CAPTION} x="365" y="198" textAnchor="middle" fill="var(--pp)">
        {"Have you ever … ? — уся ця зона, без жодної конкретної дати"}
      </text>
      <NowLine x={600} y1={208} y2={262} label={false} />
      <text {...CAPTION} x="60" y="262">
        {"I've worked with three vendors. · Have you ever escalated a P1?"}
      </text>

      <text {...LANE_TITLE} x="40" y="326">
        3 · ПЕРІОД, ЩО НЕ ЗАКІНЧИВСЯ — for / since
      </text>
      <line {...LANE} x1="60" y1="366" x2="860" y2="366" />
      <line
        x1="230"
        y1="366"
        x2="600"
        y2="366"
        stroke="var(--pp)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".85"
      />
      <line x1="230" y1="348" x2="230" y2="384" stroke="var(--pp)" strokeWidth="1.8" />
      <text {...CAPTION} x="230" y="344" textAnchor="middle" fill="var(--pp)" fontWeight="700">
        since 2019
      </text>
      <NowLine x={600} y1={338} y2={392} />
      <text {...CAPTION} x="60" y="392">
        {"I've worked here for six years. — почалось у 2019-му, триває досі."}
      </text>
    </svg>
  );
}

/**
 * Головна пастка теми однією картинкою: час у реченні задає не саму дію,
 * а те, чи період, у якому вона сталася, вже закритий.
 */
export function ClosedVsOpen() {
  return (
    <svg viewBox="0 0 900 320" role="img" aria-label="Закритий і відкритий період: Past Simple чи Present Perfect">
      <Arrow id="arw-pres-open" />

      <text {...LANE_TITLE} x="40" y="28" fill="var(--ps-dk)">
        ПЕРІОД ЗАКРИТИЙ → PAST SIMPLE
      </text>
      <line
        {...LANE}
        x1="60"
        y1="96"
        x2="860"
        y2="96"
        stroke="var(--ink-3)"
        markerEnd="url(#arw-pres-open)"
      />
      <rect
        x="130"
        y="70"
        width="270"
        height="52"
        rx="10"
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth="1.5"
      />
      <text
        x="265"
        y="101"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        yesterday · in 2019 · last week
      </text>
      <NowLine x={700} y1={62} y2={130} />
      <text {...CAPTION} x="60" y="146">
        {"I sent the invoice yesterday. — «yesterday» уже скінчилось, у нього нічого не додати."}
      </text>

      <text {...LANE_TITLE} x="40" y="206" fill="var(--pp)">
        ПЕРІОД ЩЕ ВІДКРИТИЙ → PRESENT PERFECT
      </text>
      <line
        {...LANE}
        x1="60"
        y1="264"
        x2="860"
        y2="264"
        stroke="var(--ink-3)"
        markerEnd="url(#arw-pres-open)"
      />
      <rect
        x="380"
        y="238"
        width="320"
        height="52"
        rx="10"
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth="1.5"
      />
      <text
        x="540"
        y="269"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pp)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        today · this week · so far · ever
      </text>
      <NowLine x={700} y1={230} y2={298} label={false} />
      <text {...CAPTION} x="60" y="314">
        {"I've sent three invoices today. — «today» триває, до нього можна додати четвертий."}
      </text>
    </svg>
  );
}

/** Схема вибору теперішнього часу за три питання. */
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
    <svg viewBox="0 0 900 490" role="img" aria-label="Схема вибору теперішнього часу">
      <rect {...question} x="270" y="10" width="360" height="48" rx="10" />
      <text {...text} x="450" y="32" textAnchor="middle" fontWeight="700">
        Дія почалась раніше, а результат
      </text>
      <text {...text} x="450" y="49" textAnchor="middle" fontWeight="700">
        або період тягнеться в теперішнє?
      </text>

      <path {...line} d="M270 34 L145 34 L145 96" />
      <text {...label} x="190" y="27">
        ТАК
      </text>
      <rect
        x="20"
        y="96"
        width="250"
        height="94"
        rx="10"
        fill="var(--pp-bg)"
        stroke="var(--pp)"
        strokeWidth="1.5"
      />
      <text
        x="145"
        y="122"
        textAnchor="middle"
        fill="var(--pp)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        PRESENT PERFECT
      </text>
      <text {...text} x="145" y="143" textAnchor="middle">
        have / has + V3
      </text>
      <text x="145" y="161" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …have already fixed it
      </text>
      <text x="145" y="179" textAnchor="middle" fontSize="12" fill="var(--pp)" fontFamily="sans-serif">
        тривалість → have been + V-ing
      </text>

      <path {...line} d="M450 58 L450 102" />
      <text {...label} x="468" y="84">
        НІ
      </text>
      <rect {...question} x="270" y="102" width="360" height="48" rx="10" />
      <text {...text} x="450" y="124" textAnchor="middle" fontWeight="700">
        Це відбувається саме тепер
      </text>
      <text {...text} x="450" y="141" textAnchor="middle" fontWeight="700">
        або тимчасово, у цей період?
      </text>

      <path {...line} d="M630 126 L755 126 L755 188" />
      <text {...label} x="672" y="119">
        ТАК
      </text>
      <rect
        x="630"
        y="188"
        width="250"
        height="94"
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
      <text x="755" y="253" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …I am covering this week
      </text>
      <text x="755" y="271" textAnchor="middle" fontSize="12" fill="var(--pc-dk)" fontFamily="sans-serif">
        не з дієсловом стану
      </text>

      <path {...line} d="M450 150 L450 196" />
      <text {...label} x="468" y="177">
        НІ
      </text>
      <rect {...question} x="270" y="196" width="360" height="48" rx="10" />
      <text {...text} x="450" y="218" textAnchor="middle" fontWeight="700">
        Це дієслово стану?
      </text>
      <text x="450" y="235" textAnchor="middle" fontSize="12.5" fill="var(--ink-2)" fontFamily="sans-serif">
        (know, want, need, mean, seem, own, cost)
      </text>

      <path {...line} d="M450 244 L450 296" />
      <text {...label} x="468" y="274">
        У БУДЬ-ЯКОМУ РАЗІ
      </text>
      <rect
        x="270"
        y="296"
        width="360"
        height="82"
        rx="10"
        fill="var(--ps-bg)"
        stroke="var(--ps)"
        strokeWidth="1.5"
      />
      <text
        x="450"
        y="324"
        textAnchor="middle"
        fill="var(--ps-dk)"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="800"
      >
        PRESENT SIMPLE
      </text>
      <text {...text} x="450" y="345" textAnchor="middle">
        V1 · he/she/it + V-s · don&apos;t / doesn&apos;t + V1
      </text>
      <text x="450" y="366" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …we deploy on Fridays · she doesn&apos;t know yet
      </text>

      <rect
        x="150"
        y="404"
        width="600"
        height="70"
        rx="10"
        fill="var(--ok-bg)"
        stroke="var(--ok)"
        strokeWidth="1.5"
      />
      <text {...text} x="450" y="428" textAnchor="middle" fontWeight="800" fill="var(--ok)">
        Перед усім цим — одна перевірка.
      </text>
      <text x="450" y="449" textAnchor="middle" fontSize="12.5" fill="var(--ok)" fontFamily="sans-serif">
        Чи назвали ви закритий момент минулого — yesterday, in 2019, last week?
      </text>
      <text x="450" y="466" textAnchor="middle" fontSize="12.5" fill="var(--ok)" fontFamily="sans-serif">
        Якщо так, це взагалі не теперішній час: беріть Past Simple.
      </text>
    </svg>
  );
}

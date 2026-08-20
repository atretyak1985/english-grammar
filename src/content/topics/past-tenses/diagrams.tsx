/**
 * Схеми теми «Минулі часи». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 */

function Arrow({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        markerWidth="10"
        markerHeight="10"
        refX="8"
        refY="4"
        orient="auto"
        fill="var(--ink-3)"
      >
        <path d="M0,0 L8,4 L0,8 z" />
      </marker>
    </defs>
  );
}

/** Три часи на одній лінії часу: крапка раніше, лінія, крапка-подія. */
export function TimelineAll() {
  return (
    <svg viewBox="0 0 900 265" role="img" aria-label="Таймлайн з трьома минулими часами">
      <Arrow id="arw-all" />
      <line
        x1="40"
        y1="200"
        x2="860"
        y2="200"
        stroke="var(--ink-3)"
        strokeWidth="2"
        markerEnd="url(#arw-all)"
      />
      <text x="46" y="228" fontSize="13" fill="var(--ink-3)" fontFamily="sans-serif">
        МИНУЛЕ
      </text>
      <line x1="760" y1="180" x2="760" y2="220" stroke="var(--ink)" strokeWidth="2.5" />
      <text
        x="732"
        y="248"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="sans-serif"
      >
        ЗАРАЗ
      </text>

      <circle cx="170" cy="200" r="8" fill="var(--pp)" />
      <line
        x1="170"
        y1="200"
        x2="170"
        y2="72"
        stroke="var(--pp)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <rect x="55" y="40" width="230" height="32" rx="8" fill="var(--pp-bg)" stroke="var(--pp)" />
      <text
        x="170"
        y="61"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pp)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        had pushed — сталось перше
      </text>

      <line
        x1="330"
        y1="200"
        x2="600"
        y2="200"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".85"
      />
      <line
        x1="465"
        y1="200"
        x2="465"
        y2="122"
        stroke="var(--pc)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <rect x="345" y="90" width="240" height="32" rx="8" fill="var(--pc-bg)" stroke="var(--pc)" />
      <text
        x="465"
        y="111"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pc-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        was watching — тривало
      </text>

      <circle cx="520" cy="200" r="9" fill="var(--ps)" />
      <line
        x1="520"
        y1="200"
        x2="645"
        y2="162"
        stroke="var(--ps)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <rect x="620" y="140" width="215" height="32" rx="8" fill="var(--ps-bg)" stroke="var(--ps)" />
      <text
        x="727"
        y="161"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        the pager went off — подія
      </text>
    </svg>
  );
}

/** Past Simple: одна крапка з часом і послідовність крапок. */
export function TimelinePastSimple() {
  return (
    <svg viewBox="0 0 900 175" role="img" aria-label="Таймлайн Past Simple">
      <Arrow id="arw-ps" />
      <line
        x1="40"
        y1="120"
        x2="860"
        y2="120"
        stroke="var(--ink-3)"
        strokeWidth="2"
        markerEnd="url(#arw-ps)"
      />
      <line x1="760" y1="100" x2="760" y2="140" stroke="var(--ink)" strokeWidth="2.5" />
      <text
        x="732"
        y="162"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="sans-serif"
      >
        ЗАРАЗ
      </text>

      <circle cx="190" cy="120" r="10" fill="var(--ps)" />
      <text
        x="190"
        y="98"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        I joined the company
      </text>
      <text
        x="190"
        y="152"
        fontSize="12.5"
        fill="var(--ink-3)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        у 2019 — завершено, є точний час
      </text>

      <circle cx="430" cy="120" r="10" fill="var(--ps)" />
      <circle cx="540" cy="120" r="10" fill="var(--ps)" />
      <circle cx="650" cy="120" r="10" fill="var(--ps)" />
      <text
        x="540"
        y="98"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        послідовність: opened → fixed → deployed
      </text>
      <text
        x="540"
        y="152"
        fontSize="12.5"
        fill="var(--ink-3)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        порядок у реченні = порядок подій
      </text>
    </svg>
  );
}

/** Past Continuous: перервана дія, дві паралельні, процес у момент. */
export function TimelinePastContinuous() {
  return (
    <svg viewBox="0 0 900 370" role="img" aria-label="Три випадки вживання Past Continuous">
      <text x="40" y="26" fontSize="13" fontWeight="800" fill="var(--ink-2)" fontFamily="sans-serif">
        1 · ПЕРЕРВАНА ДІЯ — довга лінія + коротка крапка
      </text>
      <line x1="40" y1="70" x2="860" y2="70" stroke="var(--line)" strokeWidth="2" />
      <line
        x1="150"
        y1="70"
        x2="620"
        y2="70"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <text
        x="385"
        y="57"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pc-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        I was deploying to production
      </text>
      <circle cx="450" cy="70" r="9" fill="var(--ps)" />
      <line x1="450" y1="70" x2="450" y2="96" stroke="var(--ps)" strokeWidth="1.5" />
      <text
        x="450"
        y="112"
        fontSize="13"
        fontWeight="700"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        when the VPN dropped
      </text>
      <text
        x="450"
        y="130"
        fontSize="12"
        fill="var(--ink-3)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        Я деплоїв, коли відвалився VPN
      </text>

      <text
        x="40"
        y="180"
        fontSize="13"
        fontWeight="800"
        fill="var(--ink-2)"
        fontFamily="sans-serif"
      >
        2 · ДВІ ПАРАЛЕЛЬНІ ДІЇ — while …, …
      </text>
      <line
        x1="150"
        y1="216"
        x2="700"
        y2="216"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <text
        x="425"
        y="207"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pc-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        I was writing the spec
      </text>
      <line
        x1="200"
        y1="242"
        x2="740"
        y2="242"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
        opacity=".6"
      />
      <text
        x="470"
        y="263"
        fontSize="13.5"
        fontWeight="700"
        fill="var(--pc-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        while the team was running tests
      </text>

      <text
        x="40"
        y="316"
        fontSize="13"
        fontWeight="800"
        fill="var(--ink-2)"
        fontFamily="sans-serif"
      >
        3 · У ПРОЦЕСІ В КОНКРЕТНИЙ МОМЕНТ
      </text>
      <line
        x1="150"
        y1="344"
        x2="700"
        y2="344"
        stroke="var(--pc)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line x1="430" y1="326" x2="430" y2="362" stroke="var(--ink)" strokeWidth="2.5" />
      <text
        x="512"
        y="349"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="sans-serif"
      >
        ← at 3 p.m. yesterday
      </text>
    </svg>
  );
}

/** Past Perfect: крок назад від точки в Past Simple. */
export function TimelinePastPerfect() {
  return (
    <svg viewBox="0 0 900 200" role="img" aria-label="Таймлайн Past Perfect">
      <Arrow id="arw-pp" />
      <line
        x1="40"
        y1="140"
        x2="860"
        y2="140"
        stroke="var(--ink-3)"
        strokeWidth="2"
        markerEnd="url(#arw-pp)"
      />
      <line x1="775" y1="120" x2="775" y2="160" stroke="var(--ink)" strokeWidth="2.5" />
      <text
        x="748"
        y="182"
        fontSize="13"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="sans-serif"
      >
        ЗАРАЗ
      </text>

      <circle cx="180" cy="140" r="10" fill="var(--pp)" />
      <text
        x="180"
        y="118"
        fontSize="14"
        fontWeight="800"
        fill="var(--pp)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        1️⃣ the team had left
      </text>
      <text
        x="180"
        y="172"
        fontSize="12.5"
        fill="var(--ink-3)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        Past Perfect — сталося раніше
      </text>

      <circle cx="520" cy="140" r="10" fill="var(--ps)" />
      <text
        x="520"
        y="118"
        fontSize="14"
        fontWeight="800"
        fill="var(--ps-dk)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        2️⃣ I arrived at the office
      </text>
      <text
        x="520"
        y="172"
        fontSize="12.5"
        fill="var(--ink-3)"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        Past Simple — точка відліку
      </text>

      <path
        d="M 500 128 Q 350 78 200 128"
        stroke="var(--pp)"
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="5 4"
        markerEnd="url(#arw-pp)"
      />
      <text
        x="350"
        y="74"
        fontSize="12.5"
        fill="var(--pp)"
        textAnchor="middle"
        fontStyle="italic"
        fontFamily="sans-serif"
      >
        «крок назад звідси»
      </text>
    </svg>
  );
}

/** Схема вибору часу за три питання. */
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
    <svg viewBox="0 0 900 470" role="img" aria-label="Схема вибору минулого часу">
      <rect {...question} x="280" y="10" width="340" height="48" rx="10" />
      <text {...text} x="450" y="32" textAnchor="middle" fontWeight="700">
        Це сталося РАНІШЕ за момент,
      </text>
      <text {...text} x="450" y="49" textAnchor="middle" fontWeight="700">
        про який я вже розповідаю?
      </text>

      <path {...line} d="M280 34 L145 34 L145 96" />
      <text {...label} x="198" y="27">
        ТАК
      </text>
      <rect
        x="25"
        y="96"
        width="240"
        height="74"
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
        PAST PERFECT
      </text>
      <text {...text} x="145" y="143" textAnchor="middle">
        had + V3
      </text>
      <text x="145" y="161" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …had already deployed it
      </text>

      <path {...line} d="M450 58 L450 102" />
      <text {...label} x="468" y="84">
        НІ
      </text>
      <rect {...question} x="280" y="102" width="340" height="48" rx="10" />
      <text {...text} x="450" y="124" textAnchor="middle" fontWeight="700">
        Дія ТРИВАЛА / була незавершена
      </text>
      <text {...text} x="450" y="141" textAnchor="middle" fontWeight="700">
        у той момент минулого?
      </text>

      <path {...line} d="M620 126 L755 126 L755 188" />
      <text {...label} x="672" y="119">
        ТАК
      </text>
      <rect
        x="635"
        y="188"
        width="240"
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
        PAST CONTINUOUS
      </text>
      <text {...text} x="755" y="235" textAnchor="middle">
        was / were + V-ing
      </text>
      <text x="755" y="253" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …was deploying when it broke
      </text>

      <path {...line} d="M450 150 L450 196" />
      <text {...label} x="468" y="177">
        НІ
      </text>
      <rect {...question} x="280" y="196" width="340" height="48" rx="10" />
      <text {...text} x="450" y="218" textAnchor="middle" fontWeight="700">
        Це дієслово стану?
      </text>
      <text x="450" y="235" textAnchor="middle" fontSize="12.5" fill="var(--ink-2)" fontFamily="sans-serif">
        (know, want, need, like, seem, be)
      </text>

      <path {...line} d="M450 244 L450 296" />
      <text {...label} x="468" y="274">
        У БУДЬ-ЯКОМУ РАЗІ
      </text>
      <rect
        x="280"
        y="296"
        width="340"
        height="78"
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
        PAST SIMPLE
      </text>
      <text {...text} x="450" y="345" textAnchor="middle">
        V2 / V-ed · didn&apos;t + V1
      </text>
      <text x="450" y="363" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        …we deployed it on Friday
      </text>

      <rect
        x="215"
        y="400"
        width="470"
        height="56"
        rx="10"
        fill="var(--ok-bg)"
        stroke="var(--ok)"
        strokeWidth="1.5"
      />
      <text {...text} x="450" y="423" textAnchor="middle" fontWeight="800" fill="var(--ok)">
        Сумніваєтесь? Беріть Past Simple.
      </text>
      <text x="450" y="443" textAnchor="middle" fontSize="12.5" fill="var(--ok)" fontFamily="sans-serif">
        Він правильний частіше, ніж два інших разом узятих.
      </text>
    </svg>
  );
}

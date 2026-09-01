/**
 * Схеми теми «Артиклі». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 *
 * Колірний код усередині теми: синій — a/an, фіолетовий — the, помаранчевий —
 * нульовий артикль. Це локальна домовленість цієї теми: наскрізна семантика
 * «колір = вид» стосується часів, а артиклі в підсвітку аналізатора не входять.
 */

const TITLE = {
  fontSize: 14,
  fontWeight: 800,
  fontFamily: 'sans-serif',
} as const;
const TEXT = { fontFamily: 'sans-serif', fontSize: 13.5, fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;
const LABEL = {
  fontFamily: 'sans-serif',
  fontSize: 12,
  fill: 'var(--ink-3)',
  fontWeight: 700,
} as const;

/**
 * Карта артиклів 2 × 2: вісь «однина — множина/незлічуване» проти осі
 * «типу — конкретно». Уся система на одній картинці: чотири клітинки,
 * три артиклі. Половина карти — the, і це найкорисніший факт схеми:
 * коли співрозмовник знає, про що йдеться, форма іменника вже не важить.
 */
export function ArticleMap() {
  return (
    <svg viewBox="0 0 900 430" role="img" aria-label="Карта артиклів: два питання, чотири клітинки">
      {/* заголовки колонок — питання «чи знаємо обоє?» */}
      <text {...TITLE} x="330" y="30" textAnchor="middle" fill="var(--ink-2)">
        «ТИПУ» — один якийсь, будь-який
      </text>
      <text {...CAPTION} x="330" y="48" textAnchor="middle">
        співрозмовник ще не знає, про який саме
      </text>
      <text {...TITLE} x="700" y="30" textAnchor="middle" fill="var(--ink-2)">
        «КОНКРЕТНО» — той самий
      </text>
      <text {...CAPTION} x="700" y="48" textAnchor="middle">
        ми обоє знаємо, про який ідеться
      </text>

      {/* підписи рядків */}
      <text {...LABEL} x="20" y="140">
        ОДНИНА
      </text>
      <text {...CAPTION} x="20" y="158">
        можна порахувати,
      </text>
      <text {...CAPTION} x="20" y="174">
        і воно одне
      </text>

      <text {...LABEL} x="20" y="310">
        МНОЖИНА
      </text>
      <text {...LABEL} x="20" y="328">
        І «РОЗМАЗНЯ»
      </text>
      <text {...CAPTION} x="20" y="346">
        laptops · advice · snow
      </text>

      {/* клітинка: однина + типу = a/an */}
      <rect x="155" y="70" width="350" height="140" rx="12" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text x="330" y="115" textAnchor="middle" fontFamily="sans-serif" fontSize="30" fontWeight="800" fill="var(--ps-dk)">
        a / an
      </text>
      <text {...TEXT} x="330" y="150" textAnchor="middle">
        I got <tspan fontWeight="700">a laptop</tspan>. — якийсь, один із багатьох
      </text>
      <text {...CAPTION} x="330" y="175" textAnchor="middle">
        новий для співрозмовника предмет
      </text>

      {/* клітинка: однина + конкретно = the */}
      <rect x="525" y="70" width="350" height="140" rx="12" fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth="1.5" />
      <text x="700" y="115" textAnchor="middle" fontFamily="sans-serif" fontSize="30" fontWeight="800" fill="var(--pp)">
        the
      </text>
      <text {...TEXT} x="700" y="150" textAnchor="middle">
        <tspan fontWeight="700">The laptop</tspan> is slow. — той самий, мій
      </text>
      <text {...CAPTION} x="700" y="175" textAnchor="middle">
        обоє знаємо, про який ідеться
      </text>

      {/* клітинка: множина/розмазня + типу = нуль */}
      <rect x="155" y="240" width="350" height="140" rx="12" fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth="1.5" />
      <text x="330" y="285" textAnchor="middle" fontFamily="sans-serif" fontSize="30" fontWeight="800" fill="var(--pc-dk)">
        ∅ нічого
      </text>
      <text {...TEXT} x="330" y="320" textAnchor="middle">
        I love <tspan fontWeight="700">laptops</tspan>. — будь-які, взагалі
      </text>
      <text {...CAPTION} x="330" y="345" textAnchor="middle">
        категорія загалом, без меж
      </text>

      {/* клітинка: множина/розмазня + конкретно = the */}
      <rect x="525" y="240" width="350" height="140" rx="12" fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth="1.5" />
      <text x="700" y="285" textAnchor="middle" fontFamily="sans-serif" fontSize="30" fontWeight="800" fill="var(--pp)">
        the
      </text>
      <text {...TEXT} x="700" y="320" textAnchor="middle">
        Move <tspan fontWeight="700">the laptops</tspan>. — ось ці, відомі
      </text>
      <text {...CAPTION} x="700" y="345" textAnchor="middle">
        конкретна купка, обом видима
      </text>

      <text {...CAPTION} x="450" y="415" textAnchor="middle" fontStyle="italic">
        два питання: чи одне й злічуване? чи знаємо обоє, яке саме? — і вся система на місці
      </text>
    </svg>
  );
}

/** Схема вибору артикля за чотири питання. */
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
    <svg viewBox="0 0 900 620" role="img" aria-label="Схема вибору артикля">
      {/* 0. зʼїдач артикля? */}
      <rect {...question} x="270" y="10" width="360" height="48" rx="10" />
      <text {...text} x="450" y="32" textAnchor="middle" fontWeight="700">
        Перед іменником уже стоїть my, this,
      </text>
      <text {...text} x="450" y="49" textAnchor="middle" fontWeight="700">
        some, every, no або число?
      </text>

      <path {...line} d="M270 34 L145 34 L145 96" />
      <text {...label} x="190" y="27">
        ТАК
      </text>
      <rect x="20" y="96" width="250" height="74" rx="10" fill="var(--ok-bg)" stroke="var(--ok)" strokeWidth="1.5" />
      <text x="145" y="122" textAnchor="middle" fill="var(--ok)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        АРТИКЛЬ НЕ ПОТРІБЕН
      </text>
      <text {...text} x="145" y="143" textAnchor="middle">
        зʼїдач уже на його місці
      </text>
      <text x="145" y="161" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        my laptop · this bug · some tea
      </text>

      {/* 1. власна назва? */}
      <path {...line} d="M450 58 L450 102" />
      <text {...label} x="468" y="84">
        НІ
      </text>
      <rect {...question} x="270" y="102" width="360" height="48" rx="10" />
      <text {...text} x="450" y="124" textAnchor="middle" fontWeight="700">
        Це власна назва —
      </text>
      <text {...text} x="450" y="141" textAnchor="middle" fontWeight="700">
        імʼя, місто, країна, компанія?
      </text>

      <path {...line} d="M630 126 L755 126 L755 188" />
      <text {...label} x="672" y="119">
        ТАК
      </text>
      <rect x="630" y="188" width="250" height="74" rx="10" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <text x="755" y="214" textAnchor="middle" fill="var(--ink-2)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        ЗАЗВИЧАЙ БЕЗ АРТИКЛЯ
      </text>
      <text {...text} x="755" y="235" textAnchor="middle">
        Kyiv · Ukraine · Google
      </text>
      <text x="755" y="253" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        винятки — списком у розділі 7
      </text>

      {/* 2. чи знаємо обоє? */}
      <path {...line} d="M450 150 L450 196" />
      <text {...label} x="468" y="177">
        НІ
      </text>
      <rect {...question} x="270" y="196" width="360" height="48" rx="10" />
      <text {...text} x="450" y="218" textAnchor="middle" fontWeight="700">
        Ми обоє знаємо,
      </text>
      <text {...text} x="450" y="235" textAnchor="middle" fontWeight="700">
        про який саме йдеться?
      </text>

      <path {...line} d="M270 220 L137 220 L137 272" />
      <text {...label} x="190" y="213">
        ТАК
      </text>
      <rect x="20" y="272" width="235" height="74" rx="10" fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth="1.5" />
      <text x="137" y="298" textAnchor="middle" fill="var(--pp)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        THE
      </text>
      <text {...text} x="137" y="319" textAnchor="middle">
        і в однині, і в множині
      </text>
      <text x="137" y="337" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        the invoice · the logs · the milk
      </text>

      {/* 3. однина злічуваного? */}
      <path {...line} d="M450 244 L450 290" />
      <text {...label} x="468" y="271">
        НІ
      </text>
      <rect {...question} x="270" y="290" width="360" height="48" rx="10" />
      <text {...text} x="450" y="312" textAnchor="middle" fontWeight="700">
        Це можна порахувати —
      </text>
      <text {...text} x="450" y="329" textAnchor="middle" fontWeight="700">
        і воно тут одне?
      </text>

      <path {...line} d="M270 314 L137 314 L137 380" />
      <text {...label} x="190" y="307">
        ТАК
      </text>
      <rect x="20" y="380" width="235" height="82" rx="10" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text x="137" y="408" textAnchor="middle" fill="var(--ps-dk)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        A / AN
      </text>
      <text {...text} x="137" y="429" textAnchor="middle">
        an — якщо далі голосний звук
      </text>
      <text x="137" y="449" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        a bug · an hour · a user
      </text>

      <path {...line} d="M450 338 L450 380" />
      <text {...label} x="468" y="364">
        НІ
      </text>
      <rect x="270" y="380" width="360" height="82" rx="10" fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth="1.5" />
      <text x="450" y="408" textAnchor="middle" fill="var(--pc-dk)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        НУЛЬОВИЙ АРТИКЛЬ
      </text>
      <text {...text} x="450" y="429" textAnchor="middle">
        множина або незлічуване загалом
      </text>
      <text x="450" y="449" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        bugs happen · I need advice
      </text>

      {/* нижні нагадування */}
      <rect x="150" y="490" width="600" height="52" rx="10" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text {...text} x="450" y="513" textAnchor="middle" fontWeight="800" fill="var(--ps-dk)">
        Однина злічуваного ГОЛОЮ не ходить ніколи:
      </text>
      <text x="450" y="532" textAnchor="middle" fontSize="12.5" fill="var(--ps-dk)" fontFamily="sans-serif">
        ✗ I have meeting → a meeting, the meeting, my meeting — але щось мусить стояти
      </text>

      <rect x="150" y="554" width="600" height="52" rx="10" fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth="1.5" />
      <text {...text} x="450" y="577" textAnchor="middle" fontWeight="800" fill="var(--pc-dk)">
        А множина і «розмазня» НЕ беруть a/an ніколи:
      </text>
      <text x="450" y="596" textAnchor="middle" fontSize="12.5" fill="var(--pc-dk)" fontFamily="sans-serif">
        ✗ an advice, ✗ a feedback, ✗ an information — тільки the або нічого
      </text>
    </svg>
  );
}

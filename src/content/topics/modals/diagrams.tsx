/**
 * Схеми теми «Модальні дієслова». Кольори — на змінних теми, тому та сама
 * схема правильно виглядає і в світлій, і в темній темі.
 *
 * Колірний код усередині теми: синій — можливість і дозвіл (мʼякий край
 * шкали), помаранчевий — порада й середня впевненість, фіолетовий —
 * обовʼязок і майже-певність, кораловий — заборона і «точно ні». Це
 * локальна домовленість цієї теми: наскрізна семантика «колір = вид»
 * стосується часів, а модальні в підсвітку аналізатора не входять.
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
 * Два поверхи модальних на одній картинці: шкала тиску (правила світу) і
 * шкала впевненості (оцінка шансів). Найкорисніший факт схеми — ті самі
 * слова живуть на обох поверхах: must тисне і must оцінює, а який поверх
 * увімкнено, вирішує контекст речення.
 */
export function ModalFloors() {
  const box = (x: number, y: number, w: number, fill: string, stroke: string) => ({
    x,
    y,
    width: w,
    height: 96,
    rx: 12,
    fill,
    stroke,
    strokeWidth: 1.5,
  });

  return (
    <svg
      viewBox="0 0 900 470"
      role="img"
      aria-label="Два поверхи модальних: шкала тиску і шкала впевненості"
    >
      {/* ── поверх 1: правила світу ── */}
      <text {...TITLE} x="20" y="28" fill="var(--ink-2)">
        ПОВЕРХ 1 · ПРАВИЛА СВІТУ — скільки тиску в реченні?
      </text>
      <text {...CAPTION} x="20" y="46">
        дозвіл, порада, обовʼязок, заборона: You can / should / must / mustn’t…
      </text>

      <line x1="30" y1="176" x2="870" y2="176" stroke="var(--line-strong)" strokeWidth="1.8" />
      <path d="M870 176 l-9 -5 v10 z" fill="var(--line-strong)" />

      <rect {...box(30, 62, 190, 'var(--ps-bg)', 'var(--ps)')} />
      <text x="125" y="92" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--ps-dk)">
        can
      </text>
      <text {...TEXT} x="125" y="115" textAnchor="middle">
        можна, дозволено
      </text>
      <text {...CAPTION} x="125" y="136" textAnchor="middle">
        You can leave early.
      </text>

      <rect {...box(240, 62, 190, 'var(--pc-bg)', 'var(--pc)')} />
      <text x="335" y="92" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--pc-dk)">
        should
      </text>
      <text {...TEXT} x="335" y="115" textAnchor="middle">
        варто, раджу
      </text>
      <text {...CAPTION} x="335" y="136" textAnchor="middle">
        You should back it up.
      </text>

      <rect {...box(450, 62, 200, 'var(--pp-bg)', 'var(--pp)')} />
      <text x="550" y="92" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--pp)">
        must · have to
      </text>
      <text {...TEXT} x="550" y="115" textAnchor="middle">
        мусиш, обовʼязок
      </text>
      <text {...CAPTION} x="550" y="136" textAnchor="middle">
        You must wear a badge.
      </text>

      <rect {...box(670, 62, 200, 'var(--no-bg)', 'var(--no)')} />
      <text x="770" y="92" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--coral-dk)">
        mustn’t · can’t
      </text>
      <text {...TEXT} x="770" y="115" textAnchor="middle">
        заборонено
      </text>
      <text {...CAPTION} x="770" y="136" textAnchor="middle">
        You mustn’t share it.
      </text>

      <text {...LABEL} x="30" y="200">
        ЛЕГКО
      </text>
      <text {...LABEL} x="820" y="200" textAnchor="end">
        ЖОРСТКО
      </text>

      {/* ── поверх 2: оцінка шансів ── */}
      <text {...TITLE} x="20" y="248" fill="var(--ink-2)">
        ПОВЕРХ 2 · ОЦІНКА ШАНСІВ — наскільки ви впевнені?
      </text>
      <text {...CAPTION} x="20" y="266">
        здогад про те, що вже є: He must / may / can’t be…
      </text>

      <line x1="30" y1="396" x2="870" y2="396" stroke="var(--line-strong)" strokeWidth="1.8" />
      <path d="M870 396 l-9 -5 v10 z" fill="var(--line-strong)" />

      <rect {...box(30, 282, 190, 'var(--no-bg)', 'var(--no)')} />
      <text x="125" y="312" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--coral-dk)">
        can’t be
      </text>
      <text {...TEXT} x="125" y="335" textAnchor="middle">
        точно ні · ~0%
      </text>
      <text {...CAPTION} x="125" y="356" textAnchor="middle">
        It can’t be a bug.
      </text>

      <rect {...box(240, 282, 250, 'var(--ps-bg)', 'var(--ps)')} />
      <text x="365" y="312" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--ps-dk)">
        might · may · could
      </text>
      <text {...TEXT} x="365" y="335" textAnchor="middle">
        можливо · 30–50%
      </text>
      <text {...CAPTION} x="365" y="356" textAnchor="middle">
        He might be at lunch.
      </text>

      <rect {...box(510, 282, 170, 'var(--pc-bg)', 'var(--pc)')} />
      <text x="595" y="312" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--pc-dk)">
        should be
      </text>
      <text {...TEXT} x="595" y="335" textAnchor="middle">
        мало б · ~75%
      </text>
      <text {...CAPTION} x="595" y="356" textAnchor="middle">
        It should be ready.
      </text>

      <rect {...box(700, 282, 170, 'var(--pp-bg)', 'var(--pp)')} />
      <text x="785" y="312" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="800" fill="var(--pp)">
        must be
      </text>
      <text {...TEXT} x="785" y="335" textAnchor="middle">
        мабуть, точно · ~95%
      </text>
      <text {...CAPTION} x="785" y="356" textAnchor="middle">
        He must be tired.
      </text>

      <text {...LABEL} x="30" y="420">
        НЕМОЖЛИВО
      </text>
      <text {...LABEL} x="820" y="420" textAnchor="end">
        МАЙЖЕ ПЕВЕН
      </text>

      <text {...CAPTION} x="450" y="455" textAnchor="middle" fontStyle="italic">
        ті самі слова на обох поверхах: must тисне (мусиш) і must оцінює (мабуть) — поверх вибирає контекст
      </text>
    </svg>
  );
}

/** Схема вибору модального за три питання. */
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
    <svg viewBox="0 0 900 640" role="img" aria-label="Схема вибору модального дієслова">
      {/* 1. оцінка шансів? */}
      <rect {...question} x="270" y="10" width="360" height="48" rx="10" />
      <text {...text} x="450" y="32" textAnchor="middle" fontWeight="700">
        Ви оцінюєте шанси — «мабуть»,
      </text>
      <text {...text} x="450" y="49" textAnchor="middle" fontWeight="700">
        «можливо», «не може бути»?
      </text>

      <path {...line} d="M630 34 L755 34 L755 96" />
      <text {...label} x="672" y="27">
        ТАК
      </text>
      <rect x="610" y="96" width="270" height="96" rx="10" fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth="1.5" />
      <text x="745" y="122" textAnchor="middle" fill="var(--pp)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        ШКАЛА ВПЕВНЕНОСТІ
      </text>
      <text {...text} x="745" y="143" textAnchor="middle">
        майже певен → must be
      </text>
      <text {...text} x="745" y="161" textAnchor="middle">
        можливо → might / may / could
      </text>
      <text {...text} x="745" y="179" textAnchor="middle">
        точно ні → can’t be
      </text>

      {/* 2. просите дозвіл / послугу? */}
      <path {...line} d="M450 58 L450 102" />
      <text {...label} x="468" y="84">
        НІ
      </text>
      <rect {...question} x="270" y="102" width="360" height="48" rx="10" />
      <text {...text} x="450" y="124" textAnchor="middle" fontWeight="700">
        Просите — дозвіл собі
      </text>
      <text {...text} x="450" y="141" textAnchor="middle" fontWeight="700">
        або послугу від співрозмовника?
      </text>

      <path {...line} d="M270 126 L145 126 L145 188" />
      <text {...label} x="190" y="119">
        ТАК
      </text>
      <rect x="20" y="188" width="250" height="96" rx="10" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text x="145" y="214" textAnchor="middle" fill="var(--ps-dk)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        ДРАБИНА ВВІЧЛИВОСТІ
      </text>
      <text {...text} x="145" y="235" textAnchor="middle">
        собі: Can I…? → May I…?
      </text>
      <text {...text} x="145" y="253" textAnchor="middle">
        йому: Can you…? → Could you…?
      </text>
      <text {...text} x="145" y="271" textAnchor="middle">
        → Would you mind…?
      </text>

      {/* 3. тиснете? */}
      <path {...line} d="M450 150 L450 196" />
      <text {...label} x="468" y="177">
        НІ
      </text>
      <rect {...question} x="270" y="196" width="360" height="48" rx="10" />
      <text {...text} x="450" y="218" textAnchor="middle" fontWeight="700">
        Кажете, що людині робити —
      </text>
      <text {...text} x="450" y="235" textAnchor="middle" fontWeight="700">
        радите, вимагаєте, забороняєте?
      </text>

      <path {...line} d="M630 220 L755 220 L755 282" />
      <text {...label} x="672" y="213">
        ТАК
      </text>
      <rect x="610" y="282" width="270" height="114" rx="10" fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth="1.5" />
      <text x="745" y="308" textAnchor="middle" fill="var(--pc-dk)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        ШКАЛА ТИСКУ
      </text>
      <text {...text} x="745" y="329" textAnchor="middle">
        порада → should / had better
      </text>
      <text {...text} x="745" y="347" textAnchor="middle">
        обовʼязок → must / have to
      </text>
      <text {...text} x="745" y="365" textAnchor="middle">
        заборона → mustn’t / can’t
      </text>
      <text x="745" y="385" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        «не обовʼязково» — don’t have to
      </text>

      {/* 4. решта: уміння, можливість, воля */}
      <path {...line} d="M450 244 L450 306" />
      <text {...label} x="468" y="280">
        НІ
      </text>
      <rect x="270" y="306" width="360" height="114" rx="10" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text x="450" y="332" textAnchor="middle" fill="var(--ps-dk)" fontFamily="sans-serif" fontSize="14" fontWeight="800">
        УМІННЯ · МОЖЛИВІСТЬ · ВОЛЯ
      </text>
      <text {...text} x="450" y="353" textAnchor="middle">
        вмію / можливо → can, у минулому → could
      </text>
      <text {...text} x="450" y="371" textAnchor="middle">
        один раз вдалося → was able to / managed to
      </text>
      <text {...text} x="450" y="389" textAnchor="middle">
        обіцянка / відмова → will / won’t
      </text>
      <text x="450" y="409" textAnchor="middle" fontSize="12" fill="var(--ink-3)" fontFamily="sans-serif">
        майбутнє від can — will be able to
      </text>

      {/* нижні нагадування */}
      <rect x="150" y="460" width="600" height="52" rx="10" fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth="1.5" />
      <text {...text} x="450" y="483" textAnchor="middle" fontWeight="800" fill="var(--ps-dk)">
        Після модального — гола основа, без to і без -s:
      </text>
      <text x="450" y="502" textAnchor="middle" fontSize="12.5" fill="var(--ps-dk)" fontFamily="sans-serif">
        ✗ he cans · ✗ can to swim · ✗ must to go → he can swim · I must go
      </text>

      <rect x="150" y="524" width="600" height="52" rx="10" fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth="1.5" />
      <text {...text} x="450" y="547" textAnchor="middle" fontWeight="800" fill="var(--pc-dk)">
        Питання — інверсією, без do:
      </text>
      <text x="450" y="566" textAnchor="middle" fontSize="12.5" fill="var(--pc-dk)" fontFamily="sans-serif">
        ✗ Do you can help? → Can you help? · виняток-протез: Do I have to…?
      </text>

      <rect x="150" y="588" width="600" height="42" rx="10" fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth="1.5" />
      <text x="450" y="614" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--pp)" fontFamily="sans-serif">
        Минуле, якого не сталося: modal + have + V3 → We should have tested it.
      </text>
    </svg>
  );
}

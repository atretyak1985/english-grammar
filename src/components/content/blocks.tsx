import { Fragment, type ReactNode } from 'react';

import { TENSE_FORMULAS } from '@/lib/grammar/cards';
import { ASPECT_TEXT, TENSE_ASPECT, type Aspect, type TenseKey } from '@/types/content';

/* ============================================================
   Будівельні блоки контенту тем.
   Кожен компонент — це те, що раніше було CSS-класом у main.css.
   Усі стилі на токенах, тому працюють в обох темах.

   Колірні мапи ключовані ВИДОМ, а не конструкцією: Present Perfect і Past
   Perfect однаково фіолетові, бо колір у застосунку означає вид.

   Час конструкції раніше показувало підкреслення під заливкою. Його тут
   більше немає: у напрямі «Читальня» підкреслення закріплене за лексикою
   («не знаю» — пунктир, «вчу» — жовтий маркер), і другий сенс на тому
   самому знаку зробив би обидва нечитаними рівно там, де вони збігаються —
   на позначеному слові всередині підсвіченого часу.
   ============================================================ */

const ASPECT_BADGE: Record<Aspect, string> = {
  simple: 'bg-ps-bg text-ps',
  continuous: 'bg-pc-bg text-pc',
  perfect: 'bg-pp-bg text-pp',
};

const ASPECT_BORDER: Record<Aspect, string> = {
  simple: 'border-t-ps',
  continuous: 'border-t-pc',
  perfect: 'border-t-pp',
};

const ASPECT_DOT: Record<Aspect, string> = {
  simple: 'bg-ps',
  continuous: 'bg-pc',
  perfect: 'bg-pp',
};

/** Заливка часу в тексті — канал граматики. Тло несе вид, чорнило тримає контраст. */
const ASPECT_MARK: Record<Aspect, string> = {
  simple: 'bg-ps-bg text-ps-tx',
  continuous: 'bg-pc-bg text-pc-tx',
  perfect: 'bg-pp-bg text-pp-tx',
};

const ASPECT_CHIP: Record<Aspect, string> = {
  simple: 'border-ps-line bg-ps-bg text-ps-dk',
  continuous: 'border-pc-line bg-pc-bg text-pc-dk',
  perfect: 'border-pp-line bg-pp-bg text-pp-dk',
};

/* ---------- текст і заголовки ---------- */

export function H2({ children }: { children?: ReactNode }) {
  return (
    <h2 className="font-serif mt-0 mb-3.5 text-[30px] leading-[1.15] font-extrabold tracking-[-0.5px]">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children?: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="font-serif mt-8 mb-2.5 text-[24px] leading-[1.25] font-bold">
      {children}
    </h3>
  );
}

export function H4({ children, id }: { children?: ReactNode; id?: string }) {
  return (
    <h4
      id={id}
      className="text-ink-3 mt-[22px] mb-2 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase"
    >
      {children}
    </h4>
  );
}

export function P({ children }: { children?: ReactNode }) {
  return <p className="text-ink-body my-5 max-w-[60ch] text-[15.5px] leading-[1.75]">{children}</p>;
}

export function Lede({ children }: { children?: ReactNode }) {
  return (
    <p className="text-ink-2 mt-0 mb-5 max-w-[60ch] text-[16.5px] leading-[1.7]">{children}</p>
  );
}

/** Дрібний коментар під абзацом — там, де в HTML був <p style="color:var(--ink-2)">. */
export function Muted({ children }: { children?: ReactNode }) {
  return <p className="text-ink-2 my-3 max-w-[62ch] text-[13px] leading-[1.6]">{children}</p>;
}

/** Англійське речення в прикладі. */
export function En({ children }: { children?: ReactNode }) {
  return <span className="font-semibold">{children}</span>;
}

/** Український переклад — приглушений рядок під англійським. */
export function Ua({ children }: { children?: ReactNode }) {
  return <span className="text-ink-3 block text-[14px] font-normal">{children}</span>;
}

/**
 * Підсвітка дієслова: <M t="ps">shipped</M> · <M t="prp">have fixed</M>.
 *
 * Заливка, а не колір тексту: у тексті часи мусять читатися з відстані, і
 * тло дає це там, де самого чорнила замало — усередині рядка, поруч зі
 * словом, під яким уже стоїть лінія лексики.
 */
export function M({ t, children }: { t: TenseKey; children?: ReactNode }) {
  return (
    <mark className={`rounded-mark px-[5px] py-[2px] font-bold ${ASPECT_MARK[TENSE_ASPECT[t]]}`}>
      {children}
    </mark>
  );
}

export function Badge({ t, children }: { t: TenseKey; children?: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-[5px] text-[11px] font-extrabold tracking-[1.2px] uppercase ${ASPECT_BADGE[TENSE_ASPECT[t]]}`}
    >
      {children}
    </span>
  );
}

export function InlineCode({ children }: { children?: ReactNode }) {
  return (
    <code className="bg-surface-2 rounded-[5px] px-[6px] py-[2px] font-mono text-[13px]">
      {children}
    </code>
  );
}

/* ---------- картки й сітки ---------- */

export function Card({
  children,
  tense,
  className = '',
}: {
  children?: ReactNode;
  /** Колірна смужка згори — коли картка присвячена одному часу */
  tense?: TenseKey;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border-line rounded-card shadow-card my-[18px] border px-[22px] py-5 ${
        tense ? `border-t-4 ${ASPECT_BORDER[TENSE_ASPECT[tense]]}` : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Заголовок усередині картки — менші відступи, ніж у H3 розділу. */
export function CardTitle({ children }: { children?: ReactNode }) {
  return <h3 className="mt-3 mb-1.5 text-[19px] font-extrabold">{children}</h3>;
}

export function Grid2({ children }: { children?: ReactNode }) {
  return <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">{children}</div>;
}

export function Grid3({ children }: { children?: ReactNode }) {
  return <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">{children}</div>;
}

/** Заголовок розділу про конкретний час: кольорова точка + назва. */
export function TenseHead({ t, children }: { t: TenseKey; children?: ReactNode }) {
  return (
    <div className="mb-1 flex items-baseline gap-[13px]">
      <span
        className={`mt-2 h-3.5 w-3.5 flex-none self-start rounded-full ${ASPECT_DOT[TENSE_ASPECT[t]]}`}
      />
      <H2>{children}</H2>
    </div>
  );
}

/**
 * Надпис над заголовком розділу: «Розділ 6». Моноширинний і капітеллю —
 * так він читається як мітка місця, а не як частина назви, і не змагається
 * із заголовком за перший погляд. Колір бере вид часу, якому присвячений
 * розділ; без часу лишається нейтральним.
 */
export function SectionKicker({ tense, children }: { tense?: TenseKey; children?: ReactNode }) {
  const tone = tense ? ASPECT_TEXT[TENSE_ASPECT[tense]] : 'text-ink-3';

  return (
    <div className={`font-mono text-[11px] font-bold tracking-[1.5px] uppercase ${tone}`}>
      {children}
    </div>
  );
}

/* ---------- формула ---------- */

export interface FormulaLine {
  /** Знак форми: + стверджувальна, − заперечна, ? питальна */
  sign?: '+' | '−' | '?';
  body: ReactNode;
  /** Коментар праворуч — приклади або застереження */
  comment?: string;
}

/* Знаки форм беруть ті самі три родини, що й підсвітка часів: стверджувальна
   синю, заперечна теплу червону, питальна жовту. Окремої палітри для формули
   немає — вона б додала четвертий колірний код на той самий екран. */
const SIGN_COLOR: Record<'+' | '−' | '?', string> = {
  '+': 'text-ps',
  '−': 'text-coral',
  '?': 'text-yellow-dk',
};

/**
 * Формула часу. Рядки — типізовані дані, а не preformatted-текст: так
 * вирівнювання не залежить від пробілів у джерелі.
 *
 * Поверхня паперова, а не термінально-чорна: чорне тло лишилось за пасткою,
 * і другий темний блок на тій самій сторінці забирав би в неї всю вагу.
 */
export function Formula({ lines, note }: { lines: readonly FormulaLine[]; note?: string }) {
  return (
    <div className="bg-bg border-line text-ink rounded-note my-5 overflow-x-auto border px-[22px] py-[18px] font-mono text-[13px] leading-[2]">
      <div className="grid gap-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-[18px_1fr] items-baseline gap-x-2">
            <span className={`font-bold ${line.sign ? SIGN_COLOR[line.sign] : ''}`}>
              {line.sign ?? ''}
            </span>
            <span className="min-w-0">
              {line.body}
              {line.comment ? (
                <span className="text-label block italic sm:ml-3 sm:inline">
                  {`// ${line.comment}`}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      {note ? <div className="text-label mt-3 italic">{note}</div> : null}
    </div>
  );
}

/**
 * Формула часу з даних двигуна (`lib/grammar/cards.ts`) — те саме джерело, що
 * й картка слова в читалці, тому теорія і підсвітка не можуть розійтися за
 * побудовою. Рендерить рівно ту саму розмітку, що `<Formula>` з ручними
 * рядками: ролі шматків — це K / Neg / Q.
 */
export function FormulaOf({ tense }: { tense: TenseKey }) {
  const formula = TENSE_FORMULAS[tense];
  if (!formula) return null;

  const roled: Record<'key' | 'neg' | 'q', typeof K> = { key: K, neg: Neg, q: Q };
  const lines: FormulaLine[] = formula.lines.map((line) => ({
    ...(line.sign !== undefined ? { sign: line.sign } : {}),
    body: (
      <>
        {line.parts.map((part, index) => {
          if (typeof part === 'string') return <Fragment key={index}>{part}</Fragment>;
          const Role = roled[part.role];
          return <Role key={index}>{part.text}</Role>;
        })}
      </>
    ),
    ...(line.comment !== undefined ? { comment: line.comment } : {}),
  }));

  return <Formula lines={lines} {...(formula.note !== undefined ? { note: formula.note } : {})} />;
}

/** Ключова частина формули. */
export function K({ children }: { children?: ReactNode }) {
  return <b className="text-ps-tx font-bold">{children}</b>;
}

/** Заперечна форма. */
export function Neg({ children }: { children?: ReactNode }) {
  return <span className="text-coral-tx">{children}</span>;
}

/** Питальна форма. */
export function Q({ children }: { children?: ReactNode }) {
  return <span className="text-yellow-tx">{children}</span>;
}

/** Комментар у формулі. */
export function Cm({ children }: { children?: ReactNode }) {
  return <span className="text-label italic">{children}</span>;
}

/* ---------- список прикладів ---------- */

export function ExList({ children }: { children?: ReactNode }) {
  return (
    <div className="border-line bg-surface shadow-card my-3 overflow-hidden rounded-xl border">
      {children}
    </div>
  );
}

/**
 * Один приклад: англійське речення (children), переклад і пояснення «чому».
 * <Ex ua="Ми перейшли на ECS минулої весни." why="Є маркер last spring.">…</Ex>
 */
export function Ex({
  ua,
  why,
  children,
}: {
  ua?: ReactNode;
  why?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="border-line hover:bg-surface-3 border-b px-4 py-3 last:border-b-0">
      <En>{children}</En>
      {ua ? <Ua>{ua}</Ua> : null}
      {why ? (
        <span className="text-ink-2 border-line mt-[5px] block border-l-2 pl-3 text-[13px]">
          {why}
        </span>
      ) : null}
    </div>
  );
}

/* ---------- неправильно / правильно ---------- */

export function GoodBad({ children }: { children?: ReactNode }) {
  return <div className="my-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>;
}

/**
 * Пара «так кажуть українці / правильно». Рамки немає навмисно: колір
 * поверхні вже каже, яка з двох карток яка, а рамка навколо кольору
 * робила б із порівняння дві коробки замість двох реплік. Речення набране
 * серифним — це англійська, яку читають, а не підпис інтерфейсу.
 */
function Pair({
  tone,
  label,
  children,
}: {
  tone: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-note px-5 py-4 ${tone}`}>
      <div className="mb-2 font-mono text-[10.5px] font-bold tracking-[1px] uppercase">{label}</div>
      <div className="font-serif text-ink text-[16px] leading-[1.6]">{children}</div>
    </div>
  );
}

export function Bad({ children }: { children?: ReactNode }) {
  return (
    <Pair tone="bg-no-bg text-coral-tx" label="Так кажуть українці">
      {children}
    </Pair>
  );
}

export function Good({ children }: { children?: ReactNode }) {
  return (
    <Pair tone="bg-ok-bg text-green-tx" label="Правильно">
      {children}
    </Pair>
  );
}

/** Проміжний випадок: граматично вірно, але носій так не скаже. */
export function Meh({ children }: { children?: ReactNode }) {
  return (
    <Pair tone="bg-pc-bg text-pc-tx" label="Граматично вірно, але важко">
      {children}
    </Pair>
  );
}

/* ---------- виноски ---------- */

type NoteVariant = 'info' | 'warn' | 'trap' | 'tip';

const NOTE_BORDER: Record<NoteVariant, string> = {
  info: 'border-l-ps',
  warn: 'border-l-pc',
  trap: 'border-l-no',
  tip: 'border-l-ok',
};

export function Note({
  variant = 'info',
  title,
  children,
}: {
  variant?: NoteVariant;
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div
      className={`bg-surface shadow-card my-[18px] rounded-r-[10px] border-l-4 px-[18px] py-3.5 ${NOTE_BORDER[variant]}`}
    >
      {title ? (
        <div className="text-ink-3 mb-[5px] text-[12px] font-extrabold tracking-[1px] uppercase">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* ---------- історія мови ---------- */

/**
 * Звідки взялася форма. Навмисно нейтральний сірий: синій, помаранчевий і
 * фіолетовий наскрізь означають три часи (CONCEPT 6), і історія не має
 * вклинюватися в цей код.
 */
export function History({ title, children }: { title?: ReactNode; children?: ReactNode }) {
  return (
    <div className="bg-surface-2 border-ink-3 my-[18px] rounded-r-[10px] border-l-4 px-[18px] py-3.5">
      <div className="text-ink-3 mb-[5px] text-[12px] font-extrabold tracking-[1px] uppercase">
        З історії мови{title ? <> · {title}</> : null}
      </div>
      {children}
    </div>
  );
}

/* ---------- мінімальні пари ---------- */

export function MP({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-line bg-surface shadow-card my-3.5 overflow-hidden rounded-xl border">
      <div className="bg-surface-2 border-line border-b px-4 py-2.5 text-[14.5px] font-bold">
        {title}
      </div>
      {children}
    </div>
  );
}

/** Рядок мінімальної пари: речення (children) і що воно означає (note). */
export function MPRow({ note, children }: { note: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-line hover:bg-surface-3 grid grid-cols-1 gap-3.5 border-b px-4 py-[11px] text-[14.5px] last:border-b-0 sm:grid-cols-[minmax(220px,44%)_1fr]">
      <div>{children}</div>
      <div>{note}</div>
    </div>
  );
}

/* ---------- слова-маркери ---------- */

export function Chips({ children }: { children?: ReactNode }) {
  return <div className="my-2.5 flex flex-wrap gap-2">{children}</div>;
}

export function Chip({ t, children }: { t?: TenseKey; children?: ReactNode }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold ${
        t ? ASPECT_CHIP[TENSE_ASPECT[t]] : 'border-line bg-surface text-ink-2'
      }`}
    >
      {children}
    </span>
  );
}

/* ---------- історія з розбором ---------- */

export function Story({
  translation,
  children,
}: {
  translation: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="bg-bg border-line rounded-note my-5 border px-[22px] py-[18px]">
      <div className="text-ink-3 mb-2.5 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        У живому тексті
      </div>
      <div className="font-serif text-ink text-[16.5px] leading-[1.9]">{children}</div>
      <div className="text-ink-2 mt-2 text-[13px] leading-[1.6]">
        <b className="text-ink">Переклад:</b> {translation}
      </div>
    </div>
  );
}

export function Breakdown({ children }: { children?: ReactNode }) {
  return <div className="mt-3.5">{children}</div>;
}

/** Рядок розбору: форма дієслова і чому саме цей час. */
export function BRow({ form, children }: { form: ReactNode; children?: ReactNode }) {
  return (
    <div className="border-line grid grid-cols-1 gap-3.5 border-b border-dashed py-2.5 text-[15px] last:border-b-0 sm:grid-cols-[minmax(180px,300px)_1fr]">
      <div>{form}</div>
      <div>{children}</div>
    </div>
  );
}

/* ---------- шпаргалка ---------- */

/**
 * Шпаргалка — те, що фотографують і потім дивляться з телефона.
 *
 * Поверхня паперова, а не чорна. Чорне тло тут коштувало найдорожче саме
 * тому, що це найщільніший текст у темі: три кольори часів, задані для
 * світлого паперу, лягали на майже чорне з контрастом, на якому назви
 * часів переставали читатися — а вони в шпаргалці головні.
 */
export function Cheat({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="bg-bg border-line rounded-note my-5 border px-[26px] py-6">
      <h3 className="text-ink-3 mt-0 mb-2 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

/* Ті самі три родини, що й заливка часів. На папері беруться чорнильні
   відтінки (-tx), а не самі кольори: назва часу тут — заголовок рядка, і
   вона мусить читатися як текст, а не світитися. */
const CHEAT_LABEL: Record<Aspect, string> = {
  simple: 'text-ps-tx',
  continuous: 'text-pc-tx',
  perfect: 'text-pp-tx',
};

/**
 * Рядок шпаргалки: назва часу над його довідкою.
 *
 * Назва стоїть саме над, а не збоку: колонка тексту вузька, і фіксовані
 * 180px під підпис лишали половину рядка порожньою рівно там, де довідка
 * найщільніша.
 */
export function CheatRow({
  label,
  t,
  children,
}: {
  label: ReactNode;
  t?: TenseKey;
  children?: ReactNode;
}) {
  return (
    <div className="border-line border-b py-3 last:border-b-0">
      <div
        className={`mb-1.5 text-[13px] font-extrabold ${
          t ? CHEAT_LABEL[TENSE_ASPECT[t]] : 'text-ink-3'
        }`}
      >
        {label}
      </div>
      <div className="text-ink-body text-[14.5px] leading-[1.65]">{children}</div>
    </div>
  );
}

/** Код у шпаргалці — на темному тлі потрібен свій відтінок. */
export function CheatCode({ children }: { children?: ReactNode }) {
  return (
    <code className="bg-panel border-line rounded-[5px] border px-[7px] py-[2px] font-mono text-[13px]">
      {children}
    </code>
  );
}

/* ---------- схеми ---------- */

export function SvgBox({ children, caption }: { children?: ReactNode; caption?: ReactNode }) {
  return (
    <div className="bg-surface border-line rounded-card shadow-card my-[18px] overflow-x-auto border p-[18px]">
      {children}
      {caption ? (
        <div className="text-ink-3 mt-2 text-center text-[13px]">{caption}</div>
      ) : null}
    </div>
  );
}

/* ---------- таблиці (розмітка markdown у MDX) ---------- */

export function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="my-3.5 overflow-x-auto">
      <table className="bg-surface shadow-card w-full border-collapse overflow-hidden rounded-xl text-[14.5px]">
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="bg-surface-2 text-ink-2 border-line border-b px-3 py-[9px] text-left text-[11.5px] font-extrabold tracking-[0.7px] uppercase">
      {children}
    </th>
  );
}

export function Td({ children }: { children?: ReactNode }) {
  return (
    <td className="border-line border-b px-3 py-[9px] align-top last:border-b-0">{children}</td>
  );
}

export function Tr({ children }: { children?: ReactNode }) {
  return <tr className="hover:bg-surface-3">{children}</tr>;
}

/* ---------- списки ---------- */

export function Ul({ children }: { children?: ReactNode }) {
  return <ul className="my-3 list-disc space-y-1.5 pl-6">{children}</ul>;
}

export function Ol({ children }: { children?: ReactNode }) {
  return <ol className="my-3 list-decimal space-y-1.5 pl-6">{children}</ol>;
}

export function Li({ children }: { children?: ReactNode }) {
  return <li className="marker:text-ink-3">{children}</li>;
}

export function Hr() {
  return <hr className="border-line my-8" />;
}

import type { ReactNode } from 'react';

import type { TenseKey } from '@/types/content';

/* ============================================================
   Будівельні блоки контенту тем.
   Кожен компонент — це те, що раніше було CSS-класом у main.css.
   Усі стилі на токенах, тому працюють в обох темах.
   ============================================================ */

const TENSE_TEXT: Record<TenseKey, string> = {
  ps: 'text-ps',
  pc: 'text-pc',
  pp: 'text-pp',
};

const TENSE_BADGE: Record<TenseKey, string> = {
  ps: 'bg-ps-bg text-ps',
  pc: 'bg-pc-bg text-pc',
  pp: 'bg-pp-bg text-pp',
};

const TENSE_BORDER: Record<TenseKey, string> = {
  ps: 'border-t-ps',
  pc: 'border-t-pc',
  pp: 'border-t-pp',
};

const TENSE_DOT: Record<TenseKey, string> = {
  ps: 'bg-ps',
  pc: 'bg-pc',
  pp: 'bg-pp',
};

const TENSE_CHIP: Record<TenseKey, string> = {
  ps: 'border-ps-line bg-ps-bg text-ps-dk',
  pc: 'border-pc-line bg-pc-bg text-pc-dk',
  pp: 'border-pp-line bg-pp-bg text-pp-dk',
};

/* ---------- текст і заголовки ---------- */

export function H2({ children }: { children?: ReactNode }) {
  return (
    <h2 className="mt-0 mb-1.5 text-[27px] font-extrabold tracking-[-0.5px]">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children?: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="mt-[30px] mb-2.5 text-[19.5px] font-extrabold">
      {children}
    </h3>
  );
}

export function H4({ children, id }: { children?: ReactNode; id?: string }) {
  return (
    <h4
      id={id}
      className="text-ink-3 mt-[22px] mb-2 text-[12px] font-extrabold tracking-[0.9px] uppercase"
    >
      {children}
    </h4>
  );
}

export function P({ children }: { children?: ReactNode }) {
  return <p className="my-3.5">{children}</p>;
}

export function Lede({ children }: { children?: ReactNode }) {
  return <p className="text-ink-2 mt-0 mb-5 max-w-[800px] text-[16.5px]">{children}</p>;
}

/** Дрібний коментар під абзацом — там, де в HTML був <p style="color:var(--ink-2)">. */
export function Muted({ children }: { children?: ReactNode }) {
  return <p className="text-ink-2 my-3 text-[15.5px]">{children}</p>;
}

/** Англійське речення в прикладі. */
export function En({ children }: { children?: ReactNode }) {
  return <span className="font-semibold">{children}</span>;
}

/** Український переклад — приглушений рядок під англійським. */
export function Ua({ children }: { children?: ReactNode }) {
  return <span className="text-ink-3 block text-[14px] font-normal">{children}</span>;
}

/** Підсвітка дієслова кольором часу: <M t="ps">shipped</M>. */
export function M({ t, children }: { t: TenseKey; children?: ReactNode }) {
  return <mark className={`bg-transparent p-0 font-bold ${TENSE_TEXT[t]}`}>{children}</mark>;
}

export function Badge({ t, children }: { t: TenseKey; children?: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-[5px] text-[11px] font-extrabold tracking-[1.2px] uppercase ${TENSE_BADGE[t]}`}
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
        tense ? `border-t-4 ${TENSE_BORDER[tense]}` : ''
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
    <div className="mb-1 flex items-center gap-[13px]">
      <span className={`h-3.5 w-3.5 flex-none rounded-full ${TENSE_DOT[t]}`} />
      <H2>{children}</H2>
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

const SIGN_COLOR: Record<'+' | '−' | '?', string> = {
  '+': 'text-[#7dd3fc]',
  '−': 'text-[#fca5a5]',
  '?': 'text-[#fcd34d]',
};

/**
 * Темний блок з формулою часу. Рядки — типізовані дані, а не preformatted-текст:
 * так вирівнювання не залежить від пробілів у джерелі.
 */
export function Formula({ lines, note }: { lines: readonly FormulaLine[]; note?: string }) {
  return (
    <div className="bg-deep text-deep-ink my-3 overflow-x-auto rounded-xl px-5 py-[18px] font-mono text-[13.5px] leading-[2]">
      <div className="grid gap-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-[18px_1fr] items-baseline gap-x-2">
            <span className={`font-bold ${line.sign ? SIGN_COLOR[line.sign] : ''}`}>
              {line.sign ?? ''}
            </span>
            <span className="min-w-0">
              {line.body}
              {line.comment ? (
                <span className="block text-[#7c8aa8] italic sm:ml-3 sm:inline">
                  {`// ${line.comment}`}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
      {note ? <div className="mt-3 text-[#7c8aa8] italic">{note}</div> : null}
    </div>
  );
}

/** Ключова частина формули. */
export function K({ children }: { children?: ReactNode }) {
  return <b className="font-bold text-[#7dd3fc]">{children}</b>;
}

/** Заперечна форма. */
export function Neg({ children }: { children?: ReactNode }) {
  return <span className="text-[#fca5a5]">{children}</span>;
}

/** Питальна форма. */
export function Q({ children }: { children?: ReactNode }) {
  return <span className="text-[#fcd34d]">{children}</span>;
}

/** Комментар у формулі. */
export function Cm({ children }: { children?: ReactNode }) {
  return <span className="text-[#7c8aa8] italic">{children}</span>;
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
  return <div className="my-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>;
}

export function Bad({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-no-bg border-no rounded-xl border px-4 py-3.5 text-[15px]">
      <span className="text-no mb-1.5 block text-[11px] font-extrabold tracking-[1px]">
        ✗ НЕПРАВИЛЬНО
      </span>
      {children}
    </div>
  );
}

export function Good({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-ok-bg border-ok rounded-xl border px-4 py-3.5 text-[15px]">
      <span className="text-ok mb-1.5 block text-[11px] font-extrabold tracking-[1px]">
        ✓ ПРАВИЛЬНО
      </span>
      {children}
    </div>
  );
}

/** Проміжний випадок: граматично вірно, але носій так не скаже. */
export function Meh({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-pc-bg border-pc rounded-xl border px-4 py-3.5 text-[15px]">
      <span className="text-pc-dk mb-1.5 block text-[11px] font-extrabold tracking-[1px]">
        △ ГРАМАТИЧНО ВІРНО, АЛЕ ВАЖКО
      </span>
      {children}
    </div>
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
        t ? TENSE_CHIP[t] : 'border-line bg-surface text-ink-2'
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
    <div className="bg-surface border-line rounded-card shadow-card my-[18px] border px-[26px] py-[22px]">
      <div className="text-[17px] leading-[2]">{children}</div>
      <div className="border-line text-ink-2 mt-3.5 border-t pt-3.5 text-[15px]">
        <b>Переклад:</b> {translation}
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

export function Cheat({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className="bg-deep text-deep-ink rounded-card my-5 px-[26px] py-6">
      <h3 className="mt-0 mb-2 text-[17px] font-extrabold tracking-[0.6px] text-white">{title}</h3>
      {children}
    </div>
  );
}

const CHEAT_LABEL: Record<TenseKey, string> = {
  ps: 'text-[#7dd3fc]',
  pc: 'text-[#fcd34d]',
  pp: 'text-[#c4b5fd]',
};

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
    <div className="border-deep-line grid grid-cols-1 items-start gap-3.5 border-b py-3 last:border-b-0 sm:grid-cols-[180px_1fr]">
      <div className={`text-[13px] font-extrabold ${t ? CHEAT_LABEL[t] : 'text-[#94a3b8]'}`}>
        {label}
      </div>
      <div className="text-deep-ink text-[14.5px]">{children}</div>
    </div>
  );
}

/** Код у шпаргалці — на темному тлі потрібен свій відтінок. */
export function CheatCode({ children }: { children?: ReactNode }) {
  return (
    <code className="bg-deep-2 rounded-[5px] px-[7px] py-[2px] font-mono text-[13px]">
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

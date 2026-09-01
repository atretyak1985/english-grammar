import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Живий приклад у героєві: одне речення, у якому обидва канали
 * підсвітки працюють одночасно.
 *
 * Це доказ, а не оздоба. Аудит показав, що головна не давала побачити
 * продукт до реєстрації: людина читала обіцянку й мусила вірити на
 * слово. Тут вона бачить рівно те, що отримає в читанні — заливку часів
 * і підкреслення слів, — до будь-якого кліку.
 *
 * Речення й розбір сталі: це фіксований зразок, а не результат аналізу
 * тексту користувача. Тому часи прописані прямо тут — на сталому реченні
 * це і є правильна відповідь, а не заглушка.
 */

/** Канал граматики — заливка. Один клас на родину часу. */
const FILL = {
  simple: 'bg-ps-bg text-ps-tx',
  continuous: 'bg-pc-bg text-pc-tx',
  perfect: 'bg-pp-bg text-pp-tx',
} as const;

const CHIPS = [
  { label: 'Past Simple · 3', chip: 'bg-ps-bg text-ps-tx', dot: 'bg-ps' },
  { label: 'Continuous · 2', chip: 'bg-pc-bg text-pc-tx', dot: 'bg-pc' },
  { label: 'Perfect · 1', chip: 'bg-pp-bg text-pp-tx', dot: 'bg-pp' },
];

export function LiveSample() {
  return (
    <div className="bg-panel border-line rounded-panel shadow-card flex h-full flex-col border px-[30px] py-8">
      <div className="mb-4 flex flex-wrap gap-2">
        {CHIPS.map((item) => (
          <span
            key={item.label}
            className={`rounded-pill flex items-center gap-1.5 px-[13px] py-1.5 text-[12.5px] font-bold ${item.chip}`}
          >
            <span className={`h-2 w-2 rounded-[2px] ${item.dot}`} aria-hidden />
            {item.label}
          </span>
        ))}
      </div>

      {/* Речення росте на всю вільну висоту картки й стоїть по центру:
          картка тягнеться за герой-колонкою, а не стискається під текст. */}
      <div className="flex flex-1 items-center py-2">
        <p className="font-serif text-ink m-0 text-[18.5px] leading-[1.95]">
          I <Time kind="continuous">was reviewing</Time> a pull request when the{' '}
          <Learning>pager</Learning> <Time kind="simple">went</Time> off. A{' '}
          <Unknown>migration</Unknown> <Time kind="perfect">had failed</Time> silently, and alerts{' '}
          <Time kind="simple">flooded</Time> the channel while we{' '}
          <Time kind="continuous">were deploying</Time> a fix.
        </p>
      </div>

      <div className="border-line mt-4 flex items-center justify-between border-t border-dashed pt-3.5">
        <span className="text-ink-3 text-[12.5px]">
          Це живий приклад — так виглядає будь-який текст у читанні
        </span>
        <Link href="/reading" className="text-acc text-[13.5px] font-bold">
          Читати далі →
        </Link>
      </div>
    </div>
  );
}

/** Час: заливка. Округлення 4px — рівно стільки, щоб не читалось як кнопка. */
function Time({ kind, children }: { kind: keyof typeof FILL; children: ReactNode }) {
  return <span className={`rounded-mark px-[5px] py-[2px] ${FILL[kind]}`}>{children}</span>;
}

/** Слово в роботі («вчу») — жовтий маркер під рядком. */
function Learning({ children }: { children: ReactNode }) {
  return <span className="border-yellow bg-yellow-bg border-b-[3px]">{children}</span>;
}

/** Незнайоме слово («не знаю») — пунктир: помітно, але не тягне око. */
function Unknown({ children }: { children: ReactNode }) {
  return <span className="border-lex-line border-b-2 border-dotted">{children}</span>;
}

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Topbar } from '@/components/shell/Topbar';

/**
 * Оболонка застосунку: липкий топбар і колонка контенту під ним.
 *
 * Компонент серверний і без стану — цього досить, відколи пішов
 * сайдбар: шухляди, згортання й активного розділу тут більше немає,
 * а активний пункт знає сам топбар зі шляху. Стан оболонки, який
 * лишався між переходами, тепер просто нікому не потрібен.
 */
export function AppShell({
  children,
  signedIn,
  initial,
}: {
  children: ReactNode;
  signedIn: boolean;
  initial: string | null;
}) {
  return (
    <div className="bg-bg flex min-h-screen flex-col">
      <Topbar signedIn={signedIn} initial={initial} />

      <main className="min-w-0 flex-1">{children}</main>

      {/* Підвал стоїть на панелі, а не на тлі: інакше він читається як
          продовження сторінки, а не як її край.
          ------------------------------------------------------------
          Рядок посилань праворуч — не дубль топбара. Топбар веде туди, де
          працюють; підвал — туди, куди приходять з питанням («скільки це
          коштує», «звідки тексти», «як написати»), і саме тому «Тарифи» і
          «Джерела текстів» живуть тут, а не в навігації.
          ------------------------------------------------------------
          leading-[1.5] — метрика макета. `body` несе 1.6 заради довгого
          читання, і на 16px логотипа підвала різниця дає зайвий піксель. */}
      <footer className="bg-panel border-line border-t">
        <div className="text-ink-3 mx-auto flex max-w-shell flex-wrap items-center gap-6 px-10 py-7 text-[13.5px] leading-[1.5]">
          <span className="font-serif text-ink text-[16px] font-extrabold">GrammaLens</span>
          <span>Граматика англійської українською</span>
          <nav aria-label="Підвал" className="ml-auto flex flex-wrap gap-[22px]">
            <Link href="/topics" className="text-ink-2">
              Правила
            </Link>
            <Link href="/pricing" className="text-ink-2">
              Тарифи
            </Link>
            <Link href="/reading" className="text-ink-2">
              Джерела текстів
            </Link>
            <a href="mailto:atretiak.work@gmail.com" className="text-ink-2">
              Написати нам
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

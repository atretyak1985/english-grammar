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

      <footer className="border-line text-ink-3 border-t text-[13px]">
        <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-4 px-9 pt-6 pb-8">
          <div>Граматика англійської — особистий навчальний проєкт</div>
          <div>Пояснення українською, тексти англійською</div>
        </div>
      </footer>
    </div>
  );
}

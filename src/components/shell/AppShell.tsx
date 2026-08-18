'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { ContentHeader } from '@/components/shell/ContentHeader';
import { Sidebar } from '@/components/shell/Sidebar';

/**
 * Оболонка застосунку: сайдбар завжди на екрані, контент перемикається без
 * перезавантаження — тому стан і смужка прогресу не блимають (CONCEPT 2).
 * На вузьких екранах сайдбар стає шухлядою.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [shownFor, setShownFor] = useState(pathname);

  // Перехід на інший екран завжди закриває шухляду — коригуємо стан під час
  // рендера, щоб шухляда не блимала після зміни маршруту.
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-dvh lg:pl-[300px]">
      {/* Постійний сайдбар на широких екранах */}
      <aside className="border-deep-line fixed inset-y-0 left-0 z-40 hidden w-[300px] border-r lg:block">
        <Sidebar />
      </aside>

      {/* Шухляда на вузьких */}
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[300px] max-w-[85vw] lg:hidden">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </>
      ) : null}

      <div className="flex min-h-dvh flex-col">
        <ContentHeader onOpenSidebar={() => setOpen(true)} />
        <main className="flex-1">{children}</main>
        <footer className="border-line text-ink-3 mt-14 border-t py-8 text-center text-[13.5px]">
          Граматика англійської — особистий навчальний проєкт
        </footer>
      </div>
    </div>
  );
}

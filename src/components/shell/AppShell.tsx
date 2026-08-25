'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { ContentHeader } from '@/components/shell/ContentHeader';
import { DecorShapes } from '@/components/shell/DecorShapes';
import { Sidebar } from '@/components/shell/Sidebar';

/**
 * Оболонка застосунку: сайдбар завжди на екрані, контент перемикається без
 * перезавантаження — тому стан і смужка прогресу не блимають (CONCEPT 2).
 * На широких екранах це grid 292px + решта, на вузьких сайдбар стає шухлядою.
 * Згорнутий сайдбар — 84px, самі значки: колонка тем на вузькому моніторі
 * коштує дорожче, ніж підписи розділів.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [shownFor, setShownFor] = useState(pathname);

  // Перехід на інший екран завжди закриває шухляду — коригуємо стан під час
  // рендера, щоб шухляда не блимала після зміни маршруту.
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setOpen(false);
  }

  return (
    <div
      className="bg-bg relative grid min-h-screen lg:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]"
      style={
        {
          '--sidebar-w': collapsed
            ? 'var(--spacing-sidebar-mini)'
            : 'var(--spacing-sidebar)',
        } as React.CSSProperties
      }
    >
      <DecorShapes />

      {/* Постійний сайдбар на широких екранах */}
      <aside className="sticky top-0 hidden h-screen self-start lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((it) => !it)} />
      </aside>

      {/* Шухляда на вузьких */}
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[var(--spacing-sidebar)] max-w-[85vw] lg:hidden">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </>
      ) : null}

      <main className="relative min-w-0">
        <ContentHeader onOpenSidebar={() => setOpen(true)} />
        {children}
        <footer className="border-line text-ink-3 border-t text-[13.5px]">
          <div className="mx-auto flex max-w-content flex-wrap justify-between gap-4 px-[30px] pt-[26px] pb-[34px]">
            <div>Граматика англійської — особистий навчальний проєкт</div>
            <div>Пояснення українською, приклади англійською</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

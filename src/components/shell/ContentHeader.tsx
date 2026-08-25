'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { TOPICS } from '@/data/topics';

const SCREEN_TITLES: Record<string, string> = {
  '/': 'Головна',
  '/analyze': 'Аналізатор',
  '/library': 'Бібліотека',
  '/words': 'Словник',
  '/account': 'Кабінет',
  '/login': 'Вхід',
  '/pricing': 'Тарифи',
};

/**
 * Шапка контенту: хлібна крихта, пошук, дзвінок і пара швидких переходів
 * до текстів (CONCEPT 3.3). Це рядок у потоці, а не липка панель: макет
 * лишає верх екрана контенту, і будь-яка смуга над ним зсунула б усе нижче.
 */
export function ContentHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { signedIn } = useAppState();
  const [query, setQuery] = useState('');

  const [, topicSlug] = /^\/topics\/([^/]+)/.exec(pathname) ?? [];
  const topic = TOPICS.find((item) => item.slug === topicSlug);
  const crumb = topic ? 'Теми' : (SCREEN_TITLES[pathname] ?? '');

  return (
    <header className="mx-auto flex w-full max-w-shell items-center gap-2.5 px-9 pt-5 pb-3.5 leading-[normal]">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="border-line text-ink-2 rounded-chip mr-1 cursor-pointer border px-2.5 py-1 text-[13px] leading-[normal] font-bold lg:hidden"
        aria-label="Відкрити навігацію"
      >
        ☰
      </button>

      <span className="text-ink-3 truncate text-[10.5px] font-extrabold tracking-[0.14em] uppercase">
        GrammaLens <span className="text-acc">›</span> {crumb}
      </span>

      <div className="ml-auto flex flex-none items-center gap-2.5">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Пошук тем чи книг…"
          className="border-line bg-card text-ink rounded-pill focus:border-acc hidden w-[220px] border px-4 py-[9px] text-[12.5px] leading-[normal] font-semibold outline-none md:block"
        />

        <button
          type="button"
          title="Сповіщення"
          aria-label="Сповіщення"
          className="border-line bg-card text-ink-2 rounded-ctrl hover:bg-tint relative flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center border"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="bg-coral absolute top-2 right-[9px] h-[7px] w-[7px] rounded-full" />
        </button>

        <span className="bg-card border-line rounded-pill inline-flex flex-none border p-[3px]">
          {/*
            Гостю аналізатор закритий: `/api/analyze` віддає 401
            (`resolveAccess`). Тому «Мій текст» для нього не показуємо —
            інакше найпомітніший перехід шапки веде в тупик.
          */}
          {signedIn ? (
            <HeaderTab href="/analyze" active={pathname === '/analyze'}>
              Мій текст
            </HeaderTab>
          ) : null}
          <HeaderTab href="/library" active={pathname.startsWith('/library')}>
            Бібліотека
          </HeaderTab>
        </span>
      </div>
    </header>
  );
}

function HeaderTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-pill px-4 py-[7px] text-[12px] leading-[normal] font-extrabold ${
        active ? 'bg-tint text-acc' : 'text-ink-2'
      }`}
    >
      {children}
    </Link>
  );
}

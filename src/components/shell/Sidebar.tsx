'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useActiveSection } from '@/components/shell/ActiveSectionProvider';
import { ProgressRing } from '@/components/shell/ProgressRing';
import { useSectionNav } from '@/components/shell/useSectionNav';
import { LEVEL_COLOR, TOPICS } from '@/data/topics';

/** Верхня група сайдбара — розділи застосунку (CONCEPT 3.1). */
const APP_SECTIONS = [
  { href: '/', label: 'Головна', desc: 'Огляд і статистика', icon: '🏠' },
  { href: '/analyze', label: 'Аналіз тексту', desc: 'Підсвітка часів у вашому тексті', icon: '🔍' },
  { href: '/words', label: 'Слова', desc: 'Частотний словник зі статусами', icon: '🗂' },
  { href: '/account', label: 'Кабінет', desc: 'Прогрес, тексти, налаштування', icon: '👤' },
] as const;

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(needle));
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { readCount, isSectionRead, signedIn, state } = useAppState();
  const { activeId } = useActiveSection();
  const goToSection = useSectionNav();

  const activeTopic = useMemo(() => {
    const match = /^\/topics\/([^/]+)/.exec(pathname);
    const slug = match?.[1] ?? state.lastTopic;
    return TOPICS.find((topic) => topic.slug === slug && topic.ready);
  }, [pathname, state.lastTopic]);

  const appSections = APP_SECTIONS.filter((item) => matches(query, item.label, item.desc));
  const topics = TOPICS.filter((topic) => matches(query, topic.title, topic.desc));

  return (
    <div className="bg-deep text-deep-ink-2 flex h-full flex-col">
      <div className="border-deep-line flex h-[52px] items-center gap-2 border-b px-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-[15px] font-bold text-white"
        >
          📘 <span>Граматика англійської</span>
        </Link>
      </div>

      {/* Пошук фільтрує три списки одночасно (CONCEPT 3.2) */}
      <div className="px-3 pt-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Пошук: розділ, тема, правило"
          className="border-deep-line placeholder:text-deep-ink-2/60 focus:border-ps w-full rounded-lg border bg-black/25 px-3 py-2 text-[13.5px] text-white outline-none"
        />
      </div>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
        <SidebarLabel>Навчання</SidebarLabel>
        <ul className="mb-4 space-y-0.5">
          {appSections.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold transition ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-deep-ink-2 hover:bg-white/6 hover:text-white'
                  }`}
                >
                  <span aria-hidden className="text-[15px]">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
          {appSections.length === 0 ? <SidebarEmpty /> : null}
        </ul>

        <SidebarLabel>Теми</SidebarLabel>
        <ul className="space-y-0.5">
          {topics.map((topic) => {
            const isActive = activeTopic?.slug === topic.slug;
            const read = readCount(topic.slug);
            const sectionsShown = topic.sections.filter((section) =>
              matches(query, section.title, section.short),
            );

            return (
              <li key={topic.slug}>
                {topic.ready ? (
                  <Link
                    href={`/topics/${topic.slug}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold transition ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-deep-ink-2 hover:bg-white/6 hover:text-white'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 flex-none rounded-full ${LEVEL_COLOR[topic.level]}`}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{topic.title}</span>
                    <span className="text-deep-ink-2/70 text-[12px] font-bold">
                      {read}/{topic.sections.length}
                    </span>
                  </Link>
                ) : (
                  <div className="text-deep-ink-2/45 flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold">
                    <span className="bg-deep-line h-2 w-2 flex-none rounded-full" aria-hidden />
                    <span className="flex-1 truncate">{topic.title}</span>
                    <span className="text-[12px]">скоро</span>
                  </div>
                )}

                {/* Активна тема розкривається у вкладений список розділів */}
                {isActive && sectionsShown.length > 0 ? (
                  <ul className="border-deep-line mt-1 mb-2 ml-4 space-y-px border-l pl-2">
                    {sectionsShown.map((section) => {
                      const done = isSectionRead(topic.slug, section.id);
                      const current = activeId === section.id;
                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => {
                              goToSection(topic.slug, section.id);
                              onNavigate?.();
                            }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-left text-[13px] transition ${
                              current
                                ? 'bg-white/10 font-semibold text-white'
                                : 'text-deep-ink-2/85 hover:bg-white/6 hover:text-white'
                            }`}
                          >
                            <span className="text-deep-ink-2/50 w-4 flex-none text-[11px] font-bold">
                              {section.n}
                            </span>
                            <span className="flex-1 truncate">{section.short ?? section.title}</span>
                            {done ? (
                              <span className="text-ok flex-none text-[12px]" aria-label="прочитано">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
          {topics.length === 0 ? <SidebarEmpty /> : null}
        </ul>
      </nav>

      {/* Прогрес активної теми */}
      {activeTopic ? (
        <div className="border-deep-line flex items-center gap-3 border-t px-4 py-3">
          <ProgressRing
            read={readCount(activeTopic.slug)}
            total={activeTopic.sections.length}
            size={42}
          />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-white">{activeTopic.title}</div>
            <div className="text-deep-ink-2/70 text-[12px]">
              {readCount(activeTopic.slug)} з {activeTopic.sections.length} розділів
            </div>
          </div>
        </div>
      ) : null}

      {/* Стан «гість» (CONCEPT 8.4) */}
      {!signedIn ? (
        <div className="border-deep-line text-deep-ink-2/80 border-t px-4 py-3 text-[12.5px]">
          Прогрес зберігається лише в цьому браузері.{' '}
          <Link href="/login" onClick={onNavigate} className="text-[#c4b5fd] font-semibold">
            Увійти →
          </Link>
        </div>
      ) : (
        <div className="border-deep-line border-t px-4 py-3 text-[12.5px]">
          <Link href="/account" onClick={onNavigate} className="font-semibold text-white">
            Кабінет →
          </Link>
        </div>
      )}

      <div className="border-deep-line flex items-center justify-between border-t px-4 py-3">
        <span className="text-deep-ink-2/70 text-[12.5px] font-semibold">Тема оформлення</span>
        <button
          type="button"
          onClick={toggleTheme}
          className="border-deep-line hover:border-line-strong cursor-pointer rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold text-white"
          aria-label="Перемкнути тему оформлення"
        >
          {theme === 'dark' ? '🌙 Темна' : '☀️ Світла'}
        </button>
      </div>
    </div>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-deep-ink-2/50 px-2.5 pb-1.5 text-[11px] font-extrabold tracking-[1.2px] uppercase">
      {children}
    </div>
  );
}

function SidebarEmpty() {
  return <li className="text-deep-ink-2/45 px-2.5 py-1.5 text-[13px]">Нічого не знайдено</li>;
}

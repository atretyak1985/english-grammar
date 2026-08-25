'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { StreakCard } from '@/components/shell/StreakCard';
import { useActiveSection } from '@/components/shell/useActiveSection';
import { LEVEL_COLOR, TOPICS } from '@/data/topics';

interface AppSection {
  href: string | null;
  label: string;
  desc: string;
  icon: ReactNode;
  /**
   * Показувати лише після входу. Гість, який тисне такий розділ, або летить на
   * `/login` (`/account`), або впирається в 401 на першому ж розборі
   * (`/analyze`) — тобто посилання обіцяє те, чого за ним немає. Ховати його
   * чесніше, ніж вести в тупик.
   */
  authOnly?: boolean;
  badge?: 'new' | 'beta';
  /** Показувати лічильник словника праворуч */
  counter?: boolean;
}

/** Іконки навігації — той самий штрих 2.75 на сітці 24, що й у макеті. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Верхня група сайдбара — розділи застосунку (CONCEPT 3.1). */
const APP_SECTIONS: readonly AppSection[] = [
  {
    href: '/',
    label: 'Головна',
    desc: 'Огляд і статистика',
    icon: <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />,
  },
  {
    href: '/analyze',
    label: 'Аналізатор',
    desc: 'Підсвітка часів у вашому тексті',
    authOnly: true,
    icon: (
      <>
        <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2Z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7Z" />
      </>
    ),
  },
  {
    href: '/library',
    label: 'Бібліотека',
    desc: 'Оповідання з готовою підсвіткою',
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
      </>
    ),
  },
  {
    /*
      Практика ще не існує як маршрут. Тому рядок не посилання: клікабельна
      навігація, що нікуди не веде, — це та сама обіцянка в тупик, від якої
      ховаються `authOnly`-розділи. Значок «НОВЕ» лишається: він анонсує, а
      не запрошує.
    */
    href: null,
    label: 'Практика',
    desc: 'Міні-ігри зі словами',
    badge: 'new',
    icon: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  },
  {
    href: '/words',
    label: 'Словник',
    desc: 'Частотний словник зі статусами',
    badge: 'beta',
    counter: true,
    icon: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
  },
  {
    href: '/account',
    label: 'Кабінет',
    desc: 'Прогрес, тексти, налаштування',
    authOnly: true,
    icon: (
      <>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </>
    ),
  },
];

/** Один стиль рядка навігації: активний заливається мʼятою. */
function navRow(active: boolean, collapsed: boolean): string {
  return `flex items-center gap-[11px] rounded-nav px-3 py-2 text-left text-[14px] leading-[normal] transition-colors ${
    collapsed ? 'justify-center' : ''
  } ${active ? 'bg-tint text-acc font-extrabold' : 'text-ink-2 hover:bg-tint font-bold'}`;
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(needle));
}

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { readCount, isSectionRead, signedIn, state, resetProgress } = useAppState();
  const { sectionSlug } = useActiveSection();

  const activeTopic = useMemo(() => {
    const match = /^\/topics\/([^/]+)/.exec(pathname);
    const slug = match?.[1] ?? state.lastTopic;
    return TOPICS.find((topic) => topic.slug === slug && topic.ready);
  }, [pathname, state.lastTopic]);

  const words = Object.values(state.words);
  const dictCount = words.filter((status) => status !== 'unknown').length;

  const appSections = APP_SECTIONS.filter(
    (item) => (signedIn || !item.authOnly) && matches(query, item.label, item.desc),
  );
  const topics = TOPICS.filter((topic) => matches(query, topic.title, topic.desc));

  const progressTopic = activeTopic ?? TOPICS.find((topic) => topic.ready);
  const progressRead = progressTopic ? readCount(progressTopic.slug) : 0;

  return (
    <div className="bg-panel border-line flex h-full flex-col border-r leading-[normal]">
      <div className="flex flex-wrap items-center justify-center gap-2.5 px-3.5 pt-[18px] pb-2.5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-inherit"
        >
          <span
            className="h-[46px] w-[46px] flex-none"
            style={{ animation: 'gl-bob 3.5s ease-in-out infinite' }}
            aria-hidden
          >
            <LogoLens />
          </span>
          {collapsed ? null : (
            <span className="min-w-0">
              {/* Назва й підпис не обрізаються трикрапкою: підпис переносить
                  другий рядок, і саме він задає висоту шапки сайдбара. */}
              <span className="font-display block text-[19px] leading-[1.05] font-extrabold">
                GrammaLens
              </span>
              <span className="text-ink-3 block text-[11px] font-bold">
                англійська українською
              </span>
            </span>
          )}
        </Link>
        {collapsed ? null : (
          <button
            type="button"
            onClick={toggleTheme}
            title="Тема"
            aria-label="Перемкнути тему оформлення"
            className="border-line bg-tint text-ink-2 rounded-ctrl h-9 w-9 flex-none cursor-pointer border text-[15px] leading-[normal]"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          title="Згорнути / розгорнути"
          aria-label={collapsed ? 'Розгорнути навігацію' : 'Згорнути навігацію'}
          className="border-line bg-card text-ink-2 rounded-ctrl h-9 w-9 flex-none cursor-pointer border text-[16px] leading-[normal] font-extrabold"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <nav className="scrollbar-none flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2 pb-3">
        {collapsed ? null : <SidebarLabel>Навчання</SidebarLabel>}
        {appSections.map((item) => {
          const content = (
            <>
              <span className="bg-tint text-acc rounded-chip flex h-8 w-8 flex-none items-center justify-center">
                <Icon>{item.icon}</Icon>
              </span>
              {collapsed ? null : (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge === 'new' ? (
                    <span className="bg-coral rounded-pill px-[9px] py-0.5 text-[9.5px] font-extrabold tracking-[0.06em] text-white">
                      НОВЕ
                    </span>
                  ) : null}
                  {item.badge === 'beta' ? (
                    <span className="bg-tint text-acc rounded-pill px-2 py-0.5 text-[9px] font-extrabold tracking-[0.06em]">
                      BETA
                    </span>
                  ) : null}
                  {item.counter ? (
                    <span className="text-ink-3 text-[11.5px] font-extrabold">{dictCount}</span>
                  ) : null}
                </>
              )}
            </>
          );

          return item.href === null ? (
            <div
              key={item.label}
              className={`${navRow(false, collapsed)} cursor-default opacity-60`}
              title={collapsed ? item.label : undefined}
            >
              {content}
            </div>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={navRow(pathname === item.href, collapsed)}
              title={collapsed ? item.label : undefined}
            >
              {content}
            </Link>
          );
        })}
        {appSections.length === 0 ? <SidebarEmpty /> : null}

        {collapsed ? null : (
          <>
            <SidebarLabel className="pt-3.5">Теми</SidebarLabel>
            {/* Пошук фільтрує обидва списки одночасно (CONCEPT 3.2) */}
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Пошук тем…"
              className="border-line bg-tint text-ink rounded-chip focus:border-acc mx-2.5 mt-0.5 mb-1.5 w-[calc(100%-20px)] border px-3 py-2 text-[12.5px] leading-[normal] font-semibold outline-none"
            />

            {topics.map((topic) => {
              const isActive = activeTopic?.slug === topic.slug;
              const read = readCount(topic.slug);
              const total = topic.sections.length;
              const percent = total === 0 ? 0 : Math.round((read / total) * 100);
              const sectionsShown = topic.sections.filter((section) =>
                matches(query, section.title, section.short),
              );

              const row = (
                <>
                  <span
                    className={`h-[9px] w-[9px] flex-none rounded-full ${LEVEL_COLOR[topic.level]}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{topic.title}</span>
                  <span className="flex flex-none flex-col items-end gap-[3px]">
                    <span className="text-ink-3 text-[10px] font-extrabold">
                      {topic.ready ? `${read}/${total}` : 'скоро'}
                    </span>
                    {topic.ready ? (
                      <span className="bg-tint rounded-pill block h-1 w-11 overflow-hidden">
                        <span
                          className="bg-acc rounded-pill block h-full"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                    ) : null}
                  </span>
                </>
              );

              return (
                <div key={topic.slug}>
                  {topic.ready ? (
                    <Link
                      href={`/topics/${topic.slug}`}
                      onClick={onNavigate}
                      className={topicRow(isActive)}
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className={`${topicRow(false)} cursor-default opacity-45`}>{row}</div>
                  )}

                  {/* Активна тема розкривається у вкладений список розділів */}
                  {isActive && sectionsShown.length > 0 ? (
                    <div className="border-line mt-[3px] mb-2 ml-[19px] flex flex-col gap-px border-l pl-[11px]">
                      {sectionsShown.map((section) => {
                        const done = isSectionRead(topic.slug, section.id);
                        const current = sectionSlug === section.slug;
                        return (
                          <Link
                            key={section.slug}
                            href={`/topics/${topic.slug}/${section.slug}`}
                            onClick={onNavigate}
                            className={`flex w-full items-center gap-[7px] rounded-[10px] px-2 py-[5px] text-left text-[12.5px] leading-[normal] ${
                              current
                                ? 'bg-tint text-acc font-extrabold'
                                : 'text-ink-2 hover:bg-tint font-semibold'
                            }`}
                          >
                            <span className="text-ink-3 w-[15px] flex-none text-[11px] font-bold">
                              {section.n}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {section.short ?? section.title}
                            </span>
                            <span className="text-acc flex-none text-[11px]">
                              {done ? '✓' : ''}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {topics.length === 0 ? <SidebarEmpty /> : null}

            {/*
              Скидання прогресу зʼявляється лише тоді, коли є що скидати.
              Порожня кнопка на чистому стані нічого не робить і забирає в
              підвалі місце в тих блоків, які показують стан справді.
            */}
            {progressTopic && progressRead > 0 ? (
              <button
                type="button"
                onClick={() => resetProgress(progressTopic.slug)}
                className="border-line text-ink-3 hover:text-ink hover:border-ink-3 mx-2.5 mt-3 cursor-pointer rounded-chip border px-2.5 py-1.5 text-[11.5px] leading-[normal] font-bold"
              >
                Скинути прогрес
              </button>
            ) : null}
          </>
        )}
      </nav>

      {collapsed ? null : <StreakCard signedIn={signedIn} onNavigate={onNavigate} />}
    </div>
  );
}

/** Рядок теми: крапка рівня, назва, лічильник і смужка прочитаного. */
function topicRow(active: boolean): string {
  return `flex w-full items-center gap-2.5 rounded-tile px-3 py-[7px] text-left text-[13px] leading-[normal] transition-colors ${
    active ? 'bg-tint text-acc font-extrabold' : 'text-ink-2 hover:bg-tint font-bold'
  }`;
}

function LogoLens() {
  return (
    <svg viewBox="0 0 120 120" width="46" height="46">
      <defs>
        <linearGradient id="glLogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <line
        x1="82"
        y1="78"
        x2="106"
        y2="106"
        stroke="url(#glLogo)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <circle cx="54" cy="50" r="38" fill="#ffffff" />
      <circle cx="54" cy="50" r="38" fill="none" stroke="url(#glLogo)" strokeWidth="11" />
      <path d="M36 42 Q42 30 56 28" fill="none" stroke="#ddd3ff" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function SidebarLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`text-ink-3 px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-[0.14em] uppercase ${className}`}
    >
      {children}
    </div>
  );
}

function SidebarEmpty() {
  return <div className="text-ink-3 px-3 py-1.5 text-[13px]">Нічого не знайдено</div>;
}

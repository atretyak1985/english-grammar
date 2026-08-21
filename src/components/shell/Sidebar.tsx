'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useActiveSection } from '@/components/shell/useActiveSection';
import { ProgressRing } from '@/components/shell/ProgressRing';
import { LEVEL_COLOR, TOPICS } from '@/data/topics';
import type { Level } from '@/types/content';

interface AppSection {
  href: string;
  label: string;
  desc: string;
  icon: string;
  /**
   * Показувати лише після входу. Гість, який тисне такий розділ, або летить на
   * `/login` (`/account`), або впирається в 401 на першому ж розборі
   * (`/analyze`) — тобто посилання обіцяє те, чого за ним немає. Ховати його
   * чесніше, ніж вести в тупик.
   */
  authOnly?: boolean;
}

/** Верхня група сайдбара — розділи застосунку (CONCEPT 3.1). */
const APP_SECTIONS: readonly AppSection[] = [
  { href: '/', label: 'Головна', desc: 'Огляд і статистика', icon: '◆' },
  { href: '/account', label: 'Кабінет', desc: 'Прогрес, тексти, налаштування', icon: '☻', authOnly: true },
  {
    href: '/analyze',
    label: 'Аналіз тексту',
    desc: 'Підсвітка часів у вашому тексті',
    icon: '⌗',
    authOnly: true,
  },
  { href: '/library', label: 'Бібліотека', desc: 'Оповідання з готовою підсвіткою', icon: '▤' },
  { href: '/words', label: 'Слова', desc: 'Частотний словник зі статусами', icon: '≡' },
];

/** Один стиль рядка для обох груп: активний тримається лівою рискою кольору Past Simple. */
function navRow(active: boolean): string {
  return `flex w-full items-center justify-between gap-2 rounded-btn px-2.5 py-2 text-left text-[13.5px] leading-[normal] ${
    active
      ? 'bg-surface-2 text-ink font-bold shadow-[inset_2px_0_0_var(--ps)]'
      : 'text-ink-2 font-semibold hover:bg-hover'
  }`;
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => (field ?? '').toLowerCase().includes(needle));
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
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
  const known = words.filter((status) => status === 'known').length;
  const learning = words.filter((status) => status === 'learning').length;

  const appSections = APP_SECTIONS.filter(
    (item) => (signedIn || !item.authOnly) && matches(query, item.label, item.desc),
  );
  const topics = TOPICS.filter((topic) => matches(query, topic.title, topic.desc));

  const progressTopic = activeTopic ?? TOPICS.find((topic) => topic.ready);
  const progressRead = progressTopic ? readCount(progressTopic.slug) : 0;
  const progressTotal = progressTopic?.sections.length ?? 0;

  return (
    <div className="bg-panel border-line flex h-full flex-col border-r">
      <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4 pb-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-[9px] text-inherit"
        >
          <span
            className="from-ps to-pp h-7 w-7 flex-none rounded-lg bg-gradient-to-br"
            style={{ backgroundImage: 'linear-gradient(140deg, var(--ps), var(--pp))' }}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-extrabold tracking-[-0.2px]">
              Граматика англійської
            </span>
            <span className="text-ink-3 block text-[11.5px] font-semibold tracking-[0.4px]">
              Пояснення українською
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          title="Тема"
          aria-label="Перемкнути тему оформлення"
          className="border-line bg-surface-2 text-ink-2 rounded-btn hover:bg-hover hover:text-ink h-8 w-8 flex-none cursor-pointer border text-[14px] leading-[normal]"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      {/* Пошук фільтрує три списки одночасно (CONCEPT 3.2) */}
      <div className="px-3.5 pb-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Пошук по темах і розділах"
          className="border-line bg-surface-2 text-ink rounded-input w-full border px-3 py-[9px] text-[13.5px] leading-[normal] outline-none"
        />
      </div>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-2.5 pb-2.5">
        <SidebarLabel>Навчання</SidebarLabel>
        <ul className="flex flex-col gap-0.5">
          {appSections.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onNavigate} className={navRow(pathname === item.href)}>
                <span className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden className="w-[18px] text-center text-[13px]">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.href === '/analyze' ? (
                  <span className="text-pc-dk bg-pc-bg rounded-badge px-[7px] py-0.5 text-[10.5px] font-extrabold tracking-[0.6px] uppercase">
                    нове
                  </span>
                ) : null}
                {item.href === '/words' ? (
                  <span className="text-ink-3 text-[11px] font-bold">{learning + known}</span>
                ) : null}
              </Link>
            </li>
          ))}
          {appSections.length === 0 ? <SidebarEmpty /> : null}
        </ul>

        <SidebarLabel className="pt-4">Теми</SidebarLabel>
        <ul className="flex flex-col gap-0.5">
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
                    className={navRow(isActive)}
                  >
                    <TopicRowLabel level={topic.level} title={topic.title} />
                    <span className="text-ink-3 flex-none text-[10.5px] font-bold">
                      {read}/{topic.sections.length}
                    </span>
                  </Link>
                ) : (
                  <div className={`${navRow(false)} cursor-default opacity-50`}>
                    <TopicRowLabel level={topic.level} title={topic.title} />
                    <span className="text-ink-3 flex-none text-[10.5px] font-bold">скоро</span>
                  </div>
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
                          className={`flex w-full items-center gap-[7px] rounded-[7px] px-2 py-[5px] text-left text-[12.5px] leading-[normal] ${
                            current
                              ? 'bg-surface-2 text-ink font-bold'
                              : 'text-ink-2 hover:bg-hover font-medium'
                          }`}
                        >
                          <span className="text-ink-3 w-[15px] flex-none text-[11px] font-bold">
                            {section.n}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {section.short ?? section.title}
                          </span>
                          <span className="text-ok flex-none text-[11px]">{done ? '✓' : ''}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
          {topics.length === 0 ? <SidebarEmpty /> : null}
        </ul>
      </nav>

      <div className="border-line flex flex-col gap-2.5 border-t px-4 pt-[13px] pb-[15px]">
        <div className="flex items-center gap-[11px]">
          <ProgressRing read={progressRead} total={progressTotal} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-bold">
              {progressRead} / {progressTotal} розділів
            </div>
            <div className="text-ink-3 text-[11.5px]">
              {known} слів знаю · {learning} вчу
            </div>
          </div>
        </div>

        {/* Стан «гість» (CONCEPT 8.4) */}
        {signedIn ? (
          <Link
            href="/account"
            onClick={onNavigate}
            className="border-line rounded-input hover:bg-hover flex w-full items-center gap-2.5 border px-[9px] py-[7px] text-inherit"
          >
            <span
              className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg text-[12px] font-extrabold text-white"
              style={{ backgroundImage: 'linear-gradient(140deg, var(--ps), var(--pp))' }}
              aria-hidden
            >
              ☻
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-bold">Ваш акаунт</span>
              <span className="text-ink-3 block text-[11px]">Синхронізовано · кабінет</span>
            </span>
          </Link>
        ) : (
          <div className="bg-surface-2 rounded-input px-[11px] py-2.5">
            <div className="text-ink-2 text-[11.5px] leading-[1.5]">
              Прогрес зберігається лише в цьому браузері.
            </div>
            <Link
              href="/login"
              onClick={onNavigate}
              className="text-ps-dk mt-[7px] block text-[12px] leading-[normal] font-extrabold"
            >
              Увійти для синхронізації →
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => progressTopic && resetProgress(progressTopic.slug)}
          className="border-line text-ink-3 hover:text-ink hover:border-ink-3 cursor-pointer rounded-lg border px-2.5 py-1.5 text-[11.5px] leading-[normal] font-bold"
        >
          Скинути прогрес
        </button>
      </div>
    </div>
  );
}

function TopicRowLabel({ level, title }: { level: Level; title: string }) {
  return (
    <span className="flex min-w-0 items-center gap-[9px]">
      <span className={`h-[7px] w-[7px] flex-none rounded-full ${LEVEL_COLOR[level]}`} aria-hidden />
      <span className="truncate">{title}</span>
    </span>
  );
}

function SidebarLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`text-ink-3 px-2 pt-2 pb-1.5 text-[10.5px] font-extrabold tracking-[1.2px] uppercase ${className}`}
    >
      {children}
    </div>
  );
}

function SidebarEmpty() {
  return <li className="text-ink-3 px-2.5 py-1.5 text-[13px]">Нічого не знайдено</li>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useSectionNav } from '@/components/shell/useSectionNav';
import { READY_TOPICS, TOPICS } from '@/data/topics';

const SCREEN_TITLES: Record<string, string> = {
  '/': 'Головна',
  '/analyze': 'Аналіз тексту',
  '/words': 'Слова',
  '/account': 'Кабінет',
  '/login': 'Вхід',
};

/**
 * Липка шапка контенту: смужка прогресу, хлібні крихти і три швидкі дії
 * (CONCEPT 3.3). «Тест» і «Шпаргалка» прокручують до розділів теми — навіть
 * якщо ви зараз на іншому екрані.
 */
export function ContentHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { readCount, state } = useAppState();
  const goToSection = useSectionNav();

  const topicSlug = /^\/topics\/([^/]+)/.exec(pathname)?.[1];
  const topic = TOPICS.find((item) => item.slug === topicSlug);

  /** Тема, до якої ведуть швидкі дії: відкрита → остання відкрита → перша готова. */
  const targetTopic = useMemo(
    () =>
      (topic?.ready ? topic : undefined) ??
      READY_TOPICS.find((item) => item.slug === state.lastTopic) ??
      READY_TOPICS[0],
    [topic, state.lastTopic],
  );

  const read = topic?.ready ? readCount(topic.slug) : 0;
  const total = topic?.sections.length ?? 0;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);

  const crumb = topic?.title ?? SCREEN_TITLES[pathname] ?? '';

  const hasSection = (id: string) => targetTopic?.sections.some((section) => section.id === id);

  return (
    <header className="bg-bg/90 border-line sticky top-0 z-30 border-b backdrop-blur-md">
      {/* Смужка прогресу читання активної теми */}
      <div className="bg-line/60 h-[3px] w-full">
        <div
          className="from-ps via-pc to-pp h-full bg-gradient-to-r transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mx-auto flex h-[56px] max-w-[1080px] items-center gap-3 px-5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="border-line text-ink-2 hover:border-line-strong cursor-pointer rounded-lg border px-2.5 py-1.5 text-[13px] font-bold lg:hidden"
          aria-label="Відкрити навігацію"
        >
          ☰
        </button>

        <nav className="text-ink-3 flex min-w-0 items-center gap-2 text-[13.5px]">
          <Link href="/" className="text-ps-dk font-semibold hover:underline">
            Головна
          </Link>
          {crumb && pathname !== '/' ? (
            <>
              <span aria-hidden>›</span>
              <span className="truncate">{crumb}</span>
            </>
          ) : null}
          {topic?.ready ? (
            <span className="text-ink-3 ml-1 hidden text-[12.5px] font-bold sm:inline">
              · {read}/{total}
            </span>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {targetTopic && hasSection('quiz') ? (
            <QuickAction onClick={() => goToSection(targetTopic.slug, 'quiz', { markRead: false })}>
              Тест
            </QuickAction>
          ) : null}
          {targetTopic && hasSection('cheat') ? (
            <QuickAction onClick={() => goToSection(targetTopic.slug, 'cheat', { markRead: false })}>
              Шпаргалка
            </QuickAction>
          ) : null}
          <Link
            href="/analyze"
            className="border-line bg-surface text-ink-2 hover:border-line-strong hidden rounded-lg border px-2.5 py-1.5 text-[13px] font-bold sm:block"
          >
            Аналіз тексту
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-line bg-surface text-ink-2 hover:border-line-strong hidden cursor-pointer rounded-lg border px-2.5 py-1.5 text-[13px] font-bold sm:block"
    >
      {children}
    </button>
  );
}

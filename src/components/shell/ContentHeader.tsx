'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS, TOPICS } from '@/data/topics';

const SCREEN_TITLES: Record<string, string> = {
  '/': 'Огляд',
  '/analyze': 'Аналіз тексту',
  '/words': 'Слова',
  '/account': 'Кабінет',
  '/login': 'Вхід',
};

/**
 * Липка шапка контенту: смужка прогресу, хлібні крихти і три швидкі дії
 * (CONCEPT 3.3). «Тест» і «Шпаргалка» ведуть на відповідні розділи теми —
 * навіть якщо ви зараз на іншому екрані.
 */
export function ContentHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { readCount, signedIn, state } = useAppState();

  const [, topicSlug, sectionSlug] = /^\/topics\/([^/]+)(?:\/([^/]+))?/.exec(pathname) ?? [];
  const topic = TOPICS.find((item) => item.slug === topicSlug);
  const section = topic?.sections.find((item) => item.slug === sectionSlug);

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

  /** Слаг розділу теми за його id — «Тест» і «Шпаргалка» ведуть саме туди. */
  const sectionHref = (id: string) => {
    const target = targetTopic?.sections.find((item) => item.id === id);
    return target ? `/topics/${targetTopic?.slug}/${target.slug}` : null;
  };
  const quizHref = sectionHref('quiz');
  const cheatHref = sectionHref('cheat');

  return (
    <header className="bg-panel border-line sticky top-0 z-20 border-b">
      {/* Смужка прогресу читання активної теми */}
      <div className="bg-surface-2 h-[3px] w-full">
        <div
          className="h-full transition-[width] duration-200"
          style={{
            width: `${percent}%`,
            backgroundImage: 'linear-gradient(90deg, var(--ps), var(--pc), var(--pp))',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-[30px] py-[11px]">
        <div className="text-ink-3 flex min-w-0 items-center gap-2 text-[13px] font-semibold">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="border-line text-ink-2 hover:border-ink-3 mr-1 cursor-pointer rounded-lg border px-2.5 py-1 text-[13px] leading-[normal] font-bold lg:hidden"
            aria-label="Відкрити навігацію"
          >
            ☰
          </button>
          <Link href="/" className="text-inherit hover:underline">
            Головна
          </Link>
          <span className="text-line" aria-hidden>
            ›
          </span>
          {section ? (
            <>
              <Link href={`/topics/${topic?.slug}`} className="text-inherit hover:underline">
                {crumb}
              </Link>
              <span className="text-line" aria-hidden>
                ›
              </span>
              <span className="text-ink truncate">{section.short ?? section.title}</span>
            </>
          ) : (
            <span className="text-ink truncate">{crumb}</span>
          )}
        </div>

        <div className="flex flex-none gap-2">
          {quizHref ? <QuickAction href={quizHref}>Тест</QuickAction> : null}
          {cheatHref ? <QuickAction href={cheatHref}>Шпаргалка</QuickAction> : null}
          {/*
            Гостю аналізатор закритий: `/api/analyze` віддає 401
            (`resolveAccess`). Тому головна кнопка шапки для нього ховається —
            інакше найпомітніший заклик до дії на кожній сторінці веде в тупик.
          */}
          {signedIn ? (
            <Link
              href="/analyze"
              className="bg-ps rounded-btn border border-transparent px-[13px] py-[7px] text-[12.5px] leading-[normal] font-bold text-white hover:brightness-[1.08]"
            >
              Аналіз тексту
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function QuickAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="border-line bg-surface-2 text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 border px-[13px] py-[7px] text-[12.5px] leading-[normal] font-bold"
    >
      {children}
    </Link>
  );
}

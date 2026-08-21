import type { Metadata } from 'next';
import Link from 'next/link';

import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import { listStories } from '@/lib/library/server';

export const metadata: Metadata = {
  title: 'Бібліотека',
  description:
    'Оповідання з готовою підсвіткою минулих часів — читайте без входу, розбір уже зроблено.',
};

/** Три часи, якими розмічена бібліотека (CONCEPT 9): підсвітка тут лише минула. */
const LIBRARY_TENSES = ['ps', 'pc', 'pp'] as const;

/**
 * Список оповідань. Нічого не рахується на клієнті: назва, автор, обсяг і
 * кількості часів приходять готовими з `listStories()` (SC-9) — сторінка лише
 * розкладає їх у картки.
 */
export default async function LibraryPage() {
  const stories = await listStories();

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-[70px]">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Бібліотека</h1>
      <p className="text-ink-2 mb-6 max-w-[52rem] text-[14px]">
        Оповідання з готовою підсвіткою часів — розбір уже зроблено, читайте без входу і без
        очікування моделі.
      </p>

      {stories.length === 0 ? (
        <div className="bg-surface border-line rounded-card shadow-card border px-[22px] py-5">
          <div className="text-ink-2 text-[14px]">
            Бібліотека ще порожня. Оповідання засіваються окремим кроком (<code>make db-seed</code>
            ) — без бази підключення чи до першого засіву список лишається порожнім, це не помилка.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {stories.map((story) => (
            <Link
              key={story.slug}
              href={`/library/${story.slug}`}
              className="bg-surface border-line rounded-card shadow-card block border px-[22px] py-5 text-inherit transition hover:-translate-y-[2px]"
            >
              <div className="mt-0 mb-1 text-[18px] font-extrabold tracking-[-0.3px]">
                {story.title}
              </div>
              <div className="text-ink-2 mb-3 text-[14px]">
                {story.author} · {story.words} слів
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] font-bold">
                {LIBRARY_TENSES.map((tense) => (
                  <span key={tense} className="text-ink-3">
                    {TENSE_LABELS[tense]} <span className="opacity-70">{story.stats[tense]}</span>
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

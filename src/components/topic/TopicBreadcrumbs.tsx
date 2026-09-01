import Link from 'next/link';

import type { TopicMeta } from '@/types/content';

/**
 * Хлібні крихти теми: «Теми / Тема / Розділ». Замінюють зміст-сайдбар у ролі
 * «де я?»: шлях назад видно завжди, а список розділів живе на вході в тему —
 * там, де його справді читають. Остання ланка — текст, не посилання: клікати
 * в сторінку, на якій стоїш, нема куди.
 */
export function TopicBreadcrumbs({ topic, current }: { topic: TopicMeta; current?: string }) {
  return (
    <nav aria-label="Ви тут" className="text-ink-3 mb-[18px] text-[12.5px]">
      <Link href="/topics" className="text-acc font-bold">
        Теми
      </Link>
      <span className="mx-1.5" aria-hidden>
        /
      </span>
      {current === undefined ? (
        <span>{topic.title}</span>
      ) : (
        <>
          <Link href={`/topics/${topic.slug}`} className="text-acc font-bold">
            {topic.title}
          </Link>
          <span className="mx-1.5" aria-hidden>
            /
          </span>
          <span>{current}</span>
        </>
      )}
    </nav>
  );
}

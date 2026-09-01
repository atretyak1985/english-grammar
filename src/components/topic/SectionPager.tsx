import Link from 'next/link';

import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Навігація під текстом розділу: попередній і наступний за порядком змісту.
 * Це і є дорога «далі» після прибирання змісту-сайдбара: дочитавши розділ,
 * читач рухається кнопкою, а не поверненням у зміст. На краях теми кнопка
 * веде у зміст — з першого розділу назад, з останнього вперед.
 */
export function SectionPager({ topic, current }: { topic: TopicMeta; current: TopicSection }) {
  const index = topic.sections.findIndex((section) => section.slug === current.slug);
  const previous = index > 0 ? topic.sections[index - 1] : undefined;
  const next = index >= 0 ? topic.sections[index + 1] : undefined;

  const button =
    'border-line-ctrl rounded-btn inline-flex max-w-[46%] items-center gap-2 border-[1.5px] px-4 py-2.5 text-[13px] font-bold';

  return (
    <nav aria-label="Сусідні розділи" className="mt-6 flex items-center justify-between gap-4">
      {previous !== undefined ? (
        <Link href={`/topics/${topic.slug}/${previous.slug}`} className={`${button} text-ink`}>
          <span aria-hidden>←</span>
          <span className="truncate">
            {previous.n}. {previous.short ?? previous.title}
          </span>
        </Link>
      ) : (
        <Link href={`/topics/${topic.slug}`} className={`${button} text-ink`}>
          <span aria-hidden>←</span> Зміст теми
        </Link>
      )}

      {next !== undefined ? (
        <Link
          href={`/topics/${topic.slug}/${next.slug}`}
          className={`${button} bg-tint text-green-tx border-green-line`}
        >
          <span className="truncate">
            {next.n}. {next.short ?? next.title}
          </span>
          <span aria-hidden>→</span>
        </Link>
      ) : (
        <Link href={`/topics/${topic.slug}`} className={`${button} bg-tint text-green-tx border-green-line`}>
          До змісту теми <span aria-hidden>→</span>
        </Link>
      )}
    </nav>
  );
}

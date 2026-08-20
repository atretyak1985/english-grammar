import Link from 'next/link';

import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Перехід між розділами внизу сторінки. Без цього читання теми наскрізь
 * розсипається: сайдбар годиться для стрибків, а не для послідовного читання.
 */
export function SectionNav({ topic, current }: { topic: TopicMeta; current: TopicSection }) {
  const index = topic.sections.findIndex((section) => section.slug === current.slug);
  const previous = index > 0 ? topic.sections[index - 1] : undefined;
  const next = index >= 0 ? topic.sections[index + 1] : undefined;

  return (
    <nav className="border-line mt-10 grid grid-cols-1 gap-3.5 border-t pt-6 sm:grid-cols-2">
      {previous ? (
        <Step topicSlug={topic.slug} section={previous} label="Попередній розділ" />
      ) : (
        <Step topicSlug={topic.slug} label="До змісту теми" title={topic.title} />
      )}
      {next ? (
        <Step topicSlug={topic.slug} section={next} label="Наступний розділ" align="right" />
      ) : (
        <Step topicSlug={topic.slug} label="До змісту теми" title={topic.title} align="right" />
      )}
    </nav>
  );
}

function Step({
  topicSlug,
  section,
  label,
  title,
  align = 'left',
}: {
  topicSlug: string;
  section?: TopicSection;
  label: string;
  title?: string;
  align?: 'left' | 'right';
}) {
  return (
    <Link
      href={section ? `/topics/${topicSlug}/${section.slug}` : `/topics/${topicSlug}`}
      className={`bg-surface border-line rounded-panel shadow-card block border px-[18px] py-3.5 text-inherit transition hover:-translate-y-[2px] ${
        align === 'right' ? 'sm:text-right' : ''
      }`}
    >
      <div className="text-ink-3 text-[11px] font-extrabold tracking-[1.1px] uppercase">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-bold">
        {section ? `${section.n}. ${section.title}` : title}
      </div>
    </Link>
  );
}

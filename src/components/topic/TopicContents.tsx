'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { TopicMeta } from '@/types/content';

/**
 * Зміст теми: кожен розділ — окрема сторінка зі своїм URL. Галочка означає
 * прочитане (CONCEPT 6), тому зміст водночас показує, де ви зупинились.
 */
export function TopicContents({ topic }: { topic: TopicMeta }) {
  const { isSectionRead } = useAppState();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {topic.sections.map((section) => {
        const done = isSectionRead(topic.slug, section.id);

        return (
          <Link
            key={section.slug}
            href={`/topics/${topic.slug}/${section.slug}`}
            className="bg-surface border-line rounded-card shadow-card block border px-[22px] py-5 text-inherit transition hover:-translate-y-[2px]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-ink-3 text-[11px] font-extrabold tracking-[1.1px] uppercase">
                Розділ {section.n}
              </span>
              {done ? (
                <span className="text-ok text-[11.5px] font-extrabold" aria-label="прочитано">
                  ✓ прочитано
                </span>
              ) : null}
            </div>
            <div className="mt-[7px] mb-1 text-[18px] font-extrabold tracking-[-0.3px]">
              {section.title}
            </div>
            {section.lede ? <div className="text-ink-2 text-[14px]">{section.lede}</div> : null}
          </Link>
        );
      })}
    </div>
  );
}

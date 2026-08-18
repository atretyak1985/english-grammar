'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useSectionNav } from '@/components/shell/useSectionNav';
import type { TopicMeta } from '@/types/content';

/** Зміст теми. Галочка означає, що розділ уже прочитаний. */
export function TopicToc({ topic }: { topic: TopicMeta }) {
  const { isSectionRead } = useAppState();
  const goToSection = useSectionNav();

  return (
    <div className="bg-surface border-line rounded-card shadow-card my-6 border px-6 py-5">
      <b className="text-[15px]">Зміст</b>
      <ol className="mt-2 columns-1 gap-8 sm:columns-2">
        {topic.sections.map((section) => (
          <li key={section.id} className="my-1 list-none">
            <button
              type="button"
              onClick={() => goToSection(topic.slug, section.id)}
              className="text-ps-dk cursor-pointer text-left text-[15px] font-semibold hover:underline"
            >
              <span className="text-ink-3 mr-1.5 font-bold">{section.n}.</span>
              {section.title}
              {isSectionRead(topic.slug, section.id) ? (
                <span className="text-ok ml-1.5" aria-label="прочитано">
                  ✓
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useActiveSection } from '@/components/shell/ActiveSectionProvider';
import { WordStatusButtons } from '@/components/words/WordStatusButtons';
import type { TopicMeta } from '@/types/content';

/**
 * Права колонка сторінки теми: прогрес теми і слова з цієї теми (CONCEPT 2).
 * Одне число живить кільце в сайдбарі, смужку в шапці і «N / 14» тут.
 */
export function TopicSidePanel({ topic }: { topic: TopicMeta }) {
  const { readCount, isSectionRead, toggleSectionRead, resetProgress, setLastTopic } = useAppState();
  const { activeId } = useActiveSection();

  // Картка «Продовжити» на головній має знати, де ви зупинились.
  useEffect(() => setLastTopic(topic.slug), [setLastTopic, topic.slug]);

  const read = readCount(topic.slug);
  const total = topic.sections.length;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);
  const activeSection = topic.sections.find((section) => section.id === activeId);
  const activeRead = activeSection ? isSectionRead(topic.slug, activeSection.id) : false;

  return (
    <aside className="space-y-4">
      <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
        <div className="text-ink-3 text-[11.5px] font-extrabold tracking-[1px] uppercase">
          Прогрес теми
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[26px] font-extrabold tracking-[-0.5px]">{read}</span>
          <span className="text-ink-3 text-[15px]">/ {total} розділів</span>
        </div>
        <div className="bg-surface-2 mt-2.5 h-1.5 overflow-hidden rounded-full">
          <div
            className="from-ps via-pc to-pp h-full bg-gradient-to-r transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>

        {activeSection ? (
          <button
            type="button"
            onClick={() => toggleSectionRead(topic.slug, activeSection.id)}
            className="border-line bg-surface-3 text-ink-2 hover:border-line-strong mt-3.5 w-full cursor-pointer rounded-lg border px-3 py-2 text-[13px] font-bold"
          >
            {activeRead
              ? `↩︎ Зняти позначку з розділу ${activeSection.n}`
              : `✓ Позначити розділ ${activeSection.n} прочитаним`}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => resetProgress(topic.slug)}
          className="text-ink-3 hover:text-no mt-2 w-full cursor-pointer text-[12.5px] font-semibold"
        >
          Скинути прогрес
        </button>
      </div>

      {topic.words && topic.words.length > 0 ? (
        <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
          <div className="text-ink-3 text-[11.5px] font-extrabold tracking-[1px] uppercase">
            Слова з цієї теми
          </div>
          <ul className="mt-2 space-y-2.5">
            {topic.words.map((word) => (
              <li key={word}>
                <div className="text-[14.5px] font-semibold">{word}</div>
                <WordStatusButtons word={word} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

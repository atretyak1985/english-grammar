'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { WordStatusCycle } from '@/components/words/WordStatusButtons';
import type { TopicMeta, TopicSection } from '@/types/content';

const CARD = 'bg-surface border-line rounded-panel shadow-card border p-4';
const CARD_LABEL = 'text-ink-3 mb-2.5 text-[10.5px] font-extrabold tracking-[1.1px] uppercase';
const CARD_BUTTON =
  'border-line text-ink-2 rounded-btn hover:bg-hover hover:text-ink mt-3 block w-full cursor-pointer border bg-transparent py-[7px] text-center text-[12.5px] leading-[normal] font-bold';

/**
 * Права колонка сторінки теми: прогрес теми і слова з цієї теми (CONCEPT 2).
 * Одне число живить кільце в сайдбарі, смужку в шапці і «N / 14» тут.
 */
export function TopicSidePanel({
  topic,
  /** Відкритий розділ — на сторінці змісту його немає */
  section,
}: {
  topic: TopicMeta;
  section?: TopicSection;
}) {
  const { readCount, isSectionRead, toggleSectionRead, markSectionRead, setLastTopic, wordStatus } =
    useAppState();

  // Картка «Продовжити» на головній має знати, де ви зупинились.
  useEffect(() => setLastTopic(topic.slug), [setLastTopic, topic.slug]);

  // Відкритий розділ і є прочитаний: сторінка розділу — це і є факт читання.
  useEffect(() => {
    if (section) markSectionRead(topic.slug, section.id);
  }, [markSectionRead, section, topic.slug]);

  const read = readCount(topic.slug);
  const total = topic.sections.length;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);
  const activeSection = section;
  const activeRead = activeSection ? isSectionRead(topic.slug, activeSection.id) : false;

  return (
    <div className="sticky top-[78px] flex flex-col gap-3.5">
      <div className={CARD}>
        <div className={CARD_LABEL}>Прогрес теми</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[24px] font-extrabold tracking-[-0.5px]">{read}</span>
          <span className="text-ink-3 text-[13px]">/ {total} розділів</span>
        </div>
        <div className="bg-surface-2 mt-[9px] h-1.5 overflow-hidden rounded-md">
          <div className="bg-ps h-full transition-[width]" style={{ width: `${percent}%` }} />
        </div>

        {activeSection ? (
          <button
            type="button"
            onClick={() => toggleSectionRead(topic.slug, activeSection.id)}
            className={CARD_BUTTON}
          >
            {activeRead ? 'Зняти позначку з розділу' : 'Позначити розділ прочитаним'}
          </button>
        ) : null}
      </div>

      {topic.words && topic.words.length > 0 ? (
        <div className={CARD}>
          <div className={CARD_LABEL}>Слова з цієї теми</div>
          <div className="flex flex-col gap-[7px]">
            {topic.words.map((word) => (
              <div key={word} className="flex items-center justify-between gap-2 text-[13.5px]">
                <span
                  className={`font-semibold ${
                    wordStatus(word) === 'learning'
                      ? 'bg-pc-bg text-pc-dk rounded px-1'
                      : wordStatus(word) === 'known'
                        ? 'text-ink-3'
                        : 'decoration-ink-3 underline decoration-dotted decoration-2 underline-offset-4'
                  }`}
                >
                  {word}
                </span>
                <span className="flex items-center gap-1.5">
                  <WordStatusCycle word={word} />
                </span>
              </div>
            ))}
          </div>
          <Link href="/words" className={CARD_BUTTON}>
            Усі слова
          </Link>
        </div>
      ) : null}
    </div>
  );
}

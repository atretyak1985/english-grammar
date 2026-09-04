'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Навігація під текстом розділу: назад за змістом і головна дія — «прочитано».
 *
 * Права кнопка робить дві речі одним натисканням, і саме тому вона одна:
 * позначає цей розділ прочитаним і веде в наступний. Доки прочитане
 * позначалося автоматично, від самого відкриття сторінки, прогрес показував
 * перегортання замість роботи — галочка в змісті стояла там, де читач лише
 * заглянув. Тепер її ставить людина.
 *
 * Коли розділ уже прочитаний, обіцянка з кнопки зникає: лишається сам перехід.
 * Друге натискання нічого б не змінило, і напис про це не бреше.
 */
export function SectionPager({ topic, current }: { topic: TopicMeta; current: TopicSection }) {
  const { isSectionRead, markSectionRead, ready } = useAppState();

  const index = topic.sections.findIndex((section) => section.slug === current.slug);
  const previous = index > 0 ? topic.sections[index - 1] : undefined;
  const next = index >= 0 ? topic.sections[index + 1] : undefined;

  const done = ready && isSectionRead(topic.slug, current.id);
  const mark = () => markSectionRead(topic.slug, current.id);

  const back =
    'border-line-ctrl rounded-btn text-ink hover:bg-hover inline-flex max-w-[46%] items-center gap-2 border-[1.5px] px-4 py-2.5 text-[13px] font-bold';
  const forward =
    'bg-acc hover:bg-acc2 rounded-btn inline-flex max-w-[54%] items-center gap-2 px-[18px] py-3 text-[13.5px] font-bold text-white hover:text-white';

  return (
    <nav aria-label="Сусідні розділи" className="mt-6 flex items-center justify-between gap-4">
      {previous !== undefined ? (
        <Link href={`/topics/${topic.slug}/${previous.slug}`} className={back}>
          <span aria-hidden>←</span>
          <span className="truncate">
            {previous.n} · {previous.short ?? previous.title}
          </span>
        </Link>
      ) : (
        <Link href={`/topics/${topic.slug}`} className={back}>
          <span aria-hidden>←</span> Зміст теми
        </Link>
      )}

      <Link
        href={next ? `/topics/${topic.slug}/${next.slug}` : `/topics/${topic.slug}`}
        onClick={mark}
        className={forward}
      >
        <span className="truncate">
          {done ? null : 'Позначити прочитаним · '}
          {next ? `${next.n} · ${next.short ?? next.title}` : 'До змісту теми'}
        </span>
        <span aria-hidden>→</span>
      </Link>
    </nav>
  );
}

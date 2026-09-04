'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { TopicMeta } from '@/types/content';

/**
 * Зміст теми списком, а не сіткою карток.
 *
 * Розділи теми читають підряд, і саме порядок тут головна інформація:
 * рядки один під одним показують курс як дорогу, а сітка карток
 * показувала б його як вітрину, де можна брати що завгодно. Тому в
 * макеті це один білий блок із розділювачами, а не одинадцять
 * окремих плиток.
 *
 * Номер розділу стоїть моноширинним і в своїй колонці у 44px: цифри
 * різної ширини зсували б заголовки один відносно одного, і список
 * втратив би ту саму рівну ліву межу, за яку його читають як список.
 */
export function TopicSectionList({ topic }: { topic: TopicMeta }) {
  const { isSectionRead, ready } = useAppState();

  // Наступний — перший непрочитаний за порядком теми. Він єдиний
  // отримує підсвічений рядок і напис «далі», тому шукається один раз
  // на весь список, а не перевіряється в кожному рядку.
  const next = ready
    ? topic.sections.find((section) => !isSectionRead(topic.slug, section.id))
    : undefined;

  return (
    <div className="bg-card border-line rounded-tile-lg overflow-hidden border">
      {topic.sections.map((section) => {
        const done = ready && isSectionRead(topic.slug, section.id);
        const current = next?.id === section.id;

        return (
          <Link
            key={section.slug}
            href={`/topics/${topic.slug}/${section.slug}`}
            aria-current={current ? 'step' : undefined}
            className={`border-track text-ink hover:bg-hover grid grid-cols-[44px_1fr_auto] items-center gap-3.5 border-b px-5 py-3.5 last:border-b-0 hover:text-ink ${
              current ? 'bg-hover' : ''
            }`}
          >
            <span className="text-label font-mono text-[12px] font-bold">
              {String(section.n).padStart(2, '0')}
            </span>

            <span className="min-w-0">
              <span className="font-serif block text-[17px] leading-[1.3] font-bold">
                {section.title}
              </span>
              {section.lede ? (
                <span className="text-ink-3 mt-0.5 block text-[13.5px]">{section.lede}</span>
              ) : null}
            </span>

            {/* Стан праворуч, і лише коли він є. Порожній рядок замість
                «не прочитано» — навмисно: перелік з одинадцятьма
                «не прочитано» читається як докір, а не як зміст. */}
            <span
              className={`text-[12.5px] font-bold whitespace-nowrap ${
                done ? 'text-green-tx' : 'text-ink-3'
              }`}
            >
              {done ? '✓ прочитано' : current ? 'далі →' : ''}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

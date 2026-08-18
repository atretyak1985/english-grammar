'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { LEVEL_BORDER, LEVEL_LABEL, TOPICS } from '@/data/topics';

/** Сітка всіх тем. Готові клікаються, заплановані приглушені. */
export function TopicsGrid() {
  const { readCount } = useAppState();

  return (
    <div className="my-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {TOPICS.map((topic) => {
        const read = readCount(topic.slug);
        const total = topic.sections.length;

        const body = (
          <>
            <div className="flex items-start justify-between gap-3">
              <h3 className="m-0 text-[19px] font-bold tracking-[-0.3px]">{topic.title}</h3>
              <span className="text-ink-3 text-[12px] font-extrabold">
                {LEVEL_LABEL[topic.level]}
              </span>
            </div>
            <p className="text-ink-2 mt-2 mb-0 text-[15px]">{topic.desc}</p>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {topic.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${
                    topic.ready ? 'bg-surface-2 text-ink-2' : 'bg-pc-bg text-pc-dk'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {topic.ready && total > 0 ? (
                <span className="bg-ps-bg text-ps-dk rounded-full px-2.5 py-1 text-[12px] font-bold">
                  {read}/{total} прочитано
                </span>
              ) : null}
            </div>
          </>
        );

        if (!topic.ready) {
          return (
            <div
              key={topic.slug}
              className="bg-surface border-line rounded-card shadow-card border border-t-4 px-6 py-5 opacity-60"
            >
              {body}
            </div>
          );
        }

        return (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className={`bg-surface border-line rounded-card shadow-card hover:shadow-lift block border border-t-4 px-6 py-5 transition hover:-translate-y-[3px] ${LEVEL_BORDER[topic.level]}`}
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}

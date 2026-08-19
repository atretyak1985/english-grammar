'use client';

import Link from 'next/link';

import { LEVEL_BORDER, LEVEL_LABEL, TOPICS } from '@/data/topics';
import type { Level } from '@/types/content';

/** Значок рівня на картці: фон і текст того самого кольору, що й точка в сайдбарі. */
const LEVEL_BADGE: Record<Level, string> = {
  a2: 'bg-ok-bg text-ok',
  b1: 'bg-ps-bg text-ps',
  b2: 'bg-pc-bg text-pc',
  c1: 'bg-pp-bg text-pp',
};

/** Сітка всіх тем. Готові клікаються, заплановані приглушені. */
export function TopicsGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {TOPICS.map((topic) => (
        <div
          key={topic.slug}
          className={`bg-surface border-line rounded-card shadow-card border border-t-4 px-[22px] py-5 ${
            LEVEL_BORDER[topic.level]
          } ${topic.ready ? '' : 'opacity-[0.62]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="mt-0 mb-2 text-[18.5px] font-extrabold tracking-[-0.3px]">
              {topic.title}
            </h3>
            <span
              className={`rounded-badge flex-none px-2 py-[3px] text-[10.5px] font-extrabold tracking-[0.9px] ${LEVEL_BADGE[topic.level]}`}
            >
              {LEVEL_LABEL[topic.level]}
            </span>
          </div>
          <p className="text-ink-2 m-0 text-[14.5px]">{topic.desc}</p>
          <div className="mt-3.5 flex flex-wrap gap-[7px]">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-2 text-ink-2 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
          {topic.ready ? (
            <Link
              href={`/topics/${topic.slug}`}
              className="border-line text-ink rounded-btn hover:bg-hover mt-[15px] block w-full border px-2 py-2 text-center text-[13px] leading-[normal] font-bold"
            >
              Відкрити тему
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}

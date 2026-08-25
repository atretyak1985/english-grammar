import Link from 'next/link';

import { LEVEL_LABEL, TOPICS } from '@/data/topics';
import type { Level } from '@/types/content';

/** Значок рівня на картці: фон і текст того самого кольору, що й крапка в сайдбарі. */
const LEVEL_TAG: Record<Level, string> = {
  a2: 'bg-green-bg text-green-tx',
  b1: 'bg-ps-bg text-ps-tx',
  b2: 'bg-pc-bg text-pc-tx',
  c1: 'bg-pp-bg text-pp-tx',
};

/** Сітка всіх тем. Готові клікаються, заплановані приглушені. */
export function TopicsGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {TOPICS.map((topic) => {
        const body = (
          <>
            <div className="flex items-start justify-between gap-2.5">
              <h3 className="font-display m-0 text-[17px] leading-[1.2] font-extrabold">
                {topic.title}
              </h3>
              <span
                className={`rounded-pill inline-flex flex-none px-[11px] py-[3px] text-[10.5px] font-extrabold tracking-[0.05em] ${LEVEL_TAG[topic.level]}`}
              >
                {LEVEL_LABEL[topic.level]}
              </span>
            </div>
            <p className="text-ink-2 m-0 mt-2 text-[13px] font-semibold">{topic.desc}</p>
            <div className="text-ink-3 mt-3 text-[12px] font-extrabold">
              {topic.ready ? 'відкрити тему →' : 'у планах'}
            </div>
          </>
        );

        const shell =
          'block border-line bg-card rounded-card-lg shadow-card border px-[22px] py-5 text-inherit';

        return topic.ready ? (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className={`${shell} transition-transform hover:-translate-y-1`}
          >
            {body}
          </Link>
        ) : (
          <div key={topic.slug} className={`${shell} opacity-55`}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

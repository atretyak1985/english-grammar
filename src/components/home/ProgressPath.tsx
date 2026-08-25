'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';

/** Вузли стежки в системі координат svg: 0…1000 по x, 0…150 по y. */
const NODES = [
  [40, 95],
  [224, 55],
  [408, 100],
  [592, 55],
  [776, 100],
  [960, 60],
] as const;

const CURVE =
  'M40 95 C 101 95, 163 55, 224 55 C 285 55, 347 100, 408 100 C 469 100, 531 55, 592 55 ' +
  'C 653 55, 715 100, 776 100 C 837 100, 899 60, 960 60';

/**
 * Стежка теми: шість зупинок на кривій замість списку розділів.
 *
 * Зупинок завжди шість, а розділів у темі буває скільки завгодно, тому
 * пройденість рахується часткою, а не номером розділу: інакше стежка або
 * не доходила б до кінця, або впиралась у нього на середині теми.
 */
export function ProgressPath() {
  const { readCount } = useAppState();

  const topic = READY_TOPICS[0];
  const total = topic?.sections.length ?? 0;
  const read = topic ? readCount(topic.slug) : 0;

  const done = total === 0 ? 0 : Math.min(NODES.length - 1, Math.round((read / total) * NODES.length));
  // Лінія тягнеться до середини поточної зупинки — так видно, що вона в роботі.
  // Частку затискаємо в [0;1]: на чистому стані вона від'ємна, і без затиску
  // зсув пунктиру перевищив би довжину візерунка — крива обійшла б повний
  // круг і намалювала обрізок уже після останньої зупинки.
  const walked = Math.min(1, Math.max(0, (done - 0.5) / NODES.length));
  const offset = Math.round(1000 * (1 - walked));

  return (
    <section className="border-line bg-card rounded-panel-lg shadow-card mt-3.5 border px-[30px] py-[26px]">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display m-0 text-[24px] font-extrabold">
          Ваш шлях: {topic?.title ?? 'Теми'}
        </h2>
        <span className="text-ink-3 text-[12.5px] font-extrabold">
          {read} з {total} розділів
        </span>
      </div>

      <div className="relative h-[150px]">
        <svg
          viewBox="0 0 1000 150"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="glPath" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--green)" />
              <stop offset="0.55" stopColor="var(--acc2)" />
              <stop offset="1" stopColor="var(--green)" />
            </linearGradient>
          </defs>
          <path
            d={CURVE}
            fill="none"
            stroke="var(--line)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="0.5 24"
          />
          <path
            d={CURVE}
            fill="none"
            stroke="url(#glPath)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000"
          />
        </svg>

        {NODES.map(([x, y], index) => {
          const passed = index < done;
          const current = index === done;
          const from = Math.floor((index * total) / NODES.length) + 1;
          const to = Math.floor(((index + 1) * total) / NODES.length);

          return (
            <Link
              key={index}
              href={topic ? `/topics/${topic.slug}` : '/library'}
              title={to >= from ? `Розділи ${from}–${to}` : 'Тема'}
              className={`font-display absolute flex h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[16px] font-extrabold ${
                passed
                  ? 'bg-green text-white shadow-[0_6px_14px_rgb(18_185_129_/_0.4)]'
                  : current
                    ? 'bg-yellow text-yellow-tx shadow-[0_6px_14px_rgb(255_217_61_/_0.55)]'
                    : 'bg-card text-ink-3 border-line shadow-card border'
              }`}
              style={{
                left: `${x / 10}%`,
                top: `${y / 1.5}px`,
                zIndex: 2,
                animation: current ? 'gl-pulse 2s ease-in-out infinite' : undefined,
              }}
            >
              {passed ? '✓' : current ? '★' : index + 1}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

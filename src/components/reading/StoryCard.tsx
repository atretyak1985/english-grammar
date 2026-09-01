'use client';

import Link from 'next/link';

import { aspectChips, coverGradient, formatWords, readingMinutes } from '@/components/reading/format';
import type { StoryCard as Story } from '@/lib/library/server';

/**
 * Картка оповідання на полиці: обкладинка, склад тексту видами і одна дія.
 *
 * Смужка прогресу з'являється тільки в початої книжки — у нечитаної нема
 * чого показувати, а порожній жолоб читався б як «прочитано 0%», тобто як
 * докір замість запрошення.
 */
export function StoryCard({ story, percent }: { story: Story; percent: number | null }) {
  const started = percent !== null && percent > 0;
  const minutes = readingMinutes(story.words);

  return (
    <Link
      href={`/library/${story.slug}`}
      className="bg-card border-line flex flex-col gap-3.5 rounded-2xl border p-5 text-inherit transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgb(38_36_32_/_0.1)]"
    >
      <div
        className="flex h-[130px] items-end justify-between rounded-[10px] p-3.5"
        style={{ backgroundImage: coverGradient(story.sortOrder) }}
      >
        <span className="font-serif text-[16px] leading-[1.3] font-bold text-white">
          {story.title}
        </span>
        {/* Значок рівня — тільки коли рівень справді проставлено: «— · 9 хв»
            було б підписом про те, чого ми не знаємо. */}
        <span
          className="rounded-pill flex-none px-[11px] py-1 font-mono text-[10.5px] font-bold"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#262420' }}
        >
          {story.level ? `${story.level} · ${minutes} хв` : `${minutes} хв`}
        </span>
      </div>

      <div className="min-w-0">
        {/* Назва — рівно один рядок. Справжні назви бувають утричі довші за
            макетні, а другий рядок тут тягне за собою висоту ВСЬОГО ряду
            карток: сусідні картки розтягуються, кнопки й пунктирна картка
            їдуть униз. Повна назва нікуди не зникає — вона на обкладинці
            вище, в `title` для наведення й доступності, і в самій читалці. */}
        <div className="font-serif truncate text-[18px] font-extrabold" title={story.title}>
          {story.title}
        </div>
        <div className="text-ink-3 mt-[3px] text-[13px]">
          {story.author} · {formatWords(story.words)} слів
        </div>
        <div className="mt-[11px] flex flex-wrap gap-1.5">
          {aspectChips(story.stats).map((chip) => (
            <span
              key={chip.aspect}
              className={`rounded-pill px-[11px] py-1 text-[11.5px] font-bold ${chip.className}`}
            >
              {chip.label} · {chip.count}
            </span>
          ))}
        </div>
      </div>

      {started ? (
        <div className="flex items-center gap-2.5">
          <div className="bg-track rounded-pill h-1.5 flex-1 overflow-hidden">
            <div className="bg-acc rounded-pill h-full" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-ink-3 text-[12px]">{percent}%</span>
        </div>
      ) : null}

      <span
        className={`rounded-[10px] mt-auto border-[1.5px] py-[11px] text-center text-[14px] font-bold transition-colors duration-150 ease-out ${
          started
            ? 'border-acc text-green-tx hover:bg-tint'
            : 'border-line-ctrl text-ink hover:border-acc hover:text-green-tx'
        }`}
      >
        {started ? 'Продовжити' : 'Почати'}
      </span>
    </Link>
  );
}

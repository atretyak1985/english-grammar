'use client';

import Link from 'next/link';

import { coverGradient, minutesLeft, readPercent } from '@/components/reading/format';
import type { StoryCard as Story } from '@/lib/library/server';

/**
 * «Продовжити читання» — одна книжка, до якої поверталися останньою.
 *
 * Банер зникає повністю, коли жодної початої книжки немає: порожній
 * банер-заглушка обіцяв би те, чого ще не сталося, а на полиці й так
 * стоїть усе, з чого можна почати.
 */
export function ContinueBanner({ story, anchor }: { story: Story; anchor: number }) {
  const percent = readPercent(anchor, story.totalTokens);
  const left = minutesLeft(story.words, percent);

  return (
    <div className="bg-card border-line mb-7 grid grid-cols-[1fr_auto] items-center gap-6 rounded-[18px] border px-7 py-6 transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <div className="flex min-w-0 items-center gap-5">
        <div
          className="flex h-[86px] w-[62px] flex-none items-end rounded-lg p-[7px]"
          style={{
            backgroundImage: coverGradient(story.sortOrder),
            boxShadow: '0 6px 14px rgb(38 36 32 / 0.18)',
          }}
          aria-hidden
        >
          <span className="font-serif text-[9px] leading-[1.25] text-white">{story.title}</span>
        </div>

        <div className="min-w-0">
          <div className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
            Продовжити читання
          </div>
          {/* Один рядок, як у макеті. Тут запас ширини більший, ніж у картці
              на полиці, і поточні назви вміщуються без обрізання — nowrap
              стоїть на майбутнє: перенос розсунув би банер по висоті. */}
          <div
            className="font-serif mt-[5px] truncate text-[23px] font-extrabold"
            title={story.title}
          >
            {story.title}{' '}
            <span className="font-sans text-ink-3 text-[13.5px] font-semibold">
              · {story.author}
              {story.level ? ` · ${story.level}` : ''}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-3.5">
            <div className="bg-track rounded-pill h-[7px] w-[300px] max-w-[40vw] overflow-hidden">
              <div className="bg-acc rounded-pill h-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-ink-3 text-[13px]">
              {percent}% · ~{left} хв лишилось
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/library/${story.slug}`}
        className="border-acc text-green-tx hover:bg-tint rounded-[11px] border-[1.5px] px-[26px] py-[13px] text-[15px] font-bold whitespace-nowrap transition-colors duration-150 ease-out"
      >
        Читати далі →
      </Link>
    </div>
  );
}

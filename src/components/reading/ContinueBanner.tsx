import Link from 'next/link';

import { minutesLeft, readPercent } from '@/components/reading/format';
import type { StoryCard as Story } from '@/lib/library/server';
import { storyTopics } from '@/lib/topics/spotlight';

/**
 * «Продовжити читання» — широка картка над полицею.
 *
 * Вона стоїть окремо, а не першою карткою серед оповідань, з тієї ж
 * причини, що й «Продовжити» в каталозі правил: полиця відповідає на
 * «що тут є», ця картка — на «де я зупинився». Злившись із сіткою,
 * вона стала б третьою книжкою серед двох.
 *
 * Корінець замість обкладинки — 58×80 з назвою дрібним по низу. Це не
 * заготовка під картинку: на полиці обкладинка вже є в самій картці
 * оповідання, і другий її показ тут нічого не додав би, а от форма
 * книжкового корінця миттєво каже, що йдеться про книжку, яку вже
 * тримали в руках.
 */
export function ContinueBanner({ story, anchor }: { story: Story; anchor: number }) {
  const percent = readPercent(anchor, story.totalTokens);
  const left = minutesLeft(story.words, percent);
  const topics = storyTopics(story.stats);

  return (
    <div className="bg-card border-line rounded-panel-xl mb-7 grid grid-cols-[1fr_auto] items-center gap-6 border px-[26px] py-5">
      <div className="flex min-w-0 items-center gap-[18px]">
        <div className="bg-bg border-line shadow-bubble box-border flex h-20 w-[58px] flex-none items-end rounded-md border p-1.5">
          <span className="font-serif text-[8px] leading-[1.2] font-bold">{story.title}</span>
        </div>

        <div className="min-w-0">
          <div className="text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
            Продовжити читання
          </div>
          <div className="font-serif mt-1 truncate text-[22px] font-extrabold tracking-[-0.3px]">
            {story.title}{' '}
            <span className="font-sans text-ink-3 text-[13.5px] font-semibold">
              · {story.author}
              {story.level ? ` · ${story.level}` : ''}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="bg-track h-1.5 w-[280px] max-w-[40vw] overflow-hidden rounded-pill">
              <div className="bg-acc h-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-ink-3 text-[13px]">
              {percent}% · ~{left} хв лишилось
              {topics[0] ? ` · підсвітка: ${topics[0]}` : ''}
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/library/${story.slug}`}
        className="border-acc text-green-tx rounded-btn bg-card hover:bg-tint border-[1.5px] px-[22px] py-3 text-[15px] font-bold whitespace-nowrap"
      >
        Читати далі →
      </Link>
    </div>
  );
}

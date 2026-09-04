import Link from 'next/link';

import { formatWords, readingMinutes } from '@/components/reading/format';
import { ImageSlot } from '@/components/ui/ImageSlot';
import type { StoryCard as Story } from '@/lib/library/server';
import { storyTopics } from '@/lib/topics/spotlight';

/**
 * Картка оповідання на полиці.
 *
 * Обкладинка тут — головне, і саме тому вона перша й на всю ширину
 * картки: книжку впізнають за обкладинкою раніше, ніж читають назву.
 * Поки ілюстрацій немає, стоїть той самий порожній слот, що й на решті
 * екранів, — з описом майбутньої обкладинки замість неї.
 *
 * Значок рівня й тривалості лежить НА обкладинці, а не під назвою:
 * «чи потягну я це» вирішується одночасно з «а що це», і рознесені по
 * картці ці дві відповіді змушували б читати двічі.
 */
export function StoryCard({ story, percent }: { story: Story; percent: number | null }) {
  const minutes = readingMinutes(story.words);
  const topics = storyTopics(story.stats);
  const started = percent !== null && percent > 0;

  return (
    <div className="bg-card border-line rounded-tile-lg hover:shadow-lift flex flex-col gap-3 border p-[18px] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5">
      <div className="relative h-[150px]">
        <ImageSlot
          caption={`Обкладинка: ${story.title}`}
          sizes="(max-width: 1000px) 100vw, 300px"
        />
        {/* Напівпрозоре біле, а не токен поверхні: значок лежить на
            майбутній ілюстрації, кольору якої ми не знаємо, тому він
            мусить читатись на будь-якій. */}
        <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-pill bg-white/95 px-2.5 py-1 font-mono text-[11px] font-bold">
          {story.level ? `${story.level} · ` : ''}
          {minutes} ХВ
        </span>
      </div>

      <div className="min-w-0">
        <div className="font-serif truncate text-[19px] font-extrabold" title={story.title}>
          {story.title}
        </div>
        <div className="text-ink-3 mt-[3px] text-[13.5px]">
          {story.author} · {formatWords(story.words)} слів · {minutes} хв
        </div>
        {topics.length > 0 ? (
          <div className="text-ink-2 mt-2.5 text-[13px]">
            <span className="text-label">Правила в тексті:</span> {topics.join(' · ')}
          </div>
        ) : null}
      </div>

      {started ? (
        <div className="flex items-center gap-2.5">
          <div className="bg-track h-1.5 flex-1 overflow-hidden rounded-pill">
            <div className="bg-acc h-full" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-ink-3 text-[12.5px]">{percent}%</span>
        </div>
      ) : null}

      {/* mt-auto притискає дію до низу: описи й переліки правил різної
          довжини, і без цього кнопки в сусідніх картках не збігалися б. */}
      <Link
        href={`/library/${story.slug}`}
        className={`rounded-btn bg-card hover:border-acc hover:text-acc2 mt-auto block border-[1.5px] p-[11px] text-center text-[14px] font-bold ${
          started ? 'border-acc text-green-tx' : 'border-line-ctrl text-ink'
        }`}
      >
        {started ? 'Продовжити' : 'Почати'}
      </Link>
    </div>
  );
}

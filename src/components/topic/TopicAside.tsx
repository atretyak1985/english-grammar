'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { readingMinutes } from '@/components/reading/format';
import type { Spotlight } from '@/lib/topics/spotlight';
import type { TopicMeta } from '@/types/content';

/**
 * Бічна колонка теми: де я, де це видно в тексті, на чому спотикаються.
 *
 * Три картки відповідають на три різні питання, і жодна з них не
 * повторює вміст лівої колонки. Тому колонка липка: список розділів
 * довгий, а «далі» і «читати з підсвіткою» потрібні на будь-якій його
 * висоті — інакше по них треба вертатись угору.
 */
export function TopicAside({
  topic,
  spotlight,
}: {
  topic: TopicMeta;
  spotlight: Spotlight | null;
}) {
  const { isSectionRead, readCount, ready } = useAppState();

  const total = topic.sections.length;
  const read = ready ? readCount(topic.slug) : 0;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);
  const next = ready
    ? topic.sections.find((section) => !isSectionRead(topic.slug, section.id))
    : topic.sections[0];

  // «Пастка» веде в розділ теми про помилки українців. Він є майже в
  // усіх темах, але не в усіх (у прийменниках помилки розкидані по
  // розділах), тому картка умовна, а не з підставленим текстом.
  const trap = topic.sections.find((section) => section.id === 'traps');

  return (
    <aside className="sticky top-[120px] flex flex-col gap-3.5">
      <div className="bg-card border-line rounded-tile-lg border px-5 py-[18px]">
        <div className="text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
          Ваш прогрес
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-[32px] font-extrabold">{read}</span>
          <span className="text-ink-3 text-[14px]">з {total} розділів</span>
        </div>
        <div className="bg-track mt-2 h-1.5 overflow-hidden rounded-pill">
          <div className="bg-acc h-full" style={{ width: `${percent}%` }} />
        </div>
        {next ? (
          <Link
            href={`/topics/${topic.slug}/${next.slug}`}
            className="bg-acc hover:bg-acc2 rounded-btn mt-3.5 block p-[11px] text-center text-[14px] font-bold text-white hover:text-white"
          >
            Далі: {next.short ?? next.title} →
          </Link>
        ) : (
          <div className="text-green-tx mt-3.5 text-center text-[14px] font-bold">
            Тему пройдено
          </div>
        )}
      </div>

      {/* Числа тут — з розбору самого оповідання, а не з копірайту макета.
          Для тем, які підсвіткою часів не вимірюються (артиклі, модальні,
          прийменники), картки немає взагалі: «0 конструкцій» під написом
          «побачити в тексті» нічого не обіцяє. */}
      {spotlight ? (
        <div className="bg-card border-line rounded-tile-lg border px-5 py-[18px]">
          <div className="text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
            Побачити в тексті
          </div>
          <p className="text-ink-body m-0 mt-2 mb-3 text-[14px] leading-[1.5]">
            У «{spotlight.story.title}» — {spotlight.counts.map((c) => `${c.count} ${c.label}`).join(', ')}.{' '}
            {readingMinutes(spotlight.story.words)} хвилин читання з підсвіткою саме цієї теми.
          </p>
          <Link
            href={`/library/${spotlight.story.slug}`}
            className="border-line-ctrl text-ink hover:border-acc hover:text-acc2 rounded-btn block border-[1.5px] p-2.5 text-center text-[14px] font-bold"
          >
            Читати з підсвіткою →
          </Link>
        </div>
      ) : null}

      {trap ? (
        <Link
          href={`/topics/${topic.slug}/${trap.slug}`}
          className="bg-deep text-deep-ink rounded-tile-lg block px-5 py-[18px] hover:text-deep-ink"
        >
          <div className="text-yellow font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
            Пастка для українців
          </div>
          <div className="font-serif mt-2 text-[16px] leading-[1.4] font-bold">{trap.title}</div>
          {trap.lede ? (
            <div className="text-deep-ink-2 mt-1.5 text-[13px]">
              {trap.lede} · розділ {trap.n}
            </div>
          ) : null}
        </Link>
      ) : null}
    </aside>
  );
}

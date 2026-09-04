'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { TopicCard, TopicProgress } from '@/components/topic/TopicCard';
import { LEVEL_LABEL, READY_TOPICS, TOPICS } from '@/data/topics';
import type { Level } from '@/types/content';

/**
 * Каталог правил: фільтр за рівнем, полиця готових тем, рядок про
 * заплановані.
 *
 * Фільтр не ховає теми, а притлумлює їх — так у макеті, і так правильно:
 * перелік із одинадцяти позицій людина вже встигла охопити оком, і
 * зникнення половини читається як «сайт зламався», а не як «я звузив
 * вибірку». Притлумлена картка лишається клікабельною навмисно: фільтр
 * тут допомагає знайти, а не забороняє відкрити.
 *
 * Кнопки рівнів виведені з даних, а не прописані. У макеті їх рівно
 * три — A2, B1, B2, — бо стільки рівнів мають готові теми; коли поїде
 * перша C1 (в планах лежить «Інверсія та емфаза»), кнопка зʼявиться
 * сама. Прописаний список тихо загубив би її.
 */
export function TopicsCatalog({ continueSlot }: { continueSlot?: ReactNode }) {
  const { readCount, ready } = useAppState();
  const [level, setLevel] = useState<Level | 'all'>('all');

  const levels = useMemo(() => {
    const present = new Set(READY_TOPICS.map((topic) => topic.level));
    return (['a2', 'b1', 'b2', 'c1'] as const).filter((item) => present.has(item));
  }, []);

  const planned = TOPICS.filter((topic) => !topic.ready);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif m-0 mb-2 text-[40px] leading-[1.05] font-extrabold tracking-[-0.8px]">
            Правила
          </h1>
          <p className="text-ink-2 m-0 max-w-[60ch] text-[16px]">
            {READY_TOPICS.length} тем з поясненнями українською. Кожна — короткі розділи, приклади
            з перекладом, помилки українців, вправи й тест.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-ink-3 mr-1 text-[13px]">Рівень</span>
          <LevelButton active={level === 'all'} onClick={() => setLevel('all')}>
            Усі
          </LevelButton>
          {levels.map((item) => (
            <LevelButton key={item} active={level === item} onClick={() => setLevel(item)}>
              {LEVEL_LABEL[item]}
            </LevelButton>
          ))}
        </div>
      </div>

      {continueSlot}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {READY_TOPICS.map((topic) => (
          <TopicCard
            key={topic.slug}
            topic={topic}
            dimmed={level !== 'all' && topic.level !== level}
            progress={
              ready ? (
                <TopicProgress read={readCount(topic.slug)} total={topic.sections.length} />
              ) : null
            }
          />
        ))}
      </div>

      {/* Заплановані — рядком, а не картками. Вони нікуди не ведуть, і
          картка обіцяла б клік, якого немає. Число в підписі рахується,
          а не стоїть константою: теми доїжджають по одній. */}
      <div className="border-line-ctrl rounded-tile-lg text-ink-3 mt-7 flex flex-wrap items-baseline gap-3 border border-dashed px-[22px] py-[18px] text-[14px]">
        <span className="text-label font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
          У планах · {planned.length}
        </span>
        <span>{planned.map((topic) => topic.title).join(' · ')}</span>
      </div>
    </>
  );
}

/**
 * Кнопка рівня. Обрана несе зелену рамку й мʼятну заливку, решта —
 * нейтральну рамку контрола: у макеті активність позначена саме
 * кольором рамки, а не вагою тексту, тому ширина ряду не стрибає
 * при перемиканні.
 */
function LevelButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-pill cursor-pointer border-[1.5px] px-3.5 py-2 font-mono text-[12px] font-bold transition-colors duration-150 ease-out ${
        active
          ? 'border-acc bg-tint text-green-tx'
          : 'border-line-ctrl bg-card text-ink-2 hover:border-acc'
      }`}
    >
      {children}
    </button>
  );
}

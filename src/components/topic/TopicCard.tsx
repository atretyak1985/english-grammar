import Link from 'next/link';
import type { ReactNode } from 'react';

import { LEVEL_LABEL } from '@/data/topics';
import type { TopicMeta } from '@/types/content';

/**
 * Картка теми — одна форма на два екрани.
 *
 * Полиця тем стоїть і на головній, і в каталозі правил, і в макеті це
 * буквально та сама картка: 14px радіус, заголовок серифом у 19px,
 * рівень у моно-рамці праворуч, опис, і рядок метаданих, притиснутий
 * до низу через `mt-auto`. Різниця рівно одна — у каталозі в тому
 * рядку праворуч ще й прогрес. Тому вона тут одна, а не дві схожі:
 * розʼїхавшись, вони розʼїхалися б непомітно, бо стоять на різних
 * екранах і поруч їх ніхто не бачить.
 *
 * `progress` — слот, а не пропси прогресу. Картка не знає ні про стан
 * застосунку, ні про те, чи людина взагалі щось читала: вона серверна
 * й лишається серверною, а клієнтський шматок приходить у неї ззовні.
 */
export function TopicCard({
  topic,
  progress,
  dimmed = false,
}: {
  topic: TopicMeta;
  progress?: ReactNode;
  /** Не збігається з фільтром рівня: тьмяніє, але лишається клікабельною */
  dimmed?: boolean;
}) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={`bg-card border-line rounded-tile-lg text-ink hover:shadow-lift flex flex-col gap-2 border px-[22px] py-5 transition-[transform,box-shadow,opacity] duration-150 ease-out hover:-translate-y-0.5 hover:text-ink ${
        dimmed ? 'opacity-35' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <span className="font-serif text-[19px] leading-[1.2] font-extrabold">{topic.title}</span>
        <span className="border-line-ctrl rounded-badge text-ink-2 flex-none border-[1.5px] px-[7px] py-0.5 font-mono text-[11px] font-bold">
          {LEVEL_LABEL[topic.level]}
        </span>
      </div>

      <span className="text-ink-2 text-[14px] leading-[1.5]">{topic.desc}</span>

      <div className="text-ink-3 mt-auto flex items-center gap-2.5 pt-1.5 text-[13px]">
        <span>{topic.sections.length} розділів · тест</span>
        {progress}
      </div>
    </Link>
  );
}

/**
 * Прогрес теми в рядку метаданих: смужка 60px і підпис.
 *
 * Показується лише коли розділи справді прочитані. Нуль тут не «0 з 15»,
 * а порожнеча: у макеті картка без прогресу має чистий рядок, і це
 * правильно — смужка на нулі обіцяє почату роботу, якої не було.
 */
export function TopicProgress({ read, total }: { read: number; total: number }) {
  if (read === 0 || total === 0) return null;

  const done = read >= total;

  return (
    <span className="text-green-tx ml-auto flex items-center gap-2 font-bold">
      <span className="bg-track inline-block h-1 w-[60px] overflow-hidden rounded-pill">
        <span
          className="bg-acc block h-full"
          style={{ width: `${Math.min(100, Math.round((read / total) * 100))}%` }}
        />
      </span>
      {done ? 'пройдено' : `${read} з ${total}`}
    </span>
  );
}

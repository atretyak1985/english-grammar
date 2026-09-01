'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';

/**
 * «Продовжити»: одна тема, у якій людина зупинилася.
 *
 * Числа тут справжні — прочитані розділи проти всіх розділів теми, —
 * і смужка показує саме їх. Хвилин, що лишилися, макет обіцяє, але в
 * розділах немає тривалості, тому підпис їх не вигадує: обіцяти
 * «~8 хв» без жодного джерела означало б зламати те саме правило
 * чесних чисел, на якому стоїть весь екран.
 */
export function ContinueCard() {
  const { state, readCount, ready } = useAppState();

  const topic = READY_TOPICS.find((item) => item.slug === state.lastTopic) ?? READY_TOPICS[0];

  if (!topic) return null;

  const total = topic.sections.length;
  const read = ready ? readCount(topic.slug) : 0;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="bg-panel border-line rounded-tile block border px-6 py-5"
    >
      <div className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        {read > 0 ? 'Продовжити' : 'Почати'}
      </div>

      <div className="mt-2.5 flex items-center gap-3.5">
        {/* Обкладинка: та сама форма, що в книжки на полиці, — щоб тема
            в цій картці читалась як те, що читають, а не як розділ меню */}
        <div
          className="flex h-[60px] w-11 flex-none items-end rounded-md p-[5px]"
          style={{ backgroundImage: 'linear-gradient(160deg, #2b4a8f, #1d3057)' }}
          aria-hidden
        >
          <span className="font-serif text-[7px] leading-[1.2] text-white">{topic.title}</span>
        </div>

        <div className="min-w-0">
          <div className="font-serif truncate text-[15.5px] font-bold">{topic.title}</div>
          <div className="bg-track rounded-pill mt-2 h-1.5 overflow-hidden">
            <div className="bg-acc rounded-pill h-full" style={{ width: `${percent}%` }} />
          </div>
          <div className="text-ink-3 mt-[5px] text-[12px]">
            розділ {Math.min(read + 1, total)} з {total}
          </div>
        </div>
      </div>
    </Link>
  );
}

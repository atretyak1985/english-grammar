'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { WordStatus } from '@/types/state';

export const STATUS_LABELS: Record<WordStatus, string> = {
  unknown: 'не знаю',
  learning: 'вчу',
  known: 'знаю',
};

/** Увімкнений стан кнопки: «не знаю» — червоний, «вчу» — помаранчевий, «знаю» — зелений. */
const ACTIVE_TONE: Record<WordStatus, string> = {
  unknown: 'border-no bg-no-bg text-no',
  learning: 'border-pc bg-pc-bg text-pc-dk',
  known: 'border-ok bg-ok-bg text-ok',
};

const ROW_BUTTON =
  'cursor-pointer rounded-[7px] border px-[9px] py-1 text-[11.5px] leading-[normal] font-bold whitespace-nowrap';
const IDLE_TONE = 'border-line bg-transparent text-ink-3';

/** Три кнопки статусу — таблиця слів. */
export function WordStatusButtons({ word }: { word: string }) {
  const { wordStatus, setWordStatus } = useAppState();
  const current = wordStatus(word);

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {(Object.keys(STATUS_LABELS) as WordStatus[]).map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => setWordStatus(word, status)}
          aria-pressed={current === status}
          className={`${ROW_BUTTON} ${current === status ? ACTIVE_TONE[status] : IDLE_TONE}`}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}

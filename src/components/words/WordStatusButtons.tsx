'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { WordStatus } from '@/types/state';

export const STATUS_LABELS: Record<WordStatus, string> = {
  unknown: 'не знаю',
  learning: 'вчу',
  known: 'знаю',
};

const ACTIVE_TONE: Record<WordStatus, string> = {
  unknown: 'border-line-strong bg-surface-2 text-ink',
  learning: 'border-pc bg-pc-bg text-pc-dk',
  known: 'border-ok bg-ok-bg text-ok',
};

/** Три кнопки статусу. Той самий сенс у таблиці слів і на сторінці теми. */
export function WordStatusButtons({ word, size = 'md' }: { word: string; size?: 'sm' | 'md' }) {
  const { wordStatus, setWordStatus } = useAppState();
  const current = wordStatus(word);

  const padding = size === 'sm' ? 'px-2 py-[3px] text-[11.5px]' : 'px-2.5 py-1 text-[12.5px]';

  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(STATUS_LABELS) as WordStatus[]).map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => setWordStatus(word, status)}
          aria-pressed={current === status}
          className={`cursor-pointer rounded-md border font-semibold transition ${padding} ${
            current === status
              ? ACTIVE_TONE[status]
              : 'border-line bg-surface text-ink-3 hover:border-line-strong'
          }`}
        >
          {STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}

'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { WordStatus } from '@/types/state';

export const STATUS_LABELS: Record<WordStatus, string> = {
  unknown: 'не знаю',
  hidden: 'приховане',
  learning: 'вчу',
  known: 'знаю',
};

/**
 * Драбинка знання — тільки ті статуси, які читач ставить кнопкою в рядку.
 * `hidden` тут навмисно відсутній: приховування живе окремою дією. Набір кнопок
 * задає цей явний упорядкований масив, а не ключі мапи підписів — інакше кожен
 * новий статус у мапі сам домальовував би собі кнопку.
 */
export const LADDER_STATUSES: WordStatus[] = ['unknown', 'learning', 'known'];

/** Увімкнений стан кнопки: «не знаю» — червоний, «вчу» — помаранчевий, «знаю» — зелений. */
export const ACTIVE_TONE: Record<WordStatus, string> = {
  unknown: 'border-no bg-no-bg text-no',
  learning: 'border-pc bg-pc-bg text-pc-dk',
  known: 'border-ok bg-ok-bg text-ok',
  // Приховане — приглушений тон наявними токенами: власний колір натякав би,
  // що це ще одна сходинка знання, а це просто «прибрано з очей».
  hidden: 'border-line bg-hover text-ink-3',
};

/**
 * Клас кнопки статусу. Експортований, бо той самий вигляд потрібен у списку
 * незнайомих слів в аналізаторі — дублювати стилі там означало б розʼїхатись.
 * `leading-[normal]` обовʼязковий: `text-[11.5px]` у Tailwind не скидає
 * line-height, і без нього кнопки поїдуть по висоті.
 */
export const ROW_BUTTON =
  'cursor-pointer rounded-[7px] border px-[9px] py-1 text-[11.5px] leading-[normal] font-bold whitespace-nowrap';
export const IDLE_TONE = 'border-line bg-transparent text-ink-3';

/** Три кнопки статусу. Той самий сенс у таблиці слів і в аналізаторі. */
export function WordStatusButtons({ word }: { word: string }) {
  const { wordStatus, setWordStatus } = useAppState();
  const current = wordStatus(word);

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {LADDER_STATUSES.map((status) => (
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

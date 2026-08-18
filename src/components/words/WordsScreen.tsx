'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { STATUS_LABELS, WordStatusButtons } from '@/components/words/WordStatusButtons';
import { WORD_LIST_LIMIT, wordFrequency } from '@/lib/analyzer/vocabulary';
import { useTexts } from '@/lib/state/texts';
import type { WordStatus } from '@/types/state';

type Filter = 'all' | WordStatus;

/**
 * Словник: частотний список слів з усіх збережених текстів (CONCEPT 5).
 * Вчити варто те, що ви щойно зустріли кілька разів у потрібному вам тексті.
 */
export function WordsScreen() {
  const { state, wordStatus, ready } = useAppState();
  const { texts, ready: textsReady } = useTexts();
  const [filter, setFilter] = useState<Filter>('all');

  const frequency = useMemo(
    () => wordFrequency(texts.map((text) => text.body).join('\n\n')),
    [texts],
  );

  const rows = useMemo(
    () =>
      frequency
        .filter((entry) => filter === 'all' || wordStatus(entry.word) === filter)
        .slice(0, WORD_LIST_LIMIT),
    [frequency, filter, wordStatus],
  );

  const maxCount = frequency[0]?.count ?? 1;
  const learning = Object.values(state.words).filter((status) => status === 'learning').length;
  const known = Object.values(state.words).filter((status) => status === 'known').length;

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8">
      <h1 className="mt-0 mb-1.5 text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.6px]">
        Слова
      </h1>
      <p className="text-ink-2 mt-0 mb-6 max-w-[760px] text-[17px]">
        Список складено за частотністю в текстах, які ви аналізували. Це і є відповідь на «які слова
        вчити першими».
      </p>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Tile value={frequency.length} label="слів у корпусі" />
        <Tile value={ready ? learning : 0} label="вчу зараз" />
        <Tile value={ready ? known : 0} label="позначено «знаю»" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', 'unknown', 'learning', 'known'] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold ${
              filter === option
                ? 'border-line-strong bg-surface-2 text-ink'
                : 'border-line bg-surface text-ink-3'
            }`}
          >
            {option === 'all' ? 'усі' : STATUS_LABELS[option]}
          </button>
        ))}
      </div>

      {textsReady && texts.length === 0 ? (
        <div className="bg-surface border-line rounded-card shadow-card mt-6 border px-6 py-6">
          <b>Корпус поки порожній.</b>
          <p className="text-ink-2 mt-2 mb-0 text-[15px]">
            Відкрийте <Link href="/analyze" className="text-ps-dk font-semibold">Аналіз тексту</Link>
            , вставте статтю або лист і збережіть їх у бібліотеку — слова звідти з&apos;являться тут,
            відсортовані за частотою.
          </p>
        </div>
      ) : (
        <div className="bg-surface border-line shadow-card mt-6 overflow-hidden rounded-xl border">
          {rows.map((entry, index) => (
            <div
              key={entry.word}
              className="border-line hover:bg-surface-3 grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[32px_160px_1fr_auto]"
            >
              <span className="text-ink-3 text-[12.5px] font-bold">{index + 1}</span>
              <span
                className={`text-[15.5px] font-semibold ${
                  wordStatus(entry.word) === 'known' ? 'text-ink-3' : ''
                }`}
              >
                {entry.word}
                <span className="text-ink-3 ml-2 text-[12.5px] font-bold">×{entry.count}</span>
              </span>
              <div className="bg-surface-2 hidden h-1.5 overflow-hidden rounded-full sm:block">
                <div
                  className="bg-ps h-full"
                  style={{ width: `${(entry.count / maxCount) * 100}%` }}
                />
              </div>
              <WordStatusButtons word={entry.word} size="sm" />
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="text-ink-3 px-4 py-4 text-[14px]">
              За цим фільтром слів немає.
            </div>
          ) : null}
        </div>
      )}

      {texts.length > 0 ? (
        <p className="text-ink-3 mt-4 text-[13px]">
          Джерела: {texts.length} текст(ів). Показано перші {WORD_LIST_LIMIT} позицій списку.
        </p>
      ) : null}
    </div>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
      <div className="text-[26px] font-extrabold tracking-[-0.5px]">{value}</div>
      <div className="text-ink-3 text-[12.5px] font-bold tracking-[0.8px] uppercase">{label}</div>
    </div>
  );
}

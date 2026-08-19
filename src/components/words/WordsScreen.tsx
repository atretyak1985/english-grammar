'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { WordStatusButtons } from '@/components/words/WordStatusButtons';
import { WORD_LIST_LIMIT, wordFrequency } from '@/lib/analyzer/vocabulary';
import { useTexts } from '@/lib/state/texts';
import type { WordStatus } from '@/types/state';

type Filter = 'all' | WordStatus;

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Усі',
  unknown: 'Не знаю',
  learning: 'Вчу',
  known: 'Знаю',
};

/** Сітка таблиці: номер, слово, разів, частка, статуси. */
const ROW_GRID = 'grid grid-cols-[30px_minmax(0,1fr)_52px_minmax(60px,90px)_170px] gap-2.5';

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
    <div className="max-w-[1240px] px-[30px] pt-[30px] pb-[70px]">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Слова за частотою</h1>
      <p className="text-ink-2 mt-0 mb-[22px] max-w-[760px] text-[16.5px]">
        Список побудований з текстів, які ви аналізували: спершу те, що зустрічається найчастіше.
        Вчіть згори вниз — так найбільша віддача на витрачений час.
      </p>

      <div className="mb-5 flex flex-wrap gap-3.5">
        <Tile value={frequency.length} label="слів у корпусі" accent="border-l-ps" />
        <Tile value={ready ? learning : 0} label="вчу зараз" accent="border-l-pc" />
        <Tile value={ready ? known : 0} label="позначено «знаю»" accent="border-l-ok" />
      </div>

      <div className="mb-3.5 flex flex-wrap gap-[7px]">
        {(['all', 'unknown', 'learning', 'known'] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-btn cursor-pointer border px-[13px] py-1.5 text-[12.5px] leading-[normal] font-bold ${
              filter === option
                ? 'border-ps bg-ps-bg text-ps-dk'
                : 'border-line text-ink-2 bg-transparent'
            }`}
          >
            {FILTER_LABELS[option]}
          </button>
        ))}
      </div>

      {textsReady && texts.length === 0 ? (
        <div className="bg-surface border-line rounded-card shadow-card border px-[26px] py-[26px]">
          <b>Корпус поки порожній.</b>
          <p className="text-ink-2 mt-2 mb-0 text-[15px]">
            Відкрийте{' '}
            <Link href="/analyze" className="text-ps-dk font-semibold">
              Аналіз тексту
            </Link>
            , вставте статтю або лист і збережіть їх у бібліотеку — слова звідти з&apos;являться тут,
            відсортовані за частотою.
          </p>
        </div>
      ) : (
        <div className="bg-surface border-line rounded-card shadow-card overflow-hidden border">
          <div
            className={`${ROW_GRID} bg-surface-2 border-line text-ink-2 border-b px-4 py-2.5 text-[11.5px] font-extrabold tracking-[0.7px] uppercase`}
          >
            <div>#</div>
            <div className="min-w-0 truncate">Слово</div>
            <div>Разів</div>
            <div>Частка</div>
            <div>Статус</div>
          </div>

          {rows.map((entry, index) => (
            <div
              key={entry.word}
              className={`${ROW_GRID} border-line items-center border-b px-4 py-[11px] text-[14.5px] last:border-b-0`}
            >
              <div className="text-ink-3 font-bold">{index + 1}</div>
              <div className="min-w-0 overflow-hidden">
                <span
                  className={`inline-block max-w-full truncate align-bottom font-semibold ${
                    wordStatus(entry.word) === 'known'
                      ? 'text-ink-3'
                      : wordStatus(entry.word) === 'learning'
                        ? 'bg-pc-bg text-pc-dk rounded px-1'
                        : 'decoration-ink-3 underline decoration-dotted decoration-2 underline-offset-4'
                  }`}
                >
                  {entry.word}
                </span>
              </div>
              <div className="font-bold">{entry.count}</div>
              <div>
                <div className="bg-surface-2 h-1.5 overflow-hidden rounded-md">
                  <div
                    className="bg-ps h-full"
                    style={{ width: `${Math.round((entry.count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
              <WordStatusButtons word={entry.word} />
            </div>
          ))}
          {rows.length === 0 ? (
            <div className="text-ink-3 px-4 py-4 text-[14px]">За цим фільтром слів немає.</div>
          ) : null}
        </div>
      )}

      {texts.length > 0 ? (
        <p className="text-ink-3 mt-3.5 text-[12.5px]">
          Джерела: {texts.length} текст(ів). Показано перші {WORD_LIST_LIMIT} позицій списку.
        </p>
      ) : null}
    </div>
  );
}

function Tile({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div
      className={`bg-surface border-line rounded-panel shadow-card min-w-[170px] border border-l-[3px] px-[18px] py-4 ${accent}`}
    >
      <div className="text-[26px] font-extrabold tracking-[-0.6px]">{value}</div>
      <div className="text-ink-3 text-[12px] font-bold tracking-[0.9px] uppercase">{label}</div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { WordStatusButtons } from '@/components/words/WordStatusButtons';
import { audioMimeType, transcodedMp3Url } from '@/lib/dictionary/audio';
import { useDictionary, useFullEntry } from '@/lib/dictionary/client';
import { NOTE_MAX } from '@/lib/state/storage';
import type { WordStatus } from '@/types/state';

/** «Не знаю» тут фільтром не буває: таких слів у словнику немає за визначенням. */
type Filter = 'all' | 'learning' | 'known';

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Усі',
  learning: 'Вчу',
  known: 'Знаю',
};

const FILTERS: Filter[] = ['all', 'learning', 'known'];

/** Слово потрапляє у словник, щойно користувач позначив його одним із цих статусів. */
const IN_DICTIONARY: WordStatus[] = ['learning', 'known'];

/**
 * Скільки рядків показувати за раз. Це не косметика: батч-ручка словника бере
 * рівно 50 слів за запит, тому сторінка на 50 рядків — це один зовнішній запит.
 */
const PAGE_SIZE = 50;

/** Сітка таблиці: слово, транскрипція, означення, статуси, розкривач. */
const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.7fr)_210px_34px] gap-2.5';

const PANEL = 'bg-surface-2 rounded-panel px-4 py-3';
const PANEL_LABEL = 'text-ink-3 mb-1.5 text-[10.5px] leading-[normal] font-extrabold tracking-[1.1px] uppercase';

/**
 * Мій словник: слова, які користувач позначив «вчу» або «знаю» (CONCEPT 5).
 * Джерело рядків — саме стан користувача, а не корпус текстів: у словнику має
 * бути те, що людина свідомо взяла вчити, а не все, що трапилося в статті.
 */
export function WordsScreen() {
  const { state, wordStatus, ready } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE_SIZE);
  /** Розкритий рядок рівно один: інакше сторінка тягла б 50 повних статей. */
  const [openWord, setOpenWord] = useState<string | null>(null);

  const dictionary = useMemo(
    () => Object.entries(state.words).filter(([, status]) => IN_DICTIONARY.includes(status)),
    [state.words],
  );

  const rows = useMemo(
    () =>
      dictionary
        .filter(([, status]) => filter === 'all' || status === filter)
        .sort((a, b) => a[0].localeCompare(b[0])),
    [dictionary, filter],
  );

  const visible = useMemo(() => rows.slice(0, shown), [rows, shown]);

  // Статті питаються ТІЛЬКИ для показаних рядків: словник на 500 слів одним
  // батчем ручка не приймає, та й дані для схованих рядків нікому не потрібні.
  const { brief } = useDictionary(useMemo(() => visible.map(([word]) => word), [visible]));

  const learning = dictionary.filter(([, status]) => status === 'learning').length;
  const known = dictionary.length - learning;

  const changeFilter = (option: Filter) => {
    setFilter(option);
    setShown(PAGE_SIZE);
    setOpenWord(null);
  };

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-[70px]">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Мій словник</h1>
      <p className="text-ink-2 mt-0 mb-[22px] max-w-[760px] text-[16.5px]">
        Тут те, що ви самі позначили «вчу» або «знаю» в аналізаторі. Для кожного слова —
        транскрипція й англійське означення; розкрийте рядок, щоб побачити повну статтю,
        приклади, вимову й лишити власну нотатку.
      </p>

      <div className="mb-5 flex flex-wrap gap-3.5">
        <Tile value={ready ? dictionary.length : 0} label="у словнику" accent="border-l-ps" />
        <Tile value={ready ? learning : 0} label="вчу зараз" accent="border-l-pc" />
        <Tile value={ready ? known : 0} label="позначено «знаю»" accent="border-l-ok" />
      </div>

      <div className="mb-3.5 flex flex-wrap gap-[7px]">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => changeFilter(option)}
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

      {ready && dictionary.length === 0 ? (
        <div className="bg-surface border-line rounded-card shadow-card border px-[26px] py-[26px]">
          <b>Словник поки порожній.</b>
          <p className="text-ink-2 mt-2 mb-0 text-[15px]">
            Слова сюди приходять не з збережених текстів, а з ваших позначок. Відкрийте{' '}
            <Link href="/analyze" className="text-ps-dk font-semibold">
              Аналіз тексту
            </Link>
            , натисніть на незнайомому слові «вчу» або «знаю» — і воно з&apos;явиться в цьому
            списку.
          </p>
        </div>
      ) : (
        <div className="bg-surface border-line rounded-card shadow-card overflow-hidden border">
          <div
            className={`${ROW_GRID} bg-surface-2 border-line text-ink-2 border-b px-4 py-2.5 text-[11.5px] leading-[normal] font-extrabold tracking-[0.7px] uppercase`}
          >
            <div className="min-w-0 truncate">Слово</div>
            <div className="min-w-0 truncate">Транскрипція</div>
            <div className="min-w-0 truncate">Означення</div>
            <div>Статус</div>
            <div />
          </div>

          {visible.map(([word]) => {
            const entry = brief.get(word);
            const open = openWord === word;

            return (
              <div key={word} className="border-line border-b last:border-b-0">
                <div className={`${ROW_GRID} items-center px-4 py-[11px] text-[14.5px]`}>
                  <div className="min-w-0 overflow-hidden">
                    <span
                      className={`inline-block max-w-full truncate align-bottom font-semibold ${
                        wordStatus(word) === 'known' ? 'text-ink-3' : 'bg-pc-bg text-pc-dk rounded px-1'
                      }`}
                    >
                      {word}
                    </span>
                  </div>
                  <div className="text-ink-2 min-w-0 truncate font-mono text-[13.5px]">
                    {entry?.ipa ? `/${entry.ipa}/` : <span className="text-ink-3">—</span>}
                  </div>
                  {/*
                    Порожньо тут означає рівно одне: означення немає. Рядок
                    показує англійське означення зі статті. Це рідкість —
                    заміряно 98–100% придатних означень на всіх трьох частотних
                    смугах, а всі промахи — британські написання, які резолвер
                    доводить до леми. Спінера в рядку немає навмисно: 50 рядків,
                    що блимають, читати неможливо.
                  */}
                  <div className="text-ink-2 min-w-0 truncate">
                    {entry?.definition ?? <span className="text-ink-3">—</span>}
                  </div>
                  <WordStatusButtons word={word} />
                  <button
                    type="button"
                    onClick={() => setOpenWord(open ? null : word)}
                    aria-expanded={open}
                    aria-label={open ? `Згорнути статтю: ${word}` : `Розкрити статтю: ${word}`}
                    className={`border-line text-ink-2 h-[26px] w-[26px] cursor-pointer rounded-[7px] border bg-transparent text-[12px] leading-[normal] ${
                      open ? 'bg-surface-2' : ''
                    }`}
                  >
                    {open ? '⌃' : '⌄'}
                  </button>
                </div>

                {open ? (
                  <div className="px-4 pb-3">
                    <WordDetails word={word} />
                  </div>
                ) : null}
              </div>
            );
          })}

          {visible.length === 0 ? (
            <div className="text-ink-3 px-4 py-4 text-[14px]">За цим фільтром слів немає.</div>
          ) : null}
        </div>
      )}

      {rows.length > visible.length ? (
        <button
          type="button"
          onClick={() => setShown((current) => current + PAGE_SIZE)}
          className="rounded-btn border-line text-ink-2 mt-3.5 cursor-pointer border bg-transparent px-[15px] py-2 text-[13px] leading-[normal] font-bold"
        >
          Показати ще — лишилося {rows.length - visible.length}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Повна стаття під розкритим рядком. Окремий компонент, бо запит на неї робить
 * хук: рівно один розкритий рядок — рівно один хук у дереві.
 */
function WordDetails({ word }: { word: string }) {
  const { note, setNote } = useAppState();
  const { entry, loading, error } = useFullEntry(word);
  const [draft, setDraft] = useState(() => note(word));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mp3 = transcodedMp3Url(entry?.audioUrl ?? null);
  const rest = entry ? entry.definitions.slice(1) : [];

  return (
    <div className={PANEL}>
      {loading ? <div className="text-ink-3 text-[13.5px]">Завантажуємо статтю…</div> : null}
      {error !== null ? <div className="text-ink-2 text-[13.5px]">{error}</div> : null}

      {entry ? (
        <>
          <div className={PANEL_LABEL}>Означення</div>
          <p className="mt-0 mb-0 text-[14.5px]">
            {entry.definitions[0] ?? 'Стаття є, але означення в ній немає.'}
          </p>

          {rest.length > 0 ? (
            <details className="mt-2">
              <summary className="text-ps-dk cursor-pointer text-[12.5px] leading-[normal] font-bold">
                ще {rest.length}{' '}
                {rest.length === 1 ? 'сенс' : rest.length < 5 ? 'сенси' : 'сенсів'}
              </summary>
              <ol className="text-ink-2 mt-1.5 mb-0 flex list-decimal flex-col gap-1 pl-5 text-[14px]">
                {rest.map((definition) => (
                  <li key={definition}>{definition}</li>
                ))}
              </ol>
            </details>
          ) : null}

          {/*
            Приклади: парсер спершу бере короткі навчальні (`#:`), а коли їх
            немає — літературні цитати (`#*`). Резерв потрібен, бо `#:` на
            C1–C2 є лише в 87% статей.
          */}
          {entry.examples.length > 0 ? (
            <>
              <div className={`${PANEL_LABEL} mt-3`}>Приклади</div>
              <ul className="text-ink-2 mt-0 mb-0 flex list-none flex-col gap-1 p-0 text-[14px] italic">
                {entry.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </>
          ) : null}

          {entry.audioUrl !== null || mp3 !== null ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => void audioRef.current?.play().catch(() => undefined)}
                className="rounded-btn border-line text-ink-2 cursor-pointer border bg-transparent px-[11px] py-1 text-[12.5px] leading-[normal] font-bold"
              >
                ♪ Вимова
              </button>
              {/*
                Два джерела обовʼязкові: mp3 перекодовує Commons і саме його
                грає Safari, але існує вона не для кожного файлу — тоді грає
                оригінал. Вибір лишається браузеру, тому canPlayType не потрібен.
              */}
              <audio ref={audioRef} preload="none">
                {mp3 !== null ? <source src={mp3} type="audio/mpeg" /> : null}
                {entry.audioUrl !== null ? (
                  <source src={entry.audioUrl} type={audioMimeType(entry.audioUrl)} />
                ) : null}
              </audio>
            </div>
          ) : null}

          <div className="mt-3">
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-3 text-[11.5px] leading-[normal] underline"
            >
              Wiktionary · CC BY-SA 4.0
            </a>
          </div>
        </>
      ) : null}

      {/*
        Нотатка не залежить від статті: це стан користувача, і писати її треба
        і тоді, коли Вікісловник слова не знає або мережі немає.
      */}
      <div className={`${PANEL_LABEL} mt-3`}>Власна нотатка</div>
      <input
        type="text"
        value={draft}
        maxLength={NOTE_MAX}
        onChange={(event) => {
          setDraft(event.target.value);
          setNote(word, event.target.value);
        }}
        placeholder="Мнемоніка, свій приклад, контекст — що завгодно своє"
        className="border-line bg-surface rounded-btn w-full max-w-[520px] border px-3 py-1.5 text-[13.5px]"
      />
    </div>
  );
}

function Tile({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div
      className={`bg-surface border-line rounded-panel shadow-card min-w-[170px] border border-l-[3px] px-[18px] py-4 ${accent}`}
    >
      <div className="text-[26px] font-extrabold tracking-[-0.6px]">{value}</div>
      <div className="text-ink-3 text-[12px] leading-[normal] font-bold tracking-[0.9px] uppercase">
        {label}
      </div>
    </div>
  );
}

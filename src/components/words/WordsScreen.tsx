'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { LADDER_STATUSES, STATUS_LABELS } from '@/components/words/statuses';
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
 * Скільки карток показувати за раз. Це не косметика: батч-ручка словника бере
 * рівно 50 слів за запит, тому сторінка на 50 карток — це один зовнішній запит.
 */
const PAGE_SIZE = 50;

const CONTROL = 'border-line-ctrl rounded-btn flex flex-none overflow-hidden border-[1.5px]';
const PANEL = 'bg-bg border-line rounded-note border px-4 py-3';
const PANEL_LABEL =
  'text-ink-3 mb-1.5 font-mono text-[10.5px] leading-[normal] font-bold tracking-[1.2px] uppercase';

/**
 * Мій словник: слова, які користувач позначив «вчу» або «знаю» (CONCEPT 5).
 * Джерело карток — саме стан користувача, а не корпус текстів: у словнику має
 * бути те, що людина свідомо взяла вчити, а не все, що трапилося в статті.
 *
 * Картки замість таблиці — не оздоба. У таблиці слово, транскрипція, означення
 * і чотири контроли ділили один рядок, тому на вужчому екрані все це або
 * стискалося до нечитабельного, або їхало вбік. Картка складається сама, а
 * головне — тримає приклад ужитку, заради якого слово й запам'ятовується.
 */
export function WordsScreen() {
  const { state, wordStatus, setWordStatus, ready } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);
  /** Розкрита картка рівно одна: інакше сторінка тягла б 50 повних статей. */
  const [openWord, setOpenWord] = useState<string | null>(null);

  const dictionary = useMemo(
    () => Object.entries(state.words).filter(([, status]) => IN_DICTIONARY.includes(status)),
    [state.words],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dictionary
      .filter(([, status]) => filter === 'all' || status === filter)
      .filter(([word]) => needle === '' || word.includes(needle))
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [dictionary, filter, query]);

  const visible = useMemo(() => rows.slice(0, shown), [rows, shown]);

  // Статті питаються ТІЛЬКИ для показаних карток: словник на 500 слів одним
  // батчем ручка не приймає, та й дані для схованих карток нікому не потрібні.
  const { brief } = useDictionary(useMemo(() => visible.map(([word]) => word), [visible]));

  const learning = dictionary.filter(([, status]) => status === 'learning').length;
  const known = dictionary.length - learning;

  const counts: Record<Filter, number> = {
    all: dictionary.length,
    learning,
    known,
  };

  const changeFilter = (option: Filter) => {
    setFilter(option);
    setShown(PAGE_SIZE);
    setOpenWord(null);
  };

  return (
    <div className="mx-auto w-full max-w-shell px-9 py-9">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif m-0 mb-1.5 text-[32px] font-extrabold tracking-[-0.5px]">
            Мій словник
          </h1>
          <div className="text-ink-2 text-[14px]">
            {ready ? dictionary.length : 0} слів · <b className="text-yellow-tx">{learning} вчу</b> ·{' '}
            {known} знаю
          </div>
        </div>
        {/* Кнопка є лише тоді, коли є що тренувати: заклик без карток за ним — порожня обіцянка */}
        {ready && learning > 0 ? (
          <Link
            href="/train"
            className="bg-acc rounded-btn px-5 py-[11px] text-[14px] leading-[normal] font-bold text-white"
          >
            Тренувати {learning} слів
          </Link>
        ) : null}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => changeFilter(option)}
            aria-pressed={filter === option}
            className={`rounded-pill cursor-pointer px-5 py-[11px] text-[13.5px] leading-[normal] font-bold ${
              filter === option
                ? 'bg-deep text-deep-ink'
                : 'bg-panel border-line-ctrl text-ink-2 border-[1.5px]'
            }`}
          >
            {FILTER_LABELS[option]} · {ready ? counts[option] : 0}
          </button>
        ))}

        <label className="bg-panel border-line-ctrl rounded-pill ml-auto flex min-w-[220px] items-center gap-2 border-[1.5px] px-[18px] py-[11px]">
          <span aria-hidden>🔍</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(PAGE_SIZE);
            }}
            placeholder="Пошук у словнику…"
            aria-label="Пошук у словнику"
            className="text-ink placeholder:text-label w-full min-w-0 bg-transparent text-[13.5px] outline-none"
          />
        </label>
      </div>

      {ready && dictionary.length === 0 ? (
        <div className="bg-panel border-line rounded-panel border px-[26px] py-[26px]">
          <b>Словник поки порожній.</b>
          <p className="text-ink-2 mt-2 mb-0 text-[15px] leading-[1.6]">
            Слова сюди приходять не зі збережених текстів, а з ваших позначок. Відкрийте{' '}
            <Link href="/library" className="text-acc font-bold">
              читання
            </Link>{' '}
            і натисніть на незнайомому слові «вчу» або «знаю» — воно з&apos;явиться тут.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 lg:grid-cols-2">
          {visible.map(([word]) => (
            <WordCard
              key={word}
              word={word}
              ipa={brief.get(word)?.ipa ?? null}
              definition={brief.get(word)?.definition ?? null}
              status={wordStatus(word)}
              onPick={(status) => setWordStatus(word, status)}
              open={openWord === word}
              onToggle={() => setOpenWord(openWord === word ? null : word)}
            />
          ))}

          {visible.length === 0 ? (
            <div className="text-ink-3 text-[14px]">
              {query.trim() === ''
                ? 'За цим фільтром слів немає.'
                : `Нічого не знайшлося на «${query.trim()}».`}
            </div>
          ) : null}
        </div>
      )}

      {rows.length > visible.length ? (
        <button
          type="button"
          onClick={() => setShown((current) => current + PAGE_SIZE)}
          className="border-line-ctrl text-ink rounded-btn mt-4 cursor-pointer border-[1.5px] px-4 py-2.5 text-[13px] leading-[normal] font-bold"
        >
          Показати ще — лишилося {rows.length - visible.length}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Картка слова: саме слово так, як воно виглядає в тексті, і сходинка знання
 * поруч.
 *
 * Слово позначене тим самим жовтим, що й у читанні: людина впізнає його не за
 * підписом статусу, а за виглядом, у якому щойно бачила на сторінці. «Знаю»
 * приглушує всю картку — вона лишається знайденою пошуком, але не претендує
 * на увагу нарівні з тим, що ще вчиться.
 */
function WordCard({
  word,
  ipa,
  definition,
  status,
  onPick,
  open,
  onToggle,
}: {
  word: string;
  ipa: string | null;
  definition: string | null;
  status: WordStatus;
  onPick: (status: WordStatus) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`bg-panel border-line rounded-tile border px-6 py-5 ${
        status === 'known' ? 'opacity-[0.62]' : ''
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <span
            className={`font-serif text-[20px] font-extrabold ${
              status === 'learning'
                ? 'bg-yellow-bg border-yellow border-b-[3px] px-1'
                : status === 'known'
                  ? 'text-ink-3'
                  : ''
            }`}
          >
            {word}
          </span>
          {ipa ? (
            <span className="text-ink-3 font-mono text-[12px]">/{ipa}/</span>
          ) : null}
        </div>

        <div className={CONTROL}>
          {LADDER_STATUSES.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onPick(option)}
              aria-pressed={status === option}
              className={`cursor-pointer px-4 py-2.5 text-[12.5px] leading-[normal] font-bold ${
                index > 0 ? 'border-line-ctrl border-l-[1.5px]' : ''
              } ${TONE[option][status === option ? 'on' : 'off']}`}
            >
              {STATUS_LABELS[option]}
              {status === option && option === 'known' ? ' ✓' : null}
            </button>
          ))}
        </div>
      </div>

      {/*
        Порожньо тут означає рівно одне: означення немає. Це рідкість —
        заміряно 98–100% придатних означень на всіх трьох частотних смугах.
        Спінера немає навмисно: пів сотні карток, що блимають, читати
        неможливо.
      */}
      <div className="text-ink-2 mt-2.5 text-[14px] leading-[1.55]">
        {definition ?? <span className="text-ink-3">—</span>}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="text-ink-3 hover:text-ink mt-2 cursor-pointer text-[12.5px] font-bold"
      >
        {open ? 'Згорнути' : 'Стаття, вимова й нотатка'}
      </button>

      {open ? (
        <div className="mt-2.5">
          <WordDetails word={word} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Тон сегмента сходинки. Увімкнений бере колір свого стану — жовтий «вчу» той
 * самий, що й маркер у тексті, зелений «знаю» той самий, що й акцент, — а
 * «не знаю» лишається нейтральним: це не досягнення, а початок.
 */
const TONE: Record<WordStatus, { on: string; off: string }> = {
  unknown: { on: 'bg-track text-ink', off: 'text-ink-2' },
  learning: { on: 'bg-yellow-bg text-yellow-tx', off: 'text-ink-2' },
  known: { on: 'bg-tint text-green-tx', off: 'text-ink-2' },
  hidden: { on: 'bg-track text-ink-3', off: 'text-ink-2' },
};

/**
 * Повна стаття під карткою. Окремий компонент, бо запит на неї робить хук:
 * рівно одна розкрита картка — рівно один хук у дереві.
 *
 * Макет 1i цього розкривача не малює: у ньому картка показує означення й один
 * приклад, і по всьому. Але за розкривачем живе власна нотатка користувача —
 * єдине місце в застосунку, де її пишуть, — тому прибрати його означало б
 * лишити збережені нотатки без жодного входу.
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
          {rest.length > 0 ? (
            <details>
              <summary className="text-acc cursor-pointer text-[12.5px] leading-[normal] font-bold">
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

            Макет обіцяє тут приклад із ВАШОГО тексту — «…attended to her
            cheeks with the powder rag» — The Gift of the Magi. Такого джерела
            немає: застосунок пам'ятає статус слова, але не пам'ятає, де ви
            його зустріли. Тому приклад поки зі статті.
          */}
          {entry.examples.length > 0 ? (
            <>
              <div className={`${PANEL_LABEL} ${rest.length > 0 ? 'mt-3' : ''}`}>Приклади</div>
              <ul className="font-serif text-ink-3 mt-0 mb-0 flex list-none flex-col gap-1 p-0 text-[13.5px] italic">
                {entry.examples.map((example) => (
                  <li key={example}>«{example}»</li>
                ))}
              </ul>
            </>
          ) : null}

          {entry.audioUrl !== null || mp3 !== null ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => void audioRef.current?.play().catch(() => undefined)}
                className="border-line-ctrl text-ink-2 rounded-btn cursor-pointer border-[1.5px] px-3 py-1.5 text-[12.5px] leading-[normal] font-bold"
              >
                🔊 Вимова
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
        className="border-line bg-panel rounded-btn w-full border px-3 py-2 text-[13.5px]"
      />
    </div>
  );
}

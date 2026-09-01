'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useDictionary } from '@/lib/dictionary/client';
import { seededRandom, shuffle } from '@/lib/drills/sentences';

import { DrillSummary } from './DrillSummary';
import { SECONDARY_BTN } from './ui';

/**
 * «Пари слово — значення»: дві колонки, слово ліворуч і значення праворуч,
 * зʼєднати всі. Значення — власна нотатка читача, якщо є (це зазвичай і є
 * переклад), інакше англійське означення зі словника: українських
 * перекладів у словнику немає, і вдавати їх нізвідки.
 */

/** Менше трьох пар — не гра, а дві кнопки. */
export const MIN_PAIRS = 3;

interface Pair {
  word: string;
  meaning: string;
}

/** Годинник поза компонентом: секундомір читає його лише в обробниках подій. */
const now = () => Date.now();

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function PairsDrill({
  words,
  onFinish,
  onRepeat,
  onExit,
}: {
  words: string[];
  onFinish: (firstTry: number, total: number) => void;
  onRepeat: () => void;
  onExit: () => void;
}) {
  const { note } = useAppState();
  const { brief, loading } = useDictionary(words);

  const ready = useMemo(() => words.every((word) => brief.has(word)), [words, brief]);

  /*
    Зерно фіксується на весь сеанс, тому колонки перемішуються один раз:
    кеш словника може оновлюватись і після старту, а порядок від цього
    не мусить стрибати.
  */
  const [seed] = useState(() => Math.random());

  const pairs = useMemo<Pair[] | null>(() => {
    if (!ready) return null;
    const built: Pair[] = [];
    for (const word of words) {
      const meaning = note(word) || brief.get(word)?.definition || null;
      if (meaning) built.push({ word, meaning });
    }
    return built;
  }, [ready, words, brief, note]);

  const columns = useMemo(() => {
    if (!pairs) return { left: [], right: [] };
    return {
      left: shuffle(pairs.map((pair) => pair.word), seededRandom(seed)),
      right: shuffle(pairs.map((pair) => pair.meaning), seededRandom(seed / 2)),
    };
  }, [pairs, seed]);

  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [pickedMeaning, setPickedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [missed, setMissed] = useState<Set<string>>(() => new Set());
  const [wrong, setWrong] = useState<{ word: string; meaning: string } | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedIn, setFinishedIn] = useState<number | null>(null);

  /** Таймер, що знімає червону підсвітку помилки; на демонтажі — гаситься. */
  const flash = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (flash.current) clearTimeout(flash.current);
  }, []);

  const total = pairs?.length ?? 0;
  const done = pairs !== null && total > 0 && matched.size === total;

  /** Обидві половини вибрано — перевіряємо тут же, в обробнику, а не в ефекті. */
  const judge = (word: string, meaning: string) => {
    if (!pairs) return;
    const pair = pairs.find((item) => item.word === word);

    if (pair?.meaning === meaning) {
      const next = new Set(matched);
      next.add(word);
      setMatched(next);
      setPickedWord(null);
      setPickedMeaning(null);
      if (next.size === pairs.length) {
        setFinishedIn(startedAt === null ? 0 : now() - startedAt);
        onFinish(pairs.length - missed.size, pairs.length);
      }
      return;
    }

    setMissed((current) => new Set(current).add(word));
    setWrong({ word, meaning });
    flash.current = setTimeout(() => {
      setWrong(null);
      setPickedWord(null);
      setPickedMeaning(null);
    }, 650);
  };

  const chooseWord = (word: string) => {
    if (startedAt === null) setStartedAt(now());
    setPickedWord(word);
    if (pickedMeaning !== null) judge(word, pickedMeaning);
  };

  const chooseMeaning = (meaning: string) => {
    if (startedAt === null) setStartedAt(now());
    setPickedMeaning(meaning);
    if (pickedWord !== null) judge(pickedWord, meaning);
  };

  if (pairs === null) {
    return (
      <div className="bg-panel border-line rounded-panel text-ink-2 border px-7 py-8 text-center text-[14.5px]">
        {loading ? 'Готуємо пари — питаємо словник…' : 'Готуємо пари…'}
      </div>
    );
  }

  if (total < MIN_PAIRS) {
    return (
      <div className="bg-panel border-line rounded-panel border px-7 py-8 text-center">
        <div className="font-serif text-[20px] font-extrabold">Пар поки замало</div>
        <p className="text-ink-2 mx-auto mt-2 mb-5 max-w-[460px] text-[14.5px] leading-[1.6]">
          Для гри потрібно хоча б {MIN_PAIRS} слова зі значенням — зі статті словника або з вашої
          нотатки. Зі слів у «вчу» таких зараз {total}.
        </p>
        <button type="button" onClick={onExit} className={SECONDARY_BTN}>
          До вправ
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <DrillSummary
        kind="pairs"
        correct={total - missed.size}
        total={total}
        note={finishedIn === null ? undefined : `за ${formatTime(finishedIn)}`}
        onRepeat={onRepeat}
        onExit={onExit}
      />
    );
  }

  const tone = (kind: 'word' | 'meaning', value: string, owner: string) => {
    if (matched.has(owner)) return 'border-ok bg-ok-bg text-green-tx';
    if (wrong && (kind === 'word' ? wrong.word === value : wrong.meaning === value)) {
      return 'border-no bg-no-bg text-no';
    }
    const picked = kind === 'word' ? pickedWord === value : pickedMeaning === value;
    return picked
      ? 'border-acc bg-tint text-green-tx'
      : 'border-line-ctrl bg-panel text-ink hover:border-line-strong';
  };

  const ownerOf = (meaning: string) => pairs.find((pair) => pair.meaning === meaning)?.word ?? '';

  return (
    <div className="bg-panel border-line rounded-panel border px-7 py-6">
      <div className="text-ink-3 flex items-center justify-between text-[12.5px]">
        <span>
          Зʼєднано {matched.size} з {total}
        </span>
        <span>{startedAt === null ? 'Час піде з першого натискання' : `Помилок: ${missed.size}`}</span>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-2">
          {columns.left.map((word) => (
            <button
              key={word}
              type="button"
              disabled={matched.has(word) || wrong !== null}
              aria-pressed={pickedWord === word}
              onClick={() => chooseWord(word)}
              className={`rounded-ctrl font-serif cursor-pointer border-[1.5px] px-3.5 py-2.5 text-left text-[15.5px] leading-[normal] font-bold transition disabled:cursor-default ${tone('word', word, word)}`}
            >
              {word}
              {matched.has(word) ? ' ✓' : ''}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {columns.right.map((meaning) => (
            <button
              key={meaning}
              type="button"
              disabled={matched.has(ownerOf(meaning)) || wrong !== null}
              aria-pressed={pickedMeaning === meaning}
              onClick={() => chooseMeaning(meaning)}
              className={`rounded-ctrl cursor-pointer border-[1.5px] px-3.5 py-2.5 text-left text-[13.5px] leading-[1.45] font-semibold transition disabled:cursor-default ${tone('meaning', meaning, ownerOf(meaning))}`}
            >
              {meaning}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

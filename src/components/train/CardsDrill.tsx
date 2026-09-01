'use client';

import { useMemo, useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useDictionary } from '@/lib/dictionary/client';
import type { ExampleSource } from '@/lib/drills/examples';

import { DrillSummary } from './DrillSummary';
import { PRIMARY_BTN, SECONDARY_BTN } from './ui';
import { useExamples } from './useExamples';

/**
 * «Картки слів»: слово → значення, з прикладом з того тексту, де воно
 * трапилося. Оцінює себе людина: «знаю» переводить слово в «знаю» в
 * словнику, «ще вчу» лишає як є. Ніякого «правильно/неправильно» — картка
 * не знає, що в голові, і не вдає, що знає.
 */

/** Приклад із виділеним словом — читач має побачити його в реченні, а не шукати. */
function Example({ sentence, word }: { sentence: string; word: string }) {
  const parts = sentence.split(new RegExp(`(\\b${word}\\b)`, 'i'));
  return (
    <p className="font-serif text-ink-body m-0 text-[16px] leading-[1.7] italic">
      {parts.map((part, index) =>
        part.toLowerCase() === word ? (
          <b key={index} className="not-italic">
            {part}
          </b>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

export function CardsDrill({
  words,
  sources,
  onFinish,
  onRepeat,
  onExit,
}: {
  words: string[];
  sources: ExampleSource[];
  onFinish: (known: number, total: number) => void;
  onRepeat: () => void;
  onExit: () => void;
}) {
  const { note, setWordStatus } = useAppState();
  const { brief } = useDictionary(words);
  const examples = useExamples(words, sources);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);

  const word = words[index];
  const total = words.length;
  const entry = useMemo(() => (word ? brief.get(word) : undefined), [brief, word]);

  if (!word) return null;

  const advance = (markKnown: boolean) => {
    if (markKnown) setWordStatus(word, 'known');
    const score = known + (markKnown ? 1 : 0);
    setKnown(score);
    if (index + 1 === total) {
      setDone(true);
      onFinish(score, total);
      return;
    }
    setIndex(index + 1);
    setFlipped(false);
  };

  if (done) {
    return (
      <DrillSummary kind="cards" correct={known} total={total} onRepeat={onRepeat} onExit={onExit} />
    );
  }

  const example = examples[word];
  const ownNote = note(word);

  return (
    <div className="bg-panel border-line rounded-panel border px-7 py-6">
      <div className="text-ink-3 flex items-center justify-between text-[12.5px]">
        <span>
          Картка {index + 1} з {total}
        </span>
        <span>{flipped ? 'Оцініть себе чесно' : 'Спробуйте згадати значення'}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(true)}
        disabled={flipped}
        aria-label={flipped ? `Значення слова ${word}` : `Перевернути картку ${word}`}
        className="bg-bg border-line rounded-note mt-4 flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center border px-6 py-7 text-center disabled:cursor-default"
      >
        {flipped ? (
          <div className="flex w-full max-w-[560px] flex-col gap-3">
            <div>
              <span className="font-serif text-[22px] font-extrabold">{word}</span>
              {entry?.ipa ? (
                <span className="text-ink-3 ml-2.5 font-mono text-[13px]">/{entry.ipa}/</span>
              ) : null}
            </div>
            {ownNote ? (
              <div className="bg-yellow-bg text-yellow-tx rounded-ctrl px-3 py-2 text-[14.5px] font-semibold">
                {ownNote}
              </div>
            ) : null}
            <div className="text-ink text-[15.5px] leading-[1.6]">
              {entry?.definition ??
                (entry === null
                  ? 'У словнику статті на це слово немає.'
                  : entry === undefined
                    ? 'Шукаємо значення…'
                    : 'Означення в статті немає.')}
            </div>
            {example ? (
              <div className="border-line border-t pt-3">
                <Example sentence={example.sentence} word={word} />
                <div className="text-ink-3 mt-1 text-[12px]">З тексту: {example.title}</div>
              </div>
            ) : (
              <div className="text-ink-3 text-[12.5px]">
                У ваших текстах цього слова зараз не знайшлося.
              </div>
            )}
          </div>
        ) : (
          <>
            <span className="font-serif text-[32px] font-extrabold">{word}</span>
            {entry?.ipa ? (
              <span className="text-ink-3 mt-1 font-mono text-[13px]">/{entry.ipa}/</span>
            ) : null}
            <span className="text-label mt-2 text-[12.5px]">натисніть, щоб перевернути</span>
          </>
        )}
      </button>

      {flipped ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2.5">
          <button type="button" onClick={() => advance(false)} className={SECONDARY_BTN}>
            Ще вчу
          </button>
          <button type="button" onClick={() => advance(true)} className={PRIMARY_BTN}>
            Знаю ✓
          </button>
        </div>
      ) : null}
    </div>
  );
}

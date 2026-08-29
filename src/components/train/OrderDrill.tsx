'use client';

import { useState } from 'react';

import { type DrillSentence, shuffle } from '@/lib/drills/sentences';

import { DrillSummary } from './DrillSummary';
import { HighlightedSentence, TenseChips } from './Sentence';
import { PRIMARY_BTN, WORD_CHIP } from './ui';

/**
 * «Скласти речення»: слова речення перемішані, читач повертає їх на місце.
 * Перевірка — щойно поставлено останнє слово; після неї речення показується
 * з підсвіткою часу, як у читанні. Слова з пунктуацією при них лишаються як
 * є — крапка в кінці підказує, яке слово останнє, і це чесна підказка з
 * самого тексту.
 */

interface Chip {
  /** Номер слова в реченні — він і є правильним порядком. */
  id: number;
  word: string;
}

/** Перемішує так, щоб порядок точно відрізнявся від правильного. */
function shuffledChips(words: readonly string[]): Chip[] {
  const chips = words.map((word, id) => ({ id, word }));
  if (chips.length < 2) return chips;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const mixed = shuffle(chips);
    if (mixed.some((chip, index) => chip.id !== index)) return mixed;
  }
  return [...chips].reverse();
}

export function OrderDrill({
  sentences,
  onFinish,
  onRepeat,
  onExit,
}: {
  sentences: DrillSentence[];
  onFinish: (correct: number, total: number) => void;
  onRepeat: () => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [bank, setBank] = useState<Chip[]>(() => shuffledChips(sentences[0]?.words ?? []));
  const [answer, setAnswer] = useState<Chip[]>([]);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const sentence = sentences[index];
  if (!sentence) return null;

  const total = sentences.length;
  const complete = answer.length === sentence.words.length;
  const isRight = complete && answer.every((chip, position) => chip.id === position);

  const place = (chip: Chip) => {
    if (complete) return;
    setBank((current) => current.filter((item) => item.id !== chip.id));
    setAnswer((current) => [...current, chip]);
  };

  const takeBack = (chip: Chip) => {
    if (complete) return;
    setAnswer((current) => current.filter((item) => item.id !== chip.id));
    setBank((current) => [...current, chip]);
  };

  const next = () => {
    const score = correct + (isRight ? 1 : 0);
    setCorrect(score);
    if (index + 1 === total) {
      setDone(true);
      onFinish(score, total);
      return;
    }
    const upcoming = sentences[index + 1];
    setIndex(index + 1);
    setBank(shuffledChips(upcoming?.words ?? []));
    setAnswer([]);
  };

  if (done) {
    return (
      <DrillSummary kind="order" correct={correct} total={total} onRepeat={onRepeat} onExit={onExit} />
    );
  }

  return (
    <div className="bg-panel border-line rounded-panel border px-7 py-6">
      <div className="text-ink-3 flex items-center justify-between text-[12.5px]">
        <span>
          Речення {index + 1} з {total}
        </span>
        <span>З тексту: {sentence.source}</span>
      </div>

      {/* Рядок відповіді: пунктирна рамка каже «сюди», доки він порожній */}
      <div
        className={`border-line-ctrl mt-4 flex min-h-[62px] flex-wrap items-center gap-1.5 rounded-note border-[1.5px] border-dashed px-3 py-2.5 ${
          complete ? (isRight ? 'border-ok bg-ok-bg' : 'border-no bg-no-bg') : ''
        }`}
        aria-label="Ваше речення"
      >
        {answer.length === 0 ? (
          <span className="text-label text-[13.5px]">Натискайте слова в тому порядку, як вони стоять у реченні</span>
        ) : (
          answer.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => takeBack(chip)}
              disabled={complete}
              className={`${WORD_CHIP} cursor-pointer disabled:cursor-default`}
              title="Повернути слово"
            >
              {chip.word}
            </button>
          ))
        )}
      </div>

      <div className="mt-3.5 flex min-h-[44px] flex-wrap gap-1.5">
        {bank.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => place(chip)}
            className={`${WORD_CHIP} hover:border-line-strong cursor-pointer`}
          >
            {chip.word}
          </button>
        ))}
      </div>

      {complete ? (
        <div className="border-line mt-5 border-t pt-4">
          <div className={`text-[14px] font-bold ${isRight ? 'text-ok' : 'text-no'}`}>
            {isRight ? 'Правильно ✓' : 'Не зовсім — у тексті так:'}
          </div>
          <HighlightedSentence words={sentence.words} matches={sentence.matches} className="mt-2" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <TenseChips tenses={sentence.matches.map((match) => match.tense)} />
            <button type="button" onClick={next} className={PRIMARY_BTN}>
              {index + 1 === total ? 'Підсумок' : 'Далі →'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

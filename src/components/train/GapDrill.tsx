'use client';

import { useState } from 'react';

import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import { GAP_WHY } from '@/lib/drills/forms';
import type { GapTask } from '@/lib/drills/gap';
import { TENSE_ASPECT, TENSE_HIGHLIGHT, type Aspect } from '@/types/content';

import { DrillSummary } from './DrillSummary';
import { PRIMARY_BTN } from './ui';

/**
 * «Заповнити пропуск»: у реченні з тексту схована конструкція часу, поруч —
 * вона ж і три хибні форми тієї самої дії. Після відповіді — правило, за
 * яким цей час упізнають, і речення з підсвіткою.
 */

const ASPECT_LINE: Record<Aspect, string> = {
  simple: 'border-ps text-ps-tx',
  continuous: 'border-pc text-pc-tx',
  perfect: 'border-pp text-pp-tx',
};

/** Розкладає слово на пунктуацію до, саме слово і пунктуацію після. */
function edgesOf(word: string): { lead: string; trail: string } {
  return {
    lead: word.match(/^["'“‘(]+/)?.[0] ?? '',
    trail: word.match(/[,.;:!?"'”’)]+$/)?.[0] ?? '',
  };
}

/** Одне завдання з уже перемішаними варіантами — щоб порядок не мінявся між рендерами. */
export interface GapRound {
  task: GapTask;
  options: string[];
}

export function GapDrill({
  rounds,
  onFinish,
  onRepeat,
  onExit,
}: {
  rounds: GapRound[];
  onFinish: (correct: number, total: number) => void;
  onRepeat: () => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const round = rounds[index];
  if (!round) return null;

  const { task, options } = round;
  const { words } = task.sentence;
  const total = rounds.length;
  const aspect = TENSE_ASPECT[task.tense];
  const isRight = picked === task.choice.correct;

  const { lead } = edgesOf(words[task.from] ?? '');
  const { trail } = edgesOf(words[task.to] ?? '');
  const before = words.slice(0, task.from).join(' ');
  const after = words.slice(task.to + 1).join(' ');

  const next = () => {
    const score = correct + (isRight ? 1 : 0);
    setCorrect(score);
    if (index + 1 === total) {
      setDone(true);
      onFinish(score, total);
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  if (done) {
    return (
      <DrillSummary kind="gap" correct={correct} total={total} onRepeat={onRepeat} onExit={onExit} />
    );
  }

  return (
    <div className="bg-panel border-line rounded-panel border px-7 py-6">
      <div className="text-ink-3 flex items-center justify-between text-[12.5px]">
        <span>
          Речення {index + 1} з {total}
        </span>
        <span>З тексту: {task.sentence.source}</span>
      </div>

      <p className="font-serif m-0 mt-4 text-[19px] leading-[1.85]">
        {before ? `${before} ` : ''}
        {lead}
        {picked === null ? (
          <span className={`border-b-2 px-5 font-bold ${ASPECT_LINE[aspect]}`}>___</span>
        ) : (
          <span className={`${TENSE_HIGHLIGHT[task.tense]} rounded-mark px-1 py-0.5`}>
            {task.choice.correct}
          </span>
        )}
        {trail}
        {after ? ` ${after}` : ''}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => {
          const right = option === task.choice.correct;
          const chosen = option === picked;
          let tone = 'border-line-ctrl bg-panel text-ink hover:border-line-strong';
          if (picked !== null && right) tone = 'border-ok bg-ok-bg text-ok';
          else if (picked !== null && chosen) tone = 'border-no bg-no-bg text-no';
          else if (picked !== null) tone = 'border-line bg-panel text-ink-3';

          return (
            <button
              key={option}
              type="button"
              disabled={picked !== null}
              onClick={() => setPicked(option)}
              className={`rounded-ctrl font-serif cursor-pointer border-[1.5px] px-3.5 py-2 text-[15.5px] leading-[normal] font-semibold transition disabled:cursor-default ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked !== null ? (
        <div className="mt-5">
          <div className={`text-[14px] font-bold ${isRight ? 'text-ok' : 'text-no'}`}>
            {isRight ? 'Правильно ✓' : `Не зовсім — тут ${TENSE_LABELS[task.tense]}.`}
          </div>
          <div className={`bg-bg text-ink-2 mt-2.5 rounded-[9px] border-l-[3px] px-3.5 py-[11px] text-[14px] leading-[1.6] ${ASPECT_LINE[aspect]}`}>
            <b className="text-ink">Чому.</b> {GAP_WHY[task.tense]}
          </div>
          <div className="mt-3.5 flex justify-end">
            <button type="button" onClick={next} className={PRIMARY_BTN}>
              {index + 1 === total ? 'Підсумок' : 'Далі →'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

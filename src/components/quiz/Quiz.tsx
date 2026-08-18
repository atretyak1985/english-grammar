'use client';

import { useState } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { QuizQuestion } from '@/types/content';

/**
 * Тест. Варіант вибирається один раз: правильний підсвічується зеленим,
 * помилковий — червоним, під питанням розкривається пояснення «чому».
 * Логіка перенесена з рушія на main.js без змін, плюс запис спроби в стан.
 */
export function Quiz({
  questions,
  topicSlug,
}: {
  questions: readonly QuizQuestion[];
  topicSlug: string;
}) {
  const { addAttempt } = useAppState();
  const [picked, setPicked] = useState<Record<number, number>>({});

  const answered = Object.keys(picked).length;
  const correct = Object.entries(picked).filter(
    ([index, option]) => questions[Number(index)]?.answer === option,
  ).length;
  const total = questions.length;
  const done = answered === total;

  const pick = (questionIndex: number, option: number) => {
    if (picked[questionIndex] !== undefined) return;

    const next = { ...picked, [questionIndex]: option };
    setPicked(next);

    if (Object.keys(next).length === total) {
      const finalCorrect = Object.entries(next).filter(
        ([index, chosen]) => questions[Number(index)]?.answer === chosen,
      ).length;
      addAttempt({
        topicSlug,
        correct: finalCorrect,
        total,
        finishedAt: new Date().toISOString(),
      });
    }
  };

  const tail = () => {
    if (!done) return '';
    const share = correct / total;
    if (share >= 0.85) return ' — чудовий результат.';
    if (share >= 0.65) return ' — непогано, перечитайте розділи з помилками.';
    return ' — поверніться до теорії і зробіть вправи ще раз.';
  };

  return (
    <div>
      <p className="text-ink-2 mt-0 mb-6 max-w-[800px] text-[17px]">
        Натисніть варіант — побачите, чи правильно, і головне <b>чому</b>.{' '}
        <span className="text-ink-2 font-extrabold">
          {correct} / {total}
          {tail()}
        </span>
      </p>

      {questions.map((question, questionIndex) => {
        const chosen = picked[questionIndex];
        const isDone = chosen !== undefined;

        return (
          <div
            key={questionIndex}
            className="bg-surface border-line shadow-card my-3 rounded-xl border px-5 py-[18px]"
          >
            <p className="mt-0 mb-1 font-semibold">
              {questionIndex + 1}. {question.q}
            </p>
            {question.hint ? (
              <p className="text-ink-3 mt-0 mb-3 text-[14px]">{question.hint}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {question.options.map((option, optionIndex) => {
                const isRight = optionIndex === question.answer;
                const isChosen = optionIndex === chosen;

                let tone =
                  'border-line bg-surface text-ink-2 hover:border-line-strong hover:-translate-y-px';
                if (isDone && isRight) tone = 'border-ok bg-ok-bg text-ok';
                else if (isDone && isChosen) tone = 'border-no bg-no-bg text-no';
                else if (isDone) tone = 'border-line bg-surface text-ink-3';

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={isDone}
                    onClick={() => pick(questionIndex, optionIndex)}
                    className={`cursor-pointer rounded-[9px] border-[1.5px] px-3.5 py-2 text-[15px] font-semibold transition disabled:cursor-default ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {isDone ? (
              <div className="bg-surface-3 border-ink-3 text-ink-2 mt-3 rounded-[9px] border-l-[3px] px-3.5 py-[11px] text-[14.5px]">
                {question.why}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

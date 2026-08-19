'use client';

import { useState } from 'react';

import { checkTranslation, type CheckResult } from '@/lib/drills/check';

/**
 * Власний переклад із порівнянням. Саме продукування речення дає автоматизм,
 * якого не дає читання (CONCEPT «Як користуватись», пункт 3).
 *
 * Присудок обережний навмисно: правильних перекладів більше, ніж один, тому
 * збіг ми стверджуємо, а розбіжність лише показуємо послівно.
 */
const VERDICT: Record<CheckResult['verdict'], { text: string; tone: string }> = {
  match: { text: '✓ Збігається з еталоном', tone: 'text-ok' },
  close: { text: '≈ Майже те саме — гляньте, що різниться', tone: 'text-pc-dk' },
  different: {
    text: 'Інакше, ніж еталон. Це не завжди помилка — порівняйте самі',
    tone: 'text-ink-2',
  },
};

export function TranslationCheck({
  expected,
  accepted,
}: {
  expected: string;
  accepted?: string[];
}) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);

  const submit = () => {
    if (!value.trim()) return;
    setResult(checkTranslation(expected, value, accepted));
  };

  return (
    <div className="mt-[9px]">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setResult(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
          placeholder="Ваш переклад англійською…"
          aria-label="Ваш переклад англійською"
          className="border-line bg-surface text-ink rounded-input focus:border-ps min-w-0 flex-1 border px-3 py-2 text-[14.5px] leading-[normal] outline-none"
        />
        <button
          type="button"
          onClick={submit}
          className="border-ps bg-ps-bg text-ps-dk rounded-btn cursor-pointer border px-[13px] py-2 text-[13px] leading-[normal] font-bold"
        >
          Перевірити
        </button>
      </div>

      {result ? (
        <div className="bg-surface-2 mt-2 rounded-[9px] px-3.5 py-[11px]">
          <div className={`text-[13px] font-bold ${VERDICT[result.verdict].tone}`}>
            {VERDICT[result.verdict].text}
          </div>

          {result.verdict === 'match' ? null : (
            <div className="mt-2 text-[14.5px] leading-[1.9]">
              {result.parts.map((part, index) => (
                <span
                  key={index}
                  className={
                    part.kind === 'missing'
                      ? 'bg-ok-bg text-ok rounded px-1 font-semibold'
                      : part.kind === 'extra'
                        ? 'bg-no-bg text-no rounded px-1 line-through'
                        : ''
                  }
                  title={
                    part.kind === 'missing'
                      ? 'є в еталоні, немає у вас'
                      : part.kind === 'extra'
                        ? 'є у вас, немає в еталоні'
                        : undefined
                  }
                >
                  {part.word}{' '}
                </span>
              ))}
            </div>
          )}

          {result.verdict === 'different' ? (
            <div className="text-ink-3 mt-2 text-[12.5px]">
              Зелене — слова еталона, яких у вас немає; перекреслене — ваші, яких немає в еталоні.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

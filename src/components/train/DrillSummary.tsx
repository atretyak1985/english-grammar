import type { DrillKind } from '@/lib/drills/streak';

import { PRIMARY_BTN, SECONDARY_BTN } from './ui';

/**
 * Підсумок вправи. Один на всі чотири, бо різняться вони лише тим, що
 * саме рахувалося: у граматичних — правильні відповіді, у картках — скільки
 * слів людина назвала «знаю», у парах — помилки й час.
 */
export function DrillSummary({
  kind,
  correct,
  total,
  note,
  onRepeat,
  onExit,
}: {
  kind: DrillKind;
  correct: number;
  total: number;
  note?: string;
  onRepeat: () => void;
  onExit: () => void;
}) {
  const share = total === 0 ? 0 : correct / total;

  let headline: string;
  let tail: string;
  switch (kind) {
    case 'cards':
      headline = `«Знаю» — ${correct} з ${total}`;
      tail =
        correct === total
          ? 'Усі картки пішли в «знаю». Наступні візьмуться з решти словника.'
          : 'Решта лишилась у «вчу» — вони повернуться в наступних картках.';
      break;
    case 'pairs':
      headline = `${total} пар зʼєднано`;
      tail =
        correct === total
          ? 'Без жодної помилки.'
          : `З першої спроби — ${correct} з ${total}. Слова, що плуталися, варто перегорнути в картках.`;
      break;
    default:
      headline = `${correct} з ${total} правильно`;
      if (share >= 0.85) tail = 'Чудово — час у цих реченнях ви бачите.';
      else if (share >= 0.6) tail = 'Непогано. Зверніть увагу на пояснення там, де помилилися.';
      else tail = 'Варто повернутися до теорії — і спробувати ще раз.';
  }

  return (
    <div className="bg-panel border-line rounded-panel border px-8 py-8 text-center">
      <div className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        Вправу зараховано
      </div>
      <div className="font-serif mt-2 text-[28px] font-extrabold">{headline}</div>
      {note ? <div className="text-ink-2 mt-1 text-[14px]">{note}</div> : null}
      <p className="text-ink-2 mx-auto mt-2 mb-6 max-w-[440px] text-[14.5px] leading-[1.6]">
        {tail} Вправа зарахована в сьогоднішню норму.
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={onRepeat} className={SECONDARY_BTN}>
          Ще раз
        </button>
        <button type="button" onClick={onExit} className={PRIMARY_BTN}>
          До вправ
        </button>
      </div>
    </div>
  );
}

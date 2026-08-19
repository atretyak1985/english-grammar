'use client';

import { useEffect, useState, type RefObject } from 'react';

/** Заповнення, з якого сторінку вважаємо достатньо повною. */
const GOOD_FILL = 0.92;
/** Бісекція сходиться швидко; межа — щоб не крутитися на патологічному тексті. */
const MAX_STEPS = 14;

interface Search {
  key: string;
  /** Поточна спроба — де закінчити сторінку */
  end: number;
  /** Найбільший відомий кінець, за якого текст вміщався */
  fits: number;
  /** Найменший відомий кінець, за якого текст переливався */
  overflows: number;
  steps: number;
}

/**
 * Де насправді закінчується сторінка. Підрахунок за символами дає лише
 * припущення: висота залежить від переносів, підсвічених конструкцій і довжини
 * останнього слова. Тому межу знаходить замір — бісекцією між «вміщається» і
 * «переливається», і зупиняється завжди на тому, що вміщається.
 *
 * Це і є вимога «без скролу»: сторінка показує рівно те, що видно, і нічого не
 * обрізає непомітно.
 */
export function useFittedPage({
  readerRef,
  proseRef,
  start,
  guess,
  total,
  resetKey,
}: {
  readerRef: RefObject<HTMLElement | null>;
  proseRef: RefObject<HTMLElement | null>;
  /** Індекс першого токена сторінки */
  start: number;
  /** Припущення про кінець — з підрахунку за символами */
  guess: number;
  /** Скільки всього токенів */
  total: number;
  /** Змінюється, коли міняється текст, режим або розмір області */
  resetKey: string;
}): number {
  const key = `${resetKey}:${start}`;
  const fresh = (): Search => ({ key, end: guess, fits: start + 1, overflows: 0, steps: 0 });
  const [search, setSearch] = useState<Search>(fresh);
  const end = search.key === key ? search.end : guess;

  useEffect(() => {
    const reader = readerRef.current;
    const prose = proseRef.current;
    if (!reader || !prose) return;

    const measure = () => {
      // Висота тексту плюс власні відступи області. Через scrollHeight самої
      // області це не порахувати: він ніколи не буває меншим за clientHeight,
      // тому недобір був би невидимий і пошук зупинявся б на першій же
      // сторінці, що вмістилась, хай і напівпорожній.
      const style = getComputedStyle(reader);
      const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      const available = reader.clientHeight;
      const filled = prose.scrollHeight + padding;
      if (available < 80 || prose.scrollHeight < 20) return;

      setSearch((current) => {
        const state = current.key === key ? current : fresh();
        if (state.steps >= MAX_STEPS) return state;

        const fill = filled / available;
        const overflowing = fill > 1;

        const fits = overflowing ? state.fits : Math.max(state.fits, state.end);
        const overflows = overflowing
          ? state.overflows === 0
            ? state.end
            : Math.min(state.overflows, state.end)
          : state.overflows;

        // Готово: або сторінка достатньо повна, або межа знайдена з точністю
        // до одного токена — тоді лишаємо найбільший варіант, що вміщався.
        if (!overflowing && fill >= GOOD_FILL) return { ...state, fits, overflows };
        if (overflows > 0 && overflows - fits <= 1) {
          return state.end === fits ? { ...state, fits, overflows } : { ...state, end: fits, fits, overflows, steps: state.steps + 1 };
        }

        const next = overflowing
          ? Math.max(start + 1, Math.floor((fits + state.end) / 2))
          : overflows > 0
            ? Math.min(total, Math.floor((state.end + overflows) / 2))
            : Math.min(total, state.end * 2);

        if (next === state.end) return { ...state, fits, overflows };
        return { key, end: next, fits, overflows, steps: state.steps + 1 };
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(prose);
    observer.observe(reader);
    measure();

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guess, key, proseRef, readerRef, start, total, search.end, search.steps]);

  return Math.min(Math.max(end, start + 1), total);
}

'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface BoxSize {
  width: number;
  height: number;
}

/** Цільове заповнення області читання: трохи менше за край, щоб не крутити сторінку. */
const TARGET_FILL = 0.95;
const TOLERANCE = 0.06;
/** Скільки підгонок дозволяємо на один розмір області — захист від коливань. */
const MAX_STEPS = 6;

/**
 * Множник розміру сторінки, підігнаний за фактом. Оцінка «скільки символів
 * влазить» неминуче груба: ширина літер залежить від шрифту, кегля й самого
 * тексту. Тому читалка міряє, наскільки заповнилась область, і підправляє
 * розмір — замість магічної константи, підібраної на одному тексті.
 */
export function useFillScale(
  readerRef: RefObject<HTMLElement | null>,
  proseRef: RefObject<HTMLElement | null>,
  /** Скидає підгонку: змінився режим, розмір області або сам текст */
  resetKey: string,
): number {
  const [state, setState] = useState({ key: resetKey, scale: 1, steps: 0 });

  useEffect(() => {
    const reader = readerRef.current;
    const prose = proseRef.current;
    if (!reader || !prose) return;

    const measure = () => {
      const available = reader.clientHeight;
      const filled = prose.scrollHeight;
      if (available < 80 || filled < 20) return;

      const ratio = filled / available;
      setState((current) => {
        const fresh = current.key === resetKey ? current : { key: resetKey, scale: 1, steps: 0 };
        if (fresh.steps >= MAX_STEPS) return fresh;
        if (Math.abs(ratio - TARGET_FILL) <= TOLERANCE) return fresh;

        // Крок обмежений, щоб підгонка сходилася, а не стрибала.
        const factor = Math.max(0.6, Math.min(1.4, TARGET_FILL / ratio));
        const scale = Math.max(0.3, Math.min(3, fresh.scale * factor));
        return { key: resetKey, scale, steps: fresh.steps + 1 };
      });
    };

    // ResizeObserver спрацьовує після компонування, тому бачить уже нову
    // висоту тексту — на відміну від requestAnimationFrame.
    const observer = new ResizeObserver(measure);
    observer.observe(prose);
    observer.observe(reader);
    measure();

    return () => observer.disconnect();
  }, [proseRef, readerRef, resetKey, state.scale, state.steps]);

  return state.key === resetKey ? state.scale : 1;
}

/**
 * Справжній розмір елемента. Міряємо саму область, а не вікно: у картці й на
 * весь екран доступне місце різне, а формула розміру сторінки має бути одна.
 *
 * До першого вимірювання — нулі; читалка в такому разі бере константу.
 */
export function useBoxSize(ref: RefObject<HTMLElement | null>): BoxSize {
  const [size, setSize] = useState<BoxSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      // Округлення до 8px гасить дрібне тремтіння: інакше кожен піксель
      // прокрутки перераховував би сторінки.
      const width = Math.round(box.width / 8) * 8;
      const height = Math.round(box.height / 8) * 8;
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface BoxSize {
  width: number;
  height: number;
}

/**
 * Висота картки з підсвіткою: усе вільне місце до низу вікна. Рахуємо два
 * доданки — що вище картки і що нижче всього рядка (підвал і відступ сторінки).
 * Сусідню колонку статистики не враховуємо: вона стоїть поруч, а не над і не
 * під, і картка не має платити за її висоту.
 */
export function useFitHeight(ref: RefObject<HTMLElement | null>, fallback = 520): number {
  const [height, setHeight] = useState(fallback);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;

    const measure = () => {
      const row = card.closest<HTMLElement>('[data-reader-row]');
      if (!row) return;

      const above = card.getBoundingClientRect().top + window.scrollY;

      // Нижче рядка міряємо самі елементи — підвал і нижній відступ сторінки.
      // Через «висота документа мінус низ рядка» в розрахунок потрапляла б
      // порожнеча під короткою сторінкою, і картка не могла б вирости.
      const container = row.parentElement;
      const padding = container ? parseFloat(getComputedStyle(container).paddingBottom) || 0 : 0;
      const footer = document.querySelector('footer');
      const belowRow = padding + (footer?.getBoundingClientRect().height ?? 0);

      const available = window.innerHeight - above - belowRow - 8;
      const next = Math.max(320, Math.min(1400, Math.round(available / 8) * 8));
      setHeight((current) => (Math.abs(current - next) > 8 ? next : current));
    };

    // Спостерігаємо за самим рядком і карткою: коли сторінка вміщається у
    // вікно, висота body не змінюється, і зсув розкладки лишився б непоміченим.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const row = card.closest<HTMLElement>('[data-reader-row]');
    if (row) observer.observe(row);
    observer.observe(card);
    window.addEventListener('resize', measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return height;
}

/**
 * Смуга приймання заповнення. Не одне число, бо сторінка ріжеться по межах
 * абзаців: розміри квантовані, і сусідні варіанти можуть давати 50% і 105%.
 * Тому дозволяємо дві-три зайві рядки (до 1.08) — це краще, ніж лишити пів
 * екрана порожнім, аби тільки не було внутрішнього скролу.
 */
const FILL_MIN = 0.9;
const FILL_MAX = 1.08;
/** Кроки дрібні, щоб не перескочити цілий абзац. */
const STEP_DOWN = 0.94;
const STEP_UP = 1.07;
/** Скільки підгонок дозволяємо на один розмір області — захист від коливань. */
const MAX_STEPS = 12;

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
        if (ratio >= FILL_MIN && ratio <= FILL_MAX) return fresh;

        const scale = Math.max(
          0.3,
          Math.min(3, fresh.scale * (ratio > FILL_MAX ? STEP_DOWN : STEP_UP)),
        );
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

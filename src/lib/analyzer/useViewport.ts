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

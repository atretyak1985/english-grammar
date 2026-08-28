import { describe, expect, it } from 'vitest';

import { estimatePageCount } from './pages';

/**
 * Оцінка кількості сторінок раніше виводилася з розміру поточної сторінки, і
 * читач бачив, як загальна кількість стрибає під ним: на трьох сусідніх
 * сторінках однієї книжки — «з ~50», «з ~123», «з ~58». Тести нижче фіксують
 * саме стабільність: одна нетипова сторінка не має помітно рухати підсумок.
 */

/** Сторінка N при середньому розмірі `size` токенів. */
function atPage(pageNumber: number, size: number, totalTokens: number, currentSize = size) {
  const anchor = (pageNumber - 1) * size;
  return estimatePageCount({
    totalTokens,
    pageNumber,
    anchor,
    pageEnd: anchor + currentSize,
  });
}

describe('estimatePageCount', () => {
  it('на рівних сторінках дає точну кількість', () => {
    // 2000 токенів по 100 на сторінку — двадцять сторінок, з якої не дивись
    expect(atPage(1, 100, 2000)).toBe(20);
    expect(atPage(10, 100, 2000)).toBe(20);
    expect(atPage(19, 100, 2000)).toBe(20);
  });

  it('не рухається від нетипової поточної сторінки', () => {
    // Та сама книжка, але на сімнадцятій сторінці суцільний діалог: вона
    // тримає вчетверо менше токенів. Оцінка мусить лишитися тією ж, бо
    // дільник береться з уже прочитаного, а не з того, що зараз на екрані.
    const normal = atPage(17, 100, 2000);
    const sparse = atPage(17, 100, 2000, 25);
    const dense = atPage(17, 100, 2000, 400);

    expect(sparse).toBe(normal);
    expect(dense).toBe(normal);
  });

  it('на першій сторінці спирається на розрахункову пагінацію, а не на неї саму', () => {
    // Титульний аркуш тримає 12 токенів, увесь текст — 900 при розрахункових
    // 100 на сторінку. Без запасного дільника вийшло б «1 з ~75».
    expect(
      estimatePageCount({
        totalTokens: 900,
        pageNumber: 1,
        anchor: 0,
        pageEnd: 12,
        fallbackAverage: 100,
      }),
    ).toBe(9);
  });

  it('без запасного дільника перша сторінка лишається єдиним джерелом', () => {
    expect(estimatePageCount({ totalTokens: 900, pageNumber: 1, anchor: 0, pageEnd: 100 })).toBe(9);
  });

  it('коротка перша сторінка не роздуває оцінку на другій', () => {
    // Титул тримає 12 токенів замість сотні. Саме на цьому оцінка стрибала
    // до «2 з ~699»: на другій сторінці титул один становив усе середнє.
    const second = estimatePageCount({
      totalTokens: 9000,
      pageNumber: 2,
      anchor: 12,
      pageEnd: 112,
      fallbackAverage: 100,
    });

    expect(second).toBeGreaterThan(80);
    expect(second).toBeLessThan(140);
  });

  it('прочитане поступово перебиває розрахунок', () => {
    // Заміряні сторінки вдвічі менші за розрахункові: оцінка мусить повзти
    // до 180, а не стрибнути туди з першого ж кроку.
    const early = estimatePageCount({
      totalTokens: 9000,
      pageNumber: 3,
      anchor: 100,
      pageEnd: 150,
      fallbackAverage: 100,
    });
    const later = estimatePageCount({
      totalTokens: 9000,
      pageNumber: 30,
      anchor: 1450,
      pageEnd: 1500,
      fallbackAverage: 100,
    });

    expect(early).toBeLessThan(later);
    expect(later).toBeGreaterThan(150);
  });

  it('ніколи не обіцяє менше сторінок, ніж уже перегорнуто', () => {
    // Сторінки виявились більшими за середнє з початку книжки: формальна
    // оцінка дала б менше за поточний номер, а такий підпис («12 з ~8»)
    // читається як помилка, а не як уточнення.
    expect(
      estimatePageCount({ totalTokens: 1000, pageNumber: 12, anchor: 990, pageEnd: 1000 }),
    ).toBe(12);
  });

  it('короткий текст лишається однією сторінкою', () => {
    expect(estimatePageCount({ totalTokens: 40, pageNumber: 1, anchor: 0, pageEnd: 40 })).toBe(1);
  });

  it('не ділить на нуль на порожньому тексті', () => {
    expect(estimatePageCount({ totalTokens: 0, pageNumber: 1, anchor: 0, pageEnd: 0 })).toBe(1);
  });
});

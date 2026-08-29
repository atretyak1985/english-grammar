import { describe, expect, it } from 'vitest';

import { PAGE_CHARS, estimatePageCount, paginate } from './pages';
import { tokenize } from './tenses';

/**
 * Оцінка кількості сторінок двічі підводила читача, і обидва рази помітно.
 *
 * Спершу вона виводилася з розміру поточної сторінки, і підсумок стрибав під
 * час гортання: «з ~50», «з ~123», «з ~58» на трьох сусідніх сторінках однієї
 * книжки. Потім — із середнього по прочитаному, і почав повзти вгору на
 * кожному кроці: 84, 119, 140, 151, 159, 164, 173.
 *
 * Тести нижче фіксують те, чого читач від підпису чекає: він не смикається
 * від однієї нетипової сторінки і не росте з кожним гортанням.
 */

/** Текст із рівних абзаців — на ньому сторінки виходять однакові. */
function book(paragraphs: number, wordsEach = 60): string {
  const paragraph = Array.from({ length: wordsEach }, (_, i) => `word${i % 10}`).join(' ');
  return Array.from({ length: paragraphs }, () => paragraph).join('\n\n');
}

/**
 * Читання книжки: віддає підпис «з ~N» на кожній сторінці, гортаючи рівно так,
 * як це робить полотно — від межі до межі, знятої з розбиття.
 */
function readThrough(text: string, target: number, pages = 8): number[] {
  const tokens = tokenize(text);
  const real = paginate(tokens, target);
  const starts: number[] = [];
  const seen: number[] = [];

  for (let i = 0; i < Math.min(pages, real.length); i += 1) {
    starts.push(real[i]?.start ?? 0);
    seen.push(estimatePageCount({ tokens, pageStarts: [...starts] }));
  }
  return seen;
}

describe('estimatePageCount', () => {
  it('на рівних сторінках стоїть на місці від початку до кінця', () => {
    const text = book(40);
    const tokens = tokenize(text);
    const truth = paginate(tokens, PAGE_CHARS).length;

    const seen = readThrough(text, PAGE_CHARS);
    expect(new Set(seen).size).toBe(1);
    expect(seen[0]).toBe(truth);
  });

  it('не повзе вгору, коли справжня сторінка вдвічі менша за закладену', () => {
    // Саме цей випадок і був у книжці: розрахунок обіцяв 84 сторінки, а
    // заміряна сторінка тримала вдвічі менше — і підпис ріс на кожному кроці.
    const text = book(60);
    const seen = readThrough(text, Math.round(PAGE_CHARS / 2));

    // Після другої сторінки міру вже знято — далі підсумок не рухається.
    const settled = seen.slice(2);
    expect(new Set(settled).size).toBe(1);
    // І він більший за початковий: сторінки дрібніші, ніж закладено.
    expect(settled[0]).toBeGreaterThan(seen[0] ?? 0);
  });

  it('коротка перша сторінка не роздуває підсумок', () => {
    const text = book(40);
    const tokens = tokenize(text);
    const truth = paginate(tokens, PAGE_CHARS).length;
    const real = paginate(tokens, PAGE_CHARS);

    // Титул: перша сторінка обірвана на десятому токені
    const starts = [0, 10, real[1]?.start ?? 0, real[2]?.start ?? 0, real[3]?.start ?? 0];
    const estimate = estimatePageCount({ tokens, pageStarts: starts });

    expect(estimate).toBeGreaterThan(truth - 3);
    expect(estimate).toBeLessThan(truth + 3);
  });

  it('одна прочитана сторінка не править за міру, якщо вона коротка', () => {
    const tokens = tokenize(book(40));
    const truth = paginate(tokens, PAGE_CHARS).length;

    // Прочитано лише титул на 10 токенів — міру з нього не беремо
    expect(estimatePageCount({ tokens, pageStarts: [0, 10] })).toBe(truth);
  });

  it('ніколи не обіцяє менше сторінок, ніж уже перегорнуто', () => {
    const tokens = tokenize(book(3));
    const starts = Array.from({ length: 12 }, (_, i) => i * 4);
    expect(estimatePageCount({ tokens, pageStarts: starts })).toBeGreaterThanOrEqual(12);
  });

  it('короткий текст лишається однією сторінкою', () => {
    expect(estimatePageCount({ tokens: tokenize('Two words.'), pageStarts: [0] })).toBe(1);
  });

  it('не ділить на нуль на порожньому тексті', () => {
    expect(estimatePageCount({ tokens: [], pageStarts: [0] })).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';

import { CHUNK_MAX_WORDS, CHUNK_WORDS, chunkText, chunksForRange, chunksOf } from './chunks';
import { tokenize } from './tenses';

/**
 * Найважливіше тут — не розмір шматків, а те, що текст шматка збирається
 * побайтово і токенізується так само, як усередині документа. Зсув нумерації
 * хоч на одиницю пересуває ВСЮ підсвітку цього шматка на сусідні слова, і
 * помітити це на око майже неможливо.
 */

/** Речення з `words` слів, яке закінчується крапкою. */
function sentence(words: number, word = 'went'): string {
  return `${Array.from({ length: words }, () => word).join(' ')}.`;
}

describe('chunksOf', () => {
  it('короткий текст — один шматок від першого слова до останнього', () => {
    const tokens = tokenize('She had finished it.');
    const chunks = chunksOf(tokens);

    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.words).toBe(4);
    // Межі стоять на СЛОВАХ: 'She' і 'it.', а не на пробілах довкола них.
    expect(tokens[chunks[0]!.start]?.word).toBe('she');
    expect(tokens[chunks[0]!.end]?.word).toBe('it');
  });

  it('ріже по кінцю речення, а не рівно на межі норми', () => {
    // Речення по 100 слів: межа норми припадає всередину речення, і розріз має
    // зачекати до найближчої крапки.
    const text = Array.from({ length: 40 }, () => sentence(100)).join(' ');
    const chunks = chunksOf(tokenize(text));

    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks.slice(0, -1)) {
      expect(chunk.words).toBeGreaterThanOrEqual(CHUNK_WORDS);
      expect(chunk.words % 100).toBe(0);
    }
  });

  it('текст без жодної крапки ріжеться по жорсткій межі, а не росте безкінечно', () => {
    const chunks = chunksOf(tokenize('went '.repeat(5000).trim()));

    expect(chunks[0]?.words).toBe(CHUNK_MAX_WORDS);
    expect(chunks.every((chunk) => chunk.words <= CHUNK_MAX_WORDS)).toBe(true);
  });

  it('лапки після крапки не заважають побачити кінець речення', () => {
    const text = `${'went '.repeat(CHUNK_WORDS - 1)}left."  ${sentence(50)}`;
    const chunks = chunksOf(tokenize(text));

    expect(chunks[0]?.words).toBe(CHUNK_WORDS);
  });

  it('покриває всі слова документа рівно один раз', () => {
    const text = Array.from({ length: 12 }, (_, index) => sentence(300, `w${index}`)).join(' ');
    const tokens = tokenize(text);
    const total = tokens.filter((token) => token.word !== null).length;

    const chunks = chunksOf(tokens);

    expect(chunks.reduce((sum, chunk) => sum + chunk.words, 0)).toBe(total);
    for (let i = 1; i < chunks.length; i += 1) {
      expect(chunks[i]!.start).toBeGreaterThan(chunks[i - 1]!.end);
    }
  });
});

describe('chunkText', () => {
  it('склеєний шматок токенізується так само, як його частина документа', () => {
    const text = Array.from({ length: 6 }, (_, index) => sentence(400, `w${index}`)).join(' ');
    const tokens = tokenize(text);

    for (const chunk of chunksOf(tokens)) {
      const own = tokenize(chunkText(tokens, chunk));
      const slice = tokens.slice(chunk.start, chunk.end + 1);

      // Та сама довжина і ті самі слова — тобто локальний номер `i` в шматку
      // означає документний `chunk.start + i`, і зсув збігів коректний.
      expect(own.map((token) => token.raw)).toEqual(slice.map((token) => token.raw));
    }
  });

  it('шматок не починається і не закінчується пробілом', () => {
    const text = `  ${sentence(2000)}   ${sentence(2000)}  `;
    const tokens = tokenize(text);

    for (const chunk of chunksOf(tokens)) {
      const own = chunkText(tokens, chunk);
      expect(own).toBe(own.trim());
    }
  });
});

describe('chunksForRange', () => {
  const chunks = [
    { start: 0, end: 10, words: 6 },
    { start: 12, end: 20, words: 5 },
    { start: 22, end: 30, words: 5 },
  ];

  it('бере всі шматки, яких торкається сторінка, а не лише перший', () => {
    expect(chunksForRange(chunks, 8, 15)).toHaveLength(2);
  });

  it('сторінка всередині одного шматка дає один шматок', () => {
    expect(chunksForRange(chunks, 13, 18)).toEqual([chunks[1]]);
  });

  it('порожній проміжок нічого не просить', () => {
    expect(chunksForRange(chunks, 5, 5)).toEqual([]);
  });
});

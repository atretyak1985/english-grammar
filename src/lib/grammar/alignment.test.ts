import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { tokenize } from '@/lib/analyzer/tenses';

import { analyzeGrammar } from './index';
import { tag } from './tagger';
import { collectGroups } from './verb-groups';

/**
 * SC-7: вирівнювання wink-слів із токенами `tokenize` на обох книжках. Це
 * фундамент усього модуля: збіг адресує номери токенів, і зсув на один токен
 * посередині книжки підсвітив би не ті слова до кінця тексту.
 */
const LIBRARY = path.join(__dirname, '..', '..', 'content', 'library');
const BOOKS = ['alice-in-wonderland', 'gift-of-the-magi'].map((slug) => ({
  slug,
  text: fs.readFileSync(path.join(LIBRARY, slug, 'story.txt'), 'utf8'),
}));

describe.each(BOOKS)('вирівнювання — $slug', ({ text }) => {
  const tokens = tokenize(text);
  const words = tag(text);

  it('кожне wink-слово лежить у своєму токені', () => {
    for (const word of words) {
      const token = tokens[word.token];
      expect(token, `${word.text} → #${word.token}`).toBeDefined();
      expect(token?.raw.includes(word.text), `${word.text} ∉ ${token?.raw}`).toBe(true);
    }
  });

  it('дієслова завжди в токенах-словах, а не в пробілах чи голій пунктуації', () => {
    for (const word of words) {
      if (word.pos !== 'VERB' && word.pos !== 'AUX') continue;
      expect(tokens[word.token]?.word, word.text).not.toBeNull();
    }
  });

  it('номери токенів не спадають', () => {
    for (let i = 1; i < words.length; i += 1) {
      expect((words[i]?.token ?? 0) >= (words[i - 1]?.token ?? 0)).toBe(true);
    }
  });

  it('слова ланцюжка кожної групи лежать усередині її проміжку', () => {
    for (const group of collectGroups(words)) {
      const from = group.tokens[0] ?? 0;
      const to = group.tokens[group.tokens.length - 1] ?? 0;
      for (const word of group.chain) {
        expect(word.token >= from && word.token <= to).toBe(true);
        expect(tokens[word.token]?.word).not.toBeNull();
      }
    }
  });

  it('збіги двигуна покривають лише токени-слова по краях', () => {
    for (const match of analyzeGrammar(text).matches) {
      expect(tokens[match.from]?.word).not.toBeNull();
      expect(tokens[match.to]?.word).not.toBeNull();
    }
  });
});

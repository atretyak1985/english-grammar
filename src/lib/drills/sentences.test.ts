import { describe, expect, it } from 'vitest';

import { findMatches, tokenize } from '@/lib/analyzer/tenses';

import {
  GAP_LIMITS,
  ORDER_LIMITS,
  drillSentences,
  sampleEvenly,
  seededRandom,
  shuffle,
  splitSentences,
} from './sentences';

function sentencesOf(text: string): string[] {
  const tokens = tokenize(text);
  return splitSentences(tokens).map((range) =>
    tokens
      .slice(range.from, range.to + 1)
      .map((token) => token.raw)
      .join('')
      .trim(),
  );
}

describe('splitSentences', () => {
  it('ділить за крапкою, знаком питання і оклику', () => {
    expect(sentencesOf('She walked home. Did he call? Yes!')).toEqual([
      'She walked home.',
      'Did he call?',
      'Yes!',
    ]);
  });

  it('лапка після крапки лишається в реченні', () => {
    expect(sentencesOf('“I had never seen it.” He smiled.')).toEqual([
      '“I had never seen it.”',
      'He smiled.',
    ]);
  });

  it('скорочення й ініціали не закінчують речення', () => {
    expect(sentencesOf('Mr. J. Dursley had left early. Then it rained.')).toEqual([
      'Mr. J. Dursley had left early.',
      'Then it rained.',
    ]);
  });

  it('порожній рядок закриває речення без крапки — заголовок не злипається', () => {
    expect(sentencesOf('CHAPTER I\n\nAlice was beginning to get tired.')).toEqual([
      'CHAPTER I',
      'Alice was beginning to get tired.',
    ]);
  });
});

describe('drillSentences', () => {
  it('віддає речення в межах довжини з переведеними в слова збігами', () => {
    const text = 'The pager went off at night. She had never seen such a bright and quiet autumn morning before.';
    const tokens = tokenize(text);
    const out = drillSentences(tokens, findMatches(tokens), 'Демо', ORDER_LIMITS);

    expect(out.map((sentence) => sentence.words.join(' '))).toEqual([
      'The pager went off at night.',
    ]);
    expect(out[0]?.matches).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
    expect(out[0]?.source).toBe('Демо');
  });

  it('довше речення проходить у межах пропуску, а «had never seen» лягає на три слова', () => {
    const text = 'She had never seen such a bright morning before.';
    const tokens = tokenize(text);
    const out = drillSentences(tokens, findMatches(tokens), 'Демо', GAP_LIMITS);

    expect(out).toHaveLength(1);
    expect(out[0]?.matches).toEqual([{ from: 1, to: 3, tense: 'pp' }]);
  });

  it('речення без збігів, з цифрами чи з заголовком капсом відкидаються', () => {
    const text = 'CHAPTER ONE WAS HERE. It cost 40 dollars and he paid. The sky is blue today.';
    const tokens = tokenize(text);
    const out = drillSentences(tokens, findMatches(tokens), 'Демо', GAP_LIMITS);

    expect(out).toEqual([]);
  });
});

describe('sampleEvenly', () => {
  it('бере елементи з усього списку, а не з початку', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const picked = sampleEvenly(items, 4);
    expect(picked).toEqual([0, 25, 50, 75]);
  });

  it('короткий список віддає цілком', () => {
    expect(sampleEvenly([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });
});

describe('shuffle', () => {
  it('не губить і не дублює елементів', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect([...shuffle(items)].sort()).toEqual(items);
  });

  it('з детермінованим генератором дає детермінований порядок', () => {
    const fixed = () => 0;
    expect(shuffle([1, 2, 3], fixed)).toEqual([2, 3, 1]);
  });
});

describe('seededRandom', () => {
  it('однакове зерно — однаковий порядок, різне — інший', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffle(items, seededRandom(0.42));
    const b = shuffle(items, seededRandom(0.42));
    const c = shuffle(items, seededRandom(0.43));
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect([...a].sort()).toEqual(items);
  });

  it('значення лежать у [0, 1)', () => {
    const random = seededRandom(0.1);
    for (let i = 0; i < 1000; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

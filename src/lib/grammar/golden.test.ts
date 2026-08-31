import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { tokenize } from '@/lib/analyzer/tenses';

import { analyzeGrammar } from './index';

/**
 * Golden-тести: уривок тексту і очікувані збіги словами. Формат файлу —
 * текст, рядок `=== збіги ===`, далі по рядку на збіг: ключ часу, табуляція,
 * слова конструкції так, як їх дає `tokenize` (нижній регістр, без пунктуації
 * по краях). Знак `?` після ключа — двигун сам позначає збіг сумнівним.
 * Рядки з `#` після роздільника — коментарі для людини.
 *
 * Очікування — не знімок виводу, а вичитаний список: там, де двигун
 * помиляється свідомо (обмеження теґера), коментар це називає, і зміна такого
 * рядка мусить бути зміною рішення, а не оновленням снапшота.
 */
const SEPARATOR = '\n=== збіги ===\n';

interface Golden {
  name: string;
  text: string;
  expected: string[];
}

function readGolden(file: string): Golden {
  const raw = fs.readFileSync(file, 'utf8');
  const at = raw.indexOf(SEPARATOR);
  if (at < 0) throw new Error(`${file}: немає роздільника «=== збіги ===»`);
  const text = raw.slice(0, at);
  const expected = raw
    .slice(at + SEPARATOR.length)
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line !== '' && !line.startsWith('#'));
  return { name: path.basename(file, '.txt'), text, expected };
}

/** Збіги двигуна в тому ж записі, що й у golden-файлі. */
export function describeMatches(text: string): string[] {
  const tokens = tokenize(text);
  return analyzeGrammar(text).matches.map((match) => {
    const words: string[] = [];
    for (let i = match.from; i <= match.to; i += 1) {
      const word = tokens[i]?.word;
      if (word) words.push(word);
    }
    return `${match.tense}${match.uncertain ? '?' : ''}\t${words.join(' ')}`;
  });
}

const dir = path.join(__dirname, 'golden');
const goldens = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith('.txt'))
  .map((file) => readGolden(path.join(dir, file)));

describe('golden-уривки', () => {
  it('є всі шість уривків', () => {
    expect(goldens.map((golden) => golden.name).sort()).toEqual([
      'alice-ch1',
      'alice-ch7',
      'alice-p3',
      'future',
      'magi-end',
      'magi-start',
    ]);
  });

  for (const golden of goldens) {
    it(golden.name, () => {
      expect(describeMatches(golden.text)).toEqual(golden.expected);
    });
  }
});

describe('analyzeGrammar — контракт результату', () => {
  const alice = readGolden(path.join(dir, 'alice-p3.txt')).text;
  const result = analyzeGrammar(alice);

  it('збіги відсортовані за from і не перекриваються', () => {
    for (let i = 1; i < result.matches.length; i += 1) {
      const previous = result.matches[i - 1];
      const current = result.matches[i];
      expect(current && previous && current.from > previous.to).toBe(true);
    }
  });

  it('жоден збіг не довший за вісім токенів', () => {
    for (const match of result.matches) expect(match.to - match.from).toBeLessThanOrEqual(8);
  });

  it('пропуски теж лежать у межах тексту й не перекривають збіги', () => {
    const tokens = tokenize(alice);
    for (const skip of result.skipped) {
      expect(skip.from).toBeGreaterThanOrEqual(0);
      expect(skip.to).toBeLessThan(tokens.length);
      for (const match of result.matches) {
        expect(skip.from > match.to || skip.to < match.from).toBe(true);
      }
    }
  });
});

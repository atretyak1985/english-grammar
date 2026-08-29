import { tokenize } from '@/lib/analyzer/tenses';

import { splitSentences } from './sentences';

/**
 * Приклад ужитку для картки слова — речення з того тексту, де слово
 * трапилося. Саме це обіцяє картка: «з прикладом з того тексту, де ви його
 * зустріли», а не цитата зі словника.
 */

export interface ExampleSource {
  title: string;
  body: string;
}

export interface WordExample {
  sentence: string;
  title: string;
}

/** Коротше — не речення, довше — не приклад, а абзац. */
const MIN_WORDS = 5;
const MAX_WORDS = 28;

/** Довжина, до якої речення вважається «зручним» і пошук зупиняється. */
const COMFORTABLE_WORDS = 18;

/**
 * Для кожного слова — найзручніше речення з джерел: перше з довжиною до
 * `COMFORTABLE_WORDS`, а якщо такого немає — найкоротше з довших. Слово
 * шукається як словоформа з тексту, бо саме словоформу читач позначив.
 */
export function findExamples(
  sources: readonly ExampleSource[],
  words: readonly string[],
): Record<string, WordExample> {
  const wanted = new Set(words.map((word) => word.toLowerCase()));
  const found: Record<string, WordExample & { length: number }> = {};

  for (const source of sources) {
    const tokens = tokenize(source.body);
    for (const range of splitSentences(tokens)) {
      const slice = tokens.slice(range.from, range.to + 1);
      const present: string[] = [];
      let length = 0;
      for (const token of slice) {
        if (token.word === null) continue;
        length += 1;
        if (wanted.has(token.word)) present.push(token.word);
      }
      if (present.length === 0 || length < MIN_WORDS || length > MAX_WORDS) continue;

      const sentence = slice
        .map((token) => token.raw)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();

      for (const word of present) {
        const current = found[word];
        const better =
          current === undefined ||
          (current.length > COMFORTABLE_WORDS && length < current.length);
        if (better) found[word] = { sentence, title: source.title, length };
      }
    }
  }

  const out: Record<string, WordExample> = {};
  for (const [word, { sentence, title }] of Object.entries(found)) out[word] = { sentence, title };
  return out;
}

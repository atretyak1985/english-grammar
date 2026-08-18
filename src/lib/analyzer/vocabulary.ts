import { isMeaningfulWord } from '@/data/stopwords';
import { normalizeWord } from '@/lib/analyzer/tenses';

/**
 * Частотність як порядок вивчення (CONCEPT 5.1): усе до нижнього регістру,
 * без пунктуації, без службових слів і без слів коротших за три літери.
 * Решта рахується і сортується за кількістю; при однаковій кількості —
 * за алфавітом, щоб порядок був стабільним між перерахунками.
 */

export interface WordCount {
  word: string;
  count: number;
}

export function extractWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((raw) => normalizeWord(raw))
    .filter((word): word is string => word !== null && isMeaningfulWord(word));
}

export function wordFrequency(text: string): WordCount[] {
  const counts = new Map<string, number>();
  for (const word of extractWords(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

/** Скільки позицій показуємо в таблиці слів. */
export const WORD_LIST_LIMIT = 40;

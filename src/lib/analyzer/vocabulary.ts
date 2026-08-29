import { isMeaningfulWord } from '@/data/stopwords';
import { normalizeWord } from '@/lib/analyzer/tenses';
import type { WordStatus } from '@/types/state';

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

/**
 * Частота слів у вже розібраному тексті — на відміну від `wordFrequency`, яка
 * бере сирий рядок. Рахує по ВСІХ токенах документа, а не по видимій сторінці:
 * блок «Незнайомі слова тут» описує весь текст (CONCEPT 4.2).
 */
export function tokenFrequency(tokens: { word: string | null }[]): WordCount[] {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (!token.word || !isMeaningfulWord(token.word)) continue;
    counts.set(token.word, (counts.get(token.word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

/**
 * У блоці лишається тільки незнайоме: «знаю» і «вчу» відпадають одним
 * предикатом. Дозаповнювати список не треба — щойно верхнє слово дістало
 * статус, наступне за частотою підтягується саме.
 */
export function pickUnknown(
  frequency: WordCount[],
  words: Record<string, WordStatus>,
): WordCount[] {
  return frequency.filter((entry) => (words[entry.word] ?? 'unknown') === 'unknown');
}

/**
 * Скільки разів слово може траплятися в усьому тексті, щоб вважатися
 * рідкісним.
 *
 * Це замінник частотного корпусу, якого в застосунку немає. Проксі грубий,
 * але не випадковий: слово, що на всю книжку трапилось раз-два, майже
 * напевно не з тієї тисячі, яку читач уже знає, — а «dollar», що трапляється
 * сорок разів, знає й той, хто відкрив книжку вперше.
 */
export const RARE_AT_MOST = 2;

/**
 * Слова цієї сторінки, які варто запропонувати: рідкісні, змістовні й ще
 * без статусу.
 *
 * Сторінка, а не весь текст, — бо блок підписаний «тут», і список, у якому
 * шість сотень слів з усієї книжки, не допомагає на жодній її сторінці.
 * Порядок — від найрідкіснішого: саме те, на чому читач спіткнеться.
 *
 * На цей самий список спирається пунктир у тексті. Без відбору підкресленим
 * виявлялося кожне непозначене слово — тобто майже весь абзац, — і пунктир
 * переставав бути підказкою: він не виділяв нічого.
 */
export function pickRareOnPage(
  pageWords: (string | null)[],
  frequency: WordCount[],
  words: Record<string, WordStatus>,
): WordCount[] {
  const counts = new Map(frequency.map((entry) => [entry.word, entry.count]));
  const picked = new Map<string, number>();

  for (const word of pageWords) {
    if (!word || picked.has(word) || !isMeaningfulWord(word)) continue;
    if ((words[word] ?? 'unknown') !== 'unknown') continue;

    // Слова без запису в частотності на сторінці немає за визначенням: воно
    // щойно з неї прочитане, тож рахуємо його як одиничне.
    const count = counts.get(word) ?? 1;
    if (count > RARE_AT_MOST) continue;

    picked.set(word, count);
  }

  return [...picked.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => a.count - b.count || a.word.localeCompare(b.word));
}

/** Скільки незнайомих слів показує блок аналізатора за раз. */
export const UNKNOWN_LIMIT = 20;

/**
 * Словникова стаття з Wiktionary. Один тип на весь модуль: парсер його
 * складає, мережевий шар віддає, кеш і UI наступних фаз читають.
 *
 * `word` і `lemma` розділені навмисно: аналізатор дає словоформи
 * («deployed»), а транскрипція й означення живуть у статті леми («deploy»).
 * UI показує слово користувача, але вимову — леми, тому обидва потрібні.
 */
export interface DictionaryEntry {
  /** слово, як його запитали (нижній регістр) */
  word: string;
  /** лема, якщо word — словоформа; інакше === word */
  lemma: string;
  /** IPA без слешів, напр. ɪmˈpɹuːv */
  ipa: string | null;
  /** визначення англійською, до 3 */
  definitions: string[];
  /** короткі навчальні приклади (`#:` у джерелі) — їх показуємо першими */
  examples: string[];
  /** літературні цитати (`#*`) — довгі, для розкритої картки */
  quotes: string[];
  /** повний URL .ogg на Commons або null */
  audioUrl: string | null;
  source: 'wiktionary';
  license: 'CC BY-SA 4.0';
  /** посилання на конкретну статтю — потрібне для атрибуції (SC-13) */
  sourceUrl: string;
}

/** Слова, якого немає у Wiktionary (або якого не дала мережа), немає й тут. */
export type LookupResult = DictionaryEntry | null;

/** Обмеження на статтю: більше на картці слова однаково не вміщається. */
export const MAX_DEFINITIONS = 3;
export const MAX_EXAMPLES = 3;
export const MAX_QUOTES = 2;

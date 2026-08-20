/**
 * Службові слова, які не потрапляють у частотний список (CONCEPT 5.1):
 * артиклі, займенники, прийменники, допоміжні дієслова.
 * Учити їх не потрібно — вони тільки засмічують список.
 */
export const STOPWORDS: ReadonlySet<string> = new Set([
  // артиклі та детермінативи
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'some', 'any', 'each', 'every', 'all',
  'both', 'few', 'more', 'most', 'other', 'such', 'own', 'same', 'no', 'nor', 'not',
  // займенники
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
  'who', 'whom', 'whose', 'which', 'what', 'where', 'when', 'why', 'how',
  'anyone', 'someone', 'everyone', 'nobody', 'anything', 'something', 'everything', 'nothing',
  // допоміжні та модальні
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done', 'doing',
  'have', 'has', 'had', 'having',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't",
  "hadn't", "won't", "wouldn't", "can't", "couldn't", "shouldn't", "mustn't",
  // прийменники та сполучники
  'and', 'but', 'or', 'so', 'because', 'if', 'then', 'than', 'as', 'while', 'until', 'till',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'without', 'by', 'from', 'into', 'onto',
  'about', 'over', 'under', 'after', 'before', 'during', 'between', 'through', 'up', 'down',
  'out', 'off', 'again', 'once', 'there', 'here', 'too', 'very', 'just', 'also', 'only',
  'yet', 'still', 'even', 'ever', 'never', 'always', 'now', 'yes',
]);

/** Слова коротші за це не потрапляють у словник — сенсу вчити немає. */
export const MIN_WORD_LENGTH = 3;

export function isMeaningfulWord(word: string): boolean {
  return word.length >= MIN_WORD_LENGTH && !STOPWORDS.has(word);
}

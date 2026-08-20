/**
 * Порівняння власного перекладу з еталоном (CONCEPT 9, пункт 4 — практика).
 *
 * Важлива межа методу: правильних перекладів завжди більше, ніж один. Тому це
 * порівняння, а не оцінка: збіг з еталоном ми стверджуємо, а розбіжність лише
 * показуємо — вирішує людина. Через це в присудку немає слова «помилка».
 */
const CONTRACTIONS: [RegExp, string][] = [
  [/\bdidn't\b/g, 'did not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhadn't\b/g, 'had not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdon't\b/g, 'do not'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bit's\b/g, 'it is'],
  [/\bi'm\b/g, 'i am'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bi'd\b/g, 'i would'],
  [/\bwe'd\b/g, 'we would'],
];

/** Скорочення розкриваються, апострофи й лапки зводяться до прямих, пунктуація зникає. */
export function normalizeAnswer(value: string): string {
  let text = value.toLowerCase().normalize('NFC').replace(/[‘’ʼ]/g, "'");
  for (const [pattern, expansion] of CONTRACTIONS) text = text.replace(pattern, expansion);
  return text
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function words(value: string): string[] {
  const normalized = normalizeAnswer(value);
  return normalized ? normalized.split(' ') : [];
}

export type DiffKind = 'same' | 'missing' | 'extra';

export interface DiffPart {
  kind: DiffKind;
  word: string;
}

/**
 * Послівна різниця через найдовшу спільну підпослідовність: `missing` — слово є
 * в еталоні й немає у вас, `extra` — навпаки.
 */
export function diffWords(expected: string[], actual: string[]): DiffParts {
  const rows = expected.length;
  const cols = actual.length;
  const lcs: number[][] = Array.from({ length: rows + 1 }, () => new Array<number>(cols + 1).fill(0));

  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      lcs[i]![j] =
        expected[i] === actual[j] ? (lcs[i + 1]![j + 1] ?? 0) + 1 : Math.max(lcs[i + 1]![j] ?? 0, lcs[i]![j + 1] ?? 0);
    }
  }

  const parts: DiffPart[] = [];
  let i = 0;
  let j = 0;
  let common = 0;

  while (i < rows && j < cols) {
    if (expected[i] === actual[j]) {
      parts.push({ kind: 'same', word: expected[i]! });
      common += 1;
      i += 1;
      j += 1;
    } else if ((lcs[i + 1]![j] ?? 0) >= (lcs[i]![j + 1] ?? 0)) {
      parts.push({ kind: 'missing', word: expected[i]! });
      i += 1;
    } else {
      parts.push({ kind: 'extra', word: actual[j]! });
      j += 1;
    }
  }
  while (i < rows) parts.push({ kind: 'missing', word: expected[i++]! });
  while (j < cols) parts.push({ kind: 'extra', word: actual[j++]! });

  return { parts, common };
}

interface DiffParts {
  parts: DiffPart[];
  common: number;
}

export type Verdict = 'match' | 'close' | 'different';

export interface CheckResult {
  verdict: Verdict;
  parts: DiffPart[];
  /** Частка спільних слів з еталоном, 0..1 */
  overlap: number;
}

/**
 * @param expected еталонний переклад
 * @param actual   те, що написав користувач
 * @param accepted інші варіанти, які теж вважаємо збігом
 */
export function checkTranslation(
  expected: string,
  actual: string,
  accepted: readonly string[] = [],
): CheckResult {
  const mine = words(actual);
  const variants = [expected, ...accepted];

  const exact = variants.some((variant) => normalizeAnswer(variant) === normalizeAnswer(actual));

  // Різницю показуємо проти найближчого варіанта, а не завжди проти першого.
  let best: CheckResult = { verdict: 'different', parts: [], overlap: 0 };
  for (const variant of variants) {
    const reference = words(variant);
    const { parts, common } = diffWords(reference, mine);
    const overlap = reference.length === 0 ? 0 : common / reference.length;
    if (overlap >= best.overlap) best = { verdict: 'different', parts, overlap };
  }

  if (exact) return { ...best, verdict: 'match' };

  // Розбіжність у допоміжному дієслові — це і є вибір часу, тобто рівно те,
  // чому присвячена тема. Такий випадок не називаємо «майже те саме», навіть
  // коли решта слів збіглася.
  const tenseShift = best.parts.some(
    (part) => part.kind !== 'same' && AUXILIARIES.has(part.word),
  );

  return { ...best, verdict: !tenseShift && best.overlap >= 0.8 ? 'close' : 'different' };
}

const AUXILIARIES = new Set([
  'did',
  'do',
  'does',
  'was',
  'were',
  'is',
  'are',
  'am',
  'had',
  'has',
  'have',
  'been',
  'being',
  'will',
  'would',
  'not',
]);

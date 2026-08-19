import type { AnalyzedToken } from '@/lib/analyzer/tenses';

/**
 * Розбиття проаналізованого тексту на сторінки, як у книзі. Довгий документ
 * (сканована стаття, кілька сторінок PDF) інакше дає одне полотно на десятки
 * тисяч span-ів: і читати неможливо, і браузеру важко.
 *
 * Статистика часів і словник рахуються по всьому тексту — сторінка обмежує
 * тільки те, що показується (CONCEPT 4.2).
 */
export const PAGE_CHARS = 1800;

export interface TextPage {
  /** Індекс першого токена сторінки */
  start: number;
  /** Індекс за останнім токеном сторінки */
  end: number;
}

/** Абзацна межа — найкраще місце для розриву сторінки. */
function isParagraphBreak(token: AnalyzedToken): boolean {
  return token.word === null && /\n[^\S\n]*\n/.test(token.raw);
}

/** Кінець речення — друга за якістю межа. */
function endsSentence(token: AnalyzedToken): boolean {
  return /[.!?…][)"'»]?$/.test(token.raw.trim());
}

export function paginate(tokens: AnalyzedToken[], target = PAGE_CHARS): TextPage[] {
  if (tokens.length === 0) return [{ start: 0, end: 0 }];

  const pages: TextPage[] = [];
  let start = 0;
  let chars = 0;
  /** Остання межа речення після того, як сторінка вже назбирала половину обсягу */
  let sentenceBreak = -1;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) continue;
    chars += token.raw.length;

    if (chars >= target / 2 && endsSentence(token)) sentenceBreak = index;

    const paragraph = isParagraphBreak(token) && chars >= target / 2;
    if (paragraph || chars >= target) {
      // Абзац ріжемо по ньому, інакше — по останньому реченню, інакше — тут.
      const cut = paragraph ? index : sentenceBreak > start ? sentenceBreak : index;
      pages.push({ start, end: cut + 1 });
      start = cut + 1;
      chars = 0;
      sentenceBreak = -1;
      index = cut;
    }
  }

  if (start < tokens.length) pages.push({ start, end: tokens.length });
  return pages;
}

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

/**
 * Скільки тексту влазить у зміряну область читання. Порожнє місце під текстом —
 * це змарнована сторінка, тому розмір сторінки залежить від доступного місця,
 * а не від константи.
 *
 * @param width   ширина області в пікселях
 * @param height  висота області в пікселях
 * @param font    кегль
 * @param lineHeight множник міжрядкового
 * @param columns кількість колонок тексту
 */
export function fitPageChars({
  width,
  height,
  font,
  lineHeight,
  columns = 1,
}: {
  width: number;
  height: number;
  font: number;
  lineHeight: number;
  columns?: number;
}): number {
  if (width < 200 || height < 120) return PAGE_CHARS;

  const gap = columns > 1 ? 48 * (columns - 1) : 0;
  const columnWidth = (width - gap) / columns;
  // Ширина середньої літери — приблизно 0.34 кегля: значення відкалібровано
  // заміром реального рядка Manrope, а не взяте з голови.
  const charsPerLine = Math.max(24, Math.floor(columnWidth / (font * 0.34)));
  const lines = Math.max(4, Math.floor(height / (font * lineHeight)));
  // 0.88 — запас на короткі рядки в кінці абзаців і на розрив по межі речення:
  // недобір кількох рядків краще за перелив, бо сторінку не доведеться крутити.
  return Math.max(400, Math.round(columns * lines * charsPerLine * 0.95));
}

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

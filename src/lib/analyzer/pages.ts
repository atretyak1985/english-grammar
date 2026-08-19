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

/**
 * Межу абзацу приймаємо лише коли сторінка вже майже повна — тоді сторінка
 * закінчується красиво. В усіх інших випадках ріжемо по межі слова, як у
 * звичайній книзі: сторінка може обриватися посередині речення. Саме це не
 * дає лишати екран напівпорожнім, бо межі абзаців квантують розмір сторінки
 * надто грубо (43, 348, 371, 570 символів — і нічого між ними).
 */
const PARAGRAPH_AT = 0.85;

export function paginate(tokens: AnalyzedToken[], target = PAGE_CHARS): TextPage[] {
  if (tokens.length === 0) return [{ start: 0, end: 0 }];

  const pages: TextPage[] = [];
  let start = 0;
  let chars = 0;
  /** Остання межа абзацу після того, як сторінка вже майже заповнилась */
  let paragraphBreak = -1;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) continue;
    chars += token.raw.length;

    if (chars >= target * PARAGRAPH_AT && isParagraphBreak(token)) paragraphBreak = index;

    if (chars >= target) {
      // Якщо межа абзацу трапилась у кінці сторінки — ріжемо по ній, інакше
      // по слову, але не всередині знайденої конструкції (had + V3 має
      // лишитися разом, бо в ній увесь сенс підсвітки).
      let cut = paragraphBreak > start ? paragraphBreak : index;
      while (cut > start && !tokens[cut]?.endsMatch && tokens[cut]?.tense) cut -= 1;

      pages.push({ start, end: cut + 1 });
      start = cut + 1;
      chars = 0;
      paragraphBreak = -1;
      index = cut;
    }
  }

  if (start < tokens.length) pages.push({ start, end: tokens.length });
  return pages;
}

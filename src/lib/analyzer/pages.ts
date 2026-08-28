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

/**
 * Скільки сторінок у тексті — оцінка за середнім розміром уже перегорнутих.
 *
 * Розмір однієї сторінки стрибає в рази: діалог із коротких реплік тримає
 * удвічі менше токенів, ніж суцільний абзац, а межу ще й уточнює замір після
 * рендера. Оцінка, виведена з поточної сторінки, стрибала разом з нею — на
 * трьох сусідніх сторінках однієї книжки читач бачив «з ~50», «з ~123» і
 * «з ~58».
 *
 * Тому дільник — середнє по вже прочитаному: одна нетипова сторінка важить
 * у ньому 1/N, і що далі читач, то точніша оцінка. Береться саме `anchor`
 * (початок поточної сторінки), а не її кінець: anchor уже усталений, тоді як
 * кінець ще шукає бісекція, і підпис не смикався б під час гортання.
 *
 * На першій сторінці історії ще немає, і її власний розмір дільником не
 * годиться: титульний аркуш книжки тримає кілька рядків, і оцінка з нього
 * виходила «1 з ~748». Тому там береться `fallbackAverage` — середній розмір
 * сторінки з розрахункової пагінації (`paginate`), яка бачить увесь текст
 * одразу. Це єдине місце, де оцінка може ворухнутися після заміру.
 */
export function estimatePageCount({
  totalTokens,
  pageNumber,
  anchor,
  pageEnd,
  fallbackAverage,
}: {
  totalTokens: number;
  /** Номер поточної сторінки, з одиниці */
  pageNumber: number;
  /** Індекс першого токена поточної сторінки */
  anchor: number;
  /** Індекс за останнім токеном поточної сторінки */
  pageEnd: number;
  /** Середній розмір сторінки за розрахунком по всьому тексту — для першої сторінки */
  fallbackAverage?: number;
}): number {
  const average = divisor({ pageNumber, anchor, pageEnd, fallbackAverage });
  const estimate = Math.ceil(totalTokens / Math.max(1, average));
  return Math.max(pageNumber, estimate);
}

/**
 * Скільки прочитаних сторінок «важить» розрахункова пагінація.
 *
 * Самого середнього по прочитаному замало на початку книжки: перша сторінка
 * часто титул або зміст — кілька рядків замість повної сторінки, — і на
 * другій вона одна становить усе середнє. Тому розрахункова пагінація
 * входить у середнє як кілька уявних сторінок: на початку вона й тримає
 * оцінку, а з кожною прочитаною важить дедалі менше й до середини книжки
 * не значить нічого.
 */
const PRIOR_PAGES = 2;

function divisor({
  pageNumber,
  anchor,
  pageEnd,
  fallbackAverage,
}: {
  pageNumber: number;
  anchor: number;
  pageEnd: number;
  fallbackAverage?: number;
}): number {
  // Без розрахункового середнього спиратися нема на що, крім побаченого.
  if (fallbackAverage === undefined) {
    return pageNumber > 1 ? anchor / (pageNumber - 1) : pageEnd - anchor;
  }
  const readPages = pageNumber - 1;
  return (anchor + fallbackAverage * PRIOR_PAGES) / (readPages + PRIOR_PAGES);
}

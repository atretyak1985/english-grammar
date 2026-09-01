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
 * Скільки сторінок у тексті — розрахунком, відкаліброваним під заміряну
 * сторінку.
 *
 * Оцінка тут підводила двічі, і обидва рази помітно. Спершу вона виводилася
 * з розміру поточної сторінки й стрибала під час гортання: «з ~50», «з ~123»,
 * «з ~58» на трьох сусідніх сторінках. Потім — із середнього по прочитаному,
 * і почала повзти вгору на кожному кроці: 84, 119, 140, 151, 159, 164, 173.
 *
 * Спільна причина в обох випадках — ділення на «середню сторінку», якої не
 * існує: розмір сторінки задають абзацні межі, а вони розкидані по тексту
 * нерівно. Сторінка перед новим розділом коротка не тому, що там мало слів, а
 * тому, що далі йде розрив.
 *
 * Тому кількість тут не ділиться, а РАХУЄТЬСЯ: тим самим `paginate`, що ріже
 * текст на сторінки, — лише з мірою, знятою з уже прочитаного. Розбиття саме
 * враховує ті абзацні межі, через які середнє й хиталося, тому підсумок
 * перестає гуляти після другої-третьої сторінки.
 *
 * Міра — у символах, а не в токенах: `paginate` рахує саме символи, і будь-яке
 * інше мірило довелося б переводити назад із похибкою.
 */
export function estimatePageCount({
  tokens,
  pageStarts,
}: {
  tokens: AnalyzedToken[];
  /** Початки всіх показаних сторінок, від першої до поточної */
  pageStarts: number[];
}): number {
  const pageNumber = Math.max(1, pageStarts.length);
  const target = calibrateTarget(tokens, pageStarts);
  return Math.max(pageNumber, paginate(tokens, target).length);
}

/**
 * Скільки символів вміщає сторінка насправді — медіана прочитаних.
 *
 * Медіана, а не середнє: одна коротка сторінка (титул, зміст, аркуш перед
 * розділом) зсуває середнє на десятки наступних сторінок, а медіану не
 * зрушить, доки коротких не стане більшість — а тоді вони вже й не нетипові.
 *
 * На парній кількості беремо ВЕРХНЮ з двох середніх. Викид тут однобокий:
 * сторінка буває набагато коротшою за звичайну, але не буває набагато
 * довшою — її стелю задає сам замір. Усереднення з коротким сусідом
 * занижувало б міру, а занижена міра — це завищена кількість сторінок, тобто
 * рівно та помилка, від якої тут і захищаємось.
 */
function calibrateTarget(tokens: AnalyzedToken[], pageStarts: number[]): number {
  const sizes: number[] = [];
  for (let i = 1; i < pageStarts.length; i += 1) {
    let chars = 0;
    for (let j = pageStarts[i - 1] ?? 0; j < (pageStarts[i] ?? 0); j += 1) {
      chars += tokens[j]?.raw.length ?? 0;
    }
    if (chars > 0) sizes.push(chars);
  }

  // Нічого не прочитано — лишається закладена міра.
  if (sizes.length === 0) return PAGE_CHARS;

  const sorted = [...sizes].sort((a, b) => a - b);
  const measured = sorted[Math.floor(sorted.length / 2)] ?? PAGE_CHARS;

  // Округлення до півсотні символів: без нього міра сіпається на кожному
  // гортанні, і разом з нею перераховувалась би вся пагінація.
  const rounded = Math.max(200, Math.round(measured / 50) * 50);

  // Одна прочитана сторінка — це може бути саме титул, і брати його за міру
  // означало б пообіцяти вп'ятеро більше сторінок, ніж є.
  return sizes.length === 1 ? Math.max(rounded, PAGE_CHARS) : rounded;
}

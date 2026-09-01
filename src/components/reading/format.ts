import { TENSE_ASPECT, TENSE_KEYS, type Aspect, type TenseKey } from '@/types/content';

/**
 * Спільні перерахунки полиці. Живуть окремо від карток, бо тими самими
 * числами користуються і банер «продовжити», і сама картка, — а два
 * округлення того самого відсотка розійшлися б рівно на межі.
 */

/** Швидкість читання, з якої виводяться всі хвилини на полиці. */
const WORDS_PER_MINUTE = 220;

/**
 * Розряди відділяємо нерозривним пробілом самі, без `toLocaleString`: ICU в
 * Node і в браузері може дати різний пробіл, а число тут рендериться і на
 * сервері, і після гідратації — розбіжність упала б попередженням гідратації.
 */
export function formatWords(count: number): string {
  return String(count).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function readingMinutes(words: number): number {
  return Math.round(words / WORDS_PER_MINUTE);
}

/**
 * Відсоток прочитаного. `anchor` — номер токена, з якого починається видима
 * сторінка читалки, тому знаменник мусить бути тим самим `tokenize`, яким
 * читалка нумерує текст (`listStories` рахує його на сервері).
 */
export function readPercent(anchor: number, totalTokens: number): number {
  if (totalTokens <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((anchor / totalTokens) * 100)));
}

/** Скільки хвилин лишилось — з тієї ж швидкості й того ж відсотка. */
export function minutesLeft(words: number, percent: number): number {
  return readingMinutes((words * (100 - percent)) / 100);
}

/**
 * Чипи складу тексту. Їх рівно три, бо кольорів рівно три: токени
 * `--ps` / `--pc` / `--pp` означають ВИД конструкції, а не час (див.
 * коментар у `globals.css` і `TENSE_ASPECT`). Дев'ять часів згортаються
 * у три види — інакше картка показувала б до дев'яти чипів і поїхала б
 * висотою, а колір усе одно повторювався б утричі.
 *
 * Назви видів — ті самі, що в легенді підсвітки (`HighlightLegend`):
 * читач бачить на полиці те саме слово, що потім побачить над текстом.
 */
const ASPECT_LABEL: Record<Aspect, string> = {
  simple: 'Simple',
  continuous: 'Continuous',
  perfect: 'Perfect',
};

/** Класи мусять бути літералами: Tailwind збирає їх статичним пошуком. */
const ASPECT_CHIP: Record<Aspect, string> = {
  simple: 'bg-ps-bg text-ps-tx',
  continuous: 'bg-pc-bg text-pc-tx',
  perfect: 'bg-pp-bg text-pp-tx',
};

const ASPECT_ORDER: Aspect[] = ['simple', 'continuous', 'perfect'];

export interface AspectChip {
  aspect: Aspect;
  label: string;
  className: string;
  count: number;
}

/** Види, яких у тексті справді щось є, у сталому порядку легенди. */
export function aspectChips(stats: Record<TenseKey, number>): AspectChip[] {
  const totals: Record<Aspect, number> = { simple: 0, continuous: 0, perfect: 0 };
  for (const tense of TENSE_KEYS) totals[TENSE_ASPECT[tense]] += stats[tense] ?? 0;

  return ASPECT_ORDER.filter((aspect) => totals[aspect] > 0).map((aspect) => ({
    aspect,
    label: ASPECT_LABEL[aspect],
    className: ASPECT_CHIP[aspect],
    count: totals[aspect],
  }));
}

/**
 * Обкладинки. Два розвороти макета, і вибір прив'язаний до `sortOrder`, а не
 * до місця в списку: інакше книжка міняла б колір щоразу, коли читач
 * перемикає сортування чи рівень.
 *
 * Градієнти лишаються літералами й однакові в обох темах — це чорнило на
 * папері, як і решта темних поверхонь напряму (див. `globals.css`).
 */
const COVERS: [string, string] = [
  'linear-gradient(160deg, #7a4d24, #4a2c12)',
  'linear-gradient(160deg, #35566e, #1c3345)',
];

export function coverGradient(sortOrder: number): string {
  const index = ((sortOrder % COVERS.length) + COVERS.length) % COVERS.length;
  return COVERS[index] ?? COVERS[0];
}

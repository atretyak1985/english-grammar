import { connection } from 'next/server';

import { eq } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import type { Match } from '@/lib/analyzer/tenses';
import type { TenseKey } from '@/types/content';

/**
 * Серверні читання публічної бібліотеки. Обидві функції НІКОЛИ не кидають:
 * без `DATABASE_URL` чи на будь-якій помилці запиту — порожньо/`null`, тим
 * самим стилем, що й `currentSession()` (CONCEPT 8.1). Гість без бази має
 * бачити порожній стан, а не падіння рендера сторінки.
 */

export interface StoryCard {
  slug: string;
  title: string;
  author: string;
  words: number;
  stats: Record<TenseKey, number>;
  sortOrder: number;
}

export interface LoadedStory {
  slug: string;
  title: string;
  author: string;
  source: string;
  license: string;
  sourceUrl: string;
  body: string;
  words: number;
  stats: Record<TenseKey, number>;
  frequency: { word: string; count: number }[];
  /** Зведені з усіх `storyMatches` у номери токенів ДОКУМЕНТА, відсортовані за `from`. */
  matches: Match[];
}

/** Один рядок `story_matches` — рівно ті поля, що потрібні для зведення. */
interface StoryMatchRow {
  chunkIndex: number;
  matches: { from: number; to: number; tense: string }[];
}

/**
 * Зведення шматків `story_matches` в один список збігів документа.
 *
 * Засів (`scripts/seed-library.mts`) уже записує в `matches` кожного шматка
 * АБСОЛЮТНІ номери токенів документа (через `toTokenMatches`) — не відносні
 * до шматка. Тому тут лише впорядкувати шматки за `chunkIndex`, склеїти їхні
 * масиви й відсортувати результат за `from`; додавати межу шматка
 * (`fromToken`) вдруге НЕ ТРЕБА — це зсунуло б усю розмітку.
 *
 * Винесено чистою функцією окремо від запиту, щоб тестувати зведення без
 * мокання бази (`server.test.ts`).
 */
export function mergeStoryMatches(rows: StoryMatchRow[]): Match[] {
  const ordered = [...rows].sort((a, b) => a.chunkIndex - b.chunkIndex);
  const matches = ordered.flatMap((row) => row.matches) as Match[];
  return [...matches].sort((a, b) => a.from - b.from);
}

/**
 * Порядок списку: спершу `sortOrder`, тоді назва — стабільний порядок навіть
 * коли кілька оповідань мають однаковий `sortOrder`. Сортуємо в JS, а не
 * `ORDER BY` у запиті: бібліотека — невеликий, кураторський список, і просте
 * порівняння тут набагато простіше перевірити тестом, ніж SQL-вираз усередині
 * мокнутого ланцюга drizzle.
 */
function compareStoryCards(a: StoryCard, b: StoryCard): number {
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);
}

/**
 * Список оповідань для `/library`: за `sortOrder`, далі за назвою.
 *
 * `connection()` стоїть ПЕРШИМ рядком, до перевірки бази, і це не формальність.
 * Без нього гілка «бази немає» не торкається запиту зовсім, Next вважає
 * `/library` статичною і запікає її під час збірки — а образ збирається без
 * `DATABASE_URL`. Наслідок був би такий: у продакшені сторінка назавжди показує
 * «бібліотека ще порожня», і `make db-seed` цього не змінює, бо HTML уже
 * готовий. Той самий клас помилки вже ловили для сторінок із сесією
 * (`currentSession()`); документація Next називає саме цей випадок —
 * `connection.md`, розділ «Synchronous database drivers».
 */
export async function listStories(): Promise<StoryCard[]> {
  await connection();

  const db = getDb();
  if (db === null) return [];

  try {
    const rows = await db.select().from(schema.stories);

    return rows
      .map((row) => ({
        slug: row.slug,
        title: row.title,
        author: row.author,
        words: row.words,
        stats: row.stats,
        sortOrder: row.sortOrder,
      }))
      .sort(compareStoryCards);
  } catch (error) {
    console.warn('listStories: запит до бази не вдався', error);
    return [];
  }
}

/**
 * Оповідання й уся його розмітка для читалки; `null`, якщо немає оповідання чи
 * бази. `connection()` — з тієї самої причини, що в `listStories`: інакше
 * «оповідання не знайдено» могло б запектися в статичний 404.
 */
export async function loadStory(slug: string): Promise<LoadedStory | null> {
  await connection();

  const db = getDb();
  if (db === null) return null;

  try {
    const storyRows = await db.select().from(schema.stories).where(eq(schema.stories.slug, slug));
    const story = storyRows[0];
    if (!story) return null;

    const matchRows = await db
      .select({ chunkIndex: schema.storyMatches.chunkIndex, matches: schema.storyMatches.matches })
      .from(schema.storyMatches)
      .where(eq(schema.storyMatches.slug, slug));

    return {
      slug: story.slug,
      title: story.title,
      author: story.author,
      source: story.source,
      license: story.license,
      sourceUrl: story.sourceUrl,
      body: story.body,
      words: story.words,
      stats: story.stats,
      frequency: story.frequency,
      matches: mergeStoryMatches(matchRows),
    };
  } catch (error) {
    console.warn('loadStory: запит до бази не вдався', error);
    return null;
  }
}

/**
 * Назви й тіла всіх оповідань — для пошуку прикладів ужитку слова. Без бази
 * чи на помилці — порожньо, як і решта функцій тут: картка слова тоді просто
 * лишається без прикладу.
 */
export async function listStoryBodies(): Promise<{ title: string; body: string }[]> {
  const db = getDb();
  if (db === null) return [];

  try {
    return await db.select({ title: schema.stories.title, body: schema.stories.body }).from(schema.stories);
  } catch (error) {
    console.warn('listStoryBodies: запит до бази не вдався', error);
    return [];
  }
}

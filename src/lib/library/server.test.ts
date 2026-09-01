import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `mergeStoryMatches` — чиста функція зведення шматків, перевіряється без
 * бази. `listStories`/`loadStory` мокають `@/db` так само, як
 * `src/lib/access/index.test.ts`, — і лише на випадок відсутньої бази: сам
 * запит (з `drizzle`) тут не крихкий предмет тесту.
 */
const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');
  return { getDb: mocks.getDb, schema };
});

/**
 * `connection()` живе поза тестом: справжня функція кидає «called outside a
 * request scope», бо вона й ПОВИННА це робити — саме так Next дізнається, що
 * маршрут не можна пререндерити. Ловити її в самому резолвері не можна (це
 * знищило б захист від запікання `/library` у статичний HTML), тому заглушка
 * тут: предмет цих тестів — деградація без бази й порядок сортування, а не
 * механіка Next.
 */
vi.mock('next/server', () => ({ connection: () => Promise.resolve() }));

const { mergeStoryMatches, listStories, loadStory } = await import('./server');

beforeEach(() => {
  mocks.getDb.mockReset();
  mocks.getDb.mockReturnValue(null);
});

describe('mergeStoryMatches', () => {
  it('зводить шматки з різними chunkIndex у ПЕРЕМІШАНОМУ порядку в один відсортований масив', () => {
    const rows = [
      { chunkIndex: 1, matches: [{ from: 120, to: 121, tense: 'pc' }] },
      { chunkIndex: 0, matches: [{ from: 5, to: 6, tense: 'ps' }, { from: 40, to: 40, tense: 'ps' }] },
      { chunkIndex: 2, matches: [{ from: 200, to: 202, tense: 'pp' }] },
    ];

    const merged = mergeStoryMatches(rows);

    expect(merged).toEqual([
      { from: 5, to: 6, tense: 'ps' },
      { from: 40, to: 40, tense: 'ps' },
      { from: 120, to: 121, tense: 'pc' },
      { from: 200, to: 202, tense: 'pp' },
    ]);
  });

  it('НЕ додає межу шматка вдруге: номери токенів лишаються тими, що прийшли з рядка', () => {
    // `fromToken` шматка тут — 500, але в `matches` уже АБСОЛЮТНІ номери (як
    // пише `scripts/seed-library.mts` через `toTokenMatches`). Якби зведення
    // додавало `fromToken` ще раз, `from` вийшов би 550, а не 50.
    const rows = [{ chunkIndex: 0, matches: [{ from: 50, to: 52, tense: 'ps' }] }];

    const merged = mergeStoryMatches(rows);

    expect(merged).toEqual([{ from: 50, to: 52, tense: 'ps' }]);
  });

  it('порожній список рядків дає порожній масив', () => {
    expect(mergeStoryMatches([])).toEqual([]);
  });
});

describe('listStories', () => {
  it('без бази повертає порожній список і не кидає', async () => {
    mocks.getDb.mockReturnValue(null);

    await expect(listStories()).resolves.toEqual([]);
  });

  it('сортує за sortOrder, потім за title — незалежно від порядку рядків з бази', async () => {
    const rows = [
      { slug: 'c', title: 'Zebra', author: 'A', words: 10, stats: {}, sortOrder: 1, level: null, body: 'one two' },
      { slug: 'a', title: 'Beta', author: 'A', words: 10, stats: {}, sortOrder: 0, level: 'B1', body: 'one two' },
      { slug: 'b', title: 'Alpha', author: 'A', words: 10, stats: {}, sortOrder: 0, level: null, body: 'one two' },
    ];
    mocks.getDb.mockReturnValue({
      select: () => ({ from: () => Promise.resolve(rows) }),
    });

    const stories = await listStories();

    expect(stories.map((story) => story.slug)).toEqual(['b', 'a', 'c']);
  });

  /*
    Відсоток прочитаного на полиці — це `anchor / totalTokens`, а `anchor`
    приходить із читалки в номерах токенів `tokenize`. Тому знаменник мусить
    рахуватися ТИМ САМИМ поділом: розбіжність двох лічильників не впала б
    помилкою, а тихо показала б неправильний відсоток на кожній картці.
  */
  it('totalTokens рахує `tokenize` тіла — разом із пробільними токенами', async () => {
    const body = 'one two three';
    const rows = [{ slug: 'a', title: 'A', author: 'A', words: 3, stats: {}, sortOrder: 0, level: 'A2', body }];
    mocks.getDb.mockReturnValue({
      select: () => ({ from: () => Promise.resolve(rows) }),
    });

    const stories = await listStories();

    // `tokenize` ділить за `(\s+)`, тому три слова дають п'ять токенів: слово,
    // пробіл, слово, пробіл, слово.
    expect(stories[0]?.totalTokens).toBe(5);
    expect(stories[0]?.level).toBe('A2');
  });
});

describe('loadStory', () => {
  it('без бази повертає null і не кидає', async () => {
    mocks.getDb.mockReturnValue(null);

    await expect(loadStory('gift-of-the-magi')).resolves.toBeNull();
  });
});

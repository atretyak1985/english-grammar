import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DbModule from '@/db';
import { analyses, analysisBatches } from '@/db/schema';

/**
 * Батч без мережі й без бази. Перевіряється не робота Batch API, а те, за що
 * відповідаємо ми: що в батч не потрапляє вже оплачене, і що відповідь
 * лягає САМЕ НА СВІЙ шматок — переплутаний `custom_id` підсвітив би чужі слова,
 * і жодна перевірка типів цього не спіймала б.
 */
const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  getClaude: vi.fn(),
  create: vi.fn(),
  retrieve: vi.fn(),
  results: vi.fn(),
}));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');
  return { getDb: mocks.getDb, schema };
});

vi.mock('@/lib/claude', () => ({
  getClaude: mocks.getClaude,
  MODEL: 'test-model',
}));

const { MIN_CHUNKS_FOR_BATCH, SYNC_CHUNKS, batchState } = await import('./batch');
const { hashOf } = await import('./cache');
const { chunkText, chunksOf } = await import('./chunks');
const { tokenize } = await import('./tenses');

type Db = NonNullable<ReturnType<typeof DbModule.getDb>>;
type BatchRow = typeof analysisBatches.$inferSelect;
type AnalysisRow = typeof analyses.$inferInsert;

/** Текст на `chunks` шматків: речення різні, інакше шматки збіглися б хешами. */
function book(sentences: number): string {
  return Array.from(
    { length: sentences },
    (_, index) => `The engineer number ${index} had finished report ${index} before it started.`,
  ).join(' ');
}

/** Достатньо довгий документ — щоб батч узагалі мав сенс. */
const LONG = book(1400);

interface Behaviour {
  /** Хеші, які вже лежать у кеші `analyses`. */
  cached?: string[];
  /** Рядок батча, якщо він уже створений. */
  batch?: BatchRow | undefined;
  /** Куди складати записане в `analyses`. */
  written?: AnalysisRow[];
  /** Куди складати оновлення рядка батча. */
  updated?: Record<string, unknown>[];
  /** Куди складати створені рядки батчів. */
  batches?: Record<string, unknown>[];
}

/** Двійник drizzle: рівно ті ланцюжки, які робить batch.ts. */
function fakeDb(behaviour: Behaviour = {}): Db {
  const cached = new Set(behaviour.cached ?? []);

  const db = {
    select: (projection?: Record<string, unknown>) => ({
      from: (table: unknown) => {
        // Вибірка з `analyses` іде з проєкцією, з `analysis_batches` — без неї.
        if (table === analyses) {
          return {
            where: () =>
              Promise.resolve(
                [...cached].map((hash) =>
                  projection !== undefined && 'matches' in projection
                    ? { hash, matches: [{ from: 0, to: 0, tense: 'ps' }] }
                    : { hash },
                ),
              ),
          };
        }
        return {
          where: () => ({ limit: () => Promise.resolve(behaviour.batch ? [behaviour.batch] : []) }),
        };
      },
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoNothing: () => {
          if (table === analyses) behaviour.written?.push(values as AnalysisRow);
          else behaviour.batches?.push(values);
          return Promise.resolve();
        },
      }),
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          behaviour.updated?.push(values);
          return Promise.resolve();
        },
      }),
    }),
  };

  return db as unknown as Db;
}

function fakeClaude(): unknown {
  return { messages: { batches: { create: mocks.create, retrieve: mocks.retrieve, results: mocks.results } } };
}

/** Відповідь батча на один шматок — у тій формі, яку віддає SDK. */
function succeeded(customId: string, matches: { from: number; to: number; tense: string }[]) {
  return {
    custom_id: customId,
    result: { type: 'succeeded', message: { content: [{ type: 'tool_use', input: { matches } }] } },
  };
}

function resultsAre(items: unknown[]): void {
  mocks.results.mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      for (const item of items) yield item;
    },
  });
}

beforeEach(() => {
  for (const mock of Object.values(mocks)) mock.mockReset();
  mocks.getDb.mockReturnValue(fakeDb());
  mocks.getClaude.mockReturnValue(fakeClaude());
  mocks.create.mockResolvedValue({ id: 'msgbatch_test' });
});

describe('створення батча', () => {
  it('короткий текст батча не отримує: синхронний шлях упорається швидше', async () => {
    const short = book(20);
    expect(chunksOf(tokenize(short)).length).toBeLessThan(MIN_CHUNKS_FOR_BATCH);

    const state = await batchState(short);

    expect(state.status).toBe('skipped');
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it(`перші ${SYNC_CHUNKS} шматки в батч не йдуть: їх однаково прочитають одразу`, async () => {
    await batchState(LONG);

    const requests = mocks.create.mock.calls[0]?.[0]?.requests as { custom_id: string }[];
    const ids = requests.map((request) => request.custom_id);

    expect(ids).not.toContain('c0');
    expect(ids).not.toContain('c1');
    expect(ids).toContain(`c${SYNC_CHUNKS}`);
  });

  it('уже розібраний шматок удруге не оплачується', async () => {
    const tokens = tokenize(LONG);
    const chunks = chunksOf(tokens);
    const third = hashOf(chunkText(tokens, chunks[SYNC_CHUNKS]!));

    mocks.getDb.mockReturnValue(fakeDb({ cached: [third] }));
    await batchState(LONG);

    const requests = mocks.create.mock.calls[0]?.[0]?.requests as { custom_id: string }[];
    expect(requests.map((request) => request.custom_id)).not.toContain(`c${SYNC_CHUNKS}`);
  });

  it('без ключа батча не буває, і помилки теж', async () => {
    mocks.getClaude.mockReturnValue(null);

    const state = await batchState(LONG);

    expect(state.status).toBe('skipped');
  });

  it('gate не пускає — батч не створюється', async () => {
    const state = await batchState(LONG, { gate: () => false });

    expect(state.status).toBe('skipped');
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

describe('забирання результатів', () => {
  const tokens = tokenize(LONG);
  const chunks = chunksOf(tokens);
  const hashes = chunks.map((chunk) => hashOf(chunkText(tokens, chunk)));

  function pending(overrides: Partial<BatchRow> = {}): BatchRow {
    return {
      docHash: hashOf(LONG),
      batchId: 'msgbatch_test',
      chunkHashes: hashes,
      docText: LONG,
      ingestedAt: null,
      createdAt: new Date(),
      ...overrides,
    };
  }

  it('поки батч не завершився — нічого не забираємо', async () => {
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending() }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'in_progress' });

    const state = await batchState(LONG);

    expect(state.status).toBe('pending');
    expect(mocks.results).not.toHaveBeenCalled();
  });

  it('кладе розмітку під хеш ТОГО САМОГО шматка, що назвав custom_id', async () => {
    const written: AnalysisRow[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending(), written }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'ended' });
    resultsAre([succeeded(`c${SYNC_CHUNKS}`, [{ from: 0, to: 0, tense: 'ps' }])]);

    await batchState(LONG);

    expect(written).toHaveLength(1);
    expect(written[0]?.hash).toBe(hashes[SYNC_CHUNKS]);
  });

  it('невідомий custom_id тихо відкидається, а не псує чужий шматок', async () => {
    const written: AnalysisRow[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending(), written }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'ended' });
    resultsAre([succeeded('c9999', [{ from: 0, to: 0, tense: 'ps' }]), succeeded('хтозна', [])]);

    await batchState(LONG);

    expect(written).toHaveLength(0);
  });

  it('розбіжність хеша відкидає шматок: текст змінився після створення батча', async () => {
    const written: AnalysisRow[] = [];
    // Список хешів із батча не відповідає нинішньому текстові.
    const stale = pending({ chunkHashes: hashes.map(() => 'x'.repeat(64)) });
    mocks.getDb.mockReturnValue(fakeDb({ batch: stale, written }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'ended' });
    resultsAre([succeeded(`c${SYNC_CHUNKS}`, [{ from: 0, to: 0, tense: 'ps' }])]);

    await batchState(LONG);

    expect(written).toHaveLength(0);
  });

  it('невдалий шматок пропускається, решта записується', async () => {
    const written: AnalysisRow[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending(), written }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'ended' });
    resultsAre([
      { custom_id: `c${SYNC_CHUNKS}`, result: { type: 'errored', error: { type: 'api_error' } } },
      succeeded(`c${SYNC_CHUNKS + 1}`, [{ from: 0, to: 0, tense: 'ps' }]),
    ]);

    await batchState(LONG);

    expect(written.map((row) => row.hash)).toEqual([hashes[SYNC_CHUNKS + 1]]);
  });

  it('після забирання батч позначено, а текст документа прибрано', async () => {
    const updated: Record<string, unknown>[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending(), updated }));
    mocks.retrieve.mockResolvedValue({ processing_status: 'ended' });
    resultsAre([]);

    await batchState(LONG);

    expect(updated[0]?.docText).toBeNull();
    expect(updated[0]?.ingestedAt).toBeInstanceOf(Date);
  });

  it('забраний батч удруге не забирається', async () => {
    mocks.getDb.mockReturnValue(fakeDb({ batch: pending({ ingestedAt: new Date(), docText: null }) }));

    const state = await batchState(LONG);

    expect(state.status).toBe('ready');
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
});

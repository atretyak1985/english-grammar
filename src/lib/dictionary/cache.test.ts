import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as DbModule from '@/db';
import { dictionary } from '@/db/schema';

import type { DictionaryEntry, LookupResult } from './types';

/**
 * Ні мережі, ні бази: обидва шари підмінені. Перевіряємо саме те, за що
 * відповідає кеш — порядок шарів, TTL, витіснення і стійкість до падінь бази.
 */
const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  lookupWords: vi.fn(),
}));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');
  return { getDb: mocks.getDb, schema };
});

vi.mock('./wiktionary', () => ({
  lookupWords: mocks.lookupWords,
}));

const { HIT_TTL_MS, MEMORY_LIMIT, MISS_TTL_MS, clearMemoryCache, lookup, readCached } = await import('./cache');

type Db = NonNullable<ReturnType<typeof DbModule.getDb>>;
type Row = typeof dictionary.$inferSelect;

function entry(word: string, lemma = word): DictionaryEntry {
  return {
    word,
    lemma,
    ipa: 'ɪmˈpɹuːv',
    definitions: ['to make better'],
    examples: ['We improve the docs.'],
    quotes: [],
    audioUrl: null,
    source: 'wiktionary',
    license: 'CC BY-SA 4.0',
    sourceUrl: `https://en.wiktionary.org/wiki/${lemma}#English`,
  };
}

function row(word: string, overrides: Partial<Row> = {}): Row {
  return {
    word,
    lemma: word,
    ipa: 'ɪmˈpɹuːv',
    definitions: ['to make better'],
    examples: [],
    quotes: [],
    audioUrl: null,
    source: 'wiktionary',
    license: 'CC BY-SA 4.0',
    sourceUrl: `https://en.wiktionary.org/wiki/${word}#English`,
    miss: 0,
    fetchedAt: new Date(),
    ...overrides,
  };
}

interface DbBehaviour {
  rows?: Row[];
  readError?: boolean;
  writeError?: boolean;
  /** Куди складати те, що ручка спробувала записати. */
  written?: Row[];
}

/** Двійник drizzle: рівно ті ланцюжки викликів, які робить cache.ts. */
function fakeDb(behaviour: DbBehaviour = {}): Db {
  const db = {
    select: () => ({
      from: () => ({
        where: () =>
          behaviour.readError === true
            ? Promise.reject(new Error('база недоступна'))
            : Promise.resolve(behaviour.rows ?? []),
      }),
    }),
    insert: () => ({
      values: (values: Row) => ({
        onConflictDoUpdate: () => {
          if (behaviour.writeError === true) return Promise.reject(new Error('база не приймає запис'));
          behaviour.written?.push(values);
          return Promise.resolve();
        },
      }),
    }),
  };
  return db as unknown as Db;
}

function fromNetwork(entries: Record<string, LookupResult>): void {
  mocks.lookupWords.mockImplementation((words: string[]) => {
    const out = new Map<string, LookupResult>();
    for (const word of words) out.set(word, entries[word] ?? null);
    return Promise.resolve(out);
  });
}

beforeEach(() => {
  clearMemoryCache();
  mocks.getDb.mockReset();
  mocks.getDb.mockReturnValue(null);
  mocks.lookupWords.mockReset();
  fromNetwork({});
});

describe('lookup без бази', () => {

  it('другий той самий запит не виходить за памʼять процесу', async () => {
    fromNetwork({ improve: entry('improve') });
    await lookup(['improve']);

    const batch = await lookup(['improve']);

    expect(batch.cache).toBe('memory');
    expect(mocks.lookupWords).toHaveBeenCalledTimes(1);
  });
});

describe('lookup із базою', () => {
  it('свіжий рядок віддається без мережі', async () => {
    mocks.getDb.mockReturnValue(fakeDb({ rows: [row('improve')] }));

    const batch = await lookup(['improve']);

    expect(batch.cache).toBe('db');
    expect(batch.entries.get('improve')?.lemma).toBe('improve');
    expect(mocks.lookupWords).not.toHaveBeenCalled();
  });



  it('записує промах джерела рядком miss=1', async () => {
    const written: Row[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ written }));
    fromNetwork({});

    await lookup(['zzzq']);

    expect(written).toHaveLength(1);
    expect(written[0]?.miss).toBe(1);
    expect(written[0]?.sourceUrl).toContain('zzzq');
  });

  it('ігнорує рядок з чужим джерелом: атрибуція мусить бути правдива', async () => {
    mocks.getDb.mockReturnValue(fakeDb({ rows: [row('improve', { source: 'somewhere-else' })] }));
    fromNetwork({ improve: entry('improve') });

    const batch = await lookup(['improve']);

    expect(batch.cache).toBe('none');
    expect(mocks.lookupWords).toHaveBeenCalled();
  });

  it('порожня відповідь на цілий батч не кешується як промахи', async () => {
    const written: Row[] = [];
    mocks.getDb.mockReturnValue(fakeDb({ written }));
    fromNetwork({});

    await lookup(['improve', 'deploy']);

    expect(written).toHaveLength(0);
  });
});

describe('TTL', () => {
  it('протермінований hit (старший за 90 днів) перепитується', async () => {
    const stale = new Date(Date.now() - HIT_TTL_MS - 1000);
    mocks.getDb.mockReturnValue(fakeDb({ rows: [row('improve', { fetchedAt: stale })] }));
    fromNetwork({ improve: entry('improve') });

    const batch = await lookup(['improve']);

    expect(batch.cache).toBe('none');
    expect(mocks.lookupWords).toHaveBeenCalledWith(['improve']);
  });

  it('протермінований miss (старший за 7 днів) перепитується', async () => {
    const stale = new Date(Date.now() - MISS_TTL_MS - 1000);
    mocks.getDb.mockReturnValue(fakeDb({ rows: [row('zzzq', { miss: 1, fetchedAt: stale })] }));
    fromNetwork({ zzzq: entry('zzzq') });

    const batch = await lookup(['zzzq']);

    expect(batch.entries.get('zzzq')?.word).toBe('zzzq');
    expect(mocks.lookupWords).toHaveBeenCalledWith(['zzzq']);
  });

  it('свіжий miss у мережу не ходить', async () => {
    mocks.getDb.mockReturnValue(fakeDb({ rows: [row('zzzq', { miss: 1 })] }));

    const batch = await lookup(['zzzq']);

    expect(batch.entries.get('zzzq')).toBeNull();
    expect(mocks.lookupWords).not.toHaveBeenCalled();
  });

  it('свіжий miss з памʼяті теж не ходить у мережу', async () => {
    fromNetwork({});
    await lookup(['zzzq']);

    await lookup(['zzzq']);

    expect(mocks.lookupWords).toHaveBeenCalledTimes(1);
  });
});

describe('памʼять процесу', () => {
  it('витісняє найдавніше використане на записі понад ліміт', async () => {
    const words = Array.from({ length: MEMORY_LIMIT + 1 }, (_, index) => `w${index}`);
    fromNetwork(Object.fromEntries(words.map((word) => [word, entry(word)])));

    await lookup(words);

    // Найсвіжіше слово лишилося, найдавніше (w0) поїхало.
    expect((await readCached([`w${MEMORY_LIMIT}`])).size).toBe(1);
    expect((await readCached(['w0'])).size).toBe(0);
  });

  it('звертання оновлює давність: перечитане слово не витісняється першим', async () => {
    const words = Array.from({ length: MEMORY_LIMIT }, (_, index) => `w${index}`);
    fromNetwork(Object.fromEntries([...words, 'extra'].map((word) => [word, entry(word)])));
    await lookup(words);

    // Найдавніше — w0; читаємо його, щоб він став найсвіжішим.
    await readCached(['w0']);
    await lookup(['extra']);

    expect((await readCached(['w0'])).size).toBe(1);
    expect((await readCached(['w1'])).size).toBe(0);
  });
});

describe('gate перед мережею', () => {
  it('не пускає в мережу і повідомляє про це', async () => {
    fromNetwork({ improve: entry('improve') });

    const batch = await lookup(['improve'], { gate: () => false });

    expect(batch.throttled).toBe(true);
    expect(mocks.lookupWords).not.toHaveBeenCalled();
  });

  it('не питається, коли всі слова вже в кеші', async () => {
    fromNetwork({ improve: entry('improve') });
    await lookup(['improve']);

    const gate = vi.fn(() => true);
    const batch = await lookup(['improve'], { gate });

    expect(gate).not.toHaveBeenCalled();
    expect(batch.throttled).toBe(false);
  });
});

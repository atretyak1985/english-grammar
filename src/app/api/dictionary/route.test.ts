import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LookupBatch, LookupOptions } from '@/lib/dictionary/cache';
import { MISSES_PER_WINDOW, clearWindows } from '@/lib/dictionary/throttle';
import type { DictionaryEntry, LookupResult } from '@/lib/dictionary/types';

/**
 * Ручка перевіряється без кешу і без мережі: тут важливі нормалізація входу,
 * форма відповіді і те, що троттлінг рахує саме промахи.
 */
const mocks = vi.hoisted(() => ({ lookup: vi.fn() }));

vi.mock('@/lib/dictionary/cache', () => ({ lookup: mocks.lookup }));

const { POST } = await import('./route');

interface ShortShape {
  word: string;
  lemma: string;
  ipa: string | null;
  definition: string | null;
}

interface Body {
  entries?: Record<string, ShortShape>;
  cache?: string;
  error?: string;
}

function entry(word: string): DictionaryEntry {
  return {
    word,
    lemma: word,
    ipa: 'ɪmˈpɹuːv',
    definitions: ['to make better'],
    examples: ['We improve the docs.'],
    quotes: [],
    audioUrl: 'https://upload.wikimedia.org/improve.ogg',
    source: 'wiktionary',
    license: 'CC BY-SA 4.0',
    sourceUrl: `https://en.wiktionary.org/wiki/${word}#English`,
  };
}

/** Кеш, у якому ЖОДНОГО слова немає: кожне слово — промах, gate питається. */
function alwaysMisses(): void {
  mocks.lookup.mockImplementation((words: string[], options: LookupOptions = {}): Promise<LookupBatch> => {
    const entries = new Map<string, LookupResult>();
    if (options.gate !== undefined && !options.gate(words)) {
      return Promise.resolve({ entries, cache: 'memory', throttled: true });
    }
    for (const word of words) entries.set(word, entry(word));
    return Promise.resolve({ entries, cache: 'none', throttled: false });
  });
}

/** Кеш, у якому ВСЕ є: gate не питається, бо в мережу ніхто не йде. */
function alwaysHits(): void {
  mocks.lookup.mockImplementation((words: string[]): Promise<LookupBatch> => {
    const entries = new Map<string, LookupResult>();
    for (const word of words) entries.set(word, entry(word));
    return Promise.resolve({ entries, cache: 'memory', throttled: false });
  });
}

function post(words: unknown, ip = '198.51.100.1'): Promise<Response> {
  return POST(
    new Request('http://localhost/api/dictionary', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ words }),
    }),
  );
}

function requestedWords(): string[] {
  const call = mocks.lookup.mock.calls.at(-1);
  return (call?.[0] ?? []) as string[];
}

beforeEach(() => {
  clearWindows();
  mocks.lookup.mockReset();
  alwaysMisses();
});

describe('POST /api/dictionary', () => {

  it('віддає ОДНЕ означення, а не масив: examples і audioUrl — справа ручки на одне слово', async () => {
    const body = (await (await post(['improve'])).json()) as Body;

    const serialized = JSON.stringify(body);
    expect(serialized).toContain('"definition"');
    expect(serialized).not.toContain('"definitions"');
    expect(serialized).not.toContain('examples');
    expect(serialized).not.toContain('audioUrl');
  });

  it('ріже довге означення до 160 символів по межі слова', async () => {
    const long = `${'a'.repeat(120)} ${'b'.repeat(80)} tail`;
    mocks.lookup.mockImplementation((words: string[]): Promise<LookupBatch> => {
      const entries = new Map<string, LookupResult>();
      for (const word of words) entries.set(word, { ...entry(word), definitions: [long] });
      return Promise.resolve({ entries, cache: 'memory', throttled: false });
    });

    const body = (await (await post(['improve'])).json()) as Body;
    const definition = body.entries?.improve?.definition ?? '';

    expect(definition.length).toBeLessThanOrEqual(160);
    expect(definition.endsWith('…')).toBe(true);
  });

  it('тихо відкидає зіпсовані токени, а не відповідає 400', async () => {
    const response = await post(['Improve', ' deploy ', 'ok!', '', '123', 'x'.repeat(65), 'improve', 42]);

    expect(response.status).toBe(200);
    expect(requestedWords()).toEqual(['improve', 'deploy']);
  });

  it('обрізає список до 50 слів', async () => {
    const many = Array.from({ length: 60 }, (_, index) => `w${'a'.repeat(index + 1)}`);

    await post(many);

    expect(requestedWords()).toHaveLength(50);
  });

  it('порожній список не йде далі ручки', async () => {
    const body = (await (await post(['!!!', 5])).json()) as Body;

    expect(body.entries).toEqual({});
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it('нечитабельне тіло — 400 з українським текстом', async () => {
    const response = await POST(
      new Request('http://localhost/api/dictionary', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'не json',
      }),
    );
    const body = (await response.json()) as Body;

    expect(response.status).toBe(400);
    expect(body.error).toContain('список слів');
  });

  it('слова без статті у відповідь не потрапляють', async () => {
    mocks.lookup.mockImplementation((words: string[]): Promise<LookupBatch> => {
      const entries = new Map<string, LookupResult>(words.map((word) => [word, null]));
      return Promise.resolve({ entries, cache: 'none', throttled: false });
    });

    const body = (await (await post(['zzzq'])).json()) as Body;

    expect(body.entries).toEqual({});
  });
});

describe('троттлінг', () => {
  it(`${MISSES_PER_WINDOW + 1}-й промах з тієї самої адреси дає 429`, async () => {
    const ip = '198.51.100.10';
    for (let index = 0; index < MISSES_PER_WINDOW; index += 1) {
      const response = await post([`w${'a'.repeat(index + 1)}`], ip);
      expect(response.status).toBe(200);
    }

    const response = await post(['overflow'], ip);
    const body = (await response.json()) as Body;

    expect(response.status).toBe(429);
    expect(body.error).toContain('нових слів');
  });

  it(`${MISSES_PER_WINDOW + 1}-е ПОПАДАННЯ в кеш 429 не дає`, async () => {
    alwaysHits();
    const ip = '198.51.100.11';

    for (let index = 0; index < MISSES_PER_WINDOW + 1; index += 1) {
      const response = await post(['improve'], ip);
      expect(response.status).toBe(200);
    }
  });
});

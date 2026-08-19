import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LookupBatch } from '@/lib/dictionary/cache';
import { clearWindows } from '@/lib/dictionary/throttle';
import type { DictionaryEntry, LookupResult } from '@/lib/dictionary/types';

/** Кеш підмінений: перевіряємо повноту відповіді і поведінку на відсутньому слові. */
const mocks = vi.hoisted(() => ({ lookup: vi.fn() }));

vi.mock('@/lib/dictionary/cache', () => ({ lookup: mocks.lookup }));

const { GET } = await import('./route');

interface Body {
  entry?: DictionaryEntry;
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

function answer(entries: Record<string, LookupResult>): void {
  mocks.lookup.mockImplementation((words: string[]): Promise<LookupBatch> => {
    const found = new Map<string, LookupResult>();
    for (const word of words) {
      if (word in entries) found.set(word, entries[word] ?? null);
    }
    return Promise.resolve({ entries: found, cache: 'none', throttled: false });
  });
}

function get(word: string): Promise<Response> {
  return GET(new Request(`http://localhost/api/dictionary/${word}`), {
    params: Promise.resolve({ word }),
  });
}

beforeEach(() => {
  clearWindows();
  mocks.lookup.mockReset();
  answer({});
});

describe('GET /api/dictionary/[word]', () => {
  it('віддає повну статтю разом з посиланням на джерело', async () => {
    answer({ improve: entry('improve') });

    const response = await get('improve');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.entry?.definitions).toEqual(['to make better']);
    expect(body.entry?.examples).toEqual(['We improve the docs.']);
    expect(body.entry?.audioUrl).toContain('.ogg');
    expect(body.entry?.sourceUrl).toBe('https://en.wiktionary.org/wiki/improve#English');
    expect(body.entry?.license).toBe('CC BY-SA 4.0');
  });

  it('приводить слово до нижнього регістру', async () => {
    answer({ improve: entry('improve') });

    const response = await get('Improve');

    expect(response.status).toBe(200);
    expect(mocks.lookup).toHaveBeenCalledWith(['improve'], expect.anything());
  });

  it('кешований промах джерела — 404 з українським текстом', async () => {
    answer({ zzzq: null });

    const response = await get('zzzq');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(404);
    expect(body.error).toContain('Вікісловнику');
  });

  it('слово, якого мережа не дала, теж 404', async () => {
    answer({});

    expect((await get('improve')).status).toBe(404);
  });

  it('це не слово — 400, у джерело не ходимо', async () => {
    const response = await get('improve!!');

    expect(response.status).toBe(400);
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it('перевищення троттлінгу — 429', async () => {
    mocks.lookup.mockImplementation(
      (): Promise<LookupBatch> => Promise.resolve({ entries: new Map(), cache: 'memory', throttled: true }),
    );

    expect((await get('improve')).status).toBe(429);
  });
});

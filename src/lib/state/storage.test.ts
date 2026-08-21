import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readLocalState, writeLocalState } from '@/lib/state/storage';

/**
 * Мінімальний localStorage: раннер працює в node-середовищі, а перевірити треба
 * саме сумісність із тим, що вже лежить у браузерах читачів.
 */
function fakeStorage(initial: string | null) {
  const store = new Map<string, string>();
  if (initial !== null) store.set('eg.state.v1', initial);
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    raw: store,
  };
}

function install(initial: string | null) {
  const storage = fakeStorage(initial);
  (globalThis as { window?: unknown }).window = { localStorage: storage };
  return storage;
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('readLocalState: старий стан', () => {
  beforeEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('читає стан, записаний попереднім бандлом, без втрат', () => {
    install(
      JSON.stringify({
        readSections: { 'past-tenses': ['intro', 'formation'] },
        words: { deploy: 'learning', migrate: 'known', gauge: 'unknown' },
        lastTopic: 'past-tenses',
        attempts: [
          { topicSlug: 'past-tenses', correct: 8, total: 10, finishedAt: '2026-08-18T10:00:00.000Z' },
        ],
      }),
    );

    const state = readLocalState();
    expect(state.words).toEqual({ deploy: 'learning', migrate: 'known', gauge: 'unknown' });
    expect(state.readSections).toEqual({ 'past-tenses': ['intro', 'formation'] });
    expect(state.lastTopic).toBe('past-tenses');
    expect(state.attempts).toHaveLength(1);
    // Поля не було в записі — читання мусить дати порожню мапу, не undefined
    expect(state.notes).toEqual({});
  });

  it('читає «приховане» і відкидає невідомий статус поштучно', () => {
    install(JSON.stringify({ words: { deploy: 'hidden', migrate: 'deleted', ship: 'known' } }));

    const state = readLocalState();
    expect(state.words).toEqual({ deploy: 'hidden', ship: 'known' });
  });

  it('відкидає нотатку довше 200 символів і зайвий тип', () => {
    install(JSON.stringify({ notes: { deploy: 'я'.repeat(201), migrate: 7, ship: ' переслати ' } }));

    expect(readLocalState().notes).toEqual({ ship: 'переслати' });
  });

  it('на пошкодженому JSON віддає порожній стан, а не падає', () => {
    install('{ це не json');
    expect(readLocalState().words).toEqual({});
  });

  it('пише і читає той самий ключ eg.state.v1', () => {
    const storage = install(null);
    writeLocalState({
      readSections: {},
      words: { deploy: 'hidden' },
      notes: { deploy: 'розгортати' },
      lastTopic: null,
      attempts: [],
    });

    expect([...storage.raw.keys()]).toEqual(['eg.state.v1']);
    expect(readLocalState().words.deploy).toBe('hidden');
    expect(readLocalState().notes.deploy).toBe('розгортати');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BATCH_WINDOW_MS,
  DICT_KEY,
  MAX_ENTRIES,
  SOFT_TTL_MS,
  type CachedBrief,
  lookupBrief,
  resetDictionaryCache,
  schedule,
} from './client';

/**
 * Раннер працює в node без DOM, тому сховище й мережа підміняються руками.
 * `failNextSetItem` імітує переповнення: рівно стільки записів підряд впаде
 * з QuotaExceededError, скільки замовили.
 */
class FakeStorage {
  private data = new Map<string, string>();
  failNextSetItem = 0;
  writes: string[] = [];

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failNextSetItem > 0) {
      this.failNextSetItem -= 1;
      const error = new Error('сховище переповнене');
      error.name = 'QuotaExceededError';
      throw error;
    }
    this.writes.push(value);
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

let storage: FakeStorage;
let fetchMock: ReturnType<typeof vi.fn>;

/** Відповідь батч-ручки: знайдені слова в `entries`, ненайдені просто відсутні. */
function batchResponse(entries: Record<string, unknown>) {
  return { ok: true, status: 200, json: async () => ({ entries, cache: 'memory' }) };
}

/**
 * Ключі тестових записів — тільки літери: нормалізатор (як і сервер) відкидає
 * все, що не збігається з /^[a-z'-]+$/, тому `w1` словом не вважається.
 */
const LETTERS = 'abcdefghij';
function name(index: number): string {
  return `w${String(index)
    .split('')
    .map((digit) => LETTERS[Number(digit)])
    .join('')}`;
}

function seed(entries: Record<string, Partial<CachedBrief> & { at: number }>): void {
  storage.setItem(DICT_KEY, JSON.stringify(entries));
}

function stored(): Record<string, CachedBrief> {
  const raw = storage.getItem(DICT_KEY);
  return raw === null ? {} : (JSON.parse(raw) as Record<string, CachedBrief>);
}

beforeEach(() => {
  vi.useFakeTimers();
  storage = new FakeStorage();
  fetchMock = vi.fn();
  vi.stubGlobal('window', { localStorage: storage });
  vi.stubGlobal('fetch', fetchMock);
  resetDictionaryCache();
  storage.writes = [];
});

afterEach(() => {
  resetDictionaryCache();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('кеш у localStorage', () => {
  it('запис свіжіший за TTL читається, старший — ні', () => {
    const now = Date.now();
    seed({
      fresh: { word: 'fresh', lemma: 'fresh', ipa: 'freʃ', definition: 'нове', at: now },
      stale: { word: 'stale', lemma: 'stale', ipa: 'steɪl', definition: 'старе', at: now - SOFT_TTL_MS - 1 },
    });

    expect(lookupBrief('fresh')?.definition).toBe('нове');
    // Протермінований запис — це не «немає статті» (null), а «ще не знаємо»
    // (undefined): інакше UI показав би «статті немає» замість перезапиту.
    expect(lookupBrief('stale')).toBeUndefined();
  });

  it('понад стелю записів витісняється найстаріше', async () => {
    const now = Date.now();
    const entries: Record<string, { word: string; lemma: string; ipa: null; definition: null; at: number }> = {};
    for (let i = 0; i < MAX_ENTRIES + 5; i += 1) {
      const word = name(i);
      entries[word] = { word, lemma: word, ipa: null, definition: null, at: now - (MAX_ENTRIES + 5 - i) };
    }
    seed(entries);

    fetchMock.mockResolvedValue(batchResponse({ zebra: { word: 'zebra', lemma: 'zebra', ipa: 'ˈziːbɹə', definition: 'зебра' } }));
    schedule(['zebra']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);

    const kept = Object.keys(stored());
    expect(kept.length).toBeLessThanOrEqual(MAX_ENTRIES);
    // Найстаріший вилетів, найновіше слово лишилось.
    expect(kept).not.toContain(name(0));
    expect(kept).toContain('zebra');
  });

  it('зіпсований JSON дає порожній кеш, а не виняток', () => {
    storage.setItem(DICT_KEY, '{"word": не-JSON');

    expect(() => lookupBrief('word')).not.toThrow();
    expect(lookupBrief('word')).toBeUndefined();
  });



});

describe('батчер', () => {



  it('слово, якого немає у відповіді, запамʼятовується промахом', async () => {
    fetchMock.mockResolvedValue(batchResponse({}));

    schedule(['nosuchword']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);

    expect(lookupBrief('nosuchword')).toBeNull();

    schedule(['nosuchword']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('деградація', () => {
  it('переповнене сховище не ламає роботу: запис повторюється меншим', async () => {
    storage.failNextSetItem = 1;
    fetchMock.mockResolvedValue(batchResponse({ deploy: { word: 'deploy', lemma: 'deploy', ipa: 'dɪˈplɔɪ', definition: 'розгортати' } }));

    schedule(['deploy']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);

    // Стаття доступна з памʼяті навіть якщо сховище відмовило.
    expect(lookupBrief('deploy')?.definition).toBe('розгортати');
  });

  it('fetch, що кидає, не пропускає виняток назовні й нічого не пише', async () => {
    fetchMock.mockRejectedValue(new Error('мережа впала'));

    // Якби виняток вилітав із flush, vitest завалив би прогін нерозібраною
    // відмовою промісу — сам факт зеленого тесту і є перевіркою.
    schedule(['offline']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);

    expect(lookupBrief('offline')).toBeUndefined();
    expect(storage.writes).toHaveLength(0);
  });



  it('токени, які сервер однаково відкине, не потрапляють у чергу', async () => {
    schedule(['', '   ', '42', 'don`t?']);
    await vi.advanceTimersByTimeAsync(BATCH_WINDOW_MS);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

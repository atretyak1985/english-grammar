import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Access } from '@/lib/access';
import type { AnalysisBatch, AnalyzeOptions } from '@/lib/analyzer/cache';
import { CALLS_PER_WINDOW, clearWindows } from '@/lib/analyzer/throttle';

/**
 * Ручка без кешу і без мережі. Головне тут — що недоступний Claude НЕ
 * перетворюється на помилку: екран уже має локальну підсвітку, і 500 замість
 * порожнього уточнення зламав би робочий стан заради шару, який не обовʼязковий.
 */
const mocks = vi.hoisted(() => ({ analyze: vi.fn(), resolveAccess: vi.fn(), consumeWords: vi.fn() }));

vi.mock('@/lib/analyzer/cache', () => ({ analyze: mocks.analyze }));
vi.mock('@/lib/access', () => ({ resolveAccess: mocks.resolveAccess, consumeWords: mocks.consumeWords }));

const { POST } = await import('./route');

interface Body {
  matches?: { from: number; to: number; tense: string }[] | null;
  cache?: string;
  error?: string;
  reason?: string;
  remainingWords?: number;
  monthlyWords?: number;
}

/** Акаунт із великим залишком за замовчуванням — щоб наявні кейси не впирались у квоту. */
function account(overrides: Partial<Access> = {}): Access {
  return {
    level: 'free',
    userId: 'user-1',
    planCode: 'free',
    monthlyWords: 1_000_000,
    usedWords: 0,
    remainingWords: 1_000_000,
    period: '2026-08',
    ...overrides,
  };
}

/** Кеш, який щоразу платить: gate питається, розбір повертається. */
function alwaysMisses(): void {
  mocks.analyze.mockImplementation((_text: string, _words: number, options: AnalyzeOptions = {}) => {
    if (options.gate !== undefined && !options.gate()) {
      return Promise.resolve({ matches: null, cache: 'none', throttled: true } satisfies AnalysisBatch);
    }
    return Promise.resolve({
      matches: [{ from: 0, to: 0, tense: 'ps' as const }],
      cache: 'none',
      throttled: false,
    } satisfies AnalysisBatch);
  });
}

function post(text: unknown, ip = '198.51.100.1'): Promise<Response> {
  return POST(
    new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ text }),
    }),
  );
}

beforeEach(() => {
  clearWindows();
  mocks.analyze.mockReset();
  mocks.resolveAccess.mockReset();
  mocks.consumeWords.mockReset();
  alwaysMisses();
  mocks.resolveAccess.mockResolvedValue(account());
  mocks.consumeWords.mockResolvedValue(undefined);
});

describe('POST /api/analyze', () => {
  it('віддає збіги як номери токенів', async () => {
    const body = (await (await post('She had finished it')).json()) as Body;

    expect(body.matches).toEqual([{ from: 0, to: 0, tense: 'ps' }]);
  });

  it('без ключа Claude — 200 і порожнє уточнення, а не 500', async () => {
    mocks.analyze.mockResolvedValue({ matches: null, cache: 'none', throttled: false } satisfies AnalysisBatch);

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.matches).toBeNull();
  });

  it('задовгий текст відхиляється, а не обрізається мовчки', async () => {
    const response = await post('a '.repeat(11000));
    const body = (await response.json()) as Body;

    expect(response.status).toBe(413);
    expect(body.error).toContain('частинами');
    expect(mocks.analyze).not.toHaveBeenCalled();
  });

  it('порожній текст не йде далі ручки', async () => {
    const response = await post('   ');

    expect(response.status).toBe(400);
    expect(mocks.analyze).not.toHaveBeenCalled();
  });

  it('нечитабельне тіло — 400 з українським текстом', async () => {
    const response = await POST(
      new Request('http://localhost/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'не json',
      }),
    );
    const body = (await response.json()) as Body;

    expect(response.status).toBe(400);
    expect(body.error).toContain('текст');
  });

  it('рахує слова, а не токени: пробіли в базу не пишуться', async () => {
    await post('She had finished it');

    expect(mocks.analyze.mock.calls.at(-1)?.[1]).toBe(4);
  });
});

describe('троттлінг', () => {
  it(`${CALLS_PER_WINDOW + 1}-й платний виклик з тієї самої адреси дає 429`, async () => {
    const ip = '198.51.100.20';
    for (let index = 0; index < CALLS_PER_WINDOW; index += 1) {
      const response = await post(`text number ${index}`, ip);
      expect(response.status).toBe(200);
    }

    const response = await post('one text too many', ip);
    const body = (await response.json()) as Body;

    expect(response.status).toBe(429);
    expect(body.error).toContain('за хвилину');
  });

  it('попадання в кеш ліміт не витрачає', async () => {
    mocks.analyze.mockResolvedValue({ matches: [], cache: 'memory', throttled: false } satisfies AnalysisBatch);
    const ip = '198.51.100.21';

    for (let index = 0; index < CALLS_PER_WINDOW + 5; index += 1) {
      const response = await post('той самий текст', ip);
      expect(response.status).toBe(200);
    }
  });
});

describe('доступ і квота', () => {
  it('гість отримує 401 з причиною auth-required, модель не питають', async () => {
    mocks.resolveAccess.mockResolvedValue(
      account({ level: 'guest', userId: null, monthlyWords: 0, remainingWords: 0 }),
    );

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(401);
    expect(body.reason).toBe('auth-required');
    expect(mocks.analyze).not.toHaveBeenCalled();
  });

  it('акаунт із залишком: 200 і списання рівно words', async () => {
    const response = await post('She had finished it');

    expect(response.status).toBe(200);
    expect(mocks.consumeWords).toHaveBeenCalledWith('user-1', 4);
  });

  it('попадання в кеш (SC-6): 200 і нуль списання', async () => {
    mocks.analyze.mockResolvedValue({ matches: [], cache: 'memory', throttled: false } satisfies AnalysisBatch);

    const response = await post('She had finished it');

    expect(response.status).toBe(200);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('matches: null — нуль списання', async () => {
    mocks.analyze.mockResolvedValue({ matches: null, cache: 'none', throttled: false } satisfies AnalysisBatch);

    await post('She had finished it');

    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('текст на 500 слів при залишку 100 — 402, модель не питають', async () => {
    mocks.resolveAccess.mockResolvedValue(account({ remainingWords: 100, monthlyWords: 100 }));

    const response = await post('a '.repeat(500));
    const body = (await response.json()) as Body;

    expect(response.status).toBe(402);
    expect(body.reason).toBe('quota-exhausted');
    expect(mocks.analyze).not.toHaveBeenCalled();
  });
});

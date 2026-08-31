import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Access } from '@/lib/access';
import type { AnalysisBatch, AnalyzeOptions } from '@/lib/analyzer/cache';
import { CALLS_PER_WINDOW, clearWindows } from '@/lib/analyzer/throttle';

/**
 * Ручка без кешу і без мережі. Головне тут — що розмітка Є ЗАВЖДИ: двигун
 * детермінований і безкоштовний, а недоступна модель означає лише, що хиткі
 * збіги лишаються з прапорцем `uncertain`, — і що квота списується за слова,
 * які СПРАВДІ пішли моделі, а не за весь текст.
 */
const mocks = vi.hoisted(() => ({ analyze: vi.fn(), resolveAccess: vi.fn(), consumeWords: vi.fn() }));

vi.mock('@/lib/analyzer/cache', () => ({ analyze: mocks.analyze }));
vi.mock('@/lib/access', () => ({ resolveAccess: mocks.resolveAccess, consumeWords: mocks.consumeWords }));

const { POST } = await import('./route');

interface Body {
  matches?: { from: number; to: number; tense: string; rule?: string; uncertain?: boolean }[];
  cache?: string;
  error?: string;
  reason?: string;
}

/** Розмітка двигуна: хиткий збіг ще не перевірено, правило на місці. */
const DRAFT = [{ from: 0, to: 0, tense: 'ps' as const, rule: 'ps.v2', uncertain: true as const }];
/** Та сама розмітка після моделі: межа вирішена, прапорець знято. */
const REFINED = [{ from: 0, to: 0, tense: 'ps' as const, rule: 'ps.v2' }];

/** Ціна уточнення в словах, яку кеш називає gate. */
const MODEL_WORDS = 3;

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

/**
 * Кеш, який щоразу платить: gate питається в ціні уточнення; відмова повертає
 * двигунову розмітку без списання — рівно як справжній `analyze`.
 */
function alwaysMisses(): void {
  mocks.analyze.mockImplementation((_text: string, _words: number, options: AnalyzeOptions = {}) => {
    if (options.gate !== undefined && !options.gate(MODEL_WORDS)) {
      return Promise.resolve({ matches: DRAFT, cache: 'none', modelWords: 0 } satisfies AnalysisBatch);
    }
    return Promise.resolve({
      matches: REFINED,
      cache: 'none',
      modelWords: MODEL_WORDS,
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
  it('віддає збіги як номери токенів, з правилом двигуна', async () => {
    const body = (await (await post('She had finished it')).json()) as Body;

    expect(body.matches).toEqual(REFINED);
  });

  it('без ключа Claude — 200 і повна розмітка двигуна, а не порожнеча', async () => {
    // Без ключа кеш повертає двигунову розмітку: хиткий збіг лишається хитким.
    mocks.analyze.mockResolvedValue({ matches: DRAFT, cache: 'none', modelWords: 0 } satisfies AnalysisBatch);

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.matches).toEqual(DRAFT);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
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
  it(`${CALLS_PER_WINDOW + 1}-й платний виклик з тієї самої адреси — 200 з двигуном, без моделі`, async () => {
    const ip = '198.51.100.20';
    for (let index = 0; index < CALLS_PER_WINDOW; index += 1) {
      const response = await post(`text number ${index}`, ip);
      expect(response.status).toBe(200);
    }
    mocks.consumeWords.mockClear();

    // Ліміт вичерпано, але це не 429: розмітка двигуна — повний результат,
    // зникає лише платне уточнення, тому й списання немає.
    const response = await post('one text too many', ip);
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.matches).toEqual(DRAFT);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('попадання в кеш ліміт не витрачає', async () => {
    mocks.analyze.mockResolvedValue({ matches: REFINED, cache: 'memory', modelWords: 0 } satisfies AnalysisBatch);
    const ip = '198.51.100.21';

    for (let index = 0; index < CALLS_PER_WINDOW + 5; index += 1) {
      const response = await post('той самий текст', ip);
      expect(response.status).toBe(200);
    }
  });
});

describe('доступ і квота', () => {
  it('гість отримує 401 з причиною auth-required, розбір не запускається', async () => {
    mocks.resolveAccess.mockResolvedValue(
      account({ level: 'guest', userId: null, monthlyWords: 0, remainingWords: 0 }),
    );

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(401);
    expect(body.reason).toBe('auth-required');
    expect(mocks.analyze).not.toHaveBeenCalled();
  });

  it('списуються слова, надіслані моделі, а не слова тексту', async () => {
    const response = await post('She had finished it');

    expect(response.status).toBe(200);
    // Слів у тексті 4, але моделі пішло MODEL_WORDS — списання саме за них.
    expect(mocks.consumeWords).toHaveBeenCalledWith('user-1', MODEL_WORDS);
  });

  it('попадання в кеш: 200 і нуль списання', async () => {
    mocks.analyze.mockResolvedValue({ matches: REFINED, cache: 'memory', modelWords: 0 } satisfies AnalysisBatch);

    const response = await post('She had finished it');

    expect(response.status).toBe(200);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('залишок менший за ціну уточнення — 200 з двигуном, без моделі й списання', async () => {
    mocks.resolveAccess.mockResolvedValue(account({ remainingWords: MODEL_WORDS - 1, monthlyWords: 100 }));

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.matches).toEqual(DRAFT);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('залишку рівно вистачає — уточнення відбувається', async () => {
    mocks.resolveAccess.mockResolvedValue(account({ remainingWords: MODEL_WORDS, monthlyWords: 100 }));

    const response = await post('She had finished it');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(200);
    expect(body.matches).toEqual(REFINED);
    expect(mocks.consumeWords).toHaveBeenCalledWith('user-1', MODEL_WORDS);
  });
});

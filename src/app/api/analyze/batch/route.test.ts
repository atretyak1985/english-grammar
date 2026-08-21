import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Access } from '@/lib/access';
import type { BatchState } from '@/lib/analyzer/batch';

/**
 * Ручка без бази, без мережі й без реального `batchState` — тут перевіряється
 * не робота батча (це `analyzer/batch.test.ts`), а те, що саме ЦЯ ручка робить
 * навколо нього: закриває доступ гостю, звіряє квоту по всьому документу до
 * створення батча і списує слова рівно тоді, коли батч справді щойно створено,
 * а не при кожному опитуванні вже наявного.
 */
const mocks = vi.hoisted(() => ({ batchState: vi.fn(), resolveAccess: vi.fn(), consumeWords: vi.fn() }));

vi.mock('@/lib/analyzer/batch', () => ({ batchState: mocks.batchState }));
vi.mock('@/lib/access', () => ({ resolveAccess: mocks.resolveAccess, consumeWords: mocks.consumeWords }));

const { POST } = await import('./route');

interface Body {
  status?: string;
  error?: string;
  reason?: string;
  remainingWords?: number;
  monthlyWords?: number;
}

/** Акаунт із великим залишком за замовчуванням — щоб не впиратись у квоту випадково. */
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

function post(text: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/analyze/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    }),
  );
}

beforeEach(() => {
  mocks.batchState.mockReset();
  mocks.resolveAccess.mockReset();
  mocks.consumeWords.mockReset();
  mocks.resolveAccess.mockResolvedValue(account());
  mocks.consumeWords.mockResolvedValue(undefined);
  mocks.batchState.mockResolvedValue({ status: 'ready', ready: 0, total: 0, chunks: [] } satisfies BatchState);
});

describe('POST /api/analyze/batch', () => {
  it('гість отримує 401 з причиною auth-required, batchState не питають', async () => {
    mocks.resolveAccess.mockResolvedValue(
      account({ level: 'guest', userId: null, monthlyWords: 0, remainingWords: 0 }),
    );

    const response = await post('She had finished it before he arrived');
    const body = (await response.json()) as Body;

    expect(response.status).toBe(401);
    expect(body.reason).toBe('auth-required');
    expect(mocks.batchState).not.toHaveBeenCalled();
  });

  it('документ, що не влазить у залишок — 402, batchState не питають', async () => {
    mocks.resolveAccess.mockResolvedValue(account({ remainingWords: 100, monthlyWords: 100 }));

    const response = await post('a '.repeat(500));
    const body = (await response.json()) as Body;

    expect(response.status).toBe(402);
    expect(body.reason).toBe('quota-exhausted');
    expect(body.remainingWords).toBe(100);
    expect(body.monthlyWords).toBe(100);
    expect(mocks.batchState).not.toHaveBeenCalled();
  });

  it('повторне опитування вже створеного батча (created не виставлено) слів не списує', async () => {
    // `status: 'pending'` тут — саме той стан, який видає й опитування вже
    // наявного батча: без явного `created` це та сама пастка подвійного
    // списання, яку розділяє це поле.
    mocks.batchState.mockResolvedValue({ status: 'pending', ready: 3, total: 10, chunks: [] } satisfies BatchState);

    const response = await post('She had finished it before he arrived');

    expect(response.status).toBe(200);
    expect(mocks.consumeWords).not.toHaveBeenCalled();
  });

  it('щойно створений батч (created: true) списує слова рівно один раз', async () => {
    mocks.batchState.mockResolvedValue({
      status: 'pending',
      ready: 0,
      total: 10,
      chunks: [],
      created: true,
    } satisfies BatchState);

    await post('She had finished it before he arrived');

    expect(mocks.consumeWords).toHaveBeenCalledTimes(1);
    expect(mocks.consumeWords).toHaveBeenCalledWith('user-1', 7);
  });
});

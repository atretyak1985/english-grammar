import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Той самий стиль мокання, що й `src/lib/library/server.test.ts`: `@/db` і
 * `connection()` — заглушки, предмет тестів — деградація без бази й
 * резервна назва тарифу, а не механіка Next чи drizzle.
 */
const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');
  return { getDb: mocks.getDb, schema };
});

vi.mock('next/server', () => ({ connection: () => Promise.resolve() }));

const { listPlans } = await import('./plans');
const { DEFAULT_PLANS } = await import('./limits');

function dbReturning(result: Promise<unknown[]>) {
  return { select: () => ({ from: () => ({ where: () => ({ orderBy: () => result }) }) }) };
}

beforeEach(() => {
  mocks.getDb.mockReset();
  mocks.getDb.mockReturnValue(null);
});

describe('listPlans', () => {
  it('без бази падає на DEFAULT_PLANS', async () => {
    mocks.getDb.mockReturnValue(null);

    await expect(listPlans()).resolves.toEqual(DEFAULT_PLANS);
  });

  it('порожня таблиця (до першого засіву) теж падає на DEFAULT_PLANS', async () => {
    mocks.getDb.mockReturnValue(dbReturning(Promise.resolve([])));

    await expect(listPlans()).resolves.toEqual(DEFAULT_PLANS);
  });

  it('запит, що впав, падає на DEFAULT_PLANS і не кидає', async () => {
    mocks.getDb.mockReturnValue(dbReturning(Promise.reject(new Error('boom'))));

    await expect(listPlans()).resolves.toEqual(DEFAULT_PLANS);
  });

  it('рядок без title (nullable у схемі) падає на код', async () => {
    const rows = [
      {
        code: 'basic',
        title: null,
        monthlyWords: 100_000,
        priceCents: 0,
        currency: 'USD',
        active: 1,
        sortOrder: 1,
      },
    ];
    mocks.getDb.mockReturnValue(dbReturning(Promise.resolve(rows)));

    const plans = await listPlans();

    expect(plans).toEqual([
      {
        code: 'basic',
        title: 'basic',
        monthlyWords: 100_000,
        priceCents: 0,
        currency: 'USD',
        active: 1,
        sortOrder: 1,
      },
    ]);
  });
});

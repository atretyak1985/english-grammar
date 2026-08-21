import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `decideAccess` — чиста логіка резолвера на підставлених рядках, без бази.
 * `resolveAccess` перевіряється лише на випадок відсутньої бази: решту шляхів
 * (сесія, підписка, облік) вже покриває `decideAccess`, а мокати ще й drizzle
 * заради того самого дало б дублювання, а не новий сигнал.
 *
 * `@/lib/auth` замокано теж — не заради логіки, а тому що його модуль тягне
 * `next-auth`, який у vitest (Node, без Next.js runtime) не резолвить
 * `next/server`; це падіння середовища, а не резолвера доступу.
 */
const mocks = vi.hoisted(() => ({ getDb: vi.fn(), currentSession: vi.fn() }));

vi.mock('@/db', async () => {
  const schema = await vi.importActual<typeof import('@/db/schema')>('@/db/schema');
  return { getDb: mocks.getDb, schema };
});

vi.mock('@/lib/auth', () => ({ currentSession: mocks.currentSession }));

const { decideAccess, resolveAccess } = await import('./index');
const { DEFAULT_PLANS, FREE_MONTHLY_WORDS } = await import('./limits');

const NOW = new Date('2026-08-20T12:00:00.000Z');
const PERIOD = '2026-08';

beforeEach(() => {
  mocks.getDb.mockReset();
  mocks.getDb.mockReturnValue(null);
  mocks.currentSession.mockReset();
  mocks.currentSession.mockResolvedValue(null);
});

describe('decideAccess', () => {
  it('гість без сесії: нульовий ліміт, а не безкоштовний', () => {
    const access = decideAccess({ userId: null, subscription: null, plan: null, usedWords: 0, period: PERIOD, now: NOW });

    expect(access.level).toBe('guest');
    expect(access.userId).toBeNull();
    expect(access.monthlyWords).toBe(0);
    expect(access.remainingWords).toBe(0);
  });

  it('вільний акаунт без підписки дістає безкоштовний ліміт', () => {
    const access = decideAccess({ userId: 'u-free', subscription: null, plan: null, usedWords: 120, period: PERIOD, now: NOW });

    expect(access.level).toBe('free');
    expect(access.monthlyWords).toBe(FREE_MONTHLY_WORDS);
    expect(access.remainingWords).toBe(FREE_MONTHLY_WORDS - 120);
  });

  it('підписник з активною підпискою дістає ліміт свого тарифу', () => {
    const access = decideAccess({
      userId: 'u-pro',
      subscription: { planCode: 'pro', status: 'active', currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z') },
      plan: { code: 'pro', monthlyWords: 500_000 },
      usedWords: 1_000,
      period: PERIOD,
      now: NOW,
    });

    expect(access.level).toBe('subscriber');
    expect(access.planCode).toBe('pro');
    expect(access.monthlyWords).toBe(500_000);
    expect(access.remainingWords).toBe(500_000 - 1_000);
  });

  it('протермінована підписка (currentPeriodEnd у минулому) дає вільний рівень, не підписника', () => {
    const access = decideAccess({
      userId: 'u-expired',
      subscription: { planCode: 'pro', status: 'active', currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z') },
      plan: { code: 'pro', monthlyWords: 500_000 },
      usedWords: 0,
      period: PERIOD,
      now: NOW,
    });

    expect(access.level).toBe('free');
    expect(access.monthlyWords).toBe(FREE_MONTHLY_WORDS);
  });

  it('невідомий planCode (рядка в plans немає) падає на DEFAULT_PLANS, а не на нуль', () => {
    const basic = DEFAULT_PLANS.find((candidate) => candidate.code === 'basic')!;

    const access = decideAccess({
      userId: 'u-basic',
      subscription: { planCode: 'basic', status: 'active', currentPeriodEnd: new Date('2026-09-01T00:00:00.000Z') },
      plan: null,
      usedWords: 0,
      period: PERIOD,
      now: NOW,
    });

    expect(access.level).toBe('subscriber');
    expect(access.monthlyWords).toBe(basic.monthlyWords);
    expect(access.monthlyWords).toBeGreaterThan(0);
  });
});

describe('resolveAccess', () => {
  it('без бази повертає гостя і не кидає, навіть якщо сесія є', async () => {
    delete process.env.DATABASE_URL;
    mocks.currentSession.mockResolvedValue({ user: { id: 'u-nodb', email: 'u@example.com' } });
    mocks.getDb.mockReturnValue(null);

    const access = await resolveAccess();

    expect(access.level).toBe('guest');
    expect(access.userId).toBeNull();
    expect(access.monthlyWords).toBe(0);
  });
});

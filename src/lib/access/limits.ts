/**
 * Ліміти й тарифи як константи коду, а не рядки бази: застосунок мусить
 * рахувати безкоштовний ліміт навіть без `DATABASE_URL` (CONCEPT 8.1). Ті самі
 * значення засівають рядки таблиці `plans` (фаза 2) — одне джерело чисел, а не
 * дві копії, яким легко розійтися.
 */

/** Місячний ліміт слів для акаунта без підписки. */
export const FREE_MONTHLY_WORDS = 5000;

/** Форма рядка `plans` — поля збігаються з `src/db/schema.ts` буквально. */
export interface DefaultPlan {
  code: string;
  title: string;
  monthlyWords: number;
  priceCents: number;
  currency: string;
  active: number;
  sortOrder: number;
}

export const DEFAULT_PLANS: readonly DefaultPlan[] = [
  {
    code: 'free',
    title: 'Free',
    monthlyWords: FREE_MONTHLY_WORDS,
    priceCents: 0,
    currency: 'USD',
    active: 1,
    sortOrder: 0,
  },
  {
    code: 'basic',
    title: 'Basic',
    monthlyWords: 100_000,
    priceCents: 0,
    currency: 'USD',
    active: 1,
    sortOrder: 1,
  },
  {
    code: 'pro',
    title: 'Pro',
    monthlyWords: 500_000,
    priceCents: 0,
    currency: 'USD',
    active: 1,
    sortOrder: 2,
  },
];

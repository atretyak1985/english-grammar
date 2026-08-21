import { asc, eq } from 'drizzle-orm';
import { connection } from 'next/server';

import { getDb, schema } from '@/db';

import { DEFAULT_PLANS, type DefaultPlan } from './limits';

/**
 * Тарифи для `/pricing`: рядки `plans` (`active = 1`, за `sortOrder`), а якщо
 * бази немає, запит упав чи таблиця ще не засіяна — падіння на `DEFAULT_PLANS`.
 * Вітрина тарифів мусить рендеритись завжди, навіть без жодного `make db-seed`.
 *
 * `connection()` — першим рядком, з тієї самої причини, що й у
 * `src/lib/library/server.ts`: без нього гілка «бази нема» не торкається
 * запиту, і Next вважає `/pricing` статичною сторінкою та запікає її під час
 * збірки, коли `DATABASE_URL` ще не задано.
 */
export async function listPlans(): Promise<DefaultPlan[]> {
  await connection();

  const db = getDb();
  if (db === null) return [...DEFAULT_PLANS];

  try {
    const rows = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.active, 1))
      .orderBy(asc(schema.plans.sortOrder));

    if (rows.length === 0) return [...DEFAULT_PLANS];

    return rows.map((row) => ({
      code: row.code,
      // `title` у схемі — nullable (адаптер тарифу без назви), код лишається
      // читним резервом, а не порожнім рядком у вітрині.
      title: row.title ?? row.code,
      monthlyWords: row.monthlyWords,
      priceCents: row.priceCents,
      currency: row.currency,
      active: row.active,
      sortOrder: row.sortOrder,
    }));
  } catch (error) {
    console.warn('listPlans: запит до бази не вдався', error);
    return [...DEFAULT_PLANS];
  }
}

import { and, eq, sql } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { currentSession } from '@/lib/auth';

import { DEFAULT_PLANS, FREE_MONTHLY_WORDS } from './limits';

/**
 * Резолвер рівня доступу: скільком словам аналізу має право користувач цього
 * місяця. Використовується і ручками, і сторінками, тому логіка тут одна —
 * замість того, щоб кожен викликач сам зводив сесію, підписку й облік.
 */

export type AccessLevel = 'guest' | 'free' | 'subscriber';

export interface Access {
  level: AccessLevel;
  userId: string | null;
  planCode: string;
  /** 0 для гостя — API аналізатора йому закритий повністю, а не обмежений. */
  monthlyWords: number;
  usedWords: number;
  remainingWords: number;
  /** `YYYY-MM` поточного місяця UTC */
  period: string;
}

/** `YYYY-MM` — той самий формат, що зберігається в `analysisUsage.period`. */
function currentPeriod(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export interface DecideAccessInput {
  userId: string | null;
  subscription: { planCode: string; status: string; currentPeriodEnd: Date } | null;
  plan: { code: string; monthlyWords: number } | null;
  usedWords: number;
  period: string;
  now: Date;
}

/**
 * Чиста частина резолвера: рішення «який рівень і який ліміт» на підставлених
 * рядках, без бази і без сесії. Винесено окремо, щоб тест перевіряв саме цю
 * логіку (`index.test.ts`), а не мок бази.
 */
export function decideAccess(input: DecideAccessInput): Access {
  const { userId, subscription, plan, usedWords, period, now } = input;

  if (userId === null) {
    return {
      level: 'guest',
      userId: null,
      planCode: 'guest',
      monthlyWords: 0,
      usedWords: 0,
      remainingWords: 0,
      period,
    };
  }

  const hasActiveSubscription =
    subscription !== null && subscription.status === 'active' && subscription.currentPeriodEnd.getTime() > now.getTime();

  if (!hasActiveSubscription) {
    return {
      level: 'free',
      userId,
      planCode: 'free',
      monthlyWords: FREE_MONTHLY_WORDS,
      usedWords,
      remainingWords: Math.max(0, FREE_MONTHLY_WORDS - usedWords),
      period,
    };
  }

  const planCode = subscription.planCode;
  // Рядок тарифу може бути відсутнім (видалили з `plans`, а підписка лишилась):
  // тоді беремо ліміт з константи того самого коду, а якщо й там нема — на
  // безкоштовний ліміт, а не на нуль, щоб платний акаунт не лишився без слів.
  const monthlyWords =
    plan?.monthlyWords ?? DEFAULT_PLANS.find((candidate) => candidate.code === planCode)?.monthlyWords ?? FREE_MONTHLY_WORDS;

  return {
    level: 'subscriber',
    userId,
    planCode,
    monthlyWords,
    usedWords,
    remainingWords: Math.max(0, monthlyWords - usedWords),
    period,
  };
}

/**
 * Доступ поточного відвідувача. Ніколи не кидає — без бази чи без сесії
 * застосунок лишається робочим анонімно, як і `currentSession()`.
 */
export async function resolveAccess(): Promise<Access> {
  const now = new Date();
  const period = currentPeriod(now);

  try {
    const session = await currentSession();
    const userId = session?.user?.id ?? null;
    if (userId === null) {
      return decideAccess({ userId: null, subscription: null, plan: null, usedWords: 0, period, now });
    }

    const db = getDb();
    if (db === null) {
      return decideAccess({ userId: null, subscription: null, plan: null, usedWords: 0, period, now });
    }

    const [subscriptionRows, usageRows] = await Promise.all([
      db.select().from(schema.subscriptions).where(eq(schema.subscriptions.userId, userId)),
      db
        .select()
        .from(schema.analysisUsage)
        .where(and(eq(schema.analysisUsage.userId, userId), eq(schema.analysisUsage.period, period))),
    ]);

    const subscriptionRow = subscriptionRows[0] ?? null;
    const usedWords = usageRows[0]?.words ?? 0;

    let planRow: { code: string; monthlyWords: number } | null = null;
    if (subscriptionRow !== null) {
      const rows = await db.select().from(schema.plans).where(eq(schema.plans.code, subscriptionRow.planCode));
      planRow = rows[0] ?? null;
    }

    return decideAccess({
      userId,
      subscription:
        subscriptionRow === null
          ? null
          : {
              planCode: subscriptionRow.planCode,
              status: subscriptionRow.status,
              currentPeriodEnd: subscriptionRow.currentPeriodEnd,
            },
      plan: planRow === null ? null : { code: planRow.code, monthlyWords: planRow.monthlyWords },
      usedWords,
      period,
      now,
    });
  } catch (error) {
    console.warn('resolveAccess: запит до бази не вдався, працюємо як гість', error);
    return decideAccess({ userId: null, subscription: null, plan: null, usedWords: 0, period, now });
  }
}

/**
 * Списує витрачені слова за поточний місяць. Один upsert з інкрементом у SQL
 * (`words = analysisUsage.words + $n`), без попереднього `SELECT` — гонка двох
 * одночасних запитів того самого користувача просто складається в базі, а не
 * втрачається в read-modify-write у Node.
 */
export async function consumeWords(userId: string, words: number): Promise<void> {
  const db = getDb();
  if (db === null) return;

  const period = currentPeriod(new Date());
  const now = new Date();

  try {
    await db
      .insert(schema.analysisUsage)
      .values({ userId, period, words, calls: 1, updatedAt: now })
      .onConflictDoUpdate({
        target: [schema.analysisUsage.userId, schema.analysisUsage.period],
        set: {
          words: sql`${schema.analysisUsage.words} + ${words}`,
          calls: sql`${schema.analysisUsage.calls} + 1`,
          updatedAt: now,
        },
      });
  } catch (error) {
    console.warn('consumeWords: запис обліку не вдався', error);
  }
}

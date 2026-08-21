/**
 * Ручна активація тарифу (фаза 5): платіжного провайдера ще немає — це окрема
 * епіка, а зараз хтось із команди підіймає ліміт користувачу вручну командою
 * `make grant-plan EMAIL=... PLAN=basic MONTHS=1`.
 *
 * Форма файлу — та сама, що в `scripts/seed-library.mts`: `DATABASE_URL` через
 * `process.loadEnvFile`, пул `pg` + `drizzle`, відносні шляхи імпортів (`tsx`
 * виконує цей файл поза Next.js, і `tsconfig.json` для нього не діє напряму),
 * `pool.end()` у `finally`.
 */
import { eq } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DEFAULT_PLANS } from '../src/lib/access/limits.ts';
import * as schema from '../src/db/schema.ts';

type Db = NodePgDatabase<typeof schema>;

interface Args {
  email: string;
  planCode: string;
  months: number;
}

/** `DATABASE_URL` так само, як `scripts/seed-library.mts`: `.env.local`/`.env`, оболонка сильніша за файл. */
function loadDatabaseUrl(): string {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Файла немає — нормально: змінну можна передати й через оболонку.
    }
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Немає DATABASE_URL. Додайте його в .env.local або передайте у виклику:\n' +
        '  DATABASE_URL=postgres://eg:eg@localhost:5433/english_grammar EMAIL=you@example.com PLAN=basic npm run grant-plan',
    );
  }
  return url;
}

/**
 * Аргументи з оточення, а не з argv — так само, як `make grant-plan
 * EMAIL=... PLAN=basic MONTHS=1` викликає `npm run grant-plan` з довкіллям.
 * Перевірка тарифу тут же, до підключення до бази: невідомий код — це
 * помилка виклику, а не питання до бази.
 */
function parseArgs(): Args {
  const email = process.env.EMAIL;
  if (!email) {
    throw new Error('Немає EMAIL. Виклик: EMAIL=you@example.com PLAN=basic MONTHS=1 npm run grant-plan');
  }

  const availableCodes = DEFAULT_PLANS.map((plan) => plan.code).join(', ');

  const planCode = process.env.PLAN;
  if (!planCode) {
    throw new Error(`Немає PLAN. Доступні коди: ${availableCodes}`);
  }
  if (!DEFAULT_PLANS.some((plan) => plan.code === planCode)) {
    throw new Error(`Невідомий тариф "${planCode}". Доступні коди: ${availableCodes}`);
  }

  // `||`, а не `??`: `make grant-plan` без MONTHS передає порожній рядок
  // (`MONTHS='$(MONTHS)'`), а не відсутню змінну — і той порожній рядок мусить
  // означати типове значення, а не помилку "не ціле число".
  const monthsRaw = process.env.MONTHS || '1';
  const months = Number(monthsRaw);
  if (!Number.isInteger(months) || months <= 0) {
    throw new Error(`MONTHS мусить бути цілим числом > 0, отримано "${monthsRaw}"`);
  }

  return { email, planCode, months };
}

/** `null`, якщо користувача з такою поштою немає — виклик НЕ створює користувача сам. */
async function findUserId(db: Db, email: string): Promise<string | null> {
  const rows = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
  return rows[0]?.id ?? null;
}

/** Upsert по `userId` (PK таблиці `subscriptions`) — один активний тариф на користувача. */
async function grantPlan(
  db: Db,
  userId: string,
  planCode: string,
  months: number,
): Promise<{ start: Date; end: Date }> {
  const start = new Date();
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + months);

  const values = {
    userId,
    planCode,
    status: 'active',
    currentPeriodStart: start,
    currentPeriodEnd: end,
    activatedVia: 'manual',
    note: 'granted via make grant-plan',
  };

  await db
    .insert(schema.subscriptions)
    .values(values)
    .onConflictDoUpdate({
      target: schema.subscriptions.userId,
      set: {
        planCode: values.planCode,
        status: values.status,
        currentPeriodStart: values.currentPeriodStart,
        currentPeriodEnd: values.currentPeriodEnd,
        activatedVia: values.activatedVia,
        note: values.note,
      },
    });

  return { start, end };
}

async function main(): Promise<void> {
  const { email, planCode, months } = parseArgs();
  const plan = DEFAULT_PLANS.find((candidate) => candidate.code === planCode);
  if (!plan) throw new Error(`unreachable: "${planCode}" уже перевірено в parseArgs`);

  const url = loadDatabaseUrl();
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('host=/cloudsql') || url.includes('localhost') ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
  const db = drizzle(pool, { schema });

  try {
    const userId = await findUserId(db, email);
    if (userId === null) {
      console.error(`Користувача з поштою "${email}" не знайдено. Він має спершу увійти хоча б раз — скрипт не створює акаунт.`);
      process.exitCode = 1;
      return;
    }

    const { end } = await grantPlan(db, userId, planCode, months);

    console.log('---');
    console.log(`пошта: ${email}`);
    console.log(`тариф: ${plan.title} (${plan.code})`);
    console.log(`новий місячний ліміт: ${plan.monthlyWords.toLocaleString('uk-UA')} слів`);
    console.log(`діє до: ${end.toISOString().slice(0, 10)}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

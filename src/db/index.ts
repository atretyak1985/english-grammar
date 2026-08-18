import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from '@/db/schema';

/**
 * Підключення до Postgres. Створюється лениво і лише якщо задано DATABASE_URL —
 * без бази застосунок мусить працювати анонімно, як зараз (CONCEPT 8.1).
 */
let cached: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> | null {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  const pool = new Pool({
    connectionString: url,
    // Cloud SQL через Unix-сокет не потребує SSL; для зовнішніх адрес — потребує.
    ssl: url.includes('host=/cloudsql') || url.includes('localhost') ? undefined : { rejectUnauthorized: false },
    max: 5,
  });

  cached = drizzle(pool, { schema });
  return cached;
}

export { schema };

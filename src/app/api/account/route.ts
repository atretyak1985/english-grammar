import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb, schema } from '@/db';
import { currentSession } from '@/lib/auth';

/**
 * Видалення акаунта (CONCEPT 8.4). Прогрес, слова, тексти й спроби
 * прив'язані до користувача каскадом, тому достатньо видалити його рядок.
 */
export async function DELETE() {
  const session = await currentSession();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: 'no database' }, { status: 503 });

  await db.delete(schema.users).where(eq(schema.users.id, userId));
  return NextResponse.json({ ok: true });
}

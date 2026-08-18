import { and, eq } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { currentSession } from '@/lib/auth';
import { EMPTY_STATE, type UserState, type WordStatus } from '@/types/state';

/** Читає стан користувача з бази у той самий формат, що живе в localStorage. */
export async function loadUserState(userId: string): Promise<UserState> {
  const db = getDb();
  if (!db) return EMPTY_STATE;

  const [progressRows, wordRows, attemptRows, settingsRows] = await Promise.all([
    db.select().from(schema.progress).where(eq(schema.progress.userId, userId)),
    db.select().from(schema.words).where(eq(schema.words.userId, userId)),
    db.select().from(schema.quizAttempts).where(eq(schema.quizAttempts.userId, userId)),
    db.select().from(schema.settings).where(eq(schema.settings.userId, userId)),
  ]);

  const readSections: Record<string, string[]> = {};
  for (const row of progressRows) {
    const list = readSections[row.topicSlug] ?? [];
    list.push(row.sectionId);
    readSections[row.topicSlug] = list;
  }

  const words: Record<string, WordStatus> = {};
  for (const row of wordRows) {
    words[row.word] = row.status as WordStatus;
  }

  return {
    readSections,
    words,
    lastTopic: settingsRows[0]?.lastTopic ?? null,
    attempts: attemptRows.map((row) => ({
      topicSlug: row.topicSlug,
      correct: row.correct,
      total: row.total,
      finishedAt: row.finishedAt.toISOString(),
    })),
  };
}

/** Записує стан користувача. Викликається лише після злиття на клієнті. */
export async function saveUserState(userId: string, state: UserState): Promise<void> {
  const db = getDb();
  if (!db) return;

  const progressRows = Object.entries(state.readSections).flatMap(([topicSlug, sectionIds]) =>
    sectionIds.map((sectionId) => ({ userId, topicSlug, sectionId })),
  );

  const wordRows = Object.entries(state.words).map(([word, status]) => ({
    userId,
    word,
    status,
    updatedAt: new Date(),
  }));

  await db.transaction(async (tx) => {
    await tx.delete(schema.progress).where(eq(schema.progress.userId, userId));
    if (progressRows.length > 0) {
      await tx.insert(schema.progress).values(progressRows).onConflictDoNothing();
    }

    for (const row of wordRows) {
      await tx
        .insert(schema.words)
        .values(row)
        .onConflictDoUpdate({
          target: [schema.words.userId, schema.words.word],
          set: { status: row.status, updatedAt: row.updatedAt },
        });
    }

    for (const attempt of state.attempts) {
      const finishedAt = new Date(attempt.finishedAt);
      const existing = await tx
        .select({ id: schema.quizAttempts.id })
        .from(schema.quizAttempts)
        .where(
          and(
            eq(schema.quizAttempts.userId, userId),
            eq(schema.quizAttempts.topicSlug, attempt.topicSlug),
            eq(schema.quizAttempts.finishedAt, finishedAt),
          ),
        );
      if (existing.length === 0) {
        await tx.insert(schema.quizAttempts).values({
          userId,
          topicSlug: attempt.topicSlug,
          correct: attempt.correct,
          total: attempt.total,
          finishedAt,
        });
      }
    }

    await tx
      .insert(schema.settings)
      .values({ userId, lastTopic: state.lastTopic })
      .onConflictDoUpdate({
        target: schema.settings.userId,
        set: { lastTopic: state.lastTopic },
      });
  });
}

/** Що передати в клієнтський провайдер стану на першому рендері. */
export async function loadShellState(): Promise<{
  signedIn: boolean;
  serverState: UserState | null;
  email: string | null;
}> {
  const session = await currentSession();
  const userId = session?.user?.id;
  if (!userId) return { signedIn: false, serverState: null, email: null };

  return {
    signedIn: true,
    serverState: await loadUserState(userId),
    email: session.user?.email ?? null,
  };
}

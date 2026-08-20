import { NextResponse } from 'next/server';

import { currentSession } from '@/lib/auth';
import { loadUserState, saveUserState } from '@/lib/state/server';
import { parseUserState } from '@/lib/state/validate';
import { mergeState } from '@/types/state';

/**
 * Синхронізація стану користувача. Клієнт присилає весь свій стан,
 * сервер зливає його з тим, що вже є, і зберігає результат —
 * так вхід з другого пристрою нічого не втрачає (CONCEPT 8.1).
 */
export async function GET() {
  const session = await currentSession();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  return NextResponse.json(await loadUserState(userId));
}

export async function PUT(request: Request) {
  const session = await currentSession();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const incoming = parseUserState(await request.json());
  const merged = mergeState(await loadUserState(userId), incoming);
  await saveUserState(userId, merged);

  return NextResponse.json(merged);
}

import { NextResponse } from 'next/server';

import { findExamples } from '@/lib/drills/examples';
import { listStoryBodies } from '@/lib/library/server';

export const runtime = 'nodejs';

/** Ті самі межі, що в словниковій ручці: більше слів за раз картки не показують. */
const MAX_WORDS = 50;
const MAX_WORD_LENGTH = 64;
const WORD_PATTERN = /^[a-z'-]+$/;

function normalizeWords(payload: unknown): string[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const { words } = payload as { words?: unknown };
  if (!Array.isArray(words)) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of words) {
    if (typeof raw !== 'string') continue;
    const word = raw.trim().toLowerCase();
    if (word.length === 0 || word.length > MAX_WORD_LENGTH || !WORD_PATTERN.test(word)) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push(word);
    if (out.length === MAX_WORDS) break;
  }
  return out;
}

/**
 * Приклади ужитку слів у оповіданнях бібліотеки — для карток слів у
 * тренуванні. Слова приходять з браузера, бо статуси живуть у localStorage
 * і серверу невідомі до запиту.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Не вдалося прочитати список слів із запиту.' }, { status: 400 });
  }

  const words = normalizeWords(payload);
  if (words.length === 0) return NextResponse.json({ examples: {} });

  const sources = await listStoryBodies();
  return NextResponse.json({ examples: findExamples(sources, words) });
}

import { NextResponse } from 'next/server';

import { lookup } from '@/lib/dictionary/cache';
import { clientIp, reserveMisses } from '@/lib/dictionary/throttle';

/**
 * Повна стаття на одне слово: те, що показує картка слова — визначення,
 * приклади, аудіо і посилання на джерело для атрибуції (SC-13).
 *
 * Сесія не потрібна, як і в батчі: словник працює анонімно.
 */
export const runtime = 'nodejs';

const MAX_WORD_LENGTH = 64;
const WORD_PATTERN = /^[a-z'-]+$/;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request, context: { params: Promise<{ word: string }> }) {
  // У Next.js 16 params — проміс: сегмент може бути відомий лише під час запиту.
  const { word: raw } = await context.params;
  const word = decodeURIComponent(raw).trim().toLowerCase();

  if (word.length === 0 || word.length > MAX_WORD_LENGTH || !WORD_PATTERN.test(word)) {
    return fail('Це не схоже на слово, яке шукають у словнику.', 400);
  }

  const ip = clientIp(request);
  const batch = await lookup([word], { gate: (missing) => reserveMisses(ip, missing.length) });
  if (batch.throttled) {
    return fail('Зараз надто багато нових слів підряд. Спробуйте за хвилину.', 429);
  }

  const entry = batch.entries.get(word);
  if (entry === undefined || entry === null) {
    return fail('У Вікісловнику немає статті про це слово.', 404);
  }

  return NextResponse.json({ entry });
}

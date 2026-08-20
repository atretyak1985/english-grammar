import { NextResponse } from 'next/server';

import { batchState } from '@/lib/analyzer/batch';
import { reserveCall } from '@/lib/analyzer/throttle';
import { clientIp } from '@/lib/dictionary/throttle';

/**
 * Батч на цілий документ: створити, якщо його ще немає, забрати результати,
 * якщо вже готові, і сказати клієнтові, на чому стоїмо.
 *
 * Ручка опитувальна, і це навмисно. Batch API асинхронний, а фонового воркера
 * в застосунку немає й не потрібно: результат забирає той самий запит, який і
 * так приходить від читача. Поки батч у роботі, коштує це один `retrieve`.
 *
 * Відповідь ніколи не є умовою роботи екрана: читалка живе на локальній
 * розмітці й синхронному розборі поточної сторінки, а батч лише прибирає
 * очікування наперед.
 */
export const runtime = 'nodejs';

/**
 * Стеля на документ. Це вже книжка, а не сторінка, тому межа зовсім інша, ніж
 * у синхронної ручки — але вона є: батч на мільйон слів створюється однією
 * командою і коштує як усе інше разом.
 */
const MAX_CHARS = 1_500_000;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail('Не вдалося прочитати текст із запиту.', 400);
  }

  const { text } = (payload ?? {}) as { text?: unknown };
  if (typeof text !== 'string' || text.trim().length === 0) {
    return fail('Порожній текст: розбирати нічого.', 400);
  }

  if (text.length > MAX_CHARS) {
    return fail(`Документ завеликий: ${text.length} символів проти ${MAX_CHARS}.`, 413);
  }

  try {
    const state = await batchState(text, { gate: () => reserveCall(clientIp(request)) });
    return NextResponse.json(state);
  } catch (error) {
    // Недоступний батч — не поломка екрана, а лише відсутнє прискорення:
    // сторінки й далі розбиратимуться синхронно, по одній.
    console.warn('analyze batch: не вдалося', error);
    return NextResponse.json({ status: 'skipped', ready: 0, total: 0 });
  }
}

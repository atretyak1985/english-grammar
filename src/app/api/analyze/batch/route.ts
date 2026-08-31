import { NextResponse } from 'next/server';

import { resolveAccess, consumeWords } from '@/lib/access';
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
 * очікування наперед. Моделі в батчі йдуть ЛИШЕ спірні речення — певні шматки
 * двигун кешує вже при створенні, безкоштовно.
 */
export const runtime = 'nodejs';

/**
 * Стеля на документ. Це вже книжка, а не сторінка, тому межа зовсім інша, ніж
 * у синхронної ручки — але вона є: батч на мільйон слів створюється однією
 * командою і коштує як усе інше разом.
 */
const MAX_CHARS = 1_500_000;

function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  // Той самий гвард, що й у синхронної ручки, і з тієї самої причини: без
  // акаунта нема кому списати слова за уточнення моделлю.
  const access = await resolveAccess();
  if (access.level === 'guest') {
    return fail(
      'Розбір тексту доступний лише зі входом. Бібліотека вже розібрана і доступна без входу.',
      401,
      { reason: 'auth-required' },
    );
  }

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
    // Квота перевіряється в ціні батча — словах спірних речень, а не всього
    // документа, — і рівно перед його створенням: або уточнення вкладається в
    // залишок цілком, або батча не буде. Часткового батча на «скільки влізло»
    // тут нема, а розмітку двигуна читач отримує в будь-якому разі.
    const state = await batchState(text, {
      gate: (modelWords) => modelWords <= access.remainingWords && reserveCall(clientIp(request)),
    });

    // Рахунок виникає рівно в момент СТВОРЕННЯ батча (`state.created`), а не
    // при кожному опитуванні, і рівно на слова, надіслані моделі.
    if (state.created === true && state.billedWords !== undefined && access.userId !== null) {
      await consumeWords(access.userId, state.billedWords);
    }

    return NextResponse.json(state);
  } catch (error) {
    // Недоступний батч — не поломка екрана, а лише відсутнє прискорення:
    // сторінки й далі розбиратимуться синхронно, по одній.
    console.warn('analyze batch: не вдалося', error);
    return NextResponse.json({ status: 'skipped', ready: 0, total: 0 });
  }
}

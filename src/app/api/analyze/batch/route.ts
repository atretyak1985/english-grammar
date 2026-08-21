import { NextResponse } from 'next/server';

import { resolveAccess, consumeWords } from '@/lib/access';
import { batchState } from '@/lib/analyzer/batch';
import { reserveCall } from '@/lib/analyzer/throttle';
import { tokenize } from '@/lib/analyzer/tenses';
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

function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  // Той самий гвард, що й у синхронної ручки, і з тієї самої причини: без
  // акаунта нема кому списати слова за батч, який може коштувати як ціла книжка.
  const access = await resolveAccess();
  if (access.level === 'guest') {
    return fail(
      'Уточнення моделлю доступне лише зі входом. Бібліотека вже розібрана і доступна без входу.',
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

  // Квота перевіряється по ВСЬОМУ документу до створення батча: батч на 300
  // сторінок або вкладається в залишок цілком, або не створюється взагалі —
  // часткового батча на «скільки влізло» тут нема, як і обрізки тексту вище.
  const words = tokenize(text).filter((token) => token.word !== null).length;
  if (words > access.remainingWords) {
    return fail(`Слів цього місяця не залишилось: ${access.remainingWords} з ${access.monthlyWords}.`, 402, {
      reason: 'quota-exhausted',
      remainingWords: access.remainingWords,
      monthlyWords: access.monthlyWords,
    });
  }

  try {
    const state = await batchState(text, { gate: () => reserveCall(clientIp(request)) });

    // Рахунок виникає рівно в момент СТВОРЕННЯ батча (`state.created`), а не
    // при кожному опитуванні: `status: 'pending'` повертає і щойно створений
    // батч, і вже наявний, який просто ще не готовий, — списувати за другий
    // випадок означало б платити повторно за той самий документ.
    if (state.created === true && access.userId !== null) {
      await consumeWords(access.userId, words);
    }

    return NextResponse.json(state);
  } catch (error) {
    // Недоступний батч — не поломка екрана, а лише відсутнє прискорення:
    // сторінки й далі розбиратимуться синхронно, по одній.
    console.warn('analyze batch: не вдалося', error);
    return NextResponse.json({ status: 'skipped', ready: 0, total: 0 });
  }
}

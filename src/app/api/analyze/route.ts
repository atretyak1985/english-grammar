import { NextResponse } from 'next/server';

import { resolveAccess, consumeWords } from '@/lib/access';
import { analyze } from '@/lib/analyzer/cache';
import { CALLS_PER_WINDOW, reserveCall } from '@/lib/analyzer/throttle';
import { tokenize } from '@/lib/analyzer/tenses';
import { clientIp } from '@/lib/dictionary/throttle';

/**
 * Уточнення розбору минулих часів моделлю. Ручка серверна не з міркувань
 * зручності: ключ Claude не має потрапляти в браузер ні за яких умов, тому
 * клієнт ходить сюди, а в Anthropic ходить тільки сервер.
 *
 * Відповідь НЕ обовʼязкова для роботи екрана. Локальні правила вже намалювали
 * підсвітку, поки цей запит летів; `matches: null` означає «уточнення не буде»,
 * і клієнт просто лишається з тим, що має. Тому недоступний Claude — це 200 з
 * порожнім уточненням, а не 500: помилки тут немає, є пропущений шар.
 *
 * Сесія БІЛЬШЕ НЕ «не потрібна» — платний виклик тепер списує слова з квоти
 * акаунта (`consumeWords`), а списувати нема з чого, якщо ніхто не увійшов.
 * Анонімний трафік більше не мусить витрачати спільний ключ Claude без жодного
 * обліку; гість при цьому не лишається ні з чим — у нього є локальна
 * підсвітка і вже розібрана бібліотека (`/library`).
 */
export const runtime = 'nodejs';

/**
 * Стеля на один запит. Це запобіжник, а не робочий режим: клієнт ріже документ
 * на шматки (`analyzer/chunks.ts`), і найбільший з них — 2000 слів — сюди
 * вкладається із запасом. Спрацьовує вона на тому, хто прийшов повз клієнта з
 * цілою книжкою в тілі запиту.
 *
 * Обрізати довший текст НЕ можна: мовчазна обрізка дала б розмітку половини
 * присланого, видану за розмітку цілого. Тому чесна відмова.
 */
const MAX_CHARS = 20000;

interface Body {
  text?: unknown;
}

function fail(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  // Перша перевірка з усіх: гостю ручку не відкриваємо взагалі, ще до того, як
  // читати тіло запиту. Без акаунта нема кому списати слова, а мовчки платити
  // за анонімний трафік зі спільного ключа — саме та поведінка, яку прибираємо.
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

  const { text } = (payload ?? {}) as Body;
  if (typeof text !== 'string' || text.trim().length === 0) {
    return fail('Порожній текст: розбирати нічого.', 400);
  }

  if (text.length > MAX_CHARS) {
    return fail(
      `Текст задовгий: ${text.length} символів проти ${MAX_CHARS}. Розберіть його частинами.`,
      413,
    );
  }

  // Кількість слів рахуємо тут, бо кеш пише її в базу, а сам тексту не розбирає.
  // Досить розділити текст: шукати ще й локальні збіги заради лічильника — це
  // прохід по всьому документу, результат якого нікуди не піде.
  const words = tokenize(text).filter((token) => token.word !== null).length;

  // Квота перевіряється до платного виклику, а не після: інакше вичерпаний
  // ліміт дізнавався б про себе постфактум, уже заплативши моделі. Текст під
  // залишок НЕ обрізаємо — та сама мовчазна обрізка, яку вище вже заборонено
  // для MAX_CHARS: половина розбору, видана за розбір цілого.
  if (words > access.remainingWords) {
    return fail(`Слів цього місяця не залишилось: ${access.remainingWords} з ${access.monthlyWords}.`, 402, {
      reason: 'quota-exhausted',
      remainingWords: access.remainingWords,
      monthlyWords: access.monthlyWords,
    });
  }

  // Ліміт списується всередині кешу і тільки за платний виклик: інакше
  // гортання вже розібраної книжки впиралося б у стелю, не витративши копійки.
  const batch = await analyze(text, words, { gate: () => reserveCall(clientIp(request)) });
  if (batch.throttled) {
    return fail(
      `Забагато нових текстів підряд (більше ${CALLS_PER_WINDOW} за хвилину). Спробуйте за хвилину.`,
      429,
    );
  }

  // Списуємо рівно за платний виклик: попадання в кеш (SC-6) і невідповідь
  // моделі — не платіж, і списувати за них означало б брати слова за те, за
  // що ніхто не платив. `userId` тут не `null` за побудовою (гостя вже
  // відсічено вище), але тип цього не знає, тож перевіряємо явно, без `!`.
  if (batch.cache === 'none' && batch.matches !== null && access.userId !== null) {
    await consumeWords(access.userId, words);
  }

  return NextResponse.json({ matches: batch.matches, cache: batch.cache });
}

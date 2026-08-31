import { NextResponse } from 'next/server';

import { resolveAccess, consumeWords } from '@/lib/access';
import { analyze } from '@/lib/analyzer/cache';
import { reserveCall } from '@/lib/analyzer/throttle';
import { tokenize } from '@/lib/analyzer/tenses';
import { clientIp } from '@/lib/dictionary/throttle';

/**
 * Розбір часів: двигун одразу, модель лише для спірного. Ручка серверна не з
 * міркувань зручності: граматичний двигун тягне модель теґера на мегабайти, а
 * ключ Claude не має потрапляти в браузер ні за яких умов.
 *
 * Відповідь — ПОВНА розмітка тексту, а не уточнення поверх локальної: двигун
 * детермінований і безкоштовний, тому працює завжди. Модель бачить лише
 * речення з хиткими збігами; коли її немає (ключ, троттлінг, вичерпана
 * квота) — хиткі збіги просто лишаються з прапорцем `uncertain`, і це 200 з
 * повним результатом, а не помилка.
 *
 * Сесія потрібна, як і раніше: платний виклик списує слова з квоти акаунта
 * (`consumeWords`) — але тепер лише за слова, які СПРАВДІ пішли моделі, тобто
 * за спірні речення, а не за весь текст.
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
  // читати тіло запиту. Двигун безкоштовний, але процесорний час і модель для
  // хитких меж — ні, а без акаунта нема кому їх списати. Гість при цьому не
  // лишається ні з чим — у нього є локальна підсвітка і вже розібрана
  // бібліотека (`/library`).
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
  const words = tokenize(text).filter((token) => token.word !== null).length;

  // Дозвіл на платний виклик дає gate, і питається він У ЦІНІ УТОЧНЕННЯ:
  // скільки слів у спірних реченнях, стільки й важить рішення. Відмова —
  // троттлінг чи залишок квоти, менший за ціну, — не валить запит: клієнт
  // отримує повну розмітку двигуна, просто без вердиктів моделі.
  const batch = await analyze(text, words, {
    gate: (modelWords) => modelWords <= access.remainingWords && reserveCall(clientIp(request)),
  });

  // Списуємо рівно за платний виклик і рівно стільки, скільки слів пішло
  // моделі. Попадання в кеш і пропущене уточнення — не платіж. `userId` тут
  // не `null` за побудовою (гостя вже відсічено вище), але тип цього не знає.
  if (batch.modelWords > 0 && access.userId !== null) {
    await consumeWords(access.userId, batch.modelWords);
  }

  return NextResponse.json({ matches: batch.matches, cache: batch.cache });
}

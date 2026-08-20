import { NextResponse } from 'next/server';

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
 * Сесія не потрібна: аналізатор, як і словник, працює анонімно.
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

  // Ліміт списується всередині кешу і тільки за платний виклик: інакше
  // гортання вже розібраної книжки впиралося б у стелю, не витративши копійки.
  const batch = await analyze(text, words, { gate: () => reserveCall(clientIp(request)) });
  if (batch.throttled) {
    return fail(
      `Забагато нових текстів підряд (більше ${CALLS_PER_WINDOW} за хвилину). Спробуйте за хвилину.`,
      429,
    );
  }

  return NextResponse.json({ matches: batch.matches, cache: batch.cache });
}

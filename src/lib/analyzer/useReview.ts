'use client';

import { useEffect, useMemo, useState } from 'react';

import { type Chunk, chunkText, chunksForRange, chunksOf } from './chunks';
import type { AnalyzedToken, Match } from './tenses';

/**
 * Уточнення підсвітки моделлю. Два джерела наповнюють один накопичувач:
 *
 *   1. Батч на весь документ — після завантаження книжка йде в Batch API
 *      цілком. Він удвічі дешевший, а головне встигає розібрати все, поки
 *      читач дійде до тексту.
 *   2. Синхронний добір поточної сторінки — на випадок, коли батча немає
 *      (короткий текст, немає ключа, немає бази) або він ще не готовий.
 *
 * Хук навмисно НЕ має стану завантаження: локальна розмітка вже намальована й
 * цілком робоча, тому спінер повідомляв би про очікування там, де читач нічого
 * не чекає. Розібраний шматок просто стає точнішим.
 */

/** Ключ шматка: межі однозначно визначають його місце в документі. */
function keyOf(chunk: { start: number; end: number }): string {
  return `${chunk.start}:${chunk.end}`;
}

/**
 * Тіло 401/402 у `ReviewBlock`. Рядок бази тут ні до чого — це чуже тіло
 * відповіді, тому перевіряється так само прискіпливо, як розмітка від моделі:
 * невідома чи неповна форма означає «причини нема», а не вигадану причину.
 */
function toBlock(body: {
  reason?: unknown;
  remainingWords?: unknown;
  monthlyWords?: unknown;
}): ReviewBlock {
  if (body.reason === 'auth-required') return { reason: 'auth-required' };
  if (
    body.reason === 'quota-exhausted' &&
    typeof body.remainingWords === 'number' &&
    typeof body.monthlyWords === 'number'
  ) {
    return { reason: 'quota-exhausted', remainingWords: body.remainingWords, monthlyWords: body.monthlyWords };
  }
  return null;
}

/**
 * Причина, з якої уточнення моделлю недоступне. `null` — усе гаразд або
 * причини поки нема (запит ще в польоті чи взагалі не пробували).
 *
 *   - `auth-required` — сервер відповів 401: ручка аналізатора закрита для
 *     гостя (`resolveAccess()` на сервері).
 *   - `quota-exhausted` — 402: слова цього місяця вичерпано; сервер називає
 *     і залишок, і місячний ліміт, щоб плашка показала точні цифри, а не
 *     загальне «квота скінчилась».
 */
export type ReviewBlock =
  | null
  | { reason: 'auth-required' }
  | { reason: 'quota-exhausted'; remainingWords: number; monthlyWords: number };

export interface ReviewState {
  /** Збіги від моделі; індекси вже переведені в номери токенів документа. */
  matches: Match[];
  /** Проміжки, за які модель відповіла: тільки по них рахується статистика. */
  ranges: { start: number; end: number }[];
  /** Скільки слів документа вже розібрано і скільки їх усього. */
  words: number;
  totalWords: number;
  /** Причина, з якої модель недоступна саме зараз — деградація, не помилка. */
  block: ReviewBlock;
}

/**
 * Розібране разом із текстом, для якого його отримано. Пара нероздільна:
 * номери токенів мають сенс лише для свого тексту, і звірка під час рендера —
 * єдиний спосіб не показати чужу розмітку ані на кадр.
 */
interface Store {
  text: string;
  byChunk: Map<string, Match[]>;
}

/**
 * Відступи між опитуваннями батча. Зростають навмисно: кожне опитування несе
 * на сервер увесь текст, а батч живе від хвилин до годин — рівний інтервал
 * означав би десятки зайвих мегабайтів за сесію читання.
 */
const POLL_MS = [15_000, 30_000, 60_000, 120_000];

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

export function useReview(
  text: string,
  tokens: AnalyzedToken[],
  from: number,
  to: number,
): ReviewState {
  const [store, setStore] = useState<Store>({ text, byChunk: new Map() });

  // Причина недоступності — гість або вичерпана квота. Раз виставлена, вона
  // не мине від повтору (сервер вирішує це по акаунту, не по тексту), тому
  // обидва ефекти нижче перевіряють її й припиняють ходити на сервер.
  const [block, setBlock] = useState<ReviewBlock>(null);

  const chunks = useMemo(() => chunksOf(tokens), [tokens]);

  /** Кладе розмітку шматків у накопичувач, не чіпаючи вже відомого. */
  const remember = (owner: string, found: { key: string; matches: Match[] }[]) => {
    if (found.length === 0) return;
    setStore((current) => {
      const byChunk = current.text === owner ? new Map(current.byChunk) : new Map();
      for (const item of found) byChunk.set(item.key, item.matches);
      return { text: owner, byChunk };
    });
  };

  // Батч на весь документ: одна відповідь несе розмітку всіх готових шматків.
  useEffect(() => {
    if (text.trim().length === 0) return;
    if (block !== null) return;
    const abort = new AbortController();

    void (async () => {
      for (let attempt = 0; !abort.signal.aborted; attempt += 1) {
        if (attempt > 0) {
          await wait(POLL_MS[Math.min(attempt - 1, POLL_MS.length - 1)] ?? 120_000, abort.signal);
          if (abort.signal.aborted) return;
        }

        try {
          const response = await fetch('/api/analyze/batch', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text }),
            signal: abort.signal,
          });

          // 401/402 — не помилка мережі, а причина: гість або вичерпана квота.
          // Ані цей текст, ані наступний батч цього повтору не мине.
          if (response.status === 401 || response.status === 402) {
            setBlock(toBlock(await response.json()));
            return;
          }
          if (!response.ok) return;

          const body = (await response.json()) as {
            status?: string;
            chunks?: { start: number; end: number; matches: Match[] }[];
          };

          remember(
            text,
            (body.chunks ?? []).map((chunk) => ({ key: keyOf(chunk), matches: chunk.matches })),
          );

          // Опитувати далі варто ЛИШЕ поки батч у роботі: `ready` означає, що
          // все вже прийшло, `skipped` — що батча не буде взагалі.
          if (body.status !== 'pending') return;
        } catch {
          return;
        }
      }
    })();

    return () => abort.abort();
  }, [text, block]);

  const fresh = store.text === text;

  // Сторінка зачіпає один-два шматки; третій — той, що піде наступним.
  const wanted = useMemo(() => {
    const visible = chunksForRange(chunks, from, to);
    const last = visible.at(-1);
    const ahead = last === undefined ? undefined : chunks[chunks.indexOf(last) + 1];
    return ahead === undefined ? visible : [...visible, ahead];
  }, [chunks, from, to]);

  /**
   * Наступний непрочитаний шматок — рівно один за прохід. Довгий цикл усередині
   * ефекту довелося б переривати на кожній новій відповіді, а переривання
   * посеред запиту викидає розбір, за який сервер уже заплатив.
   */
  const next: Chunk | undefined = wanted.find(
    (chunk) => !fresh || !store.byChunk.has(keyOf(chunk)),
  );

  useEffect(() => {
    if (next === undefined) return;
    if (block !== null) return;
    const abort = new AbortController();

    void (async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: chunkText(tokens, next) }),
          signal: abort.signal,
        });

        // 401/402 — причина, не збій: гість або вичерпана квота. Запам'ятали
        // й спинились — ні цей шматок, ні наступні тут більше не питають.
        if (response.status === 401 || response.status === 402) {
          setBlock(toBlock(await response.json()));
          return;
        }
        // 413, 429 чи 500 — привід лишити цей шматок на локальній розмітці, а
        // не повторювати запит: жодна з причин не минеться від повтору, а 429
        // від нього ще й подовжиться.
        if (!response.ok) return;

        const body = (await response.json()) as { matches?: Match[] | null };
        if (!Array.isArray(body.matches)) return;

        // Модель нумерує токени ВСЕРЕДИНІ шматка; документ починається раніше.
        // Поля поза координатами (rule, uncertain) їдуть як є — їх читає
        // картка слова, і зрізати їх тут означало б лишити її без пояснення.
        remember(text, [
          {
            key: keyOf(next),
            matches: body.matches.map((match) => ({
              ...match,
              from: match.from + next.start,
              to: match.to + next.start,
            })),
          },
        ]);
      } catch {
        // Обрив і скасування виглядають однаково і означають те саме:
        // уточнення не буде, локальна підсвітка лишається.
      }
    })();

    return () => abort.abort();
  }, [next, tokens, text, block]);

  return useMemo(() => {
    const matches: Match[] = [];
    const ranges: { start: number; end: number }[] = [];
    let words = 0;

    if (fresh) {
      for (const chunk of chunks) {
        const found = store.byChunk.get(keyOf(chunk));
        if (found === undefined) continue;
        matches.push(...found);
        ranges.push({ start: chunk.start, end: chunk.end });
        words += chunk.words;
      }
    }

    return {
      matches,
      ranges,
      words,
      totalWords: chunks.reduce((sum, c) => sum + c.words, 0),
      block,
    };
  }, [store, fresh, chunks, block]);
}

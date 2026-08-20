import { NextResponse } from 'next/server';

import { lookup } from '@/lib/dictionary/cache';
import { clientIp, reserveMisses } from '@/lib/dictionary/throttle';
import type { DictionaryEntry } from '@/lib/dictionary/types';

/**
 * Словникові статті на список слів. Запити до Вікісловника робить сервер:
 * з браузера вони заборонені CORS, вимагають власного User-Agent і не мають
 * спільного кешу (SC-12).
 *
 * Батч навмисно POST, а не GET: 50 слів у query-рядку впираються і в межу
 * довжини URL, і в кеш проксі, який зберігав би кожен набір окремо.
 *
 * Сесія не потрібна: словник, як і аналізатор, працює анонімно — див.
 * коментар у /api/extract.
 */
export const runtime = 'nodejs';

/** Стеля на запит: рівно один батч Action API (MAX_TITLES_PER_REQUEST). */
const MAX_WORDS = 50;
const MAX_WORD_LENGTH = 64;

/** Слово словника: тільки літери, апостроф і дефіс — решта не має статей. */
const WORD_PATTERN = /^[a-z'-]+$/;

/** Скільки символів означення вміщається в один рядок таблиці `/words`. */
const MAX_DEFINITION_LENGTH = 160;

/**
 * Коротка форма статті. Без масиву definitions, без examples і audioUrl:
 * словник на 500 слів має вміщатися в десятки кілобайтів, а повну статтю
 * віддає GET на одне слово. Означення тут одне й обрізане — рівно те, що
 * видно в рядку таблиці.
 */
interface ShortEntry {
  word: string;
  lemma: string;
  ipa: string | null;
  /** `definitions[0]`, обрізане до MAX_DEFINITION_LENGTH; null — означення немає */
  definition: string | null;
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Ріже по межі слова, щоб рядок не обривався посеред слова. */
function clip(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > limit / 2 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

function short(entry: DictionaryEntry): ShortEntry {
  const first = entry.definitions[0];
  return {
    word: entry.word,
    lemma: entry.lemma,
    ipa: entry.ipa,
    definition: first === undefined ? null : clip(first, MAX_DEFINITION_LENGTH),
  };
}

/**
 * Зіпсовані токени відкидаються ТИХО, без 400: аналізатор дає слова з живого
 * тексту, і один «don't»-огризок не має валити відповідь на решту списку.
 */
function normalizeWords(payload: unknown): string[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const { words } = payload as { words?: unknown };
  if (!Array.isArray(words)) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of words) {
    if (typeof raw !== 'string') continue;
    const word = raw.trim().toLowerCase();
    if (word.length === 0 || word.length > MAX_WORD_LENGTH) continue;
    if (!WORD_PATTERN.test(word)) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    out.push(word);
    if (out.length === MAX_WORDS) break;
  }
  return out;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail('Не вдалося прочитати список слів із запиту.', 400);
  }

  const words = normalizeWords(payload);
  if (words.length === 0) return NextResponse.json({ entries: {}, cache: 'memory' });

  const ip = clientIp(request);
  const batch = await lookup(words, { gate: (missing) => reserveMisses(ip, missing.length) });
  if (batch.throttled) {
    return fail('Зараз надто багато нових слів підряд. Спробуйте за хвилину.', 429);
  }

  const entries: Record<string, ShortEntry> = {};
  for (const [word, entry] of batch.entries) {
    if (entry !== null) entries[word] = short(entry);
  }

  return NextResponse.json({ entries, cache: batch.cache });
}

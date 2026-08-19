import { inArray } from 'drizzle-orm';

import { getDb, schema } from '@/db';

import { withExternalLock } from './throttle';
import type { DictionaryEntry, LookupResult } from './types';
import { lookupWords } from './wiktionary';

/**
 * Кеш словникових статей: памʼять процесу → Postgres → Вікісловник.
 *
 * Кожен шар необовʼязковий. Без DATABASE_URL це не окремий «режим без бази»,
 * а звичайний прохід із пропущеним шаром (CONCEPT 8.1) — так само як помилка
 * читання чи запису в базу лише знімає оптимізацію, але не зриває запит.
 */

/** Статті у Вікісловнику змінюються повільно — тримаємо їх довго. */
export const HIT_TTL_MS = 90 * 24 * 60 * 60 * 1000;
/** Слово могли додати після нашого промаху, тому промах живе коротко. */
export const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** Стеля памʼяті процесу: 2000 статей — це кілька мегабайтів, не більше. */
export const MEMORY_LIMIT = 2000;

/**
 * Найглибший шар, до якого дійшов запит: `memory` — не вийшли за процес,
 * `db` — читали Postgres, `none` — ходили в мережу, бо кеш не допоміг.
 */
export type CacheOrigin = 'memory' | 'db' | 'none';

export interface LookupBatch {
  /** Ключ — запитане слово; `null` — джерело статті не має. */
  entries: Map<string, LookupResult>;
  cache: CacheOrigin;
  /** `true` — у мережу не пішли, бо `gate` не дозволив. */
  throttled: boolean;
}

export interface LookupOptions {
  /**
   * Питається перед виходом у мережу і отримує слова, яких немає в кеші.
   * `false` — не йдемо. Так троттлінг на IP лишається у ручці й не тягне
   * знання про HTTP у шар кешу.
   */
  gate?: (missing: string[]) => boolean;
}

/** Стаття разом із часом отримання: без нього не порахувати TTL. */
interface Cached {
  entry: LookupResult;
  fetchedAt: number;
}

/**
 * Ці два значення пишуться в кожен рядок кешу заради атрибуції (README 3).
 * Рядок з іншим джерелом кеш ігнорує: тип статті знає лише Вікісловник, а тихо
 * перейменувати джерело означало б зламати атрибуцію.
 */
const SOURCE = 'wiktionary';
const LICENSE = 'CC BY-SA 4.0';

/**
 * LRU на звичайній Map: у JS вона тримає порядок вставляння, тому «найдавніше
 * використаний» — це просто перший ключ, а оновлення давності — delete + set.
 */
const memory = new Map<string, Cached>();

function fresh(cached: Cached, now: number): boolean {
  return now - cached.fetchedAt < (cached.entry === null ? MISS_TTL_MS : HIT_TTL_MS);
}

function memoryGet(word: string, now: number): Cached | undefined {
  const cached = memory.get(word);
  if (cached === undefined) return undefined;
  if (!fresh(cached, now)) {
    memory.delete(word);
    return undefined;
  }

  memory.delete(word);
  memory.set(word, cached);
  return cached;
}

function memorySet(word: string, cached: Cached): void {
  memory.delete(word);
  memory.set(word, cached);
  while (memory.size > MEMORY_LIMIT) {
    const oldest = memory.keys().next();
    if (oldest.done === true) break;
    memory.delete(oldest.value);
  }
}

/** Тільки для тестів: інстанція живе довше за окремий тест. */
export function clearMemoryCache(): void {
  memory.clear();
}

/** Промах джерела теж кешується, тому в рядку мусять бути всі notNull-колонки. */
function toRow(word: string, entry: LookupResult, fetchedAt: Date): typeof schema.dictionary.$inferInsert {
  if (entry === null) {
    return {
      word,
      lemma: word,
      ipa: null,
      definitions: [],
      examples: [],
    quotes: [],
      audioUrl: null,
      source: SOURCE,
      license: LICENSE,
      // Статті немає, але посилання лишаємо: воно веде на сторінку, де слово
      // могло б зʼявитися, і тримає колонку однаковою для всіх рядків.
      sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
      miss: 1,
      fetchedAt,
    };
  }

  return {
    word,
    lemma: entry.lemma,
    ipa: entry.ipa,
    definitions: entry.definitions,
    examples: entry.examples,
    audioUrl: entry.audioUrl,
    source: entry.source,
    license: entry.license,
    sourceUrl: entry.sourceUrl,
    miss: 0,
    fetchedAt,
  };
}

function toCached(row: typeof schema.dictionary.$inferSelect): Cached | undefined {
  if (row.source !== SOURCE || row.license !== LICENSE) return undefined;
  const fetchedAt = row.fetchedAt.getTime();
  if (row.miss === 1) return { entry: null, fetchedAt };

  const entry: DictionaryEntry = {
    word: row.word,
    lemma: row.lemma,
    ipa: row.ipa,
    definitions: row.definitions,
    examples: row.examples,
    quotes: row.quotes,
    audioUrl: row.audioUrl,
    source: SOURCE,
    license: LICENSE,
    sourceUrl: row.sourceUrl,
  };
  return { entry, fetchedAt };
}

/**
 * Що вже є в кеші: памʼять процесу, далі Postgres. Слова, якого в кеші немає
 * зовсім, у мапі немає — тому `get()` віддає `undefined`, тоді як `null`
 * означає кешований промах джерела. Протермінований рядок вважається відсутнім.
 */
export async function readCached(words: string[]): Promise<Map<string, LookupResult>> {
  const { entries } = await readLayers(words, Date.now());
  return entries;
}

/** Спільне тіло для readCached і lookup: та сама мапа плюс досягнутий шар. */
async function readLayers(
  words: string[],
  now: number,
): Promise<{ entries: Map<string, LookupResult>; cache: CacheOrigin }> {
  const entries = new Map<string, LookupResult>();
  const pending: string[] = [];

  for (const word of words) {
    const cached = memoryGet(word, now);
    if (cached === undefined) pending.push(word);
    else entries.set(word, cached.entry);
  }

  if (pending.length === 0) return { entries, cache: 'memory' };

  const db = getDb();
  if (db === null) return { entries, cache: 'memory' };

  try {
    const rows = await db.select().from(schema.dictionary).where(inArray(schema.dictionary.word, pending));
    let served = false;
    for (const row of rows) {
      const cached = toCached(row);
      if (cached === undefined || !fresh(cached, now)) continue;
      // Прочитане з бази підіймаємо в памʼять з ПОЧАТКОВИМ часом отримання,
      // інакше протермінований рядок ожив би на новий строк TTL.
      memorySet(row.word, cached);
      entries.set(row.word, cached.entry);
      served = true;
    }
    return { entries, cache: served ? 'db' : 'memory' };
  } catch (error) {
    // Читання не вдалося — це втрата оптимізації, а не помилка запиту:
    // слова просто підуть на наступний шар.
    console.warn('dictionary cache: читання з бази не вдалося', error);
    return { entries, cache: 'memory' };
  }
}

/**
 * Кладе статті в обидва шари кешу. Помилка запису в базу нічого не ламає:
 * стаття вже є в памʼяті і вже їде клієнтові.
 */
export async function writeCached(entries: Map<string, LookupResult>): Promise<void> {
  if (entries.size === 0) return;

  const fetchedAt = new Date();
  const stamp = fetchedAt.getTime();
  for (const [word, entry] of entries) memorySet(word, { entry, fetchedAt: stamp });

  const db = getDb();
  if (db === null) return;

  const rows = [...entries].map(([word, entry]) => toRow(word, entry, fetchedAt));
  try {
    for (const row of rows) {
      await db
        .insert(schema.dictionary)
        .values(row)
        .onConflictDoUpdate({ target: schema.dictionary.word, set: row });
    }
  } catch (error) {
    console.warn('dictionary cache: запис у базу не вдався', error);
  }
}

/**
 * Ціла порожня відповідь на кілька слів — це підпис недоступної мережі, а не
 * джерела, яке не знає жодного слова зі списку. Кешувати такий результат
 * означало б приховати слова на сім днів через одну хвилину без інтернету.
 */
function looksLikeOutage(words: string[], entries: Map<string, LookupResult>): boolean {
  return words.length > 1 && [...entries.values()].every((entry) => entry === null);
}

/**
 * Головний вхід словника: три шари в порядку памʼять → Postgres → мережа.
 * Слова, якого немає навіть у джерелі, у результаті немає (значення `null`
 * лишається всередині кешу, щоб не питати щоразу).
 */
export async function lookup(words: string[], options: LookupOptions = {}): Promise<LookupBatch> {
  const requested = [...new Set(words.map((word) => word.toLowerCase().trim()).filter((word) => word.length > 0))];
  if (requested.length === 0) return { entries: new Map(), cache: 'memory', throttled: false };

  const now = Date.now();
  const { entries, cache } = await readLayers(requested, now);

  const missing = requested.filter((word) => !entries.has(word));
  if (missing.length === 0) return { entries, cache, throttled: false };

  if (options.gate !== undefined && !options.gate(missing)) {
    return { entries, cache, throttled: true };
  }

  let fetched = new Map<string, LookupResult>();
  try {
    // Семафор — щоб два паралельні запити не пішли у Вікісловник одночасно.
    fetched = await withExternalLock(() => lookupWords(missing));
  } catch (error) {
    // lookupWords і сам не кидає, але мережевий шар — не місце для довіри:
    // без статей запит віддасть те, що знайшлося в кеші.
    console.warn('dictionary cache: мережевий шар не відповів', error);
  }

  for (const [word, entry] of fetched) entries.set(word, entry);

  if (!looksLikeOutage(missing, fetched)) await writeCached(fetched);

  return { entries, cache: 'none', throttled: false };
}

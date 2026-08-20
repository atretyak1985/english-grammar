import { createHash } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { MODEL } from '@/lib/claude';
import type { TenseKey } from '@/types/content';

import { PROMPT_VERSION, type ReviewedMatch, review } from './review';

/**
 * Кеш розбору тексту моделлю: памʼять процесу → Postgres → Claude. Той самий
 * порядок і та сама поблажливість, що у словнику (`dictionary/cache.ts`):
 * кожен шар необовʼязковий, а його відмова знімає оптимізацію, але не зриває
 * запит (CONCEPT 8.1).
 *
 * Різниця з словником одна, зате принципова: тут промах коштує грошей. Тому
 * додано злиття однакових запитів у польоті — дві людини, що відкрили той
 * самий текст одночасно, дають один виклик API, а не два.
 */

/** Стеля памʼяті процесу: розбори більші за словникові статті, тому їх менше. */
export const MEMORY_LIMIT = 200;

export type CacheOrigin = 'memory' | 'db' | 'none';

export interface AnalysisBatch {
  /** `null` — розбору немає: ключа немає, або модель не відповіла. */
  matches: ReviewedMatch[] | null;
  cache: CacheOrigin;
  /** `true` — платного виклику не робили, бо `gate` не дозволив. */
  throttled: boolean;
}

export interface AnalyzeOptions {
  /**
   * Питається лише перед платним викликом. Так троттлінг лишається у ручці й
   * не тягне знання про HTTP та адреси сюди, а попадання в кеш не витрачають
   * ліміт — за них ніхто не платив.
   */
  gate?: () => boolean;
}

/** LRU на Map: порядок вставляння дає «найдавніше використаний» безкоштовно. */
const memory = new Map<string, ReviewedMatch[]>();

/** Запити в польоті: ключ той самий хеш, значення — спільна обіцянка. */
const inflight = new Map<string, Promise<ReviewedMatch[] | null>>();

/**
 * Ключ кешу. Модель і версія промпту входять у хеш, а не лежать поруч: інакше
 * зміна промпту не інвалідувала б жодного рядка, і застосунок місяцями віддавав
 * би розмітку за правилами, яких у коді вже немає.
 */
export function hashOf(text: string): string {
  return createHash('sha256').update(`${MODEL}\n${PROMPT_VERSION}\n${text}`).digest('hex');
}

function memoryGet(hash: string): ReviewedMatch[] | undefined {
  const found = memory.get(hash);
  if (found === undefined) return undefined;

  memory.delete(hash);
  memory.set(hash, found);
  return found;
}

function memorySet(hash: string, matches: ReviewedMatch[]): void {
  memory.delete(hash);
  memory.set(hash, matches);
  while (memory.size > MEMORY_LIMIT) {
    const oldest = memory.keys().next();
    if (oldest.done === true) break;
    memory.delete(oldest.value);
  }
}

/** Тільки для тестів: інстанція живе довше за окремий тест. */
export function clearMemoryCache(): void {
  memory.clear();
  inflight.clear();
}

/**
 * Рядок бази — це JSON, який колись записала інша версія коду, тому кожне поле
 * перевіряється так само прискіпливо, як відповідь моделі. Експортується, щоб
 * батч читав кеш тими самими очима: дві різні перевірки того самого рядка
 * рано чи пізно розійшлися б.
 */
export function fromRow(raw: unknown): ReviewedMatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const out: ReviewedMatch[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return undefined;
    const { from, to, tense } = item as { from?: unknown; to?: unknown; tense?: unknown };
    if (!Number.isInteger(from) || !Number.isInteger(to)) return undefined;
    if (tense !== 'ps' && tense !== 'pc' && tense !== 'pp') return undefined;
    out.push({ from: from as number, to: to as number, tense: tense as TenseKey });
  }
  return out;
}

async function readDb(hash: string): Promise<ReviewedMatch[] | undefined> {
  const db = getDb();
  if (db === null) return undefined;

  try {
    const rows = await db.select().from(schema.analyses).where(eq(schema.analyses.hash, hash)).limit(1);
    const row = rows[0];
    if (row === undefined) return undefined;
    return fromRow(row.matches);
  } catch (error) {
    console.warn('analyzer cache: читання з бази не вдалося', error);
    return undefined;
  }
}

async function writeDb(hash: string, matches: ReviewedMatch[], words: number): Promise<void> {
  const db = getDb();
  if (db === null) return;

  try {
    await db
      .insert(schema.analyses)
      .values({ hash, matches, model: MODEL, promptVersion: PROMPT_VERSION, words })
      // Той самий хеш означає той самий текст, ту саму модель і той самий
      // промпт — переписувати нема чого, гонку двох запитів просто гасимо.
      .onConflictDoNothing();
  } catch (error) {
    console.warn('analyzer cache: запис у базу не вдався', error);
  }
}

/**
 * Головний вхід: три шари в порядку памʼять → Postgres → Claude. `matches:
 * null` означає «розбору немає» — без ключа, або модель не відповіла; викликач
 * у цьому разі лишається на локальних правилах.
 */
export async function analyze(
  text: string,
  words: number,
  options: AnalyzeOptions = {},
): Promise<AnalysisBatch> {
  const hash = hashOf(text);

  const cached = memoryGet(hash);
  if (cached !== undefined) return { matches: cached, cache: 'memory', throttled: false };

  const stored = await readDb(hash);
  if (stored !== undefined) {
    memorySet(hash, stored);
    return { matches: stored, cache: 'db', throttled: false };
  }

  // Другий запит на той самий текст чекає на перший, а не платить удруге — і
  // ліміту не витрачає, бо платного виклику тут теж не буде.
  const running = inflight.get(hash);
  if (running !== undefined) return { matches: await running, cache: 'none', throttled: false };

  if (options.gate !== undefined && !options.gate()) {
    return { matches: null, cache: 'none', throttled: true };
  }

  const task = (async (): Promise<ReviewedMatch[] | null> => {
    let result;
    try {
      result = await review(text);
    } catch (error) {
      // Відмова моделі — не результат: кешувати її означало б закріпити
      // хвилину без мережі чи вичерпаний ліміт на весь час життя тексту.
      console.warn('analyzer cache: модель не відповіла', error);
      return null;
    }
    if (result === null) return null;

    memorySet(hash, result.matches);
    await writeDb(hash, result.matches, words);
    console.info(
      `analyze: ${words} слів, ${result.matches.length} збігів, токени ` +
        `${result.usage.input}/${result.usage.output}, ` +
        `кеш −${result.usage.cacheRead} +${result.usage.cacheWrite}`,
    );
    return result.matches;
  })();

  inflight.set(hash, task);
  try {
    return { matches: await task, cache: 'none', throttled: false };
  } finally {
    inflight.delete(hash);
  }
}

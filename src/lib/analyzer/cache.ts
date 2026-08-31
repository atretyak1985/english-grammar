import { createHash } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { RULES_VERSION, analyzeGrammar, type GrammarMatch } from '@/lib/grammar';
import { planPieces, refineUncertain } from '@/lib/grammar/refine';
import { MODEL } from '@/lib/claude';
import { isTenseKey, type TenseKey } from '@/types/content';

import { PROMPT_VERSION } from './review';

/**
 * Розбір тексту: двигун одразу, модель — лише для спірного. Двигун
 * (`lib/grammar`) дає повну детерміновану розмітку за мілісекунди й без
 * мережі; модель викликається тільки на речення з хиткими збігами
 * (`refineUncertain`). Тому «без ключа» — це вже не деградація, а повний
 * результат, просто без уточнення хитких меж.
 *
 * Кеш памʼять → Postgres → Claude лишається, але зберігає ЗЛИТУ розмітку
 * (двигун + вердикти моделі) і має сенс лише там, де модель справді
 * викликалась: чистий двигун швидший за читання з бази, і класти його
 * результат у кеш означало б заморозити розмітку без жодної економії.
 */

/** Стеля памʼяті процесу: розбори більші за словникові статті, тому їх менше. */
export const MEMORY_LIMIT = 200;

export type CacheOrigin = 'memory' | 'db' | 'none';

/**
 * Збіг у кеші й у відповіді ручки: координати `tokenize`, час, правило
 * двигуна і прапорець хиткої межі, якщо модель її не перевіряла. Назва поля
 * `rule` — та сама, що в артефактах бібліотеки (`library/artifact.ts`), бо
 * клієнт читає обидва джерела одними очима.
 */
export interface AnalyzedMatch {
  from: number;
  to: number;
  tense: TenseKey;
  rule?: string;
  uncertain?: true;
}

export interface AnalysisBatch {
  /** Повна розмітка тексту: двигун + уточнення моделі, якщо воно відбулося. */
  matches: AnalyzedMatch[];
  cache: CacheOrigin;
  /** Слова, надіслані моделі ПЛАТНИМ викликом, — рівно стільки списує квота. */
  modelWords: number;
}

export interface AnalyzeOptions {
  /**
   * Питається лише перед платним викликом і отримує його ціну в словах —
   * реченнях з хиткими збігами, а не в словах усього тексту. Відмова не
   * скасовує розбір: двигунова розмітка повертається повністю, зникає лише
   * уточнення моделлю.
   */
  gate?: (modelWords: number) => boolean;
}

/** LRU на Map: порядок вставляння дає «найдавніше використаний» безкоштовно. */
const memory = new Map<string, AnalyzedMatch[]>();

/** Запити в польоті: ключ той самий хеш, значення — спільна обіцянка уточнення. */
const inflight = new Map<string, Promise<AnalyzedMatch[] | null>>();

/**
 * Ключ кешу. Модель, версія промпту і ВЕРСІЯ ПРАВИЛ двигуна входять у хеш, а
 * не лежать поруч: зміна будь-чого з трьох робить старі рядки неспівставними,
 * і без версій у ключі застосунок місяцями віддавав би розмітку за правилами,
 * яких у коді вже немає.
 */
export function hashOf(text: string): string {
  return createHash('sha256')
    .update(`${MODEL}\n${PROMPT_VERSION}\n${RULES_VERSION}\n${text}`)
    .digest('hex');
}

/** Збіги двигуна у форму кешу й відповіді: `ruleId` стає `rule`, як в артефактах. */
export function toStored(matches: readonly GrammarMatch[]): AnalyzedMatch[] {
  return matches.map((match) => ({
    from: match.from,
    to: match.to,
    tense: match.tense,
    rule: match.ruleId,
    ...(match.uncertain === true ? { uncertain: true as const } : {}),
  }));
}

function memoryGet(hash: string): AnalyzedMatch[] | undefined {
  const found = memory.get(hash);
  if (found === undefined) return undefined;

  memory.delete(hash);
  memory.set(hash, found);
  return found;
}

function memorySet(hash: string, matches: AnalyzedMatch[]): void {
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
export function fromRow(raw: unknown): AnalyzedMatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const out: AnalyzedMatch[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return undefined;
    const { from, to, tense, rule, uncertain } = item as {
      from?: unknown;
      to?: unknown;
      tense?: unknown;
      rule?: unknown;
      uncertain?: unknown;
    };
    if (!Number.isInteger(from) || !Number.isInteger(to)) return undefined;
    if (!isTenseKey(tense)) return undefined;
    out.push({
      from: from as number,
      to: to as number,
      tense,
      ...(typeof rule === 'string' && rule.length > 0 ? { rule } : {}),
      ...(uncertain === true ? { uncertain: true as const } : {}),
    });
  }
  return out;
}

async function readDb(hash: string): Promise<AnalyzedMatch[] | undefined> {
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

/**
 * Пише злиту розмітку в спільний кеш. Експортується для батча: він отримує
 * вердикти моделі поза цим модулем, але класти їх мусить у ту саму таблицю
 * тим самим рядком, інакше синхронний шлях не впізнає його роботи.
 */
export async function saveAnalysis(hash: string, matches: AnalyzedMatch[], words: number): Promise<void> {
  memorySet(hash, matches);

  const db = getDb();
  if (db === null) return;

  try {
    await db
      .insert(schema.analyses)
      .values({ hash, matches, model: MODEL, promptVersion: PROMPT_VERSION, words })
      // Той самий хеш означає той самий текст, ті самі версії правил і
      // промпту — переписувати нема чого, гонку двох запитів просто гасимо.
      .onConflictDoNothing();
  } catch (error) {
    console.warn('analyzer cache: запис у базу не вдався', error);
  }
}

/**
 * Головний вхід. Порядок: памʼять → Postgres → двигун (+ модель для хиткого).
 * Розмітка Є ЗАВЖДИ — двигун не потребує ні ключа, ні мережі; кеш і модель
 * лише уточнюють хиткі межі. Кешується РІВНО той результат, за який платили:
 * без платного виклику і кешувати нічого — двигун перерахує швидше.
 */
export async function analyze(
  text: string,
  words: number,
  options: AnalyzeOptions = {},
): Promise<AnalysisBatch> {
  const hash = hashOf(text);

  const cached = memoryGet(hash);
  if (cached !== undefined) return { matches: cached, cache: 'memory', modelWords: 0 };

  const stored = await readDb(hash);
  if (stored !== undefined) {
    memorySet(hash, stored);
    return { matches: stored, cache: 'db', modelWords: 0 };
  }

  const engine = analyzeGrammar(text);
  const draft = toStored(engine.matches);

  // Другий запит на той самий текст чекає на перший, а не платить удруге — і
  // квоти не витрачає, бо платного виклику тут теж не буде. Якщо перший
  // повернувся ні з чим, другий віддає власний двигуновий результат.
  const running = inflight.get(hash);
  if (running !== undefined) {
    const shared = await running;
    return { matches: shared ?? draft, cache: 'none', modelWords: 0 };
  }

  const plan = planPieces(text, engine.matches);
  if (plan.words === 0) return { matches: draft, cache: 'none', modelWords: 0 };

  if (options.gate !== undefined && !options.gate(plan.words)) {
    return { matches: draft, cache: 'none', modelWords: 0 };
  }

  let billed = 0;
  const task = (async (): Promise<AnalyzedMatch[] | null> => {
    let refinement;
    try {
      refinement = await refineUncertain(text, engine.matches, undefined, plan);
    } catch (error) {
      // Відмова моделі — не результат: кешувати її означало б закріпити
      // хвилину без мережі чи вичерпаний ліміт на весь час життя тексту.
      console.warn('analyzer cache: модель не відповіла', error);
      return null;
    }
    // Модель недоступна (немає ключа): уточнення не було, платити й кешувати нічого.
    if (refinement.usage === null) return null;

    // Списуємо за фактом: проміжок, на якому модель не відповіла, не коштував нічого.
    billed = refinement.words;
    const merged = toStored(refinement.matches);
    await saveAnalysis(hash, merged, words);
    console.info(
      `analyze: ${words} слів, моделі ${refinement.words}, перевірено ${refinement.checked} хитких ` +
        `(підтверджено ${refinement.confirmed}, змінено ${refinement.retensed}, знято ${refinement.dropped}), ` +
        `токени ${refinement.usage.input}/${refinement.usage.output}`,
    );
    return merged;
  })();

  inflight.set(hash, task);
  try {
    const merged = await task;
    if (merged === null) return { matches: draft, cache: 'none', modelWords: 0 };
    return { matches: merged, cache: 'none', modelWords: billed };
  } finally {
    inflight.delete(hash);
  }
}

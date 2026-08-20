import { eq, inArray } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { MODEL, getClaude } from '@/lib/claude';

import { fromRow, hashOf } from './cache';
import { type Chunk, chunkText, chunksOf } from './chunks';
import { PROMPT_VERSION, type ReviewedMatch, parseMatches, requestParams, wordsIn } from './review';
import { tokenize } from './tenses';

/**
 * Розбір цілої книжки через Batch API. Вигода тут подвійна, і знижка — менша
 * її половина. Batch удвічі дешевший за синхронний виклик, але головне те, що
 * поки читач дійде до тексту, розібрано вже все: жодна сторінка не чекає, а
 * статистика рахується по всьому документу, а не по прочитаному.
 *
 * Батч асинхронний, а ручка Next.js живе рівно стільки, скільки запит: чекати
 * всередині неї не можна, фонового воркера немає. Тому результат ЗАБИРАЄТЬСЯ
 * ЛІНИВО — тим самим запитом, який і так прийшов від клієнта. Опитування
 * дешеве: поки батч не завершився, це один виклик `retrieve`.
 */

/**
 * Скільки перших шматків лишаємо синхронному шляху. Їх читач відкриє за
 * секунди, і батч устиг би хіба що продублювати оплату: батч дешевший удвічі,
 * але заплатити половину за те, що вже куплено, дорожче, ніж не платити нічого.
 */
export const SYNC_CHUNKS = 2;

/** Нижче цього батч не має сенсу: синхронний шлях розбере такий текст швидше. */
export const MIN_CHUNKS_FOR_BATCH = 4;

/**
 * Скільки шматків максимум іде в ОДИН батч — приблизно 120 тисяч слів, тобто
 * товстий роман. Межа не технічна (Batch API тримає значно більше), а
 * грошова: без неї один запит створює батч довільної вартості, і десять
 * запитів за хвилину, які дозволяє троттлінг, коштували б десятки доларів.
 *
 * Решта документа не пропадає: її розбере синхронний шлях у міру читання, а
 * наступний батч на цей текст можна створити, коли перший забрано.
 */
export const MAX_BATCH_CHUNKS = 80;

export type BatchStatus =
  /** Батча немає й не буде: текст закороткий, немає ключа або немає бази. */
  | 'skipped'
  /** Батч у роботі — розбір буде, але не зараз. */
  | 'pending'
  /** Результати вже в `analyses`: сторінки братимуться з кешу. */
  | 'ready';

export interface BatchOptions {
  /**
   * Питається лише перед СТВОРЕННЯМ батча. Опитування готового батча ліміту не
   * витрачає: воно нічого не коштує, і карати за нього того, хто просто читає,
   * нема за що.
   */
  gate?: () => boolean;
}

export interface BatchState {
  status: BatchStatus;
  /** Скільки шматків уже лежить у кеші — для показу поступу. */
  ready: number;
  total: number;
  /**
   * Уся розмітка, яка вже є в кеші, в номерах токенів ДОКУМЕНТА. Віддається
   * тут, а не окремими запитами по шматках: книжка на сімдесят шматків
   * означала б сімдесят запитів заради того, що лежить в одній таблиці, і
   * статистика по всьому документу залишалася б недосяжною до кінця читання.
   */
  chunks: { start: number; end: number; matches: ReviewedMatch[] }[];
}

/** `custom_id` обмежений довжиною, тому в ньому порядковий номер, а не хеш. */
function idOf(order: number): string {
  return `c${order}`;
}

function orderOf(customId: string): number | null {
  const order = Number.parseInt(customId.slice(1), 10);
  return Number.isInteger(order) && order >= 0 ? order : null;
}

/**
 * Шматки, яких ще немає в кеші. Повторно завантажена книжка або текст, уже
 * прочитаний кимось іншим, не мають іти в батч удруге: кеш спільний для всіх.
 */
async function missing(hashes: string[]): Promise<Set<number>> {
  const db = getDb();
  const all = new Set(hashes.map((_, order) => order));
  if (db === null) return all;

  try {
    // Саме за списком, а не суцільним читанням: кеш спільний для всіх текстів
    // і росте безмежно, тож перебирати його цілком заради двох десятків хешів
    // означало б платити за батч сканом таблиці.
    const rows = await db
      .select({ hash: schema.analyses.hash })
      .from(schema.analyses)
      .where(inArray(schema.analyses.hash, hashes));
    const known = new Set(rows.map((row) => row.hash));
    for (const [order, hash] of hashes.entries()) if (known.has(hash)) all.delete(order);
    return all;
  } catch (error) {
    console.warn('analyzer batch: не вдалося звірити кеш', error);
    return all;
  }
}

/**
 * Уся розмітка документа, яка вже є в кеші, зведена в номери токенів документа.
 * Один прохід по шматках і одна вибірка з бази: саме це дозволяє показати
 * статистику по всьому тексту, а не по прочитаному.
 */
async function collect(text: string, status: BatchStatus): Promise<BatchState> {
  const db = getDb();
  const tokens = tokenize(text);
  const chunks = chunksOf(tokens);
  const empty = { status, ready: 0, total: chunks.length, chunks: [] };
  if (db === null) return empty;

  const hashes = chunks.map((chunk) => hashOf(chunkText(tokens, chunk)));

  let rows;
  try {
    rows = await db
      .select({ hash: schema.analyses.hash, matches: schema.analyses.matches })
      .from(schema.analyses)
      .where(inArray(schema.analyses.hash, hashes));
  } catch (error) {
    console.warn('analyzer batch: не вдалося зібрати розмітку', error);
    return empty;
  }

  const byHash = new Map(rows.map((row) => [row.hash, row.matches]));
  const out: BatchState['chunks'] = [];

  for (const [order, chunk] of chunks.entries()) {
    const found = fromRow(byHash.get(hashes[order] ?? ''));
    if (found === undefined) continue;

    // Кеш зберігає номери в межах шматка; документ починається раніше.
    out.push({
      start: chunk.start,
      end: chunk.end,
      matches: found.map((match) => ({
        from: match.from + chunk.start,
        to: match.to + chunk.start,
        tense: match.tense,
      })),
    });
  }

  return { status, ready: out.length, total: chunks.length, chunks: out };
}

/**
 * Створює батч на все, що лишилося нерозібраним. Повертає стан: `pending`, якщо
 * батч пішов у роботу, `ready`, якщо виявилося, що розбирати нічого.
 */
async function submit(
  docHash: string,
  text: string,
  chunks: Chunk[],
  gate: (() => boolean) | undefined,
): Promise<BatchState> {
  const client = getClaude();
  const db = getDb();
  if (client === null || db === null) return { status: 'skipped', ready: 0, total: chunks.length, chunks: [] };

  const tokens = tokenize(text);
  const texts = chunks.map((chunk) => chunkText(tokens, chunk));
  const hashes = texts.map((chunkOwn) => hashOf(chunkOwn));

  const todo = await missing(hashes);
  for (let order = 0; order < SYNC_CHUNKS; order += 1) todo.delete(order);
  if (todo.size === 0) return await collect(text, 'ready');

  const eligible = [...todo]
    .sort((a, b) => a - b)
    .filter((order) => wordsIn(texts[order] ?? '') > 0);

  // Відрізане називаємо вголос: мовчазне обмеження читалося б як «розібрано
  // все», хоча хвіст книжки лишився синхронному шляху.
  const taken = eligible.slice(0, MAX_BATCH_CHUNKS);
  if (taken.length < eligible.length) {
    console.info(`batch: беремо ${taken.length} шматків з ${eligible.length}, решта — синхронно`);
  }

  const requests = taken.map((order) => ({
    custom_id: idOf(order),
    params: requestParams(texts[order] ?? ''),
  }));
  if (requests.length === 0) return await collect(text, 'ready');

  // Дозвіл питаємо в останню мить — коли вже відомо, що витрата справді буде.
  if (gate !== undefined && !gate()) return { status: 'skipped', ready: 0, total: chunks.length, chunks: [] };

  const batch = await client.messages.batches.create({ requests });

  await db
    .insert(schema.analysisBatches)
    .values({ docHash, batchId: batch.id, chunkHashes: hashes, docText: text })
    // Два вкладки з тією самою книжкою — звичайна річ; виграє той, хто перший.
    .onConflictDoNothing();

  console.info(`batch: ${batch.id}, шматків ${requests.length} з ${chunks.length}`);
  return await collect(text, 'pending');
}

/**
 * Переносить готові результати в `analyses`. Помилка на окремому шматку не
 * зупиняє решту: половина розібраної книжки корисніша за нуль, а непережований
 * шматок просто дістанеться синхронному шляху.
 */
async function ingest(row: typeof schema.analysisBatches.$inferSelect): Promise<number> {
  const client = getClaude();
  const db = getDb();
  if (client === null || db === null || row.docText === null) return 0;

  const tokens = tokenize(row.docText);
  const texts = chunksOf(tokens).map((chunk) => chunkText(tokens, chunk));

  let saved = 0;
  for await (const result of await client.messages.batches.results(row.batchId)) {
    if (result.result.type !== 'succeeded') continue;

    const order = orderOf(result.custom_id);
    const own = order === null ? undefined : texts[order];
    const hash = order === null ? undefined : row.chunkHashes[order];
    if (own === undefined || hash === undefined) continue;

    // Хеш зі збереженого списку мусить збігтися з хешем перерахованого шматка:
    // якщо ні, текст або нарізка змінилися між створенням батча і забиранням,
    // і класти цю розмітку в кеш означало б підсвітити не ті слова.
    if (hashOf(own) !== hash) continue;

    try {
      await db
        .insert(schema.analyses)
        .values({
          hash,
          matches: parseMatches(own, result.result.message.content),
          model: MODEL,
          promptVersion: PROMPT_VERSION,
          words: wordsIn(own),
        })
        .onConflictDoNothing();
      saved += 1;
    } catch (error) {
      console.warn('analyzer batch: шматок не записався', error);
    }
  }

  await db
    .update(schema.analysisBatches)
    // Текст більше не потрібен: він був потрібен рівно для цього перенесення.
    .set({ ingestedAt: new Date(), docText: null })
    .where(eq(schema.analysisBatches.docHash, row.docHash));

  console.info(`batch: ${row.batchId} забрано, шматків ${saved}`);
  return saved;
}

/**
 * Головний вхід: подивитися, що з батчем цього документа, і зробити наступний
 * крок — створити, забрати або нічого. Викликається ручкою на кожне опитування
 * від клієнта.
 */
export async function batchState(text: string, options: BatchOptions = {}): Promise<BatchState> {
  const db = getDb();
  const chunks = chunksOf(tokenize(text));

  if (db === null || getClaude() === null || chunks.length < MIN_CHUNKS_FOR_BATCH) {
    return { status: 'skipped', ready: 0, total: chunks.length, chunks: [] };
  }

  const docHash = hashOf(text);

  let row;
  try {
    const rows = await db
      .select()
      .from(schema.analysisBatches)
      .where(eq(schema.analysisBatches.docHash, docHash))
      .limit(1);
    row = rows[0];
  } catch (error) {
    console.warn('analyzer batch: читання з бази не вдалося', error);
    return { status: 'skipped', ready: 0, total: chunks.length, chunks: [] };
  }

  if (row === undefined) return submit(docHash, text, chunks, options.gate);
  if (row.ingestedAt !== null) return await collect(text, 'ready');

  const client = getClaude();
  if (client === null) return { status: 'skipped', ready: 0, total: chunks.length, chunks: [] };

  const batch = await client.messages.batches.retrieve(row.batchId);
  if (batch.processing_status !== 'ended') {
    return await collect(text, 'pending');
  }

  await ingest(row);

  // Стан збираємо ПІСЛЯ перенесення й з бази, а не з лічильника: у кеші може
  // вже лежати й те, що встиг розібрати синхронний шлях, поки батч рахувався.
  return await collect(text, 'ready');
}

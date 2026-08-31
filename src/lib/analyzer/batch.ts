import { eq, inArray } from 'drizzle-orm';

import { getDb, schema } from '@/db';
import { getClaude } from '@/lib/claude';
import { analyzeGrammar, type GrammarMatch } from '@/lib/grammar';
import {
  type RefinePlan,
  applyVerdicts,
  planPieces,
  verdictFor,
} from '@/lib/grammar/refine';

import { type AnalyzedMatch, fromRow, hashOf, saveAnalysis, toStored } from './cache';
import { type Chunk, chunkText, chunksOf } from './chunks';
import { parseMatches, requestParams, wordsIn } from './review';
import { tokenize } from './tenses';

/**
 * Розбір цілої книжки наперед. Двигун розмічає кожен шматок одразу й
 * безкоштовно; у Batch API йдуть ЛИШЕ речення з хиткими збігами — те саме
 * уточнення, що робить синхронна ручка, тільки вдвічі дешевше і на весь
 * документ заздалегідь. Шматки, де хитких збігів немає, лягають у кеш прямо
 * при створенні батча, без жодного виклику моделі.
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
  /** Батч у роботі — уточнення буде, але не зараз. */
  | 'pending'
  /** Результати вже в `analyses`: сторінки братимуться з кешу. */
  | 'ready';

export interface BatchOptions {
  /**
   * Питається лише перед СТВОРЕННЯМ батча і отримує його ціну — слова спірних
   * речень, які підуть моделі. Опитування готового батча ліміту не витрачає:
   * воно нічого не коштує, і карати за нього того, хто просто читає, нема за що.
   */
  gate?: (modelWords: number) => boolean;
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
  chunks: { start: number; end: number; matches: AnalyzedMatch[] }[];
  /**
   * `true` рівно тоді, коли ЦЕЙ виклик сам створив батч (`client.messages.
   * batches.create` справді відбувся). Відсутнє в усіх інших випадках, включно
   * з опитуванням уже створеного батча (`status: 'pending'` там теж, але
   * рахунок за нього вже виставлено раніше) — саме тому за статусом одним
   * рахунок не визначити, а за цим полем можна.
   */
  created?: boolean;
  /** Слова, надіслані моделі створеним батчем, — рівно стільки списує квота. */
  billedWords?: number;
}

/**
 * `custom_id` обмежений довжиною, тому в ньому номер шматка й номер спірного
 * проміжку в ньому, а не хеші.
 */
function idOf(chunkOrder: number, pieceOrder: number): string {
  return `c${chunkOrder}p${pieceOrder}`;
}

function ordersOf(customId: string): { chunk: number; piece: number } | null {
  const parsed = /^c(\d+)p(\d+)$/.exec(customId);
  if (parsed === null) return null;
  const chunk = Number.parseInt(parsed[1] ?? '', 10);
  const piece = Number.parseInt(parsed[2] ?? '', 10);
  if (!Number.isInteger(chunk) || !Number.isInteger(piece)) return null;
  return { chunk, piece };
}

/**
 * Розмітка шматка двигуном разом із планом уточнення. І створення батча, і
 * забирання результатів мусять бачити ті самі проміжки — двигун
 * детермінований, тому перерахунок дає їх байт у байт.
 */
function chunkPlan(chunkOwnText: string): { matches: GrammarMatch[]; plan: RefinePlan } {
  const engine = analyzeGrammar(chunkOwnText);
  return { matches: engine.matches, plan: planPieces(chunkOwnText, engine.matches) };
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
        ...match,
        from: match.from + chunk.start,
        to: match.to + chunk.start,
      })),
    });
  }

  return { status, ready: out.length, total: chunks.length, chunks: out };
}

/**
 * Створює батч на спірні речення всього, що лишилося нерозібраним; певні
 * шматки лягають у кеш одразу. Повертає стан: `pending`, якщо батч пішов у
 * роботу, `ready`, якщо виявилося, що моделі розбирати нічого.
 */
async function submit(
  docHash: string,
  text: string,
  chunks: Chunk[],
  gate: ((modelWords: number) => boolean) | undefined,
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

  // Двигун проходить кожен нерозібраний шматок уже тут: шматки без хитких
  // збігів — готовий результат, він кешується одразу й моделі не вартий.
  const uncertainOrders: number[] = [];
  const plans = new Map<number, RefinePlan>();
  for (const order of [...todo].sort((a, b) => a - b)) {
    const own = texts[order];
    const hash = hashes[order];
    if (own === undefined || hash === undefined || wordsIn(own) === 0) continue;

    const { matches, plan } = chunkPlan(own);
    if (plan.words === 0) {
      await saveAnalysis(hash, toStored(matches), wordsIn(own));
      continue;
    }
    plans.set(order, plan);
    uncertainOrders.push(order);
  }
  if (uncertainOrders.length === 0) return await collect(text, 'ready');

  // Відрізане називаємо вголос: мовчазне обмеження читалося б як «розібрано
  // все», хоча хвіст книжки лишився синхронному шляху.
  const taken = uncertainOrders.slice(0, MAX_BATCH_CHUNKS);
  if (taken.length < uncertainOrders.length) {
    console.info(`batch: беремо ${taken.length} шматків з ${uncertainOrders.length}, решта — синхронно`);
  }

  const requests = taken.flatMap((order) => {
    const plan = plans.get(order);
    if (plan === undefined) return [];
    return plan.pieces.map((piece, pieceOrder) => ({
      custom_id: idOf(order, pieceOrder),
      params: requestParams(chunkText(plan.tokens, piece)),
    }));
  });
  if (requests.length === 0) return await collect(text, 'ready');

  // Дозвіл питаємо в останню мить і в ціні уточнення: скільки слів у спірних
  // реченнях, стільки й важить рішення. Відмова не скасовує вже закешовану
  // роботу двигуна — зникає лише батч.
  const modelWords = taken.reduce((sum, order) => sum + (plans.get(order)?.words ?? 0), 0);
  if (gate !== undefined && !gate(modelWords)) {
    return await collect(text, 'skipped');
  }

  const batch = await client.messages.batches.create({ requests });

  await db
    .insert(schema.analysisBatches)
    .values({ docHash, batchId: batch.id, chunkHashes: hashes, docText: text })
    // Два вкладки з тією самою книжкою — звичайна річ; виграє той, хто перший.
    .onConflictDoNothing();

  console.info(
    `batch: ${batch.id}, шматків ${taken.length} з ${chunks.length}, спірних речень на ${modelWords} слів`,
  );
  // `created: true` лягає лише тут: це єдине місце, де `batches.create`
  // справді пішов у мережу, тобто рахунок за документ уже виставлено.
  return { ...(await collect(text, 'pending')), created: true, billedWords: modelWords };
}

/**
 * Переносить готові вердикти в `analyses`: розмітка шматка двигуном зливається
 * з відповідями моделі на його спірні речення. Помилка на окремому проміжку не
 * зупиняє решту: неуточнений збіг лишається хитким, а не зникає.
 */
async function ingest(row: typeof schema.analysisBatches.$inferSelect): Promise<number> {
  const client = getClaude();
  const db = getDb();
  if (client === null || db === null || row.docText === null) return 0;

  const tokens = tokenize(row.docText);
  const texts = chunksOf(tokens).map((chunk) => chunkText(tokens, chunk));

  // Вердикти групуються по шматках: рядок кешу — це ШМАТОК, і писати його
  // можна лише зібравши всі відповіді по його проміжках.
  const verdictsByChunk = new Map<number, Map<number, unknown>>();

  for await (const result of await client.messages.batches.results(row.batchId)) {
    if (result.result.type !== 'succeeded') continue;

    const orders = ordersOf(result.custom_id);
    if (orders === null) continue;

    const own = texts[orders.chunk];
    const hash = row.chunkHashes[orders.chunk];
    // Хеш зі збереженого списку мусить збігтися з хешем перерахованого шматка:
    // якщо ні, текст, нарізка або версія правил змінилися між створенням батча
    // і забиранням, і класти цю розмітку в кеш означало б підсвітити не ті слова.
    if (own === undefined || hash === undefined || hashOf(own) !== hash) continue;

    const byPiece = verdictsByChunk.get(orders.chunk) ?? new Map<number, unknown>();
    byPiece.set(orders.piece, result.result.message.content);
    verdictsByChunk.set(orders.chunk, byPiece);
  }

  let saved = 0;
  for (const [order, byPiece] of verdictsByChunk) {
    const own = texts[order];
    const hash = row.chunkHashes[order];
    if (own === undefined || hash === undefined) continue;

    try {
      // Той самий детермінований перерахунок, що й при створенні: двигун і
      // план проміжків збігаються з тими, з яких батч будувався.
      const { matches, plan } = chunkPlan(own);
      const refined = new Map<GrammarMatch, GrammarMatch | null>();

      for (const [pieceOrder, piece] of plan.pieces.entries()) {
        const content = byPiece.get(pieceOrder);
        if (content === undefined) continue;

        const pieceText = chunkText(plan.tokens, piece);
        const reviewed = parseMatches(pieceText, content as { type: string }[]);
        for (const match of matches) {
          if (match.uncertain !== true) continue;
          if (match.from < piece.start || match.to > piece.end) continue;
          refined.set(match, verdictFor(match, piece.start, reviewed).match);
        }
      }

      await saveAnalysis(hash, toStored(applyVerdicts(matches, refined)), wordsIn(own));
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

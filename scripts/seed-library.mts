/**
 * Засів публічної бібліотеки й тарифів (CONCEPT 9, фаза 2).
 *
 * Скрипт лише конвертує, валідує й пише — і НЕ МАЄ ПРАВА звертатися до
 * Anthropic: розмітку часів дають артефакти в репозиторії (`src/content/
 * library/<slug>/matches.json`), розмічені раніше двигуном (`make import-book`)
 * або вручну через Claude CLI. `words`, `stats` і `frequency` рахуються тут же, локально,
 * тим самим кодом, що й застосунок (`analyzer/tenses.ts`, `analyzer/
 * vocabulary.ts`) — модель для цього підрахунку не потрібна.
 *
 * Шляхи імпортів тут ВІДНОСНІ, а не через alias `@/`: цей файл виконує `tsx`
 * поза Next.js, і `tsconfig.json` для нього не діє напряму.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { eq } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { DEFAULT_PLANS } from '../src/lib/access/limits.ts';
import { chunksOf } from '../src/lib/analyzer/chunks.ts';
import { statsOf, tokenize } from '../src/lib/analyzer/tenses.ts';
import { wordFrequency } from '../src/lib/analyzer/vocabulary.ts';
import { wordTokens } from '../src/lib/analyzer/words.ts';
import * as schema from '../src/db/schema.ts';
import { type Artifact, parseArtifact, toTokenMatches, validate } from '../src/lib/library/artifact.ts';
import { TENSE_KEYS, type TenseKey } from '../src/types/content.ts';

type Db = NodePgDatabase<typeof schema>;

const LIBRARY_DIR = path.join(process.cwd(), 'src/content/library');

interface StoryMeta {
  title: string;
  author: string;
  source: string;
  license: string;
  sourceUrl: string;
  sortOrder: number;
}

interface LoadedStory {
  slug: string;
  meta: StoryMeta;
  text: string;
  artifact: Artifact;
  /** sha256(story.txt + matches.json) — рівно вміст двох файлів, основа ідемпотентності. */
  artifactHash: string;
}

/**
 * `DATABASE_URL` так само, як читає `drizzle.config.ts`: `.env.local` і `.env`
 * через `process.loadEnvFile`, оболонка сильніша за файл. Без нього — зрозуміла
 * помилка, а не падіння десь усередині `pg`.
 */
function loadDatabaseUrl(): string {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Файла немає — нормально: змінну можна передати й через оболонку.
    }
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Немає DATABASE_URL. Додайте його в .env.local або передайте у виклику:\n' +
        '  DATABASE_URL=postgres://eg:eg@localhost:5433/english_grammar npm run db:seed',
    );
  }
  return url;
}

function requireString(obj: Record<string, unknown>, key: string, file: string): string {
  const value = obj[key];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${file}: ${key} — відсутнє або порожнє обовʼязкове поле`);
  }
  return value;
}

/** Строгий парсер `story.json`: обовʼязкові поля й тип кожного, з назвою файлу в помилці. */
function parseStoryMeta(raw: unknown, file: string): StoryMeta {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`${file}: story.json мусить бути обʼєктом`);
  }
  const obj = raw as Record<string, unknown>;

  const sortOrder = obj.sortOrder;
  if (!Number.isInteger(sortOrder)) {
    throw new Error(`${file}: sortOrder — мусить бути цілим числом, отримано ${JSON.stringify(sortOrder)}`);
  }

  return {
    title: requireString(obj, 'title', file),
    author: requireString(obj, 'author', file),
    source: requireString(obj, 'source', file),
    license: requireString(obj, 'license', file),
    sourceUrl: requireString(obj, 'sourceUrl', file),
    sortOrder: sortOrder as number,
  };
}

/**
 * Читає й перевіряє одне оповідання. Кидає з назвою конкретного файлу на
 * будь-якій помилці — і саме тому весь список оповідань завантажується
 * ПОВНІСТЮ до того, як почнеться будь-який запис у базу (`main`): часткового
 * засіву при зіпсованому артефакті бути не може.
 */
function loadStory(slug: string): LoadedStory {
  const dir = path.join(LIBRARY_DIR, slug);
  const textFile = path.join(dir, 'story.txt');
  const metaFile = path.join(dir, 'story.json');
  const matchesFile = path.join(dir, 'matches.json');

  const text = readFileSync(textFile, 'utf8');
  const meta = parseStoryMeta(JSON.parse(readFileSync(metaFile, 'utf8')), metaFile);
  const matchesRaw = readFileSync(matchesFile, 'utf8');

  const artifact = parseArtifact(JSON.parse(matchesRaw), matchesFile);
  const matches = toTokenMatches(text, artifact);
  validate(text, artifact, matches, matchesFile);

  // Хеш пари файлів — не переперетвореного JSON, а рівно того, що лежить на
  // диску: інакше зміна форматування без зміни змісту вважалася б новою версією.
  const artifactHash = createHash('sha256').update(text).update(matchesRaw).digest('hex');

  return { slug, meta, text, artifact, artifactHash };
}

function loadAllStories(): LoadedStory[] {
  const entries = readdirSync(LIBRARY_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  return entries.map((entry) => loadStory(entry.name));
}

/**
 * `stories.stats`: лише кількості (SC-9), без прикладів — вони живуть лише в UI
 * підсвітки.
 *
 * Числа збираються обходом `TENSE_KEYS`, а не переліком ключів вручну. Раніше
 * тут стояв літерал на `ps`/`pc`/`pp`, і це був тихий баг: тип обіцяв усі
 * конструкції, а віддавав три, тому оповідання, засіяне теперішніми чи
 * майбутніми часами, втратило б їхні кількості без жодної помилки. Компілятор
 * цього не ловив, бо `scripts/*.mts` не потрапляли в `include` tsconfig.
 */
function tenseCounts(stats: Record<TenseKey, { count: number }>): Record<TenseKey, number> {
  return Object.fromEntries(TENSE_KEYS.map((key) => [key, stats[key].count])) as Record<
    TenseKey,
    number
  >;
}

/**
 * Пише одне оповідання: upsert `stories` по slug + повний перепис
 * `story_matches` в одній транзакції. Пропускає, якщо в базі вже є той самий
 * `artifactHash` (SC-4) — без запиту жодного запису, окрім самого читання.
 */
async function seedStory(db: Db, story: LoadedStory): Promise<{ status: 'seeded' | 'skipped'; chunks: number }> {
  const existing = await db
    .select({ artifactHash: schema.stories.artifactHash })
    .from(schema.stories)
    .where(eq(schema.stories.slug, story.slug));

  if (existing[0]?.artifactHash === story.artifactHash) {
    return { status: 'skipped', chunks: 0 };
  }

  const tokens = tokenize(story.text);
  const matches = toTokenMatches(story.text, story.artifact);
  const words = wordTokens(tokens).length;
  const stats = tenseCounts(statsOf(tokens, matches));
  const frequency = wordFrequency(story.text);
  const realChunks = chunksOf(tokens);

  await db.transaction(async (tx) => {
    await tx
      .insert(schema.stories)
      .values({
        slug: story.slug,
        title: story.meta.title,
        author: story.meta.author,
        source: story.meta.source,
        license: story.meta.license,
        sourceUrl: story.meta.sourceUrl,
        body: story.text,
        words,
        stats,
        frequency,
        sortOrder: story.meta.sortOrder,
        artifactHash: story.artifactHash,
        seedModel: story.artifact.seedModel ?? null,
        rulesVersion: story.artifact.rulesVersion ?? null,
        seededAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.stories.slug,
        set: {
          title: story.meta.title,
          author: story.meta.author,
          source: story.meta.source,
          license: story.meta.license,
          sourceUrl: story.meta.sourceUrl,
          body: story.text,
          words,
          stats,
          frequency,
          sortOrder: story.meta.sortOrder,
          artifactHash: story.artifactHash,
          seedModel: story.artifact.seedModel ?? null,
          rulesVersion: story.artifact.rulesVersion ?? null,
          seededAt: new Date(),
        },
      });

    // Повний перепис шматків оповідання: старі можуть лишитися від попередньої
    // розмітки з іншою кількістю чи межами шматків, часткове злиття тут ризикованіше,
    // ніж переписати все заново в тій самій транзакції.
    await tx.delete(schema.storyMatches).where(eq(schema.storyMatches.slug, story.slug));

    if (realChunks.length > 0) {
      await tx.insert(schema.storyMatches).values(
        realChunks.map((chunk, index) => ({
          slug: story.slug,
          chunkIndex: index,
          fromToken: chunk.start,
          toToken: chunk.end,
          // Збіг кладеться цілим — разом із `rule`: на ньому стоїть картка
          // слова в читалці, і звуження полів тут уже раз мовчки його з'їло.
          matches: matches.filter((match) => match.from >= chunk.start && match.to <= chunk.end),
        })),
      );
    }
  });

  return { status: 'seeded', chunks: realChunks.length };
}

/** Тарифи — upsert по `code`; значення завжди йдуть з константи, база лише кешує їх для запитів. */
async function seedPlans(db: Db): Promise<number> {
  for (const plan of DEFAULT_PLANS) {
    await db
      .insert(schema.plans)
      .values(plan)
      .onConflictDoUpdate({
        target: schema.plans.code,
        set: {
          title: plan.title,
          monthlyWords: plan.monthlyWords,
          priceCents: plan.priceCents,
          currency: plan.currency,
          active: plan.active,
          sortOrder: plan.sortOrder,
        },
      });
  }
  return DEFAULT_PLANS.length;
}

async function main(): Promise<void> {
  // Завантажуємо й перевіряємо ВСІ оповідання до першого запису в базу: помилка
  // в одному файлі не має права лишити бібліотеку в частково засіяному стані.
  const stories = loadAllStories();

  const url = loadDatabaseUrl();
  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('host=/cloudsql') || url.includes('localhost') ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
  const db = drizzle(pool, { schema });

  try {
    let seeded = 0;
    let skipped = 0;
    let chunksWritten = 0;

    for (const story of stories) {
      const result = await seedStory(db, story);
      if (result.status === 'seeded') {
        seeded += 1;
        chunksWritten += result.chunks;
        console.log(`засіяно: ${story.slug} (${result.chunks} шматків)`);
      } else {
        skipped += 1;
        console.log(`пропущено (той самий artifactHash): ${story.slug}`);
      }
    }

    const plansCount = await seedPlans(db);

    console.log('---');
    console.log(`оповідань засіяно: ${seeded}`);
    console.log(`оповідань пропущено: ${skipped}`);
    console.log(`шматків записано: ${chunksWritten}`);
    console.log(`тарифів засіяно: ${plansCount}`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

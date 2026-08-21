import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

import type { TenseKey } from '@/types/content';

/* ============================================================
   Таблиці Auth.js — структура задана адаптером, змінювати не можна
   ============================================================ */

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

/* ============================================================
   Дані застосунку. Що саме зберігається за акаунтом — CONCEPT 8.3
   ============================================================ */

/** Прочитані розділи: однаковий прогрес на всіх пристроях. */
export const progress = pgTable(
  'progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    topicSlug: varchar('topic_slug', { length: 64 }).notNull(),
    sectionId: varchar('section_id', { length: 64 }).notNull(),
    readAt: timestamp('read_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.topicSlug, table.sectionId] })],
);

/** Словник зі статусами — головний накопичений актив користувача. */
export const words = pgTable(
  'words',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    word: varchar('word', { length: 64 }).notNull(),
    /** unknown | learning | known */
    status: varchar('status', { length: 16 }).notNull(),
    /** Власна нотатка користувача: переклад, мнемоніка, приклад із життя */
    note: varchar('note', { length: 200 }),
    /** Дата останнього повторення — основа майбутнього режиму повторення */
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.word] })],
);

/** Бібліотека проаналізованих текстів (CONCEPT 9, пункт 2). */
export const texts = pgTable(
  'texts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('texts_user_created_idx').on(table.userId, table.createdAt, table.id)],
);

/** Історія спроб тестів: видно, які теми просіли. */
export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  topicSlug: varchar('topic_slug', { length: 64 }).notNull(),
  correct: integer('correct').notNull(),
  total: integer('total').notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }).notNull(),
});

/** Налаштування: тема оформлення, остання відкрита тема, нагадування. */
export const settings = pgTable('settings', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: varchar('theme', { length: 8 }),
  lastTopic: varchar('last_topic', { length: 64 }),
  remindersEnabled: integer('reminders_enabled').notNull().default(0),
});

/* ============================================================
   Кеш словника. Спільний для всіх користувачів: стаття про «deploy»
   однакова для кожного, тому колонки власника тут немає й бути не може
   ============================================================ */

/** Кеш словникових статей із Wiktionary — щоб не питати джерело двічі. */
export const dictionary = pgTable('dictionary', {
  /** запитане слово в нижньому регістрі — саме воно ключ пошуку */
  word: varchar('word', { length: 64 }).primaryKey(),
  /** лема, з якої взято IPA й означення; === word, якщо слово вже лема */
  lemma: varchar('lemma', { length: 64 }).notNull(),
  ipa: varchar('ipa', { length: 128 }),
  definitions: jsonb('definitions').$type<string[]>().notNull().default([]),
  /** короткі навчальні приклади */
  examples: jsonb('examples').$type<string[]>().notNull().default([]),
  /** літературні цитати — довгі, тому окремо */
  quotes: jsonb('quotes').$type<string[]>().notNull().default([]),
  audioUrl: text('audio_url'),
  // source/license/sourceUrl — не декорація й не дубль константи: показ статті
  // без назви джерела, ліцензії та посилання на конкретну сторінку виводить нас
  // за межі CC BY-SA, тому атрибуція лежить у кеші поряд з даними.
  source: varchar('source', { length: 16 }).notNull(),
  license: varchar('license', { length: 32 }).notNull(),
  sourceUrl: text('source_url').notNull(),
  /** true — джерело статті не має; тримаємо, щоб не питати щоразу */
  miss: integer('miss').notNull().default(0),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Кеш розбору тексту моделлю. Теж спільний для всіх: розмітка часів залежить
 * тільки від тексту, а не від того, хто його читає.
 *
 * На відміну від словника, TTL тут немає й не потрібен: відповідь застаріває не
 * з часом, а від зміни моделі чи промпту — і те, і те входить у ключ, тому
 * стара відповідь просто перестає знаходитись.
 */
export const analyses = pgTable('analyses', {
  /** sha256 від моделі, версії промпту й самого тексту — див. `analyzer/cache.ts` */
  hash: varchar('hash', { length: 64 }).primaryKey(),
  /** Збіги як індекси токенів: [{ from, to, tense }] */
  matches: jsonb('matches').$type<{ from: number; to: number; tense: string }[]>().notNull().default([]),
  // Модель і версія промпту вже зашиті в хеш, але лежать і колонками: без них
  // неможливо ні порахувати, скільки коштував кеш, ні прибрати рядки однієї
  // моделі, не перебираючи весь текстовий корпус заново.
  model: varchar('model', { length: 64 }).notNull(),
  promptVersion: integer('prompt_version').notNull(),
  /** Скільки слів у розібраному тексті — для оцінки витрат за логами */
  words: integer('words').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Батчі розбору. Книжка після завантаження йде в Batch API цілком: він удвічі
 * дешевший за синхронний і, головне, встигає розібрати весь текст, поки читач
 * дійде до нього — тоді жодна сторінка не чекає, а статистика стає точною по
 * всьому документу, а не по прочитаному.
 *
 * Рядок потрібен саме тому, що батч асинхронний: ручка Next.js живе стільки ж,
 * скільки запит, фонового воркера немає, і зв'язок «цей документ → цей батч»
 * ніде більше не зберігся б.
 */
export const analysisBatches = pgTable('analysis_batches', {
  /** sha256 всього тексту документа — за ним ручка знаходить свій батч */
  docHash: varchar('doc_hash', { length: 64 }).primaryKey(),
  /** Ідентифікатор батча в Anthropic */
  batchId: varchar('batch_id', { length: 128 }).notNull(),
  /**
   * Хеші шматків у порядку, який задає `custom_id` (`c0`, `c1`, …). Без цього
   * списку результат батча нікуди покласти: `custom_id` має обмежену довжину,
   * тому хеш у нього не влазить, а відновити порядок з тексту можна лише поки
   * текст десь є — а для незбереженого документа його немає ніде.
   */
  chunkHashes: jsonb('chunk_hashes').$type<string[]>().notNull(),
  /**
   * Текст документа. Лежить тут, поки батч не забрано, бо перекласти відповідь
   * моделі в номери токенів можна лише маючи сам текст — модель нумерує слова,
   * а підсвітка працює з токенами. Альтернатива — щоб клієнт присилав книжку в
   * кожному опитуванні, тобто сотні кілобайтів що півхвилини протягом години.
   * Після перенесення результатів обнуляється: далі він тут ні до чого.
   */
  docText: text('doc_text'),
  /** Заповнюється, коли результати вже перенесені в `analyses` */
  ingestedAt: timestamp('ingested_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ============================================================
   Публічна бібліотека, тарифи й облік слів — гостьовий доступ і підписки
   ============================================================ */

/** Оповідання публічної бібліотеки: читається без входу, на відміну від `texts`. */
export const stories = pgTable('stories', {
  /** Він же частина URL `/library/<slug>` — людський ключ, не згенерований id. */
  slug: varchar('slug', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  // Як і в `dictionary`: атрибуція лежить поряд із текстом, а не в константі —
  // оповідання бібліотеки можуть мати різні джерела й ліцензії одночасно.
  source: varchar('source', { length: 32 }).notNull(),
  license: varchar('license', { length: 48 }).notNull(),
  sourceUrl: text('source_url').notNull(),
  body: text('body').notNull(),
  words: integer('words').notNull(),
  /** Готові кількості часів (SC-9) — раховано раз під час засіву, не на льоту. */
  stats: jsonb('stats').$type<Record<TenseKey, number>>().notNull(),
  /** Частотність слів, порахована локально `wordFrequency()` під час засіву. */
  frequency: jsonb('frequency').$type<{ word: string; count: number }[]>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  /** sha256 пари «текст + розмітка» — основа ідемпотентності повторного засіву. */
  artifactHash: varchar('artifact_hash', { length: 64 }).notNull(),
  /** Довідка, чим саме розмічено, а не критерій пошуку — не частина ключа. */
  seedModel: varchar('seed_model', { length: 64 }),
  seededAt: timestamp('seeded_at', { withTimezone: true }),
});

/**
 * Розмітка часів по оповіданню, шматками — так само, як розбір користувацьких
 * текстів шматкується у `analyzer/chunks.ts`.
 *
 * PK `(slug, chunkIndex)` СВІДОМО не містить ні моделі, ні версії промпту — на
 * відміну від `analyses` (SC-2). Причина: гостю API аналізатора закритий, тому
 * промах кешу тут не має запасного шляху назад до моделі, і зміна
 * `PROMPT_VERSION` чи `ANTHROPIC_MODEL` тихо знеструмила б усю бібліотеку —
 * замість зайвого перерахунку кешу читачі побачили б порожню розмітку.
 */
export const storyMatches = pgTable(
  'story_matches',
  {
    slug: varchar('slug', { length: 64 })
      .notNull()
      .references(() => stories.slug, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    /** Межі шматка в токенах документа — той самий рахунок, що й у `analyses`. */
    fromToken: integer('from_token').notNull(),
    toToken: integer('to_token').notNull(),
    matches: jsonb('matches').$type<{ from: number; to: number; tense: string }[]>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.slug, table.chunkIndex] })],
);

/** Тарифи. Рядки засіваються з `DEFAULT_PLANS` (`src/lib/access/limits.ts`). */
export const plans = pgTable('plans', {
  code: varchar('code', { length: 16 }).primaryKey(),
  title: text('title'),
  monthlyWords: integer('monthly_words').notNull(),
  priceCents: integer('price_cents').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  /** 1/0, не boolean — той самий стиль прапорця, що й `settings.remindersEnabled`. */
  active: integer('active').notNull().default(1),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Стан підписки: один активний тариф на користувача. */
export const subscriptions = pgTable('subscriptions', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  planCode: varchar('plan_code', { length: 16 }).notNull(),
  /** active | canceled | past_due */
  status: varchar('status', { length: 16 }).notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  /** 'manual' зараз — місце під майбутній платіжний провайдер без міграції. */
  activatedVia: varchar('activated_via', { length: 16 }).notNull().default('manual'),
  /** Чим підтверджена ручна активація — щоб розібрати спірний випадок без логів. */
  note: text('note'),
});

/**
 * Облік витрачених слів за місяць. Період рядком `YYYY-MM`, а не датою,
 * навмисно: місяць — ключ агрегації, і рядок робить `ON CONFLICT` тривіальним
 * інкрементом (`src/lib/access/index.ts`, `consumeWords`) без попереднього
 * `SELECT`.
 */
export const analysisUsage = pgTable(
  'analysis_usage',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    period: varchar('period', { length: 7 }).notNull(),
    words: integer('words').notNull().default(0),
    calls: integer('calls').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.period] })],
);

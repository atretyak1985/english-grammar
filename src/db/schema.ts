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

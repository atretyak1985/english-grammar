import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit — окремий CLI, а не частина Next.js, тому файли `.env*` сам не
 * читає: без цього `npm run db:push` падає з `url: ''`, хоч застосунок працює.
 * `loadEnvFile` не перебиває вже задані змінні, тож пріоритет той самий, що в
 * Next.js: значення з оболонки сильніше за файл, а `.env.local` — за `.env`.
 */
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
      '  DATABASE_URL=postgres://eg:eg@localhost:5433/english_grammar npm run db:push',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url },
  verbose: true,
  strict: true,
});

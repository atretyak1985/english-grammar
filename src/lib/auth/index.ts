import { headers } from 'next/headers';

import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth, { type NextAuthResult, type Session } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';

import { getDb, schema } from '@/db';

/**
 * Вхід без пароля: адреса пошти → лист із посиланням → сеанс, плюс Google
 * для тих, хто не хоче чекати листа (CONCEPT 8.2). Реєстрації як окремого
 * кроку немає — перший вхід і є реєстрацією.
 *
 * Якщо база або провайдери не налаштовані, автентифікація просто вимкнена:
 * сайт лишається повністю робочим анонімно.
 */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET);
}

function providers(): Provider[] {
  const list: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    list.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    );
  }

  if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
    list.push(
      Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    );
  }

  return list;
}

const db = getDb();

const result: NextAuthResult = NextAuth({
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: schema.users,
        accountsTable: schema.accounts,
        sessionsTable: schema.sessions,
        verificationTokensTable: schema.verificationTokens,
      })
    : undefined,
  providers: providers(),
  session: { strategy: 'database' },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
});

export const { handlers, signIn, signOut } = result;

/**
 * Сеанс або null. Ніколи не кидає — без налаштованого входу сайт працює як гість.
 *
 * Заголовки читаються ПЕРШИМ рядком, до перевірки налаштувань, і це не
 * формальність. Без цього звертання гілка «вхід не налаштований» не торкається
 * запиту зовсім, Next вважає сторінку статичною і запікає її під час збірки — а
 * в образі змінних середовища немає. Наслідок: у продакшені з робочим входом
 * сторінка назавжди показує «вхід ще не налаштований», і жоден перезапуск цього
 * не змінює, бо HTML уже готовий.
 */
export async function currentSession(): Promise<Session | null> {
  await headers();
  if (!isAuthConfigured()) return null;
  try {
    return await result.auth();
  } catch {
    return null;
  }
}

/** Список доступних способів входу — потрібен сторінці /login. */
export function availableProviders(): { google: boolean; email: boolean } {
  return {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    email: Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM),
  };
}

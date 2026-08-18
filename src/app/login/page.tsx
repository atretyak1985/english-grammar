import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { availableProviders, currentSession, isAuthConfigured, signIn } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Вхід',
  description: 'Вхід без пароля: адреса пошти або Google. Вхід лише вмикає синхронізацію.',
};

/**
 * Вхід не обов'язковий (CONCEPT 8.1): усе працює анонімно, а вхід лише
 * вмикає синхронізацію. При першому вході локальний стан зливається з акаунтом.
 */
export default async function LoginPage() {
  const session = await currentSession();
  if (session?.user) redirect('/account');

  const providers = availableProviders();

  return (
    <div className="mx-auto max-w-[520px] px-5 py-14">
      <h1 className="mt-0 mb-2 text-[28px] font-bold tracking-[-0.6px]">Вхід</h1>
      <p className="text-ink-2 mt-0 mb-6 text-[16px]">
        Реєстрації як окремого кроку немає — перший вхід і є реєстрацією. Прогрес, який ви вже
        зібрали в цьому браузері, <b>зливається</b> з акаунтом, а не перезаписується.
      </p>

      {!isAuthConfigured() ? (
        <div className="bg-surface shadow-card border-l-pc my-4 rounded-r-[10px] border-l-4 px-4 py-3.5 text-[14.5px]">
          <b>Вхід ще не налаштований.</b> Потрібні змінні середовища <code>DATABASE_URL</code> і{' '}
          <code>AUTH_SECRET</code>, плюс хоча б один провайдер. Дивіться{' '}
          <code>.env.example</code> і README.
        </div>
      ) : null}

      {providers.email ? (
        <form
          action={async (formData: FormData) => {
            'use server';
            await signIn('nodemailer', formData);
          }}
          className="bg-surface border-line rounded-card shadow-card border px-5 py-5"
        >
          <label htmlFor="email" className="text-[13.5px] font-bold">
            Адреса пошти
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="border-line focus:border-ps mt-1.5 w-full rounded-lg border px-3 py-2 text-[15px] outline-none"
          />
          <button
            type="submit"
            className="bg-ps mt-3 w-full cursor-pointer rounded-lg px-3 py-2 text-[14px] font-bold text-white"
          >
            Надіслати посилання для входу
          </button>
          <p className="text-ink-3 mt-2 mb-0 text-[12.5px]">
            Пароля немає: у листі буде посилання, яке відкриє сеанс.
          </p>
        </form>
      ) : null}

      {providers.google ? (
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/account' });
          }}
          className="mt-3"
        >
          <button
            type="submit"
            className="border-line bg-surface hover:border-line-strong w-full cursor-pointer rounded-lg border px-3 py-2 text-[14px] font-bold"
          >
            Увійти через Google
          </button>
        </form>
      ) : null}

      <p className="text-ink-3 mt-6 text-[14px]">
        <Link href="/" className="text-ps-dk font-semibold">
          Продовжити без входу →
        </Link>{' '}
        Прогрес зберігатиметься лише в цьому браузері.
      </p>
    </div>
  );
}

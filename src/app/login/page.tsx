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
 *
 * Екран накриває оболонку цілком: у момент входу сайдбар і шапка не потрібні.
 */
export default async function LoginPage() {
  const session = await currentSession();
  if (session?.user) redirect('/account');

  const providers = availableProviders();

  return (
    <div className="bg-bg fixed inset-0 z-[200] grid grid-cols-1 overflow-y-auto lg:grid-cols-2">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(150deg,var(--hero-1)_0%,var(--hero-2)_55%,var(--hero-3)_100%)] px-[52px] py-14 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(700px_320px_at_82%_12%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(620px_300px_at_8%_92%,rgba(37,99,235,0.32),transparent_60%)]"
        />
        <div className="relative">
          <div className="flex items-center gap-[9px]">
            <span
              className="h-[26px] w-[26px] rounded-lg"
              style={{ backgroundImage: 'linear-gradient(140deg, #7dabff, #b294f7)' }}
              aria-hidden
            />
            <span className="text-[14.5px] font-extrabold">Граматика англійської</span>
          </div>
          <h1 className="mt-[38px] mb-3.5 text-[34px] leading-[1.14] font-extrabold tracking-[-1px]">
            Словник і прогрес —
            <br />
            на всіх пристроях
          </h1>
          <p className="text-hero-lede m-0 max-w-[420px] text-[16px]">
            Вхід потрібен лише для синхронізації. Усе, що ви вже позначили в цьому браузері, при
            першому вході приєднається до акаунта — нічого не втратиться.
          </p>
        </div>
        <div className="text-hero-lede relative flex flex-col gap-[11px] text-[14px]">
          <div className="flex gap-2.5">
            <span className="font-extrabold text-[#7dabff]">→</span>Прочитані розділи і результати
            тестів
          </div>
          <div className="flex gap-2.5">
            <span className="font-extrabold text-[#f0b45f]">→</span>Словник зі статусами «вчу / знаю»
          </div>
          <div className="flex gap-2.5">
            <span className="font-extrabold text-[#b294f7]">→</span>Бібліотека проаналізованих текстів
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-[30px] py-10">
        <div className="w-full max-w-[380px]">
          <h2 className="mt-0 mb-1.5 text-[25px] font-extrabold tracking-[-0.6px]">Вхід</h2>
          <p className="text-ink-2 mt-0 mb-[22px] text-[14.5px]">
            Введіть пошту — надішлемо посилання для входу. Пароля немає: перший вхід і є
            реєстрацією.
          </p>

          {!isAuthConfigured() ? (
            <div className="bg-surface shadow-card border-l-pc mb-4 rounded-r-[10px] border-l-4 px-4 py-3.5 text-[13.5px]">
              <b>Вхід ще не налаштований.</b> Потрібні змінні середовища <code>DATABASE_URL</code> і{' '}
              <code>AUTH_SECRET</code>, плюс хоча б один провайдер.
            </div>
          ) : null}

          {providers.email ? (
            <form
              action={async (formData: FormData) => {
                'use server';
                await signIn('nodemailer', formData);
              }}
            >
              <label
                htmlFor="email"
                className="text-ink-3 mb-1.5 block text-[12px] font-extrabold tracking-[0.6px] uppercase"
              >
                Пошта
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="border-line bg-surface text-ink rounded-input w-full border px-[13px] py-[11px] text-[14.5px] leading-[normal] outline-none"
              />
              {/* Місце під помилку зарезервоване, щоб кнопка не стрибала */}
              <div className="text-no mt-[5px] min-h-[18px] text-[12.5px]" />
              <button
                type="submit"
                className="bg-ps rounded-input mt-1.5 w-full cursor-pointer border-0 py-3 text-[14px] leading-[normal] font-extrabold text-white hover:brightness-[1.08]"
              >
                Надіслати посилання
              </button>
            </form>
          ) : null}

          {providers.email && providers.google ? (
            <div className="text-ink-3 my-5 flex items-center gap-3 text-[12px] font-bold">
              <span className="bg-line h-px flex-1" />
              АБО
              <span className="bg-line h-px flex-1" />
            </div>
          ) : null}

          {providers.google ? (
            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/account' });
              }}
            >
              <button
                type="submit"
                className="border-line bg-surface text-ink rounded-input hover:bg-hover w-full cursor-pointer border py-[11px] text-[14px] leading-[normal] font-bold"
              >
                Увійти через Google
              </button>
            </form>
          ) : null}

          <Link
            href="/"
            className="text-ink-3 hover:text-ink mt-[18px] block w-full py-1.5 text-center text-[13px] leading-[normal] font-bold"
          >
            Продовжити без входу
          </Link>
          <p className="text-ink-3 mt-3.5 mb-0 text-[12px] leading-[1.5]">
            Без входу прогрес і словник лишаються тільки в цьому браузері.
          </p>
        </div>
      </div>
    </div>
  );
}

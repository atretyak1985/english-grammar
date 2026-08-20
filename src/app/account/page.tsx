import type { Metadata } from 'next';

import { AccountScreen } from '@/components/account/AccountScreen';
import { currentSession, signOut } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Кабінет',
  description: 'Прогрес, бібліотека текстів, історія тестів і експорт даних.',
};

export default async function AccountPage() {
  const session = await currentSession();
  const email = session?.user?.email ?? null;

  return (
    <>
      <AccountScreen email={email} />

      {session?.user ? (
        <div className="mx-auto max-w-content px-[30px] pb-10">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button
              type="submit"
              className="text-ink-3 hover:text-no cursor-pointer text-[13px] font-semibold"
            >
              Вийти з акаунта
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AccountScreen } from '@/components/account/AccountScreen';
import { resolveAccess } from '@/lib/access';
import { DEFAULT_PLANS } from '@/lib/access/limits';
import { listPlans } from '@/lib/access/plans';
import { currentSession, signOut } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Кабінет',
  description: 'Прогрес, бібліотека текстів, історія тестів і експорт даних.',
};

/**
 * Кабінет належить акаунту (SC-8): усе, що він показує (словник, бібліотека,
 * історія тестів, квота), прив'язане до `userId`, тому без сесії тут немає
 * порожньої версії, а є редірект на вхід із поверненням назад через `?next=`.
 */
export default async function AccountPage() {
  const session = await currentSession();
  if (!session?.user) redirect('/login?next=/account');

  const email = session.user.email ?? null;

  const [access, plans] = await Promise.all([resolveAccess(), listPlans()]);
  const planTitle =
    plans.find((plan) => plan.code === access.planCode)?.title ??
    DEFAULT_PLANS.find((plan) => plan.code === access.planCode)?.title ??
    access.planCode;

  return (
    <>
      <div className="mx-auto max-w-content px-[30px] pt-[30px]">
        <div className="bg-surface border-line rounded-panel shadow-card flex flex-wrap items-center justify-between gap-4 border px-5 py-4">
          <div>
            <div className="text-ink-3 text-[11.5px] font-bold tracking-[0.9px] uppercase">
              Тариф «{planTitle}»
            </div>
            {/* Цифра читається з `analysisUsage` (Postgres), а не з IP-вікна в
                памʼяті процесу (`src/lib/analyzer/throttle.ts`) — тому переживає
                перезапуск застосунку (SC-7). */}
            <div className="mt-1 text-[15px] font-bold">
              {access.usedWords.toLocaleString('uk-UA')} / {access.monthlyWords.toLocaleString('uk-UA')} слів за{' '}
              {access.period}
            </div>
          </div>
          <Link
            href="/pricing"
            className="border-line text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 cursor-pointer border px-3.5 py-2 text-[12.5px] leading-[normal] font-bold"
          >
            Тарифи
          </Link>
        </div>
      </div>

      <AccountScreen email={email} />

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
    </>
  );
}

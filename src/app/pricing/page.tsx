import type { Metadata } from 'next';

import { listPlans } from '@/lib/access/plans';

export const metadata: Metadata = {
  title: 'Тарифи',
  description: 'Місячний обсяг слів аналізу за тарифом. Активація поки ручна, без оплати картою.',
};

/** Що саме відкриває тариф — короткий підпис під обсягом; невідомий код теж має розумний текст. */
const PLAN_DESCRIPTIONS: Record<string, string> = {
  free: 'Аналізатор тексту з підсвіткою часів у межах безкоштовного місячного ліміту.',
  basic: 'У рази більший місячний обсяг аналізу, ніж на безкоштовному тарифі — для регулярного читання.',
  pro: 'Найбільший місячний обсяг — для довгих текстів і цілих книжок.',
};

/**
 * Куда писати за активацією. Береться з оточення, а НЕ зашивається в код:
 * жодної скриньки в проєкті не налаштовано, і назвати вигадану адресу було б
 * гірше за відсутність кнопки — користувач, який хоче заплатити, написав би в
 * нікуди й вирішив, що його проігнорували. Немає змінної → немає й
 * `mailto:`-посилань, лишається чесний текст.
 *
 * Той самий принцип необов'язкового шару, що вже діє для бази, ключа Anthropic
 * і провайдерів входу: `availableProviders()` не показує кнопку Google, коли
 * облікових даних немає.
 */
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? null;

function formatPrice(priceCents: number, currency: string): string {
  // Оплата ще не інтегрована (окрема епіка) — поки жодний тариф не має ціни,
  // яку застосунок міг би стягнути, тож 0 центів чесно показуємо як «Безкоштовно»,
  // а не як «$0.00», що виглядало б зламаною ціною.
  if (priceCents === 0) return 'Безкоштовно';
  return `${(priceCents / 100).toLocaleString('uk-UA', { minimumFractionDigits: 2 })} ${currency} / міс`;
}

/**
 * Вітрина тарифів — доступна й гостю, без входу. Кнопка активації не веде на
 * оплату (SC-11): платіжного провайдера ще немає, тому це чесна заглушка —
 * пошта, на яку написати, і пояснення, що активацію робить оператор вручну
 * (`make grant-plan`), а не сама сторінка.
 */
export default async function PricingPage() {
  const plans = await listPlans();

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-[70px]">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Тарифи</h1>
      <p className="text-ink-2 mb-6 max-w-[52rem] text-[14px]">
        Місячний обсяг слів аналізу за тарифом. Оплата картою поки не підключена — активація
        ручна.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {plans.map((plan) => (
          <div
            key={plan.code}
            className="bg-surface border-line rounded-card shadow-card flex flex-col gap-3 border px-[22px] py-5"
          >
            <div>
              <div className="text-[18px] font-extrabold tracking-[-0.3px]">{plan.title}</div>
              <div className="text-ink-2 mt-1 text-[14px]">
                {plan.monthlyWords.toLocaleString('uk-UA')} слів / місяць
              </div>
            </div>

            <div className="text-[22px] font-extrabold tracking-[-0.4px]">
              {formatPrice(plan.priceCents, plan.currency)}
            </div>

            <p className="text-ink-2 m-0 text-[13px] leading-[1.5]">
              {PLAN_DESCRIPTIONS[plan.code] ?? 'Аналіз тексту з підсвіткою часів у межах місячного обсягу.'}
            </p>

            {plan.code === 'free' ? (
              <div className="text-ink-3 mt-auto text-[12.5px] font-bold">Доступно одразу після реєстрації</div>
            ) : CONTACT_EMAIL !== null ? (
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Активація тарифу ${plan.title}`)}`}
                className="border-line text-ink rounded-btn hover:bg-hover mt-auto inline-block border px-3.5 py-[9px] text-center text-[12.5px] leading-[normal] font-bold"
              >
                Попросити активацію
              </a>
            ) : (
              <div className="text-ink-3 mt-auto text-[12.5px] font-bold">Активація вручну</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-surface border-line shadow-card mt-6 rounded-r-[10px] border-l-4 border-l-pc px-4 py-3.5 text-[13.5px]">
        {CONTACT_EMAIL !== null ? (
          <>
            Активація зараз повністю ручна: напишіть на{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline">
              {CONTACT_EMAIL}
            </a>
            , вказавши пошту акаунта і бажаний тариф — оператор підніме ліміт вручну.
          </>
        ) : (
          <>
            <b>Активація зараз повністю ручна.</b> Канал звернення ще не налаштований, тому
            сторінка не називає адреси, якої немає: оператор підіймає ліміт командою{' '}
            <code>make grant-plan</code> напряму. Щоб тут з&apos;явилася кнопка з листом, задайте{' '}
            <code>CONTACT_EMAIL</code> в оточенні.
          </>
        )}{' '}
        Оплата картою поки не підключена, це окрема робота.
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';

/**
 * Підвал сайдбара: серія днів, рівень і картка користувача.
 *
 * Серія, рівень і XP — величини без джерела в цьому застосунку: ні таблиці,
 * ні провайдера під ними немає. Тому вони показані рівно тими числами, що в
 * макеті, і нічого не обіцяють понад те, що видно. Щойно зʼявиться лічильник
 * XP — сюди прийде він, а не новий компонент.
 */

/** Тиждень серії: залитий кружок — день із заняттям. */
const WEEK = [true, true, false, true, true, false, false];

const STREAK_DAYS = 4;
const LEVEL = 2;
const XP_INTO_LEVEL = 30;
const XP_PER_LEVEL = 100;

export function StreakCard({
  signedIn,
  onNavigate,
}: {
  signedIn: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="border-line flex flex-col gap-3 border-t px-4 pt-3.5 pb-4">
      <div className="flex items-center gap-2.5">
        <div className="bg-coral-bg text-coral flex h-[42px] w-[42px] flex-none items-center justify-center rounded-tile">
          <svg
            style={{ animation: 'gl-wiggle 1.8s ease-in-out infinite' }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-extrabold">Серія: {STREAK_DAYS} днів</div>
          <div className="mt-[3px] flex gap-[3px]">
            {WEEK.map((active, index) => (
              <span
                key={index}
                className={`h-3.5 w-3.5 rounded-[6px] border-[1.5px] ${
                  active ? 'border-coral bg-coral' : 'border-line bg-transparent'
                }`}
                style={index === 4 ? { animation: 'gl-pulse 2s ease-in-out infinite' } : undefined}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-[5px] flex justify-between text-[11.5px] font-extrabold">
          <span>Рівень {LEVEL}</span>
          <span className="text-ink-3">
            {XP_INTO_LEVEL} / {XP_PER_LEVEL} XP
          </span>
        </div>
        <div className="bg-tint border-line h-3 overflow-hidden rounded-pill border">
          <div
            className="h-full rounded-pill"
            style={{
              width: `${(XP_INTO_LEVEL / XP_PER_LEVEL) * 100}%`,
              backgroundImage: 'linear-gradient(90deg, var(--green), var(--acc2))',
            }}
          />
        </div>
      </div>

      {signedIn ? (
        <Link
          href="/account"
          onClick={onNavigate}
          className="border-line bg-tint hover:bg-hover flex items-center gap-2.5 rounded-tile border px-3 py-2.5 text-inherit"
        >
          <span
            className="bg-acc font-display flex h-9 w-9 flex-none items-center justify-center rounded-full text-[13px] font-extrabold text-white"
            aria-hidden
          >
            ВД
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-extrabold">Ваш акаунт</span>
            <span className="text-ink-3 block truncate text-[11px] font-bold">
              Синхронізовано · кабінет
            </span>
          </span>
        </Link>
      ) : (
        /* Гість (CONCEPT 8.4): без входу прогрес нікуди не їде, і сказати це
           треба тут, а не після втрати. */
        <div className="border-line bg-tint rounded-tile border px-3 py-2.5">
          <div className="text-ink-2 text-[11.5px] leading-[1.5] font-semibold">
            Прогрес зберігається лише в цьому браузері.
          </div>
          <Link
            href="/login"
            onClick={onNavigate}
            className="text-green-dk mt-[7px] block text-[12px] leading-[normal] font-extrabold"
          >
            Увійти для синхронізації →
          </Link>
        </div>
      )}
    </div>
  );
}

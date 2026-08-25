'use client';

import Image from 'next/image';
import Link from 'next/link';

import { READY_TOPICS } from '@/data/topics';

/**
 * Герой головної: обіцянка, дві дії і маскот.
 *
 * «Тренування» ще не існує як маршрут, тому це кнопка, а не посилання —
 * вона нічого не обіцяє, поки нікуди не веде. Привітання Alex теж без
 * джерела: лічильника XP у застосунку немає, і рядок стоїть рівно такий,
 * як у макеті.
 */
export function HomeHero() {
  const topic = READY_TOPICS[0];

  return (
    <section className="border-line bg-card rounded-hero shadow-card relative overflow-hidden border px-11 pt-10 pb-9">
      {/* Плями всередині картки — той самий шар, що й за оболонкою, лише ближче */}
      <div
        aria-hidden
        className="bg-tint absolute -top-[60px] -right-[30px] h-[260px] w-[260px] rounded-full"
        style={{ animation: 'gl-float 10s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="bg-tint absolute -bottom-20 right-[200px] h-[180px] w-[180px] rounded-[40px]"
        style={{ transform: 'rotate(16deg)', animation: 'gl-float2 12s ease-in-out infinite' }}
      />
      <svg
        aria-hidden
        className="absolute top-[30px] right-[330px]"
        style={{ animation: 'gl-wiggle 5s ease-in-out infinite' }}
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="var(--yellow)"
      >
        <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4z" />
      </svg>

      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center gap-6">
        <div>
          <span className="bg-tint text-acc rounded-pill inline-flex px-3.5 py-[5px] text-[11px] font-extrabold tracking-[0.08em] uppercase">
            Пояснення українською · приклади англійською
          </span>
          <h1 className="font-display mt-4 mb-2.5 text-[clamp(28px,3.4vw,44px)] leading-[1.1] font-extrabold [overflow-wrap:anywhere]">
            Граматика англійської без зубріння
          </h1>
          <p className="text-ink-2 m-0 mb-[22px] max-w-[520px] text-[16px] font-semibold">
            Читайте справжні тексти з підсвіткою часів, збирайте слова і тренуйте їх у міні-іграх
            разом з Alex the Linguist.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={topic ? `/topics/${topic.slug}` : '/library'}
              className="bg-green font-display rounded-nav px-[26px] py-[13px] text-[16px] leading-[normal] font-extrabold text-white shadow-[0_8px_18px_rgb(18_185_129_/_0.4)] transition-transform active:translate-y-1"
            >
              Почати читати
            </Link>
            <button
              type="button"
              disabled
              title="Тренування зʼявиться згодом"
              className="border-line text-ink-2 font-display rounded-nav cursor-default border bg-transparent px-[26px] py-[13px] text-[16px] leading-[normal] font-extrabold"
            >
              Тренування
            </button>
          </div>
        </div>

        <div className="relative" style={{ animation: 'gl-bob 4s ease-in-out infinite' }}>
          <div className="bg-tint text-acc absolute -top-3.5 -left-[30px] rounded-[18px_18px_18px_4px] px-3.5 py-[9px] text-[13px] font-extrabold shadow-[0_6px_14px_rgb(0_0_0_/_0.12)]">
            Привіт! Я Alex · сьогодні 20 XP, так тримати!
          </div>
          <Image
            src="/alex-full.png"
            alt="Alex the Linguist"
            width={370}
            height={530}
            priority
            className="block h-auto w-[230px] [filter:drop-shadow(0_16px_18px_rgb(20_60_40_/_0.28))]"
          />
        </div>
      </div>
    </section>
  );
}

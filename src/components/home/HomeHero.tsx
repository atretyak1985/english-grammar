'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * Герой головної: обіцянка, дві дії і рядок від Alex.
 *
 * Обіцянка стоїть перша й одна, бо саме її людина мусить зрозуміти за
 * п'ять секунд — «граматику видно в тексті, який ви читаєте», а не
 * «ще один застосунок з правилами». Тому демонстрація живого тексту
 * лежить праворуч від цього блоку, а не під ним: обіцянку й доказ
 * видно одночасно.
 */
export function HomeHero() {
  const { state, signedIn, ready } = useAppState();

  const learning = Object.values(state.words).filter((status) => status === 'learning').length;

  // Гостю уточнення моделлю віддає 401, тому «Свій текст» веде його у вхід із
  // поверненням, а не в тупик.
  const ownTextHref = signedIn ? '/analyze/new' : '/login?next=%2Fanalyze%2Fnew';

  return (
    <div>
      <div className="text-green-tx font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
        Пояснення українською · тексти англійською
      </div>

      <h1 className="font-serif mt-3.5 mb-3 text-[42px] leading-[1.08] font-extrabold tracking-[-0.5px] [text-wrap:balance]">
        Граматика видно просто в тексті, який ви читаєте
      </h1>

      <p className="text-ink-2 m-0 mb-[22px] text-[16px] leading-[1.6] [text-wrap:pretty]">
        Відкрийте оповідання чи вставте свою статтю — GrammaLens підсвітить часи, збере незнайомі
        слова й пояснить правила українською.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/reading"
          className="bg-acc shadow-acc rounded-btn px-6 py-[13px] text-[15.5px] leading-[normal] font-bold text-white"
        >
          Почати читати
        </Link>
        <Link
          href={ownTextHref}
          className="border-line-ctrl text-ink rounded-btn border-[1.5px] px-6 py-[13px] text-[15.5px] leading-[normal] font-bold"
        >
          + Свій текст
        </Link>
      </div>

      <AlexLine learning={learning} ready={ready} />
    </div>
  );
}

/**
 * Рядок Alex. Число тут справжнє — стільки слів справді лежить у
 * статусі «вчу», — і саме тому воно варте того місця, яке займає.
 * Поки стан не прочитано з localStorage, показуємо не нуль, а правило:
 * нуль, що за мить перескакує на 12, читається як помилка.
 */
function AlexLine({ learning, ready }: { learning: number; ready: boolean }) {
  const bubble = 'bg-panel border-line rounded-[12px_12px_12px_3px] border px-3 py-[7px]';
  const text = 'text-ink-2 text-[12.5px] font-semibold';

  return (
    <div className="mt-5 flex items-center gap-2.5">
      <Image
        src="/alex-cutout.png"
        alt="Alex the Linguist"
        width={315}
        height={365}
        priority
        className="h-auto w-11 flex-none"
      />
      {ready && learning > 0 ? (
        <Link href="/words" className={`${bubble} ${text}`}>
          У вас <b className="text-ink">{learning} слів</b> у статусі «вчу» — повторимо?
        </Link>
      ) : (
        <span className={`${bubble} ${text}`}>
          Клікніть слово в тексті — і воно потрапить у ваш словник.
        </span>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAppState } from '@/components/providers/AppStateProvider';
import { daysLabel, streakDays } from '@/lib/drills/streak';

/**
 * Топбар напряму «Читальня»: логотип, п'ять розділів, серія й аватар.
 *
 * Сайдбар пішов навмисно, а не через брак місця. Він забирав 292px у
 * кожного екрана й тримав повний список тем — а на екрані читання
 * колонка тексту важливіша за перелік розділів, до яких зараз не
 * повертаються. Навігація стала одним рядком у 64px, і саме тому
 * читальна колонка вміщується без прокрутки вбік.
 */

interface NavItem {
  label: string;
  href: string;
  /** Чи цей пункт активний на такому шляху */
  active: (pathname: string) => boolean;
}

/*
  «Читання» — це головна: вона і є входом у текст, а не окремий екран
  над ним.
*/
const NAV: NavItem[] = [
  { label: 'Читання', href: '/', active: (path) => path === '/' },
  { label: 'Бібліотека', href: '/library', active: (path) => path.startsWith('/library') },
  { label: 'Словник', href: '/words', active: (path) => path.startsWith('/words') },
  { label: 'Тренування', href: '/train', active: (path) => path.startsWith('/train') },
  { label: 'Теми', href: '/topics', active: (path) => path.startsWith('/topics') },
];

export function Topbar({ signedIn, initial }: { signedIn: boolean; initial: string | null }) {
  const pathname = usePathname();
  const { state, ready } = useAppState();

  /*
    Серія днів рахується зі спроб вправ — тих самих, що бачить тренування.
    До гідратації спроб ще немає, і нуль тут чесніший за число з макета.
  */
  const streak = ready ? streakDays(state.attempts) : 0;

  return (
    <header className="bg-panel border-line sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-topbar w-full max-w-shell items-center gap-7 px-9 leading-[normal]">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <Lens />
          <span className="font-serif text-[19px] leading-[normal] font-extrabold">GrammaLens</span>
        </Link>

        {/* Розділи ховаються на вузькому: рядок з п'яти пунктів не влазить
            поруч із логотипом і серією, а перенос зламав би висоту 64px */}
        <nav className="text-ink-2 hidden gap-1 text-[14.5px] font-semibold md:flex">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={item.active?.(pathname) ?? false} />
          ))}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-3.5">
          {signedIn ? (
            <>
              <Link
                href="/train"
                className="text-pc flex items-center gap-1.5 text-[13.5px] font-bold"
                title={`Серія тренувань: ${daysLabel(streak)} поспіль`}
              >
                <span aria-hidden>🔥</span> {daysLabel(streak)}
              </Link>
              <Link
                href="/account"
                aria-label="Кабінет"
                className="bg-tint text-green-tx flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-extrabold"
              >
                {initial ?? '·'}
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-acc text-[14px] font-bold">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Пункт навігації. Видима пігулка — 36px, як у макеті, а зона дотику
 * розтягнута псевдоелементом до 44px: інакше або палець не влучає, або
 * пігулка виростає на 8px і геометрія рядка розходиться з макетом.
 */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const shape = `relative rounded-pill px-4 py-2 leading-[normal] before:absolute before:inset-0 before:-my-[5px] before:content-[''] ${
    active ? 'bg-tint text-green-tx font-bold' : ''
  }`;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`${shape} hover:text-ink`}
    >
      {item.label}
    </Link>
  );
}

/**
 * Лінза логотипа: зелене кільце з ручкою і жовта риска всередині —
 * знак «мінус» під збільшувальним склом. Жовтий тут не декор, а той
 * самий колір, яким у тексті позначено слово в роботі.
 */
function Lens() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="var(--acc)" strokeWidth="2.5" />
      <line
        x1="16.5"
        y1="16.5"
        x2="23"
        y2="23"
        stroke="var(--acc)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="11"
        x2="14"
        y2="11"
        stroke="var(--yellow)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Топбар напряму «Читальня»: логотип, п'ять розділів і аватар.
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
  Чотири розділи, і «Читання» серед них одне на всі три екрани тексту:
  полиця `/reading`, читалка `/library/<slug>` і аналізатор `/analyze` —
  це один шлях, а не три сусідні. Окремої «Бібліотеки» більше немає: вона
  й була полицею, а два пункти на один розділ змушували гадати, у якому з
  них шукати свою книжку.

  На «/» пункту немає навмисно: головна — це вітрина, а не розділ, і в
  неї веде логотип.
*/
const NAV: NavItem[] = [
  {
    label: 'Читання',
    href: '/reading',
    active: (path) =>
      path.startsWith('/reading') || path.startsWith('/library') || path.startsWith('/analyze'),
  },
  { label: 'Словник', href: '/words', active: (path) => path.startsWith('/words') },
  { label: 'Тренування', href: '/train', active: (path) => path.startsWith('/train') },
  { label: 'Теми', href: '/topics', active: (path) => path.startsWith('/topics') },
];

export function Topbar({ signedIn, initial }: { signedIn: boolean; initial: string | null }) {
  const pathname = usePathname();

  return (
    <header className="bg-panel border-line sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-topbar w-full max-w-shell items-center gap-8 px-10 leading-[normal]">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <Lens />
          <span className="font-serif text-[21px] leading-[normal] font-extrabold">GrammaLens</span>
        </Link>

        {/* Розділи ховаються на вузькому: рядок пунктів не влазить поруч із
            логотипом і серією, а перенос зламав би висоту топбара */}
        <nav className="text-ink-2 hidden gap-1 text-[15px] font-semibold md:flex">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={item.active?.(pathname) ?? false} />
          ))}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-4">
          {signedIn ? (
            <Link
              href="/account"
              aria-label="Кабінет"
              className="bg-tint text-green-tx flex h-[38px] w-[38px] items-center justify-center rounded-full text-[15px] font-extrabold"
            >
              {initial ?? '·'}
            </Link>
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
 * Пункт навігації. Видима пігулка — 37px, як у макеті, а зона дотику
 * розтягнута псевдоелементом до 44px: інакше або палець не влучає, або
 * пігулка виростає й геометрія рядка розходиться з макетом.
 */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const shape = `relative rounded-pill px-[18px] py-[9px] leading-[normal] before:absolute before:inset-0 before:-my-[3.5px] before:content-[''] ${
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
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden>
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

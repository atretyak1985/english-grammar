'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Топбар напряму «Читальня»: логотип, чотири розділи і права група.
 *
 * Сайдбар пішов навмисно, а не через брак місця. Він забирав 292px у
 * кожного екрана й тримав повний список тем — а на екрані читання
 * колонка тексту важливіша за перелік розділів, до яких зараз не
 * повертаються. Навігація стала одним рядком у 64px, і саме тому
 * читальна колонка вміщується без прокрутки вбік.
 *
 * Права група — не «ще один пункт». «Тарифи» лишається текстом, «Увійти»
 * несе рамку: обидві дії комерційні, але одна з них єдина, після якої
 * екран змінюється назавжди, і рамка — це рівно та різниця у вазі,
 * якої не дає жирність шрифту.
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

  «Правила» стоїть першим і веде на /topics. Пункт називається за тим, що
  людина шукає («де правила»), а не за тим, як влаштований маршрут: «Теми»
  було іменем структури даних, а не іменем розділу.

  На «/» пункту немає навмисно: головна — це вітрина, а не розділ, і в
  неї веде логотип.
*/
const NAV: NavItem[] = [
  { label: 'Правила', href: '/topics', active: (path) => path.startsWith('/topics') },
  {
    label: 'Читання',
    href: '/reading',
    active: (path) =>
      path.startsWith('/reading') || path.startsWith('/library') || path.startsWith('/analyze'),
  },
  { label: 'Словник', href: '/words', active: (path) => path.startsWith('/words') },
  { label: 'Тренування', href: '/train', active: (path) => path.startsWith('/train') },
];

export function Topbar({ signedIn, initial }: { signedIn: boolean; initial: string | null }) {
  const pathname = usePathname();

  return (
    <header className="bg-panel border-line sticky top-0 z-50 flex-none border-b">
      {/* leading-[1.5] — рядок шапки живе за метрикою макета, а не за 1.6,
          яке `body` несе заради довгого читання: на 21px логотипа різниця
          між ними — цілий піксель висоти рядка, і топбар роз'їжджається.
          ------------------------------------------------------------
          max-w-shell, а не «1400 по контенту». У макеті box-sizing стоїть
          на героєві, темах і словнику, але не на шапці, смузі кроків і
          підвалі, — тож шапка там міряє 1400 по КОНТЕНТУ, а герой під нею
          по зовнішній коробці, і логотип виходить на 20px лівіше за H1.
          Це розбіжність самого макета, і вона тут навмисно НЕ відтворена:
          одна мірка на шапку, тіло й підвал коштує ~0.4% звірки і ставить
          логотип рівно над заголовком. Рішення приймалось один раз і діє
          в усіх трьох місцях — тут, у HowItWorks і в підвалі AppShell. */}
      <div className="h-topbar mx-auto flex w-full max-w-shell items-center gap-7 px-10 leading-[1.5]">
        <Link href="/" className="text-ink flex flex-none items-center gap-2.5">
          <Lens />
          <span className="font-serif text-[21px] font-extrabold">GrammaLens</span>
        </Link>

        {/* Розділи ховаються нижче 1100: саме там макет складає всі сітки в
            одну колонку, і рядок пунктів поруч із логотипом уже не влазить,
            а перенос зламав би висоту топбара */}
        <nav className="text-ink-2 flex gap-[2px] text-[15px] font-semibold max-[1100px]:hidden">
          {NAV.map((item) => (
            <NavLink key={item.label} item={item} active={item.active(pathname)} />
          ))}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2.5">
          <Link
            href="/pricing"
            className="text-ink-2 hover:text-ink relative px-3 py-2 text-[14px] font-bold before:absolute before:inset-0 before:-my-[3.5px] before:content-['']"
          >
            Тарифи
          </Link>

          {/* Аватар стоїть рівно там, де в гостя «Увійти»: вхід — це і є
              єдина дія, яку він замінює собою, і зсув решти рядка після
              входу читався б як інший топбар, а не як той самий. */}
          {signedIn ? (
            <Link
              href="/account"
              aria-label="Кабінет"
              className="bg-tint text-green-tx flex h-[38px] w-[38px] items-center justify-center rounded-full text-[15px] font-extrabold"
            >
              {initial ?? '·'}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-acc2 border-line-ctrl rounded-btn hover:border-acc relative border-[1.5px] px-4 py-2 text-[14px] font-bold before:absolute before:inset-0 before:-my-[2px] before:content-['']"
            >
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Пункт навігації. Видима пігулка — 38.5px, як у макеті, а зона дотику
 * розтягнута псевдоелементом до 44px: інакше або палець не влучає, або
 * пігулка виростає й геометрія рядка розходиться з макетом.
 *
 * Активний пункт бере той самий вигляд, що макет дає ховеру. Це не
 * економія на стані: ховер і «ви тут» позначають одне й те саме місце,
 * і третій вигляд поруч із ними читався б як третій вид пункту.
 */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const shape =
    "rounded-pill relative px-4 py-2 before:absolute before:inset-0 before:-my-[3px] before:content-['']";

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`${shape} hover:bg-hover hover:text-acc2 ${active ? 'bg-hover text-acc2 font-bold' : ''}`}
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

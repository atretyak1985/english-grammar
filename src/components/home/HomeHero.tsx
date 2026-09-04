import Link from 'next/link';

/**
 * Ліва колонка героя: обіцянка, дві дії і рядок дрібним про ціну входу.
 *
 * Обіцянка стоїть перша й одна, бо саме її людина мусить зрозуміти за
 * п'ять секунд — «правило видно в тексті, який ви читаєте», а не «ще
 * один довідник з правилами». Тому картка з живим правилом лежить
 * праворуч від цього блоку, а не під ним: обіцянку й доказ видно
 * одночасно, і доказ не треба шукати прокруткою.
 *
 * Рядок «Без реєстрації» стоїть ПІД кнопками, а не над ними. Над ними
 * він читався б як умова, яку треба прийняти перед дією; під ними — як
 * відповідь на питання, що виникає рівно після того, як людина вже
 * потягнулась до кнопки.
 *
 * Компонент серверний: тут немає ані стану, ані гілки за сеансом.
 * «Спробувати на своєму тексті» веде на /analyze/new, який працює без
 * входу, — тож ділити цю кнопку за signedIn немає за чим.
 */
export function HomeHero() {
  return (
    <div className="self-center pb-10">
      <div className="text-acc2 font-mono text-[12px] font-bold tracking-[1.6px] uppercase">
        Граматика англійської · пояснення українською
      </div>

      {/* clamp — рівно з макета: 3.4vw дає 48.96px на 1440 і сходить до
          38px на вузькому, де заголовок у 52px забирав би пів екрана */}
      <h1 className="font-serif mt-4 mb-3.5 text-[clamp(38px,3.4vw,52px)] leading-[1.06] font-extrabold tracking-[-0.9px] [text-wrap:balance]">
        Правило, яке ви бачите в живому тексті, запам&apos;ятовується
      </h1>

      {/* max-w-[44ch] тримає довжину рядка, а не ширину колонки: колонка
          росте від 340 до 460px, а абзац лишається читабельним у будь-якій
          з цих ширин, бо стеля рахується в знаках */}
      <p className="text-ink-2 m-0 mb-[26px] max-w-[44ch] text-[17px] leading-[1.6] [text-wrap:pretty]">
        11 курсів граматики з прикладами й тестами. Кожне правило можна одразу знайти підсвіченим в
        оповіданні чи у своїй статті — а потім закріпити вправами і словником.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/topics"
          className="bg-acc hover:bg-acc2 rounded-btn shadow-acc px-[26px] py-3.5 text-[16px] font-bold text-white transition-[background-color,transform] duration-150 ease-out hover:-translate-y-px hover:text-white"
        >
          Відкрити правила
        </Link>
        <Link
          href="/analyze/new"
          className="border-line-ctrl text-ink hover:border-acc hover:text-acc2 rounded-btn border-[1.5px] px-[26px] py-3.5 text-[16px] font-bold transition-colors duration-150 ease-out"
        >
          Спробувати на своєму тексті
        </Link>
      </div>

      <div className="text-ink-3 mt-[22px] text-[13.5px]">
        Без реєстрації · Тексти англійською, пояснення українською
      </div>
    </div>
  );
}

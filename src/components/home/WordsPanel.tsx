import Link from 'next/link';

/**
 * Чорнильна панель словника: обіцянка ліворуч, картка слова праворуч.
 *
 * Панель темна навмисно, і це остання секція перед підвалом. Словник —
 * єдина частина застосунку, куди людина повертається щодня, і темне
 * поле на паперовому тлі каже це без жодного слова: сторінка
 * закінчується не «ще однією секцією», а місцем, де живе її власне.
 *
 * Праворуч не скріншот, а справжня розмітка тієї самої картки, яка
 * стоїть у /words. Скріншот застаріває мовчки — розмітка ламається
 * разом із токенами й тому не може розійтися з продуктом непомітно.
 *
 * Слово «sterling» і цитата взяті з «The Gift of the Magi» — того самого
 * оповідання, речення з якого підсвічене в героєві. Це один шлях однієї
 * людини через застосунок, показаний двічі, а не два випадкові приклади.
 */
export function WordsPanel() {
  return (
    <section className="mx-auto w-full max-w-shell px-10 pt-14 pb-[72px]">
      <div className="bg-deep text-deep-ink rounded-panel-xl grid grid-cols-2 items-center gap-12 p-12 max-[1100px]:grid-cols-1">
        <div>
          <div className="text-yellow font-mono text-[12px] font-bold tracking-[1.6px] uppercase">
            Словник
          </div>
          <h2 className="font-serif my-3 text-[36px] leading-[1.1] font-extrabold tracking-[-0.6px] [text-wrap:balance]">
            Слова з ваших текстів — і з будь-яких інших
          </h2>
          <p className="text-deep-ink-2 m-0 mb-[22px] max-w-[48ch] text-[16px] leading-[1.6]">
            Клік по слову в читалці ставить його у «вчу» разом із реченням, де воно трапилось.
            Списки з Anki, CSV чи нотаток — імпортуються за хвилину. Усе експортується назад.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/words"
              className="bg-yellow text-deep hover:bg-yellow-hv rounded-btn px-[22px] py-3 text-[15px] font-bold transition-colors duration-150 ease-out"
            >
              Відкрити словник
            </Link>
            <Link
              href="/train"
              className="border-deep-line-ctrl text-deep-ink rounded-btn hover:border-deep-ink-2 border-[1.5px] px-[22px] py-3 text-[15px] font-bold transition-colors duration-150 ease-out hover:text-white"
            >
              Тренування слів
            </Link>
          </div>
        </div>

        <WordCard />
      </div>
    </section>
  );
}

/**
 * Картка слова. Три кнопки статусу стоять одним злитим блоком, а не
 * трьома окремими: «не знаю → вчу → знаю» — це одна шкала, і проміжки
 * між кнопками читалися б як три незалежні дії.
 */
function WordCard() {
  return (
    <div className="bg-card text-ink rounded-tile-lg shadow-on-deep px-6 py-[22px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          {/* Жовтий маркер — той самий знак статусу «вчу», що й у тексті */}
          <span className="font-serif border-yellow bg-yellow-bg border-b-[3px] px-1 text-[24px] font-extrabold">
            sterling
          </span>
          <span className="text-ink-3 font-mono text-[12.5px]">/ˈstɜːlɪŋ/</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink-3)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M11 5 6 9H2v6h4l5 4V5Z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          </svg>
        </div>
        <div className="border-line-ctrl rounded-btn flex overflow-hidden border-[1.5px] text-[12.5px] font-bold">
          <span className="text-ink-2 px-[11px] py-[7px]">не знаю</span>
          <span className="bg-yellow-bg text-yellow-tx border-line-ctrl border-r-[1.5px] border-l-[1.5px] px-[11px] py-[7px]">
            вчу
          </span>
          <span className="text-ink-2 px-[11px] py-[7px]">знаю</span>
        </div>
      </div>

      <div className="text-ink-body mt-2.5 text-[14.5px]">
        стерлінговий; бездоганний, справжній
      </div>

      {/* Приклад курсивом і серифом: це чужий текст усередині інтерфейсу,
          і накреслення відрізняє його від перекладу над ним надійніше,
          ніж лапки */}
      <div className="font-serif text-ink-2 mt-2 text-[14.5px] italic">
        «…a platinum fob chain simple and chaste in design, properly proclaiming its value by
        substance alone» — The Gift of the Magi
      </div>

      <div className="border-line-strong text-ink-3 mt-3.5 flex items-center gap-3.5 border-t border-dashed pt-3 text-[12.5px]">
        <span className="flex items-center gap-[5px]">
          <ArrowIcon direction="up" />
          Імпорт CSV · Anki
        </span>
        <span className="flex items-center gap-[5px]">
          <ArrowIcon direction="down" />
          Експорт
        </span>
        <span className="text-acc2 ml-auto font-bold">Тренувати 31 слово →</span>
      </div>
    </div>
  );
}

/** Імпорт і експорт — одна піктограма в двох напрямках: це одна дія, обернена. */
function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'up' ? (
        <>
          <path d="M12 21V9" />
          <path d="m8 13 4-4 4 4" />
          <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
        </>
      ) : (
        <>
          <path d="M12 3v12" />
          <path d="m8 11 4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </>
      )}
    </svg>
  );
}

import Image from 'next/image';

/**
 * Три кроки застосунку: правило → текст → закріплення.
 *
 * Смуга стоїть на панелі й обведена зверху й знизу, а не просто на тлі.
 * Це не декор: герой обіцяє, теми перелічують, а між ними мусить бути
 * місце, де сказано, ЩО саме людина робитиме. Обведена біла смуга
 * читається як окремий розворот, а не як продовження героя.
 *
 * Нумерація «01 · Правило» — капітеллю моно, тим самим знаком, яким у
 * картці правила підписано «ПРАВИЛО». Порядок тут обов'язковий (текст
 * без правила — це просто читання зі словником), і номер — єдиний
 * спосіб сказати це, не пишучи «спершу».
 */

interface Step {
  /** Підпис слота ілюстрації. Дослівно з макета — це технічне завдання
   *  ілюстратору, а не текст для читача. */
  slot: string;
  kicker: string;
  title: string;
  body: string;
  /** Готова ілюстрація. Поки її немає, слот малює власну порожню рамку. */
  image?: string;
}

const STEPS: Step[] = [
  {
    slot: 'Ілюстрація кроку 1: розгорнута сторінка правила з формулою had + V3 і олівцем. Чорнило на папері, фіолетовий акцент',
    kicker: '01 · Правило',
    title: 'Прочитайте пояснення українською',
    body: 'Кожна тема — 10–15 коротких розділів: формула, коли вживати, мінімальні пари й типові помилки українців. З перекладом кожного прикладу.',
  },
  {
    slot: 'Ілюстрація кроку 2: лінза над сторінкою книжки, під лінзою слова підсвічені синім і фіолетовим. Зелений обід лінзи, жовта риска',
    kicker: '02 · Текст',
    title: 'Побачте його в живому тексті',
    body: 'Оповідання з полиці або своя стаття, PDF, фото сторінки. Конструкції правила підсвічені; клік — «чому саме цей час» і дорога назад у теорію.',
  },
  {
    slot: 'Ілюстрація кроку 3: Alex тримає картку зі словом «sterling», позаду стос карток і галочка. Жовтий і зелений акценти',
    kicker: '03 · Закріплення',
    title: 'Тренуйте правило і слова',
    body: 'Вправи беруть речення з того, що ви читали. Незнайомі слова йдуть у словник — з прикладом із вашого тексту, імпортом і експортом.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-panel border-line border-t border-b">
      <div className="mx-auto grid max-w-shell grid-cols-3 gap-8 px-10 py-14 max-[1100px]:grid-cols-1">
        {STEPS.map((step) => (
          <div key={step.kicker}>
            <StepSlot caption={step.slot} image={step.image} />
            <div className="text-acc2 font-mono text-[12px] font-bold tracking-[1.6px] uppercase">
              {step.kicker}
            </div>
            <h3 className="font-serif mt-2.5 mb-2 text-[24px] font-extrabold tracking-[-0.3px]">
              {step.title}
            </h3>
            <p className="text-ink-2 m-0 text-[15px] leading-[1.55]">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Слот ілюстрації. Порожній стан — не заглушка «поки нічого немає», а
 * навмисна форма: пунктирна рамка й підпис усередині кажуть, ЩО тут
 * буде, тому смуга кроків читається цілою ще до того, як з'явиться
 * перший малюнок. Рамка й піктограма беруть currentColor і живуть
 * прозорістю, а не власним кольором, — тому слот однаково читається і
 * на паперовому тлі, і на чорнильному.
 *
 * Готова ілюстрація підставляється одним пропом `image`: усе, що
 * лишиться зробити на кожен слот, — дописати шлях у STEPS.
 */
function StepSlot({ caption, image }: { caption: string; image?: string }) {
  return (
    <div className="relative mb-[18px] h-[170px]">
      <div className="rounded-tile-lg absolute inset-0 overflow-hidden bg-[rgba(127,127,127,0.08)]">
        {image ? (
          <Image src={image} alt={caption} fill sizes="(max-width: 1100px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center text-[13px] leading-[1.3] [font-family:system-ui,-apple-system,sans-serif]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-45"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <div className="max-w-[90%] font-medium tracking-[0.01em] opacity-75">{caption}</div>
          </div>
        )}
        {!image && (
          <div
            className="rounded-tile-lg pointer-events-none absolute inset-0 border-[1.5px] border-dashed border-current opacity-35"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

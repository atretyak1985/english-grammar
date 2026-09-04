import Link from 'next/link';

import { LEVEL_LABEL, READY_TOPICS, TOPICS } from '@/data/topics';

/**
 * Сітка готових тем і рядок про заплановані.
 *
 * Список береться з `TOPICS`, а не переписується сюди руками. Це не
 * економія рядків: заголовок рахує теми сам, картка бере назву, опис і
 * рівень з `meta.ts` тієї самої теми, а мітка «N розділів» — з довжини
 * її ж масиву розділів. Тому нова тема з'являється на головній тим
 * самим комітом, що й сама тема, і жоден із цих чисел не може розійтися
 * з тим, що людина побачить, відкривши картку.
 *
 * Заплановані теми стоять рядком дрібним, а не картками. Картка обіцяє
 * «сюди можна зайти»; тут заходити нікуди, і сім порожніх карток
 * розбавили б сітку готового рівно тим, чого ще немає.
 */
export function HomeTopics() {
  const planned = TOPICS.filter((topic) => !topic.ready);

  return (
    <section className="mx-auto w-full max-w-shell px-10 pt-16 pb-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="text-ink-3 font-mono text-[12px] font-bold tracking-[1.6px] uppercase">
            Курс граматики
          </div>
          <h2 className="font-serif mt-2.5 text-[36px] leading-[1.1] font-extrabold tracking-[-0.6px]">
            {READY_TOPICS.length} тем, готових зараз
          </h2>
        </div>
        <Link href="/topics" className="text-acc hover:text-acc2 text-[15px] font-bold">
          Усі правила →
        </Link>
      </div>

      {/* auto-fill, а не фіксовані чотири колонки: на 1440 сітка сама дає
          319.5px × 4, а на вужчому — три й дві, без жодного брейкпоінта */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {READY_TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="bg-card border-line rounded-tile-lg text-ink hover:shadow-lift flex flex-col gap-2 border px-[22px] py-5 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:text-ink"
          >
            <div className="flex items-start justify-between gap-2.5">
              <span className="font-serif text-[19px] leading-[1.2] font-extrabold">
                {topic.title}
              </span>
              {/* Рівень — моно й у рамці: це мітка каталогу, а не слово
                  з назви теми, і однакова ширина цифр тримає праву межу
                  рівною на всіх картках */}
              <span className="border-line-ctrl rounded-badge text-ink-2 flex-none border-[1.5px] px-[7px] py-0.5 font-mono text-[11px] font-bold">
                {LEVEL_LABEL[topic.level]}
              </span>
            </div>
            <span className="text-ink-2 text-[14px] leading-[1.5]">{topic.desc}</span>
            {/* mt-auto притискає мітку до низу: описи різної довжини, і без
                цього нижній рядок стрибав би по картках сітки */}
            <span className="text-ink-3 mt-auto text-[13px]">
              {topic.sections.length} розділів · тест
            </span>
          </Link>
        ))}
      </div>

      <p className="text-ink-3 mt-[18px] mb-0 text-[14px]">
        У планах: {planned.map((topic) => topic.title).join(' · ')}
      </p>
    </section>
  );
}

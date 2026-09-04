import Link from 'next/link';

import { TopicCard } from '@/components/topic/TopicCard';
import { READY_TOPICS, TOPICS } from '@/data/topics';

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
        {/* Картка спільна з каталогом правил — див. TopicCard. Різниця
            між екранами рівно одна: там у нижньому рядку ще й прогрес,
            і саме тому він у картці слот, а не пропси стану. */}
        {READY_TOPICS.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>

      <p className="text-ink-3 mt-[18px] mb-0 text-[14px]">
        У планах: {planned.map((topic) => topic.title).join(' · ')}
      </p>
    </section>
  );
}

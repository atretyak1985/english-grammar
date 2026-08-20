'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS, TOPICS } from '@/data/topics';

/** Герой-блок головної з живою статистикою (CONCEPT 2). */
export function HomeHero() {
  const { readCount, ready } = useAppState();

  const topic = READY_TOPICS[0];
  const read = topic ? readCount(topic.slug) : 0;
  const total = topic?.sections.length ?? 0;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div className="from-hero-1 via-hero-2 to-hero-3 relative overflow-hidden bg-[linear-gradient(150deg,var(--hero-1)_0%,var(--hero-2)_55%,var(--hero-3)_100%)] px-[30px] pt-[52px] pb-[46px] text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(700px_320px_at_82%_12%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(620px_300px_at_8%_92%,rgba(37,99,235,0.32),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-content">
        <div className="max-w-[880px]">
        <div className="text-hero-kicker text-[12px] font-bold tracking-[2.5px] uppercase">
          Пояснення українською · приклади англійською
        </div>
        <h1 className="my-3.5 text-[44px] leading-[1.08] font-extrabold tracking-[-1.2px]">
          Граматика англійської
          <br />
          без зубріння
        </h1>
        <p className="text-hero-lede m-0 max-w-[640px] text-[17.5px]">
          Правила пояснені так, щоб було зрозуміло одразу: візуальні схеми, приклади з перекладом,
          розбір «чому саме так», типові помилки українців і вправи з відповідями.
        </p>

        <div className="mt-[30px] flex flex-wrap gap-[34px]">
          <Stat value={String(READY_TOPICS.length)} label="тема готова" />
          <Stat value={String(TOPICS.length - READY_TOPICS.length)} label="у планах" />
          <Stat value="200+" label="прикладів" />
          <Stat value={ready ? `${percent}%` : '0%'} label="ваш прогрес" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[26px] font-extrabold tracking-[-0.5px]">{value}</div>
      <div className="text-hero-label text-[12px] font-bold tracking-[1px] uppercase">{label}</div>
    </div>
  );
}

'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS, TOPICS } from '@/data/topics';

/** Герой-блок головної з живою статистикою (CONCEPT 2). */
export function HomeHero() {
  const { state, ready } = useAppState();

  const sectionsRead = Object.values(state.readSections).reduce(
    (sum, sections) => sum + sections.length,
    0,
  );
  const learning = Object.values(state.words).filter((status) => status === 'learning').length;
  const known = Object.values(state.words).filter((status) => status === 'known').length;

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(150deg,#101528_0%,#1c2544_55%,#2a1a4a_100%)] px-5 pt-16 pb-20 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(700px_320px_at_82%_12%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(620px_300px_at_8%_92%,rgba(37,99,235,0.32),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-[1080px]">
        <div className="text-[12.5px] font-bold tracking-[2.5px] text-[#9db2ff] uppercase">
          Пояснення українською · приклади англійською
        </div>
        <h1 className="my-4 text-[clamp(30px,5.5vw,48px)] leading-[1.1] font-bold tracking-[-1px]">
          Граматика англійської
          <br />
          без зубріння
        </h1>
        <p className="m-0 max-w-[640px] text-[18px] text-[#c7cfe4]">
          Правила пояснені так, щоб було зрозуміло одразу: візуальні схеми, приклади з перекладом,
          розбір «чому саме так», типові помилки українців і вправи з відповідями. Плюс аналіз
          власного тексту і словник за частотністю.
        </p>

        <div className="mt-8 flex flex-wrap gap-7">
          <Stat value={READY_TOPICS.length} label="тема готова" />
          <Stat value={TOPICS.length - READY_TOPICS.length} label="у планах" />
          <Stat value={ready ? sectionsRead : 0} label="розділів прочитано" />
          <Stat value={ready ? learning : 0} label="слів вчу" />
          <Stat value={ready ? known : 0} label="слів знаю" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-[26px] font-extrabold tracking-[-0.5px]">{value}</div>
      <div className="text-[13px] font-bold tracking-[1px] text-[#8f9cba] uppercase">{label}</div>
    </div>
  );
}

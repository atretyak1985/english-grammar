import type { TopicMeta } from '@/types/content';

/** Герой-блок сторінки теми. */
export function TopicHero({ topic }: { topic: TopicMeta }) {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(150deg,#101528_0%,#1c2544_55%,#2a1a4a_100%)] px-5 pt-14 pb-16 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(700px_300px_at_85%_10%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(600px_280px_at_10%_90%,rgba(37,99,235,0.3),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-[1080px]">
        {topic.kicker ? (
          <div className="text-[12.5px] font-bold tracking-[2.5px] text-[#9db2ff] uppercase">
            {topic.kicker}
          </div>
        ) : null}
        <h1 className="my-3.5 text-[clamp(27px,5vw,43px)] leading-[1.14] font-bold tracking-[-0.8px]">
          {topic.heroTitle ?? topic.title}
        </h1>
        {topic.heroLede ? (
          <p className="m-0 max-w-[680px] text-[17.5px] text-[#c7cfe4]">{topic.heroLede}</p>
        ) : null}
        {topic.heroChips && topic.heroChips.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2.5">
            {topic.heroChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13.5px] font-semibold"
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

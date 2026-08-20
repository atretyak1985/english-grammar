import type { TopicMeta } from '@/types/content';

/** Герой-блок сторінки теми. */
export function TopicHero({ topic }: { topic: TopicMeta }) {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(150deg,var(--hero-1)_0%,var(--hero-2)_55%,var(--hero-3)_100%)] px-[30px] pt-11 pb-10 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(700px_300px_at_85%_10%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(600px_280px_at_10%_90%,rgba(37,99,235,0.3),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-content">
        <div className="max-w-[900px]">
        {topic.kicker ? (
          <div className="text-hero-kicker text-[12px] font-bold tracking-[2.5px] uppercase">
            {topic.kicker}
          </div>
        ) : null}
        <h1 className="my-3 text-[38px] leading-[1.12] font-extrabold tracking-[-0.9px]">
          {topic.heroTitle ?? topic.title}
        </h1>
        {topic.heroLede ? (
          <p className="text-hero-lede m-0 max-w-[700px] text-[17px]">{topic.heroLede}</p>
        ) : null}
        {topic.heroChips && topic.heroChips.length > 0 ? (
          <div className="mt-[22px] flex flex-wrap gap-[9px]">
            {topic.heroChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/[0.18] bg-white/[0.09] px-3.5 py-2 text-[13px] font-semibold"
              >
                {chip}
              </span>
            ))}
          </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

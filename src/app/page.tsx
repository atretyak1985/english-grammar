import { AlexTip } from '@/components/home/AlexTip';
import { EntryCards } from '@/components/home/EntryCards';
import { HomeHero } from '@/components/home/HomeHero';
import { ProgressPath } from '@/components/home/ProgressPath';
import { TenseChips } from '@/components/home/TenseChips';
import { TopicsGrid } from '@/components/home/TopicsGrid';
import { WhatsNew } from '@/components/home/WhatsNew';

export default function HomePage() {
  return (
    /* Міжрядковість макета — типова для гарнітури, а не спільні 1.66 з body:
       на ній стоять висоти всіх текстових блоків цього екрана. */
    <div className="mx-auto w-full max-w-shell px-9 pb-[60px] leading-[normal]">
      <HomeHero />
      <TenseChips />
      <ProgressPath />
      <EntryCards />
      <AlexTip />

      <h2 id="topics" className="font-display mt-[38px] mb-4 text-[26px] font-extrabold">
        Усі теми
      </h2>
      <TopicsGrid />

      <h2 className="font-display mt-[38px] mb-4 text-[26px] font-extrabold">Що нового</h2>
      <WhatsNew />
    </div>
  );
}

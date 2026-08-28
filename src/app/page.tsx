import { ContinueCard } from '@/components/home/ContinueCard';
import { HomeHero } from '@/components/home/HomeHero';
import { LiveSample } from '@/components/home/LiveSample';
import { ProgressCard } from '@/components/home/ProgressCard';
import { TrapCard } from '@/components/home/TrapCard';

/**
 * Головна: обіцянка з доказом поруч, під ними три картки повернення.
 *
 * Списку тем тут більше немає — він переїхав на /topics, куди веде
 * пункт топбара. Головна відповідає на одне питання («що це і що я
 * тут роблю»), а не показує весь зміст сайту: саме перелік тем на
 * першому екрані й розмивав відповідь до «ще один довідник».
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-shell leading-[normal]">
      <div className="grid items-center gap-10 px-9 pt-11 pb-9 lg:grid-cols-[440px_minmax(0,1fr)]">
        <HomeHero />
        <LiveSample />
      </div>

      <div className="grid gap-4 px-9 pb-9 md:grid-cols-3">
        <ContinueCard />
        <ProgressCard />
        <TrapCard />
      </div>
    </div>
  );
}

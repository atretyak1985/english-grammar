import { AlexColumn } from '@/components/home/AlexColumn';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeTopics } from '@/components/home/HomeTopics';
import { HowItWorks } from '@/components/home/HowItWorks';
import { LiveSample } from '@/components/home/LiveSample';
import { WordsPanel } from '@/components/home/WordsPanel';

/**
 * Головна: обіцянка, доказ, порядок роботи, зміст, словник.
 *
 * П'ять секцій замість колишніх двох — і це не «більше контенту».
 * Попередня головна відповідала тільки на «що це», а на «що я тут
 * робитиму» й «чи є моя тема» людина йшла шукати сама. Тепер відповідь
 * на кожне з цих питань стоїть рівно там, де воно виникає: доказ поруч
 * з обіцянкою, порядок кроків одразу під першим екраном, теми — під
 * кроками, і словник останнім, бо він єдиний, куди вертаються щодня.
 *
 * Три картки повернення («продовжити», «прогрес», «пастка») пішли. Вони
 * говорили з тим, хто вже вчиться, — а це рівно та людина, яка на
 * головну не заходить: у неї є топбар. Їхнє місце зайняли теми, і саме
 * вони відповідають новачку на питання, з яким він і прийшов.
 *
 * ------------------------------------------------------------------
 * leading-[1.5] на корені — метрика макета. `body` несе 1.6 заради
 * довгого читання правил; тут кожен рядок або заголовок, або підпис, і
 * зайві 0.1 інтерліньяжу зсувають усі п'ять секцій одну відносно одної.
 */
export default function HomePage() {
  return (
    <div className="leading-[1.5]">
      {/* Три колонки, а не дві: Alex стоїть МІЖ обіцянкою і карткою
          правила й тримає їх як пару. min-height на висоту вікна мінус
          топбар — герой мусить зайняти перший екран цілком, інакше
          смуга кроків визирає знизу й забирає в обіцянки її головне:
          що на неї нема чого відволікатись. */}
      <section className="mx-auto grid w-full max-w-shell min-h-[calc(100vh_-_var(--spacing-topbar))] grid-cols-[minmax(340px,460px)_minmax(200px,260px)_minmax(420px,1fr)] items-end gap-8 px-10 pt-6 max-[1100px]:grid-cols-1">
        <HomeHero />
        <AlexColumn />
        <LiveSample />
      </section>

      <HowItWorks />
      <HomeTopics />
      <WordsPanel />
    </div>
  );
}

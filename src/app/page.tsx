import { EntryCards } from '@/components/home/EntryCards';
import { HomeHero } from '@/components/home/HomeHero';
import { TopicsGrid } from '@/components/home/TopicsGrid';

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <div className="mx-auto max-w-content px-[30px] pt-[34px] pb-2.5">
        <EntryCards />
      </div>

      <div id="topics" className="mx-auto max-w-content px-[30px] pt-8 pb-2">
        <h2 className="mt-0 mb-1.5 text-[28px] font-extrabold tracking-[-0.6px]">Теми</h2>
        <p className="text-ink-2 mt-0 mb-5 max-w-[800px] text-[16.5px]">
          Кожна тема — окрема самодостатня сторінка: теорія, приклади, порівняння, вправи і тест.
        </p>
        <TopicsGrid />
      </div>

      <div id="how" className="mx-auto max-w-content px-[30px] pt-[34px] pb-[60px]">
        <h2 className="mt-0 mb-4 text-[28px] font-extrabold tracking-[-0.6px]">Як користуватись</h2>
        <div className="bg-surface border-line rounded-card shadow-card border px-[26px] py-[22px]">
          <p className="m-0">
            <b>Читання правил дає розуміння, але не автоматизм.</b> Автоматизм дає лише продукування
            власних речень. Тому порядок роботи з кожною темою такий:
          </p>
          <ol className="text-ink-2 mt-2.5 mb-0 list-decimal pl-[22px]">
            <li className="my-[7px]">
              Прочитайте теорію — але не намагайтесь запамʼятати все за раз.
            </li>
            <li className="my-[7px]">
              Пройдіть розділ з <b>мінімальними парами</b>: там видно, що саме змінює граматика в
              сенсі.
            </li>
            <li className="my-[7px]">
              Зробіть <b>переклад з української</b>, не підглядаючи у відповіді. Це найкорисніша
              вправа.
            </li>
            <li className="my-[7px]">
              Складіть <b>5 власних речень про свою реальну роботу чи життя</b>. Один свій приклад
              вартує двадцяти чужих.
            </li>
            <li className="my-[7px]">
              Через тиждень пройдіть <b>тест</b> ще раз. Що нижче 85% — туди й повертайтесь.
            </li>
          </ol>
        </div>
        <div className="bg-surface shadow-card border-l-ok mt-[18px] rounded-r-[10px] border-l-4 px-[18px] py-3.5">
          <div className="text-ink-3 mb-[5px] text-[12px] font-extrabold tracking-[1px] uppercase">
            Порада
          </div>
          Не проходьте кілька тем паралельно. Одна тема на 1–2 тижні, з щоденною практикою по 15
          хвилин, дає більше, ніж місяць безсистемного читання.
        </div>
      </div>
    </>
  );
}

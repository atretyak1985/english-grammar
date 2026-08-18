import { EntryCards } from '@/components/home/EntryCards';
import { HomeHero } from '@/components/home/HomeHero';
import { TopicsGrid } from '@/components/home/TopicsGrid';

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <div className="mx-auto max-w-[1080px] px-5">
        <section className="pt-10">
          <EntryCards />
        </section>

        <section id="topics" className="pt-12">
          <h2 className="mt-0 mb-1.5 text-[clamp(22px,3.4vw,30px)] leading-[1.22] font-bold tracking-[-0.5px]">
            Теми
          </h2>
          <p className="text-ink-2 mt-0 mb-6 max-w-[800px] text-[17px]">
            Кожна тема — теорія, приклади, порівняння, вправи і тест. Прогрес читання зберігається.
          </p>
          <TopicsGrid />
        </section>

        <section id="how" className="pt-12 pb-4">
          <h2 className="mt-0 mb-1.5 text-[clamp(22px,3.4vw,30px)] leading-[1.22] font-bold tracking-[-0.5px]">
            Як користуватись
          </h2>
          <div className="bg-surface border-line rounded-card shadow-card my-5 border px-6 py-6">
            <p className="m-0">
              <b>Читання правил дає розуміння, але не автоматизм.</b> Автоматизм дає лише
              продукування власних речень. Тому порядок роботи з кожною темою такий:
            </p>
            <ol className="mt-2.5 list-decimal space-y-1.5 pl-6">
              <li>Прочитайте теорію — але не намагайтесь запамʼятати все за раз.</li>
              <li>
                Пройдіть розділ з <b>мінімальними парами</b>: там видно, що саме змінює граматика в
                сенсі.
              </li>
              <li>
                Зробіть <b>переклад з української</b>, не підглядаючи у відповіді. Це найкорисніша
                вправа.
              </li>
              <li>
                Складіть <b>5 власних речень про свою реальну роботу чи життя</b>. Один свій приклад
                вартує двадцяти чужих.
              </li>
              <li>
                Вставте в <b>Аналіз тексту</b> статтю або лист, які ви читаєте по роботі — і
                подивіться, як ті самі часи виглядають у справжньому тексті.
              </li>
              <li>
                Через тиждень пройдіть <b>тест</b> ще раз. Що нижче 85% — туди й повертайтесь.
              </li>
            </ol>
          </div>
          <div className="bg-surface shadow-card border-l-ok my-[18px] rounded-r-[10px] border-l-4 px-[18px] py-3.5">
            <div className="text-ink-3 mb-[5px] text-[12.5px] font-extrabold tracking-[1px] uppercase">
              Порада
            </div>
            Не проходьте кілька тем паралельно. Одна тема на 1–2 тижні, з щоденною практикою по 15
            хвилин, дає більше, ніж місяць безсистемного читання.
          </div>
        </section>
      </div>
    </>
  );
}

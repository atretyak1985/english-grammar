import Link from 'next/link';

import { readingMinutes } from '@/components/reading/format';
import type { Spotlight } from '@/lib/topics/spotlight';

/**
 * «Що далі з цим правилом» — вихід із теорії в те, де правило працює.
 *
 * Дві дороги, які макет ставить під текстом: побачити конструкцію в живому
 * тексті і закріпити її вправою. Перша картка умовна з тієї ж причини, що й
 * на сторінці теми: підсвіткою часів вимірюються три теми з одинадцяти, і для
 * артиклів чи модальних тут не буде обіцянки, яку нічим підтвердити.
 *
 * Числа в другій картці не називаються навмисно. Тренування збирає речення з
 * текстів, які читач справді відкривав, тому їхня кількість залежить від
 * нього; «6 речень» із макета було б копірайтом, а не даними.
 */
export function SectionNext({ spotlight }: { spotlight: Spotlight | null }) {
  const card =
    'bg-card border-line rounded-tile-lg hover:shadow-lift block border p-[18px] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5';
  const label = 'text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase';
  const title = 'font-serif mt-2 mb-1.5 text-[17px] font-extrabold tracking-[-0.2px]';
  const body = 'text-ink-2 m-0 text-[13.5px] leading-[1.5]';

  return (
    <section className="border-line mt-9 border-t pt-7">
      <h2 className={label}>Що далі з цим правилом</h2>

      <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
        {spotlight ? (
          <Link href={`/library/${spotlight.story.slug}`} className={card}>
            <div className={label}>Побачити в тексті</div>
            <div className={title}>Читати «{spotlight.story.title}» з підсвіткою →</div>
            <p className={body}>
              {spotlight.counts.map((item) => `${item.count} ${item.label}`).join(', ')}.{' '}
              {readingMinutes(spotlight.story.words)} хвилин читання, підсвітка вже налаштована на
              цю тему.
            </p>
          </Link>
        ) : null}

        <Link href="/train" className={card}>
          <div className={label}>Закріпити</div>
          <div className={title}>Тренувати речення з пропуском →</div>
          <p className={body}>
            Речення беруться з текстів, які ви читали, — тому вправа щоразу інша. Дві хвилини.
          </p>
        </Link>
      </div>
    </section>
  );
}

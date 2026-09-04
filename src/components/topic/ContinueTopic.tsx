'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';

/**
 * «Продовжити» — широка картка над полицею тем.
 *
 * Вона стоїть окремо від сітки, бо відповідає на інше питання. Сітка
 * питає «що тут узагалі є», ця картка — «де я зупинився»; злившись із
 * рештою, вона стала б дванадцятою темою серед одинадцяти.
 *
 * Усі числа справжні: тема — з `lastTopic`, лічильник — з
 * `readSections`, назва наступного розділу — з `meta.ts` тієї теми.
 * Макет підписує «розділ 4 з 15 · Past Perfect — передминулий», і це
 * рівно те, що ми вміємо порахувати, — тому підпис лишився дослівним.
 *
 * До гідратації картки немає взагалі. Стан лежить у localStorage, і
 * будь-яка заглушка тут означала б «ви зупинилися на розділі 1» тому,
 * хто зупинився на дванадцятому: краще порожнє місце на один кадр,
 * ніж чуже число.
 */
export function ContinueTopic() {
  const { state, readCount, ready } = useAppState();

  if (!ready) return null;

  const topic = READY_TOPICS.find((item) => item.slug === state.lastTopic);
  if (!topic) return null;

  const total = topic.sections.length;
  const read = readCount(topic.slug);
  if (read === 0) return null;

  // Наступний — перший непрочитаний. Прочитані лежать множиною id, а не
  // послідовністю, тому «наступний» шукається по порядку розділів теми,
  // а не як read + 1: людина могла зайти в тему з середини.
  const readIds = new Set(state.readSections[topic.slug] ?? []);
  const next = topic.sections.find((section) => !readIds.has(section.id));
  const target = next ?? topic.sections[topic.sections.length - 1];
  if (!target) return null;

  const percent = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <Link
      href={`/topics/${topic.slug}/${target.slug}`}
      className="bg-card border-line rounded-panel-xl text-ink mb-7 grid grid-cols-[1fr_auto] items-center gap-6 border px-7 py-[22px] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:text-ink"
    >
      <div className="flex min-w-0 items-center gap-5">
        {/* Номер розділу плиткою: те саме місце, де на картках тем стоїть
            рівень, — око знаходить «де я» раніше, ніж читає заголовок. */}
        <div className="bg-tint text-green-tx font-serif rounded-tile-lg flex h-14 w-14 flex-none items-center justify-center text-[22px] font-extrabold">
          {target.n}
        </div>

        <div className="min-w-0">
          <div className="text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
            Продовжити
          </div>
          <div className="font-serif mt-1 text-[22px] font-extrabold tracking-[-0.3px]">
            {topic.title}{' '}
            <span className="font-sans text-ink-3 text-[14px] font-semibold">
              {/* Повна назва розділу, не `short`. Скорочення існує для
                  бічного змісту, де колонка вузька; тут рядок іде на всю
                  ширину картки, і макет підписує саме повну — «Past
                  Perfect — передминулий», а не «Past Perfect». */}· розділ {target.n} з {total} ·{' '}
              {target.title}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="bg-track h-1.5 w-[280px] max-w-[40vw] overflow-hidden rounded-pill">
              <div className="bg-acc h-full" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-ink-3 text-[13px]">{read} прочитано</span>
          </div>
        </div>
      </div>

      <span className="border-acc text-green-tx rounded-btn border-[1.5px] px-[22px] py-3 text-[15px] font-bold whitespace-nowrap">
        Читати далі →
      </span>
    </Link>
  );
}

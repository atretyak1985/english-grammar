'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Бічна колонка розділу: зміст теми і підказка Alex до цього правила.
 *
 * Зміст сюди повернувся не таким, яким його прибрали. Раніше в колонці стояла
 * картка прогресу, і вона рахувала відвідане: розділ ставав «прочитаним» від
 * самого відкриття. Тепер прочитане позначає читач кнопкою під текстом, тому
 * галочки в списку показують роботу, а не переходи, — і список має сенс
 * тримати перед очима всю дорогу.
 *
 * Друга картка — єдине, що взагалі змінюється від розділу до розділу: рядок
 * Alex прив'язаний до конкретного правила через `section.hint`. Там, де тексту
 * підказки ще немає, картки немає теж: порожня бульбашка з аватаром обіцяє
 * пораду, якої не буде.
 */
export function SectionAside({ topic, current }: { topic: TopicMeta; current: TopicSection }) {
  const { isSectionRead, readCount, ready } = useAppState();

  const total = topic.sections.length;
  const read = ready ? readCount(topic.slug) : 0;

  return (
    <aside className="sticky top-[104px] flex flex-col gap-3.5">
      <nav
        aria-label="Зміст теми"
        className="bg-card border-line rounded-tile-lg border px-4 py-[18px]"
      >
        <div className="text-ink-3 px-1.5 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
          Зміст · {read} з {total}
        </div>

        <ol className="mt-2.5 flex list-none flex-col gap-0.5 p-0">
          {topic.sections.map((section) => {
            const active = section.slug === current.slug;
            const done = ready && isSectionRead(topic.slug, section.id);

            return (
              <li key={section.slug}>
                <Link
                  href={`/topics/${topic.slug}/${section.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-tile flex items-center gap-2.5 px-1.5 py-[7px] text-[13.5px] ${
                    active
                      ? 'bg-green-bg text-green-tx font-bold'
                      : 'text-ink-2 hover:bg-hover hover:text-ink'
                  }`}
                >
                  <span
                    className={`w-4 flex-none text-right font-mono text-[11px] ${
                      active ? 'text-green-tx' : 'text-ink-3'
                    }`}
                  >
                    {section.n}
                  </span>
                  <span className="truncate">{section.title}</span>
                  {done ? (
                    <span
                      className="text-green ml-auto flex-none text-[12px]"
                      aria-label="прочитано"
                    >
                      ✓
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {current.hint ? (
        <div className="flex items-start gap-2.5">
          <Image
            src="/alex-avatar.png"
            alt=""
            width={30}
            height={30}
            className="mt-0.5 h-[30px] w-[30px] flex-none rounded-full object-cover"
          />
          <p className="bg-card border-line rounded-tile-lg text-ink-body m-0 border px-4 py-3 text-[13.5px] leading-[1.5]">
            {current.hint}
          </p>
        </div>
      ) : null}
    </aside>
  );
}

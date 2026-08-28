'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { remainingMinutes, sectionMinutes } from '@/lib/topics/minutes';
import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Зміст теми біля тексту: де ви є, що вже прочитано і скільки лишилось.
 *
 * Макет показує десять рядків і три крапки замість решти — це прийом
 * артборда, щоб зміст вліз у кадр. Тут перелічені всі розділи: сховати
 * половину змісту означало б зламати рівно ту навігацію, заради якої він
 * і стоїть біля тексту. Панель липка й прокручується сама, тому довгий
 * список не тягне за собою сторінку.
 */
export function TopicSidebar({
  topic,
  current,
}: {
  topic: TopicMeta;
  /** Відкритий розділ; на сторінці змісту його немає */
  current?: TopicSection;
}) {
  const { isSectionRead, ready } = useAppState();

  const done = (section: TopicSection) => ready && isSectionRead(topic.slug, section.id);
  const read = topic.sections.filter(done).length;
  const left = remainingMinutes(topic, done);

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-[96px] lg:self-start">
      <div className="text-ink-3 text-[12.5px]">
        <Link href="/topics" className="text-acc font-bold">
          Теми
        </Link>{' '}
        / {topic.title}
      </div>

      <nav
        aria-label="Зміст теми"
        className="bg-panel border-line rounded-tile border px-5 py-[18px]"
      >
        <div className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
          Зміст · {read} з {topic.sections.length}
          {left > 0 ? ` · ~${left} хв лишилось` : null}
        </div>

        <div className="scrollbar-none mt-3 flex max-h-[min(56vh,560px)] flex-col gap-0.5 overflow-y-auto text-[13.5px]">
          {topic.sections.map((section) => (
            <Row
              key={section.slug}
              topicSlug={topic.slug}
              section={section}
              minutes={sectionMinutes(topic.slug, section.slug)}
              done={done(section)}
              active={current?.slug === section.slug}
            />
          ))}
        </div>
      </nav>

      <p className="bg-panel border-line rounded-tile text-ink-2 m-0 border px-5 py-4 text-[12.5px] leading-[1.6]">
        Розділ зараховується <b className="text-ink">автоматично</b>, коли ви його дочитали.
        Прогрес чесний — без кнопки «позначити».
      </p>
    </div>
  );
}

/**
 * Рядок змісту. Прочитаний віддає свій номер галочці: номер потрібен, щоб
 * знайти місце в темі, а знайдене місце вже позаду.
 */
function Row({
  topicSlug,
  section,
  minutes,
  done,
  active,
}: {
  topicSlug: string;
  section: TopicSection;
  minutes: number | null;
  done: boolean;
  active: boolean;
}) {
  const tone = active
    ? 'bg-tint text-green-tx font-extrabold'
    : done
      ? 'text-label'
      : 'text-ink-2 hover:bg-hover';

  return (
    <Link
      href={`/topics/${topicSlug}/${section.slug}`}
      aria-current={active ? 'page' : undefined}
      className={`rounded-ctrl flex items-center gap-2.5 px-2.5 py-2 ${tone}`}
    >
      {done && !active ? (
        <span className="text-acc font-extrabold" aria-label="прочитано">
          ✓
        </span>
      ) : (
        <span className="tabular-nums">{section.n}.</span>
      )}
      <span className="min-w-0 flex-1">
        {section.short ?? section.title}
        {minutes === null ? null : <span className="text-label"> · {minutes} хв</span>}
      </span>
    </Link>
  );
}

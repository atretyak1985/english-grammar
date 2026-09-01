'use client';

import Link from 'next/link';

import { sectionMinutes } from '@/lib/topics/minutes';
import type { TopicMeta, TopicSection } from '@/types/content';

/**
 * Зміст теми біля тексту: де ви є і скільки часу забере кожен розділ.
 *
 * Прочитаних розділів зміст не позначає, хоч макет і малює галочки. Причина
 * не в оформленні: розділ зараховується просто за відкриттям, тому галочки
 * показували б не «я це знаю», а «я сюди клікав» — і за кілька хвилин
 * гортання тема виглядала б пройденою. Показувати прогрес, який нічого не
 * означає, гірше, ніж не показувати його зовсім.
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
  const total = topic.sections.reduce(
    (sum, section) => sum + (sectionMinutes(topic.slug, section.slug) ?? 0),
    0,
  );

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
          Зміст · {topic.sections.length} розділів{total > 0 ? ` · ~${total} хв` : null}
        </div>

        <div className="scrollbar-none mt-3 flex max-h-[min(56vh,560px)] flex-col gap-0.5 overflow-y-auto text-[13.5px]">
          {topic.sections.map((section) => (
            <Row
              key={section.slug}
              topicSlug={topic.slug}
              section={section}
              minutes={sectionMinutes(topic.slug, section.slug)}
              active={current?.slug === section.slug}
            />
          ))}
        </div>
      </nav>

    </div>
  );
}

/** Рядок змісту: номер, назва і скільки цей розділ забере. */
function Row({
  topicSlug,
  section,
  minutes,
  active,
}: {
  topicSlug: string;
  section: TopicSection;
  minutes: number | null;
  active: boolean;
}) {
  const tone = active
    ? 'bg-tint text-green-tx font-extrabold'
    : 'text-ink-2 hover:bg-hover';

  return (
    <Link
      href={`/topics/${topicSlug}/${section.slug}`}
      aria-current={active ? 'page' : undefined}
      className={`rounded-ctrl flex items-center gap-2.5 px-2.5 py-2 ${tone}`}
    >
      <span className="tabular-nums">{section.n}.</span>
      <span className="min-w-0 flex-1">
        {section.short ?? section.title}
        {minutes === null ? null : <span className="text-label"> · {minutes} хв</span>}
      </span>
    </Link>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TopicAside } from '@/components/topic/TopicAside';
import { TopicSectionList } from '@/components/topic/TopicSectionList';
import { TopicVisit } from '@/components/topic/TopicVisit';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { hasContent } from '@/content/topics';
import { LEVEL_LABEL, READY_TOPICS, topicBySlug } from '@/data/topics';
import { listStories } from '@/lib/library/server';
import { pickSpotlight } from '@/lib/topics/spotlight';

export function generateStaticParams() {
  return READY_TOPICS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) return {};

  return {
    title: topic.pageTitle ?? topic.title,
    description: topic.description ?? topic.desc,
    openGraph: {
      title: topic.pageTitle ?? topic.title,
      description: topic.description ?? topic.desc,
    },
  };
}

/**
 * Вхід у тему: обіцянка курсу ліворуч, орієнтири праворуч.
 *
 * Колонка контексту, якої тут раніше не було, зʼявилась не заради
 * симетрії з розділом. Вона відповідає на три питання, що виникають
 * саме на вході: «скільки я вже пройшов», «де це видно в живому
 * тексті» і «на чому тут спотикаються». Жодне з них не має відповіді
 * в списку розділів, а перше ще й вирішує, куди клікати далі.
 *
 * Ширина 1200, а не спільні 1400: сторінку читають як зміст книжки, і
 * рядок заголовка розділу на всю ширину екрана довелося б вести оком
 * надто далеко до стану праворуч.
 */
export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic || !topic.ready || !hasContent(slug)) notFound();

  // Оповідання потрібні лише для картки «побачити в тексті». Без бази
  // список порожній, `pickSpotlight` віддає null, і картки просто немає.
  const spotlight = pickSpotlight(topic.slug, await listStories());

  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 pt-9 pb-16 leading-[1.5]">
      <TopicVisit topicSlug={topic.slug} />

      <nav aria-label="Хлібні крихти" className="text-ink-3 flex gap-2 text-[13px] font-semibold">
        <Link href="/topics" className="text-acc hover:text-acc2">
          Правила
        </Link>
        <span>/</span>
        <span>{topic.title}</span>
      </nav>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-10 max-[1000px]:grid-cols-1">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="border-line-ctrl rounded-badge text-ink-2 border-[1.5px] px-[7px] py-0.5 font-mono text-[11px] font-bold">
              {LEVEL_LABEL[topic.level]}
            </span>
            {topic.kicker ? (
              <span className="text-acc2 font-mono text-[12px] font-bold tracking-[1.4px] uppercase">
                {topic.kicker}
              </span>
            ) : null}
          </div>

          <h1 className="font-serif mt-3.5 mb-2.5 text-[40px] leading-[1.08] font-extrabold tracking-[-0.8px] [text-wrap:balance]">
            {topic.heroTitle ?? topic.title}
          </h1>

          {topic.heroLede ? (
            <p className="text-ink-2 m-0 mb-[22px] max-w-[64ch] text-[16px] leading-[1.6]">
              {topic.heroLede}
            </p>
          ) : null}

          {/* Ілюстрація теми. Макет резервував 220px, але ілюстрації —
              16:9 і несуть підписи по всьому кадру (Past Simple / Past
              Continuous / Past Perfect стоять під самою лінією часу).
              Кроп до 220px лишив би від картинки середню смугу без
              жодного підпису, тому слот тримає пропорції кадру. */}
          <div className="mb-[22px] aspect-video">
            <ImageSlot
              caption={`Ілюстрація теми: ${topic.title.toLowerCase()}`}
              image={topic.image}
              alt={topic.imageAlt}
              sizes="(max-width: 1000px) 100vw, 800px"
            />
          </div>

          <TopicSectionList topic={topic} />

          {/* «Усе одним полотном» лишається єдиним входом у /all. Макет
              його не малює, але маршрут існує і без цього посилання став
              би недосяжним — тож він стоїть під списком, де його шукають
              після того, як зміст уже переглянули. */}
          <Link
            href={`/topics/${topic.slug}/all`}
            className="text-ink-3 hover:text-acc2 mt-3.5 inline-block text-[13.5px] font-semibold"
          >
            Усе одним полотном →
          </Link>
        </div>

        <TopicAside topic={topic} spotlight={spotlight} />
      </div>
    </div>
  );
}

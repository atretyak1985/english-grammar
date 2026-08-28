import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TopicAside } from '@/components/topic/TopicAside';
import { TopicContents } from '@/components/topic/TopicContents';
import { TopicShell } from '@/components/topic/TopicShell';
import { TopicSidebar } from '@/components/topic/TopicSidebar';
import { TopicVisit } from '@/components/topic/TopicVisit';
import { hasContent } from '@/content/topics';
import { READY_TOPICS, topicBySlug } from '@/data/topics';

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
 * Вхід у тему. Розділи живуть окремими сторінками (кожен зі своїм URL і
 * власним запитом у пошуку), а тут — обіцянка теми й картки розділів.
 *
 * Макета в цієї сторінки концепція не малює: вона виведена зі сторінки
 * розділу (2b) — той самий каркас і ті самі колонки, лише посередині
 * замість тексту стоять картки розділів. Темного герой-блока більше немає:
 * на паперовій основі він читався як чужа плита, а обіцянку теми несе
 * заголовок.
 */
export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic || !topic.ready || !hasContent(slug)) notFound();

  return (
    <TopicShell
      contents={<TopicSidebar topic={topic} />}
      aside={<TopicAside topic={topic} />}
    >
      <TopicVisit topicSlug={topic.slug} />

      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <h1 className="font-serif m-0 mb-1.5 text-[32px] leading-[1.1] font-extrabold tracking-[-0.5px]">
            {topic.heroTitle ?? topic.title}
          </h1>
          {topic.heroLede ? (
            <p className="text-ink-2 m-0 max-w-[62ch] text-[14px] leading-[1.6]">{topic.heroLede}</p>
          ) : null}
        </div>
        <Link
          href={`/topics/${topic.slug}/all`}
          className="border-line-ctrl text-ink rounded-btn flex-none border-[1.5px] px-4 py-2.5 text-[13px] font-bold"
        >
          Усе одним полотном
        </Link>
      </div>

      <TopicContents topic={topic} />
    </TopicShell>
  );
}

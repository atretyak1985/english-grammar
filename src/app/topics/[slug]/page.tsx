import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TopicContents } from '@/components/topic/TopicContents';
import { TopicHero } from '@/components/topic/TopicHero';
import { TopicSidePanel } from '@/components/topic/TopicSidePanel';
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
 * Зміст теми. Розділи живуть окремими сторінками (кожен зі своїм URL і
 * власним запитом у пошуку), а ця сторінка — вхід у тему.
 */
export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic || !topic.ready || !hasContent(slug)) notFound();

  return (
    <>
      <TopicHero topic={topic} />

      <div className="mx-auto grid max-w-content grid-cols-1 gap-7 px-[30px] pt-[30px] pb-[70px] xl:grid-cols-[minmax(0,1fr)_264px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="mt-0 mb-0 text-[27px] font-extrabold tracking-[-0.5px]">Зміст</h2>
            <Link
              href={`/topics/${topic.slug}/all`}
              className="border-line text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 border px-[13px] py-[7px] text-[12.5px] leading-[normal] font-bold"
            >
              Усе одним полотном
            </Link>
          </div>
          <TopicContents topic={topic} />
        </div>

        <div className="min-w-0">
          <TopicSidePanel topic={topic} />
        </div>
      </div>
    </>
  );
}

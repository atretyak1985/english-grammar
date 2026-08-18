import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TopicHero } from '@/components/topic/TopicHero';
import { TopicSidePanel } from '@/components/topic/TopicSidePanel';
import { TopicToc } from '@/components/topic/TopicToc';
import { TOPIC_CONTENT } from '@/content/topics';
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

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  const load = TOPIC_CONTENT[slug];
  if (!topic || !topic.ready || !load) notFound();

  const { default: Content } = await load();

  return (
    <>
      <TopicHero topic={topic} />

      <div className="mx-auto grid max-w-[1080px] grid-cols-1 gap-8 px-5 xl:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <TopicToc topic={topic} />
          <Content />
        </div>

        <div className="xl:sticky xl:top-[104px] xl:self-start xl:pt-6">
          <TopicSidePanel topic={topic} />
        </div>
      </div>
    </>
  );
}

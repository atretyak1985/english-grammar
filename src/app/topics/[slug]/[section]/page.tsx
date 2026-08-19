import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SectionNav } from '@/components/topic/SectionNav';
import { TopicSidePanel } from '@/components/topic/TopicSidePanel';
import { SECTION_CONTENT, sectionLoader } from '@/content/topics';
import { READY_TOPICS, topicBySlug } from '@/data/topics';

export function generateStaticParams() {
  return READY_TOPICS.flatMap((topic) =>
    Object.keys(SECTION_CONTENT[topic.slug] ?? {}).map((section) => ({
      slug: topic.slug,
      section,
    })),
  );
}

function resolve(topicSlug: string, sectionSlug: string) {
  const topic = topicBySlug(topicSlug);
  const section = topic?.sections.find((item) => item.slug === sectionSlug);
  const load = sectionLoader(topicSlug, sectionSlug);
  if (!topic || !topic.ready || !section || !load) return null;
  return { topic, section, load };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}): Promise<Metadata> {
  const { slug, section } = await params;
  const found = resolve(slug, section);
  if (!found) return {};

  const title = `${found.section.title} — ${found.topic.title}`;
  return {
    title,
    description: found.section.lede ?? found.topic.description ?? found.topic.desc,
    openGraph: { title, description: found.section.lede ?? found.topic.desc },
  };
}

/**
 * Один розділ теми — окрема сторінка з власним URL, щоб її можна було знайти
 * в пошуку й переслати посиланням. Наскрізне читання тримає SectionNav.
 */
export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  const { slug, section } = await params;
  const found = resolve(slug, section);
  if (!found) notFound();

  const { default: Content } = await found.load();

  return (
    <div className="mx-auto grid max-w-content grid-cols-1 gap-7 px-[30px] pt-[30px] pb-[70px] xl:grid-cols-[minmax(0,1fr)_264px]">
      <div className="min-w-0">
        <Content />
        <SectionNav topic={found.topic} current={found.section} />
      </div>

      <div className="min-w-0">
        <TopicSidePanel topic={found.topic} section={found.section} />
      </div>
    </div>
  );
}

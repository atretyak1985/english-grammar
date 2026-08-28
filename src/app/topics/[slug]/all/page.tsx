import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { hasContent, sectionLoader } from '@/content/topics';
import { TopicShell } from '@/components/topic/TopicShell';
import { TopicSidebar } from '@/components/topic/TopicSidebar';
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
    title: `${topic.title} — усе одним полотном`,
    // Той самий текст, що й на сторінках розділів, тому в індекс не віддаємо.
    robots: { index: false, follow: true },
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

/**
 * Уся тема однією сторінкою: для Ctrl+F, друку і швидкого перегляду.
 * Розділи мають свої сторінки, тому цей вигляд не індексується.
 */
export default async function TopicAllPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic || !topic.ready || !hasContent(slug)) notFound();

  // Ті самі файли, що й окремі сторінки розділів — просто всі поспіль.
  const sections = await Promise.all(
    topic.sections.map(async (section) => {
      const load = sectionLoader(slug, section.slug);
      return load ? { slug: section.slug, Content: (await load()).default } : null;
    }),
  );

  return (
    <TopicShell contents={<TopicSidebar topic={topic} />}>
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-5">
        <h1 className="font-serif m-0 text-[32px] leading-[1.1] font-extrabold tracking-[-0.5px]">
          {topic.title} — усе одним полотном
        </h1>
        <Link
          href={`/topics/${topic.slug}`}
          className="border-line-ctrl text-ink rounded-btn flex-none border-[1.5px] px-4 py-2.5 text-[13px] font-bold"
        >
          До змісту теми
        </Link>
      </div>
      <article className="bg-panel border-line rounded-panel border px-[42px] py-9">
        {sections.filter((entry) => entry !== null).map(({ slug: id, Content }) => (
          <Content key={id} />
        ))}
      </article>
    </TopicShell>
  );
}

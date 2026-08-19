import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
  const load = TOPIC_CONTENT[slug];
  if (!topic || !topic.ready || !load) notFound();

  const { default: Content } = await load();

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-[70px]">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="mt-0 mb-0 text-[27px] font-extrabold tracking-[-0.5px]">
          {topic.title} — усе одним полотном
        </h1>
        <Link
          href={`/topics/${topic.slug}`}
          className="border-line text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 border px-[13px] py-[7px] text-[12.5px] leading-[normal] font-bold"
        >
          До змісту теми
        </Link>
      </div>
      <div className="min-w-0">
        <Content />
      </div>
    </div>
  );
}

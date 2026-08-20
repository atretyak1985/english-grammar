import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StoryReader } from '@/components/library/StoryReader';
import { loadStory } from '@/lib/library/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await loadStory(slug);
  if (!story) return {};

  return {
    title: story.title,
    description: `${story.title} — ${story.author}. Підсвітка часів уже готова.`,
  };
}

/**
 * Читалка одного оповідання: серверний компонент бере готову розмітку з бази
 * (`loadStory`), і саме тому клієнтський `StoryReader` під ним не звертається
 * до `/api/analyze` взагалі (SC-1). `notFound()` на промах — так само, як
 * `src/app/topics/[slug]/page.tsx`.
 */
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await loadStory(slug);
  if (!story) notFound();

  return (
    <StoryReader
      slug={story.slug}
      title={story.title}
      author={story.author}
      source={story.source}
      license={story.license}
      sourceUrl={story.sourceUrl}
      body={story.body}
      matches={story.matches}
      frequency={story.frequency}
    />
  );
}

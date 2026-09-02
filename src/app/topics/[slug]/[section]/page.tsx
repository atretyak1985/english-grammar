import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SectionPager } from '@/components/topic/SectionPager';
import { SectionRefProvider } from '@/components/topic/SectionRef';
import { TopicBreadcrumbs } from '@/components/topic/TopicBreadcrumbs';
import { TopicShell } from '@/components/topic/TopicShell';
import { TopicVisit } from '@/components/topic/TopicVisit';
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
 * в пошуку й переслати посиланням. Зміст-сайдбар звідси прибрано: «де я?»
 * кажуть хлібні крихти над текстом, «куди далі?» — кнопки під ним, а повний
 * список розділів живе на вході в тему. Текст за це отримує всю ширину
 * колонки читання.
 *
 * Правої колонки, яку малює макет 2b, тут немає: прогрес теми показував
 * відвідане замість вивченого, а пастка й рядок Alex не змінювалися від
 * розділу до розділу — три однакові картки на кожній сторінці теми лише
 * звужували колонку самого тексту.
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
    <TopicShell>
      <TopicVisit topicSlug={found.topic.slug} sectionId={found.section.id} />
      <TopicBreadcrumbs topic={found.topic} current={found.section.short ?? found.section.title} />
      <article className="bg-panel border-line rounded-panel border px-[42px] py-9">
        <SectionRefProvider topicSlug={found.topic.slug} sections={found.topic.sections}>
          <Content />
        </SectionRefProvider>
      </article>
      <SectionPager topic={found.topic} current={found.section} />
    </TopicShell>
  );
}

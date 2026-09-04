import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SectionAside } from '@/components/topic/SectionAside';
import { SectionNext } from '@/components/topic/SectionNext';
import { SectionPager } from '@/components/topic/SectionPager';
import { SectionRefProvider } from '@/components/topic/SectionRef';
import { TopicVisit } from '@/components/topic/TopicVisit';
import { SECTION_CONTENT, sectionLoader } from '@/content/topics';
import { READY_TOPICS, topicBySlug } from '@/data/topics';
import { listStories } from '@/lib/library/server';
import { pickSpotlight } from '@/lib/topics/spotlight';

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
 * в пошуку й переслати посиланням.
 *
 * Дві колонки, як на сторінці теми: текст і вузька колонка контексту. Зміст
 * теми сюди повернувся, але вже як список розділів із галочками, а не як
 * картка прогресу, — і саме тому він тут доречний: читач бачить, де він у
 * темі, не вертаючись на вхід. Решта карток правої колонки на сторінку
 * розділу не переїхала: усе, що не змінюється від розділу до розділу,
 * лишилось на вході в тему.
 *
 * Текст більше не лежить на білій панелі. Панель відділяла його від тла тоді,
 * коли колонка була одна на всю ширину; поруч із карткою змісту вона
 * перетворювала сторінку на дві коробки, і читати між ними важче, ніж по
 * самому паперу.
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
  // Без бази список оповідань порожній, `pickSpotlight` віддає null — і в
  // блоці «що далі» лишається сама вправа.
  const spotlight = pickSpotlight(found.topic.slug, await listStories());

  return (
    <div className="mx-auto w-full max-w-[1200px] px-10 pt-9 pb-16 leading-[1.5]">
      <TopicVisit topicSlug={found.topic.slug} />

      <nav aria-label="Хлібні крихти" className="text-ink-3 flex gap-2 text-[13px] font-semibold">
        <Link href="/topics" className="text-acc hover:text-acc2">
          Правила
        </Link>
        <span>/</span>
        <Link href={`/topics/${found.topic.slug}`} className="text-acc hover:text-acc2">
          {found.topic.title}
        </Link>
        <span>/</span>
        <span>
          {found.section.n} · {found.section.short ?? found.section.title}
        </span>
      </nav>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-10 max-[1000px]:grid-cols-1">
        <div>
          <article>
            <SectionRefProvider topicSlug={found.topic.slug} sections={found.topic.sections}>
              <Content />
            </SectionRefProvider>
          </article>

          <SectionNext spotlight={spotlight} />
          <SectionPager topic={found.topic} current={found.section} />
        </div>

        <SectionAside topic={found.topic} current={found.section} />
      </div>
    </div>
  );
}

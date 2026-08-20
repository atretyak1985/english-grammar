'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';
import { wordFrequency } from '@/lib/analyzer/vocabulary';
import { useTexts } from '@/lib/state/texts';

/** Три картки входу: «Продовжити», «Аналіз тексту», «Слова» (CONCEPT 2). */
export function EntryCards() {
  const { state, readCount, isSectionRead } = useAppState();
  const { texts } = useTexts();

  const continueTopic =
    READY_TOPICS.find((topic) => topic.slug === state.lastTopic) ?? READY_TOPICS[0];
  const read = continueTopic ? readCount(continueTopic.slug) : 0;
  const sections = continueTopic?.sections ?? [];

  // Саме перший непрочитаний, а не наступний за номером: розділи тепер окремі
  // сторінки, і читати їх можна в будь-якому порядку.
  const next = continueTopic
    ? (sections.find((section) => !isSectionRead(continueTopic.slug, section.id)) ??
      sections[sections.length - 1])
    : undefined;
  const continueLabel =
    read > 0
      ? `Прочитано ${read} з ${sections.length} розділів — далі: ${next?.title ?? ''}`
      : 'Ще не починали — почніть з розділу 1';

  const corpusSize = useMemo(
    () => wordFrequency(texts.map((text) => text.body).join('\n')).length,
    [texts],
  );
  const known = Object.values(state.words).filter((status) => status === 'known').length;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
      {continueTopic ? (
        <EntryCard
          href={`/topics/${continueTopic.slug}`}
          kicker="Продовжити"
          kickerClass="text-ps"
          accent="border-l-ps"
          title={continueTopic.title}
          desc={continueLabel}
        />
      ) : null}
      <EntryCard
        href="/analyze"
        kicker="Новий інструмент"
        kickerClass="text-pc"
        accent="border-l-pc"
        title="Аналіз тексту"
        desc="Вставте статтю, PDF або скан — часи підсвітяться в тексті."
      />
      <EntryCard
        href="/words"
        kicker="Новий інструмент"
        kickerClass="text-pp"
        accent="border-l-pp"
        title="Слова за частотою"
        desc={`${corpusSize} слів з ваших текстів · ${known} позначено «знаю»`}
      />
    </div>
  );
}

function EntryCard({
  href,
  kicker,
  kickerClass,
  accent,
  title,
  desc,
}: {
  href: string;
  kicker: string;
  kickerClass: string;
  accent: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className={`bg-surface border-line rounded-card shadow-card block border border-l-[3px] px-[22px] py-5 text-left leading-[normal] text-inherit transition hover:-translate-y-[2px] ${accent}`}
    >
      <div className={`text-[11px] font-extrabold tracking-[1.1px] uppercase ${kickerClass}`}>
        {kicker}
      </div>
      <div className="mt-[7px] mb-1 text-[18px] font-extrabold tracking-[-0.3px]">{title}</div>
      <div className="text-ink-2 text-[14px]">{desc}</div>
    </Link>
  );
}

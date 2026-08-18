'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';

/** Три картки входу: «Продовжити», «Аналіз тексту», «Слова» (CONCEPT 2). */
export function EntryCards() {
  const { state, readCount } = useAppState();

  const continueTopic =
    READY_TOPICS.find((topic) => topic.slug === state.lastTopic) ?? READY_TOPICS[0];
  const read = continueTopic ? readCount(continueTopic.slug) : 0;
  const total = continueTopic?.sections.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
      {continueTopic ? (
        <EntryCard
          href={`/topics/${continueTopic.slug}`}
          icon="▶"
          title={read > 0 ? 'Продовжити' : 'Почати'}
          desc={`${continueTopic.title} — ${read} з ${total} розділів`}
          accent="border-t-ps"
        />
      ) : null}
      <EntryCard
        href="/analyze"
        icon="🔍"
        title="Аналіз тексту"
        desc="Вставте англійський текст — побачите, де які часи і що вам незнайоме"
        accent="border-t-pc"
      />
      <EntryCard
        href="/words"
        icon="🗂"
        title="Слова"
        desc="Частотний список з ваших текстів зі статусами «не знаю / вчу / знаю»"
        accent="border-t-pp"
      />
    </div>
  );
}

function EntryCard({
  href,
  icon,
  title,
  desc,
  accent,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`bg-surface border-line rounded-card shadow-card hover:shadow-lift block border border-t-4 px-6 py-5 transition hover:-translate-y-[3px] ${accent}`}
    >
      <div className="text-[20px]" aria-hidden>
        {icon}
      </div>
      <div className="mt-1.5 text-[19px] font-bold tracking-[-0.3px]">{title}</div>
      <div className="text-ink-2 mt-1 text-[15px]">{desc}</div>
    </Link>
  );
}

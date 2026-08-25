'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS } from '@/data/topics';

/** Картки входу: «Продовжити», «Аналізатор», «Тренування», «Мій словник». */
export function EntryCards() {
  const { state, readCount, isSectionRead } = useAppState();

  const continueTopic =
    READY_TOPICS.find((topic) => topic.slug === state.lastTopic) ?? READY_TOPICS[0];
  const sections = continueTopic?.sections ?? [];

  // Саме перший непрочитаний, а не наступний за номером: розділи тепер окремі
  // сторінки, і читати їх можна в будь-якому порядку.
  const next = continueTopic
    ? (sections.find((section) => !isSectionRead(continueTopic.slug, section.id)) ??
      sections[sections.length - 1])
    : undefined;

  const statuses = Object.values(state.words);
  const learning = statuses.filter((status) => status === 'learning').length;
  const inDictionary = statuses.filter((status) => status !== 'unknown').length;

  const read = continueTopic ? readCount(continueTopic.slug) : 0;

  return (
    <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(235px,1fr))] gap-4">
      {continueTopic ? (
        <EntryCard
          href={`/topics/${continueTopic.slug}`}
          glyph="▸"
          chip="bg-ps-bg text-ps-tx"
          title="Продовжити тему"
          desc={
            read > 0
              ? `${continueTopic.title} · далі: ${next?.short ?? next?.title ?? ''}`
              : `${continueTopic.title} · почніть з розділу 1`
          }
        />
      ) : null}
      <EntryCard
        href="/analyze"
        glyph="Aa"
        chip="bg-green-bg text-green-tx"
        title="Аналізатор"
        desc="Ваш текст або бібліотека з готовою підсвіткою."
      />
      {/*
        Тренування ще немає як маршруту, тому картка не веде нікуди й не
        вдає, ніби веде. Число зліва при цьому справжнє — саме стільки слів
        чекатиме на гру, коли вона зʼявиться.
      */}
      <EntryCard
        glyph="⚡"
        chip="bg-yellow-bg text-yellow-tx"
        title="Тренування"
        desc={`${learning} слів чекає на гру з Lens.`}
      />
      <EntryCard
        href="/words"
        glyph="✎"
        chip="bg-pp-bg text-pp-tx"
        title="Мій словник"
        desc={`${inDictionary} слів зі статусами «вчу» і «знаю».`}
      />
    </div>
  );
}

function EntryCard({
  href,
  glyph,
  chip,
  title,
  desc,
}: {
  href?: string;
  glyph: ReactNode;
  chip: string;
  title: string;
  desc: string;
}) {
  const body = (
    <>
      <div
        className={`font-display rounded-tile mb-3 flex h-11 w-11 items-center justify-center text-[19px] font-extrabold ${chip}`}
        aria-hidden
      >
        {glyph}
      </div>
      <div className="font-display text-[17px] font-extrabold">{title}</div>
      <div className="text-ink-2 mt-1 text-[13px] font-semibold">{desc}</div>
    </>
  );

  const shell =
    'block border-line bg-card rounded-card-lg shadow-card border px-[22px] py-5 text-left text-inherit';

  return href ? (
    <Link href={href} className={`${shell} transition-transform hover:-translate-y-[5px]`}>
      {body}
    </Link>
  ) : (
    <div className={`${shell} cursor-default`}>{body}</div>
  );
}

'use client';

import { useMemo } from 'react';

import Link from 'next/link';

import { ReaderCanvas } from '@/components/analyzer/ReaderCanvas';
import { statsOf, tokenize, type Match } from '@/lib/analyzer/tenses';

export interface StoryReaderProps {
  slug: string;
  title: string;
  author: string;
  source: string;
  license: string;
  sourceUrl: string;
  body: string;
  matches: Match[];
  frequency: { word: string; count: number }[];
}

/**
 * Читалка оповідання з бібліотеки. **Не викликає `useReview`** — розмітка й
 * частотність приходять пропами з `loadStory` (серверний компонент), а не з
 * моделі: це і є SC-1, гість читає без жодного звернення до `/api/analyze`.
 *
 * Панель статистики полотна (`ReaderCanvas`) чекає `TenseStat` з прикладами, а
 * база дає лише кількості (`stories.stats`) — тому `statsOf` рахується тут,
 * локально, чистим проходом по вже готовій розмітці з бази. Це НЕ порушує
 * SC-9: числа походять з тієї самої розмітки, що засіяна в базі, модель
 * вдруге не викликається, і кількості з `statsOf` мають збігтися з
 * `stories.stats`.
 */
export function StoryReader({
  slug,
  title,
  author,
  source,
  license,
  sourceUrl,
  body,
  matches,
  frequency,
}: StoryReaderProps) {
  // `library:` попереду — щоб ключ позиції не міг випадково збігтися з ключем
  // власного тексту користувача (`docKeyOf` в аналізаторі: `id` з бібліотеки
  // текстів або `local:<довжина>`) чи з `'demo'`.
  const docKey = `library:${slug}`;
  const tokens = useMemo(() => tokenize(body), [body]);
  const stats = useMemo(() => statsOf(tokens, matches), [tokens, matches]);

  return (
    <ReaderCanvas
      text={body}
      docKey={docKey}
      matches={matches}
      stats={stats}
      // Крихта перед назвою — єдиний «де я?» читалки: топбар підсвічує розділ,
      // але шлях назад на полицю без неї вів лише через нього.
      title={
        <>
          <Link href="/reading" className="font-sans text-acc text-[12.5px] font-bold">
            Читання
          </Link>
          <span className="font-sans text-ink-3 mx-2 text-[12.5px] font-semibold" aria-hidden>
            /
          </span>
          {title}
        </>
      }
      meta={author}
      // У бібліотеці розібрано 100% тексту: підпис «пораховано по
      // прочитаному» тут був би брехнею, тому coverage не передається взагалі.
      coverage={null}
      frequency={frequency}
      footer={
        <div className="text-ink-3 text-[11.5px] leading-[1.5]">
          {author} ·{' '}
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {source}
          </a>{' '}
          · {license}
        </div>
      }
    />
  );
}

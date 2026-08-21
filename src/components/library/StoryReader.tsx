'use client';

import { useMemo } from 'react';

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
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-6">
      <h1 className="mt-0 mb-1 text-[32px] font-extrabold tracking-[-0.8px]">{title}</h1>
      <div className="text-ink-3 mb-5 text-[14px] font-semibold">{author}</div>

      <ReaderCanvas
        text={body}
        docKey={docKey}
        matches={matches}
        stats={stats}
        // У бібліотеці розібрано 100% тексту: підпис «пораховано по
        // прочитаному» тут був би брехнею, тому coverage не передається взагалі.
        coverage={null}
        frequency={frequency}
        footer={
          <div className="text-ink-3 mt-4 text-[11.5px] leading-[normal]">
            {author} ·{' '}
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {source}
            </a>{' '}
            · {license}
          </div>
        }
      />
    </div>
  );
}

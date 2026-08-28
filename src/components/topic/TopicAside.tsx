'use client';

import Image from 'next/image';

import { useAppState } from '@/components/providers/AppStateProvider';
import type { TopicMeta } from '@/types/content';

/**
 * Контекст теми збоку від тексту: чого стерегтися і скільки слів звідси вже
 * у вашій роботі.
 *
 * Картки прогресу теми, яку малює макет, тут немає: розділ зараховується за
 * відкриттям, тому смужка показувала б не вивчене, а відвідане, і після
 * кількох хвилин гортання щиро повідомляла б «Тему пройдено».
 *
 * Немає й картки «Де це в текстах» — скільки разів цей час траплявся вам у
 * прочитаному. Застосунок не зберігає, які тексти ви читали і які часи в них
 * зустрічали, тому будь-яке число в ній було б вигаданим. Картка повернеться
 * разом зі сховищем, з якого її можна порахувати.
 */
export function TopicAside({ topic }: { topic: TopicMeta }) {
  const { state } = useAppState();

  // Слова теми, які ви вже взяли в роботу. `words` перелічує лексику розділів,
  // статуси живуть у стані — перетин і є чесною відповіддю.
  const learning = (topic.words ?? []).filter(
    (word) => state.words[word.toLowerCase()] === 'learning',
  ).length;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-[96px] lg:self-start">
      {topic.trap ? (
        <div className="bg-deep text-deep-ink rounded-tile px-5 py-[18px]">
          <div className="text-yellow font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
            Пастка для українців
          </div>
          <div className="text-deep-ink-2 mt-2 text-[13px] leading-[1.6]">
            «{topic.trap.quote}» — <Strong text={topic.trap.body} word={topic.trap.strong} />
          </div>
        </div>
      ) : null}

      <div className="bg-panel border-line rounded-tile flex items-center gap-3 border px-5 py-4">
        <Image
          src="/alex-cutout.png"
          alt="Alex the Linguist"
          width={315}
          height={365}
          className="h-auto w-11 flex-none"
        />
        <div className="text-ink-2 text-[12.5px] leading-[1.55]">
          {learning > 0 ? (
            <>
              З цієї теми у вас <b className="text-ink">{learning} слів</b> зі статусом «вчу»
            </>
          ) : (
            <>Позначайте слова в тексті «вчу» — вони збиратимуться сюди</>
          )}
        </div>
      </div>
    </div>
  );
}

/** Виділяє в поясненні те слово, на якому тримається правило. */
function Strong({ text, word }: { text: string; word?: string }) {
  if (!word) return <>{text}</>;

  const at = text.indexOf(word);
  if (at < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <b className="text-deep-ink">{word}</b>
      {text.slice(at + word.length)}
    </>
  );
}

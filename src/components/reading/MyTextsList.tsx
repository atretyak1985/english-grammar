'use client';

import { useRouter } from 'next/navigation';

import { formatWords } from '@/components/reading/format';
import { tokenize } from '@/lib/analyzer/tenses';
import { wordTokens } from '@/lib/analyzer/words';
import { daysLabel } from '@/lib/drills/streak';
import { useReading } from '@/lib/state/reading';
import type { SavedText } from '@/lib/state/texts';

/**
 * «Мої тексти» — те, що людина принесла сама.
 *
 * Рядок навмисно не показує, наскільки текст розібрано моделлю: полиця
 * такого не знає. Покриття живе в аналізаторі й рахується на відкритому
 * тексті, а число з нізвідки тут було б рівно тією вигадкою, якої весь
 * екран уникає.
 */
export function MyTextsList({ texts }: { texts: SavedText[] }) {
  const router = useRouter();
  const { openSaved } = useReading();

  if (texts.length === 0) return null;

  /*
    Відкриваємо так само, як аналізатор: тіло не копіюємо, лише ставимо
    поточним документом — далі текст читається зі своєї бібліотеки.
  */
  function open(text: SavedText) {
    openSaved(text.id, text.title);
    router.push('/analyze');
  }

  return (
    <div className="bg-card border-line mb-2 rounded-2xl border px-7 py-2">
      {texts.map((text) => (
        <div
          key={text.id}
          className="border-track flex flex-wrap items-center gap-[18px] border-b py-4 last:border-b-0"
        >
          <span className="text-ink-3 w-[92px] flex-none font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
            Мій текст
          </span>
          <span className="font-serif min-w-0 text-[16.5px] font-bold">{text.title}</span>
          <span className="text-ink-3 text-[13px] whitespace-nowrap">
            {formatWords(wordTokens(tokenize(text.body)).length)} слів · {addedLabel(text.createdAt)}
          </span>
          <button
            type="button"
            onClick={() => open(text)}
            className="text-acc hover:text-acc2 ml-auto text-[14px] font-bold whitespace-nowrap"
          >
            Читати →
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Коли текст додано. Рахуємо різницю в КАЛЕНДАРНИХ днях, а не в добах:
 * інакше текст, доданий учора ввечері, зранку ще звався б «сьогодні».
 */
function addedLabel(createdAt: string): string {
  const then = new Date(createdAt);
  if (Number.isNaN(then.getTime())) return 'додано нещодавно';

  const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86_400_000);

  if (days <= 0) return 'додано сьогодні';
  if (days === 1) return 'додано вчора';
  return `${daysLabel(days)} тому`;
}

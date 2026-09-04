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
    <div className="bg-card border-line rounded-tile-lg border px-6 py-1">
      {texts.map((text) => (
        <div
          key={text.id}
          className="border-track grid grid-cols-[1fr_auto] items-center gap-[18px] border-b py-3.5 last:border-b-0"
        >
          <div className="min-w-0">
            <div className="font-serif truncate text-[16.5px] font-bold">{text.title}</div>
            <div className="text-ink-3 mt-0.5 text-[13px]">
              {formatWords(wordTokens(tokenize(text.body)).length)} слів ·{' '}
              {addedLabel(text.createdAt)}
            </div>
          </div>
          {/* Колонки «правила в тексті» тут немає навмисно, хоч макет її
              й малює: власний текст розбирається в аналізаторі, і поки
              людина його не відкрила, жодних правил ми про нього не
              знаємо. Перелік «Пасивний стан · Минулі часи» на цьому місці
              був би вигаданим. */}
          <button
            type="button"
            onClick={() => open(text)}
            className="text-acc hover:text-acc2 text-[14px] font-bold whitespace-nowrap"
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

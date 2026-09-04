'use client';

import Link from 'next/link';

import { ContinueBanner } from '@/components/reading/ContinueBanner';
import { MyTextsList } from '@/components/reading/MyTextsList';
import { StoryCard } from '@/components/reading/StoryCard';
import { readPercent } from '@/components/reading/format';
import type { StoryCard as Story } from '@/lib/library/server';
import { useReading } from '@/lib/state/reading';
import { useTexts } from '@/lib/state/texts';

/**
 * Полиця читання: що почато, що є готового і що людина принесла сама.
 *
 * Фільтра за рівнем, сортування й перемикача розділів тут більше немає.
 * Вони мали сенс, коли полиця замислювалась як каталог, — але оповідань
 * два, і три контроли над двома картками коштували 22px висоти й одного
 * зайвого рішення на людину, яка прийшла просто почитати. Обидва
 * розділи тепер стоять стосом і видні одночасно.
 *
 * Компонент лишається клієнтським, і не через фільтри, а через памʼять:
 * місце читання і власні тексти лежать у localStorage, тому сервер про
 * них нічого не знає. Перший кадр однаковий для всіх, а «продовжити» і
 * «мої тексти» зʼявляються після гідратації — інакше довелося б або
 * тягнути особистий стан у HTML, або показувати всім чиюсь чужу книжку.
 */

/** Ключ позиції книжки з бібліотеки — той самий префікс, що ставить читалка. */
const LIBRARY_PREFIX = 'library:';

export function ReadingShelf({ stories }: { stories: Story[] }) {
  const { positions } = useReading();
  const { texts, ready } = useTexts();

  const continueStory = pickContinue(positions, stories);

  return (
    <div className="mx-auto box-border w-full max-w-shell px-10 pt-11 pb-16 leading-[1.5]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif m-0 mb-2 text-[40px] leading-[1.05] font-extrabold tracking-[-0.8px]">
            Що читаємо?
          </h1>
          <p className="text-ink-2 m-0 max-w-[60ch] text-[16px]">
            Оповідання з готовою підсвіткою правил — без входу і без очікування. Або свій текст:
            стаття, PDF, фото сторінки.
          </p>
        </div>
        <Link
          href="/analyze/new"
          className="bg-acc hover:bg-acc2 shadow-acc rounded-btn flex items-center gap-2 px-6 py-[13px] text-[15px] font-bold text-white hover:text-white"
        >
          <Plus />
          Свій текст або файл
        </Link>
      </div>

      {continueStory ? (
        <ContinueBanner story={continueStory.story} anchor={continueStory.anchor} />
      ) : null}

      <SectionHead title="Оповідання" note={`${stories.length} · нові — щотижня`} />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {stories.map((story) => {
          const anchor = positions[`${LIBRARY_PREFIX}${story.slug}`]?.anchor ?? 0;
          return (
            <StoryCard
              key={story.slug}
              story={story}
              percent={anchor > 0 ? readPercent(anchor, story.totalTokens) : null}
            />
          );
        })}
        <OwnTextCard />
      </div>

      {/* «Мої тексти» показуються лише коли вони є. Порожній заголовок із
          нулем повідомляв би про відсутність того, про існування чого
          людина ще не знає. */}
      {ready && texts.length > 0 ? (
        <>
          <SectionHead
            title="Мої тексти"
            note={`${texts.length} · тільки у цьому браузері, поки ви не увійшли`}
            spaced
          />
          <MyTextsList texts={texts} />
        </>
      ) : null}
    </div>
  );
}

function SectionHead({
  title,
  note,
  spaced = false,
}: {
  title: string;
  note: string;
  spaced?: boolean;
}) {
  return (
    <div className={`flex items-baseline gap-3 ${spaced ? 'mt-9 mb-3.5' : 'mb-3.5'}`}>
      <h2 className="font-serif m-0 text-[22px] font-extrabold tracking-[-0.3px]">{title}</h2>
      <span className="text-ink-3 text-[13.5px]">{note}</span>
    </div>
  );
}

/**
 * Картка «свій текст» стоїть у сітці разом з оповіданнями, а не окремою
 * кнопкою над нею. Пунктирна рамка каже, що місце порожнє й чекає, — і
 * саме тому вона в сітці: «сюди можна покласти своє» читається лише
 * поруч із тим, що вже лежить.
 */
function OwnTextCard() {
  return (
    <Link
      href="/analyze/new"
      className="bg-card text-ink hover:border-acc hover:text-ink rounded-tile-lg flex min-h-[280px] flex-col items-center justify-center gap-2.5 border-[1.5px] border-dashed border-[#b8c9c2] p-5 text-center dark:border-line-strong"
    >
      <span className="bg-tint rounded-tile-lg flex h-[52px] w-[52px] items-center justify-center">
        <Plus size={24} stroke="var(--acc)" />
      </span>
      <span className="text-[16px] font-bold">Свій текст</span>
      <span className="text-ink-3 max-w-[230px] text-[13px] leading-[1.5]">
        Стаття, лист, PDF, DOCX чи фото сторінки — підсвітка за секунди
      </span>
    </Link>
  );
}

function Plus({ size = 16, stroke = 'currentColor' }: { size?: number; stroke?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/**
 * Найсвіжіша почата книжка, або `null`, якщо жодної немає.
 *
 * Функція чиста й лежить поза компонентом: роботи тут на десяток ключів і
 * пару оповідань, тому ручна мемоізація коштувала б більше, ніж економить,
 * — а React-компілятор і так тримає результат сам.
 */
function pickContinue(
  positions: Record<string, { anchor: number }>,
  stories: Story[],
): { story: Story; anchor: number } | null {
  const started = Object.entries(positions).filter(
    ([key, position]) => key.startsWith(LIBRARY_PREFIX) && position.anchor > 0,
  );

  for (let i = started.length - 1; i >= 0; i -= 1) {
    const entry = started[i];
    if (!entry) continue;
    const story = stories.find((item) => item.slug === entry[0].slice(LIBRARY_PREFIX.length));
    if (story) return { story, anchor: entry[1].anchor };
  }
  return null;
}

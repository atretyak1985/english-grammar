'use client';

import { useMemo, useState } from 'react';

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
 * Компонент клієнтський не через фільтри — через пам'ять. Місце читання і
 * власні тексти лежать у localStorage, тому сервер про них нічого не знає:
 * перший кадр однаковий для всіх, а банер «продовжити» і «мої тексти»
 * з'являються після гідратації. Це навмисно — інакше довелося б або тягнути
 * особистий стан у HTML, або показувати всім чиюсь чужу книжку.
 */

/** Ключ позиції книжки з бібліотеки — той самий префікс, що ставить читалка. */
const LIBRARY_PREFIX = 'library:';

type Level = 'all' | 'A2' | 'B1' | 'B2';
type Section = 'stories' | 'texts';
type Sort = 'asc' | 'desc';

const LEVELS: Level[] = ['all', 'A2', 'B1', 'B2'];
const LEVEL_LABEL: Record<Level, string> = { all: 'Усі', A2: 'A2', B1: 'B1', B2: 'B2' };

export function ReadingShelf({ stories }: { stories: Story[] }) {
  const [section, setSection] = useState<Section>('stories');
  const [level, setLevel] = useState<Level>('all');
  const [sort, setSort] = useState<Sort>('asc');

  const { positions } = useReading();
  const { texts, ready } = useTexts();

  /*
    Найсвіжіша почата книжка. `setPosition` перевставляє ключ у кінець мапи,
    тому порядок ключів — це порядок звертання, і остання зі своїм префіксом
    і є та, до якої поверталися востаннє.
  */
  const continueStory = pickContinue(positions, stories);

  const visible = useMemo(() => {
    const filtered = level === 'all' ? stories : stories.filter((story) => story.level === level);
    return [...filtered].sort((a, b) => (sort === 'asc' ? a.words - b.words : b.words - a.words));
  }, [stories, level, sort]);

  const textCount = ready ? texts.length : 0;

  return (
    <div className="mx-auto box-border w-full max-w-shell px-10 pt-9 pb-6 leading-[normal]">
      <div className="mb-[26px] flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-serif m-0 mb-2 text-[38px] font-extrabold tracking-[-0.8px]">
            Що читаємо?
          </h1>
          <p className="text-ink-2 m-0 max-w-[52rem] text-[15.5px]">
            Оповідання з готовою підсвіткою часів — розбір уже зроблено, читайте без входу і без
            очікування моделі.
          </p>
        </div>
        <Link
          href="/analyze/new"
          className="bg-acc hover:bg-acc2 shadow-acc rounded-[11px] px-[26px] py-3.5 text-[15.5px] font-bold text-white transition-colors duration-150 ease-out"
        >
          + Свій текст або файл
        </Link>
      </div>

      {continueStory ? (
        <ContinueBanner story={continueStory.story} anchor={continueStory.anchor} />
      ) : null}

      <div className="mb-[22px] flex flex-wrap items-center gap-2">
        <SectionChip
          active={section === 'stories'}
          onClick={() => setSection('stories')}
          label={`Оповідання · ${stories.length}`}
        />
        <SectionChip
          active={section === 'texts'}
          onClick={() => setSection('texts')}
          label={`Мої тексти · ${textCount}`}
        />

        <span className="bg-line mx-2 h-[26px] w-px" aria-hidden />

        <span className="text-ink-3 text-[13px]">Рівень:</span>
        {LEVELS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLevel(item)}
            aria-pressed={level === item}
            className={`rounded-pill border-[1.5px] px-[18px] py-2.5 text-[13px] font-bold transition-colors duration-150 ease-out ${
              level === item
                ? 'bg-tint border-acc text-green-tx'
                : 'bg-card border-line-ctrl text-ink-2 hover:border-acc hover:text-green-tx'
            }`}
          >
            {LEVEL_LABEL[item]}
          </button>
        ))}

        <span className="text-ink-3 ml-auto text-[13px]">
          Сортувати:{' '}
          <button
            type="button"
            onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
            className="text-ink font-bold"
          >
            {sort === 'asc' ? 'коротші спершу' : 'довші спершу'}
            {/* Трикутник — SVG, не символ ▾: гліф U+25BE у кожній системній
                гарнітурі свого розміру, і рядок сортування «дихав» би між
                платформами. */}
            <svg
              width="8"
              height="6"
              viewBox="0 0 8 6"
              aria-hidden
              className={`ml-[4px] inline-block align-[1px] ${sort === 'asc' ? '' : 'rotate-180'}`}
            >
              <path d="M0 0h8L4 6Z" fill="currentColor" />
            </svg>
          </button>
        </span>
      </div>

      {section === 'stories' ? (
        <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[18px]">
          {visible.map((story) => {
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
      ) : null}

      {ready ? <MyTextsList texts={texts} /> : null}
    </div>
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

function SectionChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-pill px-5 py-[11px] text-[13.5px] font-bold transition-colors duration-150 ease-out ${
        active
          ? 'bg-deep text-white'
          : 'bg-card border-line-ctrl text-ink-2 hover:border-acc hover:text-green-tx border-[1.5px]'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Пунктирна картка в кінці полиці. Стоїть саме серед оповідань, а не окремою
 * кнопкою збоку: власний текст — така сама книжка на цій полиці, просто ще
 * не принесена.
 */
function OwnTextCard() {
  return (
    <Link
      href="/analyze/new"
      className="bg-card hover:border-acc flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed p-5 text-center text-inherit transition-colors duration-150 ease-out"
      style={{ borderColor: '#b8c9c2' }}
    >
      <div className="bg-tint flex h-14 w-14 items-center justify-center rounded-[14px]">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--acc)"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div className="text-[16px] font-bold">Свій текст</div>
      <div className="text-ink-3 max-w-[230px] text-[13px] leading-[1.55]">
        Стаття, лист, PDF, DOCX чи фото сторінки — підсвітка за секунди, без очікування
      </div>
      <div className="text-label font-mono text-[10.5px] font-bold tracking-[1px] uppercase">
        Нові оповідання — щотижня
      </div>
    </Link>
  );
}

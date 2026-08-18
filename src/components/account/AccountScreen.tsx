'use client';

import Link from 'next/link';

import { useAppState } from '@/components/providers/AppStateProvider';
import { READY_TOPICS, topicBySlug } from '@/data/topics';
import { useTexts } from '@/lib/state/texts';

/** Кабінет: статистика, бібліотека текстів, історія тестів, експорт (CONCEPT 8.4). */
export function AccountScreen({ email }: { email: string | null }) {
  const { state, signedIn, syncing, readCount } = useAppState();
  const { texts, removeText } = useTexts();

  const sectionsRead = Object.values(state.readSections).reduce(
    (sum, sections) => sum + sections.length,
    0,
  );
  const learning = Object.values(state.words).filter((status) => status === 'learning').length;
  const known = Object.values(state.words).filter((status) => status === 'known').length;

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ state, texts }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'english-grammar-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8">
      <h1 className="mt-0 mb-1.5 text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.6px]">
        Кабінет
      </h1>
      <p className="text-ink-2 mt-0 mb-6 text-[16px]">
        {signedIn ? (
          <>
            Ви увійшли як <b>{email ?? 'користувач'}</b>. Прогрес синхронізується між пристроями
            {syncing ? ' · збереження…' : ''}.
          </>
        ) : (
          <>
            Ви працюєте як гість: стан лежить у цьому браузері.{' '}
            <Link href="/login" className="text-ps-dk font-semibold">
              Увійти →
            </Link>
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <Tile value={sectionsRead} label="розділів прочитано" />
        <Tile value={learning} label="слів вчу" />
        <Tile value={known} label="слів знаю" />
      </div>

      <h2 className="mt-10 mb-3 text-[22px] font-bold tracking-[-0.4px]">Прогрес по темах</h2>
      <div className="bg-surface border-line shadow-card overflow-hidden rounded-xl border">
        {READY_TOPICS.map((topic) => (
          <div
            key={topic.slug}
            className="border-line flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
          >
            <Link href={`/topics/${topic.slug}`} className="text-[15px] font-semibold">
              {topic.title}
            </Link>
            <span className="text-ink-3 text-[13.5px] font-bold">
              {readCount(topic.slug)} / {topic.sections.length}
            </span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-[22px] font-bold tracking-[-0.4px]">Історія тестів</h2>
      {state.attempts.length === 0 ? (
        <p className="text-ink-3 text-[14.5px]">Спроб поки немає.</p>
      ) : (
        <div className="bg-surface border-line shadow-card overflow-hidden rounded-xl border">
          {[...state.attempts]
            .reverse()
            .slice(0, 20)
            .map((attempt, index) => {
              const share = attempt.correct / attempt.total;
              return (
                <div
                  key={`${attempt.finishedAt}-${index}`}
                  className="border-line flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <span className="text-[15px] font-semibold">
                    {topicBySlug(attempt.topicSlug)?.title ?? attempt.topicSlug}
                  </span>
                  <span className="text-ink-3 text-[13.5px]">
                    {new Date(attempt.finishedAt).toLocaleDateString('uk-UA')}
                  </span>
                  <span
                    className={`text-[13.5px] font-bold ${
                      share >= 0.85 ? 'text-ok' : share >= 0.65 ? 'text-pc-dk' : 'text-no'
                    }`}
                  >
                    {attempt.correct} / {attempt.total}
                  </span>
                </div>
              );
            })}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-[22px] font-bold tracking-[-0.4px]">Бібліотека текстів</h2>
      {texts.length === 0 ? (
        <p className="text-ink-3 text-[14.5px]">
          Порожньо.{' '}
          <Link href="/analyze" className="text-ps-dk font-semibold">
            Проаналізуйте текст
          </Link>{' '}
          і збережіть його.
        </p>
      ) : (
        <div className="bg-surface border-line shadow-card overflow-hidden rounded-xl border">
          {texts.map((text) => (
            <div
              key={text.id}
              className="border-line flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold">{text.title}</div>
                <div className="text-ink-3 text-[12.5px]">
                  {new Date(text.createdAt).toLocaleDateString('uk-UA')} ·{' '}
                  {text.body.split(/\s+/).length} слів
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeText(text.id)}
                className="text-ink-3 hover:text-no cursor-pointer text-[12.5px] font-semibold"
              >
                видалити
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-[22px] font-bold tracking-[-0.4px]">Дані</h2>
      <button
        type="button"
        onClick={exportData}
        className="border-line bg-surface hover:border-line-strong cursor-pointer rounded-lg border px-3 py-2 text-[13.5px] font-bold"
      >
        Експортувати мої дані (JSON)
      </button>
    </div>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
      <div className="text-[26px] font-extrabold tracking-[-0.5px]">{value}</div>
      <div className="text-ink-3 text-[12.5px] font-bold tracking-[0.8px] uppercase">{label}</div>
    </div>
  );
}

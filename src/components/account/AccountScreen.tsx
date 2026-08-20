'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAppState } from '@/components/providers/AppStateProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { topicBySlug } from '@/data/topics';
import { useReading } from '@/lib/state/reading';
import { useTexts } from '@/lib/state/texts';

const CARD = 'bg-surface border-line rounded-panel shadow-card overflow-hidden border';
const SECTION_TITLE = 'mt-0 mb-1 text-[19px] font-extrabold tracking-[-0.3px]';
const SECTION_LEDE = 'text-ink-2 mt-0 mb-3 text-[14px]';
const SMALL_BUTTON =
  'border-line text-ink-2 hover:text-ink hover:border-ink-3 flex-none cursor-pointer rounded-lg border bg-transparent px-[11px] py-[5px] text-[12px] leading-[normal] font-bold';
const WIDE_BUTTON =
  'border-line text-ink rounded-btn hover:bg-hover cursor-pointer border bg-transparent px-3 py-2 text-left text-[12.5px] leading-[normal] font-bold';

const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('uk-UA');

/** Кабінет: статистика, бібліотека текстів, історія тестів, експорт (CONCEPT 8.4). */
export function AccountScreen({ email }: { email: string | null }) {
  const { state, signedIn, syncing } = useAppState();
  const { texts, removeText } = useTexts();
  // «Відкрити» мусить сказати аналізатору, який саме текст читати: сам перехід
  // на /analyze показував би те, що там лежало доти.
  const { openSaved } = useReading();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

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

  const deleteAccount = async () => {
    if (!confirm('Видалити акаунт і всі дані без можливості відновити?')) return;
    await fetch('/api/account', { method: 'DELETE' });
    router.push('/');
  };

  const attempts = [...state.attempts].reverse().slice(0, 8);

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-[70px]">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div
          className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl text-[22px] font-extrabold text-white"
          style={{ backgroundImage: 'linear-gradient(140deg, var(--ps), var(--pp))' }}
          aria-hidden
        >
          {(email ?? '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="mt-0 mb-[3px] truncate text-[26px] font-extrabold tracking-[-0.6px]">
            {email ?? 'Гість'}
          </h1>
          <div className="text-ink-3 text-[13.5px]">
            {signedIn
              ? `Дані синхронізуються${syncing ? ' · збереження…' : ''}`
              : 'Без входу — стан лежить лише в цьому браузері'}
          </div>
        </div>
        {signedIn ? (
          <Link
            href="/api/auth/signout"
            className="border-line text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 cursor-pointer border px-3.5 py-2 text-[12.5px] leading-[normal] font-bold"
          >
            Вийти
          </Link>
        ) : (
          <Link
            href="/login"
            className="border-line text-ink-2 rounded-btn hover:text-ink hover:border-ink-3 cursor-pointer border px-3.5 py-2 text-[12.5px] leading-[normal] font-bold"
          >
            Увійти
          </Link>
        )}
      </div>

      <div className="mb-[26px] grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        <Tile value={known} label="слів знаю" accent="border-l-ok" />
        <Tile value={learning} label="вчу зараз" accent="border-l-pc" />
        <Tile value={sectionsRead} label="розділів прочитано" accent="border-l-ps" />
        <Tile value={texts.length} label="текстів у бібліотеці" accent="border-l-pp" />
        <Tile value={state.attempts.length} label="спроб тесту" accent="border-l-ps" />
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <h2 className={SECTION_TITLE}>Бібліотека текстів</h2>
            <p className={SECTION_LEDE}>
              Тексти, які ви зберегли з екрана аналізу. Частотний список слів будується з усіх них
              разом.
            </p>
            <div className={CARD}>
              {texts.length > 0 ? (
                texts.map((text) => (
                  <div
                    key={text.id}
                    className="border-line flex items-center gap-3 border-b px-4 py-[13px] last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-bold">{text.title}</div>
                      <div className="text-ink-3 text-[12.5px]">
                        {dateLabel(text.createdAt)} · {text.body.split(/\s+/).length} слів
                      </div>
                    </div>
                    <Link
                      href="/analyze"
                      onClick={() => openSaved(text.id, text.title)}
                      className={SMALL_BUTTON}
                    >
                      Відкрити
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeText(text.id)}
                      className={`${SMALL_BUTTON} hover:text-no hover:border-no`}
                    >
                      Видалити
                    </button>
                  </div>
                ))
              ) : (
                <div className="px-5 py-[26px] text-center">
                  <div className="text-ink-2 text-[14px]">Поки жодного збереженого тексту.</div>
                  <Link
                    href="/analyze"
                    className="border-line text-ink rounded-btn hover:bg-hover mt-[11px] inline-block border px-3.5 py-[7px] text-[12.5px] leading-[normal] font-bold"
                  >
                    Перейти до аналізу тексту
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className={SECTION_TITLE}>Історія тестів</h2>
            <p className={SECTION_LEDE}>
              Все, що нижче 85%, варто перечитати — розділ підсвічується у сайдбарі.
            </p>
            <div className={CARD}>
              {attempts.length > 0 ? (
                attempts.map((attempt, index) => {
                  const percent = Math.round((attempt.correct / attempt.total) * 100);
                  const good = percent >= 85;
                  return (
                    <div
                      key={`${attempt.finishedAt}-${index}`}
                      className="border-line flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[14.5px] font-bold">
                          {topicBySlug(attempt.topicSlug)?.title ?? attempt.topicSlug}
                        </div>
                        <div className="text-ink-3 text-[12.5px]">
                          {dateLabel(attempt.finishedAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[14.5px] font-extrabold">
                          {attempt.correct} / {attempt.total}
                        </span>
                        <span
                          className={`rounded-full px-[9px] py-[3px] text-[11.5px] font-extrabold ${
                            good ? 'bg-ok-bg text-ok' : 'bg-pc-bg text-pc-dk'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-[26px] text-center">
                  <div className="text-ink-2 text-[14px]">Тест ще не пройдено до кінця.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <h2 className="mt-0 mb-3 text-[19px] font-extrabold tracking-[-0.3px]">Налаштування</h2>
            <div className={`${CARD} flex flex-col gap-4 px-[18px] py-4`}>
              <div>
                <div className="mb-[7px] text-[13px] font-bold">Тема оформлення</div>
                <div className="flex gap-[7px]">
                  {(['light', 'dark'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        if (theme !== option) toggleTheme();
                      }}
                      className={`rounded-btn cursor-pointer border px-[13px] py-1.5 text-[12.5px] leading-[normal] font-bold ${
                        theme === option
                          ? 'border-ps bg-ps-bg text-ps-dk'
                          : 'border-line text-ink-2 bg-transparent'
                      }`}
                    >
                      {option === 'light' ? 'Світла' : 'Темна'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-[7px] text-[13px] font-bold">Синхронізація</div>
                <div className="text-ink-3 text-[12.5px]">
                  {signedIn
                    ? syncing
                      ? 'Збереження…'
                      : 'Увімкнена — стан їде за акаунтом'
                    : 'Вимкнена: без входу стан лишається в цьому браузері'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mt-0 mb-3 text-[19px] font-extrabold tracking-[-0.3px]">Ваші дані</h2>
            <div className={`${CARD} flex flex-col gap-2.5 px-[18px] py-4`}>
              <button type="button" onClick={exportData} className={WIDE_BUTTON}>
                Експортувати словник і прогрес (JSON)
              </button>
              {signedIn ? (
                <button
                  type="button"
                  onClick={() => void deleteAccount()}
                  className="border-no text-no rounded-btn hover:bg-no-bg cursor-pointer border bg-transparent px-3 py-2 text-left text-[12.5px] leading-[normal] font-bold"
                >
                  Видалити акаунт і всі дані
                </button>
              ) : null}
              <div className="text-ink-3 text-[12px]">
                Видалення прибирає словник, прогрес і бібліотеку без можливості відновити.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div
      className={`bg-surface border-line rounded-panel shadow-card border border-l-[3px] px-[17px] py-[15px] ${accent}`}
    >
      <div className="text-[27px] font-extrabold tracking-[-0.7px]">{value}</div>
      <div className="text-ink-3 text-[11.5px] font-bold tracking-[0.9px] uppercase">{label}</div>
    </div>
  );
}

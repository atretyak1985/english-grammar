'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { FileSource } from '@/components/analyzer/FileSource';
import { useAppState } from '@/components/providers/AppStateProvider';
import { isMeaningfulWord } from '@/data/stopwords';
import { paginate } from '@/lib/analyzer/pages';
import { TENSE_LABELS, analyzeText } from '@/lib/analyzer/tenses';
import { useTexts } from '@/lib/state/texts';
import type { TenseKey } from '@/types/content';
import type { WordStatus } from '@/types/state';

const TENSE_ORDER: TenseKey[] = ['ps', 'pc', 'pp'];

const TENSE_TEXT: Record<TenseKey, string> = {
  ps: 'text-ps',
  pc: 'text-pc',
  pp: 'text-pp',
};

const TENSE_ON: Record<TenseKey, string> = {
  ps: 'border-ps bg-ps-bg text-ps-dk',
  pc: 'border-pc bg-pc-bg text-pc-dk',
  pp: 'border-pp bg-pp-bg text-pp-dk',
};

const TENSE_HIGHLIGHT: Record<TenseKey, string> = {
  ps: 'text-ps bg-ps-bg',
  pc: 'text-pc bg-pc-bg',
  pp: 'text-pp bg-pp-bg',
};

const TENSE_BAR: Record<TenseKey, string> = {
  ps: 'bg-ps',
  pc: 'bg-pc',
  pp: 'bg-pp',
};

const PILL = 'cursor-pointer rounded-full border px-[11px] py-[5px] text-[12px] leading-[normal] font-bold';
const PILL_OFF = 'border-line text-ink-3 bg-transparent';
const CARD = 'bg-surface border-line rounded-card shadow-card overflow-hidden border';
const CARD_HEAD = 'border-line bg-surface-2 flex items-center gap-2 border-b px-4 py-[11px]';
const CARD_TITLE = 'text-ink-2 text-[12.5px] font-extrabold tracking-[0.4px]';
const SIDE_CARD = 'bg-surface border-line rounded-panel shadow-card border p-4';
const SIDE_LABEL = 'text-ink-3 mb-3 text-[10.5px] font-extrabold tracking-[1.1px] uppercase';

type Source = 'text' | 'file';

/**
 * Аналізатор тексту: правило видно не в підручнику, а у справжньому тексті
 * (CONCEPT 4). Чотири перемикачі керують шарами підсвітки.
 */
export function AnalyzerScreen() {
  const [source, setSource] = useState<Source>('text');
  const [text, setText] = useState(DEMO_TEXT);
  const [fileName, setFileName] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<TenseKey | 'words', boolean>>({
    ps: true,
    pc: true,
    pp: true,
    words: true,
  });

  const { wordStatus, cycleWordStatus } = useAppState();
  const { addText } = useTexts();
  const [saved, setSaved] = useState(false);

  const analysis = useMemo(() => analyzeText(text), [text]);

  // Сторінки як у книзі: довгий документ інакше дає одне полотно на десятки
  // тисяч елементів. Статистика лишається по всьому тексту.
  const pages = useMemo(() => paginate(analysis.tokens), [analysis.tokens]);
  const [page, setPage] = useState(0);
  const current = Math.min(page, pages.length - 1);
  const visible = useMemo(() => {
    const range = pages[current];
    return range ? analysis.tokens.slice(range.start, range.end) : analysis.tokens;
  }, [analysis.tokens, pages, current]);

  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.max(0, Math.min(next, pages.length - 1)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pages.length],
  );

  // Стрілки гортають сторінки — але не тоді, коли курсор у полі введення.
  useEffect(() => {
    if (pages.length < 2) return;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === 'ArrowRight') goToPage(current + 1);
      if (event.key === 'ArrowLeft') goToPage(current - 1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goToPage, pages.length]);

  const unknownHere = useMemo(() => {
    const seen = new Map<string, { status: WordStatus; count: number }>();
    for (const token of analysis.tokens) {
      if (!token.word || !isMeaningfulWord(token.word)) continue;
      const status = wordStatus(token.word);
      if (status === 'known') continue;
      const current = seen.get(token.word);
      seen.set(token.word, { status, count: (current?.count ?? 0) + 1 });
    }
    return [...seen.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]));
  }, [analysis.tokens, wordStatus]);

  const maxTenseCount = Math.max(...TENSE_ORDER.map((tense) => analysis.stats[tense].count), 1);

  const toggle = (key: TenseKey | 'words') =>
    setLayers((current) => ({ ...current, [key]: !current[key] }));

  // Текст із файлу приходить уже розпізнаним — далі він нічим не відрізняється
  // від вставленого руками.
  const acceptExtracted = (extracted: string, title: string) => {
    setFileName(title);
    setText(extracted);
    setSaved(false);
    setPage(0);
  };

  return (
    <div className="max-w-[1240px] px-[30px] pt-[30px] pb-[70px]">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Аналіз тексту</h1>
      <p className="text-ink-2 mt-0 mb-[22px] max-w-[760px] text-[16.5px]">
        Вставте англійський текст, завантажте PDF або фото сторінки. Кожна знайдена форма
        підсвічується своїм кольором, а незнайомі слова — пунктиром.
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-[22px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Джерело: текст або файл */}
          <div className={CARD}>
            <div className={`${CARD_HEAD} justify-between`}>
              <div className={CARD_TITLE}>ДЖЕРЕЛО</div>
              <div className="flex items-center gap-1.5">
                {(['text', 'file'] as Source[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSource(option)}
                    className={`${PILL} ${source === option ? TENSE_ON.ps : PILL_OFF}`}
                  >
                    {option === 'text' ? 'Текст' : 'PDF / фото'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    addText(fileName ?? text.slice(0, 40), text);
                    setSaved(true);
                  }}
                  className={`${PILL} ${TENSE_ON.ps}`}
                >
                  {saved ? 'Збережено ✓' : 'Зберегти в бібліотеку'}
                </button>
              </div>
            </div>

            {source === 'text' ? (
              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setSaved(false);
                  setPage(0);
                }}
                rows={7}
                className="bg-surface text-ink w-full resize-y border-0 p-4 text-[15px] leading-[1.7] outline-none"
                placeholder="Вставте англійський текст…"
              />
            ) : (
              <FileSource onText={acceptExtracted} />
            )}
          </div>

          {/* Чотири перемикачі шарів */}
          <div className={CARD}>
            <div className={`${CARD_HEAD} flex-wrap`}>
              <div className={`${CARD_TITLE} mr-1`}>ПІДСВІТКА</div>
              {TENSE_ORDER.map((tense) => (
                <button
                  key={tense}
                  type="button"
                  onClick={() => toggle(tense)}
                  aria-pressed={layers[tense]}
                  className={`${PILL} ${layers[tense] ? TENSE_ON[tense] : PILL_OFF}`}
                >
                  {TENSE_LABELS[tense]} <span className="opacity-70">{analysis.stats[tense].count}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => toggle('words')}
                aria-pressed={layers.words}
                className={`${PILL} ${
                  layers.words ? 'border-ok bg-ok-bg text-ok' : PILL_OFF
                }`}
              >
                Незнайомі слова <span className="opacity-70">{unknownHere.length}</span>
              </button>
            </div>

            {/* Підсвічений текст */}
            <div className="px-[22px] py-5 text-[16.5px] leading-[2.05] whitespace-pre-wrap">
              {visible.map((token, index) => {
                if (!token.word) return <span key={index}>{token.raw}</span>;

                const status = wordStatus(token.word);
                const tense = token.tense && layers[token.tense] ? token.tense : null;
                const meaningful = isMeaningfulWord(token.word);

                const className = tense
                  ? `${TENSE_HIGHLIGHT[tense]} rounded-[5px] px-[3px] py-px font-bold`
                  : layers.words && meaningful && status === 'unknown'
                    ? 'decoration-ink-3 cursor-pointer underline decoration-dotted decoration-2 underline-offset-4'
                    : layers.words && meaningful && status === 'learning'
                      ? 'bg-pc-bg cursor-pointer rounded'
                      : '';

                return (
                  <span
                    key={index}
                    title={tense ? TENSE_LABELS[tense] : token.word}
                    onClick={() => cycleWordStatus(token.word ?? '')}
                    className={className}
                  >
                    {token.raw}
                  </span>
                );
              })}
            </div>

            {pages.length > 1 ? (
              <div className="border-line bg-surface-2 flex items-center justify-between gap-3 border-t px-[22px] py-3">
                <button
                  type="button"
                  onClick={() => goToPage(current - 1)}
                  disabled={current === 0}
                  className={`${PILL} ${PILL_OFF} disabled:cursor-default disabled:opacity-40`}
                >
                  ← Назад
                </button>
                <div className="text-ink-3 text-[12.5px] font-bold">
                  Сторінка {current + 1} з {pages.length}
                  <span className="hidden sm:inline"> · гортайте стрілками ← →</span>
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(current + 1)}
                  disabled={current === pages.length - 1}
                  className={`${PILL} ${PILL_OFF} disabled:cursor-default disabled:opacity-40`}
                >
                  Далі →
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Статистика */}
        <div className="min-w-0">
          <div className="sticky top-[78px] flex flex-col gap-3.5">
            <div className={SIDE_CARD}>
              <div className={SIDE_LABEL}>Знайдено в тексті</div>
              <div className="flex flex-col gap-[9px]">
                {TENSE_ORDER.map((tense) => {
                  const stat = analysis.stats[tense];
                  return (
                    <div key={tense}>
                      <div className="flex justify-between text-[13.5px] font-bold">
                        <span className={TENSE_TEXT[tense]}>{TENSE_LABELS[tense]}</span>
                        <span>{stat.count}</span>
                      </div>
                      <div className="bg-surface-2 mt-[5px] h-[5px] overflow-hidden rounded-[5px]">
                        <div
                          className={`h-full ${TENSE_BAR[tense]}`}
                          style={{ width: `${Math.round((stat.count / maxTenseCount) * 100)}%` }}
                        />
                      </div>
                      <div className="text-ink-3 mt-1 text-[12.5px]">
                        {stat.examples.join(' · ') || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={SIDE_CARD}>
              <div className={`${SIDE_LABEL} mb-2.5`}>Незнайомі слова тут</div>
              <div className="flex flex-wrap gap-[7px]">
                {unknownHere.slice(0, 14).map(([word, entry]) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => cycleWordStatus(word)}
                    className={`border-ink-3 text-ink-2 cursor-pointer rounded-lg border border-dashed bg-transparent px-[9px] py-1 text-[12.5px] leading-[normal] font-semibold ${
                      entry.status === 'learning' ? 'bg-pc-bg text-pc-dk' : ''
                    }`}
                  >
                    {word} <span className="opacity-60">×{entry.count}</span>
                  </button>
                ))}
                {unknownHere.length === 0 ? (
                  <span className="text-ink-3 text-[13px]">Усе позначено як «знаю».</span>
                ) : null}
              </div>
              <div className="text-ink-3 mt-3 text-[12.5px]">
                Натисніть слово: не знаю → вчу → знаю.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

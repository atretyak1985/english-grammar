'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { FileSource } from '@/components/analyzer/FileSource';
import { useAppState } from '@/components/providers/AppStateProvider';
import { isMeaningfulWord } from '@/data/stopwords';
import { fitPageChars, paginate } from '@/lib/analyzer/pages';
import { TENSE_LABELS, analyzeText } from '@/lib/analyzer/tenses';
import { useBoxSize, useFillScale, useFitHeight } from '@/lib/analyzer/useViewport';
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

  // Поле джерела згортається саме, коли текст уже великий: читати книжку
  // з семирядковим полем над нею — цепів екрана даремно.
  const [sourceOpen, setSourceOpen] = useState<boolean | null>(null);

  const { wordStatus, cycleWordStatus } = useAppState();
  const { addText } = useTexts();
  const [saved, setSaved] = useState(false);

  const analysis = useMemo(() => analyzeText(text), [text]);
  const sourceVisible = sourceOpen ?? text.length < 4000;

  // Читання на весь екран: із книжкою на десятки сторінок картка затісна.
  const [fullscreen, setFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);
  // Висота — з області читання, ширина — з самої текстової колонки: у повному
  // екрані колонка обмежена max-w, і оцінка по ширині області завищувала б
  // кількість символів у рядку вдвічі.
  const reader = useBoxSize(readerRef);
  const prose = useBoxSize(proseRef);
  // У картці висота така, щоб сторінка вмістилась у вікно без зовнішнього скролу.
  const cardHeight = useFitHeight(readerRef);
  // Кількість колонок вирішує доступна область, а не сама колонка тексту:
  // інакше вийшла б циклічна залежність (ширина ← колонки ← ширина).
  const columns = fullscreen && reader.width >= 1100 ? 2 : 1;

  // Сторінки як у книзі: довгий документ інакше дає одне полотно на десятки
  // тисяч елементів. Розмір сторінки — стільки, скільки влазить у зміряну
  // область; статистика лишається по всьому тексту.
  const estimate = useMemo(
    () =>
      fitPageChars({
        width: prose.width || reader.width,
        height: reader.height,
        font: fullscreen ? 17.5 : 16.5,
        lineHeight: 2.05,
        columns,
      }),
    [prose.width, reader.width, reader.height, fullscreen, columns],
  );

  // Оцінку підправляє замір: скільки насправді заповнилось на цій області.
  const scale = useFillScale(
    readerRef,
    proseRef,
    `${estimate}:${reader.height}:${columns}:${text.length}`,
  );
  const pageChars = Math.round(estimate * scale);

  const pages = useMemo(() => paginate(analysis.tokens, pageChars), [analysis.tokens, pageChars]);

  // Позицію тримає номер токена, а не номер сторінки: при зміні розміру вікна
  // сторінки перераховуються, і читач має залишитися там, де читав.
  const [anchor, setAnchor] = useState(0);
  const current = useMemo(() => {
    const found = pages.findIndex((range) => anchor >= range.start && anchor < range.end);
    return found === -1 ? 0 : found;
  }, [pages, anchor]);

  const visible = useMemo(() => {
    const range = pages[current];
    return range ? analysis.tokens.slice(range.start, range.end) : analysis.tokens;
  }, [analysis.tokens, pages, current]);

  const goToPage = useCallback(
    (next: number) => {
      const range = pages[Math.max(0, Math.min(next, pages.length - 1))];
      if (range) setAnchor(range.start);
      // На весь екран крутиться внутрішня область, а не сторінка.
      if (readerRef.current) readerRef.current.scrollTop = 0;
    },
    [pages],
  );

  // Стрілки гортають сторінки, Esc виходить з повного екрана — але не тоді,
  // коли курсор у полі введення.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === 'Escape' && fullscreen) setFullscreen(false);
      if (pages.length < 2) return;
      if (event.key === 'ArrowRight') goToPage(current + 1);
      if (event.key === 'ArrowLeft') goToPage(current - 1);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, fullscreen, goToPage, pages.length]);

  // Під накладкою сторінка не має крутитися за нею.
  useEffect(() => {
    if (!fullscreen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [fullscreen]);

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
    setAnchor(0);
  };

  return (
    <div className={`mx-auto max-w-content px-[30px] pt-[30px] ${sourceVisible ? 'pb-[70px]' : 'pb-6'}`}>
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Аналіз тексту</h1>
      {/* Вступ потрібен, поки текст не завантажений; далі місце віддаємо читанню */}
      {sourceVisible ? (
        <p className="text-ink-2 mt-0 mb-[22px] max-w-[760px] text-[16.5px]">
          Вставте англійський текст, завантажте PDF або фото сторінки. Кожна знайдена форма
          підсвічується своїм кольором, а незнайомі слова — пунктиром.
        </p>
      ) : null}

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
                <button
                  type="button"
                  onClick={() => setSourceOpen(!sourceVisible)}
                  className={`${PILL} ${PILL_OFF}`}
                >
                  {sourceVisible ? '▴ Згорнути' : `▾ Показати поле · ${analysis.wordCount} слів`}
                </button>
              </div>
            </div>

            {!sourceVisible ? null : source === 'text' ? (
              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setSaved(false);
                  setAnchor(0);
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
          <div
            className={
              fullscreen
                ? 'bg-surface fixed inset-0 z-[100] flex flex-col overflow-hidden'
                : CARD
            }
          >
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
              <button
                type="button"
                onClick={() => setFullscreen((open) => !open)}
                className={`${PILL} ${PILL_OFF} ml-auto`}
                title={fullscreen ? 'Esc' : 'Читати на весь екран'}
              >
                {fullscreen ? '✕ Згорнути' : '⤢ На весь екран'}
              </button>
            </div>

            {/* Підсвічений текст */}
            <div
              ref={readerRef}
              className={
                // Жолоб прокрутки зарезервований завжди: інакше поява смуги
                // звужує колонку, підгонка скидається і починає коливатись.
                fullscreen
                  ? 'flex-1 overflow-y-auto [scrollbar-gutter:stable] px-[22px] py-8'
                  : 'overflow-y-auto [scrollbar-gutter:stable] px-[22px] py-5 text-[16.5px] leading-[2.05] whitespace-pre-wrap'
              }
              style={fullscreen ? undefined : { height: cardHeight }}
            >
              <div
                ref={proseRef}
                className={
                  fullscreen
                    ? `mx-auto text-[17.5px] leading-[2.05] whitespace-pre-wrap ${
                        columns === 2 ? 'max-w-[88rem] columns-2 gap-12' : 'max-w-[46rem]'
                      }`
                    : 'whitespace-pre-wrap'
                }
              >
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

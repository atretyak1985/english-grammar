'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { WordPopover } from '@/components/analyzer/WordPopover';
import { useAppState } from '@/components/providers/AppStateProvider';
import { IDLE_TONE, ROW_BUTTON } from '@/components/words/WordStatusButtons';
import { isMeaningfulWord } from '@/data/stopwords';
import { estimatePageCount, paginate } from '@/lib/analyzer/pages';
import { UNKNOWN_LIMIT, pickUnknown } from '@/lib/analyzer/vocabulary';
import {
  TENSE_LABELS,
  applyMatches,
  tokenize,
  type Match,
  type TenseStat,
} from '@/lib/analyzer/tenses';
import { useFittedPage } from '@/lib/analyzer/useFittedPage';
import { useBoxSize, useFitHeight } from '@/lib/analyzer/useViewport';
import { PAGE_ONE, useReading } from '@/lib/state/reading';
import { TENSE_HIGHLIGHT, type TenseKey } from '@/types/content';
import type { WordStatus } from '@/types/state';

/**
 * Полотно читалки: перемикачі шарів, підсвічений текст і пагінація — спільна
 * частина `/analyze` і `/library/[slug]`. Розмітку й статистику полотно
 * ПРИЙМАЄ пропами, а не рахує сам: аналізатор отримує їх з `useReview`,
 * бібліотека — готовими з бази (SC-1). Це і єдина відмінність між екранами:
 * усе решта — вибір тексту, уточнення моделлю, підвал — лишається виклику.
 */

/**
 * Порядок перемикачів: минулі, теперішні, майбутні — трійками за часом. Так
 * вони й подані в темах, тому легенда читається як зміст сайту, а не як
 * алфавіт, і три рядки пігулок самі показують матрицю 3 × 3.
 */
const TENSE_ORDER: TenseKey[] = [
  'ps',
  'pc',
  'pp',
  'prs',
  'prc',
  'prp',
  'fs',
  'fc',
  'fp',
];

const TENSE_TEXT: Record<TenseKey, string> = {
  ps: 'text-ps',
  pc: 'text-pc',
  pp: 'text-pp',
  prs: 'text-ps',
  prc: 'text-pc',
  prp: 'text-pp',
  fs: 'text-ps',
  fc: 'text-pc',
  fp: 'text-pp',
};

/** Увімкнений перемикач. Штрих і подвійна рамка — ті самі ознаки часу. */
const TENSE_ON: Record<TenseKey, string> = {
  ps: 'border-ps bg-ps-bg text-ps-dk',
  pc: 'border-pc bg-pc-bg text-pc-dk',
  pp: 'border-pp bg-pp-bg text-pp-dk',
  prs: 'border-ps border-dashed bg-ps-bg text-ps-dk',
  prc: 'border-pc border-dashed bg-pc-bg text-pc-dk',
  prp: 'border-pp border-dashed bg-pp-bg text-pp-dk',
  fs: 'border-ps border-double border-[3px] bg-ps-bg text-ps-dk',
  fc: 'border-pc border-double border-[3px] bg-pc-bg text-pc-dk',
  fp: 'border-pp border-double border-[3px] bg-pp-bg text-pp-dk',
};

const TENSE_BAR: Record<TenseKey, string> = {
  ps: 'bg-ps',
  pc: 'bg-pc',
  pp: 'bg-pp',
  prs: 'bg-ps',
  prc: 'bg-pc',
  prp: 'bg-pp',
  fs: 'bg-ps',
  fc: 'bg-pc',
  fp: 'bg-pp',
};

/** Стилі кнопок-пігулок — потрібні й викликачу (напр. «Джерело» в аналізаторі). */
export const PILL =
  'cursor-pointer rounded-full border px-[11px] py-[5px] text-[12px] leading-[normal] font-bold';
export const PILL_OFF = 'border-line text-ink-3 bg-transparent';

const CARD = 'bg-surface border-line rounded-card shadow-card overflow-hidden border';
const CARD_HEAD = 'border-line bg-surface-2 flex items-center gap-2 border-b px-4 py-[11px]';
const CARD_TITLE = 'text-ink-2 text-[12.5px] font-extrabold tracking-[0.4px]';
const SIDE_CARD = 'bg-surface border-line rounded-panel shadow-card border p-4';
const SIDE_LABEL = 'text-ink-3 mb-3 text-[10.5px] font-extrabold tracking-[1.1px] uppercase';

export interface ReaderCanvasProps {
  text: string;
  /** Ключ позиції читання (`useReading`) — свій у аналізатора й у кожного оповідання. */
  docKey: string;
  /** ГОТОВА розмітка документа — полотно її не рахує. */
  matches: Match[];
  /** Числа для панелі статистики. */
  stats: Record<TenseKey, TenseStat>;
  /** Підпис під числами, коли пораховано не по всьому тексту (аналізатор). */
  coverage?: { words: number; totalWords: number } | null;
  /** Частотність: бібліотека передає готову з бази, аналізатор рахує з тексту. */
  frequency?: { word: string; count: number }[];
  /** Кнопки/плашки над полотном, які в різних екранів різні (напр. «Джерело»). */
  toolbarExtra?: ReactNode;
  /** Підвал під полотном (бібліотека кладе туди атрибуцію). */
  footer?: ReactNode;
  /**
   * Межу поточної сторінки визначає замір (`useFittedPage`) усередині полотна,
   * а не викликач. Аналізатору вона все ж потрібна — саме нею він каже
   * `useReview`, який шматок довантажувати моделлю, — тому полотно віддає її
   * назовні через цей необов'язковий колбек; бібліотека його просто не передає.
   */
  onPageEndChange?: (pageEnd: number) => void;
}

/**
 * Полотно читалки: перемикачі шарів, підсвічений текст, пагінація й дві
 * бічні картки статистики та незнайомих слів (CONCEPT 4).
 */
export function ReaderCanvas({
  text,
  docKey,
  matches,
  stats,
  coverage = null,
  frequency = [],
  toolbarExtra,
  footer,
  onPageEndChange,
}: ReaderCanvasProps) {
  const [layers, setLayers] = useState<Record<TenseKey | 'words', boolean>>({
    ps: true,
    pc: true,
    pp: true,
    prs: true,
    prc: true,
    prp: true,
    fs: true,
    fc: true,
    fp: true,
    words: true,
  });

  const { state, wordStatus, setWordStatus } = useAppState();

  // Відкрите слово і прямокутник, біля якого стоїть картка. Прямокутник
  // знімається в момент кліку: після нього сторінка вже не рухається, а
  // тримати посилання на сам вузол означало б пережити його перерендер.
  const [openWord, setOpenWord] = useState<{ word: string; anchor: DOMRect } | null>(null);
  const { positions, setPosition } = useReading();

  // Токени рахуються один раз і живлять усе, що не залежить від розбору:
  // пагінацію й межі сторінок.
  const tokens = useMemo(() => tokenize(text), [text]);

  // Читання на весь екран: із книжкою на десятки сторінок картка затісна.
  const [fullscreen, setFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);
  const reader = useBoxSize(readerRef);
  // Картка з підсвіткою займає всю вільну висоту до низу вікна.
  const cardHeight = useFitHeight(cardRef);
  // Кількість колонок вирішує доступна область, а не сама колонка тексту:
  // інакше вийшла б циклічна залежність (ширина ← колонки ← ширина).
  const columns = fullscreen && reader.width >= 1100 ? 2 : 1;

  // Сторінки як у книзі: довгий документ інакше дає одне полотно на десятки
  // тисяч елементів, і читати його неможливо. Статистика при цьому рахується
  // по всьому тексту (CONCEPT 4.2), пропом `stats`, а не тут.
  //
  // Розбиття за символами — лише приблизне: воно дає початкове припущення і
  // оцінку кількості сторінок. Справжню межу знаходить замір нижче.
  const pages = useMemo(() => paginate(tokens), [tokens]);

  // Позицію тримає номер токена, а не номер сторінки: при зміні розміру вікна
  // сторінки перераховуються, і читач має залишитися там, де читав. Вона теж
  // у сховищі — повернення до книжки на першу сторінку рівноцінне її втраті.
  const { anchor, trail } = positions[docKey] ?? PAGE_ONE;

  // Кінець сторінки — за фактом заміру, а не за підрахунком символів: інакше
  // або лишається порожнє місце, або текст обрізається непомітно.
  const guess = useMemo(() => {
    const total = tokens.length;
    const found = pages.find((range) => anchor >= range.start && anchor < range.end);
    if (!found) return Math.min(total, anchor + 1);
    // Беремо не кінець розрахункового діапазону, а його довжину від поточної
    // позиції: межі рухомі, тому після заміру anchor майже ніколи не стоїть на
    // початку діапазону — і його залишок дав би припущення розміром у кілька
    // слів замість сторінки.
    return Math.min(total, anchor + (found.end - found.start));
  }, [pages, anchor, tokens.length]);

  const pageEnd = useFittedPage({
    readerRef,
    proseRef,
    start: anchor,
    guess,
    total: tokens.length,
    resetKey: `${fullscreen ? 'full' : 'card'}:${columns}:${reader.height}:${text.length}`,
  });

  // Викликачу (аналізатору) потрібна саме ця, вимірена межа — не наближення —
  // щоб довантаження моделлю бачило ту сторінку, яку читач бачить насправді.
  useEffect(() => {
    onPageEndChange?.(pageEnd);
  }, [pageEnd, onPageEndChange]);

  // Підсвічений документ з готової розмітки: токени НЕ ті самі, що вище, —
  // applyMatches мутує свою копію, а `tokens` мусить лишатися чистим для
  // пагінації й наступного заміру.
  const analysis = useMemo(() => applyMatches(tokenize(text), matches), [text, matches]);

  const visible = useMemo(
    () => analysis.tokens.slice(anchor, pageEnd),
    [analysis.tokens, anchor, pageEnd],
  );

  // Куди повертатись: межі сторінок рухомі (їх визначає замір), тому «назад»
  // іде за слідом відвіданих початків, а не за перерахунком.
  const goForward = useCallback(() => {
    if (pageEnd >= tokens.length) return;
    setPosition(docKey, { anchor: pageEnd, trail: [...trail, anchor] });
    if (readerRef.current) readerRef.current.scrollTop = 0;
  }, [anchor, trail, docKey, pageEnd, tokens.length, setPosition]);

  /**
   * Номер сторінки — скільки вже перегорнули; оцінка кількості — за середнім
   * розміром прочитаних сторінок. Межі рухомі, тому в підписі стоїть «~».
   */
  const pageNumber = trail.length + 1;
  const pageEstimate = estimatePageCount({
    totalTokens: tokens.length,
    pageNumber,
    anchor,
    pageEnd,
    // На першій сторінці історії ще немає, тому дільник беремо з розрахункової
    // пагінації: вона бачить увесь текст, а перша сторінка книжки часто
    // коротка — титул, зміст, ілюстрація.
    fallbackAverage: pages.length > 0 ? tokens.length / pages.length : undefined,
  });

  const goBack = useCallback(() => {
    if (anchor === 0) return;
    const previous = trail[trail.length - 1];
    setPosition(docKey, {
      // Без сліду (наприклад, після зміни розміру) беремо приблизну межу.
      anchor: previous ?? (pages.filter((range) => range.end <= anchor).pop()?.start ?? 0),
      trail: trail.slice(0, -1),
    });
    if (readerRef.current) readerRef.current.scrollTop = 0;
  }, [anchor, trail, docKey, pages, setPosition]);

  // Стрілки гортають сторінки, Esc виходить з повного екрана — але не тоді,
  // коли курсор у полі введення.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === 'Escape' && fullscreen) setFullscreen(false);
      if (pages.length < 2) return;
      if (event.key === 'ArrowRight') goForward();
      if (event.key === 'ArrowLeft') goBack();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, goBack, goForward, pages.length]);

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

  // Відбір — дешевий прохід уже згорнутим списком. Залежність саме від
  // `state.words`, а не від `wordStatus`: остання — нова замикання на кожен
  // рендер провайдера, через що весь документ перескановувався б на кожен клік.
  const unknownHere = useMemo(() => pickUnknown(frequency, state.words), [frequency, state.words]);

  /** Показуємо двадцять; наступне підтягується саме, бо список перерахувався. */
  const shown = unknownHere.slice(0, UNKNOWN_LIMIT);

  // Відкат останньої дії тримає і слово, і статус ДО неї: слово могло вже мати
  // статус, і «повернути» мусить вертати попередній стан, а не обнуляти його.
  const [lastAction, setLastAction] = useState<{ word: string; from: WordStatus } | null>(null);

  const mark = (word: string, status: WordStatus) => {
    setLastAction({ word, from: wordStatus(word) });
    setWordStatus(word, status);
  };

  const maxTenseCount = Math.max(...TENSE_ORDER.map((tense) => stats[tense].count), 1);

  const toggle = (key: TenseKey | 'words') =>
    setLayers((current) => ({ ...current, [key]: !current[key] }));

  return (
    <>
      <div data-reader-row className="grid grid-cols-[minmax(0,1fr)_320px] gap-[22px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Чотири перемикачі шарів: три часи і незнайомі слова */}
          <div
            ref={cardRef}
            className={
              fullscreen
                ? 'bg-surface fixed inset-0 z-[100] flex flex-col overflow-hidden'
                : `${CARD} flex flex-col`
            }
            style={fullscreen ? undefined : { height: cardHeight }}
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
                  {TENSE_LABELS[tense]} <span className="opacity-70">{stats[tense].count}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => toggle('words')}
                aria-pressed={layers.words}
                className={`${PILL} ${layers.words ? 'border-ok bg-ok-bg text-ok' : PILL_OFF}`}
              >
                Незнайомі слова <span className="opacity-70">{unknownHere.length}</span>
              </button>
              {toolbarExtra}
              <button
                type="button"
                onClick={() => setFullscreen((open) => !open)}
                className={`${PILL} ${PILL_OFF}`}
                title={fullscreen ? 'Esc' : 'Читати на весь екран'}
              >
                {fullscreen ? '✕ Згорнути' : '⤢ На весь екран'}
              </button>
            </div>

            {/* Підсвічений текст */}
            <div
              data-reader
              ref={readerRef}
              className={
                // Жолоб прокрутки зарезервований завжди: інакше поява смуги
                // звужує колонку, підгонка скидається і починає коливатись.
                fullscreen
                  ? 'flex-1 overflow-hidden px-[22px] py-8'
                  : 'min-h-0 flex-1 overflow-hidden px-[22px] py-5 text-[16.5px] leading-[2.05] whitespace-pre-wrap'
              }
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

                  /*
                    Два канали малюються разом, а не замість одного одного:
                    заливка каже, який це час, лінія під нею — що ви з цим
                    словом робите. Раніше час перекривав статус, і слово в
                    підсвіченій конструкції втрачало позначку саме там, де
                    воно найцікавіше — усередині правила, яке вивчають.
                    Жовте тло «вчу» при цьому поступається заливці часу:
                    два тла на одному слові не складаються.
                  */
                  const fill = tense
                    ? `${TENSE_HIGHLIGHT[tense]} rounded-mark px-[5px] py-[2px] font-bold`
                    : '';
                  const lexis =
                    layers.words && meaningful
                      ? status === 'unknown'
                        ? 'word-unknown'
                        : status === 'learning'
                          ? tense
                            ? 'border-yellow cursor-pointer border-b-[3px]'
                            : 'word-learning'
                          : 'word-known'
                      : '';

                  return (
                    <span
                      key={index}
                      title={tense ? TENSE_LABELS[tense] : token.word}
                      onClick={
                        meaningful
                          ? (event) =>
                              setOpenWord({
                                word: token.word ?? '',
                                anchor: event.currentTarget.getBoundingClientRect(),
                              })
                          : undefined
                      }
                      className={`${fill} ${lexis}`.trim()}
                    >
                      {token.raw}
                    </span>
                  );
                })}
              </div>
            </div>

            {pageEstimate > 1 ? (
              <div className="border-line bg-surface-2 flex items-center justify-between gap-3 border-t px-[22px] py-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={anchor === 0}
                  className={`${PILL} ${PILL_OFF} disabled:cursor-default disabled:opacity-40`}
                >
                  ← Назад
                </button>
                <div className="text-ink-3 text-[12.5px] font-bold">
                  Сторінка {pageNumber} з ~{pageEstimate}
                  <span className="hidden sm:inline"> · гортайте стрілками ← →</span>
                </div>
                <button
                  type="button"
                  onClick={goForward}
                  disabled={pageEnd >= tokens.length}
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
          {/* Висота — та сама, що в картки читання: інакше колонка задає висоту
              рядка сітки, і сторінка перестає вміщатись у вікно. */}
          <div
            className="sticky top-[78px] flex flex-col gap-3.5 overflow-y-auto"
            style={fullscreen ? undefined : { maxHeight: cardHeight }}
          >
            <div className={SIDE_CARD}>
              <div className={SIDE_LABEL}>Знайдено в тексті</div>
              <div className="flex flex-col gap-[9px]">
                {TENSE_ORDER.map((tense) => {
                  const stat = stats[tense];
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

              {/* Числа стосуються розібраної частини, і мовчати про це не можна:
                  на книжці розібрано кілька відсотків, і «Past Simple 12» без
                  підпису читалося б як підсумок по всьому тексту. У бібліотеці
                  `coverage` не передається — там розібрано все, і підпис зайвий. */}
              {coverage && coverage.words < coverage.totalWords ? (
                <div className="text-ink-3 mt-3 text-[12.5px]">
                  Пораховано по прочитаному: {coverage.words} з {coverage.totalWords} слів. Числа
                  ростуть, поки гортаєте.
                </div>
              ) : null}
            </div>

            <div className={SIDE_CARD}>
              <div className={`${SIDE_LABEL} mb-2.5`}>Незнайомі слова тут</div>
              <div data-unknown-list className="flex flex-col">
                {shown.map((entry) => (
                  <div
                    key={entry.word}
                    data-unknown-row
                    className="border-line flex items-center justify-between gap-2 border-b py-[5px] last:border-b-0"
                  >
                    <span className="min-w-0 truncate text-[13.5px] font-semibold">
                      {entry.word} <span className="text-ink-3 opacity-60">×{entry.count}</span>
                    </span>
                    <span className="flex flex-none gap-1.5">
                      <button
                        type="button"
                        onClick={() => mark(entry.word, 'known')}
                        className={`${ROW_BUTTON} ${IDLE_TONE} hover:border-ok hover:bg-ok-bg hover:text-ok`}
                      >
                        знаю
                      </button>
                      <button
                        type="button"
                        onClick={() => mark(entry.word, 'learning')}
                        className={`${ROW_BUTTON} ${IDLE_TONE} hover:border-pc hover:bg-pc-bg hover:text-pc-dk`}
                      >
                        вчу
                      </button>
                    </span>
                  </div>
                ))}
                {shown.length === 0 ? (
                  <span className="text-ink-3 text-[13px]">Усе розібрано: незнайомих слів немає.</span>
                ) : null}
              </div>

              {lastAction ? (
                <div className="text-ink-3 mt-2.5 flex items-center gap-2 text-[12.5px]">
                  <span className="min-w-0 truncate">Позначено «{lastAction.word}»</span>
                  <button
                    type="button"
                    onClick={() => {
                      setWordStatus(lastAction.word, lastAction.from);
                      setLastAction(null);
                    }}
                    className="text-ps-dk cursor-pointer font-bold"
                  >
                    повернути
                  </button>
                </div>
              ) : null}

              <div className="text-ink-3 mt-3 text-[12.5px]">
                «Знаю» прибирає слово зі списку, «вчу» бере його в словник. На місце
                позначеного підтягується наступне за частотою.
              </div>
            </div>
          </div>
        </div>
      </div>

      {footer}
      {openWord ? (
        <WordPopover
          word={openWord.word}
          anchor={openWord.anchor}
          onClose={() => setOpenWord(null)}
        />
      ) : null}
    </>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { HighlightLayers } from '@/components/analyzer/HighlightLayers';
import { WordPopover } from '@/components/analyzer/WordPopover';
import { useAppState } from '@/components/providers/AppStateProvider';
import { isMeaningfulWord } from '@/data/stopwords';
import { LAYER_TOPICS, busiestTopic, layerTopic, type LayerTopicId } from '@/lib/analyzer/layers';
import { estimatePageCount, paginate } from '@/lib/analyzer/pages';
import { UNKNOWN_LIMIT, pickRareOnPage } from '@/lib/analyzer/vocabulary';
import {
  TENSE_LABELS,
  applyMatches,
  tokenize,
  type Match,
  type TenseStat,
} from '@/lib/analyzer/tenses';
import { useFittedPage } from '@/lib/analyzer/useFittedPage';
import { useFitHeight } from '@/lib/analyzer/useViewport';
import { PAGE_ONE, useReading } from '@/lib/state/reading';
import { TENSE_HIGHLIGHT, TENSE_KEYS, type TenseKey } from '@/types/content';

/**
 * Полотно читалки: тулбар шарів, підсвічений текст і бічна колонка —
 * спільна частина `/analyze` і `/library/[slug]`. Розмітку й статистику
 * полотно ПРИЙМАЄ пропами, а не рахує сам: аналізатор отримує їх з
 * `useReview`, бібліотека — готовими з бази (SC-1). Це і єдина відмінність
 * між екранами: усе решта — вибір тексту, уточнення моделлю, підвал —
 * лишається виклику.
 *
 * Полотно тримає всю ширину екрана, а не сидить у контейнері виклику: смуга
 * тулбара в макеті йде від краю до краю під топбаром, і колонка читання
 * рахується від неї.
 */

const TENSE_TEXT: Record<TenseKey, string> = {
  ps: 'text-ps-tx',
  pc: 'text-pc-tx',
  pp: 'text-pp-tx',
  prs: 'text-ps-tx',
  prc: 'text-pc-tx',
  prp: 'text-pp-tx',
  fs: 'text-ps-tx',
  fc: 'text-pc-tx',
  fp: 'text-pp-tx',
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

/** Стилі пігулок — потрібні й викликачу (напр. «Джерело» в аналізаторі). */
export const PILL =
  'cursor-pointer rounded-pill border-[1.5px] px-4 py-2 text-[13px] leading-[normal] font-bold';
export const PILL_OFF = 'border-line-ctrl text-ink-2 bg-panel';

const SIDE_CARD = 'bg-panel border-line rounded-tile border px-5 py-[18px]';
const SIDE_LABEL = 'text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase';

export interface ReaderCanvasProps {
  text: string;
  /** Ключ позиції читання (`useReading`) — свій у аналізатора й у кожного оповідання. */
  docKey: string;
  /** ГОТОВА розмітка документа — полотно її не рахує. */
  matches: Match[];
  /** Числа по всьому тексту — ними підписані неактивні шари. */
  stats: Record<TenseKey, TenseStat>;
  /** Назва тексту в тулбарі. */
  title?: ReactNode;
  /** Дрібний рядок біля назви: автор, рівень. */
  meta?: ReactNode;
  /** Підпис під числами, коли пораховано не по всьому тексту (аналізатор). */
  coverage?: { words: number; totalWords: number } | null;
  /** Частотність: бібліотека передає готову з бази, аналізатор рахує з тексту. */
  frequency?: { word: string; count: number }[];
  /** Кнопки/плашки в тулбарі, які в різних екранів різні (напр. «Джерело»). */
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

export function ReaderCanvas({
  text,
  docKey,
  matches,
  stats,
  title,
  meta,
  coverage = null,
  frequency = [],
  toolbarExtra,
  footer,
  onPageEndChange,
}: ReaderCanvasProps) {
  const { state, wordStatus, cycleWordStatus } = useAppState();
  const { positions, setPosition } = useReading();

  const [openWord, setOpenWord] = useState<{ word: string; anchor: DOMRect } | null>(null);

  // Токени рахуються один раз і живлять усе, що не залежить від розбору:
  // пагінацію й межі сторінок.
  const tokens = useMemo(() => tokenize(text), [text]);

  const cardRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const proseRef = useRef<HTMLDivElement>(null);
  // Картка читання займає всю вільну висоту до низу вікна — на цю висоту
  // спирається замір сторінки, тому без неї «без скролу» не працює.
  const cardHeight = useFitHeight(cardRef);

  // Сторінки як у книзі: довгий документ інакше дає одне полотно на десятки
  // тисяч елементів. Розбиття за символами — лише припущення й оцінка
  // кількості; справжню межу знаходить замір нижче.
  const pages = useMemo(() => paginate(tokens), [tokens]);

  // Позицію тримає номер токена, а не номер сторінки: при зміні розміру вікна
  // сторінки перераховуються, і читач має залишитися там, де читав.
  const { anchor, trail } = positions[docKey] ?? PAGE_ONE;

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
    resetKey: `${cardHeight ?? 0}:${text.length}`,
  });

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

  /*
    Числа для активного шару — по цій сторінці, як і підписано в макеті.
    Рахуємо кінці конструкцій, а не всі їхні токени: «had been saved» — це
    один збіг, а не три, і саме так його рахує статистика тексту.
  */
  const pageCounts = useMemo(() => {
    const counts = Object.fromEntries(TENSE_KEYS.map((key) => [key, 0])) as Record<
      TenseKey,
      number
    >;
    for (const token of visible) {
      if (token.tense && token.endsMatch) counts[token.tense] += 1;
    }
    return counts;
  }, [visible]);

  /*
    Активний шар обирається один раз під текст — за тим, якого часу в ньому
    найбільше. Далі його веде читач: перерахунок на кожній сторінці
    перемикав би підсвітку сам собою під час гортання.
  */
  const [topic, setTopic] = useState<LayerTopicId>(() =>
    busiestTopic((tense) => stats[tense].count),
  );
  const [rules, setRules] = useState<Record<TenseKey, boolean>>(() =>
    Object.fromEntries(TENSE_KEYS.map((key) => [key, true])) as Record<TenseKey, boolean>,
  );
  const [showWords, setShowWords] = useState(true);

  const active = layerTopic(topic);

  const goForward = useCallback(() => {
    if (pageEnd >= tokens.length) return;
    setPosition(docKey, { anchor: pageEnd, trail: [...trail, anchor] });
    if (readerRef.current) readerRef.current.scrollTop = 0;
  }, [anchor, trail, docKey, pageEnd, tokens.length, setPosition]);

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

  const pageNumber = trail.length + 1;
  // Слід відвіданих початків плюс поточний — з нього знімається справжня
  // місткість сторінки, якою й калібрується розрахунок.
  const pageStarts = useMemo(() => [...trail, anchor], [trail, anchor]);
  const pageEstimate = useMemo(
    () => estimatePageCount({ tokens, pageStarts }),
    [tokens, pageStarts],
  );

  // Стрілки гортають сторінки — але не тоді, коли курсор у полі введення.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (pages.length < 2) return;
      if (event.key === 'ArrowRight') goForward();
      if (event.key === 'ArrowLeft') goBack();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack, goForward, pages.length]);

  /*
    Незнайомі слова саме цієї сторінки. Залежність від `state.words`, а не
    від `wordStatus`: остання — нова замикання на кожен рендер провайдера,
    через що сторінка перескановувалась би на кожен клік.
  */
  const unknownHere = useMemo(
    () => pickRareOnPage(visible.map((token) => token.word), frequency, state.words),
    [visible, frequency, state.words],
  );
  const shown = unknownHere.slice(0, UNKNOWN_LIMIT);

  /*
    Пунктир у тексті ставиться рівно тим словам, що в списку збоку. Інакше
    підкресленим виявлялося кожне непозначене слово — майже весь абзац, — і
    підказка переставала бути підказкою.
  */
  const suggested = useMemo(() => new Set(unknownHere.map((entry) => entry.word)), [unknownHere]);

  const maxPageCount = Math.max(...active.tenses.map((tense) => pageCounts[tense]), 1);

  /*
    Активної теми на сторінці може не бути зовсім: Alice — оповідь у минулому
    часі, і на будь-якій її сторінці «майбутніх» рівно нуль. Порожня колонка
    цифр разом із текстом без жодної підсвітки читається як «підсвітка
    зламалась», а не як «тут цього часу немає», — тому кажемо це словами й
    одразу даємо кнопку на ту тему, яка на цій сторінці справді є.
  */
  const activeOnPage = active.tenses.reduce((sum, tense) => sum + pageCounts[tense], 0);
  const suggestion = LAYER_TOPICS.filter((item) => item.id !== topic)
    .map((item) => ({
      topic: item,
      count: item.tenses.reduce((sum, tense) => sum + pageCounts[tense], 0),
    }))
    .sort((a, b) => b.count - a.count)
    .find((item) => item.count > 0);

  /**
   * Виділення слова відкриває ту саму картку, що й клік.
   *
   * Це не дублювання жесту: клік влучає в слово, коли ти вже знаєш, що
   * хочеш його подивитися, а виділення — те, що рука робить сама, коли
   * читає й спотикається. Подвійний клік теж проходить сюди, бо браузер
   * виділяє ним рівно одне слово.
   *
   * Виділення на кілька слів лишаємо в спокої: у словнику статті на окремі
   * слова, і картка на фразу могла б лише збрехати. Такий жест майже завжди
   * означає «копіюю», а не «подивись».
   */
  const onSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const word = selection
      .toString()
      .trim()
      .toLowerCase()
      // Краї від пунктуації: виділення майже ніколи не збігається зі словом
      // рівно, і «rag.» словник відкинув би.
      .replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '');
    if (!/^[a-z'-]+$/.test(word)) return;

    setOpenWord({ word, anchor: selection.getRangeAt(0).getBoundingClientRect() });
  }, []);

  return (
    <>
      <div className="border-line bg-panel sticky top-topbar z-20 border-b">
        <div className="mx-auto flex max-w-shell flex-wrap items-center gap-3.5 px-9 py-3.5">
          {title ? (
            <div className="font-serif text-[16px] font-bold">
              {title}
              {meta ? (
                <span className="font-sans text-ink-3 text-[12.5px] font-semibold"> · {meta}</span>
              ) : null}
            </div>
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <HighlightLayers
              topic={topic}
              rules={rules}
              onPickTopic={setTopic}
              onToggleRule={(tense) =>
                setRules((current) => ({ ...current, [tense]: !current[tense] }))
              }
              pageCount={(tense) => pageCounts[tense]}
              textCount={(tense) => stats[tense].count}
            />

            <button
              type="button"
              onClick={() => setShowWords((it) => !it)}
              aria-pressed={showWords}
              className={`rounded-pill cursor-pointer border-[1.5px] px-[15px] py-2 text-[13px] font-bold ${
                showWords
                  ? 'bg-yellow-bg border-yellow text-yellow-tx'
                  : 'bg-panel border-line-ctrl text-label line-through'
              }`}
            >
              Слова · {unknownHere.length}
            </button>

            {toolbarExtra ? (
              <>
                <span className="bg-line h-[26px] w-px" aria-hidden />
                {toolbarExtra}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div
        data-reader-row
        className="mx-auto grid max-w-shell gap-8 px-9 py-9 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div
          ref={cardRef}
          className="bg-panel border-line rounded-panel flex min-w-0 flex-col border px-12 py-10"
          style={{ height: cardHeight }}
        >
          <div
            data-reader
            ref={readerRef}
            className="min-h-0 flex-1 overflow-hidden"
          >
            <div
              ref={proseRef}
              onMouseUp={onSelect}
              className="font-serif text-ink max-w-[64ch] text-[19px] leading-[1.95] whitespace-pre-wrap"
            >
              {visible.map((token, index) => {
                if (!token.word) return <span key={index}>{token.raw}</span>;

                const status = wordStatus(token.word);
                // Підсвічується лише активний шар, і лише ті його правила, що
                // ввімкнені: колір означає вид, і поки в кадрі одна тема,
                // синій однозначно читається як «простий».
                const tense =
                  token.tense && rules[token.tense] && active.tenses.includes(token.tense)
                    ? token.tense
                    : null;
                const meaningful = isMeaningfulWord(token.word);

                /*
                  Два канали малюються разом: заливка каже, який це час, лінія
                  під нею — що ви з цим словом робите. Жовте тло «вчу» при
                  цьому поступається заливці часу: два тла на одному слові не
                  складаються.
                */
                const fill = tense
                  ? `${TENSE_HIGHLIGHT[tense]} rounded-mark px-[5px] py-[2px]`
                  : '';
                const lexis =
                  showWords && meaningful
                    ? status === 'learning'
                      ? tense
                        ? 'border-yellow border-b-[3px]'
                        : 'word-learning'
                      : status === 'unknown' && suggested.has(token.word)
                        ? 'word-unknown'
                        : ''
                    : '';

                return (
                  <span
                    key={index}
                    title={tense ? TENSE_LABELS[tense] : token.word}
                    onClick={(event) =>
                      setOpenWord({
                        word: token.word ?? '',
                        anchor: event.currentTarget.getBoundingClientRect(),
                      })
                    }
                    className={`cursor-pointer ${fill} ${lexis}`.trim()}
                  >
                    {token.raw}
                  </span>
                );
              })}
            </div>
          </div>

          {pageEstimate > 1 ? (
            <div className="border-track mt-[18px] flex max-w-[64ch] items-center justify-between border-t pt-[18px]">
              <button
                type="button"
                onClick={goBack}
                disabled={anchor === 0}
                aria-label="Попередня сторінка"
                className="border-line-ctrl text-ink-2 rounded-btn flex h-11 w-11 cursor-pointer items-center justify-center border-[1.5px] text-[16px] disabled:cursor-default disabled:opacity-40"
              >
                ‹
              </button>
              <span className="text-ink-3 text-[13px]">
                Сторінка {pageNumber} з ~{pageEstimate}
              </span>
              <button
                type="button"
                onClick={goForward}
                disabled={pageEnd >= tokens.length}
                aria-label="Наступна сторінка"
                className="bg-acc rounded-btn flex h-11 w-11 cursor-pointer items-center justify-center text-[16px] text-white disabled:cursor-default disabled:opacity-40"
              >
                ›
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className={SIDE_CARD}>
            <div className={SIDE_LABEL}>Шар «{active.label}» · ця сторінка</div>
            <div className="mt-3 flex flex-col gap-2.5">
              {active.tenses.map((tense) => (
                <div key={tense}>
                  <div className="flex justify-between text-[13px] font-bold">
                    <span className={rules[tense] ? TENSE_TEXT[tense] : 'text-label line-through'}>
                      {TENSE_LABELS[tense]}
                    </span>
                    <span>{pageCounts[tense]}</span>
                  </div>
                  <div className="bg-track rounded-pill mt-[5px] h-[7px] overflow-hidden">
                    <div
                      className={`h-full rounded-pill ${rules[tense] ? TENSE_BAR[tense] : 'bg-lex-line'}`}
                      style={{ width: `${Math.round((pageCounts[tense] / maxPageCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {activeOnPage === 0 ? (
              <div className="border-line text-ink-2 mt-3.5 border-t border-dashed pt-3 text-[12.5px] leading-[1.55]">
                На цій сторінці таких часів немає.{' '}
                {suggestion ? (
                  <button
                    type="button"
                    onClick={() => setTopic(suggestion.topic.id)}
                    className="text-acc cursor-pointer font-bold underline"
                  >
                    Показати «{suggestion.topic.label}» ({suggestion.count})
                  </button>
                ) : (
                  'Тут узагалі немає розібраних конструкцій.'
                )}
              </div>
            ) : null}

            {/* Числа стосуються розібраної частини, і мовчати про це не можна:
                на книжці розібрано кілька відсотків, і «Past Simple 12» без
                підпису читалося б як підсумок по всьому тексту. У бібліотеці
                `coverage` не передається — там розібрано все, і підпис зайвий. */}
            {coverage && coverage.words < coverage.totalWords ? (
              <div className="border-line text-ink-2 mt-3.5 border-t border-dashed pt-3 text-[12.5px] leading-[1.55]">
                <b className="text-green-tx">
                  Розібрано моделлю:{' '}
                  {Math.round((coverage.words / Math.max(1, coverage.totalWords)) * 100)}%
                </b>{' '}
                — далі діють локальні правила. Числа рахуємо лише по перевіреному.
              </div>
            ) : null}
          </div>

          <div className={SIDE_CARD}>
            <div className={SIDE_LABEL}>Незнайомі слова тут · {unknownHere.length}</div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {shown.map((entry) => {
                const status = wordStatus(entry.word);
                return (
                  <button
                    key={entry.word}
                    type="button"
                    onClick={() => cycleWordStatus(entry.word)}
                    className={`rounded-pill cursor-pointer border px-3.5 py-2 text-[13px] ${
                      status === 'learning'
                        ? 'bg-yellow-bg border-yellow text-yellow-tx font-bold'
                        : 'border-line-ctrl border-b-2 border-b-lex-line font-semibold [border-bottom-style:dotted]'
                    }`}
                  >
                    {entry.word}
                  </button>
                );
              })}
              {shown.length === 0 ? (
                <span className="text-ink-3 text-[13px]">
                  Усе розібрано: незнайомих слів немає.
                </span>
              ) : null}
            </div>
            <div className="text-ink-3 mt-3 text-[12.5px]">
              Клік — статус по колу: не знаю → вчу → знаю
            </div>
          </div>

          {footer}
        </div>
      </div>

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

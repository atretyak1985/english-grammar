'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { HighlightLayers } from '@/components/analyzer/HighlightLayers';
import { WordPopover, type WordGrammar } from '@/components/analyzer/WordPopover';
import { useAppState } from '@/components/providers/AppStateProvider';
import { STATUS_LABELS } from '@/components/words/statuses';
import { isMeaningfulWord } from '@/data/stopwords';
import { LAYER_TOPICS, busiestTopic, layerTopic, type LayerTopicId } from '@/lib/analyzer/layers';
import { estimatePageCount, paginate } from '@/lib/analyzer/pages';
import { pickRareOnPage } from '@/lib/analyzer/vocabulary';
import {
  TENSE_FORMULAS,
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
import type { WordStatus } from '@/types/state';

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

/** Стилі пігулок — потрібні й викликачу (напр. «Джерело» в аналізаторі). */
export const PILL =
  'cursor-pointer rounded-pill border-[1.5px] px-4 py-2 text-[13px] leading-[normal] font-bold';
export const PILL_OFF = 'border-line-ctrl text-ink-2 bg-panel';

/** Три статуси, які читач може підсвітити в тексті; «приховане» шару не має. */
type WordLayer = 'unknown' | 'learning' | 'known';
const WORD_LAYERS: WordLayer[] = ['unknown', 'learning', 'known'];

const WORD_LAYER_TITLE: Record<WordLayer, string> = {
  unknown: 'Слова без статусу',
  learning: 'Слова, які вчите',
  known: 'Слова, які знаєте',
};

/** Увімкнена пігулка одягнена так само, як слово в тексті під цим шаром. */
const WORD_LAYER_ON: Record<WordLayer, string> = {
  unknown: 'bg-track border-lex-line text-ink',
  learning: 'bg-yellow-bg border-yellow text-yellow-tx',
  known: 'bg-green-bg-2 border-green-line text-green-tx',
};

/**
 * Клас лексичного каналу для слова. Два канали малюються разом: заливка
 * часу каже, який це час, лінія під нею — що ви з цим словом робите. Тому на
 * слові всередині підсвіченої конструкції статус лишає тільки лінію: два тла
 * на одному слові не складаються.
 *
 * Слово без статусу при вимкненому шарі «не знаю» несе лише пунктир-підказку,
 * і лише коли воно з рідкісних на сторінці — інакше підказкою був би весь абзац.
 */
function lexisClass(
  status: WordStatus,
  inTense: boolean,
  layers: Record<WordLayer, boolean>,
  hinted: boolean,
): string {
  switch (status) {
    case 'learning':
      if (!layers.learning) return '';
      return inTense ? 'border-yellow border-b-[3px]' : 'word-learning';
    case 'known':
      if (!layers.known) return '';
      return inTense ? 'border-green-line border-b-2' : 'word-known';
    case 'unknown':
      if (layers.unknown) return inTense ? 'border-lex-line border-b-2 border-dotted' : 'word-unknown';
      return hinted ? 'word-hint' : '';
    default:
      return '';
  }
}

const SIDE_CARD = 'bg-panel border-line rounded-tile-lg border px-[18px] py-4';
const SIDE_LABEL = 'text-ink-3 font-mono text-[11px] font-bold tracking-[1.4px] uppercase';
/** Дві рівні кнопки під карткою правила — «Теорія» і «Тренувати». */
const SIDE_BTN =
  'border-line-ctrl text-ink hover:border-acc hover:text-acc2 rounded-btn flex-1 border-[1.5px] p-2.5 text-center text-[13px] font-bold';

/**
 * Скільки рідкісних слів показати списком.
 *
 * `UNKNOWN_LIMIT` (20) розрахований на чипи, що переносяться рядками, —
 * там довжина списку нічого не коштувала. Вертикальним списком двадцять
 * слів виштовхують картку правила за екран, і читач її не бачить
 * узагалі. Вісім — рівно стільки, скільки вміщується поруч із першою
 * сторінкою тексту; решта нікуди не дівається, про неї каже лічильник.
 */
const SIDE_WORDS = 8;

/**
 * Шар підсвітки → тема правил. Читалка знає час конструкції, а «Теорія»
 * мусить вести в тему, а не в час: трьох маршрутів рівно стільки, скільки
 * шарів, тому мапа явна й повна.
 */
const LAYER_TOPIC_SLUG: Record<LayerTopicId, string> = {
  past: 'past-tenses',
  present: 'present-tenses',
  future: 'future-tenses',
};

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

  const [openWord, setOpenWord] = useState<{
    word: string;
    anchor: DOMRect;
    /** Конструкція під клікнутим словом — для рядка «чому це такий час». */
    grammar?: WordGrammar | null;
  } | null>(null);

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
    перемикав би підсвітку сам собою під час гортання. `null` — читач зняв
    галочку з теми і читає без граматичної підсвітки взагалі.
  */
  const [topic, setTopic] = useState<LayerTopicId | null>(() =>
    busiestTopic((tense) => stats[tense].count),
  );
  const [rules, setRules] = useState<Record<TenseKey, boolean>>(() =>
    Object.fromEntries(TENSE_KEYS.map((key) => [key, true])) as Record<TenseKey, boolean>,
  );
  /*
    Шар лексики — три перемикачі за статусом слова, а не один «Слова».
    «Вчу» увімкнено одразу: це те, заради чого слово позначали. «Не знаю»
    й «знаю» вимкнені, бо заливка КОЖНОГО непозначеного слова — це майже
    весь абзац; її вмикають навмисно, щоб побачити обсяг незнайомого або
    скільки вже вивчено.
  */
  const [wordLayers, setWordLayers] = useState<Record<WordLayer, boolean>>({
    unknown: false,
    learning: true,
    known: false,
  });

  const active = topic === null ? null : layerTopic(topic);

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
  const shown = unknownHere.slice(0, SIDE_WORDS);

  /*
    Пунктир у тексті ставиться рівно тим словам, що в списку збоку. Інакше
    підкресленим виявлялося кожне непозначене слово — майже весь абзац, — і
    підказка переставала бути підказкою.
  */
  const suggested = useMemo(() => new Set(unknownHere.map((entry) => entry.word)), [unknownHere]);

  /** Різних змістовних слів кожного статусу на цій сторінці — числа на перемикачах шару. */
  const wordCounts = useMemo(() => {
    const seen = new Set<string>();
    const counts: Record<WordLayer, number> = { unknown: 0, learning: 0, known: 0 };
    for (const token of visible) {
      if (!token.word || seen.has(token.word) || !isMeaningfulWord(token.word)) continue;
      seen.add(token.word);
      const status = state.words[token.word] ?? 'unknown';
      if (status === 'hidden') continue;
      counts[status] += 1;
    }
    return counts;
  }, [visible, state.words]);


  /*
    Активної теми на сторінці може не бути зовсім: Alice — оповідь у минулому
    часі, і на будь-якій її сторінці «майбутніх» рівно нуль. Порожня колонка
    цифр разом із текстом без жодної підсвітки читається як «підсвітка
    зламалась», а не як «тут цього часу немає», — тому кажемо це словами й
    одразу даємо кнопку на ту тему, яка на цій сторінці справді є.
  */
  const suggestion = LAYER_TOPICS.filter((item) => item.id !== topic)
    .map((item) => ({
      topic: item,
      count: item.tenses.reduce((sum, tense) => sum + pageCounts[tense], 0),
    }))
    .sort((a, b) => b.count - a.count)
    .find((item) => item.count > 0);

  /**
   * Головна конструкція цієї сторінки — та з активної теми, якої тут
   * найбільше, з живими прикладами просто з тексту під очима.
   *
   * Приклади беруться з видимих токенів, а не з `stats.examples`: ті
   * рахуються по всьому оповіданню, і картка з назвою «на цій сторінці»
   * показувала б форми, яких на сторінці може не бути взагалі.
   */
  const pageRule = (() => {
    const tense = (active?.tenses ?? [])
      .filter((key) => pageCounts[key] > 0)
      .sort((a, b) => pageCounts[b] - pageCounts[a])[0];
    if (!tense) return null;

    const examples: string[] = [];
    let phrase: string[] = [];
    for (const token of visible) {
      if (token.tense !== tense) continue;
      if (token.startsMatch) phrase = [];
      phrase.push(token.raw.trim());
      if (token.endsMatch) {
        // Пунктуацію з країв зрізаємо: токен несе її як є, і в переліку
        // прикладів «implied.» читалося б як частина форми.
        const text = phrase.join(' ').replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '');
        if (text && !examples.includes(text) && examples.length < 4) examples.push(text);
        phrase = [];
      }
    }

    return { tense, count: pageCounts[tense], examples };
  })();

  /* «Теорія» веде в тему активного шару, а не в конкретний розділ: який
     саме розділ пояснює цю конструкцію, читалка не знає, а вхід у тему
     веде туди за один клік і не бреше. */
  const theoryHref = topic === null ? '/topics' : `/topics/${LAYER_TOPIC_SLUG[topic]}`;

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
        <div className="mx-auto flex max-w-shell flex-wrap items-center gap-3.5 px-10 py-2.5">
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

            <div className="flex items-center gap-1.5" role="group" aria-label="Підсвітка слів">
              {WORD_LAYERS.map((layer) => (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setWordLayers((current) => ({ ...current, [layer]: !current[layer] }))}
                  aria-pressed={wordLayers[layer]}
                  title={`${WORD_LAYER_TITLE[layer]} — на цій сторінці ${wordCounts[layer]}`}
                  className={`rounded-pill cursor-pointer border-[1.5px] px-[13px] py-2 text-[13px] font-bold ${
                    wordLayers[layer] ? WORD_LAYER_ON[layer] : 'bg-panel border-line-ctrl text-label line-through'
                  }`}
                >
                  {STATUS_LABELS[layer]} · {wordCounts[layer]}
                </button>
              ))}
            </div>

            {toolbarExtra ? (
              <>
                <span className="bg-line h-[26px] w-px" aria-hidden />
                {toolbarExtra}
              </>
            ) : null}

            {/* Номер сторінки живе в панелі, а не лише під текстом. Під
                текстом він відповідає на «скільки ще», але побачити його
                там можна тільки долиставши; у панелі він каже «де я» на
                будь-якій висоті прокрутки. */}
            {pageEstimate > 1 ? (
              <span className="text-ink-3 ml-1.5 text-[13px] whitespace-nowrap">
                стор. {pageNumber} з {pageEstimate}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* 1200, а не спільні 1400: колонка тексту тут не «контент сторінки»,
          а сама сторінка книжки, і її ширину задає довжина рядка. Стеля
          720px на самій колонці — те саме число, що в макеті, і рівно
          стільки, скільки серифний рядок у 19px читається без втоми. */}
      <div
        data-reader-row
        className="mx-auto grid max-w-[1200px] justify-between gap-12 px-10 pt-8 pb-14 lg:grid-cols-[minmax(0,720px)_300px]"
      >
        <div
          ref={cardRef}
          className="bg-panel border-line rounded-panel-xl flex min-w-0 flex-col border px-[52px] py-11"
          style={{ height: cardHeight }}
        >
          <div
            data-reader
            ref={readerRef}
            className="min-h-0 flex-1 overflow-hidden"
          >
            <div
              ref={proseRef}
              data-page-end={pageEnd}
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
                  token.tense && active !== null && rules[token.tense] && active.tenses.includes(token.tense)
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
                const lexis = meaningful
                  ? lexisClass(status, tense !== null, wordLayers, suggested.has(token.word))
                  : '';

                return (
                  <span
                    key={index}
                    title={tense ? TENSE_LABELS[tense] : token.word}
                    onClick={(event) =>
                      setOpenWord({
                        word: token.word ?? '',
                        anchor: event.currentTarget.getBoundingClientRect(),
                        // Конструкція береться з токена, а не з видимого шару:
                        // пояснення «чому це Past Perfect» доречне й тоді,
                        // коли підсвітку цього часу зараз вимкнено.
                        grammar: token.tense
                          ? {
                              tense: token.tense,
                              ...(token.rule !== undefined ? { rule: token.rule } : {}),
                              ...(token.uncertain === true ? { uncertain: true } : {}),
                            }
                          : null,
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
            <div className="border-track mt-[18px] flex items-center justify-between border-t pt-[18px]">
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

        <aside className="sticky top-[132px] flex min-w-0 flex-col gap-3.5 self-start">
          {/* Слова цієї сторінки: те, що читач збирає, поки читає.
              ------------------------------------------------------------
              Перекладу поруч зі словом немає, хоч макет його й малює.
              Джерело словника не дає українських значень — Вікісловник
              пояснює слово мовою оригіналу, — і підставити сюди переклад
              означало б його вигадати. Статус ми знаємо точно, тому
              показуємо саме його; переклад зʼявиться тут без переробки,
              щойно зʼявиться в даних. */}
          <div className={SIDE_CARD}>
            <div className="flex items-baseline justify-between">
              <span className={SIDE_LABEL}>Слова на цій сторінці</span>
              <span className="text-label text-[11.5px]">
                рідкісні ·{' '}
                {unknownHere.length > shown.length
                  ? `${shown.length} з ${unknownHere.length}`
                  : unknownHere.length}
              </span>
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {shown.map((entry) => {
                const status = wordStatus(entry.word);
                return (
                  <button
                    key={entry.word}
                    type="button"
                    onClick={() => cycleWordStatus(entry.word)}
                    className="border-track flex cursor-pointer items-center gap-2.5 border-b py-1.5 text-left last:border-b-0"
                  >
                    <span
                      className={`font-serif flex-1 self-start text-[15px] font-bold ${
                        status === 'learning'
                          ? 'border-yellow border-b-[3px]'
                          : status === 'known'
                            ? ''
                            : 'border-lex-line border-b-2 [border-bottom-style:dotted]'
                      }`}
                    >
                      {entry.word}
                    </span>
                    <span
                      className={`rounded-badge px-[7px] py-0.5 font-mono text-[10.5px] font-bold ${
                        status === 'learning'
                          ? 'bg-yellow-bg text-yellow-tx'
                          : status === 'known'
                            ? 'bg-green-bg-2 text-green-tx'
                            : 'bg-track text-ink-2'
                      }`}
                    >
                      {STATUS_LABELS[status].toUpperCase()}
                    </span>
                  </button>
                );
              })}
              {shown.length === 0 ? (
                <span className="text-ink-3 text-[13px]">Усе розібрано: рідкісних слів немає.</span>
              ) : null}
            </div>
            <div className="text-ink-3 mt-2.5 text-[12.5px]">
              Клік по слову в тексті — картка з вимовою і статусом.
            </div>
          </div>

          {/* Правило цієї сторінки. Коли активної теми на сторінці немає
              зовсім, картка не мовчить, а каже це словами й одразу веде в
              ту тему, яка тут справді є: порожня колонка цифр читається як
              «підсвітка зламалась», а не як «тут цього немає». */}
          {pageRule ? (
            <div className={SIDE_CARD}>
              <div className="text-pp-tx font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
                Правило на цій сторінці
              </div>
              <div className="font-serif mt-2 text-[17px] font-extrabold">
                {TENSE_LABELS[pageRule.tense]} · {TENSE_FORMULAS[pageRule.tense]}
              </div>
              <div className="text-ink-2 mt-1 text-[13.5px] leading-[1.5]">
                {pageRule.count} конструкцій на сторінці
                {pageRule.examples.length > 0 ? `: ${pageRule.examples.join(', ')}…` : '.'}
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={theoryHref} className={SIDE_BTN}>
                  Теорія
                </Link>
                <Link href="/train" className={SIDE_BTN}>
                  Тренувати
                </Link>
              </div>
              {/* Скільки тексту справді пройшло через модель. Аналізатор
                  розбирає по сторінці, тому число тут не косметика: воно
                  каже, наскільки числу вище можна вірити. Бібліотека
                  розібрана повністю й coverage не передає взагалі. */}
              {coverage ? (
                <div className="border-line text-ink-2 mt-3 border-t border-dashed pt-2.5 text-[12.5px] leading-[1.55]">
                  <b className="text-green-tx">
                    Розібрано моделлю:{' '}
                    {Math.round((coverage.words / Math.max(1, coverage.totalWords)) * 100)}%
                  </b>{' '}
                  — далі діють локальні правила.
                </div>
              ) : null}
            </div>
          ) : (
            <div className={SIDE_CARD}>
              <div className={SIDE_LABEL}>Підсвітка</div>
              <div className="text-ink-2 mt-2.5 text-[12.5px] leading-[1.55]">
                {active === null
                  ? 'Шар часів вимкнено — текст без граматичної підсвітки.'
                  : `На цій сторінці конструкцій теми «${active.label}» немає.`}{' '}
                {suggestion ? (
                  <button
                    type="button"
                    onClick={() => setTopic(suggestion.topic.id)}
                    className="text-acc hover:text-acc2 cursor-pointer font-bold"
                  >
                    Показати «{suggestion.topic.label}» · {suggestion.count} →
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* Репліка Alex — підказка про жест, а не прикраса: наведення на
              заливку показує назву часу, і без цього рядка про це не
              дізнається ніхто, крім тих, хто навів випадково. */}
          <div className="flex items-start gap-2.5">
            <Image
              src="/alex-avatar.png"
              alt="Alex"
              width={200}
              height={200}
              className="h-10 w-10 flex-none rounded-full object-cover"
            />
            <div className="bg-panel border-line text-ink-2 rounded-[3px_14px_14px_14px] border px-3.5 py-2.5 text-[13.5px] leading-[1.5]">
              Наведіть на будь-яку заливку — побачите назву часу і формулу. Клік веде в теорію.
            </div>
          </div>

          {footer}
        </aside>
      </div>

      {openWord ? (
        <WordPopover
          word={openWord.word}
          anchor={openWord.anchor}
          grammar={openWord.grammar}
          onClose={() => setOpenWord(null)}
        />
      ) : null}
    </>
  );
}

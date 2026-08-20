'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { SourceDialog } from '@/components/analyzer/SourceDialog';
import { useAppState } from '@/components/providers/AppStateProvider';
import { IDLE_TONE, ROW_BUTTON } from '@/components/words/WordStatusButtons';
import { isMeaningfulWord } from '@/data/stopwords';
import { paginate } from '@/lib/analyzer/pages';
import {
  TENSE_LABELS,
  applyMatches,
  findMatches,
  mergeMatches,
  statsOf,
  tokenize,
} from '@/lib/analyzer/tenses';
import { useFittedPage } from '@/lib/analyzer/useFittedPage';
import { useReview } from '@/lib/analyzer/useReview';
import { useBoxSize, useFitHeight } from '@/lib/analyzer/useViewport';
import { PAGE_ONE, docKeyOf, useReading } from '@/lib/state/reading';
import { useTexts } from '@/lib/state/texts';
import type { TenseKey } from '@/types/content';
import type { WordStatus } from '@/types/state';

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

/* ------------------------------------------------------------------
   Колір бере ВИД, стиль лінії бере ЧАС: минулі — суцільна, теперішні —
   штрихована, майбутні — подвійна. Пунктира в цьому наборі немає навмисно:
   ним тут уже підкреслені незнайомі слова, і два схожі знаки з різним змістом
   читалися б як один.

   Тому Present Perfect і Past Simple — це фіолетовий проти синього, а не два
   відтінки одного, і головна пастка теми «Теперішні часи» видна в тексті без
   наведення курсора.

   Мапи розписані всіма шістьма ключами, а не зібрані з двох осей у рантаймі:
   Tailwind знаходить класи статичним пошуком по коду, і склеєне ім'я
   (`text-${aspect}`) до збірки просто не потрапило б.
   ------------------------------------------------------------------ */

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

/** Увімкнений перемикач. Пунктирна рамка в теперішніх — та сама ознака часу. */
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

const TENSE_HIGHLIGHT: Record<TenseKey, string> = {
  ps: 'text-ps bg-ps-bg border-b-2 border-ps',
  pc: 'text-pc bg-pc-bg border-b-2 border-pc',
  pp: 'text-pp bg-pp-bg border-b-2 border-pp',
  prs: 'text-ps bg-ps-bg border-b-2 border-dashed border-ps',
  prc: 'text-pc bg-pc-bg border-b-2 border-dashed border-pc',
  prp: 'text-pp bg-pp-bg border-b-2 border-dashed border-pp',
  // Майбутні йдуть підкресленням, а не рамкою: `border-style: double` на
  // рядковому елементі не роздільна — на трьох пікселях браузер малює її
  // суцільною, і майбутнє ставало б неможливо відрізнити від минулого.
  // Заміряно на скріншоті, а не припущено.
  fs: 'text-ps bg-ps-bg underline decoration-double decoration-1 underline-offset-[3px]',
  fc: 'text-pc bg-pc-bg underline decoration-double decoration-1 underline-offset-[3px]',
  fp: 'text-pp bg-pp-bg underline decoration-double decoration-1 underline-offset-[3px]',
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

const PILL = 'cursor-pointer rounded-full border px-[11px] py-[5px] text-[12px] leading-[normal] font-bold';
const PILL_OFF = 'border-line text-ink-3 bg-transparent';
const CARD = 'bg-surface border-line rounded-card shadow-card overflow-hidden border';
const CARD_HEAD = 'border-line bg-surface-2 flex items-center gap-2 border-b px-4 py-[11px]';
const CARD_TITLE = 'text-ink-2 text-[12.5px] font-extrabold tracking-[0.4px]';
const SIDE_CARD = 'bg-surface border-line rounded-panel shadow-card border p-4';
const SIDE_LABEL = 'text-ink-3 mb-3 text-[10.5px] font-extrabold tracking-[1.1px] uppercase';

/** Скільки незнайомих слів показуємо: наступне підтягується після кожної дії. */
const UNKNOWN_LIMIT = 20;

/**
 * Аналізатор тексту: правило видно не в підручнику, а у справжньому тексті
 * (CONCEPT 4). Перемикачі керують шарами підсвітки — по одному на кожну з
 * девʼяти конструкцій плюс незнайомі слова.
 */
export function AnalyzerScreen() {
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

  // Джерело живе в модалці: рядок над текстом забирав місце постійно, а
  // потрібен на кілька секунд.
  const [dialogOpen, setDialogOpen] = useState(false);

  const { state, wordStatus, setWordStatus, cycleWordStatus } = useAppState();
  const { texts, addText } = useTexts();
  const { doc, positions, openSaved, openLoose, setPosition } = useReading();

  /**
   * Що читаємо — вирішує сховище читання, а не стан компонента: інакше
   * завантажена книжка гинула на першому ж переході на іншу сторінку.
   * У збереженого тексту тіло беремо з бібліотеки, щоб не тримати дві копії.
   */
  const fromLibrary = doc.id ? texts.find((item) => item.id === doc.id) : undefined;
  const text = fromLibrary?.body ?? doc.body ?? DEMO_TEXT;
  const title = fromLibrary?.title ?? doc.title;
  const saved = Boolean(fromLibrary);
  const docKey = docKeyOf(doc);

  // Токени рахуються один раз і живлять усе, що не залежить від розбору:
  // пагінацію, частоту слів і межі шматків. Підсвітка працює з окремою копією,
  // бо накладання збігів токени мутує.
  const tokens = useMemo(() => tokenize(text), [text]);
  const local = useMemo(() => findMatches(tokens), [tokens]);

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
  // по всьому тексту (CONCEPT 4.2).
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

  // Модель розбирає те, що читають: сторінку й один шматок уперед. Ціла книжка
  // одним запитом не йде — платити наперед за триста сторінок, з яких прочитають
  // двадцять, немає сенсу (CONCEPT 4.1).
  const review = useReview(text, tokens, anchor, pageEnd);

  // Підсвічений документ: там, де модель уже відповіла, — її збіги; далі —
  // локальні правила, щоб текст поза розібраним не лишався зовсім без розмітки.
  const analysis = useMemo(
    () => applyMatches(tokenize(text), mergeMatches(local, review.matches, review.ranges)),
    [text, local, review.matches, review.ranges],
  );

  // Числа рахуються ТІЛЬКИ по розібраному: підсвітка поза ним шаблонна, і
  // змішувати її в статистику означало б видати шаблонну точність за перевірену.
  const stats = useMemo(() => statsOf(tokens, review.matches), [tokens, review.matches]);

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
   * Номер сторінки — скільки вже перегорнули; оцінка кількості — з фактичного
   * розміру сторінки. Межі рухомі, тому в підписі стоїть «~».
   */
  const pageNumber = trail.length + 1;
  const pageSize = Math.max(1, pageEnd - anchor);
  const pageEstimate = Math.max(pageNumber, Math.ceil(tokens.length / pageSize));

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

  // Частота — від тексту, і тільки від тексту: рахується по ВСЬОМУ документу,
  // а не по поточній сторінці, і клік по слову її не перераховує.
  const frequency = useMemo(() => {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      if (!token.word || !isMeaningfulWord(token.word)) continue;
      counts.set(token.word, (counts.get(token.word) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  }, [tokens]);

  // Відбір — дешевий прохід уже згорнутим списком. Залежність саме від
  // `state.words`, а не від `wordStatus`: остання — нова замикання на кожен
  // рендер провайдера, через що весь документ перескановувався б на кожен клік.
  const unknownHere = useMemo(
    () => frequency.filter((entry) => (state.words[entry.word] ?? 'unknown') === 'unknown'),
    [frequency, state.words],
  );

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

  // Текст із модалки — байдуже, вставлений руками чи розпізнаний з файлу.
  // Позицію скидати не треба: у нового тексту свій ключ, тобто своя перша сторінка.
  const applyText = (next: string, name?: string) => {
    openLoose(next, name ?? null);
  };

  return (
    <div className="mx-auto max-w-content px-[30px] pt-[30px] pb-6">
      <h1 className="mt-0 mb-2 text-[32px] font-extrabold tracking-[-0.8px]">Аналіз тексту</h1>

      <div data-reader-row className="grid grid-cols-[minmax(0,1fr)_320px] gap-[22px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Десять перемикачів шарів: девʼять конструкцій і незнайомі слова */}
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
                className={`${PILL} ${
                  layers.words ? 'border-ok bg-ok-bg text-ok' : PILL_OFF
                }`}
              >
                Незнайомі слова <span className="opacity-70">{unknownHere.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className={`${PILL} ${PILL_OFF} ml-auto`}
              >
                ⤓ Джерело · {analysis.wordCount} слів
              </button>
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

            {tokens.length > pageSize ? (
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
                  підпису читалося б як підсумок по всьому тексту. */}
              {review.words < review.totalWords ? (
                <div className="text-ink-3 mt-3 text-[12.5px]">
                  Пораховано по прочитаному: {review.words} з {review.totalWords} слів. Числа
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

      {dialogOpen ? (
        <SourceDialog
          text={text}
          saved={saved}
          onApply={applyText}
          onClose={() => setDialogOpen(false)}
          onSave={() => {
            const label = title ?? text.slice(0, 40);
            const id = addText(label, text);
            // Місце читання переносимо на новий ключ: збереження посеред книжки
            // не мусить відкидати на першу сторінку.
            setPosition(id, { anchor, trail });
            openSaved(id, label);
          }}
        />
      ) : null}
    </div>
  );
}

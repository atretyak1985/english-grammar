'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { PILL, PILL_OFF, ReaderCanvas } from '@/components/analyzer/ReaderCanvas';
import { SourceDialog } from '@/components/analyzer/SourceDialog';
import { isMeaningfulWord } from '@/data/stopwords';
import { findMatches, mergeMatches, statsOf, tokenize } from '@/lib/analyzer/tenses';
import { useReview } from '@/lib/analyzer/useReview';
import { PAGE_ONE, docKeyOf, useReading } from '@/lib/state/reading';
import { useTexts } from '@/lib/state/texts';

/**
 * Аналізатор тексту: правило видно не в підручнику, а у справжньому тексті
 * (CONCEPT 4). Полотно (перемикачі, підсвітка, пагінація) винесене в
 * `ReaderCanvas` — тут лишається вибір тексту, уточнення моделлю (`useReview`)
 * і модалка джерела; той самий поділ, що й у `StoryReader`.
 */
export function AnalyzerScreen() {
  // Джерело живе в модалці: рядок над текстом забирав місце постійно, а
  // потрібен на кілька секунд.
  const [dialogOpen, setDialogOpen] = useState(false);

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
  // локальні правила й підрахунок слів для кнопки джерела.
  const tokens = useMemo(() => tokenize(text), [text]);
  const local = useMemo(() => findMatches(tokens), [tokens]);
  const wordCount = useMemo(() => tokens.filter((token) => token.word !== null).length, [tokens]);

  // Позиція читання — той самий сховок, що читає й пише `ReaderCanvas`
  // (`useReading` — єдиний зовнішній стан, а не локальний до компонента), тому
  // тут вона потрібна лише для перенесення місця читання під час збереження
  // (`onSave` нижче), а не для рендера полотна.
  const { anchor, trail } = positions[docKey] ?? PAGE_ONE;

  // Межу видимої сторінки визначає замір усередині полотна — сюди вона
  // приходить колбеком, бо саме нею `useReview` вирішує, який шматок
  // довантажувати моделлю (CONCEPT 4.1).
  const [pageEnd, setPageEnd] = useState(() => Math.min(tokens.length, anchor + 1));

  // Модель розбирає те, що читають: сторінку й один шматок уперед. Ціла книжка
  // одним запитом не йде — платити наперед за триста сторінок, з яких прочитають
  // двадцять, немає сенсу (CONCEPT 4.1).
  const review = useReview(text, tokens, anchor, pageEnd);

  // Розмітка для полотна: там, де модель уже відповіла, — її збіги; далі —
  // локальні правила, щоб текст поза розібраним не лишався зовсім без розмітки.
  const matches = useMemo(
    () => mergeMatches(local, review.matches, review.ranges),
    [local, review.matches, review.ranges],
  );

  // Числа рахуються ТІЛЬКИ по розібраному: підсвітка поза ним шаблонна, і
  // змішувати її в статистику означало б видати шаблонну точність за перевірену.
  const stats = useMemo(() => statsOf(tokens, review.matches), [tokens, review.matches]);

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

  // Текст із модалки — байдуже, вставлений руками чи розпізнаний з файлу.
  // Позицію скидати не треба: у нового тексту свій ключ, тобто своя перша сторінка.
  const applyText = (next: string, name?: string) => {
    openLoose(next, name ?? null);
  };

  /*
    Заголовка окремим блоком тут більше немає: назву тексту несе тулбар
    полотна, і другий заголовок над ним лише відсував колонку читання вниз.
    Полотно саме тримає ширину екрана, тому контейнер лишився тільки в
    плашки над ним.
  */
  return (
    <>
      {/*
       * Деградація шару уточнення, не помилка (CONCEPT 8.1): локальна
       * підсвітка нижче лишається робочою і плашка її не ховає — вона лише
       * пояснює, чому далі не стане точнішою.
       */}
      {review.block ? (
        <div
          className={`bg-panel border-line rounded-note mx-auto mt-6 max-w-shell border px-5 py-4 text-[13.5px] max-[1352px]:mx-9 ${
            review.block.reason === 'auth-required' ? 'border-l-4 border-l-ps' : 'border-l-4 border-l-pc'
          }`}
        >
          {review.block.reason === 'auth-required' ? (
            <>
              <b>Уточнення моделлю доступне після входу.</b> Локальна підсвітка нижче лишається як
              є. <Link href="/login" className="underline">
                Увійти
              </Link>{' '}
              або <Link href="/library" className="underline">
                відкрити бібліотеку
              </Link>{' '}
              — там розбір уже готовий.
            </>
          ) : (
            <>
              <b>
                Слова цього місяця закінчились: {review.block.monthlyWords - review.block.remainingWords} з{' '}
                {review.block.monthlyWords}.
              </b>{' '}
              Локальна підсвітка нижче лишається як є.{' '}
              <Link href="/pricing" className="underline">
                Переглянути тарифи
              </Link>
              .
            </>
          )}
        </div>
      ) : null}

      <ReaderCanvas
        text={text}
        docKey={docKey}
        matches={matches}
        stats={stats}
        title="Аналіз тексту"
        meta={`${wordCount} слів`}
        coverage={{ words: review.words, totalWords: review.totalWords }}
        frequency={frequency}
        onPageEndChange={setPageEnd}
        toolbarExtra={
          <>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className={`${PILL} ${PILL_OFF}`}
            >
              ⤓ Джерело
            </button>
            <Link href="/library" className={`${PILL} ${PILL_OFF}`}>
              Бібліотека →
            </Link>
          </>
        }
      />

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
    </>
  );
}

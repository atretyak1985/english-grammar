'use client';

import { useMemo, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { FileSource } from '@/components/analyzer/FileSource';
import { useAppState } from '@/components/providers/AppStateProvider';
import { isMeaningfulWord } from '@/data/stopwords';
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

const TENSE_TOGGLE: Record<TenseKey, string> = {
  ps: 'border-ps-line bg-ps-bg text-ps-dk',
  pc: 'border-pc-line bg-pc-bg text-pc-dk',
  pp: 'border-pp-line bg-pp-bg text-pp-dk',
};

const TENSE_BAR: Record<TenseKey, string> = {
  ps: 'bg-ps',
  pc: 'bg-pc',
  pp: 'bg-pp',
};

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

  const unknownHere = useMemo(() => {
    const seen = new Map<string, WordStatus>();
    for (const token of analysis.tokens) {
      if (!token.word || !isMeaningfulWord(token.word)) continue;
      const status = wordStatus(token.word);
      if (status !== 'known') seen.set(token.word, status);
    }
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
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
  };

  return (
    <div className="mx-auto max-w-[1080px] px-5 py-8">
      <h1 className="mt-0 mb-1.5 text-[clamp(24px,3.4vw,32px)] font-bold tracking-[-0.6px]">
        Аналіз тексту
      </h1>
      <p className="text-ink-2 mt-0 mb-6 max-w-[760px] text-[17px]">
        Вставте англійський текст — застосунок покаже, де які минулі часи, і що з лексики вам
        незнайоме. Підсвічується вся конструкція, а не окреме слово: саме зв&apos;язку
        «had&nbsp;+&nbsp;V3» треба навчитися бачити.
      </p>

      {/* Джерело: текст або файл */}
      <div className="mb-4 flex gap-2">
        {(['text', 'file'] as Source[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSource(option)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] font-bold ${
              source === option
                ? 'border-line-strong bg-surface-2 text-ink'
                : 'border-line bg-surface text-ink-3'
            }`}
          >
            {option === 'text' ? 'Текст' : 'PDF · фото'}
          </button>
        ))}
      </div>

      {source === 'text' ? (
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSaved(false);
          }}
          rows={8}
          className="bg-surface border-line focus:border-ps w-full rounded-xl border p-4 font-sans text-[15.5px] outline-none"
          placeholder="Вставте англійський текст…"
        />
      ) : (
        <FileSource onText={acceptExtracted} />
      )}

      {/* Чотири перемикачі шарів */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TENSE_ORDER.map((tense) => (
          <button
            key={tense}
            type="button"
            onClick={() => toggle(tense)}
            aria-pressed={layers[tense]}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold ${
              layers[tense] ? TENSE_TOGGLE[tense] : 'border-line bg-surface text-ink-3'
            }`}
          >
            {TENSE_LABELS[tense]} · {analysis.stats[tense].count}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggle('words')}
          aria-pressed={layers.words}
          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13.5px] font-semibold ${
            layers.words ? 'border-line-strong bg-surface-2 text-ink' : 'border-line bg-surface text-ink-3'
          }`}
        >
          Незнайомі слова · {unknownHere.length}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Підсвічений текст */}
        <div className="bg-surface border-line rounded-card shadow-card min-w-0 border px-6 py-5 text-[17px] leading-[2]">
          {analysis.tokens.map((token, index) => {
            if (!token.word) return <span key={index}>{token.raw}</span>;

            const tenseClass = token.tense && layers[token.tense] ? TENSE_TEXT[token.tense] : '';
            const status = wordStatus(token.word);
            const wordClass =
              layers.words && isMeaningfulWord(token.word) && !token.tense
                ? status === 'learning'
                  ? 'word-learning'
                  : status === 'unknown'
                    ? 'word-unknown'
                    : ''
                : '';

            return (
              <span
                key={index}
                role="button"
                tabIndex={-1}
                title={`${token.word} — ${status === 'known' ? 'знаю' : status === 'learning' ? 'вчу' : 'не знаю'}`}
                onClick={() => cycleWordStatus(token.word ?? '')}
                className={`cursor-pointer ${tenseClass ? `${tenseClass} font-bold` : ''} ${wordClass}`}
              >
                {token.raw}
              </span>
            );
          })}
        </div>

        {/* Статистика */}
        <aside className="space-y-4">
          <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
            <div className="text-ink-3 text-[11.5px] font-extrabold tracking-[1px] uppercase">
              Профіль тексту
            </div>
            <div className="text-ink-2 mt-1 text-[13.5px]">{analysis.wordCount} слів</div>

            <div className="mt-3 space-y-3">
              {TENSE_ORDER.map((tense) => {
                const stat = analysis.stats[tense];
                return (
                  <div key={tense}>
                    <div className="flex items-baseline justify-between text-[13.5px]">
                      <span className={`font-semibold ${TENSE_TEXT[tense]}`}>
                        {TENSE_LABELS[tense]}
                      </span>
                      <span className="text-ink-3 font-bold">{stat.count}</span>
                    </div>
                    <div className="bg-surface-2 mt-1 h-1.5 overflow-hidden rounded-full">
                      <div
                        className={`h-full ${TENSE_BAR[tense]}`}
                        style={{ width: `${(stat.count / maxTenseCount) * 100}%` }}
                      />
                    </div>
                    {stat.examples.length > 0 ? (
                      <div className="text-ink-3 mt-1 text-[12.5px]">
                        {stat.examples.join(' · ')}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface border-line rounded-card shadow-card border px-5 py-4">
            <div className="text-ink-3 text-[11.5px] font-extrabold tracking-[1px] uppercase">
              Незнайомі слова тут
            </div>
            <p className="text-ink-3 mt-1 mb-2 text-[12.5px]">
              Клік по чипу змінює статус: не знаю → вчу → знаю.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unknownHere.map(([word, status]) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => cycleWordStatus(word)}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[12.5px] font-semibold ${
                    status === 'learning'
                      ? 'border-pc-line bg-pc-bg text-pc-dk'
                      : 'border-line bg-surface text-ink-2'
                  }`}
                >
                  {word}
                </button>
              ))}
              {unknownHere.length === 0 ? (
                <span className="text-ink-3 text-[13px]">Усе позначено як «знаю».</span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              addText(fileName ?? text.slice(0, 40), text);
              setSaved(true);
            }}
            className="border-line bg-surface text-ink-2 hover:border-line-strong w-full cursor-pointer rounded-lg border px-3 py-2 text-[13.5px] font-bold"
          >
            {saved ? '✓ Додано до бібліотеки' : 'Зберегти текст у бібліотеку'}
          </button>
          <p className="text-ink-3 mt-0 text-[12.5px]">
            Збережені тексти живлять спільний частотний список на екрані «Слова».
          </p>
        </aside>
      </div>
    </div>
  );
}

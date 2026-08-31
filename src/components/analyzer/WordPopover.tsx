'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';
import { LADDER_STATUSES, STATUS_LABELS } from '@/components/words/statuses';
import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import { audioMimeType, transcodedMp3Url } from '@/lib/dictionary/audio';
import { useFullEntry } from '@/lib/dictionary/client';
import { RULE_CARDS, theoryHref } from '@/lib/grammar/cards';
import type { TenseKey } from '@/types/content';
import type { WordStatus } from '@/types/state';

/**
 * Картка слова прямо в тексті: вимова, значення і сходинка знання.
 *
 * До неї клік по слову мовчки перемикав статус по колу. Це працювало для
 * того, хто вже знав правило, і не працювало для всіх інших: слово міняло
 * вигляд, а що з ним сталося і що воно взагалі означає — ніде не було
 * сказано. Тепер клік показує саме те, заради чого в незнайоме слово
 * тицяють, а статус ставиться явною кнопкою.
 *
 * Значення показуємо англійською, бо українського перекладу в джерелі
 * немає: `wikitext.ts` не читає підсторінку `WORD/translations`, а стаття
 * Вікісловника дає означення мовою оригіналу. Макет малює тут українською —
 * це стане правдою, коли переклади зʼявляться в статті, і картка їх
 * покаже без переробки.
 */

/** Ширина картки з макета — під неї підібрані і рядок вимови, і три кнопки. */
const WIDTH = 280;
/** Відступ від слова, щоб картка не накривала саме слово. */
const GAP = 10;

/**
 * Конструкція, у якій стоїть клікнуте слово. `rule` — ключ у `RULE_CARDS`
 * (є лише в розмітки двигуна: бібліотека і `/api/analyze`; локальні правила
 * знають тільки час). `uncertain` — двигун вважає межу хиткою, і модель її
 * ще не підтвердила.
 */
export interface WordGrammar {
  tense: TenseKey;
  rule?: string;
  uncertain?: boolean;
}

export function WordPopover({
  word,
  anchor,
  grammar,
  onClose,
}: {
  word: string;
  /** Прямокутник слова у координатах вікна */
  anchor: DOMRect;
  /** Конструкція під словом, якщо слово підсвічене часом. */
  grammar?: WordGrammar | null;
  onClose: () => void;
}) {
  const { wordStatus, setWordStatus } = useAppState();
  const { entry, loading } = useFullEntry(word);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const status = wordStatus(word);
  const mp3 = transcodedMp3Url(entry?.audioUrl ?? null);

  // Escape закриває картку, клік поза нею — теж. Обидва слухачі на документі:
  // картка може перекривати текст, і клік «повз» неї мусить працювати всюди.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointer = (event: PointerEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) onClose();
    };

    document.addEventListener('keydown', onKey);
    // capture: інакше клік по іншому слову встиг би відкрити нову картку
    // раніше, ніж закриється ця, і закриття прибрало б уже нову.
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [onClose]);

  // Картка fixed, а не всередині слова: полотно сторінки має свою висоту й
  // ховає все, що з неї виступає, — картка біля нижнього рядка обрізалася б
  // рівно там, де вона потрібна. Позиція притиснута до вікна з обох боків.
  const left = Math.min(
    Math.max(8, anchor.left + anchor.width / 2 - WIDTH / 2),
    Math.max(8, window.innerWidth - WIDTH - 8),
  );
  const below = anchor.bottom + GAP;
  const flip = below + 180 > window.innerHeight && anchor.top > 200;

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label={`Слово ${word}`}
      className="bg-deep text-deep-ink rounded-note fixed z-50 px-[18px] py-4 text-[13px] leading-[1.55] shadow-[0_16px_40px_rgb(38_36_32_/_0.35)]"
      style={{
        width: WIDTH,
        left,
        top: flip ? undefined : below,
        bottom: flip ? window.innerHeight - anchor.top + GAP : undefined,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <b className="text-[15px]">{word}</b>
        {entry?.ipa ? (
          <span className="text-deep-ink-2 flex flex-none items-center gap-1 font-mono text-[11px]">
            /{entry.ipa}/
            {entry.audioUrl !== null || mp3 !== null ? (
              <button
                type="button"
                aria-label="Прослухати"
                onClick={() => void audioRef.current?.play().catch(() => undefined)}
                className="cursor-pointer"
              >
                🔊
              </button>
            ) : null}
          </span>
        ) : null}
      </div>

      <div className="text-deep-ink-2 mt-1.5">
        {loading
          ? 'Шукаю у Вікісловнику…'
          : (entry?.definitions[0] ?? 'У Вікісловнику немає статті про це слово.')}
      </div>

      {grammar ? <GrammarRow grammar={grammar} /> : null}

      <div className="mt-3 flex gap-1.5">
        {LADDER_STATUSES.map((option) => (
          <StatusButton
            key={option}
            option={option}
            active={status === option}
            onPick={() => setWordStatus(word, option)}
          />
        ))}
      </div>

      {entry?.audioUrl !== undefined && entry?.audioUrl !== null ? (
        <audio ref={audioRef} preload="none">
          {mp3 !== null ? <source src={mp3} type="audio/mpeg" /> : null}
          <source src={entry.audioUrl} type={audioMimeType(entry.audioUrl)} />
        </audio>
      ) : null}
    </div>
  );
}

/**
 * Чому слово підсвічене: назва часу, формула правила двигуна й дорога в
 * теорію. Це відповідь двигуна, а не здогад: кожен збіг несе `rule`, і рядок
 * «Past Perfect · had + V3» береться з тих самих `RULE_CARDS`, з яких
 * рендеряться формули в розділах тем. Розмітка локальних правил правила не
 * має — тоді показуємо лише назву часу, без формули й посилання.
 */
function GrammarRow({ grammar }: { grammar: WordGrammar }) {
  const card = grammar.rule !== undefined ? RULE_CARDS[grammar.rule] : undefined;

  return (
    <div className="border-deep-line mt-3 border-t pt-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0">
          <b>{TENSE_LABELS[grammar.tense]}</b>
          {card ? <span className="text-deep-ink-2"> · {card.formula}</span> : null}
        </span>
        {card ? (
          <Link
            href={theoryHref(card)}
            className="text-deep-ink-2 flex-none text-[12px] underline underline-offset-2 hover:text-deep-ink"
          >
            Теорія →
          </Link>
        ) : null}
      </div>
      {grammar.uncertain === true ? (
        <div className="text-deep-ink-2 mt-1 text-[12px] italic">
          Межа конструкції хитка — модель її ще не підтверджувала.
        </div>
      ) : null}
    </div>
  );
}

/**
 * Кнопка сходинки. Обраний стан жовтий — тим самим кольором, яким у тексті
 * позначене слово «вчу»: одна фарба на весь канал лексики, тому зв'язок між
 * кнопкою і виглядом слова видно без пояснень.
 */
function StatusButton({
  option,
  active,
  onPick,
}: {
  option: WordStatus;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`rounded-ctrl flex-1 cursor-pointer py-[9px] text-center text-[12.5px] font-bold ${
        active ? 'bg-yellow text-deep' : 'bg-deep-line text-deep-ink'
      }`}
    >
      {STATUS_LABELS[option]}
      {active ? ' ✓' : null}
    </button>
  );
}

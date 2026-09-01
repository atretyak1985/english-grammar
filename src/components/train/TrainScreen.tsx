'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { DEMO_TEXT } from '@/components/analyzer/DEMO_TEXT';
import { useAppState } from '@/components/providers/AppStateProvider';
import { findMatches, tokenize } from '@/lib/analyzer/tenses';
import { useDictionary } from '@/lib/dictionary/client';
import type { ExampleSource } from '@/lib/drills/examples';
import { gapTask } from '@/lib/drills/gap';
import type { StoryPool } from '@/lib/drills/pool';
import {
  type DrillSentence,
  GAP_LIMITS,
  ORDER_LIMITS,
  drillSentences,
  shuffle,
} from '@/lib/drills/sentences';
import {
  DAILY_GOAL,
  DRILL_TITLES,
  type DrillKind,
  daysLabel,
  drillSlug,
  streakDays,
  todayCount,
  weekDays,
} from '@/lib/drills/streak';
import { docKeyOf, useReading } from '@/lib/state/reading';
import { useTexts } from '@/lib/state/texts';
import { TENSE_ASPECT, type Aspect } from '@/types/content';

import { CardsDrill } from './CardsDrill';
import { GapDrill, type GapRound } from './GapDrill';
import { OrderDrill } from './OrderDrill';
import { MIN_PAIRS, PairsDrill } from './PairsDrill';
import { KICKER, PRIMARY_BTN, TAG, WORD_CHIP } from './ui';

/**
 * Тренування: денна норма й серія зверху, чотири вправи знизу.
 *
 * Матеріал вправ — з того, що людина читала. Речення для граматичних
 * вправ приходять з бібліотеки (сервер) і з текстів, збережених у цьому
 * браузері; слова для лексичних — зі статусів «вчу». Спершу беруться
 * тексти, які читач справді відкривав, і лише коли їх немає — решта
 * бібліотеки, а зовсім без нічого — демо-текст із читалки. Так вправа
 * ніколи не порожня, але й ніколи не вигадана.
 */

const ORDER_SESSION = 5;
const GAP_SESSION = 6;
const CARDS_SESSION = 8;
const PAIRS_SESSION = 6;

/** Тривалість з макета — орієнтир, а не вимір. */
const MINUTES: Record<DrillKind, number> = { order: 2, cards: 3, gap: 2, pairs: 2 };

interface Bucket {
  /** З текстів, які читач відкривав */
  read: DrillSentence[];
  /** З решти бібліотеки */
  other: DrillSentence[];
}

type Session =
  | { kind: 'order'; sentences: DrillSentence[] }
  | { kind: 'gap'; rounds: GapRound[] }
  | { kind: 'cards'; words: string[] }
  | { kind: 'pairs'; words: string[] };

/** Спершу прочитане, потім решта; без повторів одного речення. */
function pick(bucket: Bucket, count: number): DrillSentence[] {
  const seen = new Set<string>();
  const out: DrillSentence[] = [];
  for (const sentence of [...shuffle(bucket.read), ...shuffle(bucket.other)]) {
    const key = sentence.words.join(' ');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sentence);
    if (out.length === count) break;
  }
  return out;
}

/** Речення обох видів з одного тексту — для локальних текстів і демо. */
function sentencesOf(title: string, body: string): { order: DrillSentence[]; gap: DrillSentence[] } {
  const tokens = tokenize(body);
  const matches = findMatches(tokens);
  return {
    order: drillSentences(tokens, matches, title, ORDER_LIMITS),
    gap: drillSentences(tokens, matches, title, GAP_LIMITS).filter((sentence) => gapTask(sentence) !== null),
  };
}

export function TrainScreen({ stories }: { stories: StoryPool[] }) {
  const { state, ready, addAttempt } = useAppState();
  const { texts } = useTexts();
  const { doc, positions } = useReading();

  const readKeys = useMemo(() => {
    const keys = new Set(Object.keys(positions));
    keys.add(docKeyOf(doc));
    return keys;
  }, [positions, doc]);

  const local = useMemo(
    () => texts.map((text) => ({ key: text.id, title: text.title, ...sentencesOf(text.title, text.body) })),
    [texts],
  );

  const pool = useMemo(() => {
    const order: Bucket = { read: [], other: [] };
    const gap: Bucket = { read: [], other: [] };

    for (const story of stories) {
      const side = readKeys.has(`library:${story.slug}`) ? 'read' : 'other';
      order[side].push(...story.order);
      gap[side].push(...story.gap);
    }
    for (const text of local) {
      const side = readKeys.has(text.key) ? 'read' : 'other';
      order[side].push(...text.order);
      gap[side].push(...text.gap);
    }

    if (order.read.length + order.other.length + gap.read.length + gap.other.length === 0) {
      const demo = sentencesOf('Демо-текст', DEMO_TEXT);
      order.other.push(...demo.order);
      gap.other.push(...demo.gap);
    }
    return { order, gap };
  }, [stories, local, readKeys]);

  /**
   * Джерела прикладів для карток, шукаються без мережі: тексти цього
   * браузера і демо-текст — той самий, що на головній, де слова з нього
   * найчастіше й позначають.
   */
  const sources = useMemo<ExampleSource[]>(
    () => [
      ...texts.map((text) => ({ title: text.title, body: text.body })),
      { title: 'Демо-текст', body: DEMO_TEXT },
    ],
    [texts],
  );

  const learning = useMemo(
    () => Object.entries(state.words).filter(([, status]) => status === 'learning').map(([word]) => word),
    [state.words],
  );

  const [session, setSession] = useState<Session | null>(null);
  const [run, setRun] = useState(0);

  const start = (kind: DrillKind) => {
    let next: Session;
    switch (kind) {
      case 'order':
        next = { kind, sentences: pick(pool.order, ORDER_SESSION) };
        break;
      case 'gap':
        next = {
          kind,
          rounds: pick(pool.gap, GAP_SESSION)
            .map((sentence) => gapTask(sentence))
            .filter((task) => task !== null)
            .map((task) => ({ task, options: shuffle(task.choice.options) })),
        };
        break;
      case 'cards':
        next = { kind, words: shuffle(learning).slice(0, CARDS_SESSION) };
        break;
      case 'pairs':
        next = { kind, words: shuffle(learning).slice(0, PAIRS_SESSION) };
        break;
    }
    setSession(next);
    setRun((current) => current + 1);
  };

  const finish = (kind: DrillKind) => (correct: number, total: number) => {
    addAttempt({ topicSlug: drillSlug(kind), correct, total, finishedAt: new Date().toISOString() });
  };

  const exit = () => setSession(null);

  const attempts = ready ? state.attempts : [];
  const done = todayCount(attempts);
  const streak = streakDays(attempts);
  const week = weekDays(attempts);

  const hasSentences = pool.order.read.length + pool.order.other.length > 0;
  const hasGaps = pool.gap.read.length + pool.gap.other.length > 0;

  return (
    <div className="mx-auto w-full max-w-shell px-9 py-9 leading-[normal]">
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <DailyCard done={done} streak={streak} week={week} />
        <AlexNote />
      </div>

      {session ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={exit}
              className="text-acc cursor-pointer text-[14px] font-bold"
            >
              ← Усі вправи
            </button>
            <h2 className="font-serif m-0 text-[22px] font-extrabold">{DRILL_TITLES[session.kind]}</h2>
          </div>
          <div key={run}>
            {session.kind === 'order' ? (
              <OrderDrill
                sentences={session.sentences}
                onFinish={finish('order')}
                onRepeat={() => start('order')}
                onExit={exit}
              />
            ) : session.kind === 'gap' ? (
              <GapDrill
                rounds={session.rounds}
                onFinish={finish('gap')}
                onRepeat={() => start('gap')}
                onExit={exit}
              />
            ) : session.kind === 'cards' ? (
              <CardsDrill
                words={session.words}
                sources={sources}
                onFinish={finish('cards')}
                onRepeat={() => start('cards')}
                onExit={exit}
              />
            ) : (
              <PairsDrill
                words={session.words}
                onFinish={finish('pairs')}
                onRepeat={() => start('pairs')}
                onExit={exit}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <DrillCard
            kind="order"
            tag="Граматика"
            tagTone="bg-ps-bg text-ps-tx"
            border="border-t-ps"
            lede="Зберіть речення з ваших текстів у правильному порядку — час підсвітиться після відповіді."
            preview={<OrderPreview sentence={pool.order.read[0] ?? pool.order.other[0]} />}
            available={hasSentences}
            unavailable="Речень для вправи поки немає — відкрийте будь-який текст у читанні."
            onStart={start}
          />
          <DrillCard
            kind="cards"
            tag={`Лексика · ${ready ? learning.length : 0}`}
            tagTone="bg-yellow-bg text-yellow-tx"
            border="border-t-yellow"
            lede="Слово → значення, з прикладом з того тексту, де ви його зустріли."
            preview={<CardPreview word={learning[0] ?? null} />}
            available={learning.length > 0}
            unavailable="Картки збираються зі слів у статусі «вчу» — позначте кілька в читанні."
            onStart={start}
          />
          <DrillCard
            kind="gap"
            tag="Граматика"
            tagTone="bg-pp-bg text-pp-tx"
            border="border-t-pp"
            lede="Оберіть правильну форму дієслова в реченні — з поясненням «чому» після відповіді."
            preview={<GapPreview sentence={pool.gap.read[0] ?? pool.gap.other[0]} />}
            available={hasGaps}
            unavailable="У ваших текстах поки не знайшлося речення з конструкцією для пропуску."
            onStart={start}
          />
          <DrillCard
            kind="pairs"
            tag="Лексика"
            tagTone="bg-yellow-bg text-yellow-tx"
            border="border-t-pc"
            lede={`Зʼєднайте ${PAIRS_SESSION} пар на швидкість — найкращий спосіб освіжити «вчу» перед сном.`}
            preview={<PairPreview word={learning[0] ?? null} note={learning[0] ? state.notes[learning[0]] ?? null : null} />}
            available={learning.length >= MIN_PAIRS}
            unavailable={`Для пар потрібно хоча б ${MIN_PAIRS} слова у статусі «вчу» — зараз ${ready ? learning.length : 0}.`}
            onStart={start}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const RING_RADIUS = 38;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const REMAINING = ['', 'одна', 'дві', 'три', 'чотири'];

/** Скільки лишилось до норми — словом, доки число мале. */
function remainingLabel(count: number): string {
  return REMAINING[count] ?? String(count);
}

function subtitle(done: number, streak: number): string {
  const minute = 'Одна вправа ≈ 2 хвилини.';
  if (done === 0) {
    return streak > 0
      ? `Одна вправа — і серія триватиме ${streak + 1}-й день. ${minute}`
      : `Одна вправа — і день зараховано в серію. ${minute}`;
  }
  if (done < DAILY_GOAL) {
    return `Ще ${remainingLabel(DAILY_GOAL - done)} до денної норми — серія вже ${daysLabel(streak)}. ${minute}`;
  }
  return `Норма на сьогодні виконана, серія — ${daysLabel(streak)}. Хочете ще — вправи нікуди не діваються.`;
}

const WEEK_TONE = {
  done: 'bg-acc text-white',
  today: 'border-lex-line text-label border-2 border-dashed',
  missed: 'bg-track text-lex-line',
  ahead: 'bg-track text-lex-line',
} as const;

function DailyCard({
  done,
  streak,
  week,
}: {
  done: number;
  streak: number;
  week: ReturnType<typeof weekDays>;
}) {
  const share = Math.min(done, DAILY_GOAL) / DAILY_GOAL;

  return (
    <div className="bg-panel border-line rounded-panel flex flex-wrap items-center gap-6 border px-[30px] py-[26px]">
      <div className="relative h-[88px] w-[88px] flex-none" role="img" aria-label={`${done} з ${DAILY_GOAL} вправ`}>
        <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
          <circle cx="44" cy="44" r={RING_RADIUS} fill="none" stroke="var(--track)" strokeWidth="9" />
          <circle
            cx="44"
            cy="44"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--acc)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - share)}
            transform="rotate(-90 44 44)"
          />
        </svg>
        <div className="font-serif absolute inset-0 flex items-center justify-center text-[20px] font-extrabold">
          {Math.min(done, DAILY_GOAL)}/{DAILY_GOAL}
        </div>
      </div>

      <div className="min-w-0">
        <h1 className="font-serif m-0 text-[22px] font-extrabold">
          Сьогодні: {done} з {DAILY_GOAL} вправ
        </h1>
        <p className="text-ink-2 m-0 mt-[5px] text-[14px] leading-[1.55]">{subtitle(done, streak)}</p>
        <div className="mt-3 flex gap-[5px]">
          {week.map((day) => (
            <span
              key={day.key}
              title={
                day.state === 'done'
                  ? 'Була вправа'
                  : day.state === 'today'
                    ? 'Сьогодні'
                    : day.state === 'missed'
                      ? 'Без вправ'
                      : 'Ще попереду'
              }
              className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-[12px] font-bold ${WEEK_TONE[day.state]}`}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlexNote() {
  return (
    <div className="bg-tint rounded-panel flex items-center gap-4 px-[26px] py-[22px]">
      <Image
        src="/alex-cutout.png"
        alt="Alex the Linguist"
        width={315}
        height={365}
        className="h-auto w-16 flex-none"
      />
      <div className="text-green-tx text-[13.5px] leading-[1.6]">
        <b>Серія чесна:</b> одна вправа тримає день. Пропустили? Серія просто пауза, без сорому.
      </div>
    </div>
  );
}

function DrillCard({
  kind,
  tag,
  tagTone,
  border,
  lede,
  preview,
  available,
  unavailable,
  onStart,
}: {
  kind: DrillKind;
  tag: string;
  tagTone: string;
  border: string;
  lede: string;
  preview: React.ReactNode;
  available: boolean;
  unavailable: string;
  onStart: (kind: DrillKind) => void;
}) {
  return (
    <div className={`bg-panel border-line rounded-panel border border-t-4 px-7 py-6 ${border}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif m-0 text-[19px] font-extrabold">{DRILL_TITLES[kind]}</h2>
        <span className={`${TAG} ${tagTone}`}>{tag}</span>
      </div>
      <p className="text-ink-2 mt-2 mb-3.5 text-[13.5px] leading-[1.55]">{lede}</p>

      <div className="mb-4 min-h-[44px]">{preview}</div>

      {available ? (
        <button type="button" onClick={() => onStart(kind)} className={PRIMARY_BTN}>
          Почати · {MINUTES[kind]} хв
        </button>
      ) : (
        <div className="text-ink-3 text-[13px] leading-[1.5]">
          {unavailable}{' '}
          <Link href="/reading" className="text-acc font-bold">
            До читання →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const ASPECT_CHIP: Record<Aspect, string> = {
  simple: 'bg-ps-bg border-ps text-ps-tx font-bold',
  continuous: 'bg-pc-bg border-pc text-pc-tx font-bold',
  perfect: 'bg-pp-bg border-pp text-pp-tx font-bold',
};

/** Кілька слів справжнього речення, свідомо не по порядку; конструкція часу — заливкою. */
function OrderPreview({ sentence }: { sentence: DrillSentence | undefined }) {
  if (!sentence) return <span className={`${KICKER}`}>Речення з ваших текстів</span>;

  const shown = sentence.words.slice(0, 4);
  // Сталий «безлад»: пари міняються місцями, тому прев'ю не стрибає між рендерами
  const order = shown.map((_, i) => (i % 2 === 0 ? Math.min(i + 1, shown.length - 1) : i - 1));

  return (
    <div className="flex flex-wrap gap-1.5">
      {order.map((wordIndex) => {
        const match = sentence.matches.find((item) => wordIndex >= item.from && wordIndex <= item.to);
        return (
          <span
            key={wordIndex}
            className={`${WORD_CHIP} text-[13.5px] ${match ? ASPECT_CHIP[TENSE_ASPECT[match.tense]] : ''}`}
          >
            {shown[wordIndex]}
          </span>
        );
      })}
    </div>
  );
}

const ASPECT_LINE: Record<Aspect, string> = {
  simple: 'border-ps text-ps-tx',
  continuous: 'border-pc text-pc-tx',
  perfect: 'border-pp text-pp-tx',
};

function GapPreview({ sentence }: { sentence: DrillSentence | undefined }) {
  const task = sentence ? gapTask(sentence) : null;
  if (!task) return <span className={KICKER}>Речення з ваших текстів</span>;

  const { words } = task.sentence;
  return (
    <p className="font-serif m-0 text-[14.5px] leading-[1.7]">
      {words.slice(0, task.from).join(' ')}{' '}
      <span className={`border-b-2 px-5 font-bold ${ASPECT_LINE[TENSE_ASPECT[task.tense]]}`}>___</span>{' '}
      {words.slice(task.to + 1).join(' ')}
    </p>
  );
}

function CardPreview({ word }: { word: string | null }) {
  return (
    <div className="bg-bg border-line rounded-btn border px-4 py-3.5 text-center">
      <span className="font-serif text-[17px] font-extrabold">{word ?? 'слово'}</span>
      <div className="text-label mt-1 text-[12px]">натисніть, щоб перевернути</div>
    </div>
  );
}

const PREVIEW_MEANING_LENGTH = 34;

function PairPreview({ word, note }: { word: string | null; note: string | null }) {
  const { brief } = useDictionary(useMemo(() => (word && !note ? [word] : []), [word, note]));
  const definition = word ? brief.get(word)?.definition ?? null : null;
  const meaning = note ?? definition;
  const clipped =
    meaning && meaning.length > PREVIEW_MEANING_LENGTH
      ? `${meaning.slice(0, PREVIEW_MEANING_LENGTH - 1).trimEnd()}…`
      : meaning;

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`${WORD_CHIP} font-sans text-[13px] font-semibold`}>{word ?? 'слово'}</span>
      <span className="border-acc bg-tint text-green-tx rounded-ctrl border-[1.5px] px-3 py-[7px] text-[13px] leading-[normal] font-bold">
        {clipped ?? 'значення'} ✓
      </span>
    </div>
  );
}

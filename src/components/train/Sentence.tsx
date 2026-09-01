import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import type { SentenceMatch } from '@/lib/drills/sentences';
import { TENSE_HIGHLIGHT, type TenseKey } from '@/types/content';

/**
 * Речення з підсвіткою часів — тією самою заливкою, що в читанні. Вправа
 * показує це ПІСЛЯ відповіді: до неї підсвітка була б підказкою.
 */

interface Segment {
  text: string;
  tense: TenseKey | null;
}

/** Слова однієї конструкції зливаються в один сегмент, щоб заливка не рвалась на пробілах. */
function segmentsOf(words: readonly string[], matches: readonly SentenceMatch[]): Segment[] {
  const out: Segment[] = [];
  let i = 0;
  while (i < words.length) {
    const match = matches.find((item) => item.from === i);
    if (match) {
      out.push({ text: words.slice(match.from, match.to + 1).join(' '), tense: match.tense });
      i = match.to + 1;
    } else {
      out.push({ text: words[i] ?? '', tense: null });
      i += 1;
    }
  }
  return out;
}

export function HighlightedSentence({
  words,
  matches,
  className = '',
}: {
  words: readonly string[];
  matches: readonly SentenceMatch[];
  className?: string;
}) {
  return (
    <p className={`font-serif m-0 text-[18px] leading-[1.85] ${className}`}>
      {segmentsOf(words, matches).map((segment, index) => (
        <span key={index}>
          {index > 0 ? ' ' : ''}
          {segment.tense ? (
            <span className={`${TENSE_HIGHLIGHT[segment.tense]} rounded-mark px-1 py-0.5`}>
              {segment.text}
            </span>
          ) : (
            segment.text
          )}
        </span>
      ))}
    </p>
  );
}

/** Легенда до підсвітки: які часи в реченні є. */
export function TenseChips({ tenses }: { tenses: readonly TenseKey[] }) {
  const unique = [...new Set(tenses)];
  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((tense) => (
        <span
          key={tense}
          className={`${TENSE_HIGHLIGHT[tense]} rounded-pill px-[11px] py-1 text-[12px] leading-[normal] font-bold`}
        >
          {TENSE_LABELS[tense]}
        </span>
      ))}
    </div>
  );
}

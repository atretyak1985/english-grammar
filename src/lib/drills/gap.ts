import { type GapChoice, type GapTense, gapOptions, isGapTense } from './forms';
import type { DrillSentence } from './sentences';

/**
 * Одне завдання «заповнити пропуск»: речення, межі пропуску й варіанти.
 * Живе окремо від `forms.ts`, бо це вже про речення, а не про дієслово:
 * який зі збігів ховати і чи можна його сховати так, щоб сусідня
 * конструкція не підказувала відповідь.
 */
export interface GapTask {
  sentence: DrillSentence;
  /** Номери слів, які закриває пропуск, включно. */
  from: number;
  to: number;
  tense: GapTense;
  choice: GapChoice;
}

/**
 * Завдання з речення або `null`, якщо жоден збіг не годиться. Збіг, що
 * впирається в інший («was» + «tired», «had» + «finished» двома збігами),
 * пропускається: половина конструкції на видноті — це вже не пропуск.
 */
export function gapTask(sentence: DrillSentence): GapTask | null {
  const { words, matches } = sentence;

  for (const match of matches) {
    if (!isGapTense(match.tense)) continue;
    const touching = matches.some(
      (other) => other !== match && (other.to === match.from - 1 || other.from === match.to + 1),
    );
    if (touching) continue;

    const before = match.from > 0 ? (words[match.from - 1] ?? null) : null;
    const choice = gapOptions(words.slice(match.from, match.to + 1), match.tense, before);
    if (choice) return { sentence, from: match.from, to: match.to, tense: match.tense, choice };
  }

  return null;
}

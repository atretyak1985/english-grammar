/** Три статуси слова. Порядок важливий: при злитті з акаунтом перемагає «сильніший». */
export type WordStatus = 'unknown' | 'learning' | 'known';

export const WORD_STATUS_RANK: Record<WordStatus, number> = {
  unknown: 0,
  learning: 1,
  known: 2,
};

export type Theme = 'light' | 'dark';

/** Результат однієї спроби тесту. */
export interface QuizAttempt {
  topicSlug: string;
  correct: number;
  total: number;
  /** ISO-рядок; ставиться в момент завершення тесту */
  finishedAt: string;
}

/**
 * Увесь стан користувача. Анонімно живе в localStorage,
 * після входу — синхронізується з акаунтом (CONCEPT 7–8).
 */
export interface UserState {
  /** slug теми → id прочитаних розділів */
  readSections: Record<string, string[]>;
  /** слово (нижній регістр) → статус */
  words: Record<string, WordStatus>;
  /** остання відкрита тема — для картки «Продовжити» */
  lastTopic: string | null;
  attempts: QuizAttempt[];
}

export const EMPTY_STATE: UserState = {
  readSections: {},
  words: {},
  lastTopic: null,
  attempts: [],
};

/** Злиття локального стану з серверним: конфліктів за визначенням немає (CONCEPT 8.1). */
export function mergeState(a: UserState, b: UserState): UserState {
  const readSections: Record<string, string[]> = {};
  for (const slug of new Set([...Object.keys(a.readSections), ...Object.keys(b.readSections)])) {
    readSections[slug] = [
      ...new Set([...(a.readSections[slug] ?? []), ...(b.readSections[slug] ?? [])]),
    ];
  }

  const words: Record<string, WordStatus> = { ...a.words };
  for (const [word, status] of Object.entries(b.words)) {
    const current = words[word];
    if (!current || WORD_STATUS_RANK[status] > WORD_STATUS_RANK[current]) {
      words[word] = status;
    }
  }

  const attempts = [...a.attempts, ...b.attempts]
    .filter(
      (attempt, i, all) =>
        all.findIndex(
          (other) =>
            other.finishedAt === attempt.finishedAt && other.topicSlug === attempt.topicSlug,
        ) === i,
    )
    .sort((x, y) => x.finishedAt.localeCompare(y.finishedAt));

  return {
    readSections,
    words,
    lastTopic: b.lastTopic ?? a.lastTopic,
    attempts,
  };
}

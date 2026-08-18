import { EMPTY_STATE, type QuizAttempt, type UserState, type WordStatus } from '@/types/state';

const STATUSES: WordStatus[] = ['unknown', 'learning', 'known'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Розбирає стан, що прийшов з браузера. Усе непізнане відкидається:
 * у базу мусить потрапляти лише те, що застосунок сам умів створити.
 */
export function parseUserState(input: unknown): UserState {
  if (!isRecord(input)) return EMPTY_STATE;

  const readSections: Record<string, string[]> = {};
  if (isRecord(input.readSections)) {
    for (const [slug, value] of Object.entries(input.readSections)) {
      if (!Array.isArray(value)) continue;
      const ids = value.filter(
        (id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 64,
      );
      if (slug.length <= 64) readSections[slug] = [...new Set(ids)];
    }
  }

  const words: Record<string, WordStatus> = {};
  if (isRecord(input.words)) {
    for (const [word, status] of Object.entries(input.words)) {
      if (word.length === 0 || word.length > 64) continue;
      if (typeof status === 'string' && STATUSES.includes(status as WordStatus)) {
        words[word.toLowerCase()] = status as WordStatus;
      }
    }
  }

  const attempts: QuizAttempt[] = Array.isArray(input.attempts)
    ? input.attempts.filter((attempt): attempt is QuizAttempt => {
        if (!isRecord(attempt)) return false;
        return (
          typeof attempt.topicSlug === 'string' &&
          typeof attempt.correct === 'number' &&
          typeof attempt.total === 'number' &&
          typeof attempt.finishedAt === 'string' &&
          !Number.isNaN(Date.parse(attempt.finishedAt))
        );
      })
    : [];

  return {
    readSections,
    words,
    lastTopic: typeof input.lastTopic === 'string' ? input.lastTopic : null,
    attempts,
  };
}

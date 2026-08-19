import { describe, expect, it } from 'vitest';

import { EMPTY_STATE, WORD_STATUS_RANK, mergeState, type UserState } from '@/types/state';

function state(patch: Partial<UserState>): UserState {
  return { ...EMPTY_STATE, ...patch };
}

describe('WORD_STATUS_RANK', () => {
  it('ставить «приховане» слабшим за «вчу»', () => {
    // Комбінація «приховав тут, вчу там» має розійтися в бік свідомої дії.
    expect(WORD_STATUS_RANK.hidden).toBeLessThan(WORD_STATUS_RANK.learning);
    expect(WORD_STATUS_RANK.unknown).toBeLessThan(WORD_STATUS_RANK.hidden);
    expect(WORD_STATUS_RANK.learning).toBeLessThan(WORD_STATUS_RANK.known);
  });
});

describe('mergeState — статуси слів', () => {
  it('лишає сильніший статус, незалежно від сторони', () => {
    const server = state({ words: { deploy: 'hidden', migration: 'known' } });
    const local = state({ words: { deploy: 'learning', migration: 'learning' } });

    expect(mergeState(server, local).words).toEqual({
      deploy: 'learning',
      migration: 'known',
    });
    // Симетрія: результат не залежить від порядку аргументів.
    expect(mergeState(local, server).words).toEqual(mergeState(server, local).words);
  });

  it('переносить слова, яких немає на іншій стороні', () => {
    const merged = mergeState(state({ words: { spike: 'known' } }), state({ words: { churn: 'hidden' } }));
    expect(merged.words).toEqual({ spike: 'known', churn: 'hidden' });
  });
});

describe('mergeState — нотатки', () => {
  it('перемагає непорожня нотатка', () => {
    const merged = mergeState(
      state({ notes: { deploy: 'розгортання' } }),
      state({ notes: { deploy: '' } }),
    );
    expect(merged.notes.deploy).toBe('розгортання');
  });

  it('при двох непорожніх перемагає локальна', () => {
    const merged = mergeState(
      state({ notes: { deploy: 'з акаунта' } }),
      state({ notes: { deploy: 'з цього пристрою' } }),
    );
    expect(merged.notes.deploy).toBe('з цього пристрою');
  });
});

describe('mergeState — решта стану', () => {
  it("об'єднує прочитані розділи без дублікатів", () => {
    const merged = mergeState(
      state({ readSections: { 'past-tenses': ['big', 'simple'] } }),
      state({ readSections: { 'past-tenses': ['simple', 'cont'] } }),
    );
    expect(merged.readSections['past-tenses']).toEqual(['big', 'simple', 'cont']);
  });

  it('не дублює спроби тесту з однаковим часом і темою', () => {
    const attempt = { topicSlug: 'past-tenses', correct: 18, total: 20, finishedAt: '2026-08-19T10:00:00.000Z' };
    const merged = mergeState(state({ attempts: [attempt] }), state({ attempts: [attempt] }));
    expect(merged.attempts).toHaveLength(1);
  });
});

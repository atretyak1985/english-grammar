import { describe, expect, it } from 'vitest';

import type { QuizAttempt } from '@/types/state';

import {
  DAILY_GOAL,
  daysLabel,
  drillKindOf,
  drillSlug,
  streakDays,
  todayCount,
  weekDays,
} from './streak';

/** Пʼятниця 2026-08-28, 13:00 місцевого часу — як на макеті: пн–чт зроблено. */
const NOW = new Date(2026, 7, 28, 13, 0, 0);

function drill(daysAgo: number, hour = 10): QuizAttempt {
  const date = new Date(NOW);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return { topicSlug: drillSlug('order'), correct: 5, total: 5, finishedAt: date.toISOString() };
}

describe('drillSlug / drillKindOf', () => {
  it('вид вправи їде через префікс і читається назад', () => {
    expect(drillKindOf(drillSlug('pairs'))).toBe('pairs');
  });

  it('тест теми — не вправа', () => {
    expect(drillKindOf('past-tenses')).toBeNull();
    expect(drillKindOf('drill:unknown')).toBeNull();
  });
});

describe('streakDays', () => {
  it('порожня історія — нуль', () => {
    expect(streakDays([], NOW)).toBe(0);
  });

  it('чотири дні поспіль до вчора — серія 4, хоч сьогодні ще нічого не зроблено', () => {
    expect(streakDays([drill(1), drill(2), drill(3), drill(4)], NOW)).toBe(4);
  });

  it('сьогоднішня вправа продовжує серію до 5', () => {
    expect(streakDays([drill(0), drill(1), drill(2), drill(3), drill(4)], NOW)).toBe(5);
  });

  it('пропущений учорашній день обриває серію', () => {
    expect(streakDays([drill(2), drill(3), drill(4)], NOW)).toBe(0);
  });

  it('тести тем у серію не рахуються', () => {
    const quiz: QuizAttempt = { ...drill(1), topicSlug: 'past-tenses' };
    expect(streakDays([quiz], NOW)).toBe(0);
  });

  it('кілька вправ одного дня — один день серії', () => {
    expect(streakDays([drill(1, 9), drill(1, 21)], NOW)).toBe(1);
  });
});

describe('todayCount', () => {
  it('рахує лише сьогоднішні вправи', () => {
    expect(todayCount([drill(0, 9), drill(0, 12), drill(1)], NOW)).toBe(2);
    expect(DAILY_GOAL).toBe(5);
  });
});

describe('weekDays', () => {
  it('тиждень з понеділка: зроблено, сьогодні, попереду', () => {
    const week = weekDays([drill(1), drill(2), drill(3), drill(4)], NOW);
    expect(week.map((day) => day.label)).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд']);
    expect(week.map((day) => day.state)).toEqual([
      'done',
      'done',
      'done',
      'done',
      'today',
      'ahead',
      'ahead',
    ]);
  });

  it('порожній минулий день — пропущений, а не «попереду»', () => {
    const week = weekDays([drill(3)], NOW);
    expect(week.map((day) => day.state)).toEqual([
      'missed',
      'done',
      'missed',
      'missed',
      'today',
      'ahead',
      'ahead',
    ]);
  });

  it('неділя — кінець тижня, а не його початок', () => {
    const sunday = new Date(2026, 7, 30, 12);
    const week = weekDays([], sunday);
    expect(week[6]?.state).toBe('today');
    expect(week[0]?.state).toBe('missed');
  });
});

describe('daysLabel', () => {
  it('узгоджує числівник', () => {
    expect(daysLabel(1)).toBe('1 день');
    expect(daysLabel(4)).toBe('4 дні');
    expect(daysLabel(5)).toBe('5 днів');
    expect(daysLabel(11)).toBe('11 днів');
    expect(daysLabel(21)).toBe('21 день');
    expect(daysLabel(0)).toBe('0 днів');
  });
});

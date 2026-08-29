import type { QuizAttempt } from '@/types/state';

/**
 * Серія й денна норма тренування — рахуються з тих самих спроб, у які
 * записуються тести тем. Окремої таблиці для вправ немає навмисно: спроба
 * вправи має рівно ті ж поля (що, скільки правильно, з скількох, коли), а
 * злиття з акаунтом і дедуплікація вже написані для тестів. Вправа
 * відрізняється лише префіксом у `topicSlug`.
 */
export const DRILL_KINDS = ['order', 'gap', 'cards', 'pairs'] as const;

export type DrillKind = (typeof DRILL_KINDS)[number];

export const DRILL_TITLES: Record<DrillKind, string> = {
  order: 'Скласти речення',
  gap: 'Заповнити пропуск',
  cards: 'Картки слів',
  pairs: 'Пари слово — значення',
};

const DRILL_PREFIX = 'drill:';

export function drillSlug(kind: DrillKind): string {
  return `${DRILL_PREFIX}${kind}`;
}

/** Який це вид вправи, або `null`, якщо спроба — звичайний тест теми. */
export function drillKindOf(topicSlug: string): DrillKind | null {
  if (!topicSlug.startsWith(DRILL_PREFIX)) return null;
  const kind = topicSlug.slice(DRILL_PREFIX.length);
  return (DRILL_KINDS as readonly string[]).includes(kind) ? (kind as DrillKind) : null;
}

/** Скільки вправ тримає день. Число з макета; одна вправа ≈ 2 хвилини. */
export const DAILY_GOAL = 5;

/**
 * Ключ дня в локальному часі користувача. Саме локальному: вправа о пів на
 * першу ночі за Києвом — це ще «сьогодні» для людини, хоч в UTC уже вчора.
 */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDay(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** День → скільки вправ (не тестів) завершено того дня. */
export function drillDays(attempts: readonly QuizAttempt[]): Map<string, number> {
  const days = new Map<string, number>();
  for (const attempt of attempts) {
    if (drillKindOf(attempt.topicSlug) === null) continue;
    const finished = new Date(attempt.finishedAt);
    if (Number.isNaN(finished.getTime())) continue;
    const key = dayKey(finished);
    days.set(key, (days.get(key) ?? 0) + 1);
  }
  return days;
}

export function todayCount(attempts: readonly QuizAttempt[], now = new Date()): number {
  return drillDays(attempts).get(dayKey(now)) ?? 0;
}

/**
 * Скільки днів поспіль була хоча б одна вправа.
 *
 * Серія «мʼяка»: якщо сьогодні ще нічого не зроблено, вона не обривається, а
 * рахується до вчора — день ще триває. Обривається вона лише тоді, коли
 * пропущено цілий учорашній день. Саме це обіцяє картка «Серія чесна».
 */
export function streakDays(attempts: readonly QuizAttempt[], now = new Date()): number {
  const days = drillDays(attempts);
  let cursor = days.has(dayKey(now)) ? now : shiftDay(now, -1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export type WeekDayState = 'done' | 'today' | 'missed' | 'ahead';

export interface WeekDay {
  key: string;
  label: string;
  state: WeekDayState;
}

const WEEK_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];

/** Тиждень з понеділка: що зроблено, який день сьогодні, що ще попереду. */
export function weekDays(attempts: readonly QuizAttempt[], now = new Date()): WeekDay[] {
  const days = drillDays(attempts);
  const today = dayKey(now);
  // getDay(): 0 — неділя, тому понеділок зсувається на початок
  const monday = shiftDay(now, -((now.getDay() + 6) % 7));

  return WEEK_LABELS.map((label, i) => {
    const key = dayKey(shiftDay(monday, i));
    let state: WeekDayState;
    if (days.has(key)) state = 'done';
    else if (key === today) state = 'today';
    else if (key < today) state = 'missed';
    else state = 'ahead';
    return { key, label, state };
  });
}

/** «1 день», «4 дні», «5 днів» — числівник узгоджується з іменником. */
export function daysLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} дні`;
  return `${count} днів`;
}

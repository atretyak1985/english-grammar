import MINUTES from '@/content/topics/minutes.json';

/**
 * Тривалість розділів теми.
 *
 * Числа не лежать у `meta.ts` руками: їх рахує `npm run minutes` з самого
 * вмісту — слів MDX і кількості завдань, — і перераховує на кожній збірці
 * (`prebuild`). Готовий JSON імпортується, а не читається з диска: у
 * продакшені образ standalone не містить `src/`, тому будь-яке `fs` у
 * рантаймі впало б саме там, де його ніхто не перевіряє.
 *
 * Розділ без числа (щойно доданий, ще не перерахований) не вигадує собі
 * тривалість і не показує її взагалі — це чесніше за підставлений нуль.
 */
const TABLE = MINUTES as Record<string, Record<string, number> | undefined>;

export function sectionMinutes(topicSlug: string, sectionSlug: string): number | null {
  return TABLE[topicSlug]?.[sectionSlug] ?? null;
}

import type { StoryCard } from '@/lib/library/server';
import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import { TENSE_KEYS, TENSE_TIME, type TenseKey, type TenseTime } from '@/types/content';

/**
 * «Побачити в тексті»: яке оповідання найкраще показує саме цю тему.
 *
 * Тема знає свій час, оповідання знає свої конструкції — і числа для
 * картки виводяться з перетину, а не пишуться руками. Макет підписує
 * там «233 Past Simple, 21 Past Perfect, 5 Continuous», і саме цей
 * рядок ми вміємо порахувати чесно: `stats` оповідання прийшли з
 * розбору тексту, а не з копірайту.
 *
 * ------------------------------------------------------------------
 * Мапа свідомо неповна. Час конструкції має сенс лише для трьох тем із
 * одинадцяти; артиклі, модальні чи прийменники підсвіткою часів не
 * вимірюються взагалі. Для них функція повертає null, і картка просто
 * не показується — це чесніше за «0 конструкцій» під заголовком
 * «побачити в тексті», який нічого не обіцяє.
 */
const TOPIC_TIME: Record<string, TenseTime> = {
  'past-tenses': 'past',
  'present-tenses': 'present',
  'future-tenses': 'future',
};

export interface Spotlight {
  story: StoryCard;
  /** Назви часів із кількостями, від найчастішого — рівно як у макеті */
  counts: { label: string; count: number }[];
  /** Скільки всього конструкцій цієї теми в тексті */
  total: number;
}

function countFor(stats: Record<TenseKey, number> | null, time: TenseTime) {
  const keys = TENSE_KEYS.filter((key) => TENSE_TIME[key] === time);
  const counts = keys
    .map((key) => ({ label: TENSE_LABELS[key], count: stats?.[key] ?? 0 }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return { counts, total: counts.reduce((sum, item) => sum + item.count, 0) };
}

export function pickSpotlight(topicSlug: string, stories: StoryCard[]): Spotlight | null {
  const time = TOPIC_TIME[topicSlug];
  if (!time) return null;

  // Найкоротший придатний текст, а не найбагатший. Це важливо: «Alice»
  // містить 2560 минулих конструкцій проти 184 у «The Gift of the Magi»,
  // але читається 120 хвилин проти девʼяти. Картка радить піти й
  // побачити правило живим — і порада на дві години не виконується
  // взагалі, тоді як девʼятихвилинна виконується сьогодні. Поріг у 20
  // конструкцій відсікає тексти, де тема трапляється випадково.
  const MIN_MATCHES = 20;

  let best: Spotlight | null = null;
  for (const story of stories) {
    const { counts, total } = countFor(story.stats, time);
    if (total < MIN_MATCHES) continue;
    if (!best || story.words < best.story.words) best = { story, counts, total };
  }

  return best;
}

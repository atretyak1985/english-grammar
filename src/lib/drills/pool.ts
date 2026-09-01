import { tokenize } from '@/lib/analyzer/tenses';
import { listStories, loadStory } from '@/lib/library/server';

import { gapTask } from './gap';
import { type DrillSentence, GAP_LIMITS, ORDER_LIMITS, drillSentences, sampleEvenly } from './sentences';

/**
 * Речення з бібліотеки для вправ — збираються на сервері, бо тіла оповідань
 * лежать у базі, а тягнути на клієнт цілу книжку заради пʼяти речень
 * нерозумно. На клієнт їде рівномірна вибірка з усіх глав кожного
 * оповідання; що саме потрапить у сеанс, вирішує вже клієнт.
 */

/** Скільки речень кожного виду везти з одного оповідання. */
export const POOL_PER_STORY = 40;

export interface StoryPool {
  slug: string;
  title: string;
  order: DrillSentence[];
  gap: DrillSentence[];
}

/** Порожній пул без бази — так само тихо, як порожня бібліотека. */
export async function loadTrainingPool(): Promise<StoryPool[]> {
  const cards = await listStories();
  const pools: StoryPool[] = [];

  for (const card of cards) {
    const story = await loadStory(card.slug);
    if (!story) continue;

    const tokens = tokenize(story.body);
    const order = drillSentences(tokens, story.matches, story.title, ORDER_LIMITS);
    const gap = drillSentences(tokens, story.matches, story.title, GAP_LIMITS).filter(
      (sentence) => gapTask(sentence) !== null,
    );

    pools.push({
      slug: story.slug,
      title: story.title,
      order: sampleEvenly(order, POOL_PER_STORY),
      gap: sampleEvenly(gap, POOL_PER_STORY),
    });
  }

  return pools;
}

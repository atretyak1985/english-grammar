import type { ComponentType } from 'react';

/**
 * Реєстр контенту тем. Динамічний import з літеральним шляхом — тому MDX
 * потрапляє у збірку і не залежить від файлової системи в рантаймі
 * (важливо для standalone-образу на Cloud Run).
 *
 * Кожен розділ — окремий файл і окрема сторінка. `TOPIC_CONTENT` лишається
 * для вигляду «все одним полотном» (/topics/<тема>/all).
 */
type ContentLoader = () => Promise<{ default: ComponentType }>;

export const TOPIC_CONTENT: Record<string, ContentLoader> = {
  'past-tenses': () => import('@/content/topics/past-tenses/index.mdx'),
};

export const SECTION_CONTENT: Record<string, Record<string, ContentLoader>> = {
  'past-tenses': {
    idea: () => import('@/content/topics/past-tenses/sections/idea.mdx'),
    'past-simple': () => import('@/content/topics/past-tenses/sections/past-simple.mdx'),
    'past-continuous': () => import('@/content/topics/past-tenses/sections/past-continuous.mdx'),
    'past-perfect': () => import('@/content/topics/past-tenses/sections/past-perfect.mdx'),
    markers: () => import('@/content/topics/past-tenses/sections/markers.mdx'),
    comparison: () => import('@/content/topics/past-tenses/sections/comparison.mdx'),
    stories: () => import('@/content/topics/past-tenses/sections/stories.mdx'),
    translation: () => import('@/content/topics/past-tenses/sections/translation.mdx'),
    mistakes: () => import('@/content/topics/past-tenses/sections/mistakes.mdx'),
    decision: () => import('@/content/topics/past-tenses/sections/decision.mdx'),
    exercises: () => import('@/content/topics/past-tenses/sections/exercises.mdx'),
    quiz: () => import('@/content/topics/past-tenses/sections/quiz.mdx'),
    cheatsheet: () => import('@/content/topics/past-tenses/sections/cheatsheet.mdx'),
    plan: () => import('@/content/topics/past-tenses/sections/plan.mdx'),
  },
};

export function hasContent(slug: string): boolean {
  return slug in TOPIC_CONTENT;
}

export function sectionLoader(topicSlug: string, sectionSlug: string): ContentLoader | undefined {
  return SECTION_CONTENT[topicSlug]?.[sectionSlug];
}

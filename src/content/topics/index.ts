import type { ComponentType } from 'react';

/**
 * Реєстр контенту тем. Динамічний import з літеральним шляхом — тому MDX
 * потрапляє у збірку і не залежить від файлової системи в рантаймі
 * (важливо для standalone-образу на Cloud Run).
 *
 * Кожен розділ — окремий файл і окрема сторінка. Вигляд «усе одним полотном»
 * складається з тих самих файлів, тому другого джерела правди немає.
 */
type ContentLoader = () => Promise<{ default: ComponentType }>;

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
    history: () => import('@/content/topics/past-tenses/sections/history.mdx'),
    cheatsheet: () => import('@/content/topics/past-tenses/sections/cheatsheet.mdx'),
    plan: () => import('@/content/topics/past-tenses/sections/plan.mdx'),
  },
  'present-tenses': {
    idea: () => import('@/content/topics/present-tenses/sections/idea.mdx'),
    'present-simple': () => import('@/content/topics/present-tenses/sections/present-simple.mdx'),
    'present-continuous': () =>
      import('@/content/topics/present-tenses/sections/present-continuous.mdx'),
    'present-perfect': () => import('@/content/topics/present-tenses/sections/present-perfect.mdx'),
    'perfect-vs-past': () => import('@/content/topics/present-tenses/sections/perfect-vs-past.mdx'),
    markers: () => import('@/content/topics/present-tenses/sections/markers.mdx'),
    comparison: () => import('@/content/topics/present-tenses/sections/comparison.mdx'),
    future: () => import('@/content/topics/present-tenses/sections/future.mdx'),
    stories: () => import('@/content/topics/present-tenses/sections/stories.mdx'),
    translation: () => import('@/content/topics/present-tenses/sections/translation.mdx'),
    mistakes: () => import('@/content/topics/present-tenses/sections/mistakes.mdx'),
    decision: () => import('@/content/topics/present-tenses/sections/decision.mdx'),
    exercises: () => import('@/content/topics/present-tenses/sections/exercises.mdx'),
    quiz: () => import('@/content/topics/present-tenses/sections/quiz.mdx'),
    history: () => import('@/content/topics/present-tenses/sections/history.mdx'),
    cheatsheet: () => import('@/content/topics/present-tenses/sections/cheatsheet.mdx'),
    plan: () => import('@/content/topics/present-tenses/sections/plan.mdx'),
  },
  'future-tenses': {
    idea: () => import('@/content/topics/future-tenses/sections/idea.mdx'),
    will: () => import('@/content/topics/future-tenses/sections/will.mdx'),
    'going-to': () => import('@/content/topics/future-tenses/sections/going-to.mdx'),
    'will-vs-going-to': () =>
      import('@/content/topics/future-tenses/sections/will-vs-going-to.mdx'),
    'present-forms': () => import('@/content/topics/future-tenses/sections/present-forms.mdx'),
    'future-continuous': () =>
      import('@/content/topics/future-tenses/sections/future-continuous.mdx'),
    'future-perfect': () => import('@/content/topics/future-tenses/sections/future-perfect.mdx'),
    markers: () => import('@/content/topics/future-tenses/sections/markers.mdx'),
    comparison: () => import('@/content/topics/future-tenses/sections/comparison.mdx'),
    highlight: () => import('@/content/topics/future-tenses/sections/highlight.mdx'),
    stories: () => import('@/content/topics/future-tenses/sections/stories.mdx'),
    translation: () => import('@/content/topics/future-tenses/sections/translation.mdx'),
    mistakes: () => import('@/content/topics/future-tenses/sections/mistakes.mdx'),
    decision: () => import('@/content/topics/future-tenses/sections/decision.mdx'),
    exercises: () => import('@/content/topics/future-tenses/sections/exercises.mdx'),
    quiz: () => import('@/content/topics/future-tenses/sections/quiz.mdx'),
    history: () => import('@/content/topics/future-tenses/sections/history.mdx'),
    cheatsheet: () => import('@/content/topics/future-tenses/sections/cheatsheet.mdx'),
    plan: () => import('@/content/topics/future-tenses/sections/plan.mdx'),
  },
};

export function hasContent(slug: string): boolean {
  return slug in SECTION_CONTENT;
}

export function sectionLoader(topicSlug: string, sectionSlug: string): ContentLoader | undefined {
  return SECTION_CONTENT[topicSlug]?.[sectionSlug];
}

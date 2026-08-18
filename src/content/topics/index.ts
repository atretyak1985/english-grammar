import type { ComponentType } from 'react';

/**
 * Реєстр контенту тем. Динамічний import з літеральним шляхом — тому MDX
 * потрапляє у збірку і не залежить від файлової системи в рантаймі
 * (важливо для standalone-образу на Cloud Run).
 */
export const TOPIC_CONTENT: Record<string, () => Promise<{ default: ComponentType }>> = {
  'past-tenses': () => import('@/content/topics/past-tenses/index.mdx'),
};

export function hasContent(slug: string): boolean {
  return slug in TOPIC_CONTENT;
}

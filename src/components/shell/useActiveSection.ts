'use client';

import { usePathname } from 'next/navigation';

/**
 * Відкритий розділ теми. Тепер це просто URL, а не здогад по позиції скролу:
 * /topics/<тема>/<розділ>. Потрібно сайдбару, щоб підсвітити активний рядок.
 */
export function useActiveSection(): { topicSlug: string | null; sectionSlug: string | null } {
  const pathname = usePathname();
  const match = /^\/topics\/([^/]+)(?:\/([^/]+))?/.exec(pathname);

  const sectionSlug = match?.[2] ?? null;
  return {
    topicSlug: match?.[1] ?? null,
    // /all — це не розділ, а вигляд «усе одним полотном»
    sectionSlug: sectionSlug === 'all' ? null : sectionSlug,
  };
}

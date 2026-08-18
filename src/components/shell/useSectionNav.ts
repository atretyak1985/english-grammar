'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * Перехід до розділу теми. Клік прокручує до розділу і одночасно позначає його
 * прочитаним (CONCEPT 3.1). Якщо ви зараз на іншому екрані — застосунок спершу
 * перемикається на тему, потім прокручує (CONCEPT 3.3).
 */
export function useSectionNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { markSectionRead, setLastTopic } = useAppState();

  return useCallback(
    (slug: string, sectionId: string, options: { markRead?: boolean } = {}) => {
      if (options.markRead !== false) markSectionRead(slug, sectionId);
      setLastTopic(slug);

      const topicPath = `/topics/${slug}`;
      if (pathname === topicPath) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState(null, '', `${topicPath}#${sectionId}`);
        }
        return;
      }

      router.push(`${topicPath}#${sectionId}`);
    },
    [markSectionRead, pathname, router, setLastTopic],
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * Перехід до розділу теми. Кожен розділ — окрема сторінка, тому це справжня
 * навігація, а не скрол по одному полотну (CONCEPT 3.1). Позначку «прочитано»
 * ставить сама сторінка розділу, тут — лише перехід і остання відкрита тема.
 */
export function useSectionNav() {
  const router = useRouter();
  const { setLastTopic } = useAppState();

  return useCallback(
    (topicSlug: string, sectionSlug: string) => {
      setLastTopic(topicSlug);
      router.push(`/topics/${topicSlug}/${sectionSlug}`);
    },
    [router, setLastTopic],
  );
}

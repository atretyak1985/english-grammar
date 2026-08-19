'use client';

import { useEffect } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * Нічого не малює — лише фіксує факт відвідин: відкритий розділ стає
 * прочитаним (CONCEPT 6), а тема — останньою відкритою, щоб картка
 * «Продовжити» на головній знала, де ви зупинились (CONCEPT 2).
 */
export function TopicVisit({
  topicSlug,
  sectionId,
}: {
  topicSlug: string;
  /** id розділу; на сторінці змісту його немає */
  sectionId?: string;
}) {
  const { setLastTopic, markSectionRead } = useAppState();

  useEffect(() => setLastTopic(topicSlug), [setLastTopic, topicSlug]);

  useEffect(() => {
    if (sectionId) markSectionRead(topicSlug, sectionId);
  }, [markSectionRead, sectionId, topicSlug]);

  return null;
}

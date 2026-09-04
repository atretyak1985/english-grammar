'use client';

import { useEffect } from 'react';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * Нічого не малює — лише запамʼятовує останню відкриту тему, щоб картка
 * «Продовжити» на головній знала, де ви зупинились (CONCEPT 2).
 *
 * Прочитаним розділ тут більше не стає. Відкрита сторінка — це не вивчене
 * правило: автоматична галочка малювала прогрес із перегортання, і зміст
 * теми показував пройденим те, куди читач лише заглянув. Тепер позначку
 * ставить кнопка під текстом розділу (`SectionPager`).
 */
export function TopicVisit({ topicSlug }: { topicSlug: string }) {
  const { setLastTopic } = useAppState();

  useEffect(() => setLastTopic(topicSlug), [setLastTopic, topicSlug]);

  return null;
}

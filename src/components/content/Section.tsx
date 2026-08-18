'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { H2, TenseHead } from '@/components/content/blocks';
import { useActiveSection } from '@/components/shell/ActiveSectionProvider';
import type { TenseKey } from '@/types/content';

/**
 * Розділ теми. Дає якір для скролу з сайдбара і повідомляє оболонці,
 * що саме зараз на екрані.
 */
export function Section({
  id,
  n,
  title,
  tense,
  children,
}: {
  id: string;
  n: number;
  title: string;
  /** Якщо розділ присвячений одному часу — біля заголовка з'явиться кольорова точка */
  tense?: TenseKey;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { setActiveId } = useActiveSection();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(id);
        }
      },
      // Активним вважаємо розділ, чия верхівка щойно пройшла під липкою шапкою.
      { rootMargin: '-110px 0px -65% 0px', threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [id, setActiveId]);

  const heading = `${n}. ${title}`;

  return (
    <section ref={ref} id={id} className="scroll-mt-28 pt-12 pb-2">
      {tense ? <TenseHead t={tense}>{heading}</TenseHead> : <H2>{heading}</H2>}
      {children}
    </section>
  );
}

import type { ReactNode } from 'react';

import { H2, TenseHead } from '@/components/content/blocks';
import type { TenseKey } from '@/types/content';

/**
 * Розділ теми. На своїй сторінці він єдиний, а у вигляді «все одним полотном»
 * лишається якорем — тому id зберігається.
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
  const heading = `${n}. ${title}`;

  return (
    <section id={id} className="scroll-mt-[78px] pt-[26px] pb-3.5">
      {tense ? <TenseHead t={tense}>{heading}</TenseHead> : <H2>{heading}</H2>}
      {children}
    </section>
  );
}

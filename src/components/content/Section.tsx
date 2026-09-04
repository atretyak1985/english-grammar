import type { ReactNode } from 'react';

import { H2, SectionKicker } from '@/components/content/blocks';
import { SectionTotal } from '@/components/topic/SectionRef';
import type { TenseKey } from '@/types/content';

/**
 * Розділ теми. На своїй сторінці він єдиний, а у вигляді «все одним полотном»
 * лишається якорем — тому id зберігається.
 *
 * Номер розділу пішов із заголовка в кікер над ним: у заголовку він
 * конкурував із назвою за перший погляд, хоча відповідає на інше питання —
 * не «про що це», а «де я в темі». Колір кікера бере час розділу там, де
 * розділ присвячений одному часу.
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
  /** Якщо розділ присвячений одному часу — кікер бере його колір */
  tense?: TenseKey;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[96px] pt-[26px] pb-3.5">
      <SectionKicker tense={tense}>
        Розділ {n}
        <SectionTotal />
      </SectionKicker>
      <H2>{title}</H2>
      {children}
    </section>
  );
}

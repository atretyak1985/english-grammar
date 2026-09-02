'use client';

import Link from 'next/link';
import { createContext, useContext, type ReactNode } from 'react';

import type { TopicSection } from '@/types/content';

/**
 * Куди веде «розділ N» у тексті теми, знає лише сторінка, що цей текст
 * рендерить: на сторінці розділу це URL сусіднього розділу, у вигляді
 * «все одним полотном» — якір на цій самій сторінці. Самому MDX цього
 * знати не треба, тому адресація живе в контексті, а в тексті лишається
 * тільки номер: <SecRef n={8} />.
 */
interface SectionRefTarget {
  topicSlug: string;
  sections: TopicSection[];
  /** Усі розділи на одній сторінці — лінкувати якорем, а не URL-ом */
  anchors?: boolean;
}

const SectionRefContext = createContext<SectionRefTarget | null>(null);

export function SectionRefProvider({
  topicSlug,
  sections,
  anchors,
  children,
}: SectionRefTarget & { children: ReactNode }) {
  return (
    <SectionRefContext.Provider value={{ topicSlug, sections, anchors }}>
      {children}
    </SectionRefContext.Provider>
  );
}

/**
 * Посилання «розділ N» усередині тексту теми. Без children пише «розділ N»
 * сам; children потрібні відмінюваним формам («розділі 5», «5») — текст
 * лишається авторським, компонент дає лише адресу.
 *
 * Поза провайдером або з номером, якого в темі немає, віддає просто текст:
 * зламана згадка не має ламати сторінку, а помітити її нескладно — вона
 * єдина не буде клікабельною.
 */
export function SecRef({ n, children }: { n: number; children?: ReactNode }) {
  const ctx = useContext(SectionRefContext);
  const target = ctx?.sections.find((section) => section.n === n);
  const text = children ?? `розділ ${n}`;

  if (!ctx || !target) return <>{text}</>;

  const href = ctx.anchors ? `#${target.id}` : `/topics/${ctx.topicSlug}/${target.slug}`;
  return (
    <Link
      href={href}
      title={target.title}
      className="text-acc decoration-acc/40 hover:decoration-acc font-semibold underline decoration-[1.5px] underline-offset-2"
    >
      {text}
    </Link>
  );
}

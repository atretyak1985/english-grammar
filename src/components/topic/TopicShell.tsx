import type { ReactNode } from 'react';

/**
 * Каркас сторінки теми: одна центрована колонка тексту.
 *
 * Зміст-сайдбар прибрано свідомо: список розділів живе на вході в тему
 * (картками), «де я?» відповідають хлібні крихти над текстом, а «куди далі?» —
 * кнопки під ним (`SectionPager`). Колонка при цьому не розтягується на весь
 * `--container-shell`: полотно розділу читають підряд, і мірка рядка важить
 * більше за ширину екрана.
 */
export function TopicShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[980px] px-9 py-8">{children}</div>;
}

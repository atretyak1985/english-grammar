'use client';

import { readLocalTheme, writeLocalTheme } from '@/lib/state/storage';
import type { Theme } from '@/types/state';

/**
 * Тема живе поза React: клас на `<html>` ставить bootstrap-скрипт ще до
 * першого рендера, а React лише читає це значення для перемикача.
 */
const listeners = new Set<() => void>();
let snapshot: Theme | null = null;

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Перше читання ліниве: на клієнті снапшот одразу справжній, без ефекту.
 * Без збереженого вибору тема СВІТЛА, а не системна: застосунок «паперовий»
 * за задумом, і темний перший екран у того, хто теми не обирав, читається як
 * поломка. Системну перевагу свідомо не питаємо — темна вмикається лише
 * перемикачем.
 */
export function getThemeSnapshot(): Theme {
  snapshot ??= readLocalTheme() ?? 'light';
  return snapshot;
}

export function getServerThemeSnapshot(): Theme {
  return 'light';
}

export function setTheme(next: Theme): void {
  snapshot = next;
  document.documentElement.classList.toggle('dark', next === 'dark');
  document.documentElement.style.colorScheme = next;
  writeLocalTheme(next);
  for (const listener of listeners) listener();
}

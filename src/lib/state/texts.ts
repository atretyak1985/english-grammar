'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { useHydrated } from '@/lib/state/hydrated';

/**
 * Бібліотека проаналізованих текстів. Поки локальна — саме з неї словник
 * будує спільний частотний список. Схема в базі вже є, тому перенесення
 * на акаунт не змінює цей інтерфейс (CONCEPT 9, пункт 2).
 *
 * Сховище одне на застосунок: текст, доданий в аналізаторі, одразу видно
 * і в словнику, і в кабінеті.
 */
const TEXTS_KEY = 'eg.texts.v1';

export interface SavedText {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

const EMPTY_TEXTS: SavedText[] = [];
const listeners = new Set<() => void>();
let snapshot: SavedText[] | null = null;

function read(): SavedText[] {
  try {
    const raw = window.localStorage.getItem(TEXTS_KEY);
    if (!raw) return EMPTY_TEXTS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_TEXTS;
    return parsed.filter(
      (item): item is SavedText =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as SavedText).id === 'string' &&
        typeof (item as SavedText).body === 'string',
    );
  } catch {
    return EMPTY_TEXTS;
  }
}

function write(texts: SavedText[]): void {
  try {
    window.localStorage.setItem(TEXTS_KEY, JSON.stringify(texts));
  } catch {
    // сховище недоступне — бібліотека просто не збережеться
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SavedText[] {
  snapshot ??= read();
  return snapshot;
}

function getServerSnapshot(): SavedText[] {
  return EMPTY_TEXTS;
}

function commit(next: SavedText[]): void {
  snapshot = next;
  write(next);
  for (const listener of listeners) listener();
}

export function useTexts() {
  const texts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useHydrated();

  const addText = useCallback((title: string, body: string) => {
    commit([
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Без назви',
        body,
        createdAt: new Date().toISOString(),
      },
      ...getSnapshot(),
    ]);
  }, []);

  const removeText = useCallback((id: string) => {
    commit(getSnapshot().filter((text) => text.id !== id));
  }, []);

  return { texts, ready, addText, removeText };
}

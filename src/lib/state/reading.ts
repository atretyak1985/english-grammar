'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Що саме читає користувач в аналізаторі і на якому місці зупинився.
 *
 * Окремо від бібліотеки (`texts.ts`): та тримає список збережених текстів, а
 * тут одна поточна позиція, і вона мусить переживати перехід на іншу сторінку
 * застосунку — інакше завантажена книжка губиться на першому ж кліку.
 *
 * Два ключі, а не один, свідомо: документ змінюється рідко, а позиція — на
 * кожен перегорнутий аркуш, і тягати тіло книжки на кожне гортання дорого.
 */
const DOC_KEY = 'eg.reading.v1';
const POS_KEY = 'eg.reading.pos.v1';

/** Скільком текстам пам'ятаємо місце. Старіші витісняються за порядком додавання. */
const POS_LIMIT = 30;

export interface ReadingDoc {
  /** Ідентифікатор у бібліотеці — якщо текст звідти. */
  id: string | null;
  title: string | null;
  /** Тіло лежить тут лише для незбереженого тексту: у збереженого воно в бібліотеці. */
  body: string | null;
}

export interface ReadingPosition {
  /** Номер токена, з якого починається видима сторінка. */
  anchor: number;
  /** Початки відвіданих сторінок — з них виводяться «назад» і номер сторінки. */
  trail: number[];
}

export const NO_DOC: ReadingDoc = { id: null, title: null, body: null };
export const PAGE_ONE: ReadingPosition = { anchor: 0, trail: [] };

const NO_POSITIONS: Record<string, ReadingPosition> = {};

/**
 * Сховище на одному ключі localStorage. Знімок один на застосунок, тому
 * аналізатор і кабінет бачать те саме без передавання пропсів.
 */
function createStore<T>(key: string, empty: T, revive: (raw: unknown) => T | null) {
  const listeners = new Set<() => void>();
  let snapshot: T | null = null;

  function read(): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return empty;
      return revive(JSON.parse(raw)) ?? empty;
    } catch {
      return empty;
    }
  }

  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot(): T {
      snapshot ??= read();
      return snapshot;
    },
    /** На сервері читати нічого: перший кадр однаковий для всіх. */
    getServerSnapshot(): T {
      return empty;
    },
    commit(next: T): void {
      snapshot = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // сховище недоступне — позиція просто не переживе перезавантаження
      }
      for (const listener of listeners) listener();
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

const docStore = createStore<ReadingDoc>(DOC_KEY, NO_DOC, (raw) => {
  if (!isRecord(raw)) return null;
  return {
    id: nullableString(raw.id),
    title: nullableString(raw.title),
    body: nullableString(raw.body),
  };
});

const posStore = createStore<Record<string, ReadingPosition>>(POS_KEY, NO_POSITIONS, (raw) => {
  if (!isRecord(raw)) return null;
  const clean: Record<string, ReadingPosition> = {};
  for (const [docKey, value] of Object.entries(raw)) {
    if (!isRecord(value) || typeof value.anchor !== 'number' || value.anchor < 0) continue;
    const trail = Array.isArray(value.trail)
      ? value.trail.filter((item): item is number => typeof item === 'number' && item >= 0)
      : [];
    clean[docKey] = { anchor: value.anchor, trail };
  }
  return clean;
});

/**
 * Чим розрізняємо тексти в мапі позицій. Збережений має ідентифікатор;
 * незбереженому за нього править довжина — цього досить, щоб не відкрити
 * вставлений текст на місці попереднього.
 */
export function docKeyOf(doc: ReadingDoc): string {
  if (doc.id) return doc.id;
  if (doc.body) return `local:${doc.body.length}`;
  return 'demo';
}

export function useReading() {
  const doc = useSyncExternalStore(
    docStore.subscribe,
    docStore.getSnapshot,
    docStore.getServerSnapshot,
  );
  const positions = useSyncExternalStore(
    posStore.subscribe,
    posStore.getSnapshot,
    posStore.getServerSnapshot,
  );

  /** Відкрити текст із бібліотеки: тіло не дублюємо, беремо звідти за потреби. */
  const openSaved = useCallback((id: string, title: string) => {
    docStore.commit({ id, title, body: null });
  }, []);

  /** Показати текст, якого в бібліотеці ще немає — вставлений або розпізнаний з файлу. */
  const openLoose = useCallback((body: string, title: string | null) => {
    docStore.commit({ id: null, title, body });
  }, []);

  /** Повернути демо-текст: власного документа немає, аналізатор покаже вбудований. */
  const openDemo = useCallback(() => {
    docStore.commit(NO_DOC);
  }, []);

  const setPosition = useCallback((docKey: string, position: ReadingPosition) => {
    const next = { ...posStore.getSnapshot() };
    // Перевставляння рухає ключ у кінець: порядок ключів = порядок звертання,
    // тому витісняється саме той текст, до якого не поверталися найдовше.
    delete next[docKey];
    next[docKey] = position;
    const keys = Object.keys(next);
    for (const stale of keys.slice(0, Math.max(0, keys.length - POS_LIMIT))) delete next[stale];
    posStore.commit(next);
  }, []);

  return { doc, positions, openSaved, openLoose, openDemo, setPosition };
}

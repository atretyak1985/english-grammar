'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { useHydrated } from '@/lib/state/hydrated';
import { NOTE_MAX } from '@/lib/state/storage';
import {
  getServerStateSnapshot,
  getStateSnapshot,
  mutateState,
  subscribeState,
} from '@/lib/state/store';
import {
  mergeState,
  type QuizAttempt,
  type UserState,
  type WordStatus,
} from '@/types/state';

/**
 * Цикл по кліку в тексті — лише три щаблі. Через «приховане» читача водити не
 * можна: приховування прибирає слово зі списку, і випадковий клік не має
 * робити цього непомітно.
 */
const STATUS_CYCLE: WordStatus[] = ['unknown', 'learning', 'known'];

interface AppStateContextValue {
  state: UserState;
  /** false до того, як прочитано localStorage — щоб не блимати нулями */
  ready: boolean;
  signedIn: boolean;
  syncing: boolean;
  isSectionRead: (slug: string, sectionId: string) => boolean;
  readCount: (slug: string) => number;
  markSectionRead: (slug: string, sectionId: string) => void;
  toggleSectionRead: (slug: string, sectionId: string) => void;
  resetProgress: (slug: string) => void;
  wordStatus: (word: string) => WordStatus;
  setWordStatus: (word: string, status: WordStatus) => void;
  cycleWordStatus: (word: string) => void;
  /** Прибрати слово з поля зору: окрема назва тримає намір у типі */
  hideWord: (word: string) => void;
  unhideWord: (word: string) => void;
  note: (word: string) => string;
  setNote: (word: string, text: string) => void;
  setLastTopic: (slug: string) => void;
  addAttempt: (attempt: QuizAttempt) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({
  children,
  signedIn = false,
  serverState = null,
}: {
  children: ReactNode;
  /** Чи є сеанс. Передається з серверного layout. */
  signedIn?: boolean;
  /** Стан з акаунта — зливається з локальним, а не перезаписує його (CONCEPT 8.1). */
  serverState?: UserState | null;
}) {
  const state = useSyncExternalStore(subscribeState, getStateSnapshot, getServerStateSnapshot);
  const ready = useHydrated();
  const [syncing, setSyncing] = useState(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const merged = useRef(false);

  const push = useCallback(
    (next: UserState) => {
      if (!signedIn) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        setSyncing(true);
        void fetch('/api/state', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(next),
        })
          .catch(() => undefined)
          .finally(() => setSyncing(false));
      }, 800);
    },
    [signedIn],
  );

  // Один раз після входу: локальний стан зливається з акаунтом, а не перезаписується
  // ним (CONCEPT 8.1). До входу снапшот уже прочитаний зі сховища.
  useEffect(() => {
    if (!serverState || merged.current) return;
    merged.current = true;
    const next = mutateState((local) => mergeState(serverState, local));
    if (JSON.stringify(next) !== JSON.stringify(serverState)) push(next);
  }, [serverState, push]);

  const update = useCallback(
    (mutate: (current: UserState) => UserState) => {
      const before = getStateSnapshot();
      const next = mutateState(mutate);
      if (next !== before) push(next);
    },
    [push],
  );

  const value = useMemo<AppStateContextValue>(() => {
    const sectionsOf = (slug: string) => state.readSections[slug] ?? [];

    return {
      state,
      ready,
      signedIn,
      syncing,

      isSectionRead: (slug, sectionId) => sectionsOf(slug).includes(sectionId),
      readCount: (slug) => sectionsOf(slug).length,

      markSectionRead: (slug, sectionId) =>
        update((current) => {
          const read = current.readSections[slug] ?? [];
          if (read.includes(sectionId)) return current;
          return {
            ...current,
            readSections: { ...current.readSections, [slug]: [...read, sectionId] },
          };
        }),

      toggleSectionRead: (slug, sectionId) =>
        update((current) => {
          const read = current.readSections[slug] ?? [];
          const next = read.includes(sectionId)
            ? read.filter((id) => id !== sectionId)
            : [...read, sectionId];
          return { ...current, readSections: { ...current.readSections, [slug]: next } };
        }),

      resetProgress: (slug) =>
        update((current) => ({
          ...current,
          readSections: { ...current.readSections, [slug]: [] },
        })),

      wordStatus: (word) => state.words[word.toLowerCase()] ?? 'unknown',

      setWordStatus: (word, status) =>
        update((current) => ({
          ...current,
          words: { ...current.words, [word.toLowerCase()]: status },
        })),

      hideWord: (word) =>
        update((current) => ({
          ...current,
          words: { ...current.words, [word.toLowerCase()]: 'hidden' },
        })),

      unhideWord: (word) =>
        update((current) => {
          const words = { ...current.words };
          delete words[word.toLowerCase()];
          return { ...current, words };
        }),

      note: (word) => state.notes[word.toLowerCase()] ?? '',

      setNote: (word, text) =>
        update((current) => {
          const key = word.toLowerCase();
          const notes = { ...current.notes };
          const trimmed = text.trim().slice(0, NOTE_MAX);
          if (trimmed) notes[key] = trimmed;
          else delete notes[key];
          return { ...current, notes };
        }),

      cycleWordStatus: (word) =>
        update((current) => {
          const key = word.toLowerCase();
          const currentStatus = current.words[key] ?? 'unknown';
          const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
          const nextStatus = STATUS_CYCLE[nextIndex] ?? 'unknown';
          return { ...current, words: { ...current.words, [key]: nextStatus } };
        }),

      setLastTopic: (slug) =>
        update((current) => (current.lastTopic === slug ? current : { ...current, lastTopic: slug })),

      addAttempt: (attempt) =>
        update((current) => ({ ...current, attempts: [...current.attempts, attempt] })),
    };
  }, [state, ready, signedIn, syncing, update]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState треба викликати всередині AppStateProvider');
  return context;
}

/** Прогрес однієї теми — те число, що живить кільце, смужку і підпис «N / 14». */
export function useTopicProgress(slug: string, total: number) {
  const { readCount, ready } = useAppState();
  const read = readCount(slug);
  return {
    read,
    total,
    percent: total === 0 ? 0 : Math.round((read / total) * 100),
    ready,
  };
}

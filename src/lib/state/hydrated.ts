'use client';

import { useSyncExternalStore } from 'react';

/**
 * `false` під час рендера на сервері й гідратації, `true` після неї.
 * Потрібне, щоб не блимати нулями до першого читання localStorage (CONCEPT 7).
 */
const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

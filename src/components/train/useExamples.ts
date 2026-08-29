'use client';

import { useEffect, useMemo, useState } from 'react';

import { type ExampleSource, type WordExample, findExamples } from '@/lib/drills/examples';

/**
 * Приклади ужитку для карток: спершу з текстів, збережених у цьому браузері
 * (шукаються тут же, без мережі), потім — з оповідань бібліотеки одним
 * запитом. Локальний приклад перемагає: це текст, який людина принесла сама.
 */
export function useExamples(
  words: readonly string[],
  sources: readonly ExampleSource[],
): Record<string, WordExample> {
  const local = useMemo(() => findExamples(sources, words), [sources, words]);
  const [remote, setRemote] = useState<Record<string, WordExample>>({});

  const missing = useMemo(
    () => words.filter((word) => local[word] === undefined),
    [words, local],
  );
  const key = missing.join('\n');

  useEffect(() => {
    if (key.length === 0) return;
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch('/api/library/examples', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ words: key.split('\n') }),
        });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        const examples =
          typeof payload === 'object' && payload !== null
            ? (payload as { examples?: unknown }).examples
            : undefined;
        if (!cancelled && typeof examples === 'object' && examples !== null) {
          setRemote((current) => ({ ...current, ...(examples as Record<string, WordExample>) }));
        }
      } catch {
        // без мережі картка лишається без прикладу — це не помилка вправи
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return useMemo(() => ({ ...remote, ...local }), [remote, local]);
}

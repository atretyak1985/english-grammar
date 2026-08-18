'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Який розділ теми зараз на екрані. Потрібно двом місцям одночасно:
 * сайдбар підсвічує активний рядок, права колонка теми пропонує
 * позначити саме цей розділ прочитаним.
 */
interface ActiveSectionContextValue {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const ActiveSectionContext = createContext<ActiveSectionContextValue | null>(null);

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const setActiveId = useCallback((id: string | null) => setActiveIdState(id), []);
  const value = useMemo(() => ({ activeId, setActiveId }), [activeId, setActiveId]);

  return <ActiveSectionContext.Provider value={value}>{children}</ActiveSectionContext.Provider>;
}

export function useActiveSection(): ActiveSectionContextValue {
  const context = useContext(ActiveSectionContext);
  if (!context) throw new Error('useActiveSection треба викликати всередині ActiveSectionProvider');
  return context;
}

import { EMPTY_STATE, type Theme, type UserState } from '@/types/state';

/**
 * Локальне сховище. Анонімний користувач працює тільки тут (CONCEPT 7):
 * ніякого сервера, ніякої реєстрації.
 */
const STATE_KEY = 'eg.state.v1';
const THEME_KEY = 'eg.theme.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Читає стан, прощаючи будь-яке пошкодження даних: краще порожньо, ніж падіння. */
export function readLocalState(): UserState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY_STATE;
    return {
      readSections: isRecord(parsed.readSections)
        ? (parsed.readSections as UserState['readSections'])
        : {},
      words: isRecord(parsed.words) ? (parsed.words as UserState['words']) : {},
      lastTopic: typeof parsed.lastTopic === 'string' ? parsed.lastTopic : null,
      attempts: Array.isArray(parsed.attempts) ? (parsed.attempts as UserState['attempts']) : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function writeLocalState(state: UserState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // приватний режим або переповнене сховище — застосунок мусить працювати далі
  }
}

export function readLocalTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : null;
}

export function writeLocalTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // те саме: тема не критична для роботи
  }
}

/**
 * Скрипт, який ставить клас теми ДО першого рендера — інакше при завантаженні
 * в темній темі блимає світлий фон.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
(function(){try{
  var t=localStorage.getItem('${THEME_KEY}');
  if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  if(t==='dark'){document.documentElement.classList.add('dark');}
  document.documentElement.style.colorScheme=t;
}catch(e){}})();
`.trim();

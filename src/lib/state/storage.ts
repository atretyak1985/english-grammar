import { EMPTY_STATE, WORD_STATUS_RANK, type Theme, type UserState, type WordStatus } from '@/types/state';

/**
 * Локальне сховище. Анонімний користувач працює тільки тут (CONCEPT 7):
 * ніякого сервера, ніякої реєстрації.
 */
const STATE_KEY = 'eg.state.v1';
const THEME_KEY = 'eg.theme.v1';

/** Нотатка — рядок, а не текст: довші записи місце словника не для того. */
export const NOTE_MAX = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Читає стан, прощаючи будь-яке пошкодження даних: краще порожньо, ніж падіння.
 *
 * Значення статусів і нотаток фільтруються по одному, а не кастяться блоком.
 * Саме це робить безпечним відкат на попередню версію застосунку: старий код
 * побачить невідомий йому статус і просто його відкине, замість зберегти в
 * стані щось, чого не вміє показати. Через це версію ключа не потрібно бити.
 */
export function readLocalState(): UserState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY_STATE;

    const words: Record<string, WordStatus> = {};
    if (isRecord(parsed.words)) {
      for (const [word, status] of Object.entries(parsed.words)) {
        if (typeof status === 'string' && status in WORD_STATUS_RANK) {
          words[word.toLowerCase()] = status as WordStatus;
        }
      }
    }

    const notes: Record<string, string> = {};
    if (isRecord(parsed.notes)) {
      for (const [word, note] of Object.entries(parsed.notes)) {
        if (typeof note !== 'string') continue;
        // Те саме правило, що в `parseUserState`: задовга нотатка відкидається,
        // а не обрізається. Дві різні поведінки на клієнті й сервері дали б
        // нотатку, яка «є» до перезавантаження сторінки й зникає після нього.
        const text = note.trim();
        if (text.length > 0 && text.length <= NOTE_MAX) notes[word.toLowerCase()] = text;
      }
    }

    return {
      readSections: isRecord(parsed.readSections)
        ? (parsed.readSections as UserState['readSections'])
        : {},
      words,
      notes,
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

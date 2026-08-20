/**
 * Обмеження звернень до Claude. На відміну від словникового троттлінга, мета
 * тут не ввічливість до чужого API, а рахунок: кожен промах кешу — це платний
 * виклик, і відкрита ручка без стелі означає відкритий гаманець.
 *
 * Рахуються тільки ПРОМАХИ: повторне відкриття вже розібраного тексту нікуди не
 * ходить і нічого не коштує, тож карати за нього нема за що.
 */

export const WINDOW_MS = 60 * 1000;
/** Приблизно стільки сторінок за хвилину з однієї адреси — це вже не читання. */
export const CALLS_PER_WINDOW = 10;

interface CallWindow {
  calls: number;
  openedAt: number;
}

const windows = new Map<string, CallWindow>();

/**
 * Дозвіл на один платний виклик. `false` — ліміт вичерпано; нічого при цьому
 * не списується, щоб відмова не подовжувала покарання.
 */
export function reserveCall(ip: string): boolean {
  const now = Date.now();
  const current = windows.get(ip);
  const open = current !== undefined && now - current.openedAt < WINDOW_MS ? current : { calls: 0, openedAt: now };

  if (open.calls + 1 > CALLS_PER_WINDOW) {
    windows.set(ip, open);
    return false;
  }

  open.calls += 1;
  windows.set(ip, open);
  forgetExpired(now);
  return true;
}

/** Без прибирання мапа росла б з кожною новою адресою до кінця життя процесу. */
function forgetExpired(now: number): void {
  for (const [ip, window] of windows) {
    if (now - window.openedAt >= WINDOW_MS) windows.delete(ip);
  }
}

/** Тільки для тестів: вікна живуть довше за окремий тест. */
export function clearWindows(): void {
  windows.clear();
}

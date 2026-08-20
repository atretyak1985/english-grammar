/**
 * Обмеження звернень до Вікісловника. Мета не в захисті нашого сервера, а в
 * тому, щоб не стати абюзером чужого безкоштовного API: Wikimedia блокує IP
 * без попередження.
 *
 * Рахуються тільки ПРОМАХИ кешу — попадання нікуди не ходять, і карати за них
 * читача, який гортає той самий текст, нема за що.
 */

/** Вікно і ліміт промахів у ньому на одну адресу. */
export const WINDOW_MS = 60 * 1000;
export const MISSES_PER_WINDOW = 60;

interface MissWindow {
  /** Скільки промахів уже витрачено у поточному вікні. */
  misses: number;
  /** Коли вікно відкрилося. */
  openedAt: number;
}

const windows = new Map<string, MissWindow>();

/**
 * Адреса клієнта. За проксі справжня адреса приходить у `x-forwarded-for`
 * першою в списку; без заголовка всі анонімні запити зливаються в одне вікно —
 * це суворіше, ніж треба, і саме такий напрямок помилки тут безпечний.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first !== undefined && first.length > 0 ? first : 'unknown';
}

/**
 * Записує `count` промахів на адресу. `false` — ліміт вичерпано, і запит має
 * піти назад з 429; нічого при цьому не списується, щоб відмова не подовжувала
 * покарання.
 */
export function reserveMisses(ip: string, count: number): boolean {
  if (count <= 0) return true;

  const now = Date.now();
  const current = windows.get(ip);
  const open = current !== undefined && now - current.openedAt < WINDOW_MS ? current : { misses: 0, openedAt: now };

  if (open.misses + count > MISSES_PER_WINDOW) {
    windows.set(ip, open);
    return false;
  }

  open.misses += count;
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

/**
 * Глобальний семафор на зовнішні операції: одна за раз. Паралельні батчі —
 * найшвидший спосіб отримати 429 від Wikimedia, тому запити стають у чергу,
 * а не змагаються.
 */
let tail: Promise<unknown> = Promise.resolve();

export function withExternalLock<T>(task: () => Promise<T>): Promise<T> {
  const run = tail.then(task, task);
  // Хвіст черги не має права зламатися через чужу помилку, інакше наступний
  // виклик відхилиться раніше, ніж почнеться.
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

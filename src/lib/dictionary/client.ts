'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { type DictionaryEntry } from '@/lib/dictionary/types';

/**
 * Клієнтський шар словника: мʼякий кеш у localStorage + батчер запитів.
 * Екранам віддається один інтерфейс — `useDictionary()`, — тому вони не знають
 * ні про `fetch`, ні про TTL, ні про те, що на слово може не бути статті.
 *
 * Ключ окремий від ключа користувацького стану навмисно. Словникові статті — не
 * користувацький стан: їх не зливають з акаунтом, не відправляють на сервер і
 * можна викинути без будь-яких втрат для користувача. Спільний ключ означав би,
 * що переповнений або зіпсований словниковий кеш тягне за собою прогрес
 * читання; окремий ключ із власним TTL і власним витісненням такої нагоди не
 * дає.
 */
const DICT_KEY = 'eg.dict.v1';

/** Коротший за серверні 90 днів: клієнт має першим піти по свіжу статтю. */
const SOFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Стеля записів у сховищі; понад неї витісняється найстаріше за `at`. */
const MAX_ENTRIES = 800;

/** Скільки найстаріших записів викидати, коли сховище переповнилося. */
const QUOTA_TRIM_SHARE = 0.25;

/**
 * Вікно збирання слів. Аналізатор монтує 20 рядків одним рендером, і без вікна
 * вийшло б 20 окремих `POST /api/dictionary`; з вікном — один запит на 20 слів,
 * тобто рівно один зовнішній батч (сервер бере 25 слів за раз).
 */
const BATCH_WINDOW_MS = 40;

/** Стеля POST-ручки: більше слів вона мовчки відкидає, тому ріжемо самі. */
const MAX_WORDS_PER_REQUEST = 50;

/** Те саме, що перевіряє сервер: інші токени статей не мають. */
const WORD_PATTERN = /^[a-z'-]+$/;
const MAX_WORD_LENGTH = 64;

/** Коротка форма статті — рівно те, що видно в рядку таблиці слів. */
export interface CachedBrief {
  word: string;
  lemma: string;
  ipa: string | null;
  /** українські переклади, до MAX_TRANSLATIONS */
  /** `definitions[0]`, обрізане ручкою до 160 символів — те, що видно в рядку /words */
  definition: string | null;
  /** ms, для TTL і для витіснення найстарішого */
  at: number;
  /** true — джерело статті не має; не питати знову до кінця TTL */
  miss?: true;
}

interface DictSnapshot {
  entries: Map<string, CachedBrief>;
  /** скільки запитів у польоті — з нього хук робить `loading` */
  inFlight: number;
}

const EMPTY_SNAPSHOT: DictSnapshot = { entries: new Map(), inFlight: 0 };
const listeners = new Set<() => void>();
let snapshot: DictSnapshot | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Нормалізує слово так само, як ручка, щоб не ставити в чергу те, що сервер відкине. */
function normalizeWord(raw: string): string | null {
  const word = raw.trim().toLowerCase();
  if (word.length === 0 || word.length > MAX_WORD_LENGTH) return null;
  return WORD_PATTERN.test(word) ? word : null;
}

/** Один запис зі сховища. Будь-яке пошкодження → `null`, тобто «запису немає». */
function toCached(word: string, value: unknown): CachedBrief | null {
  if (!isRecord(value)) return null;
  const at = value.at;
  if (typeof at !== 'number' || !Number.isFinite(at)) return null;
  if (value.miss === true) {
    return { word, lemma: word, ipa: null, definition: null, at, miss: true };
  }
  if (typeof value.lemma !== 'string') return null;
  return {
    word,
    lemma: value.lemma,
    ipa: typeof value.ipa === 'string' ? value.ipa : null,
    definition: typeof value.definition === 'string' ? value.definition : null,
    at,
  };
}

/**
 * Читає кеш, прощаючи будь-яке пошкодження — та сама конвенція, що в
 * `readLocalState`: краще порожньо, ніж падіння екрана через чужий зіпсований
 * JSON. Протерміноване не читається взагалі, тому TTL не треба перевіряти двічі.
 */
function read(): Map<string, CachedBrief> {
  const entries = new Map<string, CachedBrief>();
  if (typeof window === 'undefined') return entries;
  try {
    const raw = window.localStorage.getItem(DICT_KEY);
    if (!raw) return entries;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return entries;
    const now = Date.now();
    for (const [word, value] of Object.entries(parsed)) {
      const cached = toCached(word, value);
      if (cached === null) continue;
      if (now - cached.at > SOFT_TTL_MS) continue;
      entries.set(word, cached);
    }
    return entries;
  } catch {
    return new Map();
  }
}

/** Викидає `count` найстаріших записів за `at`. */
function dropOldest(entries: Map<string, CachedBrief>, count: number): Map<string, CachedBrief> {
  if (count <= 0) return entries;
  const byAge = [...entries.values()].sort((a, b) => a.at - b.at);
  const doomed = new Set(byAge.slice(0, count).map((entry) => entry.word));
  const kept = new Map<string, CachedBrief>();
  for (const [word, entry] of entries) if (!doomed.has(word)) kept.set(word, entry);
  return kept;
}

function capEntries(entries: Map<string, CachedBrief>): Map<string, CachedBrief> {
  return entries.size <= MAX_ENTRIES ? entries : dropOldest(entries, entries.size - MAX_ENTRIES);
}

function serialize(entries: Map<string, CachedBrief>): string {
  return JSON.stringify(Object.fromEntries(entries));
}

function isQuotaExceeded(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED';
}

/**
 * Пише кеш і повертає набір, який РЕАЛЬНО ліг у сховище — обрізаний набір
 * мусить стати й снапшотом у памʼяті, інакше наступний запис знову впреться.
 *
 * `writeLocalState` і `write` у `texts.ts` просто ковтають виняток, і для них це
 * правильно: там один невеликий запис, який наступного разу перезапишеться. Для
 * кеша на 800 записів «ковтнути» означало б, що після першого переповнення він
 * перестає працювати назавжди — жоден запис більше ніколи не пройде. Тому:
 * викинути найстаріші 25% і спробувати ще раз, і лише потім здатися.
 */
function persist(entries: Map<string, CachedBrief>): Map<string, CachedBrief> {
  const capped = capEntries(entries);
  if (typeof window === 'undefined') return capped;
  try {
    window.localStorage.setItem(DICT_KEY, serialize(capped));
    return capped;
  } catch (error) {
    if (!isQuotaExceeded(error)) return capped; // приватний режим — живемо в памʼяті
    const smaller = dropOldest(capped, Math.ceil(capped.size * QUOTA_TRIM_SHARE));
    // Обрізання до порожнього означало б викинути щойно завантажене слово й
    // піти по нього знову — тоді краще взагалі не писати і жити в памʼяті.
    if (smaller.size === 0) return capped;
    try {
      window.localStorage.setItem(DICT_KEY, serialize(smaller));
      return smaller;
    } catch {
      // Сховище не приймає навіть обрізане — воно просто вимкнене (приватний
      // режим Safari теж кидає QuotaExceededError). Тоді памʼять лишає собі ВСЕ
      // знайдене: обрізати кеш, який нікуди не пишеться, означало б забувати
      // щойно завантажені слова і питати їх по колу.
      return capped;
    }
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): DictSnapshot {
  snapshot ??= { entries: read(), inFlight: 0 };
  return snapshot;
}

function getServerSnapshot(): DictSnapshot {
  return EMPTY_SNAPSHOT;
}

function publish(entries: Map<string, CachedBrief>, inFlight: number): void {
  snapshot = { entries, inFlight };
  for (const listener of listeners) listener();
}

function commitEntries(next: Map<string, CachedBrief>): void {
  publish(persist(next), getSnapshot().inFlight);
}

function commitLoading(delta: number): void {
  const current = getSnapshot();
  publish(current.entries, Math.max(0, current.inFlight + delta));
}

/**
 * Коротка стаття про слово: `undefined` — ще не знаємо, `null` — джерело статті
 * не має, обʼєкт — стаття. Протерміноване вважається невідомим, щоб слово знову
 * пішло в чергу.
 *
 * Набір записів передається аргументом, а не береться з модуля: хук читає його
 * зі снапшота useSyncExternalStore, і саме снапшот має бути залежністю memo.
 */
function resolve(
  entries: Map<string, CachedBrief>,
  word: string,
): CachedBrief | null | undefined {
  const key = normalizeWord(word);
  if (key === null) return undefined;
  const cached = entries.get(key);
  if (cached === undefined) return undefined;
  if (Date.now() - cached.at > SOFT_TTL_MS) return undefined;
  return cached.miss === true ? null : cached;
}

export function lookupBrief(word: string): CachedBrief | null | undefined {
  return resolve(getSnapshot().entries, word);
}

/** Слова, що чекають на вікно, і слова, які вже полетіли. */
const pending = new Set<string>();
const inFlight = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function requestChunk(words: string[]): Promise<void> {
  for (const word of words) inFlight.add(word);
  commitLoading(1);
  try {
    const response = await fetch('/api/dictionary', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ words }),
    });
    // 429 і 5xx — це не «слова немає», а «зараз не вийшло»: нічого не пишемо,
    // інакше тимчасовий збій застряг би в кеші промахом на 30 днів.
    if (!response.ok) return;
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !isRecord(payload.entries)) return;
    const entries = payload.entries;
    const at = Date.now();
    const next = new Map(getSnapshot().entries);
    for (const word of words) {
      const value = entries[word];
      if (isRecord(value) && typeof value.lemma === 'string') {
        next.set(word, {
          word,
          lemma: value.lemma,
          ipa: typeof value.ipa === 'string' ? value.ipa : null,
          definition: typeof value.definition === 'string' ? value.definition : null,
          at,
        });
      } else {
        // слова немає у відповіді — джерело статті не має; памʼятаємо промах,
        // щоб не питати знову до кінця TTL
        next.set(word, { word, lemma: word, ipa: null, definition: null, at, miss: true });
      }
    }
    commitEntries(next);
  } catch {
    // мережа впала — жодного запису; екран покаже «—» замість порожнього місця
  } finally {
    for (const word of words) inFlight.delete(word);
    commitLoading(-1);
  }
}

async function flush(): Promise<void> {
  timer = null;
  const words = [...pending];
  pending.clear();
  if (words.length === 0) return;

  const chunks: string[][] = [];
  for (let index = 0; index < words.length; index += MAX_WORDS_PER_REQUEST) {
    chunks.push(words.slice(index, index + MAX_WORDS_PER_REQUEST));
  }
  await Promise.all(chunks.map(requestChunk));
}

/**
 * Ставить слова в чергу: зібране за BATCH_WINDOW_MS іде одним POST. Слова «в
 * дорозі» тримаються в `Set`, щоб два екрани одночасно не спитали те саме.
 */
export function schedule(words: string[]): void {
  for (const raw of words) {
    const word = normalizeWord(raw);
    if (word === null) continue;
    if (pending.has(word) || inFlight.has(word)) continue;
    if (lookupBrief(word) !== undefined) continue;
    pending.add(word);
  }
  if (pending.size === 0 || timer !== null) return;
  timer = setTimeout(() => {
    void flush();
  }, BATCH_WINDOW_MS);
}

/** Скидає кеш і чергу. Потрібне тестам і кнопці «очистити словниковий кеш». */
export function resetDictionaryCache(): void {
  pending.clear();
  inFlight.clear();
  if (timer !== null) clearTimeout(timer);
  timer = null;
  fullEntries.clear();
  snapshot = null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(DICT_KEY);
    } catch {
      // сховище недоступне — у памʼяті вже порожньо, цього досить
    }
  }
  for (const listener of listeners) listener();
}

export function useDictionary(words: string[]): {
  /** слово → коротка стаття; `undefined` (немає ключа) = ще не знаємо, `null` = статті немає */
  brief: Map<string, CachedBrief | null>;
  /** true, поки летить хоч один запит */
  loading: boolean;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Один ефект на весь масив, а не по ефекту на слово: рядок таблиці не має
  // права нести власний запит. Ключ — рядок, щоб новий масив із тим самим
  // вмістом не перезапускав ефект.
  const key = words.join('\n');

  useEffect(() => {
    schedule(key.length === 0 ? [] : key.split('\n'));
  }, [key]);

  const brief = useMemo(() => {
    const map = new Map<string, CachedBrief | null>();
    for (const word of key.length === 0 ? [] : key.split('\n')) {
      const found = resolve(state.entries, word);
      // ключ — слово, як його дав екран: саме за ним він і питатиме
      if (found !== undefined) map.set(word, found);
    }
    return map;
  }, [state.entries, key]);

  return { brief, loading: state.inFlight > 0 };
}

/**
 * Повні статті тримаються ТІЛЬКИ в памʼяті сторінки. У localStorage вони не
 * пишуться: потрібні на один розкритий рядок, важать у 5–10 разів більше
 * короткої форми (у частотних слів по 30+ означень), а серверний кеш віддає їх
 * і так швидко. Класти їх поруч із короткими означало б вибити з кеша сотні
 * рядків таблиці заради однієї картки.
 */
const fullEntries = new Map<string, DictionaryEntry>();

function toEntry(value: unknown): DictionaryEntry | null {
  if (!isRecord(value)) return null;
  return typeof value.word === 'string' && typeof value.lemma === 'string'
    ? (value as unknown as DictionaryEntry)
    : null;
}

export function useFullEntry(word: string | null): {
  entry: DictionaryEntry | null;
  loading: boolean;
  error: string | null;
} {
  const key = word === null ? null : normalizeWord(word);
  /**
   * Результат підписаний ключем: поки летить запит на нове слово, дані
   * попереднього не мають права світитися в картці.
   */
  const [result, setResult] = useState<{
    key: string;
    entry: DictionaryEntry | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    // Стан «немає слова» і «стаття вже в памʼяті» рахується під час рендера,
    // а не через setState в ефекті: інакше кожне розкриття рядка коштувало б
    // зайвого каскадного рендера.
    if (key === null || fullEntries.has(key)) return;

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/dictionary/${encodeURIComponent(key)}`);
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            isRecord(payload) && typeof payload.error === 'string'
              ? payload.error
              : 'Не вдалося отримати статтю. Спробуйте ще раз.';
          if (!cancelled) setResult({ key, entry: null, error: message });
          return;
        }
        const entry = toEntry(isRecord(payload) ? payload.entry : null);
        if (entry === null) {
          if (!cancelled) {
            setResult({ key, entry: null, error: 'Стаття прийшла в невідомому вигляді.' });
          }
          return;
        }
        fullEntries.set(key, entry);
        if (!cancelled) setResult({ key, entry, error: null });
      } catch {
        if (!cancelled) setResult({ key, entry: null, error: 'Немає звʼязку зі словником.' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (key === null) return { entry: null, loading: false, error: null };

  const cached = fullEntries.get(key);
  if (cached !== undefined) return { entry: cached, loading: false, error: null };
  if (result !== null && result.key === key) {
    return { entry: result.entry, loading: false, error: result.error };
  }
  return { entry: null, loading: true, error: null };
}

/** Константи відкриті тестам і екранам, щоб ніхто не дублював числа. */
export { DICT_KEY, SOFT_TTL_MS, MAX_ENTRIES, BATCH_WINDOW_MS };

import type { DictionaryEntry, LookupResult } from './types';
import { hasSubstance, parseEntry, resolveTarget } from './wikitext';

/**
 * Мережевий шар над Wiktionary. Тонкий навмисно: усе, що можна перевірити без
 * мережі, живе у wikitext.ts, а тут лишається рівно один рецепт запиту.
 *
 * Модуль СЕРВЕРНИЙ: з браузера ці запити робити не можна (CORS і власний
 * User-Agent), і не потрібно — відповіді кешує сервер (фаза 3).
 */

const API = 'https://en.wiktionary.org/w/api.php';

/**
 * Без свого User-Agent Wikimedia блокує IP без попередження — це вимога
 * їхньої політики, а не побажання.
 */
const USER_AGENT = 'englishgrammar/1.0 (andriy@nanitor.com)';

/** Обмеження Action API для анонімного клієнта. */
export const MAX_TITLES_PER_REQUEST = 50;

/** Довше чекати немає сенсу: аналізатор має віддати результат одразу. */
const TIMEOUT_MS = 6000;

interface TitleMapping {
  from: string;
  to: string;
}

interface ApiPage {
  title: string;
  missing?: boolean;
  revisions?: { slots?: { main?: { content?: string } } }[];
}

interface ApiResponse {
  query?: {
    pages?: ApiPage[];
    normalized?: TitleMapping[];
    redirects?: TitleMapping[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** JSON із мережі — це `unknown`; звужуємо руками, щоб не заводити `any`. */
function asApiResponse(payload: unknown): ApiResponse {
  if (!isRecord(payload) || !isRecord(payload.query)) return {};
  const query = payload.query;

  const mappings = (value: unknown): TitleMapping[] =>
    Array.isArray(value)
      ? value.flatMap((item) =>
          isRecord(item) && typeof item.from === 'string' && typeof item.to === 'string'
            ? [{ from: item.from, to: item.to }]
            : [],
        )
      : [];

  const pages: ApiPage[] = Array.isArray(query.pages)
    ? query.pages.flatMap((item) => {
        if (!isRecord(item) || typeof item.title !== 'string') return [];
        const revisions = Array.isArray(item.revisions)
          ? item.revisions.flatMap((revision) => {
              if (!isRecord(revision) || !isRecord(revision.slots)) return [];
              const main = revision.slots.main;
              const content = isRecord(main) && typeof main.content === 'string' ? main.content : undefined;
              return [{ slots: { main: { content } } }];
            })
          : undefined;
        return [{ title: item.title, missing: item.missing === true, revisions }];
      })
    : [];

  return { query: { pages, normalized: mappings(query.normalized), redirects: mappings(query.redirects) } };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Вміст сторінок за назвами. Одна назва — одна стаття.
 *
 * Помилка мережі не летить назовні: слово без статті — це слово без картки,
 * а не зламаний аналізатор (CONCEPT 8.1).
 */
export async function fetchWikitext(titles: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(titles.filter((title) => title.trim().length > 0))];
  const out = new Map<string, string>();

  // Послідовно, не паралельно: паралельні батчі — найшвидший спосіб отримати
  // 429 від Wikimedia, а виграш у часі тут мізерний.
  for (const batch of chunk(unique, MAX_TITLES_PER_REQUEST)) {
    const url = new URL(API);
    url.search = new URLSearchParams({
      action: 'query',
      prop: 'revisions',
      rvslots: 'main',
      rvprop: 'content',
      format: 'json',
      formatversion: '2',
      redirects: '1',
      titles: batch.join('|'),
    }).toString();

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        console.warn(`wiktionary: HTTP ${response.status} на ${batch.length} назв`);
        continue;
      }
      const data = asApiResponse(await response.json());
      const pages = data.query?.pages ?? [];

      const content = new Map<string, string>();
      for (const page of pages) {
        const text = page.revisions?.[0]?.slots?.main?.content;
        if (typeof text === 'string' && text.length > 0) content.set(page.title, text);
      }

      // API нормалізує регістр і йде за редиректами, тому назва у відповіді
      // може не збігтися із запитаною — повертаємо мапу за ЗАПИТАНИМИ назвами.
      const hops = new Map<string, string>();
      for (const { from, to } of [...(data.query?.normalized ?? []), ...(data.query?.redirects ?? [])]) {
        hops.set(from, to);
      }
      const resolve = (title: string): string => {
        let current = title;
        for (let step = 0; step < 4; step += 1) {
          const next = hops.get(current);
          if (next === undefined) break;
          current = next;
        }
        return current;
      };

      for (const title of batch) {
        const text = content.get(resolve(title)) ?? content.get(title);
        if (text !== undefined) out.set(title, text);
      }
    } catch (error) {
      console.warn('wiktionary: запит не вдався', error);
    }
  }

  return out;
}

/**
 * Аналізатор приводить слова до нижнього регістру, а власні назви у Вікісловнику
 * живуть з великої літери («Friday»), і назви статей регістрозалежні — тому для
 * слова без статті пробуємо ще й написання з великої.
 */
function capitalized(word: string): string[] {
  const upper = word.charAt(0).toUpperCase() + word.slice(1);
  return upper === word ? [] : [upper];
}



/** Стаття леми доповнює форму, а не заміщає: у форми може бути своє аудіо. */
function merge(word: string, lemma: string, lemmaEntry: DictionaryEntry, formEntry: DictionaryEntry | null): DictionaryEntry {
  return {
    ...lemmaEntry,
    word,
    lemma,
    ipa: lemmaEntry.ipa ?? formEntry?.ipa ?? null,
    audioUrl: lemmaEntry.audioUrl ?? formEntry?.audioUrl ?? null,
    definitions: lemmaEntry.definitions.length > 0 ? lemmaEntry.definitions : (formEntry?.definitions ?? []),
    examples: lemmaEntry.examples.length > 0 ? lemmaEntry.examples : (formEntry?.examples ?? []),
    quotes: lemmaEntry.quotes.length > 0 ? lemmaEntry.quotes : (formEntry?.quotes ?? []),
  };
}

/**
 * Статті на список слів. Аналізатор дає словоформи, тому нерозвʼязані слова
 * отримують ОДИН додатковий батч на леми — не рекурсивно: два рейси до
 * Вікісловника це стеля, за якою починається помітна затримка.
 */
export async function lookupWords(words: string[]): Promise<Map<string, LookupResult>> {
  const unique = [...new Set(words.map((word) => word.toLowerCase().trim()).filter((word) => word.length > 0))];
  const out = new Map<string, LookupResult>();
  if (unique.length === 0) return out;

  // Одна назва на слово, тому в один запит влазить рівно 50 слів (заміряно:
  // 51 назва дає `toomanyvalues` з `lowlimit:50`). Другу назву не додавати
  // «для симетрії» — підсторінка перекладів англомовних даних не має.
  const pages = await fetchWikitext(unique);

  /** Слова, яким потрібна лема: у якому порядку її шукати. */
  const pending = new Map<string, { candidates: string[]; formEntry: DictionaryEntry | null }>();

  for (const word of unique) {
    const main = pages.get(word);
    const formEntry = main === undefined ? null : parseEntry(word, main);

    // Лему називає сам шаблон статті — у 24 із 24 перевірених словоформ. Тому
    // жодного вгадування суфіксів: або шаблон, або (коли статті немає взагалі)
    // написання з великої літери для власних назв.
    const target = main === undefined ? null : resolveTarget(main);
    const candidates = target
      ? [target.toLowerCase()]
      : main === undefined
        ? capitalized(word)
        : [];

    if (formEntry !== null && hasSubstance(formEntry) && candidates.length === 0) {
      out.set(word, formEntry);
      continue;
    }

    if (candidates.length === 0) {
      out.set(word, formEntry !== null && hasSubstance(formEntry) ? formEntry : null);
      continue;
    }
    pending.set(word, { candidates, formEntry });
  }

  if (pending.size === 0) return out;

  const lemmaPages = await fetchWikitext([...pending.values()].flatMap(({ candidates }) => candidates));

  for (const [word, { candidates, formEntry }] of pending) {
    let resolved: DictionaryEntry | null = null;
    for (const candidate of candidates) {
      const main = lemmaPages.get(candidate);
      if (main === undefined) continue;
      const entry = parseEntry(candidate, main);
      if (entry === null || !hasSubstance(entry)) continue;
      resolved = merge(word, candidate, entry, formEntry);
      break;
    }
    out.set(word, resolved ?? (formEntry !== null && hasSubstance(formEntry) ? formEntry : null));
  }

  return out;
}

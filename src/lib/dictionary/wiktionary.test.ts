import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MAX_TITLES_PER_REQUEST, fetchWikitext, lookupWords } from './wiktionary';

/**
 * Мережу тут завжди підміняємо: тести не мають права залежати ні від
 * доступності Вікісловника, ні від чужих правок статей.
 */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}.txt`, import.meta.url), 'utf8');
}

interface Call {
  titles: string[];
  userAgent: string | null;
}

/** Мінімальний двійник Action API: віддає рівно те, що є у фікстурах. */
function stubApi(pages: Record<string, string>): Call[] {
  const calls: Call[] = [];
  vi.stubGlobal('fetch', (input: string | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input.toString());
    const titles = (url.searchParams.get('titles') ?? '').split('|').filter(Boolean);
    const headers = init?.headers as Record<string, string> | undefined;
    calls.push({ titles, userAgent: headers?.['User-Agent'] ?? null });
    return Promise.resolve(
      new Response(
        JSON.stringify({
          query: {
            pages: titles.map((title) =>
              pages[title] === undefined
                ? { title, missing: true }
                : { title, revisions: [{ slots: { main: { content: pages[title] } } }] },
            ),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
  });
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchWikitext', () => {
  it('розбиває запит на батчі не більші за 50 назв', async () => {
    const calls = stubApi({});
    const titles = Array.from({ length: 123 }, (_, index) => `word${index}`);

    await fetchWikitext(titles);

    expect(calls).toHaveLength(3);
    for (const call of calls) {
      expect(call.titles.length).toBeLessThanOrEqual(MAX_TITLES_PER_REQUEST);
    }
    expect(calls.flatMap((call) => call.titles)).toHaveLength(123);
  });

  it('надсилає власний User-Agent — без нього Wikimedia блокує IP', async () => {
    const calls = stubApi({ improve: fixture('improve') });
    await fetchWikitext(['improve']);
    expect(calls[0]?.userAgent).toBe('englishgrammar/1.0 (andriy@nanitor.com)');
  });

  it('назви-дублікати в мережу не йдуть', async () => {
    const calls = stubApi({});
    await fetchWikitext(['time', 'time', 'time']);
    expect(calls[0]?.titles).toEqual(['time']);
  });

  it('мережева помилка не летить назовні — сторінок просто немає', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('ECONNREFUSED')));
    await expect(fetchWikitext(['improve'])).resolves.toEqual(new Map());
  });
});

describe('lookupWords', () => {



  it('мʼякий редирект написання веде на лему', async () => {
    stubApi({ realise: fixture('realise'), realize: fixture('improve') });
    expect((await lookupWords(['realise'])).get('realise')?.lemma).toBe('realize');
  });

  it('слова, якого немає у Вікісловнику, немає й у результаті', async () => {
    stubApi({});
    expect((await lookupWords(['zzzqqq'])).get('zzzqqq')).toBeNull();
  });

  it('мережева помилка дає null для слова, а не виняток', async () => {
    vi.stubGlobal('fetch', () => {
      throw new Error('network down');
    });

    const result = await lookupWords(['improve', 'time']);

    expect(result.get('improve')).toBeNull();
    expect(result.get('time')).toBeNull();
  });

  it('таймаут теж дає null, а не падіння', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new DOMException('timed out', 'TimeoutError')));
    expect((await lookupWords(['improve'])).get('improve')).toBeNull();
  });

  it('порожній список у мережу не йде', async () => {
    const calls = stubApi({});
    expect(await lookupWords([])).toEqual(new Map());
    expect(calls).toHaveLength(0);
  });
});

describe('власні назви', () => {
  it('слово з великої літери знаходиться попри нижній регістр від аналізатора', async () => {
    const calls = stubApi({ Friday: fixture('improve') });

    const entry = (await lookupWords(['friday'])).get('friday');

    expect(calls[1]?.titles).toContain('Friday');
    expect(entry?.word).toBe('friday');
    expect(entry?.lemma).toBe('Friday');
  });
});

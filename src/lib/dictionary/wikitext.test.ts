import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { parseEntry, resolveTarget } from './wikitext';

/**
 * Тести працюють на збереженому wikitext із fixtures/ і НЕ ходять у мережу:
 * інакше вони падали б від чужих правок статей, а не від наших змін у коді.
 */
function fixture(name: string): string {
  return readFileSync(new URL(`./fixtures/${name}.txt`, import.meta.url), 'utf8');
}

describe('parseEntry', () => {

  it('визначення й приклади без wiki-розмітки', () => {
    const entry = parseEntry('improve', fixture('improve'));
    for (const text of [...(entry?.definitions ?? []), ...(entry?.examples ?? [])]) {
      expect(text).not.toMatch(/\{\{|\}\}|\[\[|'''/);
    }
  });

  it('сторінки без секції ==English== статті не дають', () => {
    expect(parseEntry('щось', '==Ukrainian==\n\n# слово')).toBeNull();
  });
});

describe('resolveTarget — написання і словоформи одним резолвером', () => {
  it('realise веде на realize', () => {
    expect(resolveTarget(fixture('realise'))).toBe('realize');
  });

  it('розуміє і alternative spelling of, і alternative form of', () => {
    expect(resolveTarget('==English==\n# {{alternative spelling of|en|realize}}')).toBe('realize');
    expect(resolveTarget('==English==\n# {{alternative form of|en|colour}}')).toBe('colour');
  });

  it('звичайна стаття вказівника не має', () => {
    expect(resolveTarget(fixture('improve'))).toBeNull();
  });
});

describe('resolveTarget — словоформи', () => {
  it('deployed веде на deploy', () => {
    expect(resolveTarget(fixture('deployed'))).toBe('deploy');
  });

  it('розуміє plural of, en-past of і inflection of', () => {
    expect(resolveTarget('==English==\n# {{plural of|en|migration}}')).toBe('migration');
    expect(resolveTarget('==English==\n# {{en-past of|deploy}}')).toBe('deploy');
    expect(resolveTarget('==English==\n# {{inflection of|en|deploy||past}}')).toBe('deploy');
  });

  it('лема самої леми — null', () => {
    expect(resolveTarget(fixture('deploy'))).toBeNull();
  });
});


describe('означення на вкладених рівнях', () => {
  it('бере означення з ## і ###, коли на першому рівні лише мітка', () => {
    // Саме так побудована стаття «realize»: 36 КБ тексту й нуль означень,
    // якщо читати тільки перший рівень.
    const wikitext = [
      '==English==',
      '# {{lb|en|transitive}}',
      '## {{lb|en|chiefly|US}}',
      '### To become aware of, understand',
      '###: {{ux|en|He realized that he had left his umbrella.}}',
    ].join('\n');

    const entry = parseEntry('realize', wikitext);
    expect(entry?.definitions[0]).toBe('To become aware of, understand');
    expect(entry?.examples[0]).toBe('He realized that he had left his umbrella.');
  });

  it('анкор секції в лемі відрізається: study#Noun → study', () => {
    expect(resolveTarget('==English==\n# {{plural of|en|study#Noun}}')).toBe('study');
  });
});

describe('приклади й цитати — окремі поля', () => {
  it('короткі приклади (#:) не перемішуються з цитатами (#*)', () => {
    // «perfunctory» має обидва типи: 4 рядки `#:` і 37 рядків `#*`.
    const entry = parseEntry('perfunctory', fixture('perfunctory'));

    expect(entry?.examples.length).toBeGreaterThan(0);
    expect(entry?.quotes.length).toBeGreaterThan(0);
    // Жоден приклад не потрапив у цитати й навпаки.
    for (const example of entry?.examples ?? []) {
      expect(entry?.quotes).not.toContain(example);
    }
  });

  it('цитати обрізані по довжині, приклади — ні', () => {
    const entry = parseEntry('improve', fixture('improve'));
    for (const quote of entry?.quotes ?? []) {
      expect(quote.length).toBeLessThanOrEqual(200);
    }
  });
});

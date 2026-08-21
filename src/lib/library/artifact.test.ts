import { describe, expect, it } from 'vitest';

import { chunksOf } from '@/lib/analyzer/chunks';
import { findMatches, tokenize, type Match } from '@/lib/analyzer/tenses';
import { wordTokens } from '@/lib/analyzer/words';
import type { TenseKey } from '@/types/content';

import {
  type Artifact,
  type ArtifactChunk,
  parseArtifact,
  toTokenMatches,
  validate,
} from './artifact';

/**
 * Найважливіший ризик фази — зсув нумерації слів: артефакт зі зсунутими на
 * одиницю номерами виглядає структурно коректним (усі поля на місці), але
 * розмічує НЕ ТІ слова. Тому тести тут не виписують номери руками: текст і
 * артефакт до нього генеруються одним і тим самим кодом (`findMatches` +
 * `wordTokens`), а псується вже готовий артефакт — так само, як зіпсувала б
 * його помилка в промпті чи в CLI.
 */

/** Кілька абзаців з очевидними Past Simple / Continuous / Perfect конструкціями. */
function buildText(): string {
  const sentences = [
    'She walked to the old market and bought fresh bread.',
    'He had never seen such a bright morning before.',
    'They were talking quietly when the teacher arrived.',
    'We finished the project and celebrated with our friends.',
    'The old man walked slowly and stopped near the river.',
    'She had already finished her homework when he called.',
    'They walked together and talked about the future.',
    'He waited patiently until the rain finally stopped.',
  ];
  return sentences.join(' ');
}

/** Переклад «індекс токена → номер слова», зворотний до `wordTokens`. */
function wordNumbers(text: string): Map<number, number> {
  const words = wordTokens(tokenize(text));
  return new Map(words.map((word, i) => [word.index, i + 1]));
}

/**
 * Артефакт, розмічений локальними правилами того самого тексту — рівно так,
 * як зроблено для смоук-прикладу в `src/content/library`. Розмітка тут не
 * вигадана: це `findMatches`, перекладений у номери слів через таблицю, яку
 * саме й перевіряє ця фаза.
 */
function buildArtifact(text: string): Artifact {
  const tokens = tokenize(text);
  const toWordNumber = wordNumbers(text);
  const localMatches = findMatches(tokens);

  const chunks: ArtifactChunk[] = chunksOf(tokens).map((chunk, index) => {
    const firstWord = toWordNumber.get(chunk.start);
    const lastWord = toWordNumber.get(chunk.end);
    if (firstWord === undefined || lastWord === undefined) {
      throw new Error('тестова помилка: межі шматка не є словами');
    }

    const chunkMatches = localMatches
      .filter((match) => match.from >= chunk.start && match.to <= chunk.end)
      .map((match) => {
        const word = toWordNumber.get(match.from);
        const lastMatchWord = toWordNumber.get(match.to);
        if (word === undefined || lastMatchWord === undefined) {
          throw new Error('тестова помилка: межі збігу не є словами');
        }
        return { word, length: lastMatchWord - word + 1, tense: match.tense };
      });

    return { index, firstWord, lastWord, matches: chunkMatches };
  });

  return { format: 1, seededBy: 'local-rules', chunks };
}

describe('parseArtifact — строгість формату', () => {
  it('невідоме поле на будь-якому рівні — падає з назвою поля', () => {
    const raw = { format: 1, seededBy: 'local-rules', chunks: [], extra: true };

    expect(() => parseArtifact(raw, 'strict.json')).toThrow(/strict\.json.*extra.*невідоме поле/s);
  });

  it('відсутній (або не 1) format — падає', () => {
    const raw = { seededBy: 'local-rules', chunks: [] };

    expect(() => parseArtifact(raw, 'strict.json')).toThrow(/strict\.json.*format/s);
  });
});

describe('пайплайн parseArtifact → toTokenMatches → validate', () => {
  it('коректний артефакт проходить без винятків, а токени збігаються з findMatches', () => {
    const text = buildText();
    const tokens = tokenize(text);
    const localMatches = findMatches(tokens);

    const artifact = parseArtifact(buildArtifact(text), 'story.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'matches.json')).not.toThrow();
    expect(converted).toEqual([...localMatches].sort((a, b) => a.from - b.from));
  });

  it('зсув нумерації слів на одиницю — падає (найважливіший тест фази)', () => {
    const text = buildText();
    const raw = buildArtifact(text);
    const shifted: Artifact = {
      ...raw,
      chunks: raw.chunks.map((chunk) => ({
        ...chunk,
        matches: chunk.matches.map((match) => ({ ...match, word: match.word + 1 })),
      })),
    };

    const artifact = parseArtifact(shifted, 'shifted.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'shifted.json')).toThrow(/shifted\.json/);
  });

  it('межі поза текстом — падає з назвою файлу й діапазоном', () => {
    const text = buildText();
    const raw = buildArtifact(text);
    const totalWords = wordTokens(tokenize(text)).length;
    const withOverflow: Artifact = {
      ...raw,
      chunks: raw.chunks.map((chunk, i) =>
        i === raw.chunks.length - 1
          ? { ...chunk, matches: [...chunk.matches, { word: totalWords + 5, length: 1, tense: 'ps' as const }] }
          : chunk,
      ),
    };

    const artifact = parseArtifact(withOverflow, 'overflow.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'overflow.json')).toThrow(
      new RegExp(`overflow\\.json.*${totalWords + 5}`, 's'),
    );
  });

  it('перетин діапазонів між збігами — падає', () => {
    const text = buildText();
    const raw = buildArtifact(text);
    const firstMatch = raw.chunks[0]?.matches[0];
    if (!firstMatch) throw new Error('тестова помилка: у тексті немає жодного локального збігу');

    const withOverlap: Artifact = {
      ...raw,
      chunks: raw.chunks.map((chunk, i) =>
        i === 0 ? { ...chunk, matches: [...chunk.matches, { ...firstMatch }] } : chunk,
      ),
    };

    const artifact = parseArtifact(withOverlap, 'overlap.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'overlap.json')).toThrow(/overlap\.json.*перетин діапазонів/s);
  });

  it('невідомий tense у matches — падає, навіть якщо matches прийшли не з парсера', () => {
    const text = buildText();
    const artifact = parseArtifact(buildArtifact(text), 'story.json');
    const converted = toTokenMatches(text, artifact);
    const corrupted: Match[] = converted.map((match, i) =>
      i === 0 ? { ...match, tense: 'present-perfect' as TenseKey } : match,
    );

    expect(() => validate(text, artifact, corrupted, 'corrupted.json')).toThrow(
      /corrupted\.json.*невідомий час/s,
    );
  });

  it('межі шматка не збігаються з chunksOf — падає', () => {
    const text = buildText();
    const raw = buildArtifact(text);
    const tampered: Artifact = {
      ...raw,
      chunks: raw.chunks.map((chunk, i) => (i === 0 ? { ...chunk, lastWord: chunk.lastWord - 1 } : chunk)),
    };

    const artifact = parseArtifact(tampered, 'boundary.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'boundary.json')).toThrow(/boundary\.json.*chunksOf/s);
  });

  it('перетин з локальними Past Simple нижче порога — падає', () => {
    const text = buildText();
    const raw = buildArtifact(text);
    const withoutPastSimple: Artifact = {
      ...raw,
      chunks: raw.chunks.map((chunk) => ({
        ...chunk,
        matches: chunk.matches.filter((match) => match.tense !== 'ps'),
      })),
    };

    const artifact = parseArtifact(withoutPastSimple, 'threshold.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'threshold.json')).toThrow(
      /threshold\.json.*порога/s,
    );
  });
});

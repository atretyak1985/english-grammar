import { describe, expect, it } from 'vitest';

import { chunksOf } from '@/lib/analyzer/chunks';
import { tokenize, type Match } from '@/lib/analyzer/tenses';
import { wordTokens } from '@/lib/analyzer/words';
import { analyzeGrammar } from '@/lib/grammar';
import { RULES_VERSION } from '@/lib/grammar/rules';
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
 * артефакт до нього генеруються одним і тим самим кодом (`analyzeGrammar` +
 * `wordTokens`) — рівно так, як це робить `import-book`, — а псується вже
 * готовий артефакт, так само, як зіпсувала б його помилка в CLI.
 */

/**
 * Кілька абзаців з очевидними конструкціями. Форми з `V2_ONLY` («went»,
 * «saw», «came») тут не окраса: перевірка 5 рахує поріг саме на них.
 */
function buildText(): string {
  const sentences = [
    'She went to the old market and bought fresh bread.',
    'He had never seen such a bright morning before.',
    'They were talking quietly when the teacher came in.',
    'We finished the project and celebrated with our friends.',
    'The old man walked slowly and saw a boat near the river.',
    'She had already finished her homework when he called.',
    'They went together and talked about the future.',
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
 * Артефакт, розмічений двигуном на тому самому тексті — рівно так, як це
 * робить `import-book`. Розмітка тут не вигадана: це `analyzeGrammar`,
 * перекладений у номери слів через таблицю, яку саме й перевіряє ця фаза.
 */
function buildArtifact(text: string): Artifact {
  const tokens = tokenize(text);
  const toWordNumber = wordNumbers(text);
  const localMatches = analyzeGrammar(text).matches;

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
        return { word, length: lastMatchWord - word + 1, tense: match.tense, rule: match.ruleId };
      });

    return { index, firstWord, lastWord, matches: chunkMatches };
  });

  return { format: 2, seededBy: 'grammar-engine', rulesVersion: RULES_VERSION, chunks };
}

describe('parseArtifact — строгість формату', () => {
  it('невідоме поле на будь-якому рівні — падає з назвою поля', () => {
    const raw = { format: 2, seededBy: 'claude-cli', chunks: [], extra: true };

    expect(() => parseArtifact(raw, 'strict.json')).toThrow(/strict\.json.*extra.*невідоме поле/s);
  });

  it('відсутній format — падає', () => {
    const raw = { seededBy: 'claude-cli', chunks: [] };

    expect(() => parseArtifact(raw, 'strict.json')).toThrow(/strict\.json.*format/s);
  });

  it('формат 1 більше не приймається — падає з вимогою перегенерувати', () => {
    const raw = { format: 1, seededBy: 'local-rules', chunks: [] };

    expect(() => parseArtifact(raw, 'legacy.json')).toThrow(/legacy\.json.*format.*import-book/s);
  });

  it("розмітка двигуном без rulesVersion — падає (обовʼязкове для 'grammar-engine')", () => {
    const raw = { format: 2, seededBy: 'grammar-engine', chunks: [] };

    expect(() => parseArtifact(raw, 'engine.json')).toThrow(/engine\.json.*rulesVersion/s);
  });

  it('застаріла rulesVersion — падає з назвою обох версій і вимогою перегенерувати (SC-8)', () => {
    const raw = { format: 2, seededBy: 'grammar-engine', rulesVersion: RULES_VERSION + 1, chunks: [] };

    expect(() => parseArtifact(raw, 'stale.json')).toThrow(
      new RegExp(`stale\\.json.*v${RULES_VERSION + 1}.*v${RULES_VERSION}.*import-book`, 's'),
    );
  });

  it("ручна розмітка 'claude-cli' без rulesVersion — приймається", () => {
    const raw = { format: 2, seededBy: 'claude-cli', seedModel: 'claude-opus-5', chunks: [] };

    expect(parseArtifact(raw, 'manual.json').rulesVersion).toBeUndefined();
  });
});

describe('пайплайн parseArtifact → toTokenMatches → validate', () => {
  it('коректний артефакт проходить без винятків, а токени збігаються з analyzeGrammar', () => {
    const text = buildText();
    const engineMatches = analyzeGrammar(text).matches.map(({ from, to, tense }) => ({ from, to, tense }));

    const artifact = parseArtifact(buildArtifact(text), 'story.json');
    const converted = toTokenMatches(text, artifact);

    expect(() => validate(text, artifact, converted, 'matches.json')).not.toThrow();
    expect(converted).toEqual([...engineMatches].sort((a, b) => a.from - b.from));
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

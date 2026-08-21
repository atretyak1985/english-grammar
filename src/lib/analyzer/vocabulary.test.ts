import { describe, expect, it } from 'vitest';

import { analyzeText } from '@/lib/analyzer/tenses';
import { UNKNOWN_LIMIT, pickUnknown, tokenFrequency } from '@/lib/analyzer/vocabulary';
import type { WordStatus } from '@/types/state';

const TEXT =
  'The engineer deployed the migration. The migration failed twice, so the engineer ' +
  'rolled the migration back and wrote a longer postmortem about the outage.';

const frequency = tokenFrequency(analyzeText(TEXT).tokens);

describe('tokenFrequency', () => {
  it('рахує по всіх токенах документа і сортує за частотою', () => {
    expect(frequency.slice(0, 2)).toEqual([
      { word: 'migration', count: 3 },
      { word: 'engineer', count: 2 },
    ]);
  });

  it('не пускає в список службові слова', () => {
    expect(frequency.map((entry) => entry.word)).not.toContain('the');
  });

  it('при однаковій кількості тримає алфавітний порядок', () => {
    const ones = frequency.filter((entry) => entry.count === 1).map((entry) => entry.word);
    expect(ones).toEqual([...ones].sort());
  });
});

describe('pickUnknown', () => {
  it('лишає тільки незнайоме: «знаю» і «вчу» відпадають разом', () => {
    const words: Record<string, WordStatus> = { migration: 'known', engineer: 'learning' };
    const picked = pickUnknown(frequency, words).map((entry) => entry.word);
    expect(picked).not.toContain('migration');
    expect(picked).not.toContain('engineer');
    expect(picked).toContain('postmortem');
  });

  it('слово без запису вважається незнайомим', () => {
    expect(pickUnknown(frequency, {})).toEqual(frequency);
  });

  it('після дії наступне за частотою підтягується на звільнене місце', () => {
    const before = pickUnknown(frequency, {}).slice(0, 3).map((entry) => entry.word);
    const after = pickUnknown(frequency, { migration: 'known' })
      .slice(0, 3)
      .map((entry) => entry.word);
    expect(after).not.toContain('migration');
    expect(after).toHaveLength(3);
    expect(after[0]).toBe(before[1]);
    expect(after[2]).not.toBe(before[2]);
  });

  it('зріз тримає рівно UNKNOWN_LIMIT позицій, коли слів вистачає', () => {
    const many = Array.from({ length: 40 }, (_, index) => ({
      word: `word${index}`,
      count: 40 - index,
    }));
    expect(pickUnknown(many, {}).slice(0, UNKNOWN_LIMIT)).toHaveLength(20);
    expect(pickUnknown(many, { word0: 'known' }).slice(0, UNKNOWN_LIMIT)).toHaveLength(20);
  });

  it('відкат вертає слову попередній статус, а не обнуляє його', () => {
    // «вчу» → «знаю» → повернути: слово має знову стати «вчу», тобто в блоці
    // не з'явитись, бо блок показує лише unknown.
    const from: WordStatus = 'learning';
    const afterAction = pickUnknown(frequency, { engineer: 'known' });
    const afterUndo = pickUnknown(frequency, { engineer: from });
    expect(afterAction.map((entry) => entry.word)).not.toContain('engineer');
    expect(afterUndo.map((entry) => entry.word)).not.toContain('engineer');
    expect(pickUnknown(frequency, {}).map((entry) => entry.word)).toContain('engineer');
  });
});

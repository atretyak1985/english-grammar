import { describe, expect, it } from 'vitest';

import { parseUserState } from '@/lib/state/validate';

describe('parseUserState: статуси', () => {
  it('пропускає всі чотири відомі статуси', () => {
    const parsed = parseUserState({
      words: { deploy: 'hidden', migrate: 'learning', ship: 'known', gauge: 'unknown' },
    });

    expect(parsed.words).toEqual({
      deploy: 'hidden',
      migrate: 'learning',
      ship: 'known',
      gauge: 'unknown',
    });
  });

  it('відкидає вигаданий статус, не чіпаючи сусідні слова', () => {
    const parsed = parseUserState({ words: { deploy: 'deleted', migrate: 'hidden' } });

    expect(parsed.words.deploy).toBeUndefined();
    expect(parsed.words.migrate).toBe('hidden');
  });

  it('зводить слово до нижнього регістра', () => {
    expect(parseUserState({ words: { Deploy: 'hidden' } }).words.deploy).toBe('hidden');
  });
});

describe('parseUserState: нотатки', () => {
  it('приймає нотатку і обрізає пробіли', () => {
    expect(parseUserState({ notes: { deploy: '  розгортати  ' } }).notes.deploy).toBe('розгортати');
  });

  it('відкидає нотатку довше 200 символів — колонка її не витримає', () => {
    const parsed = parseUserState({ notes: { deploy: 'я'.repeat(300), migrate: 'я'.repeat(200) } });

    expect(parsed.notes.deploy).toBeUndefined();
    expect(parsed.notes.migrate).toHaveLength(200);
  });

  it('відкидає порожню нотатку, не-рядок і надто довгий ключ', () => {
    const parsed = parseUserState({
      notes: { deploy: '   ', migrate: 42, ['я'.repeat(65)]: 'текст', ship: 'переслати' },
    });

    expect(Object.keys(parsed.notes)).toEqual(['ship']);
  });

  it('стан без поля notes читається як стан із порожніми нотатками', () => {
    expect(parseUserState({ words: { deploy: 'known' } }).notes).toEqual({});
  });

  it('сміття замість усього стану дає порожній стан, а не виняток', () => {
    expect(parseUserState('нічого').words).toEqual({});
    expect(parseUserState(null).notes).toEqual({});
  });
});

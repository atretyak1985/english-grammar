import { describe, expect, it } from 'vitest';

import {
  IRREGULAR_VERBS,
  V2_ONLY,
  V3_ONLY,
  verbsInGroup,
} from '@/data/irregular-verbs';

import { hasForm, isBaseHomograph, looksLikeRegularPast, verbForm } from './morphology';

describe('verbForm', () => {
  it.each([
    ['went', 'go', 'past'],
    ['gone', 'go', 'participle'],
    ['sent', 'send', 'past-or-participle'],
    ['finished', 'finish', 'past-or-participle'],
    ['hurried', 'hurry', 'past-or-participle'],
    ['walking', 'walk', 'ing'],
    ['scales', 'scale', 's'],
    ['deploy', 'deploy', 'base'],
    ['lay', 'lie', 'past'],
    ['lay', 'lay', 'base'],
    ['put', 'put', 'past-or-participle'],
    ['come', 'come', 'participle'],
  ] as const)('%s (лема %s) → %s', (word, lemma, form) => {
    expect(verbForm(word, lemma)).toBe(form);
  });

  it.each([
    ['was', 'past'],
    ['were', 'past'],
    ['been', 'participle'],
    ['being', 'ing'],
    ["'s", 's'],
    ["'m", 's'],
    ['had', 'past-or-participle'],
    ["'ve", 'base'],
    ['did', 'past'],
    ['done', 'participle'],
    ['would', 'base'],
  ] as const)('%s без леми → %s', (word, form) => {
    expect(verbForm(word)).toBe(form);
  });

  it('без леми спирається на множини форм неправильних', () => {
    expect(verbForm('took')).toBe('past');
    expect(verbForm('taken')).toBe('participle');
    expect(verbForm('made')).toBe('past-or-participle');
  });
});

describe('hasForm і омографи', () => {
  it('put/read/come підходять і як основа', () => {
    expect(hasForm('put', 'put', 'base')).toBe(true);
    expect(hasForm('read', 'read', 'base')).toBe(true);
    expect(hasForm('come', 'come', 'base')).toBe(true);
    expect(isBaseHomograph('beat')).toBe(true);
    expect(isBaseHomograph('went', 'go')).toBe(false);
  });
});

describe('looksLikeRegularPast', () => {
  it.each(['hurried', 'looked', 'used', 'flashed', 'occurred'])('%s — так', (word) => {
    expect(looksLikeRegularPast(word)).toBe(true);
  });
  it.each(['need', 'hundred', 'red', 'bed', 'wicked', 'indeed', 'speed'])('%s — ні', (word) => {
    expect(looksLikeRegularPast(word)).toBe(false);
  });
});

describe('IRREGULAR_VERBS', () => {
  it('щонайменше 180 записів без повторів основи', () => {
    expect(IRREGULAR_VERBS.length).toBeGreaterThanOrEqual(180);
    expect(new Set(IRREGULAR_VERBS.map((verb) => verb.v1)).size).toBe(IRREGULAR_VERBS.length);
  });

  it('теорія показує ті самі 64 дієслова, що й до розширення', () => {
    const taught = (['a', 'b', 'c'] as const).flatMap((group) => verbsInGroup(group).map((verb) => verb.v1));
    expect(taught).toHaveLength(64);
    expect(taught).toEqual([
      ...['cut', 'put', 'let', 'set', 'hit', 'cost', 'shut', 'read'],
      ...['build', 'send', 'spend', 'lend', 'buy', 'bring', 'think', 'catch', 'teach', 'find', 'lose', 'keep'],
      ...['sleep', 'meet', 'lead', 'pay', 'say', 'sell', 'tell', 'hold', 'make', 'hear', 'leave', 'feel'],
      ...['sit', 'stand', 'understand', 'win'],
      ...['be', 'begin', 'break', 'choose', 'do', 'drink', 'drive', 'eat', 'fall', 'fly', 'forget', 'get'],
      ...['give', 'go', 'grow', 'know', 'ride', 'rise', 'run', 'see', 'show', 'speak', 'take', 'throw'],
      ...['wake', 'wear', 'write', 'come'],
    ]);
  });

  it('V2_ONLY — лише те, що не буває ні V3, ні основою', () => {
    for (const form of ['went', 'took', 'saw', 'ran', 'began', 'fell']) expect(V2_ONLY.has(form), form).toBe(true);
    for (const form of ['sent', 'made', 'put', 'beat', 'lay', 'read']) expect(V2_ONLY.has(form), form).toBe(false);
  });

  it('V3_ONLY — лише те, що не буває ні V2, ні основою', () => {
    for (const form of ['gone', 'taken', 'seen', 'lain', 'been', 'done']) expect(V3_ONLY.has(form), form).toBe(true);
    for (const form of ['come', 'run', 'made', 'read']) expect(V3_ONLY.has(form), form).toBe(false);
  });
});

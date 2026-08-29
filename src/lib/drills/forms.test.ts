import { describe, expect, it } from 'vitest';

import { GAP_WHY, gapOptions, ingFromBase } from './forms';

describe('ingFromBase', () => {
  it('знає три орфографічні правила', () => {
    expect(ingFromBase('make')).toBe('making');
    expect(ingFromBase('see')).toBe('seeing');
    expect(ingFromBase('lie')).toBe('lying');
    expect(ingFromBase('run')).toBe('running');
    expect(ingFromBase('begin')).toBe('beginning');
    expect(ingFromBase('open')).toBe('opening');
    expect(ingFromBase('show')).toBe('showing');
  });
});

describe('gapOptions — правильні дієслова', () => {
  it('Past Simple: з -ed виводяться continuous і perfect без знання основи', () => {
    expect(gapOptions(['hoped'], 'ps', 'she')).toEqual({
      correct: 'hoped',
      options: ['hoped', 'was hoping', 'had hoped', 'has hoped'],
    });
    expect(gapOptions(['hopped'], 'ps', 'they')?.options).toEqual([
      'hopped',
      'were hopping',
      'had hopped',
      'have hopped',
    ]);
    expect(gapOptions(['tried'], 'ps', 'he')?.options[1]).toBe('was trying');
    expect(gapOptions(['agreed'], 'ps', 'we')?.options[1]).toBe('were agreeing');
  });

  it('Past Continuous: з -ing виводиться -ed', () => {
    expect(gapOptions(['was', 'hoping'], 'pc', 'she')).toEqual({
      correct: 'was hoping',
      options: ['was hoping', 'hoped', 'had hoped', 'has hoped'],
    });
    expect(gapOptions(['were', 'trying'], 'pc', 'they')?.options[1]).toBe('tried');
  });

  it('Past Perfect і Present Perfect: сусіди — інші часи тієї ж дії', () => {
    expect(gapOptions(['had', 'finished'], 'pp', 'she')?.options).toEqual([
      'had finished',
      'finished',
      'was finishing',
      'has finished',
    ]);
    expect(gapOptions(['have', 'finished'], 'prp', 'we')?.options).toEqual([
      'have finished',
      'finished',
      'had finished',
      'were finishing',
    ]);
  });

  it('велика літера з тексту зберігається в усіх варіантах', () => {
    expect(gapOptions(['Walked'], 'ps', null)?.options).toEqual([
      'Walked',
      'was walking',
      'had walked',
      'has walked',
    ].map((form) => form.charAt(0).toUpperCase() + form.slice(1)));
  });
});

describe('gapOptions — неправильні дієслова', () => {
  it('усі три форми беруться з таблиці', () => {
    expect(gapOptions(['went'], 'ps', 'he')).toEqual({
      correct: 'went',
      options: ['went', 'was going', 'had gone', 'has gone'],
    });
    expect(gapOptions(['had', 'seen'], 'pp', 'I')?.options).toEqual([
      'had seen',
      'saw',
      'was seeing',
      'have seen',
    ]);
    expect(gapOptions(['was', 'making'], 'pc', 'she')?.options[1]).toBe('made');
    expect(gapOptions(['were', 'running'], 'pc', 'they')?.options).toEqual([
      'were running',
      'ran',
      'had run',
      'have run',
    ]);
  });

  it('Present Continuous узгоджує допоміжне з підметом', () => {
    expect(gapOptions(['am', 'escalating'], 'prc', 'I')?.options).toEqual([
      'am escalating',
      'was escalating',
      'have escalated',
      'escalated',
    ]);
  });
});

describe('gapOptions — що не годиться у вправу', () => {
  it('be, заперечення, скорочення, три слова, невідома форма — null', () => {
    expect(gapOptions(['was'], 'ps', 'she')).toBeNull();
    expect(gapOptions(['had', 'not', 'seen'], 'pp', 'he')).toBeNull();
    expect(gapOptions(["hadn't", 'seen'], 'pp', 'he')).toBeNull();
    expect(gapOptions(["'ve", 'seen'], 'prp', 'I')).toBeNull();
    expect(gapOptions(['did', 'see'], 'ps', 'he')).toBeNull();
    expect(gapOptions(['walked'], 'fs', 'he')).toBeNull();
    expect(gapOptions(['pager'], 'ps', 'the')).toBeNull();
  });

  it('конструкція одразу після допоміжного — інша конструкція, не пропуск', () => {
    expect(gapOptions(['tired'], 'ps', 'was')).toBeNull();
  });

  it('пояснення є для кожного часу з вправи', () => {
    expect(Object.keys(GAP_WHY).sort()).toEqual(['pc', 'pp', 'prc', 'prp', 'ps']);
  });
});

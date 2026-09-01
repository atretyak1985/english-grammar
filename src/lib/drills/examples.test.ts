import { describe, expect, it } from 'vitest';

import { findExamples } from './examples';

const STORY = {
  title: 'Демо',
  body: `Yesterday the pager went off. I was watching a film, so I paused it and opened my laptop.
Production was down. It turned out that a junior dev had pushed a migration straight to main.`,
};

describe('findExamples', () => {
  it('знаходить речення зі словом і підписує його назвою тексту', () => {
    const out = findExamples([STORY], ['migration']);
    expect(out.migration).toEqual({
      sentence: 'It turned out that a junior dev had pushed a migration straight to main.',
      title: 'Демо',
    });
  });

  it('закоротке речення не приклад', () => {
    expect(findExamples([STORY], ['production'])).toEqual({});
  });

  it('слово, якого немає, лишається без прикладу, решта — з прикладами', () => {
    const out = findExamples([STORY], ['laptop', 'bulldoze']);
    expect(Object.keys(out)).toEqual(['laptop']);
  });

  it('шукає словоформу, не лему', () => {
    expect(findExamples([STORY], ['pause'])).toEqual({});
    expect(findExamples([STORY], ['paused']).paused?.sentence).toContain('paused it');
  });
});

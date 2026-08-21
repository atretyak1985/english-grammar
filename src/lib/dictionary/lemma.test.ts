import { describe, expect, it } from 'vitest';

import { lemmaCandidates } from './lemma';

describe('lemmaCandidates', () => {
  it('саме слово завжди перший кандидат', () => {
    for (const word of ['deployed', 'migrations', 'stopping', 'studies', 'easier', 'improve']) {
      expect(lemmaCandidates(word)[0]).toBe(word);
    }
  });

  it('зрізає суфікси відомих словоформ', () => {
    expect(lemmaCandidates('deployed')).toContain('deploy');
    expect(lemmaCandidates('migrations')).toContain('migration');
    expect(lemmaCandidates('stopping')).toContain('stop');
    expect(lemmaCandidates('studies')).toContain('study');
    expect(lemmaCandidates('easier')).toContain('easy');
  });

  it('дублікатів не повертає', () => {
    for (const word of ['stopped', 'passes', 'lying', 'happily', 'biggest']) {
      const candidates = lemmaCandidates(word);
      expect(new Set(candidates).size).toBe(candidates.length);
    }
  });

  it('коротке слово й абревіатуру лишає як є', () => {
    expect(lemmaCandidates('is')).toEqual(['is']);
    expect(lemmaCandidates('css')).toEqual(['css']);
  });
});

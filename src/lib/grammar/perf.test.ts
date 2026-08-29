import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { analyzeGrammar } from './index';

/**
 * SC-6: «Аліса» цілком — за півсекунди й детерміновано. Двигун стоїть на
 * шляху кожного запиту до бібліотеки, і повільний розбір відчувався б як
 * повільна сторінка; недетермінований — як мерехтіння підсвітки між
 * відкриттями тієї самої книжки.
 */
const ALICE = fs.readFileSync(
  path.join(__dirname, '..', '..', 'content', 'library', 'alice-in-wonderland', 'story.txt'),
  'utf8',
);

describe('analyzeGrammar — час і детермінізм', () => {
  it('«Аліса» розбирається за ≤ 500 мс після прогріву моделі', () => {
    analyzeGrammar(ALICE);
    const started = performance.now();
    const result = analyzeGrammar(ALICE);
    const elapsed = performance.now() - started;
    expect(result.matches.length).toBeGreaterThan(1000);
    expect(elapsed).toBeLessThanOrEqual(500);
  });

  it('два прогони дають побайтово однаковий результат', () => {
    const first = JSON.stringify(analyzeGrammar(ALICE));
    const second = JSON.stringify(analyzeGrammar(ALICE));
    expect(second).toBe(first);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tokenize } from '@/lib/analyzer/tenses';

/**
 * Уточнення моделлю без моделі: `review` тут двійник. Перевіряється наша
 * частина — що моделі йдуть САМЕ речення з хиткими збігами і рівно вони
 * (SC-10), що вердикт лягає на свій збіг, і що неуточнене лишається
 * двигуновим, а не зникає.
 */
const mocks = vi.hoisted(() => ({ review: vi.fn() }));

vi.mock('@/lib/analyzer/review', async (importActual) => {
  const actual = await importActual<typeof import('@/lib/analyzer/review')>();
  return { ...actual, review: mocks.review };
});

const { analyzeGrammar } = await import('./index');
const { planPieces, refineUncertain } = await import('./refine');

/**
 * Два речення з хиткими збігами навколо певного: «she'd gone» — 'd, «I am
 * going to work» — рух чи майбутнє. Середнє речення певне і моделі не варте.
 */
const TEXT =
  "She'd gone home already. The engineer finished the report. I am going to work now, and he watched.";

function reviewAnswers(byText: Record<string, { from: number; to: number; tense: string }[]>): void {
  mocks.review.mockImplementation((piece: string) => {
    const matches = byText[piece];
    if (matches === undefined) return Promise.resolve(null);
    return Promise.resolve({ matches, usage: { input: 10, output: 5, cacheRead: 0, cacheWrite: 0 } });
  });
}

beforeEach(() => {
  mocks.review.mockReset();
});

describe('planPieces', () => {
  it('бере лише речення з хиткими збігами, певні пропускає', () => {
    const { matches } = analyzeGrammar(TEXT);
    const { tokens, pieces } = planPieces(TEXT, matches);

    const texts = pieces.map((piece) =>
      tokens
        .slice(piece.start, piece.end + 1)
        .map((token) => token.raw)
        .join(''),
    );

    // Перше й третє речення хиткі, середнє — ні. Речення, що моделі не йдуть,
    // не входять і в ціну: слова рахуються лише по взятих проміжках.
    expect(texts).toEqual([
      "She'd gone home already.",
      'I am going to work now, and he watched.',
    ]);
    expect(pieces.map((piece) => piece.words)).toEqual([4, 9]);
  });

  it('без хитких збігів план порожній і безкоштовний', () => {
    const certain = 'The engineer finished the report before it started.';
    const { matches } = analyzeGrammar(certain);

    const plan = planPieces(certain, matches);

    expect(plan.pieces).toEqual([]);
    expect(plan.words).toBe(0);
  });

  it('SC-10: на «Алісі» спірним реченням дістається не більш як 10 % слів', () => {
    const alice = readFileSync(
      join(__dirname, '../../content/library/alice-in-wonderland/story.txt'),
      'utf8',
    );
    const { matches } = analyzeGrammar(alice);
    const plan = planPieces(alice, matches);

    const totalWords = tokenize(alice).filter((token) => token.word !== null).length;

    expect(plan.words).toBeGreaterThan(0);
    expect(plan.words / totalWords).toBeLessThanOrEqual(0.1);
  });
});

describe('refineUncertain', () => {
  it('вердикти лягають на свої збіги: підтверджений, змінений і знятий', async () => {
    const { matches } = analyzeGrammar(TEXT);
    const { tokens, pieces } = planPieces(TEXT, matches);
    const pieceTexts = pieces.map((piece) =>
      tokens
        .slice(piece.start, piece.end + 1)
        .map((token) => token.raw)
        .join(''),
    );

    // Перший проміжок: модель підтверджує pp на «She'd gone» (слова 0..1).
    // Другий: «am going to work» (слова 1..4) — модель каже prc, тобто рух.
    reviewAnswers({
      [pieceTexts[0] ?? '']: [{ from: 0, to: 1, tense: 'pp' }],
      [pieceTexts[1] ?? '']: [{ from: 1, to: 4, tense: 'prc' }],
    });

    const refinement = await refineUncertain(TEXT, matches);

    expect(refinement.checked).toBe(2);
    expect(refinement.confirmed).toBe(1);
    expect(refinement.retensed).toBe(1);
    expect(refinement.dropped).toBe(0);
    expect(refinement.usage).not.toBeNull();
    // Списувати є за що: обидва проміжки побували в моделі.
    expect(refinement.words).toBe(13);

    // Певні збіги двигуна недоторканні, перевірені — більше не хиткі.
    const byTense = refinement.matches.map((match) => ({ tense: match.tense, uncertain: match.uncertain }));
    expect(byTense).toContainEqual({ tense: 'pp', uncertain: undefined });
    expect(byTense).toContainEqual({ tense: 'prc', uncertain: undefined });
    expect(refinement.matches.some((match) => match.uncertain === true)).toBe(false);
  });

  it('модель не бачить конструкції — хиткий збіг знімається', async () => {
    const { matches } = analyzeGrammar("She'd gone home already.");
    reviewAnswers({}); // на все відповідь null не буде — але тут відповідь порожня
    mocks.review.mockResolvedValue({
      matches: [],
      usage: { input: 10, output: 5, cacheRead: 0, cacheWrite: 0 },
    });

    const refinement = await refineUncertain("She'd gone home already.", matches);

    expect(refinement.dropped).toBe(1);
    expect(refinement.matches.some((match) => match.ruleId === "pp.'d-v3")).toBe(false);
  });

  it('модель недоступна — розмітка двигуна лишається, платити нема за що', async () => {
    const { matches } = analyzeGrammar(TEXT);
    mocks.review.mockResolvedValue(null);

    const refinement = await refineUncertain(TEXT, matches);

    expect(refinement.matches).toEqual(matches);
    expect(refinement.usage).toBeNull();
    expect(refinement.words).toBe(0);
  });

  it('без хитких збігів модель не викликається взагалі', async () => {
    const certain = 'The engineer finished the report before it started.';
    const { matches } = analyzeGrammar(certain);

    const refinement = await refineUncertain(certain, matches);

    expect(mocks.review).not.toHaveBeenCalled();
    expect(refinement.matches).toEqual(matches);
  });
});

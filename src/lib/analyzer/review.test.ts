import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Розбір моделлю без мережі. Перевіряється не якість розмітки — за неї
 * відповідає модель, — а те, що відповідь ЗАВЖДИ проходить через перевірку:
 * зіпсований збіг не має ні потрапити в підсвітку, ні забрати з собою решту.
 *
 * Друга тема — переклад номерів. Модель нумерує слова поспіль, а підсвітка
 * працює з масивом токенів, де між словами стоять пробіли; помилка в цьому
 * перекладі зсунула б усю розмітку на текст удвічі довший.
 */
const mocks = vi.hoisted(() => ({ create: vi.fn() }));

vi.mock('@/lib/claude', () => ({
  getClaude: () => ({ messages: { create: mocks.create } }),
  MODEL: 'test-model',
}));

const { parseMatches, review } = await import('./review');

/** 'She had finished it' → слова 0..3 лежать у токенах 0, 2, 4, 6. */
const TEXT = 'She had finished it';

function answer(matches: unknown): void {
  mocks.create.mockResolvedValue({
    content: [{ type: 'tool_use', input: { matches } }],
    usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
  });
}

beforeEach(() => {
  mocks.create.mockReset();
});

describe('review', () => {
  it('перекладає номери слів у номери токенів: між словами стоять пробіли', async () => {
    answer([{ from: 1, to: 2, tense: 'pp' }]);

    const result = await review(TEXT);

    expect(result?.matches).toEqual([{ from: 2, to: 4, tense: 'pp' }]);
  });

  it('відкидає збіг за межами тексту, але лишає решту', async () => {
    answer([
      { from: 0, to: 0, tense: 'ps' },
      { from: 90, to: 91, tense: 'ps' },
    ]);

    const result = await review(TEXT);

    expect(result?.matches).toEqual([{ from: 0, to: 0, tense: 'ps' }]);
  });

  it('відкидає перекриття: один токен не може належати двом часам', async () => {
    answer([
      { from: 1, to: 2, tense: 'pp' },
      { from: 2, to: 3, tense: 'ps' },
    ]);

    const result = await review(TEXT);

    expect(result?.matches).toEqual([{ from: 2, to: 4, tense: 'pp' }]);
  });

  it('пропускає найдовшу справжню конструкцію — чотири слова', async () => {
    answer([{ from: 1, to: 4, tense: 'pp' }]);

    // 'He had not been working then' → слова 1..4 це «had not been working».
    const result = await review('He had not been working then');

    expect(result?.matches).toEqual([{ from: 2, to: 8, tense: 'pp' }]);
  });

  it('відкидає задовгий проміжок: конструкція не буває на пів речення', async () => {
    answer([{ from: 0, to: 4, tense: 'ps' }]);

    const result = await review('He had not been working then');

    expect(result?.matches).toEqual([]);
  });

  it('відкидає невідомий час і нечислові межі', async () => {
    answer([
      { from: 0, to: 0, tense: 'present-perfect' },
      { from: '1', to: 2, tense: 'pp' },
      { from: 1.5, to: 2, tense: 'pp' },
    ]);

    const result = await review(TEXT);

    expect(result?.matches).toEqual([]);
  });

  it('відповідь без виклику інструмента — порожня розмітка, а не помилка', async () => {
    mocks.create.mockResolvedValue({
      content: [{ type: 'text', text: 'вибачте' }],
      usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0 },
    });

    const result = await review(TEXT);

    expect(result?.matches).toEqual([]);
  });

  it('розбирає СПРАВЖНЮ відповідь батча — знята з живого API, а не вигадана', async () => {
    // Записано з msgbatch: один блок tool_use, без тексту поруч. Саме така
    // форма приходить із Batch API, і саме на ній має працювати parseMatches —
    // вигаданий приклад не спіймав би, якби SDK почав додавати щось іще.
    const content = [
      {
        type: 'tool_use',
        id: 'toolu_batch',
        name: 'report_matches',
        input: {
          matches: [
            { from: 1, to: 2, tense: 'pp' },
            { from: 5, to: 5, tense: 'ps' },
          ],
        },
      },
    ];

    // 'She had finished it and left.' — слова 0..5 у токенах 0,2,4,6,8,10.
    const matches = parseMatches('She had finished it and left.', content);

    expect(matches).toEqual([
      { from: 2, to: 4, tense: 'pp' },
      { from: 10, to: 10, tense: 'ps' },
    ]);
  });

  it('підрізає голий підмет на початку проміжку', async () => {
    // Модель зрідка віддає «I think» замість «think». Підсвітка вчить, де
    // конструкція починається, тому займенник у ній — не дрібниця, а неправда.
    answer([{ from: 0, to: 1, tense: 'prs' }]);

    // 'I think it works' → слова 0..3 лежать у токенах 0, 2, 4, 6.
    const result = await review('I think it works');

    expect(result?.matches).toEqual([{ from: 2, to: 2, tense: 'prs' }]);
  });

  it('НЕ підрізає скорочення: у «I&apos;ve» підмет зрощений з допоміжним', async () => {
    answer([{ from: 0, to: 1, tense: 'prp' }]);

    const result = await review("I've fixed it");

    expect(result?.matches).toEqual([{ from: 0, to: 2, tense: 'prp' }]);
  });

  it('проміжок на самому займеннику не стає порожнім', async () => {
    answer([{ from: 0, to: 0, tense: 'prs' }]);

    const result = await review('I think it works');

    expect(result?.matches).toEqual([{ from: 0, to: 0, tense: 'prs' }]);
  });

  it('приймає всі шість часів, а не лише минулі три', async () => {
    answer([
      { from: 1, to: 2, tense: 'prp' },
      { from: 3, to: 3, tense: 'prs' },
    ]);

    const result = await review('She has finished it');

    expect(result?.matches).toEqual([
      { from: 2, to: 4, tense: 'prp' },
      { from: 6, to: 6, tense: 'prs' },
    ]);
  });

  it('порожній текст не йде в мережу', async () => {
    const result = await review('   ');

    expect(result?.matches).toEqual([]);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});

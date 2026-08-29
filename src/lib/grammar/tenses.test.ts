import { describe, expect, it } from 'vitest';

import { analyzeGrammar, type GrammarMatch } from './index';

/**
 * Очікування з `src/lib/analyzer/tenses.test.ts`, прогнані крізь двигун.
 * Ті, що описували МЕЖІ шаблонного шару — «Present Simple без допоміжного не
 * видно», «'d мовчить», «going to виглядає як Continuous» — переписані: двигун
 * бачить форми, а не літери, і саме ці межі він прибирає. Коментар біля
 * кожного такого тесту каже, що змінилося і чому це правильно.
 *
 * Номери в очікуваннях — індекси токенів `tokenize`, між словами стоять
 * пробільні токени, тому слова лежать через один: 0, 2, 4, 6.
 */
function matches(text: string): Pick<GrammarMatch, 'from' | 'to' | 'tense'>[] {
  return analyzeGrammar(text).matches.map(({ from, to, tense }) => ({ from, to, tense }));
}

function ruleIds(text: string): string[] {
  return analyzeGrammar(text).matches.map((match) => match.ruleId);
}

describe('analyzeGrammar — теперішні часи', () => {
  it('have + V3 → Present Perfect одним проміжком', () => {
    expect(matches('We have finished the migration.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('has been + V-ing → той самий Present Perfect, що й простий перфект', () => {
    expect(matches('She has been working since six.')).toEqual([{ from: 2, to: 6, tense: 'prp' }]);
  });

  it('have been без -ing — перфект дієслова be', () => {
    expect(matches('I have been here.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('am/is/are + V-ing → Present Continuous', () => {
    expect(matches('I am reviewing your pull request.')).toEqual([{ from: 2, to: 4, tense: 'prc' }]);
  });

  it("doesn't + V1 → Present Simple, разом із запереченням", () => {
    expect(matches("She doesn't know yet.")).toEqual([{ from: 2, to: 4, tense: 'prs' }]);
  });

  it('прислівник між допоміжним і смисловим лишається всередині проміжку', () => {
    expect(matches('She has already seen it.')).toEqual([{ from: 2, to: 6, tense: 'prp' }]);
  });

  it('Present Simple без допоміжного ТЕПЕР видно — і основу, і форму на -s', () => {
    // У шаблонному шарі це була головна документована межа: «We deploy» —
    // чиста основа, а «scales» від іменника в множині відрізняється лише
    // роллю в реченні. Двигун бачить роль (теґ VERB), тому обидва — prs, і
    // «Fridays» іменником і лишається.
    expect(matches('We deploy on Fridays and it scales well.')).toEqual([
      { from: 2, to: 2, tense: 'prs' },
      { from: 12, to: 12, tense: 'prs' },
    ]);
  });

  it('лексичне have з іменником — Present Simple на самому have', () => {
    // Раніше — порожній список: шаблон не міг назвати час, не бачачи ролі
    // слова. Тепер «have» без V3 після нього — смислове «мати» у prs.
    expect(matches('I have a laptop.')).toEqual([{ from: 2, to: 2, tense: 'prs' }]);
    expect(ruleIds('I have a laptop.')).toEqual(['prs.have-lexical']);
  });

  it('is як самостійне дієслово — Present Simple', () => {
    expect(matches('The service is down.')).toEqual([{ from: 4, to: 4, tense: 'prs' }]);
  });

  it('-ing у прикметнику більше не дає хибного Continuous', () => {
    // «is interesting» для шаблона було нерозрізненне з «is working». Теґер
    // віддає interesting як ADJ, тому збіг — лише на «is», Present Simple.
    expect(matches('The talk is interesting.')).toEqual([{ from: 4, to: 4, tense: 'prs' }]);
  });
});

describe('analyzeGrammar — скорочення, приклеєні до підмета', () => {
  it("'ve + V3 → Present Perfect від першого токена", () => {
    expect(matches("I've fixed it.")).toEqual([{ from: 0, to: 2, tense: 'prp' }]);
  });

  it("'s перед V-ing — це is, отже Present Continuous", () => {
    expect(matches("She's working today.")).toEqual([{ from: 0, to: 2, tense: 'prc' }]);
  });

  it("'s перед однозначною третьою формою — це has, і без сумніву", () => {
    expect(analyzeGrammar("He's gone home.").matches).toEqual([
      { from: 0, to: 2, tense: 'prp', ruleId: "prp.'s-v3" },
    ]);
  });

  it("'s перед -ed — has чи is: перфект із позначкою сумніву", () => {
    expect(analyzeGrammar("He's finished it.").matches).toEqual([
      { from: 0, to: 2, tense: 'prp', ruleId: "prp.'s-v3", uncertain: true },
    ]);
  });

  it("'re + V-ing → Present Continuous", () => {
    expect(matches("They're waiting for the build.")).toEqual([{ from: 0, to: 2, tense: 'prc' }]);
  });

  it("'d перед V3 читається як had — Past Perfect під сумнівом", () => {
    // Шаблонний шар мовчав про 'd, і «finished» діставало Past Simple по
    // закінченню -ed — тобто не «нічого», а «не той час». Двигун ставить
    // перфект на весь проміжок, але чесно позначає: за 'd буває й would.
    expect(analyzeGrammar("He'd finished it.").matches).toEqual([
      { from: 0, to: 2, tense: 'pp', ruleId: "pp.'d-v3", uncertain: true },
    ]);
  });

  it("'d перед основою — це would, і часу тут немає", () => {
    const result = analyzeGrammar("He'd never do that.");
    expect(result.matches).toEqual([]);
    expect(result.skipped).toEqual([{ from: 0, to: 4, ruleId: 'skip.infinitive' }]);
  });
});

describe('analyzeGrammar — майбутні часи', () => {
  it('will + V1 → Future Simple одним проміжком', () => {
    expect(matches('We will deploy on Friday.')).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('will be + V-ing → Future Continuous', () => {
    expect(matches('I will be waiting at six.')).toEqual([{ from: 2, to: 6, tense: 'fc' }]);
  });

  it('will have + V3 → Future Perfect', () => {
    expect(matches('By Friday we will have shipped it.')).toEqual([{ from: 6, to: 10, tense: 'fp' }]);
  });

  it('will have been + V-ing → той самий Future Perfect', () => {
    expect(matches('It will have been running for a year.')).toEqual([{ from: 2, to: 8, tense: 'fp' }]);
  });

  it("'ll → Future Simple від першого токена", () => {
    expect(matches("I'll call you back.")).toEqual([{ from: 0, to: 2, tense: 'fs' }]);
  });

  it("won't + V1 → Future Simple разом із запереченням", () => {
    expect(matches("It won't scale.")).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('shall — той самий Future Simple; підмет у питанні входить у проміжок', () => {
    // Було {0, 2}: шаблон бачив «Shall we» як допоміжне плюс слово. Двигун
    // знає, що «we» — підмет інверсії, і тягне проміжок до смислового «start».
    expect(matches('Shall we start?')).toEqual([{ from: 0, to: 4, tense: 'fs' }]);
  });

  it('will be + прикметник — Future Simple дієслова be, а не Continuous', () => {
    expect(matches('The report will be ready.')).toEqual([{ from: 4, to: 6, tense: 'fs' }]);
  });

  it('will have + іменник — Future Simple смислового have, а не перфект', () => {
    expect(matches('We will have lunch later.')).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('довша форма виграє в коротшої: перфект не розпадається на fs плюс дієслово', () => {
    expect(matches('We will have finished by then.')).toEqual([{ from: 2, to: 6, tense: 'fp' }]);
  });

  it('be going to + V1 → Future Simple цілою конструкцією', () => {
    // Для шаблона це був Present Continuous «am going»: він не бачив, іменник
    // далі чи дієслово. Двигун бачить основу дієслова після «to».
    expect(analyzeGrammar('I am going to deploy it.').matches).toEqual([
      { from: 2, to: 8, tense: 'fs', ruleId: 'fs.going-to' },
    ]);
  });

  it('be going to + іменна група — рух, Present Continuous на «am going»', () => {
    expect(matches('I am going to the office.')).toEqual([{ from: 2, to: 4, tense: 'prc' }]);
  });

  it('be going to + слово, що буває й іменником, — майбутнє під сумнівом', () => {
    expect(analyzeGrammar('I am going to work.').matches).toEqual([
      { from: 2, to: 8, tense: 'fs', ruleId: 'fs.going-to', uncertain: true },
    ]);
  });
});

describe('analyzeGrammar — межа між минулим і теперішнім', () => {
  it('had + V3 лишається Past Perfect, а не стає теперішнім', () => {
    expect(matches('We had finished the migration.')).toEqual([{ from: 2, to: 4, tense: 'pp' }]);
  });

  it('was + V-ing лишається Past Continuous', () => {
    expect(matches('I was reviewing the pull request.')).toEqual([{ from: 2, to: 4, tense: 'pc' }]);
  });

  it('форма, що є і V2, і V3, не позначається двічі після have', () => {
    expect(matches('I have sent the invoice.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('те саме дієслово без have — звичайний Past Simple', () => {
    expect(matches('I sent the invoice.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });

  it('had + іменна група — лексичне had, Past Simple на самому had', () => {
    expect(analyzeGrammar('A tired engineer had lunch and left.').matches).toEqual([
      { from: 6, to: 6, tense: 'ps', ruleId: 'ps.had-lexical' },
      { from: 12, to: 12, tense: 'ps', ruleId: 'ps.v2' },
    ]);
  });
});

describe('analyzeGrammar — те, чого шаблонний шар не вмів', () => {
  it('дієприкметниковий прикметник не є дієсловом', () => {
    expect(matches('A tired engineer fixed it.')).toEqual([{ from: 6, to: 6, tense: 'ps' }]);
  });

  it('підмет у питанні входить у проміжок, а час лишається правильним', () => {
    expect(analyzeGrammar('Do cats eat bats?').matches).toEqual([
      { from: 0, to: 4, tense: 'prs', ruleId: 'prs.do-v1' },
    ]);
    expect(matches('Nor did Alice think it strange.')).toEqual([{ from: 2, to: 6, tense: 'ps' }]);
  });

  it('could + V1 — Past Simple від can (рішення власника)', () => {
    expect(ruleIds("She couldn't answer either question.")).toEqual(['ps.modal-past']);
  });

  it('інші модальні з основою — не час, а пропуск', () => {
    const result = analyzeGrammar('It would be worth the trouble; you might catch a bat.');
    expect(result.matches).toEqual([]);
    expect(result.skipped.map((skip) => skip.ruleId)).toEqual(['skip.infinitive', 'skip.infinitive']);
  });

  it('інфінітив після to — пропуск, навіть коли за формами це перфект', () => {
    const result = analyzeGrammar('She ought to have wondered at this.');
    expect(result.matches).toEqual([]);
    expect(result.skipped.map((skip) => skip.ruleId)).toEqual(['skip.modal', 'skip.infinitive']);
  });

  it('дієприкметник без допоміжного — пропуск', () => {
    const result = analyzeGrammar('Perhaps I shall see it written up somewhere.');
    expect(result.matches).toEqual([{ from: 4, to: 6, tense: 'fs', ruleId: 'fs.will-v1' }]);
    expect(result.skipped.map((skip) => skip.ruleId)).toEqual(['skip.participle']);
  });

  it('відновлення теґера: «hurried» як ADJ стає дієсловом, але з позначкою сумніву', () => {
    expect(analyzeGrammar('He looked at it, and then hurried on.').matches).toEqual([
      { from: 2, to: 2, tense: 'ps', ruleId: 'ps.v2' },
      { from: 12, to: 12, tense: 'ps', ruleId: 'ps.v2', uncertain: true },
    ]);
  });

  it('пасив дістає час свого be', () => {
    expect(ruleIds('He was called Jim and the flat is made of wood.')).toEqual(['ps.was-v3', 'prs.be-v3']);
    expect(matches('Its possessor was being paid thirty dollars.')).toEqual([{ from: 4, to: 8, tense: 'pc' }]);
  });

  it('was going to + V1 — майбутнє в минулому, за формою Past Continuous', () => {
    expect(analyzeGrammar('I was going to call you.').matches).toEqual([
      { from: 2, to: 8, tense: 'pc', ruleId: 'pc.was-going-to' },
    ]);
  });

  it('омограф основи й V2 без допоміжного — Past Simple під сумнівом', () => {
    expect(analyzeGrammar('She put it down.').matches).toEqual([
      { from: 2, to: 2, tense: 'ps', ruleId: 'ps.v2', uncertain: true },
    ]);
  });

  it('курсив Gutenberg не зсуває номери токенів', () => {
    expect(matches('the Rabbit _took a watch_ out and _looked_ at it.')).toEqual([
      { from: 4, to: 4, tense: 'ps' },
      { from: 14, to: 14, tense: 'ps' },
    ]);
  });

  it('скорочення, приклеєне до власної назви, теж читається', () => {
    expect(matches("Dinah'll miss me.")).toEqual([{ from: 0, to: 2, tense: 'fs' }]);
  });

  it('усі дев’ять конструкцій в одному тексті', () => {
    const text =
      'I have fixed it, I was working then, I will call you, we had left, we walk, she is reading, ' +
      'they will be waiting, it will have ended.';
    expect(matches(text).map((match) => match.tense)).toEqual([
      'prp',
      'pc',
      'fs',
      'pp',
      'prs',
      'prc',
      'fc',
      'fp',
    ]);
  });
});

import { describe, expect, it } from 'vitest';

import { analyzeText, findMatches, tokenize } from './tenses';

/**
 * Локальні правила підсвітки. Перевіряється не «чи гарна розмітка» — за якість
 * відповідає модель, — а три речі, які саме тут легко зламати:
 *
 *   1. проміжок конструкції: допоміжне і смислове дієслово мусять лягти в ОДИН
 *      збіг, інакше читач бачить два різні часи в одній формі;
 *   2. межа між минулим і теперішнім: `had finished` це `pp`, `have finished` —
 *      `prp`, і сплутати їх означає перевернути головну пастку теми;
 *   3. документовані МЕЖІ шару. Тести на те, що правило чогось НЕ знаходить,
 *      тут не менш важливі: вони тримають межу видимою, щоб наступний, хто
 *      захоче «дорозпізнати» Present Simple по закінченню -s, спершу побачив,
 *      чому цього не зробили.
 *
 * Номери в очікуваннях — індекси токенів, а між словами стоять пробільні
 * токени, тому слова лежать через один: 0, 2, 4, 6.
 */

/** Коротший запис: тільки збіги, без розмальованих токенів і статистики. */
function matches(text: string) {
  return findMatches(tokenize(text));
}

describe('findMatches — теперішні часи', () => {
  it('have + V3 → Present Perfect одним проміжком', () => {
    expect(matches('We have finished the migration.')).toEqual([
      { from: 2, to: 4, tense: 'prp' },
    ]);
  });

  it('has been + V-ing → той самий Present Perfect, що й простий перфект', () => {
    // Perfect Continuous складено в `prp` навмисно: тема подає обидві форми
    // одним розділом, і підсвітка не має розказувати іншу історію.
    expect(matches('She has been working since six.')).toEqual([
      { from: 2, to: 6, tense: 'prp' },
    ]);
  });

  it('have been без -ing — це звичайний перфект, а не Perfect Continuous', () => {
    expect(matches('I have been here.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('am/is/are + V-ing → Present Continuous', () => {
    expect(matches('I am reviewing your pull request.')).toEqual([
      { from: 2, to: 4, tense: 'prc' },
    ]);
  });

  it("doesn't + V1 → Present Simple, разом із запереченням", () => {
    expect(matches("She doesn't know yet.")).toEqual([{ from: 2, to: 4, tense: 'prs' }]);
  });

  it('прислівник між допоміжним і смисловим лишається всередині проміжку', () => {
    expect(matches('She has already seen it.')).toEqual([{ from: 2, to: 6, tense: 'prp' }]);
  });
});

describe('findMatches — скорочення, приклеєні до підмета', () => {
  // Токенізація ділить текст по пробілах, тому «I've» — один токен разом із
  // підметом. Не вміти його прочитати означало б не бачити теперішніх часів у
  // будь-якому живому тексті: саме так люди й пишуть.
  it("'ve + V3 → Present Perfect від першого токена", () => {
    expect(matches("I've fixed it.")).toEqual([{ from: 0, to: 2, tense: 'prp' }]);
  });

  it("'s перед V-ing — це is, отже Present Continuous", () => {
    expect(matches("She's working today.")).toEqual([{ from: 0, to: 2, tense: 'prc' }]);
  });

  it("'s перед третьою формою — це has, отже Present Perfect", () => {
    expect(matches("He's gone home.")).toEqual([{ from: 0, to: 2, tense: 'prp' }]);
  });

  it("'re + V-ing → Present Continuous", () => {
    expect(matches("They're waiting for the build.")).toEqual([
      { from: 0, to: 2, tense: 'prc' },
    ]);
  });

  it("'d не розбирається навмисно: за ним і had, і would", () => {
    // Скорочення лишається нерозпізнаним, але «finished» усе одно потрапляє
    // під правило -ed і дістає Past Simple — тобто ціна нерозібраного `'d`
    // не «нічого не підсвітилось», а «підсвітилось не тим часом». Саме тому
    // тут проміжок в один токен замість перфекта на два.
    expect(matches("He'd finished it.")).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });
});

describe('findMatches — межа між минулим і теперішнім', () => {
  it('had + V3 лишається Past Perfect, а не стає теперішнім', () => {
    expect(matches('We had finished the migration.')).toEqual([
      { from: 2, to: 4, tense: 'pp' },
    ]);
  });

  it('was + V-ing лишається Past Continuous', () => {
    expect(matches('I was reviewing the pull request.')).toEqual([
      { from: 2, to: 4, tense: 'pc' },
    ]);
  });

  it('форма, що є і V2, і V3, не позначається двічі після have', () => {
    // «sent» — група B, де V2 = V3. Правило перфекта споживає обидва токени,
    // тому правило «неправильне дієслово → Past Simple» до нього вже не дійде.
    expect(matches('I have sent the invoice.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('те саме дієслово без have — звичайний Past Simple', () => {
    expect(matches('I sent the invoice.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });
});

describe('findMatches — документовані межі локального шару', () => {
  it('лексичне have з іменником не вважається перфектом', () => {
    // «I have a laptop» — володіння, не конструкція. Локально воно лишається
    // без розмітки: назвати його Present Simple шаблон не може, бо не бачить
    // ролі слова в реченні. Це робить модель.
    expect(matches('I have a laptop.')).toEqual([]);
  });

  it('Present Simple без допоміжного локально не видно', () => {
    // Найважливіший тест цього блоку. «We deploy» — чиста основа дієслова, а
    // «scales» відрізняється від іменника в множині лише за контекстом.
    // Правило по закінченню -s підсвітило б половину іменників у тексті, тому
    // цього часу тут немає свідомо — його знаходить модель.
    expect(matches('We deploy on Fridays and it scales well.')).toEqual([]);
  });

  it('is як самостійне дієслово локально не видно', () => {
    expect(matches('The service is down.')).toEqual([]);
  });

  it('-ing у прикметнику дає хибний Present Continuous — і це відомо', () => {
    // Шаблон не відрізняє «is working» від «is interesting». Помилка свідома:
    // вона дешева, видима читачеві й знімається розбором моделі.
    expect(matches('The talk is interesting.')).toEqual([{ from: 4, to: 6, tense: 'prc' }]);
  });
});

describe('analyzeText', () => {
  it('рахує всі шість конструкцій, а не лише знайдені', () => {
    const { stats } = analyzeText('I have fixed it and I was working then.');

    expect(stats.prp.count).toBe(1);
    expect(stats.pc.count).toBe(1);
    // Ключі решти часів мусять існувати з нулем: панель статистики читає їх
    // без перевірки, і відсутній ключ поклав би сторінку.
    expect(stats.ps.count).toBe(0);
    expect(stats.prs.count).toBe(0);
    expect(stats.prc.count).toBe(0);
    expect(stats.pp.count).toBe(0);
  });

  it('розмальовує кожен токен конструкції, а межі позначає окремо', () => {
    const { tokens } = analyzeText('We have finished.');

    expect(tokens[2]?.tense).toBe('prp');
    expect(tokens[4]?.tense).toBe('prp');
    expect(tokens[2]?.startsMatch).toBe(true);
    expect(tokens[4]?.endsMatch).toBe(true);
    expect(tokens[0]?.tense).toBeNull();
  });
});

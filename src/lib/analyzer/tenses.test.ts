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
    expect(matches('We have finished the migration.')).toEqual([{ from: 2, to: 4, tense: 'prp' }]);
  });

  it('has been + V-ing → той самий Present Perfect, що й простий перфект', () => {
    // Perfect Continuous складено в `prp` навмисно: тема подає обидві форми
    // одним розділом, і підсвітка не має розказувати іншу історію.
    expect(matches('She has been working since six.')).toEqual([{ from: 2, to: 6, tense: 'prp' }]);
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
    expect(matches("They're waiting for the build.")).toEqual([{ from: 0, to: 2, tense: 'prc' }]);
  });

  it("'d не розбирається навмисно: за ним і had, і would", () => {
    // Скорочення лишається нерозпізнаним, але «finished» усе одно потрапляє
    // під правило -ed і дістає Past Simple — тобто ціна нерозібраного `'d`
    // не «нічого не підсвітилось», а «підсвітилось не тим часом». Саме тому
    // тут проміжок в один токен замість перфекта на два.
    expect(matches("He'd finished it.")).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });
});

describe('findMatches — майбутні часи', () => {
  it('will + V1 → Future Simple одним проміжком', () => {
    expect(matches('We will deploy on Friday.')).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('will be + V-ing → Future Continuous', () => {
    expect(matches('I will be waiting at six.')).toEqual([{ from: 2, to: 6, tense: 'fc' }]);
  });

  it('will have + V3 → Future Perfect', () => {
    expect(matches('By Friday we will have shipped it.')).toEqual([
      { from: 6, to: 10, tense: 'fp' },
    ]);
  });

  it('will have been + V-ing → той самий Future Perfect', () => {
    // Perfect Continuous складено в `fp` так само, як у минулому й теперішньому:
    // три часи мусять поводитися однаково, інакше матриця перестає бути системою.
    expect(matches('It will have been running for a year.')).toEqual([
      { from: 2, to: 8, tense: 'fp' },
    ]);
  });

  it("'ll → Future Simple від першого токена", () => {
    expect(matches("I'll call you back.")).toEqual([{ from: 0, to: 2, tense: 'fs' }]);
  });

  it("won't + V1 → Future Simple разом із запереченням", () => {
    expect(matches("It won't scale.")).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('shall — той самий Future Simple, а не окремий час', () => {
    // Питання з інверсією: підмет «we» стоїть між shall і start, і проміжок
    // тягнеться через нього до дієслова.
    expect(matches('Shall we start?')).toEqual([{ from: 0, to: 4, tense: 'fs' }]);
  });

  it('will be + прикметник — Future Simple дієслова be, а не Continuous', () => {
    // «will be ready» — тут `be` смислове. Правило Continuous не спрацьовує,
    // бо далі немає -ing, і конструкцію дожене загальне правило will + слово.
    expect(matches('The report will be ready.')).toEqual([{ from: 4, to: 6, tense: 'fs' }]);
  });

  it('will have + іменник — Future Simple смислового have, а не перфект', () => {
    expect(matches('We will have lunch later.')).toEqual([{ from: 2, to: 4, tense: 'fs' }]);
  });

  it('довша форма виграє в коротшої: перфект не розпадається на fs плюс дієслово', () => {
    // Найважливіший тест блоку. Якби правило «will + слово» перевірялося раніше,
    // «will have finished» дало б Future Simple на «will have» і окремо
    // підсвічене «finished» як Past Simple по закінченню -ed.
    expect(matches('We will have finished by then.')).toEqual([{ from: 2, to: 6, tense: 'fp' }]);
  });
});

describe('findMatches — межа між минулим і теперішнім', () => {
  it('had + V3 лишається Past Perfect, а не стає теперішнім', () => {
    expect(matches('We had finished the migration.')).toEqual([{ from: 2, to: 4, tense: 'pp' }]);
  });

  it('was + V-ing лишається Past Continuous', () => {
    expect(matches('I was reviewing the pull request.')).toEqual([{ from: 2, to: 4, tense: 'pc' }]);
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

describe('findMatches — іменники на -ing після was/were', () => {
  // Головна пастка тексту «Аліси»: «There was nothing so very remarkable» —
  // шаблон «was + …ing» бачив у nothing дієприкметник і малював Past Continuous.
  it('was nothing → Past Simple на самому was, а не Past Continuous', () => {
    expect(matches('There was nothing here.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });

  it('was something → теж Past Simple на was', () => {
    expect(matches('There was something odd.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });

  it('King — іменник, а не V-ing: підсвічується лише said', () => {
    expect(matches('the King said nothing.')).toEqual([{ from: 4, to: 4, tense: 'ps' }]);
  });

  it('коротка основа не робить слово дієприкметником, крім справжніх being/doing/going', () => {
    expect(matches('It was a ring.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
    expect(matches('She was doing it.')).toEqual([{ from: 2, to: 4, tense: 'pc' }]);
    expect(matches('He was using it.')).toEqual([{ from: 2, to: 4, tense: 'pc' }]);
  });
});

describe('findMatches — інверсія в питаннях і після nor', () => {
  it('did + займенник + дієслово → один проміжок Past Simple', () => {
    expect(matches('Did you see it?')).toEqual([{ from: 0, to: 4, tense: 'ps' }]);
  });

  it('did + власна назва + дієслово → один проміжок Past Simple', () => {
    expect(matches('nor did Alice think it strange.')).toEqual([{ from: 2, to: 6, tense: 'ps' }]);
  });

  it('had + займенник + V3 → один проміжок Past Perfect', () => {
    expect(matches('Had you tested it?')).toEqual([{ from: 0, to: 4, tense: 'pp' }]);
  });

  it('was + займенник + V-ing → Past Continuous через підмет', () => {
    expect(matches('Was she reading?')).toEqual([{ from: 0, to: 4, tense: 'pc' }]);
  });

  it('was + займенник без V-ing → Past Simple на самому was', () => {
    expect(matches('Was she late?')).toEqual([{ from: 0, to: 0, tense: 'ps' }]);
  });

  it('have + займенник + V3 → Present Perfect через підмет', () => {
    expect(matches('Have you seen it?')).toEqual([{ from: 0, to: 4, tense: 'prp' }]);
  });

  it('will + займенник + дієслово → Future Simple через підмет', () => {
    expect(matches('Will you come?')).toEqual([{ from: 0, to: 4, tense: 'fs' }]);
  });

  it('do + займенник + дієслово → Present Simple через підмет', () => {
    expect(matches('Do you deploy on Fridays?')).toEqual([{ from: 0, to: 4, tense: 'prs' }]);
  });

  it('is + займенник + V-ing → Present Continuous через підмет', () => {
    expect(matches('Is it raining?')).toEqual([{ from: 0, to: 4, tense: 'prc' }]);
  });

  it('самостійне did після займенника не тягнеться до прийменника', () => {
    // «I did it for you» — тут did смислове, і проміжок мусить лишитися на
    // одному слові, а не дотягнутися до «for».
    expect(matches('I did it for you.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });

  it('самостійне had після займенника не стає перфектом', () => {
    // Раніше «had it» позначалось Past Perfect. Проміжок не тягнеться до «it»:
    // після had без V3 перфекта немає, а саме had — звичайний Past Simple
    // (have є в повній таблиці неправильних дієслів двигуна).
    expect(matches('She had it in her pocket.')).toEqual([{ from: 2, to: 2, tense: 'ps' }]);
  });

  it('проміжок не переходить через межу речення', () => {
    // «did.» закінчує речення — наступне «Then» не має стати його підметом.
    expect(matches('Yes, I did. Then we left.')).toEqual([
      { from: 4, to: 4, tense: 'ps' },
      { from: 10, to: 10, tense: 'ps' },
    ]);
  });
});

describe('findMatches — кілька прислівників між допоміжним і смисловим', () => {
  it('had never before seen → один проміжок Past Perfect', () => {
    expect(matches('She had never before seen it.')).toEqual([{ from: 2, to: 8, tense: 'pp' }]);
  });

  it('had quite forgotten → один проміжок Past Perfect', () => {
    expect(matches('I had quite forgotten.')).toEqual([{ from: 2, to: 6, tense: 'pp' }]);
  });

  it('заперечення not лишається всередині проміжку', () => {
    expect(matches('We had not seen it.')).toEqual([{ from: 2, to: 6, tense: 'pp' }]);
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

  it('be going to локально виглядає як Present Continuous', () => {
    // «going to deploy» — майбутнє, «going to the office» — рух, і на поверхні
    // вони однакові. Шаблон не бачить, іменник далі чи дієслово, тому обидва
    // випадки лишаються Present Continuous, а розрізняє їх модель.
    expect(matches('I am going to deploy it.')).toEqual([{ from: 2, to: 4, tense: 'prc' }]);
  });

  it('-ing у прикметнику дає хибний Present Continuous — і це відомо', () => {
    // Шаблон не відрізняє «is working» від «is interesting». Помилка свідома:
    // вона дешева, видима читачеві й знімається розбором моделі.
    expect(matches('The talk is interesting.')).toEqual([{ from: 4, to: 6, tense: 'prc' }]);
  });
});

describe('analyzeText', () => {
  it('рахує всі девʼять конструкцій, а не лише знайдені', () => {
    const { stats } = analyzeText('I have fixed it, I was working then and I will call you.');

    expect(stats.prp.count).toBe(1);
    expect(stats.pc.count).toBe(1);
    expect(stats.fs.count).toBe(1);
    // Ключі решти часів мусять існувати з нулем: панель статистики читає їх
    // без перевірки, і відсутній ключ поклав би сторінку.
    expect(stats.ps.count).toBe(0);
    expect(stats.pp.count).toBe(0);
    expect(stats.prs.count).toBe(0);
    expect(stats.prc.count).toBe(0);
    expect(stats.fc.count).toBe(0);
    expect(stats.fp.count).toBe(0);
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

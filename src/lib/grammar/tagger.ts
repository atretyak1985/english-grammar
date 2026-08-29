import winkNLP, { type ItemToken, type ItsFunction, type WinkMethods } from 'wink-nlp';
import englishModel from 'wink-eng-lite-web-model';

import { tokenize } from '@/lib/analyzer/tenses';

/**
 * Частиномовна розмітка тексту, вирівняна з токенами `tokenize`. Двигун бачить
 * слова так, як їх ділить wink (для нього «she's» — це *she* + *'s*), а
 * підсвітка адресує токени `tokenize` (там «she's» — один токен), тому кожне
 * wink-слово тут знає номер СВОГО токена. Це єдине місце, де дві нумерації
 * зустрічаються.
 *
 * Вирівнювання — через символьні зсуви, а не через порівняння слів: wink
 * віддає для кожного токена пробіли перед ним (`precedingSpaces`), і
 * конкатенація відновлює текст побайтово (перевірено на обох книжках
 * бібліотеки). Отже для кожного wink-токена відомий початок у тексті, а
 * токени `tokenize` — це просто відрізки того ж тексту.
 */
export interface TaggedWord {
  /** Індекс у масиві `tokenize(text)` — токен-слово, що містить це wink-слово. */
  token: number;
  /** Слово як у тексті. */
  text: string;
  /** Нижній регістр, друкарський апостроф зведено до прямого. */
  lower: string;
  lemma: string;
  /** Universal POS від wink: VERB, AUX, ADJ, NOUN, PRON, PROPN, DET, ADV, ADP, PART, PUNCT … */
  pos: string;
}

/**
 * Модель з одноразовим `metaCER`. У пакеті моделі цей завантажувач на кожному
 * виклику робить `machines = JSON.stringify(machines)` над власним модулем:
 * другий екземпляр отримує рядок, серіалізований двічі, двадцятий — падає з
 * RangeError. Решта завантажувачів або повертають незмінні дані, або (core)
 * читають свою копію, тому їх не чіпаємо.
 */
const cerMetaModel = (englishModel.metaCER as () => unknown)();
const model: typeof englishModel = { ...englishModel, metaCER: () => cerMetaModel };

/**
 * Новий екземпляр wink на кожен виклик — навмисно, а не з недбалості. Екземпляр
 * тримає кеш токенів, який живе МІЖ документами: перший `readDoc` на свіжому
 * екземплярі ділив «Alice’s» інакше, ніж другий, і «Аліса», розібрана
 * одразу після старту процесу, відрізнялася від розібраної після прогріву на
 * два десятки токенів. Спільний екземпляр зробив би результат залежним від
 * історії запитів, а не від тексту. Свіжий екземпляр коштує ~25 мс — модель
 * уже в пам'яті, будуються лише автомати, — і повертає той самий результат
 * для того самого тексту завжди.
 */
function nlp(): WinkMethods {
  return winkNLP(model, ['sbd', 'pos']);
}

/**
 * Типи wink не сходяться між собою: `its.lemma` оголошено з іншим набором
 * параметрів, ніж приймає `token.out()`, хоча в рантаймі це одне й те саме.
 * Звужуємо в одному місці, щоб решта коду лишалася типізованою.
 */
function read(item: ItemToken, helper: unknown): string {
  return String(item.out(helper as ItsFunction<string>));
}

function normalizeApostrophes(value: string): string {
  return value.replace(/[’‘]/g, "'");
}

/**
 * Скорочення, які wink не відділив, бо вони приклеєні до власної назви:
 * «Dinah’ll miss me» — один PROPN. Без розщеплення Future Simple тут зникав би.
 * Розщеплюються лише однозначні: 'll, 've, 're, 'm і 'd; про «'s» після
 * власної назви wink уже сказав своє — це присвійне.
 */
const GLUED_CONTRACTIONS: Record<string, string> = {
  "'ll": 'will',
  "'ve": 'have',
  "'re": 'be',
  "'m": 'be',
  "'d": 'would',
};

function splitGlued(word: TaggedWord): TaggedWord[] {
  if (word.pos === 'AUX') return [word];
  const match = /^(.+)('(?:ll|ve|re|m|d))$/.exec(word.lower);
  if (!match) return [word];
  const [, head, suffix] = match;
  if (!head || !suffix) return [word];
  const lemma = GLUED_CONTRACTIONS[suffix];
  if (!lemma) return [word];
  return [
    { ...word, text: word.text.slice(0, head.length), lower: head, lemma: head },
    { token: word.token, text: word.text.slice(head.length), lower: suffix, lemma, pos: 'AUX' },
  ];
}

export function tag(text: string): TaggedWord[] {
  // Підкреслення — курсив Gutenberg («_very_»). Заміна на пробіл зберігає
  // довжину, тож зсуви лишаються зсувами оригіналу, а wink не бачить «_» як
  // окремих незрозумілих токенів усередині речення.
  const prepared = text.replace(/_/g, ' ');

  const tokens = tokenize(text);
  const ends: number[] = [];
  let offset = 0;
  for (const token of tokens) {
    offset += token.raw.length;
    ends.push(offset);
  }

  const engine = nlp();
  const its = engine.its;
  const doc = engine.readDoc(prepared);

  const words: TaggedWord[] = [];
  let position = 0;
  let tokenIndex = 0;

  doc.tokens().each((item: ItemToken) => {
    const spaces = read(item, its.precedingSpaces);
    const value = read(item, its.value);
    position += spaces.length;
    const start = position;
    position += value.length;

    // Пробільні токени (якщо модель такі віддає) не слова — але зсув їх рахує.
    if (/^\s*$/.test(value)) return;

    while (tokenIndex < ends.length && start >= (ends[tokenIndex] ?? Infinity)) tokenIndex += 1;

    const word: TaggedWord = {
      token: tokenIndex,
      text: value,
      lower: normalizeApostrophes(value.toLowerCase()),
      lemma: normalizeApostrophes(read(item, its.lemma)),
      pos: read(item, its.pos),
    };
    words.push(...splitGlued(word));
  });

  return words;
}

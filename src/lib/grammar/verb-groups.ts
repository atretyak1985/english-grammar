import { V2_FORMS } from '@/data/irregular-verbs';

import { BE_WORDS, MODALS, PARTICIPIAL_ADJECTIVES, hasForm, looksLikeRegularPast, verbForm } from './morphology';
import type { TaggedWord } from './tagger';

/**
 * Збирання дієслівних груп із послідовності теґованих слів. Група — це те, що
 * читач має побачити однією підсвіткою: допоміжні, заперечення, прислівник
 * між ними, підмет у питанні й смислове дієслово. Правила (`rules.ts`) потім
 * дивляться лише на ланцюжок дієслів у групі — решта слів потрібна тільки для
 * меж проміжку.
 */
export interface VerbGroup {
  /** Індекси токенів `tokenize`, які покриває група, без повторів і за зростанням. */
  tokens: number[];
  /** Дієслова групи в порядку тексту (плюс «to» у конструкції be going to). */
  chain: TaggedWord[];
  /** У питанні підмет стоїть між допоміжним і смисловим: «Do cats eat bats?» */
  subjectInside: boolean;
  /** Є not / n't між допоміжним і смисловим. */
  negated: boolean;
  /** Хоч одне слово ланцюжка відновлене з ADJ/NOUN — його форма під сумнівом. */
  recovered: boolean;
  /**
   * Група стоїть після «to» або після каузатива з додатком («made her feel»):
   * це інфінітив, а не фінітна форма, який би вигляд не мав ланцюжок.
   */
  infinitive: boolean;
}

/** Прислівники, які носії ставлять між допоміжним і смисловим дієсловом. */
const INNER_ADVERBS: ReadonlySet<string> = new Set([
  'already',
  'always',
  'before',
  'constantly',
  'ever',
  'forever',
  'just',
  'much',
  'never',
  'once',
  'only',
  'since',
  'still',
  'yet',
]);

/** Леми, після яких -ed слово — стан, а не дія: «was tired», «looked worried». */
const COPULAS: ReadonlySet<string> = new Set([
  'be',
  'get',
  'seem',
  'look',
  'feel',
  'become',
  'appear',
  'remain',
  'stay',
  'sound',
]);

const DEGREE_WORDS: ReadonlySet<string> = new Set(['very', 'so', 'quite', 'too', 'rather']);
const POSSESSIVES: ReadonlySet<string> = new Set(['my', 'your', 'his', 'her', 'its', 'our', 'their']);

/**
 * Означники, після яких дієслова не буває. Саме список, а не теґ DET: wink
 * дає DET і словам «all», «that», після яких дієслово стоїть вільно
 * («it all seemed», «all that glitters»).
 */
const ARTICLES: ReadonlySet<string> = new Set([
  'a',
  'an',
  'the',
  'this',
  'these',
  'those',
  'every',
  'each',
  'some',
  'any',
  'no',
  'another',
]);

function isDeterminer(word: TaggedWord): boolean {
  return ARTICLES.has(word.lower) || POSSESSIVES.has(word.lower);
}

/** Дієслова, після яких додаток + основа — інфінітив без to: «made her feel», «see it pop». */
const CAUSATIVES: ReadonlySet<string> = new Set([
  'make',
  'let',
  'help',
  'see',
  'hear',
  'feel',
  'watch',
  'have',
]);

/** Після цих слів допоміжне перед підметом — інверсія питання чи «nor did …». */
const INVERTERS: ReadonlySet<string> = new Set([
  'what',
  'why',
  'where',
  'when',
  'how',
  'who',
  'whom',
  'which',
  'whose',
  'nor',
  'neither',
  'so',
  'never',
  'seldom',
  'rarely',
  'hardly',
  'scarcely',
  'only',
]);

/** Відносні займенники обривають підмет: «it was I who took» — це не інверсія. */
const RELATIVES: ReadonlySet<string> = new Set(['who', 'whom', 'which', 'that', 'whose']);

const SUBJECT_POS: ReadonlySet<string> = new Set(['PRON', 'PROPN', 'DET', 'NOUN', 'ADJ', 'NUM']);

function isNot(word: TaggedWord): boolean {
  return word.lemma === 'not' || word.lower === 'not' || word.lower === "n't";
}

function isInnerAdverb(word: TaggedWord): boolean {
  return word.pos === 'ADV' || INNER_ADVERBS.has(word.lower);
}

function isModal(word: TaggedWord): boolean {
  return MODALS.has(word.lower) || MODALS.has(word.lemma);
}

/**
 * Слово з теґом дієслова — або відновлене з ADJ/NOUN, якщо на це є підстави.
 * Зворотна поправка теґера теж потрібна: «with their heads downward» wink
 * віддає як VERB, а після означника чи присвійного дієслово стояти не може —
 * там іменник, хай і схожий на форму на -s.
 */
function isVerbLike(words: readonly TaggedWord[], index: number): boolean {
  const word = words[index];
  if (!word) return false;
  if (word.pos === 'VERB') {
    const before = words[index - 1];
    if (!before) return true;
    // «a furnished flat», «the making of»: одразу після означника — не фінітне дієслово.
    if (isDeterminer(before)) return false;
    const nounLike = hasForm(word.lower, word.lemma, 'base') || verbForm(word.lower, word.lemma) === 's';
    // «that's very like a mouse»: після слова міри «like» — прийменник, хоч
    // wink і бачить дієслово. Лише like: «I'd rather stay» — дієслово справжнє.
    if (word.lower === 'like' && DEGREE_WORDS.has(before.lower)) return false;
    // «will have lunch»: після допоміжного, з яким форма не в'яжеться, схоже
    // на основу слово — додаток, а не нове дієслово.
    if (nounLike && before.pos === 'AUX' && auxClass(before) !== 'lexical' && !continues(before, word)) return false;
    return true;
  }
  if (word.pos === 'AUX') return true;
  return isRecoverable(words, index);
}

type AuxClass = 'modal' | 'do' | 'have' | 'be' | 'lexical';

function auxClass(word: TaggedWord): AuxClass {
  if (word.lower === "'d" || isModal(word)) return 'modal';
  if (word.lemma === 'do') return 'do';
  if (word.lemma === 'have' || word.lower === "'ve" || word.lower === 'having') return 'have';
  if (isBeForm(word)) return 'be';
  return 'lexical';
}

/**
 * Чи може слово продовжити ланцюжок після допоміжного. Після did — лише
 * основа, після have — лише V3, після be — -ing або V3 (пасив). Теґер часом
 * бачить дієслово там, де його бути не може («Do bats eat» — bats як VERB),
 * і ця перевірка повертає такі слова назад у підмети.
 */
function continues(previous: TaggedWord, word: TaggedWord): boolean {
  const form = verbForm(word.lower, word.lemma);
  const base = hasForm(word.lower, word.lemma, 'base');
  switch (auxClass(previous)) {
    case 'modal':
      // «'d» — і would (+ основа), і had (+ V3): пропускаємо обидва варіанти.
      if (previous.lower === "'d") return base || form === 'participle' || form === 'past-or-participle';
      return base;
    case 'do':
      return base;
    case 'have':
      return form === 'participle' || form === 'past-or-participle';
    case 'be':
      return form === 'ing' || form === 'participle' || form === 'past-or-participle';
    case 'lexical':
      return false;
  }
}

/**
 * Відновлення після допоміжного. Після did чи модального наступне повнозначне
 * слово — основа дієслова, навіть якщо теґер назвав його іменником («it
 * didn't much matter», «will work»); після had — дієприкметник («had been
 * flung», де wink бачить у flung прикметник). Це вимога граматики, а не
 * здогад, тому збіг не позначається сумнівним. Після be та сама морфологія
 * означає або пасив («was flung»), або стан («was tired»), і тут сумнів
 * лишається: стоп-лист дієприкметникових прикметників знімає лише очевидне.
 */
function recoverAfterAux(previous: TaggedWord, word: TaggedWord): 'certain' | 'uncertain' | null {
  if (word.pos !== 'NOUN' && word.pos !== 'ADJ') return null;
  if (PARTICIPIAL_ADJECTIVES.has(word.lower)) return null;
  const form = verbForm(word.lower, word.lemma);
  const participle = form === 'participle' || form === 'past-or-participle';
  switch (auxClass(previous)) {
    case 'do':
    case 'modal':
      return word.pos === 'NOUN' && hasForm(word.lower, word.lemma, 'base') ? 'certain' : null;
    case 'have':
      return participle ? 'certain' : null;
    case 'be':
      return participle ? 'uncertain' : null;
    case 'lexical':
      return null;
  }
}

/** «let's go», «let us see» — наказ, а не минуле від let. */
function isLetUs(words: readonly TaggedWord[], index: number): boolean {
  const word = words[index];
  const after = words[index + 1];
  return word?.lower === 'let' && (after?.lower === "'s" || after?.lower === 'us');
}

/**
 * Відновлення теґера. Модель віддає «and then hurried on» як ADJ — прикметник
 * «поспішний» — і без цього правила Past Simple тут просто зникав би. Слово з
 * теґом ADJ/NOUN стає дієсловом, якщо за морфологією воно минуле, не є
 * дієприкметниковим прикметником і перед ним нема ані копули («was tired»),
 * ані означника («the hurried steps»), ані слова міри («very tired»).
 */
function isRecoverable(words: readonly TaggedWord[], index: number): boolean {
  const word = words[index];
  if (!word || (word.pos !== 'ADJ' && word.pos !== 'NOUN')) return false;
  if (PARTICIPIAL_ADJECTIVES.has(word.lower)) return false;
  if (!looksLikeRegularPast(word.lower) && !V2_FORMS.has(word.lower)) return false;
  for (let back = 1; back <= 2; back += 1) {
    const before = words[index - back];
    if (!before) break;
    if (before.pos === 'PUNCT') break;
    if (
      COPULAS.has(before.lemma) ||
      BE_WORDS.has(before.lower) ||
      isDeterminer(before) ||
      before.pos === 'DET' ||
      before.pos === 'ADP' ||
      DEGREE_WORDS.has(before.lower)
    ) {
      return false;
    }
  }
  return true;
}

/** Смислове дієслово закриває групу; be/have/do й модальні самі по собі — ні. */
function closesGroup(word: TaggedWord): boolean {
  return auxClass(word) === 'lexical';
}

function isBeForm(word: TaggedWord): boolean {
  return word.lemma === 'be' || BE_WORDS.has(word.lower);
}

/**
 * Основа після «going to». Теґер віддає «like» у «going to like it» як
 * прийменник, а «work» у «going to work» — як іменник; перше приймаємо як
 * дієслово напевно, друге — з позначкою сумніву (див. виклик).
 */
function isGoingToVerb(word: TaggedWord): boolean {
  if (!hasForm(word.lower, word.lemma, 'base')) return false;
  if (word.pos === 'VERB' || word.lower === 'like') return true;
  return word.pos === 'NOUN';
}

/** Перед групою стоїть «to» — інфінітив: «to hear», «ought to have wondered». */
function afterTo(words: readonly TaggedWord[], start: number): boolean {
  const before = words[start - 1];
  return before !== undefined && before.lower === 'to' && before.pos !== 'PUNCT';
}

/**
 * Основа після каузатива з додатком: «made her feel», «see it pop», «hear the
 * Rabbit say». Додаток — займенник або іменна група до трьох слів.
 */
function afterCausative(words: readonly TaggedWord[], start: number): boolean {
  const first = words[start];
  if (!first || !hasForm(first.lower, first.lemma, 'base')) return false;
  let index = start - 1;
  let objectWords = 0;
  while (index >= 0 && objectWords < 3) {
    const word = words[index];
    if (!word || !SUBJECT_POS.has(word.pos)) break;
    objectWords += 1;
    index -= 1;
  }
  if (objectWords === 0) return false;
  const governor = words[index];
  return governor !== undefined && governor.pos === 'VERB' && CAUSATIVES.has(governor.lemma);
}

/** Чи можна після цього допоміжного чекати підмет — тобто чи це інверсія. */
function inversionAllowed(words: readonly TaggedWord[], start: number): boolean {
  const before = words[start - 1];
  if (!before) return true;
  if (before.pos === 'PUNCT' || before.pos === 'CCONJ') return true;
  return INVERTERS.has(before.lower);
}

export function collectGroups(words: readonly TaggedWord[]): VerbGroup[] {
  const groups: VerbGroup[] = [];
  let index = 0;

  while (index < words.length) {
    if (!isVerbLike(words, index)) {
      index += 1;
      continue;
    }
    const first = words[index];
    if (!first) break;

    const chain: TaggedWord[] = [first];
    const tokens = new Set<number>([first.token]);
    let recovered = first.pos !== 'VERB' && first.pos !== 'AUX';
    let subjectInside = false;
    let negated = false;
    const infinitive = afterTo(words, index) || afterCausative(words, index) || isLetUs(words, index);

    let next = index + 1;
    if (!closesGroup(first)) {
      /** Слова, що ввійдуть у групу, лише якщо після них знайдеться дієслово. */
      let pending: TaggedWord[] = [];
      let subjectSeen = false;
      const mayInvert = first.pos === 'AUX' && inversionAllowed(words, index);

      while (next < words.length) {
        const word = words[next];
        if (!word || word.pos === 'PUNCT') break;

        if (isNot(word)) {
          negated = true;
          tokens.add(word.token);
          next += 1;
          continue;
        }

        const previous = chain[chain.length - 1];
        const verbLike = isVerbLike(words, next);
        const recovery = previous === undefined || verbLike ? null : recoverAfterAux(previous, word);
        const attaches =
          previous !== undefined && (verbLike || recovery !== null) && continues(previous, word);

        if (attaches) {
          for (const skipped of pending) tokens.add(skipped.token);
          if (pending.some((skipped) => SUBJECT_POS.has(skipped.pos))) subjectInside = true;
          pending = [];
          chain.push(word);
          tokens.add(word.token);
          if (recovery === 'uncertain' || (verbLike && word.pos !== 'VERB' && word.pos !== 'AUX')) {
            recovered = true;
          }
          next += 1;

          // be going to + V1 — «to» і основа входять у групу, інакше «is going»
          // виглядало б як рух. Якщо далі не дієслово, група закривається тут.
          if (word.lower === 'going' && isBeForm(previous)) {
            const to = words[next];
            const verb = words[next + 1];
            if (to && to.lower === 'to' && verb && isGoingToVerb(verb)) {
              chain.push(to, verb);
              tokens.add(to.token);
              tokens.add(verb.token);
              // Іменник на місці дієслова («going to work») — сумнів, а не рух.
              if (verb.pos !== 'VERB') recovered = true;
              next += 2;
            }
            break;
          }

          if (closesGroup(word)) break;
          continue;
        }

        if (isInnerAdverb(word)) {
          pending.push(word);
          next += 1;
          continue;
        }

        // Підмет усередині — один раз і лише там, де інверсія можлива. Слово з
        // теґом VERB, яке не може продовжити ланцюжок («Do bats …»), — теж підмет.
        const subjectLike = (part: TaggedWord) =>
          (SUBJECT_POS.has(part.pos) || part.pos === 'VERB') && !RELATIVES.has(part.lower);
        if (mayInvert && !subjectSeen && subjectLike(word)) {
          let count = 0;
          while (next < words.length && count < 3) {
            const part = words[next];
            if (!part || !subjectLike(part) || (part.pos === 'VERB' && previous && continues(previous, part))) break;
            pending.push(part);
            count += 1;
            next += 1;
          }
          subjectSeen = true;
          continue;
        }

        break;
      }
    }

    groups.push({
      tokens: [...tokens].sort((a, b) => a - b),
      chain,
      subjectInside,
      negated,
      recovered,
      infinitive,
    });
    index = next;
  }

  return groups;
}

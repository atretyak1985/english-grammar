/**
 * Неправильні дієслова, згруповані так само, як у темі «Минулі часи» (розділ 2.5).
 * Один список живить дві речі: таблиці в теорії і розпізнавання Past Simple
 * в аналізаторі тексту — щоб підсвітка й теорія говорили про одні й ті самі слова
 * (CONCEPT 4.1).
 */

export type VerbGroup = 'a' | 'b' | 'c';

export interface IrregularVerb {
  v1: string;
  /** Друга форма — для Past Simple. Для be це «was/were». */
  v2: string;
  /** Третя форма — для Past Perfect. */
  v3: string;
  group: VerbGroup;
  /** Вимова або зауваження, якщо форма читається не так, як пишеться */
  note?: string;
}

export const IRREGULAR_VERB_GROUPS: Record<VerbGroup, { title: string; hint: string }> = {
  a: { title: 'Група A: усі три форми однакові', hint: 'Найлегша група — вчити нічого.' },
  b: { title: 'Група B: V2 = V3', hint: 'Друга і третя форми збігаються.' },
  c: { title: "Група C: усі три різні — вчити напам'ять", hint: 'Найважча група.' },
};

export const IRREGULAR_VERBS: readonly IrregularVerb[] = [
  // Група A — усі три форми однакові
  { v1: 'cut', v2: 'cut', v3: 'cut', group: 'a' },
  { v1: 'put', v2: 'put', v3: 'put', group: 'a' },
  { v1: 'let', v2: 'let', v3: 'let', group: 'a' },
  { v1: 'set', v2: 'set', v3: 'set', group: 'a' },
  { v1: 'hit', v2: 'hit', v3: 'hit', group: 'a' },
  { v1: 'cost', v2: 'cost', v3: 'cost', group: 'a' },
  { v1: 'shut', v2: 'shut', v3: 'shut', group: 'a' },
  { v1: 'read', v2: 'read', v3: 'read', group: 'a', note: 'минулі форми читаються /red/' },

  // Група B — V2 = V3
  { v1: 'build', v2: 'built', v3: 'built', group: 'b' },
  { v1: 'send', v2: 'sent', v3: 'sent', group: 'b' },
  { v1: 'spend', v2: 'spent', v3: 'spent', group: 'b' },
  { v1: 'lend', v2: 'lent', v3: 'lent', group: 'b' },
  { v1: 'buy', v2: 'bought', v3: 'bought', group: 'b' },
  { v1: 'bring', v2: 'brought', v3: 'brought', group: 'b' },
  { v1: 'think', v2: 'thought', v3: 'thought', group: 'b' },
  { v1: 'catch', v2: 'caught', v3: 'caught', group: 'b' },
  { v1: 'teach', v2: 'taught', v3: 'taught', group: 'b' },
  { v1: 'find', v2: 'found', v3: 'found', group: 'b' },
  { v1: 'lose', v2: 'lost', v3: 'lost', group: 'b' },
  { v1: 'keep', v2: 'kept', v3: 'kept', group: 'b' },
  { v1: 'sleep', v2: 'slept', v3: 'slept', group: 'b' },
  { v1: 'meet', v2: 'met', v3: 'met', group: 'b' },
  { v1: 'lead', v2: 'led', v3: 'led', group: 'b' },
  { v1: 'pay', v2: 'paid', v3: 'paid', group: 'b' },
  { v1: 'say', v2: 'said', v3: 'said', group: 'b', note: 'said /sed/' },
  { v1: 'sell', v2: 'sold', v3: 'sold', group: 'b' },
  { v1: 'tell', v2: 'told', v3: 'told', group: 'b' },
  { v1: 'hold', v2: 'held', v3: 'held', group: 'b' },
  { v1: 'make', v2: 'made', v3: 'made', group: 'b' },
  { v1: 'hear', v2: 'heard', v3: 'heard', group: 'b', note: 'heard /hɜːd/' },
  { v1: 'leave', v2: 'left', v3: 'left', group: 'b' },
  { v1: 'feel', v2: 'felt', v3: 'felt', group: 'b' },
  { v1: 'sit', v2: 'sat', v3: 'sat', group: 'b' },
  { v1: 'stand', v2: 'stood', v3: 'stood', group: 'b' },
  { v1: 'understand', v2: 'understood', v3: 'understood', group: 'b' },
  { v1: 'win', v2: 'won', v3: 'won', group: 'b' },

  // Група C — усі три різні
  { v1: 'be', v2: 'was/were', v3: 'been', group: 'c' },
  { v1: 'begin', v2: 'began', v3: 'begun', group: 'c' },
  { v1: 'break', v2: 'broke', v3: 'broken', group: 'c' },
  { v1: 'choose', v2: 'chose', v3: 'chosen', group: 'c' },
  { v1: 'do', v2: 'did', v3: 'done', group: 'c' },
  { v1: 'drink', v2: 'drank', v3: 'drunk', group: 'c' },
  { v1: 'drive', v2: 'drove', v3: 'driven', group: 'c' },
  { v1: 'eat', v2: 'ate', v3: 'eaten', group: 'c' },
  { v1: 'fall', v2: 'fell', v3: 'fallen', group: 'c' },
  { v1: 'fly', v2: 'flew', v3: 'flown', group: 'c' },
  { v1: 'forget', v2: 'forgot', v3: 'forgotten', group: 'c' },
  { v1: 'get', v2: 'got', v3: 'got/gotten', group: 'c' },
  { v1: 'give', v2: 'gave', v3: 'given', group: 'c' },
  { v1: 'go', v2: 'went', v3: 'gone', group: 'c' },
  { v1: 'grow', v2: 'grew', v3: 'grown', group: 'c' },
  { v1: 'know', v2: 'knew', v3: 'known', group: 'c' },
  { v1: 'ride', v2: 'rode', v3: 'ridden', group: 'c' },
  { v1: 'rise', v2: 'rose', v3: 'risen', group: 'c' },
  { v1: 'run', v2: 'ran', v3: 'run', group: 'c' },
  { v1: 'see', v2: 'saw', v3: 'seen', group: 'c' },
  { v1: 'show', v2: 'showed', v3: 'shown', group: 'c' },
  { v1: 'speak', v2: 'spoke', v3: 'spoken', group: 'c' },
  { v1: 'take', v2: 'took', v3: 'taken', group: 'c' },
  { v1: 'throw', v2: 'threw', v3: 'thrown', group: 'c' },
  { v1: 'wake', v2: 'woke', v3: 'woken', group: 'c' },
  { v1: 'wear', v2: 'wore', v3: 'worn', group: 'c' },
  { v1: 'write', v2: 'wrote', v3: 'written', group: 'c' },
  { v1: 'come', v2: 'came', v3: 'come', group: 'c' },
];

export function verbsInGroup(group: VerbGroup): IrregularVerb[] {
  return IRREGULAR_VERBS.filter((verb) => verb.group === group);
}

/**
 * Форми V2 для аналізатора. was/were тут теж є: у «was reviewing» їх раніше
 * забирає правило Past Continuous, а самотнє «was tired» — це справді Past Simple.
 */
export const V2_FORMS: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((verb) => verb.v2.split('/')).map((form) => form.toLowerCase()),
);

/** Форми V3 — потрібні, щоб не приймати «had» за присвійне у had + V3. */
export const V3_FORMS: ReadonlySet<string> = new Set(
  IRREGULAR_VERBS.flatMap((verb) => verb.v3.split('/')).map((form) => form.toLowerCase()),
);

/**
 * Дієслова стану — не вживаються з -ing (розділ 3.2 теми).
 * Аналізатор ними не користується, але вони потрібні теорії й майбутнім підказкам.
 */
export const STATE_VERBS: Record<string, readonly string[]> = {
  Розум: ['know', 'understand', 'believe', 'remember', 'forget', 'mean', 'doubt', 'realise'],
  Почуття: ['like', 'love', 'hate', 'prefer', 'want', 'need', 'wish'],
  Володіння: ['have (=мати)', 'own', 'belong', 'contain', 'include', 'consist'],
  Сприйняття: ['see', 'hear', 'smell', 'taste', 'seem', 'appear', 'look (=виглядати)'],
  Інше: ['be', 'cost', 'weigh', 'matter', 'depend', 'exist'],
};

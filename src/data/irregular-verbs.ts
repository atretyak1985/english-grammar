/**
 * Неправильні дієслова. Один список живить дві речі: таблиці в темі «Минулі
 * часи» (розділ 2.5) і розпізнавання форм у граматичному двигуні
 * (`src/lib/grammar/`) — щоб підсвітка й теорія говорили про одні й ті самі
 * слова (CONCEPT 4.1).
 *
 * Список ширший за таблицю теорії навмисно. Теорія показує ~60 дієслів, які
 * варто вивчити напам'ять, а двигун мусить упізнати «shone», «crept» чи
 * «wrung» у книжковому тексті, інакше ці слова лишаться без розмітки або
 * дістануть хибну. Тому в записі є прапорець `teach`: таблиці фільтрують по
 * ньому, а розпізнавання бере весь список.
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
  /** Входить у таблицю теорії. Без прапорця дієслово знає лише двигун. */
  teach?: true;
}

export const IRREGULAR_VERB_GROUPS: Record<VerbGroup, { title: string; hint: string }> = {
  a: { title: 'Група A: усі три форми однакові', hint: 'Найлегша група — вчити нічого.' },
  b: { title: 'Група B: V2 = V3', hint: 'Друга і третя форми збігаються.' },
  c: { title: "Група C: усі три різні — вчити напам'ять", hint: 'Найважча група.' },
};

export const IRREGULAR_VERBS: readonly IrregularVerb[] = [
  // ── Таблиця теорії ──────────────────────────────────────────────────────
  // Група A — усі три форми однакові
  { v1: 'cut', v2: 'cut', v3: 'cut', group: 'a', teach: true },
  { v1: 'put', v2: 'put', v3: 'put', group: 'a', teach: true },
  { v1: 'let', v2: 'let', v3: 'let', group: 'a', teach: true },
  { v1: 'set', v2: 'set', v3: 'set', group: 'a', teach: true },
  { v1: 'hit', v2: 'hit', v3: 'hit', group: 'a', teach: true },
  { v1: 'cost', v2: 'cost', v3: 'cost', group: 'a', teach: true },
  { v1: 'shut', v2: 'shut', v3: 'shut', group: 'a', teach: true },
  { v1: 'read', v2: 'read', v3: 'read', group: 'a', note: 'минулі форми читаються /red/', teach: true },

  // Група B — V2 = V3
  { v1: 'build', v2: 'built', v3: 'built', group: 'b', teach: true },
  { v1: 'send', v2: 'sent', v3: 'sent', group: 'b', teach: true },
  { v1: 'spend', v2: 'spent', v3: 'spent', group: 'b', teach: true },
  { v1: 'lend', v2: 'lent', v3: 'lent', group: 'b', teach: true },
  { v1: 'buy', v2: 'bought', v3: 'bought', group: 'b', teach: true },
  { v1: 'bring', v2: 'brought', v3: 'brought', group: 'b', teach: true },
  { v1: 'think', v2: 'thought', v3: 'thought', group: 'b', teach: true },
  { v1: 'catch', v2: 'caught', v3: 'caught', group: 'b', teach: true },
  { v1: 'teach', v2: 'taught', v3: 'taught', group: 'b', teach: true },
  { v1: 'find', v2: 'found', v3: 'found', group: 'b', teach: true },
  { v1: 'lose', v2: 'lost', v3: 'lost', group: 'b', teach: true },
  { v1: 'keep', v2: 'kept', v3: 'kept', group: 'b', teach: true },
  { v1: 'sleep', v2: 'slept', v3: 'slept', group: 'b', teach: true },
  { v1: 'meet', v2: 'met', v3: 'met', group: 'b', teach: true },
  { v1: 'lead', v2: 'led', v3: 'led', group: 'b', teach: true },
  { v1: 'pay', v2: 'paid', v3: 'paid', group: 'b', teach: true },
  { v1: 'say', v2: 'said', v3: 'said', group: 'b', note: 'said /sed/', teach: true },
  { v1: 'sell', v2: 'sold', v3: 'sold', group: 'b', teach: true },
  { v1: 'tell', v2: 'told', v3: 'told', group: 'b', teach: true },
  { v1: 'hold', v2: 'held', v3: 'held', group: 'b', teach: true },
  { v1: 'make', v2: 'made', v3: 'made', group: 'b', teach: true },
  { v1: 'hear', v2: 'heard', v3: 'heard', group: 'b', note: 'heard /hɜːd/', teach: true },
  { v1: 'leave', v2: 'left', v3: 'left', group: 'b', teach: true },
  { v1: 'feel', v2: 'felt', v3: 'felt', group: 'b', teach: true },
  { v1: 'sit', v2: 'sat', v3: 'sat', group: 'b', teach: true },
  { v1: 'stand', v2: 'stood', v3: 'stood', group: 'b', teach: true },
  { v1: 'understand', v2: 'understood', v3: 'understood', group: 'b', teach: true },
  { v1: 'win', v2: 'won', v3: 'won', group: 'b', teach: true },

  // Група C — усі три різні
  { v1: 'be', v2: 'was/were', v3: 'been', group: 'c', teach: true },
  { v1: 'begin', v2: 'began', v3: 'begun', group: 'c', teach: true },
  { v1: 'break', v2: 'broke', v3: 'broken', group: 'c', teach: true },
  { v1: 'choose', v2: 'chose', v3: 'chosen', group: 'c', teach: true },
  { v1: 'do', v2: 'did', v3: 'done', group: 'c', teach: true },
  { v1: 'drink', v2: 'drank', v3: 'drunk', group: 'c', teach: true },
  { v1: 'drive', v2: 'drove', v3: 'driven', group: 'c', teach: true },
  { v1: 'eat', v2: 'ate', v3: 'eaten', group: 'c', teach: true },
  { v1: 'fall', v2: 'fell', v3: 'fallen', group: 'c', teach: true },
  { v1: 'fly', v2: 'flew', v3: 'flown', group: 'c', teach: true },
  { v1: 'forget', v2: 'forgot', v3: 'forgotten', group: 'c', teach: true },
  { v1: 'get', v2: 'got', v3: 'got/gotten', group: 'c', teach: true },
  { v1: 'give', v2: 'gave', v3: 'given', group: 'c', teach: true },
  { v1: 'go', v2: 'went', v3: 'gone', group: 'c', teach: true },
  { v1: 'grow', v2: 'grew', v3: 'grown', group: 'c', teach: true },
  { v1: 'know', v2: 'knew', v3: 'known', group: 'c', teach: true },
  { v1: 'ride', v2: 'rode', v3: 'ridden', group: 'c', teach: true },
  { v1: 'rise', v2: 'rose', v3: 'risen', group: 'c', teach: true },
  { v1: 'run', v2: 'ran', v3: 'run', group: 'c', teach: true },
  { v1: 'see', v2: 'saw', v3: 'seen', group: 'c', teach: true },
  { v1: 'show', v2: 'showed', v3: 'shown', group: 'c', teach: true },
  { v1: 'speak', v2: 'spoke', v3: 'spoken', group: 'c', teach: true },
  { v1: 'take', v2: 'took', v3: 'taken', group: 'c', teach: true },
  { v1: 'throw', v2: 'threw', v3: 'thrown', group: 'c', teach: true },
  { v1: 'wake', v2: 'woke', v3: 'woken', group: 'c', teach: true },
  { v1: 'wear', v2: 'wore', v3: 'worn', group: 'c', teach: true },
  { v1: 'write', v2: 'wrote', v3: 'written', group: 'c', teach: true },
  { v1: 'come', v2: 'came', v3: 'come', group: 'c', teach: true },

  // ── Тільки для двигуна ──────────────────────────────────────────────────
  // Група A
  { v1: 'bet', v2: 'bet', v3: 'bet', group: 'a' },
  { v1: 'bid', v2: 'bid', v3: 'bid', group: 'a' },
  { v1: 'broadcast', v2: 'broadcast', v3: 'broadcast', group: 'a' },
  { v1: 'burst', v2: 'burst', v3: 'burst', group: 'a' },
  { v1: 'cast', v2: 'cast', v3: 'cast', group: 'a' },
  { v1: 'fit', v2: 'fit', v3: 'fit', group: 'a', note: 'у британській — fitted' },
  { v1: 'forecast', v2: 'forecast', v3: 'forecast', group: 'a' },
  { v1: 'hurt', v2: 'hurt', v3: 'hurt', group: 'a' },
  { v1: 'quit', v2: 'quit', v3: 'quit', group: 'a' },
  { v1: 'rid', v2: 'rid', v3: 'rid', group: 'a' },
  { v1: 'shed', v2: 'shed', v3: 'shed', group: 'a' },
  { v1: 'slit', v2: 'slit', v3: 'slit', group: 'a' },
  { v1: 'split', v2: 'split', v3: 'split', group: 'a' },
  { v1: 'spread', v2: 'spread', v3: 'spread', group: 'a' },
  { v1: 'thrust', v2: 'thrust', v3: 'thrust', group: 'a' },
  { v1: 'upset', v2: 'upset', v3: 'upset', group: 'a' },
  { v1: 'wed', v2: 'wed', v3: 'wed', group: 'a' },
  { v1: 'wet', v2: 'wet', v3: 'wet', group: 'a' },

  // Група B
  { v1: 'behold', v2: 'beheld', v3: 'beheld', group: 'b' },
  { v1: 'bend', v2: 'bent', v3: 'bent', group: 'b' },
  { v1: 'bind', v2: 'bound', v3: 'bound', group: 'b' },
  { v1: 'bleed', v2: 'bled', v3: 'bled', group: 'b' },
  { v1: 'breed', v2: 'bred', v3: 'bred', group: 'b' },
  { v1: 'burn', v2: 'burnt', v3: 'burnt', group: 'b', note: 'також burned' },
  { v1: 'cling', v2: 'clung', v3: 'clung', group: 'b' },
  { v1: 'creep', v2: 'crept', v3: 'crept', group: 'b' },
  { v1: 'deal', v2: 'dealt', v3: 'dealt', group: 'b' },
  { v1: 'dig', v2: 'dug', v3: 'dug', group: 'b' },
  { v1: 'dream', v2: 'dreamt', v3: 'dreamt', group: 'b', note: 'також dreamed' },
  { v1: 'dwell', v2: 'dwelt', v3: 'dwelt', group: 'b' },
  { v1: 'feed', v2: 'fed', v3: 'fed', group: 'b' },
  { v1: 'fight', v2: 'fought', v3: 'fought', group: 'b' },
  { v1: 'flee', v2: 'fled', v3: 'fled', group: 'b' },
  { v1: 'fling', v2: 'flung', v3: 'flung', group: 'b' },
  { v1: 'foretell', v2: 'foretold', v3: 'foretold', group: 'b' },
  { v1: 'grind', v2: 'ground', v3: 'ground', group: 'b' },
  { v1: 'hang', v2: 'hung', v3: 'hung', group: 'b', note: '«стратити» — hanged' },
  { v1: 'have', v2: 'had', v3: 'had', group: 'b' },
  { v1: 'kneel', v2: 'knelt', v3: 'knelt', group: 'b' },
  { v1: 'lay', v2: 'laid', v3: 'laid', group: 'b' },
  { v1: 'lean', v2: 'leant', v3: 'leant', group: 'b', note: 'також leaned' },
  { v1: 'leap', v2: 'leapt', v3: 'leapt', group: 'b', note: 'також leaped' },
  { v1: 'learn', v2: 'learnt', v3: 'learnt', group: 'b', note: 'також learned' },
  { v1: 'light', v2: 'lit', v3: 'lit', group: 'b' },
  { v1: 'mean', v2: 'meant', v3: 'meant', group: 'b' },
  { v1: 'mislead', v2: 'misled', v3: 'misled', group: 'b' },
  { v1: 'misunderstand', v2: 'misunderstood', v3: 'misunderstood', group: 'b' },
  { v1: 'overhear', v2: 'overheard', v3: 'overheard', group: 'b' },
  { v1: 'rebuild', v2: 'rebuilt', v3: 'rebuilt', group: 'b' },
  { v1: 'seek', v2: 'sought', v3: 'sought', group: 'b' },
  { v1: 'shine', v2: 'shone', v3: 'shone', group: 'b' },
  { v1: 'shoot', v2: 'shot', v3: 'shot', group: 'b' },
  { v1: 'slide', v2: 'slid', v3: 'slid', group: 'b' },
  { v1: 'sling', v2: 'slung', v3: 'slung', group: 'b' },
  { v1: 'smell', v2: 'smelt', v3: 'smelt', group: 'b', note: 'також smelled' },
  { v1: 'speed', v2: 'sped', v3: 'sped', group: 'b' },
  { v1: 'spell', v2: 'spelt', v3: 'spelt', group: 'b', note: 'також spelled' },
  { v1: 'spill', v2: 'spilt', v3: 'spilt', group: 'b', note: 'також spilled' },
  { v1: 'spin', v2: 'spun', v3: 'spun', group: 'b' },
  { v1: 'spit', v2: 'spat', v3: 'spat', group: 'b' },
  { v1: 'spoil', v2: 'spoilt', v3: 'spoilt', group: 'b', note: 'також spoiled' },
  { v1: 'stick', v2: 'stuck', v3: 'stuck', group: 'b' },
  { v1: 'sting', v2: 'stung', v3: 'stung', group: 'b' },
  { v1: 'strike', v2: 'struck', v3: 'struck', group: 'b' },
  { v1: 'string', v2: 'strung', v3: 'strung', group: 'b' },
  { v1: 'sweep', v2: 'swept', v3: 'swept', group: 'b' },
  { v1: 'swing', v2: 'swung', v3: 'swung', group: 'b' },
  { v1: 'uphold', v2: 'upheld', v3: 'upheld', group: 'b' },
  { v1: 'weep', v2: 'wept', v3: 'wept', group: 'b' },
  { v1: 'wind', v2: 'wound', v3: 'wound', group: 'b' },
  { v1: 'withhold', v2: 'withheld', v3: 'withheld', group: 'b' },
  { v1: 'withstand', v2: 'withstood', v3: 'withstood', group: 'b' },
  { v1: 'wring', v2: 'wrung', v3: 'wrung', group: 'b' },

  // Група C
  { v1: 'arise', v2: 'arose', v3: 'arisen', group: 'c' },
  { v1: 'awake', v2: 'awoke', v3: 'awoken', group: 'c' },
  { v1: 'bear', v2: 'bore', v3: 'borne', group: 'c' },
  { v1: 'beat', v2: 'beat', v3: 'beaten', group: 'c' },
  { v1: 'become', v2: 'became', v3: 'become', group: 'c' },
  { v1: 'bite', v2: 'bit', v3: 'bitten', group: 'c' },
  { v1: 'blow', v2: 'blew', v3: 'blown', group: 'c' },
  { v1: 'draw', v2: 'drew', v3: 'drawn', group: 'c' },
  { v1: 'forbid', v2: 'forbade', v3: 'forbidden', group: 'c' },
  { v1: 'foresee', v2: 'foresaw', v3: 'foreseen', group: 'c' },
  { v1: 'forgive', v2: 'forgave', v3: 'forgiven', group: 'c' },
  { v1: 'forsake', v2: 'forsook', v3: 'forsaken', group: 'c' },
  { v1: 'freeze', v2: 'froze', v3: 'frozen', group: 'c' },
  { v1: 'hide', v2: 'hid', v3: 'hidden', group: 'c' },
  { v1: 'lie', v2: 'lay', v3: 'lain', group: 'c', note: '«лежати»; «брехати» — правильне: lied' },
  { v1: 'mistake', v2: 'mistook', v3: 'mistaken', group: 'c' },
  { v1: 'mow', v2: 'mowed', v3: 'mown', group: 'c' },
  { v1: 'outgrow', v2: 'outgrew', v3: 'outgrown', group: 'c' },
  { v1: 'overcome', v2: 'overcame', v3: 'overcome', group: 'c' },
  { v1: 'overdo', v2: 'overdid', v3: 'overdone', group: 'c' },
  { v1: 'overtake', v2: 'overtook', v3: 'overtaken', group: 'c' },
  { v1: 'partake', v2: 'partook', v3: 'partaken', group: 'c' },
  { v1: 'prove', v2: 'proved', v3: 'proved/proven', group: 'c' },
  { v1: 'redo', v2: 'redid', v3: 'redone', group: 'c' },
  { v1: 'retake', v2: 'retook', v3: 'retaken', group: 'c' },
  { v1: 'rewrite', v2: 'rewrote', v3: 'rewritten', group: 'c' },
  { v1: 'sew', v2: 'sewed', v3: 'sewn', group: 'c' },
  { v1: 'shake', v2: 'shook', v3: 'shaken', group: 'c' },
  { v1: 'shrink', v2: 'shrank', v3: 'shrunk', group: 'c' },
  { v1: 'sing', v2: 'sang', v3: 'sung', group: 'c' },
  { v1: 'sink', v2: 'sank', v3: 'sunk', group: 'c' },
  { v1: 'slay', v2: 'slew', v3: 'slain', group: 'c' },
  { v1: 'sow', v2: 'sowed', v3: 'sown', group: 'c' },
  { v1: 'spring', v2: 'sprang', v3: 'sprung', group: 'c' },
  { v1: 'steal', v2: 'stole', v3: 'stolen', group: 'c' },
  { v1: 'stride', v2: 'strode', v3: 'stridden', group: 'c' },
  { v1: 'strive', v2: 'strove', v3: 'striven', group: 'c' },
  { v1: 'swear', v2: 'swore', v3: 'sworn', group: 'c' },
  { v1: 'swell', v2: 'swelled', v3: 'swollen', group: 'c' },
  { v1: 'swim', v2: 'swam', v3: 'swum', group: 'c' },
  { v1: 'tear', v2: 'tore', v3: 'torn', group: 'c' },
  { v1: 'tread', v2: 'trod', v3: 'trodden', group: 'c' },
  { v1: 'undergo', v2: 'underwent', v3: 'undergone', group: 'c' },
  { v1: 'undertake', v2: 'undertook', v3: 'undertaken', group: 'c' },
  { v1: 'undo', v2: 'undid', v3: 'undone', group: 'c' },
  { v1: 'weave', v2: 'wove', v3: 'woven', group: 'c' },
  { v1: 'withdraw', v2: 'withdrew', v3: 'withdrawn', group: 'c' },
];

/** Дієслова групи для таблиці теорії — лише ті, що позначені `teach`. */
export function verbsInGroup(group: VerbGroup): IrregularVerb[] {
  return IRREGULAR_VERBS.filter((verb) => verb.group === group && verb.teach);
}

/** Запис за основою — так двигун дістає форми за лемою, яку назвав теґер. */
export const IRREGULAR_BY_V1: ReadonlyMap<string, IrregularVerb> = new Map(
  IRREGULAR_VERBS.map((verb) => [verb.v1, verb]),
);

const forms = (pick: (verb: IrregularVerb) => string): ReadonlySet<string> =>
  new Set(IRREGULAR_VERBS.flatMap((verb) => pick(verb).split('/')).map((form) => form.toLowerCase()));

const V1_FORMS = forms((verb) => verb.v1);

/**
 * Форми V2 для аналізатора. was/were тут теж є: у «was reviewing» їх раніше
 * забирає правило Past Continuous, а самотнє «was tired» — це справді Past Simple.
 */
export const V2_FORMS: ReadonlySet<string> = forms((verb) => verb.v2);

/** Форми V3 — потрібні, щоб не приймати «had» за присвійне у had + V3. */
export const V3_FORMS: ReadonlySet<string> = forms((verb) => verb.v3);

/**
 * Форми, які є ТІЛЬКИ другою формою — «went», «took», «saw»: такому слову без
 * жодного контексту можна дати Past Simple. Виключено те, що збігається з
 * третьою формою (sent, made — там без допоміжного не знати, V2 це чи V3) і з
 * основою (beat, put — не знати, минуле це чи теперішнє; «lay» — це і V2 від
 * lie, і основа lay).
 */
export const V2_ONLY: ReadonlySet<string> = new Set(
  [...V2_FORMS].filter((form) => !V3_FORMS.has(form) && !V1_FORMS.has(form)),
);

/**
 * Форми, які є ТІЛЬКИ третьою — «gone», «taken», «seen»: без допоміжного це
 * дієприкметник, а після had — Past Perfect, і сплутати його з Past Simple
 * неможливо.
 */
export const V3_ONLY: ReadonlySet<string> = new Set(
  [...V3_FORMS].filter((form) => !V2_FORMS.has(form) && !V1_FORMS.has(form)),
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

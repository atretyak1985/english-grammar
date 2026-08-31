import type { Match } from '@/lib/analyzer/tenses';

import { RULES_VERSION, judge } from './rules';
import { tag } from './tagger';
import { collectGroups } from './verb-groups';

/**
 * Граматичний двигун: розпізнавання дев'яти часів за формами дієслів, а не за
 * літерами. На вході текст, на виході — збіги в координатах `tokenize(text)`,
 * тобто в тій самій нумерації, якою підсвітка й модель (`review.ts`) уже
 * користуються. Детерміновано, без мережі й без ключів.
 *
 * ТІЛЬКИ ДЛЯ СЕРВЕРА. Модуль тягне wink-nlp з англійською моделлю на 2,8 МБ —
 * імпорт із компонента під `'use client'` поклав би її в клієнтський бандл і
 * пробив би бюджет першого завантаження в десять разів. Клієнт дістає
 * результат через API, а не через імпорт.
 */

export type { GrammarRule, RuleTopic, Step } from './rules';
export { RULES, RULES_VERSION, RULE_BY_ID } from './rules';
export type { TaggedWord } from './tagger';
export type { VerbGroup } from './verb-groups';

export interface GrammarMatch extends Match {
  ruleId: string;
  /** Двигун сам знає, що межа хитка — див. `GrammarRule.uncertain`. */
  uncertain?: true;
}

/** Група, розглянута й відкинута як не фінітна форма: інфінітив, дієприкметник, модальне. */
export interface GrammarSkip {
  from: number;
  to: number;
  ruleId: string;
}

export interface GrammarResult {
  /** Відсортовані за `from`, без перекриттів. */
  matches: GrammarMatch[];
  skipped: GrammarSkip[];
  rulesVersion: number;
}

/**
 * Найдовша конструкція в токенах. Модель обмежена п'ятьма словами, але тут
 * інверсія з підметом («had the White Rabbit ever seen») довша, і обрізати її
 * означало б віддати читачеві половину.
 */
const MAX_SPAN = 8;

export function analyzeGrammar(text: string): GrammarResult {
  const words = tag(text);
  const groups = collectGroups(words);

  const matches: GrammarMatch[] = [];
  const skipped: GrammarSkip[] = [];
  let lastTo = -1;

  for (const group of groups) {
    const from = group.tokens[0];
    const to = group.tokens[group.tokens.length - 1];
    if (from === undefined || to === undefined) continue;

    const { rule, uncertain } = judge(group);

    // Два wink-слова в одному токені («think—”said») дали б два збіги на одному
    // індексі; другий поглинається — токен уже підсвічено.
    if (from <= lastTo) continue;

    if (rule.tense === null || to - from > MAX_SPAN) {
      skipped.push({ from, to, ruleId: rule.tense === null ? rule.id : 'skip.unknown' });
      lastTo = to;
      continue;
    }

    const match: GrammarMatch = { from, to, tense: rule.tense, ruleId: rule.id };
    if (uncertain) match.uncertain = true;
    matches.push(match);
    lastTo = to;
  }

  return { matches, skipped, rulesVersion: RULES_VERSION };
}

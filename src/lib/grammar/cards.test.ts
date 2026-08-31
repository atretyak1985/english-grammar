import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { meta as future } from '@/content/topics/future-tenses/meta';
import { meta as past } from '@/content/topics/past-tenses/meta';
import { meta as present } from '@/content/topics/present-tenses/meta';

import { RULE_CARDS, TENSE_FORMULAS, theoryHref } from './cards';
import { RULES, RULE_BY_ID } from './rules';

/**
 * Картки — рукописна копія довідкової частини правил, і тільки цей тест тримає
 * їх разом: розійшлися — впав. SC-11 стоїть саме на цьому: картка слова
 * показує назву правила й веде в розділ, який справді існує.
 */
const TOPICS = { 'past-tenses': past, 'present-tenses': present, 'future-tenses': future } as const;

describe('RULE_CARDS', () => {
  it('кожне правило з часом має картку, і жодної зайвої', () => {
    const withTense = RULES.filter((rule) => rule.tense !== null).map((rule) => rule.id);
    expect(Object.keys(RULE_CARDS).sort()).toEqual([...withTense].sort());
  });

  it('час, тема й розділ картки збігаються з правилом', () => {
    for (const [id, card] of Object.entries(RULE_CARDS)) {
      const rule = RULE_BY_ID.get(id);
      expect(rule, id).toBeDefined();
      expect(card.tense, id).toBe(rule?.tense);
      expect(card.topic, id).toBe(rule?.topic);
      expect(card.section, id).toBe(rule?.section);
    }
  });

  it('формула не порожня, а посилання веде в реальний розділ теорії', () => {
    for (const [id, card] of Object.entries(RULE_CARDS)) {
      expect(card.formula.length, id).toBeGreaterThan(0);

      const topic = TOPICS[card.topic];
      const section = topic.sections.find((candidate) => candidate.slug === card.section);
      expect(section, `${id} → ${theoryHref(card)}`).toBeDefined();
      expect(theoryHref(card)).toBe(`/topics/${card.topic}/${card.section}`);
    }
  });

  it('формули розділів покривають часи, у яких є правила з цими розділами', () => {
    // Поки що з даних рендеряться минулі часи; кожен такий час мусить мати і
    // рядки формули, і принаймні одне правило — інакше «одне джерело» порожнє.
    for (const tense of ['ps', 'pc', 'pp'] as const) {
      const formula = TENSE_FORMULAS[tense];
      expect(formula, tense).toBeDefined();
      expect(formula?.lines.length ?? 0, tense).toBeGreaterThan(0);
      expect(RULES.some((rule) => rule.tense === tense), tense).toBe(true);
    }
  });

  it('модуль карток лишається легким: жодного рантайм-імпорту', () => {
    // Картки їдуть у клієнтський бандл; імпорт правил притягнув би морфологію
    // з таблицями форм, а через теґер — і модель wink на мегабайти.
    const source = fs.readFileSync(path.join(__dirname, 'cards.ts'), 'utf8');
    const imports = source.match(/^import .*$/gm) ?? [];
    for (const line of imports) expect(line).toMatch(/^import type /);
  });
});

import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { meta as future } from '@/content/topics/future-tenses/meta';
import { meta as past } from '@/content/topics/past-tenses/meta';
import { meta as present } from '@/content/topics/present-tenses/meta';
import { TENSE_TIME } from '@/types/content';

import { RULES, RULE_BY_ID, analyzeGrammar } from './index';

/**
 * SC-5: кожен ruleId існує, а `topic/section` вказують на реальні розділи
 * теорії — бо з фази 2 картка слова веде саме туди, і мертве посилання в
 * підсвітці гірше за відсутнє.
 */
const TOPICS = { 'past-tenses': past, 'present-tenses': present, 'future-tenses': future } as const;

const LIBRARY = path.join(__dirname, '..', '..', 'content', 'library');
const BOOKS = ['alice-in-wonderland', 'gift-of-the-magi'].map((slug) =>
  fs.readFileSync(path.join(LIBRARY, slug, 'story.txt'), 'utf8'),
);

describe('RULES', () => {
  it('ідентифікатори унікальні', () => {
    const ids = RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('обов’язковий набір правил присутній', () => {
    for (const id of [
      'fp.will-have-v3',
      'fc.will-be-ving',
      'fs.will-v1',
      'fs.going-to',
      'pp.had-v3',
      'prp.have-v3',
      'pc.was-ving',
      'prc.be-ving',
      'ps.did-v1',
      'prs.do-v1',
      'ps.was-lexical',
      'prs.be-lexical',
      'ps.had-lexical',
      'prs.have-lexical',
      'ps.modal-past',
      'ps.v2',
      'prs.v1',
      'skip.infinitive',
      'skip.participle',
      'skip.modal',
    ]) {
      expect(RULE_BY_ID.has(id), id).toBe(true);
    }
  });

  it('topic і section кожного правила — реальні розділи теорії', () => {
    for (const rule of RULES) {
      const topic = TOPICS[rule.topic];
      expect(topic.slug).toBe(rule.topic);
      const slugs = topic.sections.map((section) => section.slug);
      expect(slugs, `${rule.id} → ${rule.topic}/${rule.section}`).toContain(rule.section);
    }
  });

  it('префікс ідентифікатора збігається з ключем часу, а skip — без часу', () => {
    for (const rule of RULES) {
      const prefix = rule.id.split('.')[0];
      if (rule.tense === null) {
        expect(prefix).toBe('skip');
      } else {
        expect(prefix).toBe(rule.tense);
      }
    }
  });

  it('тема правила відповідає часу — окрім «was going to», яке живе в темі going to', () => {
    for (const rule of RULES) {
      if (rule.tense === null || rule.id === 'pc.was-going-to') continue;
      expect(rule.topic, rule.id).toBe(`${TENSE_TIME[rule.tense]}-tenses`);
    }
  });

  it('усі ruleId, що двигун видає на обох книжках, існують', () => {
    for (const book of BOOKS) {
      const result = analyzeGrammar(book);
      for (const match of result.matches) {
        expect(RULE_BY_ID.get(match.ruleId)?.tense).toBe(match.tense);
      }
      for (const skip of result.skipped) {
        expect(RULE_BY_ID.get(skip.ruleId)?.tense).toBeNull();
      }
    }
  });
});

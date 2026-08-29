import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * SC-13: модель wink (2,8 МБ) не потрапляє в клієнтський бандл. Повна
 * перевірка — grep по `.next/static` після `next build`; тут дешевий
 * запобіжник, який ловить причину ще до збірки: жоден файл під `'use client'`
 * не імпортує ані `@/lib/grammar`, ані wink напряму.
 */
const SRC = path.join(__dirname, '..', '..');

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) yield full;
  }
}

describe('модуль граматики — лише сервер', () => {
  it("жоден 'use client'-файл не імпортує двигун чи wink", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const source = fs.readFileSync(file, 'utf8');
      if (!/^\s*['"]use client['"]/m.test(source)) continue;
      if (/@\/lib\/grammar|wink-nlp|wink-eng-lite-web-model/.test(source)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('wink імпортують лише файли двигуна', () => {
    const importers: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const source = fs.readFileSync(file, 'utf8');
      if (/from ['"]wink-(nlp|eng-lite-web-model)['"]/.test(source)) importers.push(path.relative(SRC, file));
    }
    expect(importers).toEqual(['lib/grammar/tagger.ts']);
  });
});

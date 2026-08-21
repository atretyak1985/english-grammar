import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Скрипт засіву не має права торкатися Anthropic (SC-9) — розмітку приносить
 * оператор через Claude CLI, а `scripts/seed-library.mts` лише перевіряє й
 * пише. Перевіряти це імпортом-у-код недостатньо: одного дня хтось додасть
 * "тимчасовий" виклик моделі просто щоб перевірити артефакт, і тест мусить
 * зловити це так само, як пряме `import '@/lib/claude'`.
 *
 * Тому тест реально проходить граф ЛОКАЛЬНИХ імпортів від файлу скрипта, а не
 * перевіряє сам скрипт як список рядків: файл, який експортує підозрілий
 * реекспорт, теж мав би провалити цю перевірку.
 */

const TEST_FILE = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(TEST_FILE), '../../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ENTRY = path.join(ROOT_DIR, 'scripts/seed-library.mts');

/** `from '<spec>'`, `import '<spec>'`, `import('<spec>')`, `export ... from '<spec>'`. */
const IMPORT_SPECIFIER = /(?:from\s+|import\s*\(?\s*)['"]([^'"]+)['"]/g;

function extractSpecifiers(content: string): string[] {
  return [...content.matchAll(IMPORT_SPECIFIER)].map((match) => match[1]).filter((spec): spec is string => spec !== undefined);
}

/** Локальний імпорт (`./`, `../`, `@/`) → реальний файл на диску, або `null` для зовнішнього пакета. */
function resolveLocal(specifier: string, fromFile: string): string | null {
  let base: string;
  if (specifier.startsWith('@/')) {
    base = path.join(SRC_DIR, specifier.slice('@/'.length));
  } else if (specifier.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), specifier);
  } else {
    return null;
  }

  const candidates = [base, `${base}.ts`, `${base}.mts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.mts')];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** BFS графа локальних імпортів від `entry`, з реальним читанням кожного файлу з диска. */
function walkImportGraph(entry: string): Map<string, string> {
  const visited = new Map<string, string>();
  const queue = [entry];

  while (queue.length > 0) {
    const file = queue.shift();
    if (file === undefined || visited.has(file)) continue;

    const content = readFileSync(file, 'utf8');
    visited.set(file, content);

    for (const specifier of extractSpecifiers(content)) {
      const resolved = resolveLocal(specifier, file);
      if (resolved !== null && !visited.has(resolved)) queue.push(resolved);
    }
  }

  return visited;
}

describe('scripts/seed-library.mts — граф імпортів без Claude', () => {
  it('дійсно читає файли з диска, а не є заглушкою', () => {
    expect(existsSync(ENTRY)).toBe(true);
    const graph = walkImportGraph(ENTRY);

    // Реальний граф цього скрипта проходить і схему, і бібліотечні модулі —
    // якщо тут лише сам скрипт, обхід зламався й тест нічого не перевіряє.
    expect(graph.size).toBeGreaterThan(5);
    const relPaths = [...graph.keys()].map((file) => path.relative(ROOT_DIR, file));
    expect(relPaths).toContain(path.join('src', 'db', 'schema.ts'));
    expect(relPaths).toContain(path.join('src', 'lib', 'library', 'artifact.ts'));
    expect(relPaths).toContain(path.join('src', 'lib', 'analyzer', 'tenses.ts'));
  });

  it('ніде в графі немає імпорту lib/claude і згадки ANTHROPIC_API_KEY', () => {
    const graph = walkImportGraph(ENTRY);

    const claudeImports: string[] = [];
    const apiKeyMentions: string[] = [];

    for (const [file, content] of graph) {
      const rel = path.relative(ROOT_DIR, file);
      if (content.includes('lib/claude')) claudeImports.push(rel);
      if (content.includes('ANTHROPIC_API_KEY')) apiKeyMentions.push(rel);
    }

    expect(claudeImports).toEqual([]);
    expect(apiKeyMentions).toEqual([]);
  });
});

/**
 * Хвилини на кожен розділ теми — рахуються, а не проставляються руками.
 *
 * Рукописне число застаріває мовчки: розділ дописали, а «4 хв» лишилось
 * старим, і сторінка теми починає брехати саме там, де обіцяє чесний
 * прогрес. Тому число виводиться з самого вмісту й перераховується
 * на кожній збірці (`prebuild`).
 *
 * Дві складові, бо розділи різні за природою:
 *   · проза — слова MDX, поділені на швидкість читання;
 *   · вправи — реальна кількість завдань і питань, узята з `drills.tsx`
 *     і `quiz.tsx` теми, по пів хвилини на пункт.
 * Без другої складової тест із двадцяти питань важив би одну хвилину:
 * у його MDX майже немає тексту, самий лише компонент.
 *
 * Шляхи імпортів тут ВІДНОСНІ, а не через alias `@/`: файл виконує `tsx`
 * поза Next.js, і `tsconfig.json` для нього не діє напряму.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOPICS_DIR = path.join(ROOT, 'src', 'content', 'topics');
const OUT = path.join(TOPICS_DIR, 'minutes.json');

/** Слів за хвилину. Це не белетристика: граматику з прикладами читають повільніше. */
const WORDS_PER_MINUTE = 140;
/** Хвилин на одне завдання чи питання тесту — подумати, відповісти, прочитати «чому». */
const MINUTES_PER_ITEM = 0.35;

/** Скільки слів у розділі: без рядків імпорту й без самих тегів JSX. */
function proseWords(mdx: string): number {
  const text = mdx
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ');
  return text.match(/[\p{L}\p{N}’'-]+/gu)?.length ?? 0;
}

/** Які іменовані експорти розділ тягне з `../drills` і `../quiz`. */
function importedNames(mdx: string): { module: string; names: string[] }[] {
  const found: { module: string; names: string[] }[] = [];
  for (const match of mdx.matchAll(/import\s*\{([^}]+)\}\s*from\s*'\.\.\/(drills|quiz)'/g)) {
    const names = (match[1] ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    found.push({ module: match[2] ?? '', names });
  }
  return found;
}

/** Пункти в експорті: блок вправ має `items`, тест — це масив питань. */
function countItems(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: unknown[] }).items.length;
  }
  return 0;
}

async function main(): Promise<void> {
  const topics = (await readdir(TOPICS_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const result: Record<string, Record<string, number>> = {};

  for (const topic of topics) {
    const sectionsDir = path.join(TOPICS_DIR, topic, 'sections');
    let files: string[];
    try {
      files = (await readdir(sectionsDir)).filter((name) => name.endsWith('.mdx')).sort();
    } catch {
      continue; // тема без вмісту — у планах
    }

    // Модулі даних теми вантажимо один раз: у них справжні масиви завдань,
    // а не текст, який довелося б розбирати регуляркою.
    const modules: Record<string, Record<string, unknown>> = {};
    for (const name of ['drills', 'quiz']) {
      try {
        modules[name] = (await import(
          path.join(TOPICS_DIR, topic, `${name}.tsx`)
        )) as Record<string, unknown>;
      } catch {
        modules[name] = {};
      }
    }

    const perSection: Record<string, number> = {};
    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '');
      const mdx = await readFile(path.join(sectionsDir, file), 'utf8');

      let items = 0;
      for (const { module, names } of importedNames(mdx)) {
        for (const name of names) items += countItems(modules[module]?.[name]);
      }

      const minutes = proseWords(mdx) / WORDS_PER_MINUTE + items * MINUTES_PER_ITEM;
      perSection[slug] = Math.max(1, Math.round(minutes));
    }

    result[topic] = perSection;
  }

  await writeFile(OUT, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  const total = Object.values(result).reduce(
    (sum, sections) => sum + Object.values(sections).reduce((a, b) => a + b, 0),
    0,
  );
  console.log(`${OUT}: ${Object.keys(result).length} тем, ${total} хв разом`);
}

await main();

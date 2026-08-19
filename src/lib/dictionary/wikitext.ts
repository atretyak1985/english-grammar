import { audioUrl } from './commons';
import { MAX_DEFINITIONS, MAX_EXAMPLES, MAX_QUOTES, type DictionaryEntry } from './types';

/**
 * Парсер wikitext. Усе тут — чисті функції над рядком, тому покривається
 * тестами на збережених фікстурах і не потребує мережі: розмітка Wiktionary
 * змінюється значно частіше, ніж наш код, і зловити це має тест, а не
 * користувач.
 */

interface Template {
  name: string;
  /** аргументи без назви шаблону, у порядку джерела, як є (з `key=value`) */
  args: string[];
  /** позиція в тексті — за нею тримаємо порядок «перший IPA», «перше аудіо» */
  start: number;
}

/**
 * Шаблони бувають вкладені (`{{quote-book|…{{nb...|…}}…}}`), тому рахуємо
 * дужки, а не ловимо регексом: інакше зовнішній шаблон обривається на
 * першому внутрішньому `}}`.
 */
function collectTemplates(text: string): Template[] {
  const found: Template[] = [];
  const stack: number[] = [];
  for (let i = 0; i < text.length - 1; i += 1) {
    if (text[i] === '{' && text[i + 1] === '{') {
      stack.push(i + 2);
      i += 1;
      continue;
    }
    if (text[i] === '}' && text[i + 1] === '}') {
      const start = stack.pop();
      if (start !== undefined) {
        const parts = splitArgs(text.slice(start, i));
        const name = (parts[0] ?? '').trim().toLowerCase();
        found.push({ name, args: parts.slice(1), start });
      }
      i += 1;
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

/** Ділимо по `|` лише на верхньому рівні: вкладені шаблони й посилання цілі. */
function splitArgs(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < body.length; i += 1) {
    const two = body.slice(i, i + 2);
    if (two === '{{' || two === '[[') {
      depth += 1;
      current += two;
      i += 1;
      continue;
    }
    if (two === '}}' || two === ']]') {
      depth -= 1;
      current += two;
      i += 1;
      continue;
    }
    if (body[i] === '|' && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += body[i] ?? '';
  }
  parts.push(current);
  return parts;
}

/** Позиційні аргументи шаблону: без `key=value` і без коду мови. */
function positionalArgs(template: Template): string[] {
  return template.args
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0 && !arg.includes('=') && arg !== 'en');
}

/**
 * Сторінка Wiktionary — це всі мови світу під одним заголовком. Беремо рівно
 * секцію ==English==, інакше в українські переклади потрапить, скажімо,
 * нідерландське значення того самого написання.
 */
export function englishSection(wikitext: string): string | null {
  const header = /^==\s*English\s*==[ \t]*$/m.exec(wikitext);
  if (!header) return null;
  const body = wikitext.slice(header.index + header[0].length);
  const next = /\n==[^=]/.exec(body);
  return next ? body.slice(0, next.index) : body;
}

/** `[[слово|показ]]` → `показ`, `[[слово]]` → `слово`, `[url текст]` → `текст`. */
function stripLinks(text: string): string {
  return text
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[(?:https?:)\/\/\S+\s+([^\]]*)\]/g, '$1')
    .replace(/\[(?:https?:)\/\/\S+\]/g, '');
}

/** Шаблони-посилання несуть саме слово, тому їх розкриваємо, а не викидаємо. */
const INLINE_LINK_TEMPLATES = new Set(['l', 'm', 'w', 'll', 'link', 'mention']);

function expandInlineTemplates(text: string): string {
  let out = text;
  for (let pass = 0; pass < 6; pass += 1) {
    let changed = false;
    out = out.replace(/\{\{([^{}]*)\}\}/g, (whole, body: string) => {
      const parts = splitArgs(body);
      const name = (parts[0] ?? '').trim().toLowerCase();
      if (!INLINE_LINK_TEMPLATES.has(name)) return whole;
      const positional = parts
        .slice(1)
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0 && !arg.includes('=') && arg !== 'en');
      changed = true;
      return positional[0] ?? '';
    });
    if (!changed) break;
  }
  return out;
}

function stripTemplates(text: string): string {
  let out = text;
  for (let pass = 0; pass < 8; pass += 1) {
    const next = out.replace(/\{\{[^{}]*\}\}/g, ' ');
    if (next === out) break;
    out = next;
  }
  return out.replace(/\{\{|\}\}/g, ' ');
}

/** Wikitext → людський рядок: без розмітки, без службових шаблонів, без HTML. */
function cleanText(raw: string): string {
  return stripLinks(stripTemplates(expandInlineTemplates(raw)))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|emsp|thinsp);/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/'{2,}/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[\s,.;:—–-]+/, '')
    .replace(/[\s,;:]+$/, '')
    .trim();
}

/** IPA: перший варіант першого шаблону, без слешів і квадратних дужок. */
export function parseIpa(englishWikitext: string): string | null {
  for (const template of collectTemplates(englishWikitext)) {
    if (template.name !== 'ipa') continue;
    for (const arg of positionalArgs(template)) {
      const match = /^[/[](.+)[/\]]$/.exec(arg);
      if (match?.[1]) return match[1].trim();
    }
  }
  return null;
}

/**
 * Рядок визначення будь-якої глибини: `# …`, `## …`, `### …`.
 *
 * Саме будь-якої, а не першого рівня: у великих статтях перший рівень часто
 * несе лише мітку (`# {{lb|en|transitive}}`), а самі означення лежать на
 * другому-третьому (`### To become aware of…`). На `realize` через це виходило
 * нуль означень при 36 КБ тексту.
 *
 * Приклади й цитати (`#:`, `#*`) сюди не потрапляють: після решіток обовʼязковий
 * пробіл, а в них — двокрапка або зірочка.
 */
const DEFINITION_LINE = /^#+[ \t]+(.*)$/;

export function parseDefinitions(englishWikitext: string): string[] {
  const out: string[] = [];
  for (const line of englishWikitext.split('\n')) {
    const match = DEFINITION_LINE.exec(line);
    if (!match?.[1]) continue;
    const text = cleanText(match[1]);
    // Порожньо буває, коли все визначення — службовий шаблон
    // (`{{infl of|en|deploy||ed-form}}`): такій формі місце не тут, а в лемі.
    if (text.length < 2 || out.includes(text)) continue;
    out.push(text);
    if (out.length >= MAX_DEFINITIONS) break;
  }
  return out;
}

/** Шаблони, у яких лежить саме речення-приклад, а не синоніми чи тезаурус. */
const EXAMPLE_TEMPLATES = new Set(['ux', 'uxi', 'usex', 'coi', 'co']);

/** Рядок короткого приклада: `#:`, будь-якої глибини. */
const USAGE_LINE = /^#+:[ \t]*(.*)$/;
/** Рядок цитати: `#*`. */
const QUOTE_LINE = /^#+\*[ \t]*(.*)$/;

/**
 * Короткі навчальні приклади. Саме вони потрібні першими: цитати з книжок
 * бувають на три рядки й літературні, а тут треба побачити слово в дії.
 * На C1–C2 такі приклади є лише у 87% статей — решту закриють цитати.
 */
export function parseExamples(englishWikitext: string): string[] {
  const out: string[] = [];
  for (const line of englishWikitext.split('\n')) {
    const match = USAGE_LINE.exec(line);
    if (!match?.[1]) continue;
    for (const template of collectTemplates(match[1])) {
      if (!EXAMPLE_TEMPLATES.has(template.name)) continue;
      const text = cleanText(positionalArgs(template)[0] ?? '');
      if (text.length < 8 || out.includes(text)) continue;
      out.push(text);
      if (out.length >= MAX_EXAMPLES) return out;
    }
  }
  return out;
}

/** Цитати з джерел: довгі, тому окремо й лише в розкритій картці. */
export function parseQuotes(englishWikitext: string): string[] {
  const out: string[] = [];
  for (const line of englishWikitext.split('\n')) {
    const match = QUOTE_LINE.exec(line);
    if (!match?.[1]) continue;
    for (const template of collectTemplates(match[1])) {
      const passage = template.args.find((arg) => arg.trimStart().startsWith('passage='));
      if (!passage) continue;
      const text = cleanText(passage.trimStart().slice('passage='.length));
      if (text.length < 8 || text.length > 200 || out.includes(text)) continue;
      out.push(text);
      if (out.length >= MAX_QUOTES) return out;
    }
  }
  return out;
}

/**
 * Імʼя аудіофайлу. Пріоритет — американська вимова, потім британська, потім
 * будь-яка: у школі вчать американську, а мати хоч якесь аудіо краще, ніж не
 * мати жодного.
 */
export function parseAudioFile(englishWikitext: string): string | null {
  const files: string[] = [];
  for (const template of collectTemplates(englishWikitext)) {
    if (template.name !== 'audio') continue;
    const file = positionalArgs(template)[0];
    if (file && /\.(?:ogg|oga|wav|mp3|flac)$/i.test(file)) files.push(file);
  }
  if (files.length === 0) return null;

  const byPrefix = (prefixes: string[]) =>
    files.find((file) => prefixes.some((prefix) => file.toLowerCase().startsWith(prefix)));

  return byPrefix(['en-us-', 'en-us']) ?? byPrefix(['en-uk-', 'en-gb-']) ?? files[0] ?? null;
}

/**
 * Куди стаття перенаправляє, коли власного означення в неї немає.
 *
 * Одна функція на всі випадки: британські написання й словоформи відрізняються
 * лише назвою шаблону, а потрібна поведінка та сама — взяти назву й дозапитати
 * її одним пакетом. Цільове слово беремо як перший ПОЗИЦІЙНИЙ аргумент, бо
 * зустрічається `{{standard spelling of|en|from=ise-form|realize}}` — іменований
 * аргумент стоїть ПЕРЕД цільовим словом.
 */
const TARGET_TEMPLATES = new Set([
  // написання: домінує `standard spelling of` (6 із 7 перевірених)
  'standard spelling of',
  'standard form of',
  'alternative spelling of',
  'alt sp',
  'alternative form of',
  'alt form',
  'american spelling of',
  'british spelling of',
  'nonstandard spelling of',
  // словоформи: у живих статтях зустрічається саме скорочення `infl of`
  'inflection of',
  'infl of',
  'plural of',
  'past participle of',
  'present participle of',
  'en-past of',
  'en-simple past of',
  'en-third-person singular of',
  'en-third person singular of',
  'en-ing form of',
  'en-comparative of',
  'en-superlative of',
  'en-plural noun of',
  'comparative of',
  'superlative of',
]);

export function resolveTarget(wikitext: string): string | null {
  const english = englishSection(wikitext) ?? wikitext;
  for (const template of collectTemplates(english)) {
    if (!TARGET_TEMPLATES.has(template.name)) continue;
    // `{{plural of|en|study#Noun}}` — цільове слово з анкором на секцію.
    // Анкор потрібен людині, а не API: назва статті — це те, що до решітки.
    const target = positionalArgs(template)[0]?.split('#')[0]?.trim();
    if (target) return target;
  }
  return null;
}

/**
 * Складання статті з однієї сторінки. Підсторінка `WORD/translations` тут не
 * потрібна: заміряно на 7 словах — там немає ні IPA, ні означень, ні прикладів,
 * лише таблиці перекладів на 18–36 КБ.
 */
export function parseEntry(word: string, mainWikitext: string): DictionaryEntry | null {
  const english = englishSection(mainWikitext);
  if (english === null) return null;

  const audioFile = parseAudioFile(english);

  return {
    word,
    lemma: word,
    ipa: parseIpa(english),
    definitions: parseDefinitions(english),
    examples: parseExamples(english),
    quotes: parseQuotes(english),
    audioUrl: audioFile ? audioUrl(audioFile) : null,
    source: 'wiktionary',
    license: 'CC BY-SA 4.0',
    sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}#English`,
  };
}

/** Чи є у статті хоч що показати: без цього форму варто змінити на лему. */
export function hasSubstance(entry: DictionaryEntry): boolean {
  return entry.definitions.length > 0;
}

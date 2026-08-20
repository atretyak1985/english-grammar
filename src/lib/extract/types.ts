/** Межі, однакові для сервера й клієнта: клієнт відсіює завелике ще до відправки. */
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/** Аналізатору вистачає кількох сторінок; довший текст лише сповільнює підсвітку. */
export const MAX_TEXT_CHARS = 120_000;

export type ExtractKind = 'pdf' | 'image' | 'text';

export interface Extraction {
  kind: ExtractKind;
  text: string;
  /** Рядок для UI: скільки сторінок або яка впевненість розпізнавання. */
  detail: string;
  /** Текст обрізано на MAX_TEXT_CHARS. */
  truncated: boolean;
}

export interface ExtractError {
  error: string;
}

export function isExtractError(value: Extraction | ExtractError): value is ExtractError {
  return 'error' in value;
}

/**
 * PDF і фото дають текст із «рваними» переносами: у PDF рядок ламається на
 * ширині колонки, в OCR — на краю знімка. Аналізатор шукає конструкції на кшталт
 * «had + V3», тому склеюємо рядки в абзаци, зберігаючи порожні як межі абзаців.
 */
export function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/-\n(?=\p{Ll})/gu, '')
    .replace(/([^\n])\n(?!\n)/g, '$1 ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

export function truncate(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_TEXT_CHARS) return { text, truncated: false };
  const cut = text.slice(0, MAX_TEXT_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return { text: lastSpace > MAX_TEXT_CHARS - 200 ? cut.slice(0, lastSpace) : cut, truncated: true };
}

import { createHash } from 'node:crypto';

/**
 * Пряме посилання на файл у Wikimedia Commons без жодного API: шлях до файлу —
 * це два перші символи MD5 від його імені. Один запит замість двох, і немає
 * чого кешувати.
 *
 * Функція серверна (node:crypto) і чиста.
 */

const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons';

/**
 * MediaWiki сам піднімає першу літеру імені файлу й міняє пробіли на
 * підкреслення. Хеш беремо ВЖЕ з нормалізованого імені — інакше шлях
 * вказує в нікуди й Commons віддає 404.
 */
function normalizeFileName(fileName: string): string {
  const trimmed = fileName.trim().replace(/^File:/i, '').replace(/ /g, '_');
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function shard(name: string): string {
  const hash = createHash('md5').update(name, 'utf8').digest('hex');
  return `${hash.slice(0, 1)}/${hash.slice(0, 2)}`;
}

/** Повний URL оригіналу (у Wiktionary це майже завжди .ogg або .wav). */
export function audioUrl(fileName: string): string {
  const name = normalizeFileName(fileName);
  return `${COMMONS}/${shard(name)}/${encodeURIComponent(name)}`;
}

/**
 * Перекодована Commons-ом копія в mp3. Safari не грає Vorbis у .ogg, тому
 * для нього потрібна саме ця схема (фаза 6).
 */
export function audioMp3Url(fileName: string): string {
  const name = normalizeFileName(fileName);
  const encoded = encodeURIComponent(name);
  return `${COMMONS}/transcoded/${shard(name)}/${encoded}/${encoded}.mp3`;
}

/**
 * Аудіо-вимова на клієнті. `commons.ts` рахує ті самі URL, але через
 * `node:crypto` — його не можна тягнути в браузерний бандл. Тут MD5 не
 * потрібен узагалі: шард уже стоїть у готовому URL оригіналу, а перекодована
 * копія лежить за тим самим шардом під `transcoded/`.
 */

const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/';

/**
 * Перекодована Commons-ом копія в mp3 для URL оригіналу.
 *
 * Потрібна, бо Wiktionary віддає `.ogg` (а подекуди `.wav`), і Safari не грає
 * Vorbis. Резервом лишається сам оригінал: mp3 існує лише там, де Commons уже
 * зробив перекодування, тому на рідкісних файлах він дає 404.
 */
export function transcodedMp3Url(originalUrl: string | null): string | null {
  if (originalUrl === null || !originalUrl.startsWith(COMMONS)) return null;

  const path = originalUrl.slice(COMMONS.length);
  if (path.startsWith('transcoded/')) return originalUrl;

  const parts = path.split('/');
  if (parts.length !== 3) return null;
  const [first, second, name] = parts;
  if (!first || !second || !name) return null;
  if (name.toLowerCase().endsWith('.mp3')) return originalUrl;

  return `${COMMONS}transcoded/${first}/${second}/${name}/${name}.mp3`;
}

/**
 * MIME оригіналу за розширенням. Тип у `<source>` — підказка браузеру, з якої
 * саме доріжки починати; невірний тип на `.wav` коштував би резерву там, де
 * перекодованої mp3 немає.
 */
export function audioMimeType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.flac')) return 'audio/flac';
  return 'audio/ogg';
}

import { describe, expect, it } from 'vitest';

import { audioMimeType, transcodedMp3Url } from './audio';
import { audioMp3Url, audioUrl } from './commons';

describe('transcodedMp3Url', () => {
  it('дає той самий URL, що й серверний audioMp3Url', () => {
    for (const file of ['en-us-improve.ogg', 'En-us-deploy.ogg', 'LL-Q1860 (eng)-Vealhurl-time.wav']) {
      expect(transcodedMp3Url(audioUrl(file))).toBe(audioMp3Url(file));
    }
  });

  it('без аудіо повертає null', () => {
    expect(transcodedMp3Url(null)).toBeNull();
  });

  it('чужий хост не чіпає', () => {
    expect(transcodedMp3Url('https://example.com/a/ab/word.ogg')).toBeNull();
  });

  it('уже перекодоване або вже mp3 віддає як є', () => {
    const mp3 = audioMp3Url('en-us-improve.ogg');
    expect(transcodedMp3Url(mp3)).toBe(mp3);
  });
});

describe('audioMimeType', () => {
  it('розрізняє ogg, wav і mp3', () => {
    expect(audioMimeType('https://x/a.ogg')).toBe('audio/ogg');
    expect(audioMimeType('https://x/a.WAV')).toBe('audio/wav');
    expect(audioMimeType('https://x/a.mp3')).toBe('audio/mpeg');
  });
});

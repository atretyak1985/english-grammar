import { describe, expect, it } from 'vitest';

import { audioMp3Url, audioUrl } from './commons';

describe('audioUrl', () => {
  it('дає перевірений шлях до файлу на Commons', () => {
    expect(audioUrl('en-us-improve.ogg')).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/2/2a/En-us-improve.ogg',
    );
  });

  it('піднімає першу літеру й міняє пробіли — інакше Commons віддає 404', () => {
    expect(audioUrl('LL-Q1860 (eng)-Vealhurl-cursory.wav')).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/e/e6/LL-Q1860_(eng)-Vealhurl-cursory.wav',
    );
  });

  it('приймає імʼя з префіксом File:', () => {
    expect(audioUrl('File:en-us-improve.ogg')).toBe(audioUrl('en-us-improve.ogg'));
  });

  it('mp3-копія лежить під тим самим шардом у transcoded', () => {
    expect(audioMp3Url('en-us-improve.ogg')).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2a/En-us-improve.ogg/En-us-improve.ogg.mp3',
    );
  });
});

import { describe, expect, it } from 'vitest';

import { safeNextPath } from './next-path';

describe('safeNextPath', () => {
  it('приймає локальний шлях без запиту', () => {
    expect(safeNextPath('/account')).toBe('/account');
  });

  it('приймає локальний шлях із рядком запиту як є', () => {
    expect(safeNextPath('/library/x?a=1')).toBe('/library/x?a=1');
  });

  it('відкидає протокол-відносний "//host" — виглядає локальним, а веде на інший хост', () => {
    expect(safeNextPath('//evil.com')).toBe('/account');
  });

  it('відкидає "/\\host" — той самий протокол-відносний трюк через зворотну похилу', () => {
    expect(safeNextPath('/\\evil.com')).toBe('/account');
  });

  it('відкидає абсолютний URL з протоколом', () => {
    expect(safeNextPath('https://evil.com')).toBe('/account');
  });

  it('відкидає рядок без провідного "/"', () => {
    expect(safeNextPath('evil.com')).toBe('/account');
  });

  it('відкидає подвійний "/\\/\\" префікс', () => {
    expect(safeNextPath('/\\/\\evil.com')).toBe('/account');
  });

  it('відкидає URL-екранований "%2F%2Fevil.com" — не починається з "/" буквально', () => {
    expect(safeNextPath('%2F%2Fevil.com')).toBe('/account');
  });

  it('відкидає undefined', () => {
    expect(safeNextPath(undefined)).toBe('/account');
  });

  it('відкидає null', () => {
    expect(safeNextPath(null)).toBe('/account');
  });

  it('відкидає число', () => {
    expect(safeNextPath(42)).toBe('/account');
  });

  it('відкидає масив (повторений параметр запиту)', () => {
    expect(safeNextPath(['/account', '/pricing'])).toBe('/account');
  });

  it('відкидає порожній рядок', () => {
    expect(safeNextPath('')).toBe('/account');
  });
});

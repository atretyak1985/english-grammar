import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MISSES_PER_WINDOW,
  WINDOW_MS,
  clearWindows,
  clientIp,
  reserveMisses,
  withExternalLock,
} from './throttle';

beforeEach(() => {
  clearWindows();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('reserveMisses', () => {
  it('пускає рівно ліміт промахів і відмовляє наступному', () => {
    for (let index = 0; index < MISSES_PER_WINDOW; index += 1) {
      expect(reserveMisses('10.0.0.1', 1)).toBe(true);
    }

    expect(reserveMisses('10.0.0.1', 1)).toBe(false);
  });

  it('рахує вікно окремо для кожної адреси', () => {
    for (let index = 0; index < MISSES_PER_WINDOW; index += 1) reserveMisses('10.0.0.1', 1);

    expect(reserveMisses('10.0.0.2', 1)).toBe(true);
  });

  it('попадання в кеш (нуль промахів) нічого не витрачає', () => {
    for (let index = 0; index < 500; index += 1) {
      expect(reserveMisses('10.0.0.3', 0)).toBe(true);
    }

    expect(reserveMisses('10.0.0.3', MISSES_PER_WINDOW)).toBe(true);
  });

  it('відмова не списує квоту: після неї менший запит проходить', () => {
    reserveMisses('10.0.0.4', MISSES_PER_WINDOW - 1);

    expect(reserveMisses('10.0.0.4', 5)).toBe(false);
    expect(reserveMisses('10.0.0.4', 1)).toBe(true);
  });

  it('нове вікно відкривається після 60 секунд', () => {
    vi.useFakeTimers();
    for (let index = 0; index < MISSES_PER_WINDOW; index += 1) reserveMisses('10.0.0.5', 1);
    expect(reserveMisses('10.0.0.5', 1)).toBe(false);

    vi.advanceTimersByTime(WINDOW_MS + 1);

    expect(reserveMisses('10.0.0.5', 1)).toBe(true);
  });
});

describe('clientIp', () => {
  it('бере першу адресу зі списку проксі', () => {
    const request = new Request('http://localhost/api/dictionary', {
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });

    expect(clientIp(request)).toBe('203.0.113.7');
  });

  it('без заголовка все зливається в одне вікно', () => {
    expect(clientIp(new Request('http://localhost/api/dictionary'))).toBe('unknown');
  });
});

describe('withExternalLock', () => {
  it('пропускає операції по одній', async () => {
    const order: string[] = [];
    const task = (name: string) => async () => {
      order.push(`${name}:start`);
      await Promise.resolve();
      order.push(`${name}:end`);
      return name;
    };

    const results = await Promise.all([withExternalLock(task('a')), withExternalLock(task('b'))]);

    expect(results).toEqual(['a', 'b']);
    expect(order).toEqual(['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('падіння однієї операції не блокує наступну', async () => {
    await expect(withExternalLock(() => Promise.reject(new Error('джерело недоступне')))).rejects.toThrow(
      'джерело недоступне',
    );

    await expect(withExternalLock(() => Promise.resolve('ok'))).resolves.toBe('ok');
  });
});

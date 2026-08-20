import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Тільки чиста логіка: злиття стану, розбиття на сторінки, порівняння перекладів.
 * Компоненти перевіряються браузером, тому ні jsdom, ні RTL тут не потрібні.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

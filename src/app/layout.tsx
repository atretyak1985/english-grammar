import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Literata, Onest } from 'next/font/google';

import '@/app/globals.css';

import { AppStateProvider } from '@/components/providers/AppStateProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppShell } from '@/components/shell/AppShell';
import { loadShellState } from '@/lib/state/server';
import { THEME_BOOTSTRAP_SCRIPT } from '@/lib/state/storage';

export const metadata: Metadata = {
  title: {
    default: 'Граматика англійської — пояснення українською',
    template: '%s | Граматика англійської',
  },
  description:
    'Граматика англійської мови з поясненнями українською: правила, приклади з перекладом, типові помилки українців, вправи і тести. Плюс аналіз власного тексту і словник за частотністю.',
  applicationName: 'Граматика англійської',
  openGraph: {
    type: 'website',
    locale: 'uk_UA',
    siteName: 'Граматика англійської',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

/**
 * Шрифти напряму «Читальня». Три гарнітури, три різні роботи:
 * Literata несе читання й заголовки — саме серифна форма робить екран
 * книжкою; Onest тримає інтерфейс; JetBrains Mono — капітельні мітки.
 *
 * Усі три змінні (variable fonts), тому `weight` не перелічуємо: Next
 * підтягує одну вісь замість набору статичних накреслень, а макет
 * користається діапазоном 400–800 без розривів.
 *
 * Кириличний набір обовʼязковий у всіх трьох, моно включно: капітельні
 * мітки макета — українською («ПОЯСНЕННЯ УКРАЇНСЬКОЮ»), і без cyrillic
 * вони випали б у підставний шрифт.
 */
/*
  `axes: ['opsz']` — не оздоба. У Literata є оптичний розмір, і за
  замовчуванням `next/font` тягне лише вісь ваги, підставляючи опції
  opsz сталим значенням. Тоді ширини літер розходяться з макетом, який
  бере шрифт із повним діапазоном 7..72, — рядок «повзе» на піксель і
  звірка світиться на кожному текстовому блоці замість справжніх
  розбіжностей.
*/
const literata = Literata({
  subsets: ['latin', 'cyrillic'],
  axes: ['opsz'],
  variable: '--font-literata',
  display: 'swap',
});

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { signedIn, serverState, email } = await loadShellState();
  // Літера в аватарі топбара — перша з пошти, бо імені в сесії немає.
  // Порожній рядок відкидаємо: `''[0]` дало б undefined, а не заглушку.
  const initial = email?.trim() ? (email.trim()[0]?.toUpperCase() ?? null) : null;

  return (
    <html
      lang="uk"
      className={`${literata.variable} ${onest.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Клас теми ставиться до першого рендера, інакше блимає світлий фон */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <AppStateProvider signedIn={signedIn} serverState={serverState}>
            <AppShell signedIn={signedIn} initial={initial}>
              {children}
            </AppShell>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

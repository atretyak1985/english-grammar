import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';

import '@/app/globals.css';

import { AppStateProvider } from '@/components/providers/AppStateProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ActiveSectionProvider } from '@/components/shell/ActiveSectionProvider';
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
 * Шрифти макета. Manrope несе весь інтерфейс, IBM Plex Mono — формули й код.
 * Кириличний набір обовʼязковий: інтерфейс українською.
 */
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { signedIn, serverState } = await loadShellState();

  return (
    <html
      lang="uk"
      className={`${manrope.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Клас теми ставиться до першого рендера, інакше блимає світлий фон */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <AppStateProvider signedIn={signedIn} serverState={serverState}>
            <ActiveSectionProvider>
              <AppShell>{children}</AppShell>
            </ActiveSectionProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

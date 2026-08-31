import type { Metadata } from 'next';

import { WordsScreen } from '@/components/words/WordsScreen';
import { listStoryFrequencies } from '@/lib/library/server';

export const metadata: Metadata = {
  title: 'Мій словник',
  description:
    'Слова, які ви позначили «вчу» або «знаю»: транскрипція, англійське означення, приклади, вимова і власні нотатки.',
};

/**
 * Частотні списки бібліотеки їдуть на клієнт заради фільтра «не знаю»:
 * статуси слів живуть у браузері, тому лише там видно, які слова з текстів
 * ще без позначки.
 */
export default async function WordsPage() {
  const corpus = await listStoryFrequencies();
  return <WordsScreen corpus={corpus} />;
}

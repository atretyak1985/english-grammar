import type { Metadata } from 'next';

import { WordsScreen } from '@/components/words/WordsScreen';

export const metadata: Metadata = {
  title: 'Мій словник',
  description:
    'Слова, які ви позначили «вчу» або «знаю»: транскрипція, англійське означення, приклади, вимова і власні нотатки.',
};

export default function WordsPage() {
  return <WordsScreen />;
}

import type { Metadata } from 'next';

import { WordsScreen } from '@/components/words/WordsScreen';

export const metadata: Metadata = {
  title: 'Слова',
  description:
    'Частотний словник з ваших текстів зі статусами «не знаю / вчу / знаю» — порядок вивчення за частотою вживання.',
};

export default function WordsPage() {
  return <WordsScreen />;
}

import type { Metadata } from 'next';

import { NewTextScreen } from '@/components/analyzer/NewTextScreen';

export const metadata: Metadata = {
  title: 'Свій текст',
  description:
    'Вставте англійський текст або завантажте файл — підсвітка часів працює одразу, без реєстрації.',
};

export default function NewTextPage() {
  return <NewTextScreen />;
}

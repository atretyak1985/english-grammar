import type { Metadata } from 'next';

import { AnalyzerScreen } from '@/components/analyzer/AnalyzerScreen';

export const metadata: Metadata = {
  title: 'Аналіз тексту',
  description:
    'Вставте англійський текст — застосунок підсвітить Past Simple, Past Continuous і Past Perfect і покаже, які слова вам незнайомі.',
};

export default function AnalyzePage() {
  return <AnalyzerScreen />;
}

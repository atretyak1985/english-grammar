import type { Metadata } from 'next';

import { ReadingShelf } from '@/components/reading/ReadingShelf';
import { listStories } from '@/lib/library/server';

export const metadata: Metadata = {
  title: 'Читання',
  description:
    'Полиця читання: оповідання з готовою підсвіткою часів і власні тексти. Розбір уже зроблено — читайте без входу і без очікування моделі.',
};

/**
 * Полиця читання. Сторінка серверна й робить рівно одне: приносить список
 * оповідань. Усе решта — почата книжка, власні тексти, фільтри — живе на
 * клієнті, бо лежить у localStorage (`ReadingShelf`).
 */
export default async function ReadingPage() {
  const stories = await listStories();

  return <ReadingShelf stories={stories} />;
}

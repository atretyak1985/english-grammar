import type { Metadata } from 'next';

import { TrainScreen } from '@/components/train/TrainScreen';
import { loadTrainingPool } from '@/lib/drills/pool';

export const metadata: Metadata = {
  title: 'Тренування',
  description:
    'Чотири короткі вправи з ваших текстів: скласти речення, заповнити пропуск, картки слів і пари слово — значення.',
};

/**
 * Тренування. Речення для граматичних вправ збираються тут, на сервері, з
 * оповідань бібліотеки; слова для лексичних — на клієнті, зі статусів
 * читача. Екран сам вирішує, що з цього показати першим: те, що людина
 * справді читала.
 */
export default async function TrainPage() {
  const stories = await loadTrainingPool();
  return <TrainScreen stories={stories} />;
}

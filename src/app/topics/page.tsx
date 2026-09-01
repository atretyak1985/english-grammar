import type { Metadata } from 'next';

import { TopicsGrid } from '@/components/topic/TopicsGrid';
import { READY_TOPICS } from '@/data/topics';

export const metadata: Metadata = {
  title: 'Теми',
  description:
    'Усі теми граматики англійської з поясненнями українською: часи, артиклі, умовні речення, модальні дієслова, прийменники.',
};

/**
 * Список тем окремою сторінкою.
 *
 * Макета цього екрана концепція не малює — він виведений: заголовок,
 * підзаголовок і поля взяті з шапки полиці «Що читаємо?» (2a), сітка
 * тем лишилась та сама, що стояла на головній. Сторінка існує тому, що
 * пункт «Теми» у топбарі мусить кудись вести, а сітка пішла з головної:
 * без цього маршруту теми стали б недосяжними з навігації.
 */
export default function TopicsPage() {
  return (
    <div className="mx-auto w-full max-w-shell px-9 py-9">
      <div className="mb-[22px]">
        <h1 className="font-serif m-0 mb-1.5 text-[32px] font-extrabold tracking-[-0.5px]">
          Теми
        </h1>
        <div className="text-ink-2 text-[14px]">
          {READY_TOPICS.length} тем готові, решта в планах — усі з поясненнями українською
        </div>
      </div>

      <TopicsGrid />
    </div>
  );
}

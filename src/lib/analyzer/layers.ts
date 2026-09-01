import { TENSE_KEYS, TENSE_TIME, type TenseKey, type TenseTime } from '@/types/content';

/**
 * Шари підсвітки — темами, а не окремими конструкціями.
 *
 * До цього читалка давала дев'ять незалежних перемикачів, і за замовчуванням
 * усі дев'ять світилися одразу. Кольорів при цьому три, бо колір означає вид:
 * синій однаково діставався Past Simple, Present Simple і Future Simple. На
 * тексті, де є всі три часи, колір перестає щось означати — читач бачить
 * синє слово й не знає, минуле це чи майбутнє.
 *
 * Тому підсвітка тепер має активну тему, і в межах теми колір однозначний:
 * рівно одна конструкція на кожен колір. Усередині теми три правила можна
 * вимикати окремо — саме це й потрібно, коли розбираєш, чим Perfect
 * відрізняється від Simple, і хочеш прибрати з очей усе інше.
 */

export type LayerTopicId = TenseTime;

export interface LayerTopic {
  id: LayerTopicId;
  label: string;
  /** Три конструкції теми — по одній на колір */
  tenses: TenseKey[];
}

const LABEL: Record<LayerTopicId, string> = {
  past: 'Минулі часи',
  present: 'Теперішні часи',
  future: 'Майбутні часи',
};

/*
  Склад тем виводиться з `TENSE_TIME`, а не переписується списком: два
  джерела розійшлися б на наступній конструкції, і вона тихо не потрапила б
  ні в один шар — тобто зникла б із підсвітки взагалі.
*/
export const LAYER_TOPICS: LayerTopic[] = (['past', 'present', 'future'] as LayerTopicId[]).map(
  (id) => ({
    id,
    label: LABEL[id],
    tenses: TENSE_KEYS.filter((tense) => TENSE_TIME[tense] === id),
  }),
);

export function layerTopic(id: LayerTopicId): LayerTopic {
  const found = LAYER_TOPICS.find((topic) => topic.id === id);
  if (!found) throw new Error(`Невідомий шар підсвітки: ${id}`);
  return found;
}

/**
 * З якої теми починати. Беремо ту, якої в тексті найбільше: відкривати
 * читалку на темі, якої в тексті немає, означало б показати текст без жодної
 * підсвітки й змусити шукати перемикач, щоб побачити те, за чим прийшли.
 */
export function busiestTopic(count: (tense: TenseKey) => number): LayerTopicId {
  let best = LAYER_TOPICS[0];
  let bestTotal = -1;

  for (const topic of LAYER_TOPICS) {
    const total = topic.tenses.reduce((sum, tense) => sum + count(tense), 0);
    if (total > bestTotal) {
      best = topic;
      bestTotal = total;
    }
  }

  return best?.id ?? 'past';
}

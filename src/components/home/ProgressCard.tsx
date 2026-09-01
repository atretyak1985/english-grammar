'use client';

import { useAppState } from '@/components/providers/AppStateProvider';

/**
 * «Мій прогрес · чесні числа».
 *
 * Заголовок картки — обіцянка, і вона тримається буквально: усі три
 * числа мають джерело в стані застосунку. Макет на цих місцях малює
 * «хв читання цього тижня» і «дні серії», але ні часу читання, ні
 * лічильника занять у застосунку немає — жодної таблиці, жодного
 * провайдера. Тому геометрія лишилась макетною, а два з трьох
 * показників замінені на ті, що справді відомі: вигадане число під
 * написом «чесні числа» гірше за інший напис.
 */
export function ProgressCard() {
  const { state, ready } = useAppState();

  const statuses = Object.values(state.words);
  const inDictionary = statuses.filter((status) => status !== 'unknown').length;
  const learning = statuses.filter((status) => status === 'learning').length;
  const sectionsRead = Object.values(state.readSections).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );

  return (
    <div className="bg-panel border-line rounded-tile border px-6 py-5">
      <div className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        Мій прогрес · чесні числа
      </div>
      <div className="mt-3 flex gap-6">
        <Metric value={ready ? inDictionary : 0} label="слів у словнику" />
        <Metric value={ready ? learning : 0} label="у статусі «вчу»" accent />
        <Metric value={ready ? sectionsRead : 0} label="розділів прочитано" />
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className={`font-serif text-[26px] font-extrabold ${accent ? 'text-pc' : ''}`}>
        {value}
      </div>
      <div className="text-ink-3 text-[12px]">{label}</div>
    </div>
  );
}

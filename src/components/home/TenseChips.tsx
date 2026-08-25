/**
 * Легенда підсвітки над шляхом теми: скільки яких конструкцій знайдено в
 * демо-тексті. Числа сталі й узяті з макета — на головній немає розібраного
 * тексту, з якого їх було б чим порахувати. Щойно головна почне тримати
 * власний розбір, сюди прийдуть його `constructions`.
 */
const CHIPS = [
  { label: 'Past Simple', count: 8, tone: 'border-ps bg-ps-bg text-ps-tx' },
  { label: 'Past Continuous', count: 3, tone: 'border-pc bg-pc-bg text-pc-tx' },
  { label: 'Past Perfect', count: 4, tone: 'border-pp bg-pp-bg text-pp-tx' },
  { label: 'Незнайомі слова', count: 40, tone: 'border-green bg-green-bg text-green-tx' },
];

export function TenseChips() {
  return (
    <div className="mt-[22px] flex flex-wrap items-center gap-2">
      {CHIPS.map((chip) => (
        <span
          key={chip.label}
          className={`rounded-pill border-[1.5px] px-4 py-[7px] text-[12.5px] font-extrabold ${chip.tone}`}
        >
          {chip.label} <span className="opacity-70">{chip.count}</span>
        </span>
      ))}
      <span className="text-ink-3 ml-auto self-center text-[12px] font-extrabold">
        ↓ Джерело · демо-текст
      </span>
    </div>
  );
}

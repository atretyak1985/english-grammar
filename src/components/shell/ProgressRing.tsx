/**
 * Кільце прогресу читання — те саме число, що й у смужці шапки.
 * Кільце — конічний градієнт із заглушкою в центрі: так відсоток видно
 * без жодного svg, і воно однаково працює в обох темах.
 */
export function ProgressRing({
  read,
  total,
  size = 38,
}: {
  read: number;
  total: number;
  size?: number;
}) {
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div
      className="relative flex-none rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--ps) ${percent}%, var(--surface-2) 0)`,
      }}
    >
      <div className="bg-panel text-ink-2 absolute inset-[4px] flex items-center justify-center rounded-full text-[10.5px] font-extrabold">
        {percent}%
      </div>
    </div>
  );
}

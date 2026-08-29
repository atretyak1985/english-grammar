/**
 * Спільні класи контролів тренування. Три вправи з чотирьох малюють ті самі
 * чипи слів і ті самі дві кнопки, і розходження між ними було б не стилем,
 * а недоглядом.
 */
export const PRIMARY_BTN =
  'bg-acc rounded-btn cursor-pointer px-5 py-[11px] text-[14px] leading-[normal] font-bold text-white disabled:cursor-default disabled:opacity-50';

export const SECONDARY_BTN =
  'border-line-ctrl text-ink rounded-btn cursor-pointer border-[1.5px] px-5 py-[10px] text-[14px] leading-[normal] font-bold disabled:cursor-default disabled:opacity-50';

/** Слово-чип: серифне, як у тексті, звідки воно взяте. */
export const WORD_CHIP =
  'border-line-ctrl bg-panel rounded-ctrl border-[1.5px] px-3 py-[7px] font-serif text-[15px] leading-[normal]';

export const TAG = 'font-mono rounded-pill px-2.5 py-1 text-[11px] leading-[normal] font-bold';

/** Підпис капітеллю над блоком — той самий, що на головній і в словнику. */
export const KICKER =
  'text-ink-3 font-mono text-[10.5px] leading-[normal] font-bold tracking-[1.2px] uppercase';

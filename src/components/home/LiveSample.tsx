'use client';

import { useEffect, useState } from 'react';

/**
 * Права колонка героя: одне правило, показане так, як воно виглядає
 * всередині застосунку.
 *
 * Це доказ, а не оздоба. Аудит показав, що головна не давала побачити
 * продукт до реєстрації: людина читала обіцянку й мусила вірити на
 * слово. Тут вона бачить рівно те, що отримає в читанні — пояснення
 * зверху, речення з підсвіченими часами під ним і легенду каналів, — до
 * будь-якого кліку.
 *
 * ------------------------------------------------------------------
 * Картка сама переходить між трьома часами кожні 3.2 секунди, і саме в
 * цьому вся її робота. Речення при цьому НЕ міняється: три конструкції
 * стоять у ньому одночасно й підсвічені постійно, рухається тільки
 * кільце — «ось про цю зараз мова». Так за десять секунд видно головне
 * твердження продукту: часи не вивчають по черзі, їх розрізняють в
 * одному реченні.
 *
 * Тому ж і речення сталe: це фіксований зразок з «The Gift of the Magi»,
 * а не результат аналізу чужого тексту. Часи прописані прямо тут — на
 * сталому реченні це і є правильна відповідь, а не заглушка.
 *
 * prefers-reduced-motion зупиняє ротацію на першому стані, а не
 * прискорює її: картка, що змінює зміст сама, — це рух, від якого
 * можна тільки відмовитись, а не пришвидшити його до непомітного.
 */

/** Родина часу. Колір несе ВИД (простий / тривалий / перфект), як усюди в застосунку. */
type Kind = 'perfect' | 'simple' | 'continuous';

const FILL: Record<Kind, string> = {
  perfect: 'bg-pp-bg text-pp-tx',
  simple: 'bg-ps-bg text-ps-tx',
  continuous: 'bg-pc-bg text-pc-tx',
};

/** Та сама родина без заливки — заголовок правила бере лише чорнило. */
const INK: Record<Kind, string> = {
  perfect: 'text-pp-tx',
  simple: 'text-ps-tx',
  continuous: 'text-pc-tx',
};

/** Колір кільця активної конструкції — сам токен родини, а не її заливка. */
const RING: Record<Kind, string> = {
  perfect: 'var(--pp)',
  simple: 'var(--ps)',
  continuous: 'var(--pc)',
};

const RULES: { kind: Kind; name: string; formula: string; why: string }[] = [
  {
    kind: 'perfect',
    name: 'Past Perfect Continuous',
    formula: 'had been + V-ing',
    why: 'Дія тривала до певного моменту в минулому. Не «економила», а «вже якийсь час економила, коли…».',
  },
  {
    kind: 'simple',
    name: 'Past Simple',
    formula: 'V2 / did + V',
    why: 'Крапка на лінії часу: подія відбулась і завершилась. Головний робочий час будь-якої оповіді.',
  },
  {
    kind: 'continuous',
    name: 'Past Continuous',
    formula: 'was / were + V-ing',
    why: 'Процес у конкретний момент минулого — фон, на якому стається щось інше.',
  },
];

const CHIPS: { label: string; chip: string; mark: string }[] = [
  { label: 'Simple', chip: 'bg-ps-bg text-ps-tx', mark: 'bg-ps h-2 w-2 rounded-[2px]' },
  { label: 'Continuous', chip: 'bg-pc-bg text-pc-tx', mark: 'bg-pc h-2 w-2 rounded-[2px]' },
  { label: 'Perfect', chip: 'bg-pp-bg text-pp-tx', mark: 'bg-pp h-2 w-2 rounded-[2px]' },
  // Лексика позначається рискою, а не квадратом: це той самий знак, яким
  // слово «вчу» підкреслене в самому реченні вище.
  { label: 'слово «вчу»', chip: 'bg-yellow-bg text-yellow-tx', mark: 'bg-yellow h-[3px] w-2' },
];

export function LiveSample() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setStep((n) => (n + 1) % RULES.length), 3200);
    return () => clearInterval(timer);
  }, []);

  const rule = RULES[step]!;

  return (
    /* pt-2 — не оздоба й не випадковість. Колонки вирівняні по верху
       (`items-start`), і без цих 8px картка ставала б рівно врівень із
       капітельним кікером ліворуч. Макет опускає її на волосину нижче,
       щоб верхня межа картки не читалась як продовження того рядка. */
    <div className="min-w-0 pt-2 pb-12">
      <div className="bg-card border-line rounded-panel-xl shadow-raise overflow-hidden border">
        <div className="border-line text-ink-3 flex items-center gap-2 border-b px-[18px] py-3 text-[13px]">
          <span className="font-mono text-[11px] font-bold tracking-[1.4px] uppercase">Правило</span>
          <span aria-hidden>·</span>
          <span className="font-serif text-ink font-bold">Минулі часи</span>
          <span className="ml-auto text-[12.5px]">розділ 4 з 15</span>
        </div>

        <div className="px-[22px] pt-5 pb-1.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span
              className={`font-serif text-[24px] font-extrabold tracking-[-0.3px] ${INK[rule.kind]}`}
            >
              {rule.name}
            </span>
            <span
              className={`rounded-badge px-[9px] py-[3px] font-mono text-[13px] font-bold ${FILL[rule.kind]}`}
            >
              {rule.formula}
            </span>
          </div>
          <p className="text-ink-body m-0 mt-2 text-[15px] leading-[1.55] [text-wrap:pretty]">
            {rule.why}
          </p>
        </div>

        <div className="border-line-strong mx-[22px] mt-4 border-t border-dashed" />

        <div className="px-[22px] pt-4 pb-5">
          <div className="text-ink-3 mb-2.5 font-mono text-[11px] font-bold tracking-[1.4px] uppercase">
            У тексті · The Gift of the Magi
          </div>
          <p className="font-serif text-ink m-0 text-[18px] leading-[1.9]">
            She <Time kind="perfect" active={step === 0}>had been saving</Time> every penny for
            months, and when the day <Time kind="simple" active={step === 1}>came</Time>, she{' '}
            <Time kind="continuous" active={step === 2}>was counting</Time> the{' '}
            <span className="border-yellow bg-yellow-bg border-b-[3px]">coins</span> again.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 px-[22px] pb-5">
          {CHIPS.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-pill flex items-center gap-1.5 px-[11px] py-[5px] text-[12.5px] font-bold ${chip.chip}`}
            >
              <span className={chip.mark} aria-hidden />
              {chip.label}
            </span>
          ))}
          <span className="text-ink-3 ml-auto self-center text-[12.5px]">правило міняється само</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Конструкція в реченні. Заливка стоїть завжди — усі три часи видно
 * одночасно, — а кільце в 2px паперу і 3.5px кольору родини позначає ту
 * одну, про яку зараз розповідає картка. Кільце зроблено тінню, а не
 * рамкою: рамка розсунула б слово й зрушила весь рядок на кожному кроці
 * ротації.
 */
function Time({
  kind,
  active,
  children,
}: {
  kind: Kind;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-mark px-[5px] py-[2px] transition-all duration-300 ease-out ${FILL[kind]}`}
      style={{
        boxShadow: active ? `0 0 0 2px var(--panel), 0 0 0 3.5px ${RING[kind]}` : 'none',
      }}
    >
      {children}
    </span>
  );
}

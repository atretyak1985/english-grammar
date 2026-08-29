'use client';

import { useEffect, useRef, useState } from 'react';

import { LAYER_TOPICS, layerTopic, type LayerTopicId } from '@/lib/analyzer/layers';
import { TENSE_LABELS } from '@/lib/analyzer/tenses';
import { TENSE_ASPECT, type TenseKey } from '@/types/content';

/**
 * Вибір шару підсвітки: одна активна тема й три її правила.
 *
 * Кнопка показує, що зараз підсвічено і скільком правилам з трьох це
 * дозволено, — інакше вимкнене правило стає невидимим станом, і читач
 * пояснює собі відсутність підсвітки браком розбору, а не власним
 * перемикачем.
 */

/** Квадратик кольору правила — той самий колір, яким слово залито в тексті. */
const SWATCH: Record<'simple' | 'continuous' | 'perfect', string> = {
  simple: 'bg-ps',
  continuous: 'bg-pc',
  perfect: 'bg-pp',
};

export function HighlightLayers({
  topic,
  rules,
  onPickTopic,
  onToggleRule,
  pageCount,
  textCount,
}: {
  topic: LayerTopicId;
  /** Чи ввімкнене правило; ключі — конструкції активної теми */
  rules: Record<TenseKey, boolean>;
  onPickTopic: (id: LayerTopicId) => void;
  onToggleRule: (tense: TenseKey) => void;
  /** Скільки разів конструкція трапилась на цій сторінці */
  pageCount: (tense: TenseKey) => number;
  /** Скільки разів — у всьому тексті; ним підписані неактивні теми */
  textCount: (tense: TenseKey) => number;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, [open]);

  const active = layerTopic(topic);
  const on = active.tenses.filter((tense) => rules[tense]).length;

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((it) => !it)}
        aria-expanded={open}
        className="bg-bg border-ink rounded-pill flex cursor-pointer items-center gap-2 border-[1.5px] px-4 py-2 text-[13px] font-bold"
      >
        <LayersIcon />
        Підсвітка: {active.label}{' '}
        <span className="text-label font-semibold">
          · {on} з {active.tenses.length} правил
        </span>
        <span aria-hidden>▾</span>
      </button>

      {open ? (
        <div className="bg-panel border-line rounded-panel absolute top-[calc(100%+8px)] right-0 z-30 w-[340px] border p-2 shadow-[0_24px_60px_rgb(38_36_32_/_0.22)]">
          <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
            <span className="text-ink-3 font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
              Шари підсвітки
            </span>
            <span className="text-label text-[11.5px]">радимо 1 тему за раз</span>
          </div>

          <div className="bg-bg mx-1.5 mb-1.5 rounded-[10px] p-1">
            <div className="flex items-center gap-2.5 px-2.5 py-[9px]">
              <span
                className="bg-acc flex h-[18px] w-[18px] items-center justify-center rounded-[5px] text-[11px] font-extrabold text-white"
                aria-hidden
              >
                ✓
              </span>
              <span className="flex-1 text-[13.5px] font-extrabold">{active.label}</span>
              <span className="text-label text-[11.5px]">активна тема</span>
            </div>

            <div className="flex flex-col gap-0.5 pr-2.5 pb-2 pl-[38px]">
              {active.tenses.map((tense) => {
                const enabled = rules[tense];
                return (
                  <button
                    key={tense}
                    type="button"
                    onClick={() => onToggleRule(tense)}
                    aria-pressed={enabled}
                    className={`flex cursor-pointer items-center gap-[9px] text-left text-[12.5px] font-semibold ${
                      enabled ? '' : 'text-label'
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 flex-none rounded-[4px] ${
                        enabled
                          ? SWATCH[TENSE_ASPECT[tense]]
                          : 'border-lex-line box-border border-[1.5px]'
                      }`}
                      aria-hidden
                    />
                    {TENSE_LABELS[tense]}
                    <span className={`ml-auto ${enabled ? 'text-label' : ''}`}>
                      {pageCount(tense)} · {enabled ? 'увімк' : 'вимк'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {LAYER_TOPICS.filter((item) => item.id !== topic).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onPickTopic(item.id);
                setOpen(false);
              }}
              className="text-ink-2 hover:bg-hover flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-4 py-[9px] text-left"
            >
              <span
                className="border-lex-line box-border h-[18px] w-[18px] flex-none rounded-[5px] border-[1.5px]"
                aria-hidden
              />
              <span className="flex-1 text-[13.5px] font-semibold">{item.label}</span>
              <span className="text-label text-[11.5px]">
                {item.tenses.reduce((sum, tense) => sum + textCount(tense), 0)} збігів
              </span>
            </button>
          ))}

          <p className="bg-tint text-green-tx m-1.5 rounded-[10px] px-3 py-2.5 text-[12px] leading-[1.5]">
            Кольори завжди належать активній темі — дві теми одночасно не підсвічуються, щоб
            значення кольору лишалось однозначним.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Стос шарів — той самий знак, що й у карті шарів: пластини одна над одною. */
function LayersIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 22 8.5 12 15 2 8.5" />
      <polyline points="2 15.5 12 22 22 15.5" />
    </svg>
  );
}

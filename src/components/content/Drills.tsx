'use client';

import { useState } from 'react';

import { H3 } from '@/components/content/blocks';
import type { DrillBlock } from '@/types/content';

/**
 * Блок вправ. Кнопка «Відповідь» розкриває правильний варіант і пояснення
 * й перетворюється на «Сховати»; кнопка над блоком керує всіма відразу.
 */
export function Drills({ block, heading = true }: { block: DrillBlock; heading?: boolean }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());

  const allOpen = open.size === block.items.length;

  const toggleOne = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const toggleAll = () =>
    setOpen(allOpen ? new Set() : new Set(block.items.map((_, index) => index)));

  return (
    <div>
      {heading ? <H3 id={block.id}>{block.title}</H3> : null}
      {block.lede ? <p className="text-ink-2 mt-0 mb-3 text-[15.5px]">{block.lede}</p> : null}

      <button
        type="button"
        onClick={toggleAll}
        className="border-line bg-surface text-ink-2 hover:border-line-strong mt-1.5 mb-0.5 cursor-pointer rounded-[9px] border-[1.5px] px-3.5 py-[7px] text-[13.5px] font-bold"
      >
        {allOpen ? 'Сховати всі відповіді' : 'Показати всі відповіді'}
      </button>

      {block.items.map((item, index) => {
        const isOpen = open.has(index);
        return (
          <div
            key={index}
            className="bg-surface border-line shadow-card my-2.5 rounded-xl border px-[18px] py-3.5"
          >
            <div className="font-semibold">
              <span className="text-ink-3 mr-1.5 font-extrabold">{index + 1}.</span>
              {item.q}
            </div>

            <button
              type="button"
              onClick={() => toggleOne(index)}
              className="border-line bg-surface-3 text-ink-2 hover:border-line-strong mt-2.5 cursor-pointer rounded-lg border-[1.5px] px-3 py-[5px] text-[13.5px] font-bold"
            >
              {isOpen ? 'Сховати' : 'Відповідь'}
            </button>

            {isOpen ? (
              <div className="bg-surface-3 border-ok mt-3 rounded-r-[9px] border-l-[3px] px-3.5 py-[11px] text-[15px]">
                <b>{item.a}</b>
                {item.hint ? (
                  <span className="text-ink-2 mt-1.5 block text-[14px]">{item.hint}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

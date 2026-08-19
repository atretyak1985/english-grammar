'use client';

import { useEffect, useState } from 'react';

import { FileSource } from '@/components/analyzer/FileSource';

const PILL =
  'cursor-pointer rounded-full border px-[11px] py-[5px] text-[12px] leading-[normal] font-bold';
const PILL_ON = 'border-ps bg-ps-bg text-ps-dk';
const PILL_OFF = 'border-line text-ink-3 bg-transparent';

type Source = 'text' | 'file';

/**
 * Вибір джерела в модалці, а не рядком над текстом: поле вставки потрібне
 * кілька секунд, а місце забирало постійно.
 *
 * Текст застосовується кнопкою, а не з кожним натисканням клавіші — на книжці
 * це різниця між миттєвим набором і перерахунком усього документа щоразу.
 */
export function SourceDialog({
  text,
  onApply,
  onClose,
  onSave,
  saved,
}: {
  text: string;
  onApply: (text: string, title?: string) => void;
  onClose: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const [source, setSource] = useState<Source>('text');
  const [draft, setDraft] = useState(text);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Джерело тексту"
        className="bg-surface border-line rounded-card shadow-lift relative flex max-h-full w-full max-w-[720px] flex-col overflow-hidden border"
      >
        <div className="border-line bg-surface-2 flex flex-wrap items-center gap-2 border-b px-4 py-[11px]">
          <div className="text-ink-2 mr-1 text-[12.5px] font-extrabold tracking-[0.4px]">
            ДЖЕРЕЛО
          </div>
          {(['text', 'file'] as Source[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSource(option)}
              className={`${PILL} ${source === option ? PILL_ON : PILL_OFF}`}
            >
              {option === 'text' ? 'Текст' : 'PDF / фото'}
            </button>
          ))}
          <button type="button" onClick={onSave} className={`${PILL} ${PILL_ON}`}>
            {saved ? 'Збережено ✓' : 'Зберегти в бібліотеку'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className={`${PILL} ${PILL_OFF} ml-auto`}
          >
            ✕ Esc
          </button>
        </div>

        {source === 'text' ? (
          <>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={12}
              autoFocus
              className="bg-surface text-ink min-h-0 flex-1 resize-none border-0 p-4 text-[15px] leading-[1.7] outline-none"
              placeholder="Вставте англійський текст…"
            />
            <div className="border-line bg-surface-2 flex items-center justify-between gap-3 border-t px-4 py-3">
              <div className="text-ink-3 text-[12.5px]">
                {draft.trim() ? `${draft.trim().split(/\s+/).length} слів` : 'Порожньо'}
              </div>
              <button
                type="button"
                onClick={() => {
                  onApply(draft);
                  onClose();
                }}
                className="bg-ps rounded-btn cursor-pointer border border-transparent px-[13px] py-[7px] text-[12.5px] leading-[normal] font-bold text-white hover:brightness-[1.08]"
              >
                Аналізувати
              </button>
            </div>
          </>
        ) : (
          <FileSource
            onText={(extracted, title) => {
              onApply(extracted, title);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

import { MAX_UPLOAD_BYTES, type Extraction } from '@/lib/extract/types';

/**
 * Другий спосіб дати текст аналізатору: файл замість вставки (CONCEPT 4.3).
 * Текстові файли читаються тут же, PDF і фото йдуть на /api/extract —
 * текстовий шар PDF або OCR.
 */
type Status =
  | { phase: 'idle' }
  | { phase: 'working'; name: string; ocr: boolean }
  | { phase: 'done'; name: string; detail: string; truncated: boolean }
  | { phase: 'error'; name: string; message: string };

const MEGABYTES = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);

export function FileSource({ onText }: { onText: (text: string, title: string) => void }) {
  const [status, setStatus] = useState<Status>({ phase: 'idle' });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus({ phase: 'error', name: file.name, message: `Файл більший за ${MEGABYTES} МБ.` });
      return;
    }

    // Текстовий файл нічого розпізнавати не треба — читаємо в браузері.
    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      const text = await file.text();
      onText(text, file.name);
      setStatus({ phase: 'done', name: file.name, detail: 'текстовий файл', truncated: false });
      return;
    }

    const ocr = file.type.startsWith('image/');
    setStatus({ phase: 'working', name: file.name, ocr });

    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/extract', { method: 'POST', body });
      const payload: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload !== null && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Не вдалося розпізнати файл.';
        setStatus({ phase: 'error', name: file.name, message });
        return;
      }

      const extraction = payload as Extraction;
      onText(extraction.text, file.name);
      setStatus({
        phase: 'done',
        name: file.name,
        detail: extraction.detail,
        truncated: extraction.truncated,
      });
    } catch {
      setStatus({
        phase: 'error',
        name: file.name,
        message: 'Сервер не відповів. Перевірте зʼєднання і спробуйте ще раз.',
      });
    }
  };

  return (
    <div className="p-[22px]">
      <label className="border-line hover:border-ps flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-5 py-[38px] text-center">
        <div className="text-[15px] font-bold">Перетягніть файл або натисніть</div>
        <div className="text-ink-3 text-[13px]">
          PDF, PNG, JPG, TXT — текст із зображень розпізнається
        </div>
        <input
          type="file"
          accept=".txt,.md,.pdf,image/*"
          disabled={status.phase === 'working'}
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="hidden"
        />
      </label>

      <div className="text-ink-3 mt-3 text-[13px]">
        {status.phase === 'idle' ? (
          <>
            PDF із текстовим шаром читається одразу. Фото сторінки проходить через розпізнавання
            (OCR) — англійський текст, до {MEGABYTES} МБ.
          </>
        ) : null}

        {status.phase === 'working' ? (
          <span className="text-ink-2">
            {status.ocr ? 'Розпізнаю фото' : 'Читаю PDF'}: <b>{status.name}</b>…{' '}
            {status.ocr ? 'це може зайняти кілька секунд.' : ''}
          </span>
        ) : null}

        {status.phase === 'done' ? (
          <>
            <span className="text-ps font-bold">✓</span> <b>{status.name}</b> — {status.detail}.
            {status.truncated ? ' Текст обрізано: аналізується початок файлу.' : ''}
          </>
        ) : null}

        {status.phase === 'error' ? (
          <span className="text-pp">
            <b>{status.name}</b>: {status.message}
          </span>
        ) : null}
      </div>
    </div>
  );
}

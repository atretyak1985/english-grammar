'use client';

import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { MAX_UPLOAD_BYTES, type Extraction } from '@/lib/extract/types';
import { useReading } from '@/lib/state/reading';

/**
 * Сторінка «свій текст»: сюди веде «+ Свій текст або файл» з полиці читання.
 * Це окрема сторінка, а не модалка над читалкою: людина ще нічого не читає,
 * і показувати за формою демо-текст, якого вона не просила, нема чого.
 *
 * Текст застосовується кнопкою, а не з кожним натисканням клавіші — на книжці
 * це різниця між миттєвим набором і перерахунком усього документа щоразу.
 * Після застосування — перехід у читалку `/analyze`: текст уже лежить у
 * сховищі читання (`useReading`), тому перехід його не губить.
 */

type Source = 'paste' | 'file';

/** Успішного стану немає: щойно текст готовий — ми вже в читалці. */
type FileStatus =
  | { phase: 'idle' }
  | { phase: 'working'; name: string; ocr: boolean }
  | { phase: 'error'; name: string; message: string };

const MEGABYTES = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);

const ACTION_PRIMARY =
  'bg-acc hover:bg-acc2 shadow-acc cursor-pointer rounded-[11px] border-0 px-6 py-3 text-[14.5px] leading-[normal] font-bold text-white transition-colors duration-150 ease-out';
const ACTION_GHOST =
  'bg-panel border-line-ctrl text-ink hover:border-acc cursor-pointer rounded-[11px] border-[1.5px] px-6 py-3 text-[14.5px] leading-[normal] font-bold transition-colors duration-150 ease-out';

export function NewTextScreen() {
  const router = useRouter();
  const { openLoose, openDemo } = useReading();

  const [source, setSource] = useState<Source>('paste');
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<FileStatus>({ phase: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const start = (text: string, title: string | null) => {
    openLoose(text, title);
    router.push('/analyze');
  };

  const tryDemo = () => {
    openDemo();
    router.push('/analyze');
  };

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  /** Текстові файли читаються в браузері, PDF і фото йдуть на /api/extract. */
  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus({ phase: 'error', name: file.name, message: `Файл більший за ${MEGABYTES} МБ.` });
      return;
    }

    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      start(await file.text(), file.name);
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

      start((payload as Extraction).text, file.name);
    } catch {
      setStatus({
        phase: 'error',
        name: file.name,
        message: 'Сервер не відповів. Перевірте зʼєднання і спробуйте ще раз.',
      });
    }
  };

  return (
    <div className="mx-auto box-border w-full max-w-[1160px] px-10 pt-14 pb-12 leading-[normal]">
      <h1 className="font-serif m-0 text-center text-[40px] font-extrabold tracking-[-0.8px] [text-wrap:balance]">
        Свій текст — з підсвіткою за секунди
      </h1>
      <p className="text-ink-2 mx-auto mt-3 mb-8 max-w-[34rem] text-center text-[15.5px] leading-[1.6]">
        Стаття, лист, розділ книжки. Підсвітка часів працює одразу — без реєстрації.
      </p>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <SourceTab
          active={source === 'paste'}
          onClick={() => setSource('paste')}
          label="Вставити текст"
        />
        <SourceTab
          active={source === 'file'}
          onClick={() => setSource('file')}
          label="Файл або фото"
        />
      </div>

      {source === 'paste' ? (
        <div className="bg-card border-line rounded-2xl border">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={11}
            autoFocus
            placeholder="Вставте англійський текст…"
            className="text-ink block w-full resize-none border-0 bg-transparent p-6 text-[15.5px] leading-[1.7] outline-none"
          />
          <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <div className="text-ink-3 text-[13px]">
              {wordCount > 0 ? `${wordCount} слів` : 'Порожньо'}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={tryDemo} className={ACTION_GHOST}>
                Спробувати на демо-тексті
              </button>
              <button
                type="button"
                onClick={() => start(draft, null)}
                disabled={wordCount === 0}
                className={`${ACTION_PRIMARY} disabled:cursor-default disabled:opacity-40`}
              >
                Аналізувати
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/*
            Дроп-зона сама відкриває вибір файлу, тому «Обрати файл» усередині —
            span у ролі кнопки, а не button: клік і так ловить зона. Справжня
            кнопка тут лише в демо, і вона гасить спливання, щоб не відкривати
            діалог вибору.
          */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Обрати файл"
            onClick={() => fileInput.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') fileInput.current?.click();
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              void handleFile(event.dataTransfer.files?.[0]);
            }}
            className="bg-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed px-6 py-14 text-center"
            style={{ borderColor: dragOver ? 'var(--acc)' : '#b8c9c2' }}
          >
            <div className="bg-tint flex h-14 w-14 items-center justify-center rounded-[14px]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--acc)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 15V4" />
                <path d="M7.5 8.5 12 4l4.5 4.5" />
                <path d="M4.5 15.5v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" />
              </svg>
            </div>
            <div className="text-[17px] font-bold">
              Перетягніть файл сюди або натисніть, щоб обрати
            </div>
            <div className="text-ink-3 text-[13.5px]">
              PDF · TXT · фото сторінки (OCR) · до {MEGABYTES} МБ
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2.5">
              <span className={ACTION_PRIMARY}>Обрати файл</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  tryDemo();
                }}
                className={ACTION_GHOST}
              >
                Спробувати на демо-тексті
              </button>
            </div>
          </div>

          {/* Інпут — сусід зони, а не дитина: клік зони викликає його
              програмно, і зсередини він спливав би в ту саму зону по колу. */}
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.md,.pdf,image/*"
            disabled={status.phase === 'working'}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            className="hidden"
          />

          {status.phase !== 'idle' ? (
            <div className="text-ink-3 mt-3 text-center text-[13px]">
              {status.phase === 'working' ? (
                <span className="text-ink-2">
                  {status.ocr ? 'Розпізнаю фото' : 'Читаю PDF'}: <b>{status.name}</b>…{' '}
                  {status.ocr ? 'це може зайняти кілька секунд.' : ''}
                </span>
              ) : (
                <span className="text-pp">
                  <b>{status.name}</b>: {status.message}
                </span>
              )}
            </div>
          ) : null}
        </>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <StepCard
          step="1"
          title="Одразу:"
          body="локальна підсвітка часів і збір незнайомих слів — працює в браузері, безкоштовно."
        />
        <StepCard
          step="2"
          title="Після входу:"
          body="уточнення моделлю, збереження текстів у бібліотеку і синхронізація словника."
        />
      </div>
    </div>
  );
}

function SourceTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-pill cursor-pointer px-[22px] py-[11px] text-[14px] font-bold transition-colors duration-150 ease-out ${
        active
          ? 'bg-deep text-white'
          : 'bg-card border-line-ctrl text-ink-2 hover:border-acc hover:text-green-tx border-[1.5px]'
      }`}
    >
      {label}
    </button>
  );
}

function StepCard({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="bg-panel border-line rounded-tile flex items-start gap-3 border px-5 py-[18px]">
      <span className="bg-tint text-green-tx flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-extrabold">
        {step}
      </span>
      <p className="text-ink-2 m-0 text-[13.5px] leading-[1.6]">
        <b className="text-ink">{title}</b> {body}
      </p>
    </div>
  );
}

import os from 'node:os';

import { createWorker } from 'tesseract.js';

import { normalizeExtractedText, truncate, type Extraction } from '@/lib/extract/types';

/**
 * OCR фотографії сторінки. Модель англійська — застосунок аналізує англійський
 * текст, тому інші мови тут лише зашкодили б розпізнаванню.
 *
 * Мовні дані (~4 МБ) беруться з TESSERACT_LANG_PATH, якщо їх поклали в образ,
 * інакше тесеракт качає їх один раз і кешує в тимчасовій теці — на Cloud Run
 * тільки вона доступна для запису.
 */
const LANG = 'eng';

/** Розпізнавання завантажує ядро в пам'ять; більше однієї задачі на процес не тримаємо. */
let busy = false;

export class OcrBusyError extends Error {
  constructor() {
    super('ocr-busy');
  }
}

export class OcrEmptyError extends Error {
  constructor() {
    super('ocr-empty');
  }
}

export async function extractImage(bytes: Uint8Array): Promise<Extraction> {
  if (busy) throw new OcrBusyError();
  busy = true;

  const worker = await createWorker(LANG, undefined, {
    ...(process.env.TESSERACT_LANG_PATH ? { langPath: process.env.TESSERACT_LANG_PATH } : {}),
    cachePath: os.tmpdir(),
  });

  try {
    const { data } = await worker.recognize(Buffer.from(bytes));
    const normalized = normalizeExtractedText(data.text);
    if (normalized.replace(/\s/g, '').length < 20) throw new OcrEmptyError();

    const { text, truncated } = truncate(normalized);
    return {
      kind: 'image',
      text,
      detail: `впевненість ${Math.round(data.confidence)}%`,
      truncated,
    };
  } finally {
    await worker.terminate();
    busy = false;
  }
}

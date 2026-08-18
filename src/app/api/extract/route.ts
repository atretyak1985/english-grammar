import { NextResponse } from 'next/server';

import { NoTextLayerError, extractPdf } from '@/lib/extract/pdf';
import { OcrBusyError, OcrEmptyError, extractImage } from '@/lib/extract/ocr';
import { MAX_UPLOAD_BYTES, normalizeExtractedText, truncate } from '@/lib/extract/types';

/**
 * Витягування тексту з файлу: текстовий шар PDF або OCR фотографії сторінки
 * (CONCEPT 9, пункт 1). Робиться на сервері, щоб не тягнути в браузер
 * кілька мегабайтів wasm і мовних даних кожному відвідувачу.
 *
 * Вхід не потрібен: аналізатор працює анонімно, як і решта застосунку.
 */
export const runtime = 'nodejs';

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get('file');
    if (value instanceof File) file = value;
  } catch {
    return fail('Не вдалося прочитати файл із запиту.', 400);
  }

  if (!file) return fail('Файл не надіслано.', 400);
  if (file.size === 0) return fail('Файл порожній.', 400);
  if (file.size > MAX_UPLOAD_BYTES) {
    return fail(`Файл більший за ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} МБ.`, 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = file.type;

  try {
    if (type === 'application/pdf') {
      return NextResponse.json(await extractPdf(bytes));
    }

    if (type.startsWith('image/')) {
      return NextResponse.json(await extractImage(bytes));
    }

    if (type.startsWith('text/')) {
      const { text, truncated } = truncate(normalizeExtractedText(new TextDecoder().decode(bytes)));
      return NextResponse.json({ kind: 'text', text, detail: 'текстовий файл', truncated });
    }

    return fail('Підтримуються PDF, зображення і текстові файли.', 415);
  } catch (error) {
    if (error instanceof NoTextLayerError) {
      return fail(
        'У цьому PDF немає текстового шару — це скан. Сфотографуйте сторінку і завантажте як зображення: фото проходить через розпізнавання.',
        422,
      );
    }
    if (error instanceof OcrEmptyError) {
      return fail(
        'На знімку не знайдено тексту. Допомагає різкіше фото, рівне світло і сторінка на весь кадр.',
        422,
      );
    }
    if (error instanceof OcrBusyError) {
      return fail('Зараз розпізнається інший файл. Спробуйте за кілька секунд.', 429);
    }

    console.error('extract failed', error);
    return fail('Не вдалося розпізнати файл.', 500);
  }
}

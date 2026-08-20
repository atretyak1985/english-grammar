import { extractText, getDocumentProxy } from 'unpdf';

import { normalizeExtractedText, truncate, type Extraction } from '@/lib/extract/types';

/**
 * Текстовий шар PDF. Скан без текстового шару тут не розпізнати — про це
 * потрібно сказати прямо, інакше користувач бачить порожнє поле і не розуміє
 * чому (CONCEPT 9, пункт 1).
 */
export class NoTextLayerError extends Error {
  constructor() {
    super('no-text-layer');
  }
}

export async function extractPdf(bytes: Uint8Array): Promise<Extraction> {
  const pdf = await getDocumentProxy(bytes);
  const { text: raw, totalPages } = await extractText(pdf, { mergePages: true });

  const normalized = normalizeExtractedText(raw);
  // Кілька випадкових символів на сторінку — це не текстовий шар, а сміття зі скану.
  if (normalized.replace(/\s/g, '').length < totalPages * 20) throw new NoTextLayerError();

  const { text, truncated } = truncate(normalized);
  return {
    kind: 'pdf',
    text,
    detail: totalPages === 1 ? '1 сторінка' : `${totalPages} стор.`,
    truncated,
  };
}

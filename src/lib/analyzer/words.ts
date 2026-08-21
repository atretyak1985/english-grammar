import type { AnalyzedToken } from './tenses';

/**
 * Слова тексту з їхніми номерами в масиві токенів. Пробільні токени сюди не
 * потрапляють: нумерувати їх означало б віддати моделі вдвічі більший список
 * заради індексів, які вона ніколи не назве.
 *
 * Винесено з `review.ts`, бо та сама відповідність «порядковий номер слова →
 * індекс токена» потрібна і бібліотеці (`lib/library/artifact.ts`): модель і
 * оператор адресують слова номерами з 1 по всьому тексту, а підсвітка працює з
 * індексами масиву токенів. Дві копії цієї функції рано чи пізно розійшлися б —
 * і розходження тут означало б зсув розмітки на весь текст.
 */
export function wordTokens(tokens: AnalyzedToken[]): { index: number; raw: string }[] {
  const out: { index: number; raw: string }[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token?.word) out.push({ index: i, raw: token.raw.trim() });
  }
  return out;
}

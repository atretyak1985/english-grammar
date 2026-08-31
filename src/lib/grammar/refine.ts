import { chunkText, chunksOf } from '@/lib/analyzer/chunks';
import { review } from '@/lib/analyzer/review';
import { tokenize } from '@/lib/analyzer/tenses';

import type { GrammarMatch } from './index';

/**
 * Уточнення моделлю ЛИШЕ хитких збігів двигуна (`uncertain: true`): «'d» — це
 * had чи would, «I am going to work» — рух чи майбутнє. Певні збіги модель не
 * бачить і переписати не може — двигун для них джерело істини, а рахунок за
 * модель росте з кожним зайвим шматком.
 *
 * Це ОДНА логіка на два входи: `scripts/import-book.mts --review` і ручку
 * розбору (фаза 3). Живе окремо від `index.ts`, бо тягне `review` →
 * `lib/claude`, а сам двигун мережі не потребує і потрапляє в граф імпортів
 * засіву, де Anthropic заборонений.
 *
 * ТІЛЬКИ ДЛЯ СЕРВЕРА — з тих самих причин, що й `index.ts`.
 */

export interface Refinement {
  /** Ті самі збіги, відсортовані за `from`: певні — незмінні, хиткі — уточнені. */
  matches: GrammarMatch[];
  /** Скільки хитких збігів переглянуто моделлю. */
  checked: number;
  /** Модель підтвердила час двигуна. */
  confirmed: number;
  /** Модель назвала інший час — межі лишаються двигуновими. */
  retensed: number;
  /** Модель не бачить тут конструкції — збіг прибрано. */
  dropped: number;
  /** null — модель недоступна (немає ключа) або жоден шматок не потребував уточнення. */
  usage: { input: number; output: number } | null;
}

function passThrough(matches: readonly GrammarMatch[]): Refinement {
  return { matches: [...matches], checked: 0, confirmed: 0, retensed: 0, dropped: 0, usage: null };
}

/**
 * Проганяє через модель лише шматки, у яких є хоч один хиткий збіг, і зводить
 * відповідь назад у координати документа (`chunk.start` — той самий зсув, що
 * й в імпорті книжки). Шматок, на якому модель не відповіла, лишається як є:
 * груба розмітка двигуна краща за діру посеред книжки.
 */
export async function refineUncertain(
  text: string,
  matches: readonly GrammarMatch[],
  log: (line: string) => void = () => {},
): Promise<Refinement> {
  const uncertain = matches.filter((match) => match.uncertain);
  if (uncertain.length === 0) return passThrough(matches);

  const tokens = tokenize(text);
  const chunks = chunksOf(tokens).filter((chunk) =>
    uncertain.some((match) => match.from >= chunk.start && match.to <= chunk.end),
  );

  const result = passThrough(matches);
  let reviewedChunks = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  const refined = new Map<GrammarMatch, GrammarMatch | null>();

  for (const [index, chunk] of chunks.entries()) {
    const reviewed = await review(chunkText(tokens, chunk));
    if (reviewed === null) {
      log(`шматок ${index + 1}/${chunks.length}: модель недоступна — хиткі збіги лишаються як є`);
      continue;
    }

    reviewedChunks += 1;
    inputTokens += reviewed.usage.input;
    outputTokens += reviewed.usage.output;

    const inChunk = uncertain.filter((match) => match.from >= chunk.start && match.to <= chunk.end);
    for (const match of inChunk) {
      const verdict = reviewed.matches.find(
        (candidate) =>
          candidate.from + chunk.start <= match.to && match.from <= candidate.to + chunk.start,
      );

      result.checked += 1;
      if (verdict === undefined) {
        // Модель не бачить тут конструкції — двигун сумнівався недарма.
        refined.set(match, null);
        result.dropped += 1;
      } else if (verdict.tense === match.tense) {
        refined.set(match, { ...match });
        result.confirmed += 1;
      } else {
        // Час — від моделі, межі — від двигуна: координати документа звірені
        // з `chunksOf`/`wordTokens`, і розширювати їх відповіддю моделі означало б
        // ризикнути перетином із сусіднім певним збігом.
        refined.set(match, { ...match, tense: verdict.tense });
        result.retensed += 1;
      }
    }
    log(
      `шматок ${index + 1}/${chunks.length}: ${inChunk.length} хитких, ` +
        `${reviewed.usage.input} вх. / ${reviewed.usage.output} вих. токенів`,
    );
  }

  result.matches = matches
    .map((match) => (refined.has(match) ? refined.get(match) : match))
    .filter((match): match is GrammarMatch => match !== null && match !== undefined)
    .sort((a, b) => a.from - b.from);
  result.usage = reviewedChunks > 0 ? { input: inputTokens, output: outputTokens } : null;
  return result;
}

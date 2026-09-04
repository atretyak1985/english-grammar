import Image from 'next/image';

/**
 * Порожнє місце під ілюстрацію — доти, доки ілюстрації немає.
 *
 * Відтворює вигляд `<image-slot>` із макета: заливка сірим на 8%
 * прозорості, пунктирна рамка 1.5px і підпис із описом майбутньої
 * картинки. Значення взяті з `image-slot.js`, а не з таблиці токенів:
 * компонент живе в shadow DOM, тому жоден замір computed styles його
 * не бачить, і звірити його можна тільки з кодом самого макета.
 *
 * Заливка й рамка навмисно на `currentColor` та прозорості, а не
 * власним кольором: слот однаково читається і на паперовому тлі, і на
 * чорнильному, і в темній темі.
 *
 * Готова ілюстрація підставляється одним пропом `image` — усе, що
 * лишиться зробити на кожен слот, це дописати шлях.
 */
export function ImageSlot({
  caption,
  image,
  alt,
  sizes = '100vw',
}: {
  caption: string;
  image?: string;
  /**
   * Опис для екранного диктора. Окремий від `caption`, бо той — технічне
   * завдання ілюстратору («чорнило на папері, фіолетовий акцент»), і
   * читати його вголос замість картинки означає переказувати бриф.
   * Без нього падаємо на caption: краще бриф, ніж порожній alt.
   */
  alt?: string;
  /** Підказка next/image, скільки місця слот займе — своя на кожен екран */
  sizes?: string;
}) {
  return (
    <div className="rounded-tile-lg relative h-full overflow-hidden bg-[rgba(127,127,127,0.08)]">
      {image ? (
        <Image src={image} alt={alt ?? caption} fill sizes={sizes} className="object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center text-[13px] leading-[1.3] [font-family:system-ui,-apple-system,sans-serif]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-45"
              aria-hidden
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <div className="max-w-[90%] font-medium tracking-[0.01em] opacity-75">{caption}</div>
          </div>
          <div
            className="rounded-tile-lg pointer-events-none absolute inset-0 border-[1.5px] border-dashed border-current opacity-35"
            aria-hidden
          />
        </>
      )}
    </div>
  );
}

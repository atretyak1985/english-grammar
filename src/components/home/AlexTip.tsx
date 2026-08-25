import Image from 'next/image';

/**
 * Підказка Alex про статуси слів. Це правило застосунку, а не новина, тому
 * текст сталий: він пояснює, що робить клік по слову в тексті, і не залежить
 * від жодного стану.
 */
export function AlexTip() {
  return (
    <div className="bg-green-bg border-green rounded-note mt-4 flex items-center gap-3.5 border-2 px-[18px] py-3">
      <Image
        src="/alex-avatar.png"
        alt="Alex"
        width={200}
        height={200}
        className="border-green h-11 w-11 flex-none rounded-full border-2 object-cover"
        style={{ animation: 'gl-bob 4s ease-in-out infinite' }}
      />
      <p className="text-green-tx m-0 text-[13px] font-bold">
        «Знаю» прибирає слово зі списку — щоразу +2 XP, «вчу» кладе слово в словник і тренування.
        Клікайте по словах прямо в тексті!
      </p>
    </div>
  );
}

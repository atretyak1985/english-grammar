import Link from 'next/link';

/**
 * «Пастка для українців»: одна помилка, яку робить майже кожен, і
 * прямий вхід у розділ, що її розбирає.
 *
 * Темна поверхня тут не інверсія теми, а чорнило на папері: картка
 * мусить вибиватися з двох білих сусідок, бо це єдиний блок головної,
 * який продає не інструмент, а знання. Тому вона однакова в обох темах.
 *
 * Тривалості розділу («· 4 хв» у макеті) в даних немає, тому підпис її
 * не називає — на відміну від самої теми, яка справжня й веде в розділ.
 */
export function TrapCard() {
  return (
    <Link
      href="/topics/present-tenses/perfect-vs-past"
      className="bg-deep text-deep-ink rounded-tile block px-6 py-5"
    >
      <div className="text-yellow font-mono text-[10.5px] font-bold tracking-[1.2px] uppercase">
        Пастка для українців
      </div>
      <div className="font-serif mt-2.5 text-[15.5px] leading-[1.45] font-bold">
        «I have seen him yesterday» — чому так не можна?
      </div>
      <div className="text-deep-ink-2 mt-1.5 text-[12.5px]">Present Perfect проти Past Simple</div>
    </Link>
  );
}

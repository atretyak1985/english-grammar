import Link from 'next/link';

import { TENSE_HIGHLIGHT, type Aspect, type TenseKey, type TenseTime } from '@/types/content';

/**
 * Легенда підсвітки: матриця 3 × 3, у якій кожна клітинка намальована ТИМИ
 * САМИМИ класами, якими аналізатор фарбує справжній текст. Саме тому вона
 * імпортує `TENSE_HIGHLIGHT`, а не повторює його: легенда, яка розійшлася з
 * інструментом, шкідливіша за відсутню — вона вчить неправді впевненим тоном.
 *
 * Одне дієслово на всі девʼять клітинок (`ship`) — навмисно. Матриця має
 * читатися як система, а різні дієслова в клітинках змушували б читача щоразу
 * заново розбирати лексику замість форми.
 */

const ROWS: { time: TenseTime; label: string; note: string; keys: TenseKey[] }[] = [
  {
    time: 'past',
    label: 'Минулий',
    note: 'суцільна лінія',
    keys: ['ps', 'pc', 'pp'],
  },
  {
    time: 'present',
    label: 'Теперішній',
    note: 'штрихова лінія',
    keys: ['prs', 'prc', 'prp'],
  },
  {
    time: 'future',
    label: 'Майбутній',
    note: 'подвійна лінія',
    keys: ['fs', 'fc', 'fp'],
  },
];

const FORMS: Record<TenseKey, string> = {
  ps: 'shipped',
  pc: 'was shipping',
  pp: 'had shipped',
  prs: 'ships',
  prc: 'is shipping',
  prp: 'has shipped',
  fs: 'will ship',
  fc: 'will be shipping',
  fp: 'will have shipped',
};

const COLUMNS: { aspect: Aspect; label: string; colour: string }[] = [
  { aspect: 'simple', label: 'Simple', colour: 'text-ps' },
  { aspect: 'continuous', label: 'Continuous', colour: 'text-pc' },
  { aspect: 'perfect', label: 'Perfect', colour: 'text-pp' },
];

export function HighlightLegend() {
  return (
    <div className="bg-surface border-line rounded-card shadow-card my-[18px] overflow-x-auto border p-[18px]">
      <table className="w-full border-collapse text-[14.5px]">
        <thead>
          <tr>
            <th className="w-[130px] px-2 py-2" />
            {COLUMNS.map((column) => (
              <th
                key={column.aspect}
                className={`px-2 py-2 text-left text-[12px] font-extrabold tracking-[0.8px] uppercase ${column.colour}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.time} className="border-line border-t">
              <td className="px-2 py-3 align-middle">
                <div className="text-[13.5px] font-extrabold">{row.label}</div>
                <div className="text-ink-3 text-[12px]">{row.note}</div>
              </td>
              {row.keys.map((key) => (
                <td key={key} className="px-2 py-3 align-middle">
                  <span
                    className={`${TENSE_HIGHLIGHT[key]} rounded-[5px] px-[3px] py-px font-bold`}
                  >
                    {FORMS[key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-ink-2 border-line mt-3.5 border-t pt-3.5 text-[14.5px]">
        <b>Колір — це вид, лінія — це час.</b> Синій означає «простий» у всіх трьох часах,
        помаранчевий — «тривалий», фіолетовий — «перфект». Тому Present Perfect і Past Simple —
        це фіолетовий проти синього, і різницю видно ще до того, як ви прочитали підпис.{' '}
        <Link href="/analyze" className="text-ps-dk font-bold">
          Аналіз тексту
        </Link>{' '}
        фарбує будь-який ваш текст цим самим кодом.
      </p>
    </div>
  );
}

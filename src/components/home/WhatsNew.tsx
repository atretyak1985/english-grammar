/**
 * «Що нового» — короткий перелік того, що змінилося в застосунку. Записи
 * сталі: історії релізів у застосунку немає, і вигадувати під неї джерело
 * означало б показувати дати, яких ніхто не веде.
 */
const NEWS = [
  {
    glyph: '✦',
    title: 'Сучасний дизайн',
    desc: 'Свіжий інтерфейс, краща навігація та адаптивність.',
    border: 'border-line',
    chip: 'bg-tint text-acc',
  },
  {
    glyph: '⚡',
    title: 'Швидший аналіз',
    desc: 'Локальні правила та кешування для миттєвих результатів.',
    border: 'border-pc-bg',
    chip: 'bg-pc-bg text-pc-tx',
  },
  {
    glyph: '▤',
    title: 'Детальна статистика',
    desc: 'Графіки прогресу та історія активності в кабінеті.',
    border: 'border-pp-bg',
    chip: 'bg-pp-bg text-pp-tx',
  },
  {
    glyph: '⤓',
    title: 'Імпорт файлів',
    desc: 'Завантажуйте PDF, DOCX, TXT і отримуйте аналіз.',
    border: 'border-ps-bg',
    chip: 'bg-ps-bg text-ps-tx',
  },
  {
    glyph: '♥',
    title: 'Закладки та нотатки',
    desc: 'Зберігайте правила й додавайте нотатки.',
    border: 'border-coral-bg',
    chip: 'bg-coral-bg text-coral-tx',
  },
  {
    glyph: '☾',
    title: 'Темна тема',
    desc: 'Комфортне читання у будь-який час доби.',
    border: 'border-green-bg',
    chip: 'bg-green-bg text-green-tx',
  },
];

export function WhatsNew() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
      {NEWS.map((item) => (
        <div
          key={item.title}
          className={`bg-card rounded-nav shadow-card border px-[18px] py-4 ${item.border}`}
        >
          <span
            className={`rounded-chip inline-flex h-[34px] w-[34px] items-center justify-center text-[15px] font-extrabold ${item.chip}`}
            aria-hidden
          >
            {item.glyph}
          </span>
          <div className="font-display mt-2.5 text-[14px] font-extrabold">{item.title}</div>
          <div className="text-ink-2 mt-[3px] text-[12px] font-semibold">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}

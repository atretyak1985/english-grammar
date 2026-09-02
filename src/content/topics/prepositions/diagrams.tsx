/**
 * Схеми теми «Прийменники». Кольори — на змінних теми, тому та сама схема
 * правильно виглядає і в світлій, і в темній темі.
 *
 * Колірний код тут — за КЛАСТЕРОМ, не за роллю в реченні: синій (--ps) — at,
 * помаранчевий (--pc) — on, фіолетовий (--pp) — in, кораловий (--coral) — рух,
 * жовтий (--yellow) — «памʼятай, не виводь». Це локальна домовленість цієї
 * теми, окрема від наскрізного коду часів застосунку.
 */

const TITLE = { fontSize: 14, fontWeight: 800, fontFamily: 'sans-serif' } as const;
const LABEL = { fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif', fill: 'var(--ink-3)' } as const;
const WORD = { fontSize: 16, fontWeight: 800, fontFamily: 'serif', fill: 'var(--ink)' } as const;
const CAPTION = { fontSize: 12.5, fill: 'var(--ink-3)', fontFamily: 'sans-serif' } as const;
const TEXT = { fontFamily: 'sans-serif', fontSize: 13.5, fill: 'var(--ink)' } as const;

/**
 * Головна ідея теми: один зум — точка → поверхня → обʼєм — пояснює at/in/on
 * одразу і в часі, і в місці. Три клітинки, одна форма кожна.
 */
export function ZoomScale() {
  return (
    <svg viewBox="0 0 900 300" role="img" aria-label="Зум від точки через поверхню до обʼєму: at, on, in">
      <text {...TITLE} x={450} y={28} textAnchor="middle" fill="var(--ink-2)">
        Один зум на весь прийменник: точка → поверхня → обʼєм
      </text>

      <rect x={40} y={55} width={255} height={195} rx={12} fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth={1.5} />
      <circle cx={167} cy={105} r={8} fill="var(--ps)" />
      <text {...WORD} x={167} y={148} textAnchor="middle" fill="var(--ps-dk)">at</text>
      <text {...LABEL} x={167} y={168} textAnchor="middle">точка на карті чи годиннику</text>
      <text {...CAPTION} x={167} y={196} textAnchor="middle">at 5 o&apos;clock</text>
      <text {...CAPTION} x={167} y={214} textAnchor="middle">at the door</text>
      <text {...CAPTION} x={167} y={232} textAnchor="middle">at the bus stop</text>

      <rect x={322} y={55} width={255} height={195} rx={12} fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth={1.5} />
      <rect x={382} y={98} width={135} height={16} rx={3} fill="var(--pc)" />
      <text {...WORD} x={450} y={148} textAnchor="middle" fill="var(--pc-dk)">on</text>
      <text {...LABEL} x={450} y={168} textAnchor="middle">пласка поверхня, один день</text>
      <text {...CAPTION} x={450} y={196} textAnchor="middle">on Monday</text>
      <text {...CAPTION} x={450} y={214} textAnchor="middle">on the table</text>
      <text {...CAPTION} x={450} y={232} textAnchor="middle">on the wall</text>

      <rect x={604} y={55} width={255} height={195} rx={12} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={1.5} />
      <rect x={690} y={100} width={85} height={55} fill="none" stroke="var(--pp)" strokeWidth={2} />
      <path d="M690 100 L708 86 L793 86 L775 100" fill="none" stroke="var(--pp)" strokeWidth={2} />
      <path d="M775 100 L793 86 L793 141 L775 155" fill="none" stroke="var(--pp)" strokeWidth={2} />
      <text {...WORD} x={732} y={148} textAnchor="middle" fill="var(--pp-dk)">in</text>
      <text {...LABEL} x={732} y={168} textAnchor="middle">закритий обʼєм, великий проміжок</text>
      <text {...CAPTION} x={732} y={196} textAnchor="middle">in June</text>
      <text {...CAPTION} x={732} y={214} textAnchor="middle">in the room</text>
      <text {...CAPTION} x={732} y={232} textAnchor="middle">in the box</text>

      <text {...CAPTION} x={450} y={274} textAnchor="middle" fontStyle="italic">
        Той самий зум працює і в часі (розділ 2), і в місці (розділ 3) — вчити його двічі не треба.
      </text>
    </svg>
  );
}

/** Час: at (точка на годиннику), on (один конкретний день), in (великий проміжок). */
export function TimeAtInOn() {
  return (
    <svg viewBox="0 0 900 280" role="img" aria-label="Прийменники часу: at 5 o'clock, on Monday, in June">
      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Час: та сама трійка at / on / in
      </text>

      <circle cx={165} cy={130} r={62} fill="none" stroke="var(--ps)" strokeWidth={2.5} />
      <line x1={165} y1={130} x2={165} y2={92} stroke="var(--ps)" strokeWidth={3} strokeLinecap="round" />
      <line x1={165} y1={130} x2={196} y2={130} stroke="var(--ps)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={165} cy={130} r={4} fill="var(--ps)" />
      <text {...WORD} x={165} y={218} textAnchor="middle" fill="var(--ps-dk)">at 5 o&apos;clock</text>
      <text {...CAPTION} x={165} y={240} textAnchor="middle">точна мітка на циферблаті</text>

      <rect x={330} y={80} width={240} height={100} rx={8} fill="none" stroke="var(--pc)" strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
        <rect
          key={day}
          x={330 + day * (240 / 7)}
          y={80}
          width={240 / 7}
          height={100}
          fill={day === 2 ? 'var(--pc-bg)' : 'none'}
          stroke="var(--line-strong)"
          strokeWidth={1}
        />
      ))}
      <text {...LABEL} x={450} y={72} textAnchor="middle">тиждень</text>
      <text {...WORD} x={450} y={218} textAnchor="middle" fill="var(--pc-dk)">on Monday</text>
      <text {...CAPTION} x={450} y={240} textAnchor="middle">одна клітинка з семи</text>

      <rect x={640} y={80} width={230} height={100} rx={8} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={2} />
      <text {...LABEL} x={755} y={72} textAnchor="middle">рік</text>
      <text {...TEXT} x={755} y={112} textAnchor="middle" fill="var(--pp-dk)" fontWeight={700}>
        JAN … MAY [ JUN ] JUL … DEC
      </text>
      <text {...CAPTION} x={755} y={140} textAnchor="middle">30 днів усередині одного проміжку</text>
      <text {...WORD} x={755} y={218} textAnchor="middle" fill="var(--pp-dk)">in June</text>
      <text {...CAPTION} x={755} y={240} textAnchor="middle">увесь місяць — обʼєм часу</text>

      <text {...CAPTION} x={450} y={268} textAnchor="middle" fontStyle="italic">
        Виняток памʼятати окремо: at night, at the weekend — навіть якщо «ніч» і «вихідні» звучать як проміжок.
      </text>
    </svg>
  );
}

/**
 * Тривалість і межі часу: for/since/during на одній стрілці часу,
 * і окремо — розвилка by (дедлайн, дія) проти until (продовження до межі).
 */
export function TimeDurationLine() {
  return (
    <svg viewBox="0 0 900 320" role="img" aria-label="for/since/during на стрілці часу; by — дедлайн, until — продовження">
      <text {...TITLE} x={20} y={24} fill="var(--ink-2)">
        Тривалість: since — точка старту, for — довжина, during — усередині події
      </text>

      <line x1={40} y1={90} x2={860} y2={90} stroke="var(--line-strong)" strokeWidth={2.5} markerEnd="url(#arrow-time)" />
      <defs>
        <marker id="arrow-time" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto" fill="var(--line-strong)">
          <path d="M0,0 L8,4 L0,8 z" />
        </marker>
      </defs>
      <circle cx={160} cy={90} r={6} fill="var(--ps)" />
      <text {...CAPTION} x={160} y={70} textAnchor="middle" fill="var(--ps-dk)">since 2020</text>
      <text {...CAPTION} x={160} y={112} textAnchor="middle">точка, з якої почалось</text>

      <line x1={160} y1={90} x2={560} y2={90} stroke="var(--pc)" strokeWidth={5} strokeLinecap="round" />
      <text {...CAPTION} x={360} y={70} textAnchor="middle" fill="var(--pc-dk)">for 3 years</text>
      <text {...CAPTION} x={360} y={112} textAnchor="middle">сама довжина відрізка, без дати</text>

      <rect x={620} y={72} width={160} height={36} rx={6} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={1.5} />
      <text {...CAPTION} x={700} y={95} textAnchor="middle" fill="var(--pp-dk)" fontWeight={700}>during the meeting</text>
      <text {...CAPTION} x={700} y={122} textAnchor="middle">якийсь момент усередині події</text>

      <line x1={40} y1={166} x2={860} y2={166} stroke="var(--line)" strokeWidth={1.5} />

      <text {...TITLE} x={20} y={198} fill="var(--ink-2)">
        Дедлайн проти продовження: by завершує дію, until продовжує стан
      </text>

      <path d="M60 260 L340 260" stroke="var(--ps)" strokeWidth={3} fill="none" markerEnd="url(#arrow-by)" />
      <defs>
        <marker id="arrow-by" markerWidth="12" markerHeight="12" refX="9" refY="4.5" orient="auto" fill="var(--ps)">
          <path d="M0,0 L9,4.5 L0,9 z" />
        </marker>
      </defs>
      <circle cx={340} cy={260} r={7} fill="var(--ps)" />
      <text {...TEXT} x={200} y={244} textAnchor="middle" fill="var(--ps-dk)" fontWeight={700}>Finish by Friday.</text>
      <text {...CAPTION} x={200} y={286} textAnchor="middle">одна дія — не пізніше за межу, можна й раніше</text>

      <line x1={460} y1={260} x2={740} y2={260} stroke="var(--coral)" strokeWidth={3} strokeDasharray="6 5" />
      <circle cx={740} cy={260} r={7} fill="var(--coral)" />
      <text {...TEXT} x={600} y={244} textAnchor="middle" fill="var(--coral-dk)" fontWeight={700}>Wait until Friday.</text>
      <text {...CAPTION} x={600} y={286} textAnchor="middle">стан триває без перерви аж до межі</text>
    </svg>
  );
}

/** Місце: та сама трійка at/in/on, перенесена в простір. */
export function PlaceAtInOn() {
  return (
    <svg viewBox="0 0 900 260" role="img" aria-label="Прийменники місця: at the door, in the room, on the table">
      <text {...TITLE} x={450} y={26} textAnchor="middle" fill="var(--ink-2)">
        Місце: та сама лінза, нова територія
      </text>

      <rect x={30} y={60} width={260} height={160} rx={10} fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth={1.5} />
      <circle cx={160} cy={110} r={7} fill="var(--ps)" />
      <text {...WORD} x={160} y={150} textAnchor="middle" fill="var(--ps-dk)">at the door</text>
      <text {...CAPTION} x={160} y={172} textAnchor="middle">конкретна точка входу</text>
      <text {...CAPTION} x={160} y={192} textAnchor="middle">at the bus stop / at work</text>

      <rect x={320} y={60} width={260} height={160} rx={10} fill="var(--pc-bg)" stroke="var(--pc)" strokeWidth={1.5} />
      <rect x={390} y={130} width={120} height={16} rx={3} fill="var(--pc)" />
      <text {...WORD} x={450} y={150} textAnchor="middle" fill="var(--pc-dk)">on the table</text>
      <text {...CAPTION} x={450} y={172} textAnchor="middle">лежить на видимій поверхні</text>
      <text {...CAPTION} x={450} y={192} textAnchor="middle">on the wall / on the shelf</text>

      <rect x={610} y={60} width={260} height={160} rx={10} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={1.5} />
      <rect x={700} y={100} width={80} height={55} fill="none" stroke="var(--pp)" strokeWidth={2} />
      <path d="M700 100 L717 87 L797 87 L780 100" fill="none" stroke="var(--pp)" strokeWidth={2} />
      <text {...WORD} x={740} y={172} textAnchor="middle" fill="var(--pp-dk)">in the room</text>
      <text {...CAPTION} x={740} y={194} textAnchor="middle">усередині замкненого простору</text>

      <text {...CAPTION} x={450} y={244} textAnchor="middle" fontStyle="italic">
        Пастка розділу: «on the picture» — калька з «на картинці». Англійська бачить малюнок як обʼєм: in the picture.
      </text>
    </svg>
  );
}

/**
 * Статичні просторові відносини навколо одного центрального обʼєкта —
 * столу. Компасне розташування підписів: позиція самого підпису показує
 * відносини, а не окрема стрілка на кожен випадок.
 */
export function PlaceRelations() {
  return (
    <svg viewBox="0 0 900 420" role="img" aria-label="Просторові відносини навколо стола: under, over, in front of, behind, between, next to, opposite, inside/outside">
      <text {...TITLE} x={450} y={24} textAnchor="middle" fill="var(--ink-2)">
        Решта статичного простору — усе навколо одного стола
      </text>

      <rect x={370} y={190} width={160} height={20} rx={4} fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth={1.5} />
      <line x1={385} y1={210} x2={385} y2={250} stroke="var(--line-strong)" strokeWidth={3} />
      <line x1={515} y1={210} x2={515} y2={250} stroke="var(--line-strong)" strokeWidth={3} />
      <text {...LABEL} x={450} y={183} textAnchor="middle">СТІЛ</text>

      <circle cx={450} cy={130} r={14} fill="var(--yellow-bg)" stroke="var(--yellow-dk)" strokeWidth={2} />
      <text {...CAPTION} x={450} y={100} textAnchor="middle" fontWeight={700}>above / over</text>
      <text {...CAPTION} x={450} y={155} textAnchor="middle">a lamp over the table</text>

      <rect x={430} y={280} width={40} height={26} rx={5} fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth={1.5} />
      <text {...CAPTION} x={450} y={330} textAnchor="middle" fontWeight={700}>below / under</text>
      <text {...CAPTION} x={450} y={350} textAnchor="middle">a cat under the table</text>

      <rect x={150} y={185} width={50} height={30} rx={6} fill="var(--ps-bg)" stroke="var(--ps)" strokeWidth={1.5} />
      <text {...CAPTION} x={175} y={165} textAnchor="middle" fontWeight={700} fill="var(--ps-dk)">in front of</text>
      <text {...CAPTION} x={175} y={235} textAnchor="middle">a chair facing the table</text>

      <rect x={700} y={185} width={50} height={30} rx={6} fill="var(--coral-bg)" stroke="var(--coral)" strokeWidth={1.5} />
      <text {...CAPTION} x={725} y={165} textAnchor="middle" fontWeight={700} fill="var(--coral-dk)">behind</text>
      <text {...CAPTION} x={725} y={235} textAnchor="middle">a chair behind the table</text>

      <circle cx={280} cy={200} r={8} fill="var(--pc)" />
      <circle cx={340} cy={200} r={8} fill="var(--pc)" />
      <circle cx={310} cy={200} r={5} fill="var(--pc-dk)" />
      <text {...CAPTION} x={310} y={175} textAnchor="middle" fontWeight={700} fill="var(--pc-dk)">between (2)</text>
      <text {...CAPTION} x={310} y={225} textAnchor="middle">a ball between two chairs</text>

      <text {...CAPTION} x={620} y={175} textAnchor="middle" fontWeight={700} fill="var(--pp-dk)">among (3+)</text>
      <text {...CAPTION} x={620} y={195} textAnchor="middle">a house among the trees</text>

      <rect x={30} y={300} width={60} height={40} rx={6} fill="var(--pp-bg)" stroke="var(--pp)" strokeWidth={1.5} />
      <text {...CAPTION} x={60} y={280} textAnchor="middle" fontWeight={700} fill="var(--pp-dk)">next to / beside / near</text>
      <text {...CAPTION} x={60} y={358} textAnchor="middle">a plant beside the table</text>

      <rect x={810} y={300} width={60} height={40} rx={6} fill="var(--ok-bg)" stroke="var(--ok)" strokeWidth={1.5} />
      <text {...CAPTION} x={840} y={280} textAnchor="middle" fontWeight={700} fill="var(--green-tx)">opposite</text>
      <text {...CAPTION} x={840} y={358} textAnchor="middle">a mirror opposite the table</text>

      <text {...CAPTION} x={450} y={398} textAnchor="middle" fontStyle="italic">
        inside/outside — те саме in/at, але з наголосом на межу: inside the box (усередині) vs outside the box (зовні).
      </text>
    </svg>
  );
}

/**
 * Рух і напрямок — подорож однієї стрілки крізь сім етапів:
 * into, out of, through, across, up, down, around.
 */
export function MovementMap() {
  const stop = (x: number, label: string, caption: string) => (
    <g key={label}>
      <circle cx={x} cy={140} r={8} fill="var(--coral)" />
      <text {...WORD} x={x} y={100} textAnchor="middle" fill="var(--coral-dk)" fontSize={14}>
        {label}
      </text>
      <text {...CAPTION} x={x} y={172} textAnchor="middle">
        {caption}
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 900 230" role="img" aria-label="Сім етапів руху: into, out of, through, across, up, down, around">
      <text {...TITLE} x={450} y={24} textAnchor="middle" fill="var(--ink-2)">
        Рух — та сама точка/поверхня/обʼєм, тепер зі стрілкою напрямку
      </text>
      <path
        d="M40 140 L860 140"
        stroke="var(--line-strong)"
        strokeWidth={2.5}
        strokeDasharray="1 14"
        strokeLinecap="round"
        markerEnd="url(#arrow-move)"
      />
      <defs>
        <marker id="arrow-move" markerWidth="12" markerHeight="12" refX="9" refY="4.5" orient="auto" fill="var(--line-strong)">
          <path d="M0,0 L9,4.5 L0,9 z" />
        </marker>
      </defs>
      {stop(90, 'into', 'ran into the room')}
      {stop(220, 'out of', 'walked out of the office')}
      {stop(350, 'through', 'drove through the tunnel')}
      {stop(480, 'across', 'walked across the road')}
      {stop(600, 'up', 'climbed up the tree')}
      {stop(710, 'down', 'rolled down the stairs')}
      {stop(820, 'around', 'walked around the lake')}
      <text {...CAPTION} x={450} y={206} textAnchor="middle" fontStyle="italic">
        Кожне слово — рух відносно тієї самої форми: обʼєм (into/out of), поверхня чи перешкода (through/across), вертикаль (up/down), контур (around).
      </text>
    </svg>
  );
}

/**
 * Залежні прийменники: слово «носить» свій прийменник як бейдж, а не
 * перекладає українську конструкцію. Один компонент, дві теми — verb і
 * adjective — перемикаються пропом kind.
 */
export function DependentPrepPattern({ kind }: { kind: 'verb' | 'adjective' }) {
  const verbSet = [
    { word: 'depend', prep: 'on', ex: 'It depends on the weather.' },
    { word: 'listen', prep: 'to', ex: 'I like listening to music.' },
    { word: 'wait', prep: 'for', ex: 'We are waiting for the bus.' },
    { word: 'apologise', prep: 'for', ex: 'He apologised for the delay.' },
  ];
  const adjSet = [
    { word: 'interested', prep: 'in', ex: 'She is interested in history.' },
    { word: 'afraid', prep: 'of', ex: 'He is afraid of spiders.' },
    { word: 'good', prep: 'at', ex: 'I am good at chess.' },
    { word: 'married', prep: 'to', ex: 'She is married to a doctor.' },
  ];
  const items = kind === 'verb' ? verbSet : adjSet;
  const heading = kind === 'verb' ? 'Дієслово + прийменник' : 'Прикметник + прийменник';
  const accent = kind === 'verb' ? 'var(--ps)' : 'var(--pp)';
  const accentBg = kind === 'verb' ? 'var(--ps-bg)' : 'var(--pp-bg)';
  const accentDk = kind === 'verb' ? 'var(--ps-dk)' : 'var(--pp-dk)';

  return (
    <svg viewBox="0 0 900 240" role="img" aria-label={`${heading}: слово з фіксованим прийменником-бейджем`}>
      <text {...TITLE} x={450} y={24} textAnchor="middle" fill="var(--ink-2)">
        {heading}: прийменник — це бейдж слова, не переклад
      </text>
      {items.map((item, index) => {
        const x = 40 + index * 212;
        return (
          <g key={item.word}>
            <rect x={x} y={50} width={188} height={54} rx={10} fill={accentBg} stroke={accent} strokeWidth={1.5} />
            <text {...WORD} x={x + 94} y={84} textAnchor="middle" fontSize={15}>
              {item.word}
            </text>
            <rect x={x + 130} y={38} width={54} height={26} rx={13} fill="var(--surface-2)" stroke={accent} strokeWidth={2} />
            <text
              x={x + 157}
              y={56}
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize={13}
              fontWeight={800}
              fill={accentDk}
            >
              {item.prep}
            </text>
            <text {...CAPTION} x={x + 94} y={126} textAnchor="middle" fill={accentDk}>
              {item.ex}
            </text>
          </g>
        );
      })}
      <text {...CAPTION} x={450} y={200} textAnchor="middle" fontStyle="italic">
        Українська підказка тут не працює: «залежати від» тягне за собою from, а правильно — on. Прийменник треба вивчити разом зі словом.
      </text>
    </svg>
  );
}

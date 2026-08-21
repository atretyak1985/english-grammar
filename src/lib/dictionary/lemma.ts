/**
 * Дешева лематизація без мережі й без словника: аналізатор дає словоформи
 * («deployed», «migrations»), а стаття з транскрипцією й перекладом лежить під
 * лемою. Морфологічної бібліотеки в проєкті немає й тягнути її заради цього
 * не варто, тому обрізаємо суфікси й пропонуємо кандидатів — існування слова
 * перевіряє вже Wiktionary одним додатковим запитом.
 *
 * Функція чиста: жодних побічних ефектів, увесь її сенс — порядок кандидатів.
 */

/** Кінцеві приголосні, які англійська подвоює перед -ed/-ing/-er. */
const DOUBLED = /([bdfglmnprt])\1$/;

/** Голосні потрібні, щоб не «розлематизувати» абревіатуру на кшталт «css». */
const HAS_VOWEL = /[aeiouy]/;

function undouble(stem: string): string | null {
  return DOUBLED.test(stem) ? stem.slice(0, -1) : null;
}

/**
 * Кандидати на лему в порядку спадання ймовірності. Саме слово — завжди
 * перший елемент: більшість слів у тексті вже в базовій формі, і зайвий
 * запит на вигадану лему нам не потрібен.
 */
export function lemmaCandidates(word: string): string[] {
  const base = word.toLowerCase().trim();
  const out: string[] = [];

  const add = (candidate: string | null | undefined) => {
    if (!candidate) return;
    if (candidate.length < 3) return;
    if (!HAS_VOWEL.test(candidate)) return;
    if (out.includes(candidate)) return;
    out.push(candidate);
  };

  // Саме слово додаємо без перевірок: воно вже існує, на відміну від здогадів.
  if (base.length > 0) out.push(base);
  if (base.length < 4) return out;

  const drop = (suffix: string) => base.slice(0, -suffix.length);

  // Множина й третя особа: -ies → -y (studies), -es (boxes), -s (migrations).
  if (base.endsWith('ies')) {
    add(`${drop('ies')}y`);
    add(`${drop('ies')}ie`);
  } else if (base.endsWith('sses') || base.endsWith('shes') || base.endsWith('ches') || base.endsWith('xes')) {
    add(drop('es'));
  } else if (base.endsWith('es')) {
    add(drop('s'));
    add(drop('es'));
  } else if (base.endsWith('s') && !base.endsWith('ss')) {
    add(drop('s'));
  }

  // Минулий час і дієприкметник: -ied → -y (studied), -ed (deployed),
  // подвоєна кінцева (stopped) і німе -e (hoped).
  if (base.endsWith('ied')) {
    add(`${drop('ied')}y`);
  } else if (base.endsWith('ed')) {
    const stem = drop('ed');
    add(undouble(stem));
    add(stem);
    add(`${stem}e`);
  }

  // -ing: -ying → -ie (lying), подвоєна кінцева (stopping), німе -e (making).
  if (base.endsWith('ying')) {
    add(`${drop('ying')}ie`);
    add(`${drop('ing')}`);
  } else if (base.endsWith('ing')) {
    const stem = drop('ing');
    add(undouble(stem));
    add(stem);
    add(`${stem}e`);
  }

  // Ступені порівняння: -ier → -y (easier), подвоєна кінцева (bigger),
  // німе -e (nicer).
  if (base.endsWith('iest') || base.endsWith('ier')) {
    add(`${base.slice(0, base.endsWith('iest') ? -4 : -3)}y`);
  } else if (base.endsWith('est')) {
    const stem = drop('est');
    add(undouble(stem));
    add(stem);
    add(`${stem}e`);
  } else if (base.endsWith('er')) {
    const stem = drop('er');
    add(undouble(stem));
    add(stem);
    add(`${stem}e`);
  }

  // Прислівники: -ily → -y (happily), -ly (quickly).
  if (base.endsWith('ily')) {
    add(`${drop('ily')}y`);
  } else if (base.endsWith('ly')) {
    add(drop('ly'));
  }

  return out;
}

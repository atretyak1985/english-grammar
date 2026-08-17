/* ============================================================
   СПИСОК ТЕМ САЙТУ
   ------------------------------------------------------------
   ЦЕ ЄДИНИЙ ФАЙЛ, ЯКИЙ ТРЕБА ПРАВИТИ, КОЛИ ДОДАЄТЕ НОВУ ТЕМУ.
   Головна сторінка малює картки саме з цього масиву.

   Поля:
     title  — назва теми
     desc   — короткий опис (1–2 речення)
     href   — шлях до файлу; null, якщо тема ще не написана
     level  — 'a2' | 'b1' | 'b2' | 'c1'  (впливає на колір смужки)
     tags   — маленькі підписи внизу картки
     ready  — true, якщо сторінка вже готова
   ============================================================ */

window.TOPICS = [
  {
    title: 'Минулі часи',
    desc: 'Past Simple, Past Continuous, Past Perfect (+ Perfect Continuous). Коли який вживати, як їх не плутати і чому «робив» ≠ was doing.',
    href: 'topics/past-tenses.html',
    level: 'b1',
    tags: ['14 розділів', '200+ прикладів', 'тест', 'вправи'],
    ready: true
  },

  /* ---- нижче — план. Замініть ready на true і додайте href, коли сторінка готова ---- */
  {
    title: 'Теперішні часи',
    desc: 'Present Simple, Present Continuous, Present Perfect. Головна пастка українців: Present Perfect vs Past Simple.',
    href: null, level: 'b1', tags: ['у планах'], ready: false
  },
  {
    title: 'Артиклі: a / an / the / нуль',
    desc: 'В українській артиклів немає, тому це помилка №1. Проста система з трьох питань.',
    href: null, level: 'a2', tags: ['у планах'], ready: false
  },
  {
    title: 'Умовні речення',
    desc: 'Zero, First, Second, Third conditional і змішані. Коли would, коли had.',
    href: null, level: 'b2', tags: ['у планах'], ready: false
  },
  {
    title: 'Модальні дієслова',
    desc: 'can / could / may / must / should / have to. Ввічливість, ймовірність, обовʼязок.',
    href: null, level: 'b1', tags: ['у планах'], ready: false
  },
  {
    title: 'Фразові дієслова',
    desc: 'look into, put off, sort out, run over. Те, що відрізняє живу мову від перекладеного документа.',
    href: null, level: 'b2', tags: ['у планах'], ready: false
  },
  {
    title: 'Прийменники',
    desc: 'in / on / at, by / until, for / since / during. Найдрібніші слова з найбільшою кількістю помилок.',
    href: null, level: 'b1', tags: ['у планах'], ready: false
  },
  {
    title: 'Пасивний стан',
    desc: 'The bug was fixed. Коли пасив доречний, а коли робить текст важким.',
    href: null, level: 'b2', tags: ['у планах'], ready: false
  }
];

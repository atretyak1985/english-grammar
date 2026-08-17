/* ============================================================
   Граматика англійської — спільний скрипт для всіх сторінок
   ------------------------------------------------------------
   Робить три речі:
     1. Смужку прогресу читання вгорі сторінки
     2. Кнопки «Відповідь» / «Показати всі» у вправах
     3. Малює тест, якщо на сторінці є window.QUIZ_QUESTIONS
   Нічого міняти тут не треба, коли додаєте нову тему.
   ============================================================ */

/* ---------- 1. смужка прогресу ---------- */
(function () {
  var bar = document.getElementById('bar');
  if (!bar) return;
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var p = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = p + '%';
  });
})();

/* ---------- 2. розкриття відповідей у вправах ---------- */
document.addEventListener('click', function (e) {
  // одна відповідь
  if (e.target.classList.contains('reveal')) {
    var a = e.target.parentElement.querySelector('.answer');
    if (!a) return;
    a.classList.toggle('show');
    e.target.textContent = a.classList.contains('show') ? 'Сховати' : 'Відповідь';
  }
  // всі відповіді в блоці
  if (e.target.classList.contains('revealall')) {
    var box = document.getElementById(e.target.dataset.target);
    if (!box) return;
    var answers = box.querySelectorAll('.answer');
    var anyHidden = Array.prototype.some.call(answers, function (a) {
      return !a.classList.contains('show');
    });
    Array.prototype.forEach.call(answers, function (a) {
      a.classList.toggle('show', anyHidden);
    });
    Array.prototype.forEach.call(box.querySelectorAll('.reveal'), function (b) {
      b.textContent = anyHidden ? 'Сховати' : 'Відповідь';
    });
  }
});

/* ---------- 3. тест ----------
   Щоб додати тест на нову сторінку:
     а) поставте <div id="quizbox"></div> і <span id="score"></span>
     б) перед підключенням цього файлу опишіть питання:

     <script>
     window.QUIZ_QUESTIONS = [
       { q: "текст питання з ___",
         h: "переклад-підказка українською",
         o: ["варіант 1", "варіант 2", "варіант 3"],
         a: 1,                       // індекс правильного, рахуємо з 0
         w: "пояснення, чому саме так" }
     ];
     </script>
------------------------------------------------- */
(function () {
  var box = document.getElementById('quizbox');
  var questions = window.QUIZ_QUESTIONS;
  if (!box || !questions || !questions.length) return;

  var scoreEl = document.getElementById('score');
  var answered = 0, correct = 0, total = questions.length;

  if (scoreEl) scoreEl.textContent = '0 / ' + total;

  questions.forEach(function (item, i) {
    var d = document.createElement('div');
    d.className = 'q-item';
    d.innerHTML =
      '<p class="qq">' + (i + 1) + '. ' + item.q + '</p>' +
      (item.h ? '<p class="qh">' + item.h + '</p>' : '') +
      '<div class="opts"></div>' +
      '<div class="why2">' + item.w + '</div>';

    var opts = d.querySelector('.opts');
    item.o.forEach(function (text, j) {
      var b = document.createElement('button');
      b.className = 'opt';
      b.textContent = text;
      b.onclick = function () {
        if (d.dataset.done) return;
        d.dataset.done = '1';
        answered++;
        Array.prototype.forEach.call(opts.querySelectorAll('.opt'), function (x, k) {
          if (k === item.a) x.classList.add('right');
        });
        if (j !== item.a) b.classList.add('wrong'); else correct++;
        d.querySelector('.why2').classList.add('show');

        if (scoreEl) {
          var tail = '';
          if (answered === total) {
            var pct = correct / total;
            tail = pct >= 0.85 ? ' — чудовий результат.'
                 : pct >= 0.65 ? ' — непогано, перечитайте розділи з помилками.'
                 : ' — поверніться до теорії і зробіть вправи ще раз.';
          }
          scoreEl.textContent = correct + ' / ' + total + tail;
        }
      };
      opts.appendChild(b);
    });
    box.appendChild(d);
  });
})();

/* XII — блок 2: красное по сетке рассыпается при прокрутке, карточки поднимаются по одной. */
(function () {
  var strip = document.getElementById('dissolve');
  var cards = document.getElementById('cards');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Клетки: по бокам по одной широкой (отступ сетки), между ними n мелких.
  // Верхние ряды держатся дольше; у каждой клетки свой порог, разлёт в стороны и поворот.
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var builtFor = null;
  function build() {
    var mobile = window.innerWidth <= 900;
    if (builtFor === mobile) return;
    builtFor = mobile;
    var n = mobile ? 30 : 72, rows = mobile ? 5 : 6;
    strip.textContent = '';
    var frag = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < n + 2; c++) {
        var i = document.createElement('i');
        var t = (1 - r / rows) * 0.55 + Math.random() * 0.45 + 0.1;
        i.style.setProperty('--t', t.toFixed(3));
        i.style.setProperty('--dx', rnd(-9, 9).toFixed(2));
        i.style.setProperty('--dy', rnd(-4, 7).toFixed(2));
        i.style.setProperty('--r', rnd(-200, 200).toFixed(0));
        frag.appendChild(i);
      }
    }
    strip.appendChild(frag);
  }

  if (strip && !reduce) {
    build();
    var ticking = false;
    var gateS = xiiGate(strip, '300px 0px', function () { update(true); });
    var update = function (force) {
      ticking = false;
      if (force !== true && !gateS.on) return;
      var vh = window.innerHeight;
      var top = strip.getBoundingClientRect().top;
      var p = Math.max(0, Math.min(1, (vh - top) / (vh * 0.8)));
      strip.style.setProperty('--p', p.toFixed(3));
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', function () { build(); update(); });
    update();
  }

  // Карточки поднимаются вместе с прокруткой: по одной, слева направо.
  if (cards && !reduce) {
    var list = Array.prototype.slice.call(cards.querySelectorAll('.card'));
    var rising = false;
    var gateC = xiiGate(cards, '300px 0px', function () { rise(true); });
    var rise = function (force) {
      rising = false;
      if (force !== true && !gateC.on) return;
      var vh = window.innerHeight;
      var top = cards.getBoundingClientRect().top;
      var q = (vh - top) / (vh * 0.8);
      var dist = Math.min(90, vh * 0.1);
      list.forEach(function (card, i) {
        var t = Math.max(0, Math.min(1, (q - i * 0.1) / 0.6));
        var e = 1 - Math.pow(1 - t, 3);
        card.style.opacity = e.toFixed(3);
        card.style.transform = 'translateY(' + ((1 - e) * dist).toFixed(1) + 'px)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!rising) { rising = true; requestAnimationFrame(rise); }
    }, { passive: true });
    window.addEventListener('resize', rise);
    rise();
  }
})();

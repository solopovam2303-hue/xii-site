/* XII — блок 4: красные кубики падают и складываются в красный блок; панели форматов поднимаются при прокрутке. */
(function () {
  // ---- сборка красного блока из кубиков (обратно тому, как рассыпается красный после первого экрана) ----
  var strip = document.getElementById('build');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rnd(a, b) { return a + Math.random() * (b - a); }
  if (strip) {
    if (calm) {
      strip.style.background = 'var(--red)';
    } else {
      var built = null;
      var build = function () {
        var mobile = window.innerWidth <= 900;
        if (built === mobile) return; built = mobile;
        var n = mobile ? 30 : 72, rows = mobile ? 5 : 6;
        strip.textContent = '';
        var frag = document.createDocumentFragment();
        for (var r = 0; r < rows; r++) {
          for (var c = 0; c < n + 2; c++) {
            var i = document.createElement('i');
            // нижние ряды ложатся первыми, верхние позже
            var t = (1 - r / rows) * 0.5 + Math.random() * 0.35 + 0.05;
            i.style.setProperty('--t', t.toFixed(3));
            i.style.setProperty('--dx', rnd(-8, 8).toFixed(2));
            i.style.setProperty('--dy', rnd(-12, -3).toFixed(2));
            i.style.setProperty('--r', rnd(-200, 200).toFixed(0));
            frag.appendChild(i);
          }
        }
        strip.appendChild(frag);
      };
      var tick = false;
      var upd = function () {
        tick = false;
        var vh = window.innerHeight;
        var top = strip.getBoundingClientRect().top;
        var p = Math.max(0, Math.min(1.2, (vh - top) / (vh * 0.75)));
        strip.style.setProperty('--p', p.toFixed(3));
      };
      build();
      window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
      window.addEventListener('resize', function () { build(); upd(); });
      upd();
    }
  }

  var wrap = document.getElementById('formats');
  if (!wrap || calm) return;
  var list = Array.prototype.slice.call(wrap.querySelectorAll('.fmt'));
  var busy = false;
  function rise() {
    busy = false;
    var vh = window.innerHeight;
    var q = (vh - wrap.getBoundingClientRect().top) / (vh * 0.8);
    var dist = Math.min(90, vh * 0.1);
    list.forEach(function (el, i) {
      var t = Math.max(0, Math.min(1, (q - i * 0.12) / 0.6));
      var e = 1 - Math.pow(1 - t, 3);
      el.style.opacity = e.toFixed(3);
      el.style.transform = 'translateY(' + ((1 - e) * dist).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(rise); } }, { passive: true });
  window.addEventListener('resize', rise);
  rise();
})();

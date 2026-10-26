/* XII — блок «12 сфер»: красные кубики падают сверху и собирают рамку; снизу рамка рассыпается на кубики. */
(function () {
  var top = document.getElementById('scnBuild');
  var out = document.getElementById('scnOut');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!top || !out) return;
  if (calm) {
    top.style.background = 'var(--red)';
    return;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var mobileNow = null;
  function fill(el, assemble) {
    var mobile = window.innerWidth <= 900;
    var n = mobile ? 30 : 72, rows = mobile ? 5 : 6;
    el.textContent = '';
    var frag = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < n + 2; c++) {
        var i = document.createElement('i');
        var t = assemble ? (1 - r / rows) * 0.5 + Math.random() * 0.35 + 0.05
                         : (1 - r / rows) * 0.55 + Math.random() * 0.45 + 0.1;
        i.style.setProperty('--t', t.toFixed(3));
        i.style.setProperty('--dx', rnd(-9, 9).toFixed(2));
        i.style.setProperty('--dy', assemble ? rnd(-12, -3).toFixed(2) : rnd(-4, 7).toFixed(2));
        i.style.setProperty('--r', rnd(-200, 200).toFixed(0));
        frag.appendChild(i);
      }
    }
    el.appendChild(frag);
  }
  function build() {
    var mobile = window.innerWidth <= 900;
    if (mobileNow === mobile) return; mobileNow = mobile;
    fill(top, true);
    fill(out, false);
  }
  var busy = false;
  function update() {
    busy = false;
    var vh = window.innerHeight;
    var p1 = Math.max(0, Math.min(1.2, (vh - top.getBoundingClientRect().top) / (vh * 0.75)));
    top.style.setProperty('--p', p1.toFixed(3));
    var p2 = Math.max(0, Math.min(1, (vh - out.getBoundingClientRect().top) / (vh * 0.8)));
    out.style.setProperty('--p', p2.toFixed(3));
  }
  build();
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', function () { build(); update(); });
  update();
})();

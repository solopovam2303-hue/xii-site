/* XII — блок-пауза: рамка с фото чуть вырастает при прокрутке; вторая фраза проявляется позже первой. */
(function () {
  var sec = document.getElementById('pause');
  if (!sec) return;
  var frame = sec.querySelector('.pause__frame');
  var t2 = sec.querySelector('.pause__t2');
  var img = sec.querySelector('.pause__img');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var played = false, busy = false;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function update() {
    busy = false;
    var vh = window.innerHeight;
    var top = sec.getBoundingClientRect().top;
    var q = calm ? 1 : ease(clamp((vh - top) / (vh * 0.95), 0, 1));
    frame.style.setProperty('--ps', (0.88 + 0.12 * q).toFixed(4));
    // параллакс: фото смещается внутри рамки медленнее прокрутки
    if (!calm) {
      var r = frame.getBoundingClientRect();
      var n = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      img.style.transform = 'translate3d(0,' + (-n * r.height * 0.09).toFixed(1) + 'px,0)';
    }
    if (!played && q > 0.55) { played = true; if (t2) t2.dispatchEvent(new Event('xii:play')); }
  }
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

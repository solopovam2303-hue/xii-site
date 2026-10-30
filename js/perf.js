/* XII — разгрузка при прокрутке.
   xiiGate(элементы, запас, onLeave): говорит, виден ли блок (с запасом), чтобы скрипты прокрутки не считали то, чего не видно.
   Когда блок уходит из вида, onLeave один раз доводит его анимацию до конечного состояния.
   Ещё: видео главного экрана и свечение подвала останавливаются, пока их не видно. */
(function () {
  window.xiiGate = function (els, margin, onLeave) {
    var g = { on: true };
    var arr = [].concat(els).filter(Boolean);
    if (!('IntersectionObserver' in window) || !arr.length) return g;
    var vis = new Map();
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis.set(e.target, e.isIntersecting); });
      var was = g.on;
      g.on = arr.some(function (el) { return vis.get(el) !== false; });
      if (was && !g.on && onLeave) onLeave();
    }, { rootMargin: margin || '200px 0px' });
    arr.forEach(function (el) { vis.set(el, true); io.observe(el); });
    return g;
  };

  if (!('IntersectionObserver' in window)) return;
  function watch(el, fn) {
    if (!el) return;
    new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }, { rootMargin: '100px 0px' }).observe(el);
  }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.querySelector('.hero video');
  if (video && !reduce) {
    watch(document.querySelector('.hero'), function (v) {
      if (v) { if (video.paused) video.play().catch(function () {}); } else if (!video.paused) video.pause();
    });
  }
  var foot = document.querySelector('.foot');
  watch(foot, function (v) { foot.classList.toggle('is-off', !v); });
  var fest = document.getElementById('fest');
  watch(fest, function (v) { fest.classList.toggle('is-off', !v); });
})();

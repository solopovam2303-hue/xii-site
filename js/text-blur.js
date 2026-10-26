/* XII — анимация заголовков h1–h6: буквы проявляются из размытия по очереди.
   Движение на пружине (параметры из исходного промта: tension 128, friction 19, пауза между буквами 31 мс, старт через 50 мс).
   Основной текст не анимируется. Атрибут data-no-split у заголовка отключает эффект. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TENSION = 128, FRICTION = 19, STAGGER = 31, DELAY_IN = 50, BLUR = 8;

  var heads = document.querySelectorAll('h1,h2,h3,h4,h5,h6,.takes__title,.takes__list li,.takes__inline,.lena__t2,.pause__t1,.pause__t2');
  if (!heads.length || reduce) return;

  function split(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var letters = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/([ \t\r\n]+)/).forEach(function (part) {
            if (!part) return;
            if (/^[ \t\r\n]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'tw'; w.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach(function (ch) {
              var l = document.createElement('span');
              l.className = 'tl'; l.textContent = ch;
              l.style.opacity = '0'; l.style.filter = 'blur(' + BLUR + 'px)';
              w.appendChild(l); letters.push(l);
            });
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') { walk(n); }
      });
    })(el);
    return letters;
  }

  // пружинная анимация одной буквы: 0 -> 1
  var active = [];
  var running = false, last = 0;
  function frame(t) {
    var dt = Math.min(0.032, (t - last) / 1000 || 0.016); last = t;
    var now = performance.now();
    for (var i = active.length - 1; i >= 0; i--) {
      var s = active[i];
      if (now < s.start) continue;
      var a = (-TENSION * (s.x - 1) - FRICTION * s.v);
      s.v += a * dt; s.x += s.v * dt;
      var p = Math.max(0, Math.min(1, s.x));
      s.el.style.opacity = p.toFixed(3);
      s.el.style.filter = p >= 0.995 ? 'none' : 'blur(' + (BLUR * (1 - p)).toFixed(2) + 'px)';
      if (Math.abs(s.x - 1) < 0.002 && Math.abs(s.v) < 0.002) {
        s.el.style.opacity = '1'; s.el.style.filter = 'none';
        active.splice(i, 1);
      }
    }
    if (active.length) requestAnimationFrame(frame); else running = false;
  }
  function play(letters) {
    var base = performance.now() + DELAY_IN;
    letters.forEach(function (el, i) { active.push({ el: el, x: 0, v: 0, start: base + i * STAGGER }); });
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  }

  var waitReveal = document.documentElement.classList.contains('pre-active');
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); play(e.target.__letters); }
    });
  }, { threshold: 0.25 }) : null;

  Array.prototype.forEach.call(heads, function (h) {
    if (h.hasAttribute('data-no-split')) return;
    var letters = split(h);
    h.__letters = letters;
    if (h.hasAttribute('data-manual')) { h.addEventListener('xii:play', function () { play(letters); }, { once: true }); return; }
    var inHero = !!h.closest('.hero');
    if (inHero && waitReveal) {
      window.addEventListener('xii:reveal', function () { play(letters); }, { once: true });
      setTimeout(function () { if (letters[0] && letters[0].style.opacity === '0' && !active.length) play(letters); }, 15000);
    } else if (io) { io.observe(h); }
    else { play(letters); }
  });
})();

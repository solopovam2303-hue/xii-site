/* XII — блок 3.
   Компьютер: фото вылетают из центра, висят вокруг заголовка, потом собираются в ряд маленьких карточек.
   Одна карточка раскрыта; при наведении (или нажатии) раскрывается другая, над ней появляется подпись.
   Телефон и «уменьшить движение»: карусель, активная карточка — та, что ближе к центру. */
(function () {
  var sec = document.getElementById('fest');
  if (!sec) return;
  var stage = sec.querySelector('.fest__stage');
  var row = sec.querySelector('.fest__row');
  var title = sec.querySelector('.fest__title');
  var lead = sec.querySelector('.fest__lead');
  var cards = Array.prototype.slice.call(sec.querySelectorAll('.fcard'));
  var mq = window.matchMedia('(min-width: 901px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // где карточка «висит» вокруг заголовка: доля ширины/высоты от центра и поворот
  var SC = [
    [-.40, -.28, -9], [-.21, -.355, 6], [.03, -.37, -4], [.25, -.34, 8],
    [.40, -.17, -7], [.40, .16, 10], [.31, .34, -6], [.09, .37, 5],
    [-.13, .36, -9], [-.32, .31, 7], [-.40, .08, -5], [-.285, -.02, 4]
  ];
  var START = 0;                         // какая карточка раскрыта по умолчанию

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var bgs = Array.prototype.slice.call(sec.querySelectorAll('.fest__bg i'));
  var bgNow = 0, bgSrc = '';
  function setBg(i) {
    if (!bgs.length) return;
    var img = i >= 0 ? cards[i].querySelector('img') : null;
    var src = img ? (img.currentSrc || img.src) : '';
    if (src === bgSrc) return;
    bgSrc = src;
    bgs[bgNow].classList.remove('on');
    if (!src) return;
    bgNow = 1 - bgNow;
    bgs[bgNow].style.backgroundImage = 'url("' + src + '")';
    bgs[bgNow].classList.add('on');
  }
  function setActive(i) {
    cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
    setBg(i);
  }
  function activeIndex() {
    for (var i = 0; i < cards.length; i++) if (cards[i].classList.contains('is-active')) return i;
    return -1;
  }

  var on = false, ready = false;

  function enable() {
    if (on) return; on = true; ready = false;
    sec.classList.add('fest--js');
    sec.classList.remove('is-ready');
    setActive(-1);
    update();
  }
  function disable() {
    var wasOn = on;
    on = false; ready = false;
    sec.classList.remove('fest--js', 'is-ready');
    cards.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; });
    title.style.opacity = ''; lead.style.opacity = '';
    if (wasOn || activeIndex() === -1) { setActive(0); }
    pickByCenter();
  }
  // ---------- телефон: блок закрепляется, фото листаются вбок при вертикальной прокрутке ----------
  var pin = false;
  function pinCenterPick() {
    var mid = window.innerWidth / 2, best = 0, bd = 1e9;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    if (!cards[best].classList.contains('is-active')) setActive(best);
  }
  function pinUpdate() {
    if (!pin) return;
    var W = stage.clientWidth, vh = window.innerHeight;
    var m = parseFloat(getComputedStyle(row).paddingLeft) || 0;
    var last = cards[cards.length - 1];
    var contentRight = last.offsetLeft + last.offsetWidth;                // справа от последней карточки
    var shiftMax = Math.max(0, contentRight - (W - m));                   // последняя карточка заканчивается по правой линии сетки
    sec.style.height = Math.round(vh + shiftMax * 1.15) + 'px';
    var rect = sec.getBoundingClientRect();
    var p = clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
    row.style.transform = 'translate3d(' + (-p * shiftMax).toFixed(1) + 'px,0,0)';
    pinCenterPick();
  }
  function enablePin() {
    if (pin) return; pin = true;
    sec.classList.add('fest--pin');
    pinUpdate();
  }
  function disablePin() {
    if (!pin) return; pin = false;
    sec.classList.remove('fest--pin');
    sec.style.height = ''; row.style.transform = '';
  }
  function check() {
    if (mq.matches && !reduce) { disablePin(); enable(); }
    else { disable(); if (!reduce) enablePin(); else disablePin(); }
  }

  // ---------- телефон: активная = ближе к центру ----------
  function pickByCenter() {
    if (on) return;
    var mid = row.scrollLeft + row.clientWidth / 2, best = 0, bd = 1e9;
    cards.forEach(function (c, i) {
      var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    if (!cards[best].classList.contains('is-active')) setActive(best);
  }
  var pt = false;
  row.addEventListener('scroll', function () {
    if (on || pin || pt) return; pt = true;
    requestAnimationFrame(function () { pt = false; pickByCenter(); });
  }, { passive: true });

  // ---------- компьютер: наведение / нажатие / клавиатура ----------
  cards.forEach(function (c, i) {
    c.addEventListener('mouseenter', function () { if (on && ready) setActive(i); });
    c.addEventListener('focus', function () { if (on && ready) setActive(i); });
    c.addEventListener('click', function () {
      if (on) { if (ready) setActive(i); }
      else if (!pin) { setActive(i); c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
    });
  });

  // ---------- разлёт и сборка при прокрутке ----------
  var ticking = false;
  function update() {
    ticking = false;
    if (!on) return;
    var W = stage.clientWidth, H = stage.clientHeight;
    var rect = sec.getBoundingClientRect();
    var vh = window.innerHeight;
    var e = clamp(1 - rect.top / vh, 0, 1);                         // вход в блок
    var p = clamp(-rect.top / (rect.height - vh), 0, 1);            // прокрутка внутри блока
    var hS = Math.min(H * .2, W * .15);                             // высота карточки в разлёте
    var done = true;

    cards.forEach(function (c, i) {
      var e1 = ease(clamp(e * 1.3 - i * .02, 0, 1));
      var s2 = ease(clamp((p - .14 - i * .014) / .34, 0, 1));
      if (s2 < 1) done = false;
      var sc = SC[i];
      // итоговое положение по раскладке (offset* не зависят от transform)
      var fh = c.querySelector('.fcard__in').offsetHeight;
      var fx = row.offsetLeft + c.offsetLeft + c.offsetWidth / 2;
      var fy = row.offsetTop + c.offsetTop + c.offsetHeight / 2;
      var scx = W / 2 + sc[0] * W, scy = H / 2 + sc[1] * H;
      var ax = lerp(W / 2, scx, e1), ay = lerp(H / 2, scy, e1);
      var cx = lerp(ax, fx, s2), cy = lerp(ay, fy, s2);
      var rot = sc[2] * e1 * (1 - s2);
      var scale = lerp(lerp(.1, hS / Math.max(fh, 1), e1), 1, s2);
      c.style.opacity = clamp(e * 3, 0, 1).toFixed(3);
      c.style.transform = s2 >= 1 ? 'none' : 'translate(' + (cx - fx).toFixed(1) + 'px,' + (cy - fy).toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + scale.toFixed(4) + ')';
      c.style.zIndex = s2 > .5 ? 1 : 2;
    });

    title.style.opacity = (clamp(e * 2, 0, 1) * (1 - clamp((p - .1) / .2, 0, 1))).toFixed(3);
    lead.style.opacity = clamp((p - .4) / .16, 0, 1).toFixed(3);

    if (done && !ready) {
      ready = true; sec.classList.add('is-ready');
      if (activeIndex() === -1) setActive(START);
    } else if (!done && ready) {
      ready = false; sec.classList.remove('is-ready'); setActive(-1);
    }
  }

  window.addEventListener('scroll', function () {
    if ((on || pin) && !ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; if (on) update(); else pinUpdate(); }); }
  }, { passive: true });
  window.addEventListener('resize', function () { check(); update(); pinUpdate(); });
  if (mq.addEventListener) mq.addEventListener('change', check);
  check();
})();

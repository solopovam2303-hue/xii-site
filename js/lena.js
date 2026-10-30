/* XII — блок 5: фото растёт при прокрутке и отодвигает вторую строку заголовка; текст проявляется по словам. */
(function () {
  var sec = document.getElementById('lena');
  if (!sec) return;
  var row = sec.querySelector('.lena__row');
  var photo = sec.querySelector('.lena__photo');
  var textBox = sec.querySelector('.lena__text');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mq = window.matchMedia('(min-width: 901px)');

  // слова текста
  var words = [];
  Array.prototype.forEach.call(textBox.querySelectorAll('p'), function (p) {
    var parts = p.textContent.replace(/[ \t\r\n]+/g, ' ').trim().split(' ');
    p.textContent = '';
    parts.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      p.appendChild(s);
      if (i < parts.length - 1) p.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  var t2 = sec.querySelector('.lena__t2');
  var t2done = false;
  var busy = false;
  var gate = xiiGate(sec, '300px 0px', function () { update(true); });
  function update(force) {
    busy = false;
    if (force !== true && !gate.on) return;
    var vh = window.innerHeight;

    // фото
    var q = calm ? 1 : ease(clamp((vh * 0.92 - row.getBoundingClientRect().top) / (vh * 0.62), 0, 1));
    if (mq.matches) {
      var col = (sec.clientWidth - 2 * sec.querySelector('.lena__grid').offsetLeft) / 12;
      var w0 = col * 2, w1 = col * 6 - 14;
      sec.style.setProperty('--pw', (w0 + (w1 - w0) * q).toFixed(1) + 'px');
      photo.style.transform = '';
    } else {
      sec.style.removeProperty('--pw');
      var sc = 0.78 + 0.22 * q;
      photo.style.transform = 'scale(' + sc.toFixed(3) + ')';
    }

    // слова: от первого к последнему по мере прокрутки текста
    var r = textBox.getBoundingClientRect();
    var p = calm ? 1 : clamp((vh * 0.88 - r.top) / (vh * 0.42 + r.height * 0.8), 0, 1);
    var n = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) {
      var on = i < n;
      if (on !== words[i].classList.contains('on')) words[i].classList.toggle('on', on);
    }
  }
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

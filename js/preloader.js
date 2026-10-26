/* XII — прелоадер (по макету Figma):
   1) сетка падает слева направо, логотип заливается слева направо, «агентство мероприятий» сверху,
      буквы «ЗДЕСЬ И СЕЙЧАС» по очереди встают на линии;
   2) буквы собираются в подпись под логотипом;
   3) логотип с подписью переезжает в левый угол и точно совпадает с главным экраном.
   Показывается только при первом заходе (?pre=1 — принудительно, ?pre=0 — пропустить). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('pre-active')) return;
  var pre = document.getElementById('pre');
  if (!pre) { root.classList.remove('pre-active'); return; }

  var logo1 = document.getElementById('preLogo');
  var fill = document.getElementById('preLogoFill');
  var ls = document.getElementById('preLs');
  var lsX = document.getElementById('preLsX');
  var lsS = document.getElementById('preLsS');
  var tag = document.getElementById('preTag');
  var letters = Array.prototype.slice.call(pre.querySelectorAll('#preLetters span'));
  var lines = Array.prototype.slice.call(pre.querySelectorAll('.pre__grid i'));
  var pluses = Array.prototype.slice.call(pre.querySelectorAll('.pre__plus'));

  // положение букв подписи в SVG логотипа (центры в единицах 115×56) — из макета
  var GLYPHS = [[0,47.59,7.59,6.96],[8.27,47.76,9.86,8.24],[18.77,47.59,7.84,6.96],[27.54,47.59,8.19,6.96],[36.93,47.76,7.18,6.61],[48.08,47.76,8.17,6.61],[60.7,47.59,8.19,6.96],[69.73,47.59,7.84,6.96],[78.86,45,8.17,9.37],[88.32,47.76,7.47,6.61],[97.09,47.59,8.64,6.96],[106.81,47.59,8.19,6.96]];
  var X_OFFSET = 24.76;   // на сколько «XII +» смещён вправо в версии по центру
  var LIFT = 6.83;        // на сколько логотип поднимается, когда появляется подпись

  var EASE = 'cubic-bezier(.65,0,.35,1)', OUT = 'cubic-bezier(.2,.8,.2,1)', MOVE = 'cubic-bezier(.7,0,.2,1)';
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function anim(el, kf, o) {
    o = o || {};
    try { return el.animate(kf, { duration: o.d || 600, delay: o.delay || 0, easing: o.e || OUT, fill: 'forwards' }).finished.catch(function () {}); }
    catch (e) { return Promise.resolve(); }
  }
  function center(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  var finished = false;
  function cleanup() {
    if (finished) return; finished = true;
    try { localStorage.setItem('xii_pre_seen', '1'); } catch (e) {}
    root.classList.add('revealed');
    window.dispatchEvent(new Event('xii:reveal'));
    pre.classList.add('is-clear');
    anim(ls, [{ opacity: 1 }, { opacity: 0 }], { d: 200 });
    anim(logo1, [{ opacity: 1 }, { opacity: 0 }], { d: 200 });
    anim(tag, [{ opacity: 1 }, { opacity: 0 }], { d: 300 });
    letters.forEach(function (el) { anim(el, [{ opacity: 1 }, { opacity: 0 }], { d: 300 }); });
    pluses.concat(lines).forEach(function (el) { anim(el, [{ opacity: 1 }, { opacity: 0 }], { d: 700, delay: 100 }); });
    setTimeout(function () {
      if (pre.parentNode) pre.parentNode.removeChild(pre);
      root.classList.remove('pre-active'); root.classList.remove('revealed');
    }, 1300);
  }
  setTimeout(cleanup, 14000);   // страховка

  var video = document.getElementById('heroVideo');
  var videoReady = new Promise(function (resolve) {
    if (!video || video.readyState >= 3) return resolve();
    video.addEventListener('canplay', resolve, { once: true });
    setTimeout(resolve, 3000);
  });
  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  async function run() {
    // 1. сетка, логотип, подпись сверху, буквы
    var p = [];
    lines.forEach(function (l, i) { p.push(anim(l, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { d: 900, delay: i * 75 })); });
    pluses.forEach(function (el, i) { p.push(anim(el, [{ opacity: 0 }, { opacity: 1 }], { d: 500, delay: 700 + i * 200 })); });
    p.push(anim(tag, [{ opacity: 0 }, { opacity: 1 }], { d: 700, delay: 500 }));
    p.push(anim(fill, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { d: 1500, delay: 250, e: EASE }));
    letters.forEach(function (el, i) {
      p.push(anim(el, [{ opacity: 0, transform: 'translate(-50%, 8px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { d: 420, delay: 900 + i * 100 }));
    });
    window.__xiiPre = 's1';
    await Promise.all(p);
    await Promise.all([fontsReady, videoReady]);
    window.__xiiPre = 's1-ready';
    await wait(250);

    // 2. буквы собираются в подпись под логотипом, логотип чуть поднимается
    var lr = ls.getBoundingClientRect();
    var kx = lr.width / 115, ky = lr.height / 56;
    var fs = parseFloat(getComputedStyle(letters[0]).fontSize);
    var moves = letters.map(function (el, i) {
      var g = GLYPHS[i];
      var to = { x: lr.left + (g[0] + g[2] / 2) * kx, y: lr.top + (g[1] + g[3] / 2) * ky };
      var from = center(el.getBoundingClientRect());
      return { dx: to.x - from.x, dy: to.y - from.y, sc: (g[3] * ky) / (0.72 * fs) };
    });
    // логотип по центру заменяется на двухслойный (тот же вид, но смещён вверх на LIFT)
    ls.style.opacity = '1';
    logo1.style.opacity = '0';
    var liftPx = LIFT * ky;
    var stage2 = [anim(lsX, [{ transform: 'translate(0px,' + liftPx + 'px)' }, { transform: 'translate(0px,0px)' }], { d: 1000, e: EASE })];
    letters.forEach(function (el, i) {
      stage2.push(anim(el,
        [{ transform: 'translate(-50%, 0) scale(1)' }, { transform: 'translate(calc(-50% + ' + moves[i].dx + 'px), ' + moves[i].dy + 'px) scale(' + moves[i].sc + ')' }],
        { d: 1000, delay: i * 28, e: EASE }));
    });
    await Promise.all(stage2);
    // буквы превращаются в векторную подпись
    letters.forEach(function (el) { anim(el, [{ opacity: 1 }, { opacity: 0 }], { d: 200 }); });
    await anim(lsS, [{ opacity: 0 }, { opacity: 1 }], { d: 200 });
    window.__xiiPre = 's2-done';
    await wait(350);

    // 3. логотип с подписью переезжает в левый угол и совпадает с главным экраном
    var heroR = document.querySelector('.logo').getBoundingClientRect();
    var lr2 = ls.getBoundingClientRect();
    var kp = lr2.width / 115;                 // px на единицу SVG до переезда
    var kh = heroR.width / 115.24;            // px на единицу SVG на главном экране
    var k2 = kh / kp;
    var dx = heroR.left - lr2.left, dy = heroR.top - lr2.top;
    window.__xiiPre = 's3';
    await Promise.all([
      anim(lsS, [{ transform: 'translate(0px,0px) scale(1)' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k2 + ')' }], { d: 1100, e: MOVE }),
      anim(lsX, [{ transform: 'translate(0px,0px) scale(1)' }, { transform: 'translate(' + (dx - X_OFFSET * kh) + 'px,' + dy + 'px) scale(' + k2 + ')' }], { d: 1100, e: MOVE }),
      anim(tag, [{ opacity: 1 }, { opacity: 0 }], { d: 700 })
    ]);
    window.__xiiPre = 's3-done';
    try { var a = lsS.getBoundingClientRect(), b = lsX.getBoundingClientRect(); window.__xiiSnap = { slogan: [a.left, a.top, a.width, a.height], xii: [b.left + X_OFFSET * kh, b.top, b.width, b.height], hero: [heroR.left, heroR.top, heroR.width, heroR.height] }; } catch (e) {}
    cleanup();
  }
  run().catch(cleanup);
})();

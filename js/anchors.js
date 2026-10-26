/* XII — ссылки меню: прыгаем к началу нужного блока.
   Страница по пути меняет высоту (картинки подгружаются, блоки закрепляются), поэтому после прыжка
   положение перепроверяется и подправляется несколько раз. */
(function () {
  // куда прыгать: элемент и отступ от верха экрана
  var T = {
    '#fest':     function () { return [document.getElementById('fest'), 0]; },
    '#scenario': function () { return [document.querySelector('#scenario .scn__frame') || document.getElementById('scenario'), 24]; },
    '#pricing':  function () { return [document.querySelector('.work__frame'), 24]; },
    '#faq':      function () { return [document.getElementById('faq'), 0]; },
    '#contacts': function () { return [document.getElementById('contacts'), 0]; },
    '#top':      function () { return [document.body, 0]; }
  };
  var stop = false;
  ['wheel', 'touchstart', 'keydown'].forEach(function (e) {
    window.addEventListener(e, function () { stop = true; }, { passive: true });
  });

  function goto(key) {
    var get = T[key]; if (!get) return false;
    var tries = 0;
    stop = false;
    (function step() {
      var r = get(), el = r[0]; if (!el) return;
      var y = key === '#top' ? 0 : Math.max(0, Math.round(el.getBoundingClientRect().top + window.pageYOffset - r[1]));
      if (Math.abs(y - window.pageYOffset) > 2) window.scrollTo(0, y);
      if (++tries < 6 && !stop) setTimeout(step, tries < 3 ? 120 : 350);
    })();
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var key = a.getAttribute('href');
    if (!T[key]) return;
    e.preventDefault();
    goto(key);
    if (history.replaceState) history.replaceState(null, '', key);
  });
})();

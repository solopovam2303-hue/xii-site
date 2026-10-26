/* XII — первый экран: видео-фон (выбор версии, зацикливание с плавным стыком), мобильное меню */
(function () {
  var video = document.getElementById('heroVideo');
  if (video) {
    var mq = window.matchMedia('(max-width: 900px)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = navigator.connection && navigator.connection.saveData;

    function pick() {
      var mobile = mq.matches;
      var src = mobile ? video.dataset.srcMobile : video.dataset.srcDesktop;
      var poster = mobile ? video.dataset.posterMobile : video.dataset.posterDesktop;
      video.poster = poster;
      if (reduce || saveData) { video.removeAttribute('src'); video.load(); return; }
      if (video.getAttribute('src') !== src) {
        video.src = src;
        video.load();
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
    }
    pick();
    if (mq.addEventListener) mq.addEventListener('change', pick);

    // плавный стык при зацикливании: короткое затухание в конце и появление в начале
    var FADE = 0.45;
    function tick() {
      var d = video.duration, t = video.currentTime;
      if (d && isFinite(d)) {
        var o = Math.min(1, t / FADE, (d - t) / FADE);
        video.style.opacity = Math.max(0, o).toFixed(3);
      }
      requestAnimationFrame(tick);
    }
    video.addEventListener('playing', function () { requestAnimationFrame(tick); }, { once: true });

    // на всякий случай запускаем после первого касания (если браузер отложил автозапуск)
    document.addEventListener('touchstart', function () {
      if (video.paused && !reduce && !saveData) video.play().catch(function () {});
    }, { once: true, passive: true });
  }

  // мобильное меню
  var burger = document.getElementById('burger');
  var sheet = document.getElementById('sheet');
  if (burger && sheet) {
    function toggle(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      sheet.classList.toggle('is-open', open);
    }
    burger.addEventListener('click', function () { toggle(!sheet.classList.contains('is-open')); });
    sheet.addEventListener('click', function (e) { if (e.target.tagName === 'A') toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }
})();

/* XII — «Связаться»: открывает меню с двумя способами. Закрывается по клику вне меню, Esc и при прокрутке. */
(function () {
  var btns = Array.prototype.slice.call(document.querySelectorAll('[data-contact]'));
  if (!btns.length) return;
  var menu = document.createElement('div');
  menu.className = 'cm';
  menu.setAttribute('role', 'menu');
  menu.innerHTML =
    '<a role="menuitem" href="tel:+79308932151">Позвонить<small>+7 930 893-21-51</small></a>' +
    '<a role="menuitem" href="sms:+79308932151">Написать SMS<small>на этот же номер</small></a>';
  document.body.appendChild(menu);
  var cur = null;

  function place(b) {
    var r = b.getBoundingClientRect(), m = menu.getBoundingClientRect();
    var left = Math.max(12, Math.min(r.left, window.innerWidth - m.width - 12));
    var below = r.bottom + 8, above = r.top - m.height - 8;
    var top = (below + m.height + 12 > window.innerHeight && above > 12) ? above : below;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }
  function open(b) {
    cur = b; place(b);
    menu.classList.add('is-open');
    b.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (!cur) return;
    menu.classList.remove('is-open');
    cur.setAttribute('aria-expanded', 'false');
    cur = null;
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      if (cur === b) close(); else { close(); open(b); }
    });
  });
  document.addEventListener('click', function (e) { if (cur && !menu.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);
})();

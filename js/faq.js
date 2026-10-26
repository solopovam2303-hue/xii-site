/* XII — блок 6: раскрытие вопросов (по одному) и переключение категорий. */
(function () {
  var root = document.getElementById('faq');
  if (!root) return;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.faq__tab'));
  var groups = Array.prototype.slice.call(root.querySelectorAll('.faq__group'));

  function closeAll(group) {
    Array.prototype.forEach.call(group.querySelectorAll('.qa'), function (qa) {
      qa.classList.remove('is-open');
      qa.querySelector('.qa__q').setAttribute('aria-expanded', 'false');
    });
  }
  groups.forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.qa__q');
      if (!btn) return;
      var qa = btn.parentNode;
      var wasOpen = qa.classList.contains('is-open');
      closeAll(group);
      if (!wasOpen) { qa.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  function show(name) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.group === name ? 'true' : 'false'); });
    groups.forEach(function (g) {
      var on = g.dataset.group === name;
      g.hidden = !on;
      g.classList.remove('is-in');
      if (on) {
        void g.offsetWidth;
        g.classList.add('is-in');
        closeAll(g);
        var first = g.querySelector('.qa');
        if (first) { first.classList.add('is-open'); first.querySelector('.qa__q').setAttribute('aria-expanded', 'true'); }
      }
    });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.group); }); });
  show('org');
  groups[0].classList.remove('is-in');
})();

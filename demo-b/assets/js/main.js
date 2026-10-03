(function () {
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return d.getElementById(id); };

  /* Live UK time / open status */
  function tick() {
    var t;
    try {
      t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) { t = ''; }
    var a = $('ukTime'), b = $('ukTime2');
    if (a) a.textContent = t ? t + ' UK · 24/7' : '24/7';
    if (b) b.textContent = t || '24/7';
  }
  tick(); setInterval(tick, 20000);

  /* Mobile menu */
  var btn = $('menuBtn'), nav = $('nav');
  function setMenu(open) { btn.setAttribute('aria-expanded', open); nav.classList.toggle('open', open); d.body.classList.toggle('menu-open', open); }
  d.addEventListener('click', function (e) { if (d.body.classList.contains('menu-open') && !e.target.closest('#nav') && !e.target.closest('#menuBtn')) setMenu(false); });
  var hdr = d.querySelector('.site-header');
  function sc() { hdr.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', sc, { passive: true }); sc();
  /* active section highlight: section under the 30% line */
  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
  var secMap = { services: 'services', partworn: 'services', how: 'how', about: 'about', coverage: 'coverage', reviews: 'reviews', faq: 'faq', quote: 'quote' };
  var secEls = Object.keys(secMap).map(function (id) { return d.getElementById(id); }).filter(Boolean);
  var allEls = [].slice.call(d.querySelectorAll('main > section'));
  function markActive() {
    var line = window.innerHeight * 0.3, cur = null;
    allEls.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= line && r.bottom > line) cur = s; });
    var target = cur && secMap[cur.id];
    links.forEach(function (a) {
      var on = target && a.getAttribute('href') === '#' + target;
      a.classList.toggle('active', !!on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', markActive, { passive: true }); markActive();
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* FAQ accordion */
  d.querySelectorAll('.faq-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      $(b.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* Icon draw-in: normalise path lengths */
  d.querySelectorAll('.ico svg *').forEach(function (el) { el.setAttribute('pathLength', '1'); });

  /* Count-up */
  function run(el) {
    var to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    var fmt = function (n) { return dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-GB'); };
    if (reduce) { el.textContent = fmt(to); return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1500, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    d.querySelectorAll('[data-count]').forEach(function (c) { co.observe(c); });

    var items = d.querySelectorAll('.svc, .cov, .rev, .stat, .pw-text, .photo-tile, .track, .faq-item');
    items.forEach(function (el, i) {
      if (!el.classList.contains('track')) { el.setAttribute('data-reveal', ''); el.style.transitionDelay = (i % 3) * 70 + 'ms'; }
    });
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { ro.observe(el); });
  } else {
    d.querySelectorAll('.track,.svc').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Tyre-change journey: scroll-driven scene */
  var scene = $('scene'), cap = $('sceneCap'), list = $('jsteps');
  if (scene && list) {
    var steps = [].slice.call(list.querySelectorAll('.jstep'));
    var titles = steps.map(function (s) { return s.querySelector('h3').textContent; });
    var current = 0;
    function setStep(n) {
      if (n === current) return;
      current = n;
      scene.setAttribute('data-step', n);
      cap.innerHTML = '<b>Step ' + n + '</b> ' + titles[n - 1];
      steps.forEach(function (s, i) {
        s.classList.toggle('on', i === n - 1);
        s.classList.toggle('done', i < n - 1);
      });
    }
    function update() {
      var vh = window.innerHeight, line = vh * 0.62;
      var r = list.getBoundingClientRect();
      var p = (line - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      list.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      var n = 1;
      steps.forEach(function (s, i) {
        var sr = s.getBoundingClientRect();
        if (sr.top + sr.height * 0.3 < line) n = i + 1;
      });
      setStep(n);
    }
    var queued = false;
    function onScroll() {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { queued = false; update(); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    current = -1; setStep(1); update();
  }

  /* "Get help in 3 taps" widget */
  var chips = $('wChips');
  if (chips) {
    var panels = [].slice.call(d.querySelectorAll('.w-panel'));
    var dots = d.querySelectorAll('.w-steps li');
    var status = $('wStatus');
    var labels = ['Step 1 of 3: what do you need?', 'Step 2 of 3: where are you?', 'Step 3 of 3: call or WhatsApp us'];
    var chosen = '';
    function go(n) {
      panels.forEach(function (p, i) { p.hidden = i !== n - 1; });
      dots.forEach(function (x, i) { x.classList.toggle('on', i < n); });
      status.textContent = labels[n - 1];
      var f = panels[n - 1].querySelector('input,button,a');
      if (f) f.focus();
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      chips.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      chosen = b.textContent;
      $('wErr1').hidden = true;
    });
    $('wNext1').addEventListener('click', function () {
      if (!chosen) { $('wErr1').hidden = false; return; }
      go(2);
    });
    $('wBack2').addEventListener('click', function () { go(1); });
    $('wNext2').addEventListener('click', function () {
      var loc = $('w-loc').value.trim();
      if (!loc) { $('wErr2').hidden = false; $('w-loc').focus(); return; }
      $('wErr2').hidden = true;
      var size = $('w-size').value.trim();
      var msg = 'Hi Road Max, I need help: ' + chosen + '. Location: ' + loc + '.' + (size ? ' Tyre size / reg: ' + size + '.' : '');
      $('wSum').textContent = chosen + ' · ' + loc + (size ? ' · ' + size : '');
      $('wWa').href = 'https://wa.me/447842290576?text=' + encodeURIComponent(msg);
      go(3);
    });
    $('wBack3').addEventListener('click', function () { go(2); });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* Quote form -> mailto */
  var form = $('quoteForm'), note = $('formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    var msgs = { name: 'Please enter your name.', email: 'Please enter a valid email address.', phone: 'Please enter a phone number we can call.', postcode: 'Please enter your postcode.', service: 'Please choose what you need.' };
    form.querySelectorAll('[required]').forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      var eid = 'err-' + f.id, er = $(eid);
      if (!er) {
        er = d.createElement('p'); er.id = eid; er.className = 'f-err'; er.hidden = true;
        f.parentNode.appendChild(er);
        f.setAttribute('aria-describedby', eid);
      }
      er.textContent = msgs[f.name] || 'This field is required.';
      er.hidden = !bad;
      f.classList.toggle('err', bad);
      f.setAttribute('aria-invalid', bad);
      if (bad) { ok = false; if (!first) first = f; }
    });
    if (!ok) {
      note.className = 'form-note bad';
      note.textContent = 'Please fix the highlighted fields. For an emergency, call 01304 350200.';
      first.focus();
      return;
    }
    var v = function (n) { return form.elements[n].value.trim(); };
    var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone') + '\nPostcode: ' + v('postcode') +
      '\nService: ' + v('service') + '\n\nMessage:\n' + v('message');
    var href = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent('Callback request: ' + v('service')) +
      '&body=' + encodeURIComponent(body);
    note.className = 'form-note ok';
    note.textContent = 'Opening your email app. Your request is only sent when you press send there. If nothing opens, call 01304 350200.';
    window.location.href = href;
  });
})();

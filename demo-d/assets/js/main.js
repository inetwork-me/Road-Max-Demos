(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* mobile nav */
  var btn = $('.menu-btn'), nav = $('#nav');
  function setNav(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setNav(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); btn.focus(); } });

  /* reveal */
  var rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    rev.forEach(function (el, i) { el.style.setProperty('--dl', ((i % 4) * 0.07) + 's'); io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('is-in'); }); }

  /* count-up */
  var counts = $$('[data-count]');
  function run(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end.toLocaleString('en-GB') + suf; return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-GB') + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); io2.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counts.forEach(function (c) { io2.observe(c); });
  } else { counts.forEach(run); }

  /* service filter */
  var tabs = $$('.tab'), cards = $$('.card');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var f = t.getAttribute('data-filter');
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        c.hidden = !show;
        if (show) c.classList.add('is-in');
      });
    });
  });

  /* FAQ accordion */
  $$('.acc-item button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      d.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
  });

  /* tyre sidewall explainer */
  var svg = $('#sidewall'), NS = 'http://www.w3.org/2000/svg';
  var parts = [
    { t: '205', a: -29, w: 104, h: 'Width: 205 mm', x: 'The tyre is 205 millimetres wide, measured across the tread from sidewall to sidewall.' },
    { t: '55', a: -10, w: 80, h: 'Profile: 55%', x: 'The sidewall height is 55% of the width, so roughly 113 mm here. A lower number means a shorter, sportier sidewall.' },
    { t: 'R', a: 2, w: 46, h: 'R = radial construction', x: 'R means radial, the construction used by almost all modern car tyres.' },
    { t: '16', a: 12, w: 80, h: 'Rim size: 16 inches', x: 'The tyre fits a wheel with a 16 inch diameter rim.' },
    { t: '91', a: 24, w: 80, h: 'Load index: 91', x: 'Load index 91 means each tyre can carry up to about 615 kg.' },
    { t: 'V', a: 35, w: 52, h: 'Speed rating: V', x: 'V is the speed rating: built for speeds up to 149 mph (240 km/h).' }
  ];
  var CX = 300, CY = 520, R = 400, btns = $$('.part'), box = $('#explain'), groups = [], cur = -1;
  function el(n, at, p) { var e = d.createElementNS(NS, n); for (var k in at) e.setAttribute(k, at[k]); if (p) p.appendChild(e); return e; }
  if (svg) {
    var defs = el('defs', {}, svg);
    var cp = el('clipPath', { id: 'cp' }, defs); el('rect', { width: 600, height: 330 }, cp);
    var g = el('g', { 'clip-path': 'url(#cp)' }, svg);
    el('circle', { cx: CX, cy: CY, r: 520, fill: '#0f1722' }, g);
    // tread blocks
    for (var i = -40; i <= 40; i += 2.2) {
      el('rect', { x: CX - 9, y: CY - 520, width: 18, height: 38, fill: '#1c2735', transform: 'rotate(' + i + ' ' + CX + ' ' + CY + ')' }, g);
    }
    el('circle', { cx: CX, cy: CY, r: 480, fill: '#232f3d' }, g);
    el('circle', { cx: CX, cy: CY, r: 462, fill: 'none', stroke: '#3a4757', 'stroke-width': 2 }, g);
    el('circle', { cx: CX, cy: CY, r: 470, fill: '#1b2531' }, g);
    // rim
    el('circle', { cx: CX, cy: CY, r: 262, fill: '#c9d0d8' }, g);
    el('circle', { cx: CX, cy: CY, r: 250, fill: '#e7ebef' }, g);
    el('circle', { cx: CX, cy: CY, r: 262, fill: 'none', stroke: '#D81800', 'stroke-width': 5 }, g);
    // red stripe accent
    el('path', { d: 'M90 330 L150 330 L190 265 L130 265 Z', fill: '#D81800', opacity: 0.9 }, g);
    el('path', { d: 'M460 330 L520 330 L480 265 L420 265 Z', fill: '#183860', opacity: 0.9 }, g);
    parts.forEach(function (p, i) {
      var gg = el('g', { transform: 'translate(' + CX + ' ' + CY + ') rotate(' + p.a + ')', style: 'cursor:pointer' }, g);
      var r = el('rect', { x: -p.w / 2, y: -R - 46, width: p.w, height: 72, rx: 8, fill: '#D81800', opacity: 0 }, gg);
      var t = el('text', { x: 0, y: -R, 'text-anchor': 'middle', fill: '#fff', 'font-family': 'Montserrat,Arial,sans-serif', 'font-weight': 800, 'font-size': 46 }, gg);
      t.textContent = p.t;
      groups.push({ g: gg, r: r });
      gg.addEventListener('mouseenter', function () { sel(i, true); });
      gg.addEventListener('click', function () { sel(i, true); });
      if (i === 1) {
        var s = el('g', { transform: 'translate(' + CX + ' ' + CY + ') rotate(-19.5)' }, g);
        var st = el('text', { x: 0, y: -R, 'text-anchor': 'middle', fill: '#9fb0c4', 'font-family': 'Montserrat,Arial,sans-serif', 'font-weight': 800, 'font-size': 46 }, s);
        st.textContent = '/';
      }
    });
    var lab = el('text', { x: 300, y: 308, 'text-anchor': 'middle', fill: '#183860', 'font-family': 'Montserrat,Arial,sans-serif', 'font-weight': 800, 'font-size': 15, 'letter-spacing': 3 }, g);
    lab.textContent = 'SIDEWALL';
  }
  function sel(i) {
    cur = i;
    btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    groups.forEach(function (o, k) { o.r.setAttribute('opacity', k === i ? 1 : 0); });
    box.innerHTML = '';
    var s = d.createElement('strong'); s.textContent = parts[i].h;
    var sp = d.createElement('span'); sp.textContent = parts[i].x;
    box.appendChild(s); box.appendChild(sp);
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { sel(i); });
    b.addEventListener('mouseenter', function () { sel(i); });
  });

  /* tyre size -> WhatsApp */
  function setErr(input, msg) {
    var e = d.getElementById(input.getAttribute('aria-describedby'));
    if (msg) { e.textContent = msg; e.hidden = false; input.setAttribute('aria-invalid', 'true'); }
    else { e.textContent = ''; e.hidden = true; input.removeAttribute('aria-invalid'); }
    return !msg;
  }
  var pcRe = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/;
  var sf = $('#size-form');
  sf.addEventListener('submit', function (e) {
    e.preventDefault();
    var size = $('#sf-size'), pc = $('#sf-pc'), bad = null;
    var v1 = size.value.trim(), v2 = pc.value.trim();
    if (!setErr(size, v1.length < 5 ? 'Enter your tyre size, for example 205/55 R16.' : '')) bad = bad || size;
    if (!setErr(pc, !pcRe.test(v2) ? 'Enter a valid UK postcode, for example M1 1AE.' : '')) bad = bad || pc;
    if (bad) { bad.focus(); return; }
    var msg = 'Hi Road Max, I need a tyre quote. Tyre size: ' + v1 + '. Postcode: ' + v2.toUpperCase() + '.';
    window.open('https://wa.me/447842290576?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  /* quote form -> mailto */
  var f = $('#quote-form');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#f-name'), email = $('#f-email'), phone = $('#f-phone'), pc = $('#f-pc'), svc = $('#f-service'), msg = $('#f-msg');
    var bad = [];
    function chk(inp, ok, m) { if (!setErr(inp, ok ? '' : m)) bad.push(inp); }
    chk(name, name.value.trim().length > 1, 'Please enter your full name.');
    chk(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Please enter a valid email address.');
    chk(phone, phone.value.replace(/[^\d]/g, '').length >= 10, 'Please enter a phone number with at least 10 digits.');
    chk(pc, pcRe.test(pc.value.trim()), 'Please enter a valid UK postcode, for example CT1 2AB.');
    chk(svc, svc.value !== '', 'Please choose the service you need.');
    if (bad.length) { bad[0].focus(); return; }
    var body = 'Name: ' + name.value.trim() + '\nEmail: ' + email.value.trim() + '\nPhone: ' + phone.value.trim() +
      '\nPostcode: ' + pc.value.trim().toUpperCase() + '\nService: ' + svc.value + '\n\nMessage:\n' + (msg.value.trim() || '(none)');
    var url = 'mailto:info@roadmax.co.uk?subject=' + encodeURIComponent('Callback request: ' + svc.value) + '&body=' + encodeURIComponent(body);
    $('#form-status').textContent = 'Opening your email app with your details. If nothing opens, call 01304 350200 or WhatsApp 07842 290576.';
    window.location.href = url;
  });
  $$('input,select', f).forEach(function (i) {
    i.addEventListener('input', function () { if (i.getAttribute('aria-invalid')) setErr(i, ''); });
  });
})();

(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // year
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  // header shadow
  var hd = $('header.site');
  var onScroll = function () { hd.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  var btn = $('.menu-btn'), nav = $('#nav');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });

  // accordion
  $$('#acc button').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      $('#' + b.getAttribute('aria-controls')).classList.toggle('open', !open);
    });
  });

  // reveal
  var items = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  } else { items.forEach(function (i) { i.classList.add('in'); }); }

  // ---- UK-wide postcode / place checker ----
  var TEL = 'tel:01304350200', WA = 'https://wa.me/447842290576';
  var UK_PC = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|[A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?|[0-9][A-HJKPS-UW]) ?([0-9][ABD-HJLNP-UW-Z]{2})?)$/i;
  var SCO = ['AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'];
  var WAL = ['CF', 'LD', 'LL', 'NP', 'SA'];
  var CITY = { glasgow: 'SCO', edinburgh: 'SCO', aberdeen: 'SCO', cardiff: 'WAL', swansea: 'WAL', belfast: 'NI', london: 'ENG', birmingham: 'ENG', manchester: 'ENG', leeds: 'ENG', liverpool: 'ENG', sheffield: 'ENG', bristol: 'ENG', newcastle: 'ENG', nottingham: 'ENG', leicester: 'ENG', southampton: 'ENG' };
  function nation(pc) {
    var a = pc.toUpperCase().match(/^[A-Z]{1,2}/)[0];
    if (a === 'BT') return 'NI';
    if (SCO.indexOf(a) > -1) return 'SCO';
    if (WAL.indexOf(a) > -1) return 'WAL';
    return 'ENG';
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function buttons() {
    return '<div class="cta-row"><a class="btn btn-red" href="' + TEL + '">Call now 01304 350200</a>' +
      '<a class="btn btn-wa" href="' + WA + '" target="_blank" rel="noopener">WhatsApp</a></div>';
  }
  function clearHits() { $$('.area.hit').forEach(function (e) { e.classList.remove('hit'); }); }
  function mark(code) {
    clearHits();
    var card = code && $('.area[data-pc="' + code + '"]');
    if (card) card.classList.add('hit');
  }

  var form = $('#chk'), input = $('#chk-in'), out = $('#chk-out'), cerr = $('#chk-err');
  function fieldError(msg) {
    cerr.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'chk-err');
    out.className = 'result'; out.innerHTML = '';
    clearHits();
    input.focus();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = input.value.trim().replace(/\s+/g, ' ');
    cerr.textContent = ''; input.setAttribute('aria-invalid', 'false'); input.removeAttribute('aria-describedby');
    out.className = 'result';
    if (!raw) { fieldError('Please enter a UK postcode or a town.'); return; }
    var compact = raw.replace(/\s/g, '');
    var looksPostcode = /\d/.test(raw);
    var code = null, label = raw;
    if (looksPostcode) {
      if (!UK_PC.test(raw) && !UK_PC.test(compact)) { fieldError('That doesn\u2019t look like a UK postcode. Try something like M1 1AE or BT1.'); return; }
      code = nation(compact); label = raw.toUpperCase();
    } else {
      if (!/^[A-Za-z][A-Za-z '\u2019.\-]{1,59}$/.test(raw) || raw.replace(/[^A-Za-z]/g, '').length < 3) { fieldError('Please enter a UK postcode or a place name (letters only).'); return; }
      code = CITY[raw.toLowerCase()] || null;
    }
    mark(code);
    out.className = 'result show yes';
    out.innerHTML = '<strong>Yes &mdash; Road Max covers ' + esc(label) + '</strong>We&rsquo;ll send the nearest fitter, 24/7. Call or message us now.' + buttons();
  });


  // ---- quote form -> mailto ----
  var qf = $('#qf'), st = $('#qs');
  var rules = [
    ['f-name', 'e-name', function (v) { return v.trim().length > 1; }, 'Please enter your name.'],
    ['f-phone', 'e-phone', function (v) { return v.replace(/\D/g, '').length >= 10; }, 'Please enter a valid phone number.'],
    ['f-email', 'e-email', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()); }, 'Please enter a valid email.'],
    ['f-pc', 'e-pc', function (v) { return v.trim().length >= 3; }, 'Please enter your postcode.'],
    ['f-svc', 'e-svc', function (v) { return v !== ''; }, 'Please choose a service.']
  ];
  qf.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    rules.forEach(function (r) {
      var el = $('#' + r[0]), er = $('#' + r[1]), good = r[2](el.value);
      el.setAttribute('aria-invalid', good ? 'false' : 'true');
      if (!good) el.setAttribute('aria-describedby', r[1]); else el.removeAttribute('aria-describedby');
      er.textContent = good ? '' : r[3];
      if (!good) { ok = false; first = first || el; }
    });
    if (!ok) { st.textContent = 'Please check the highlighted fields.'; first.focus(); return; }
    var v = function (id) { return $('#' + id).value.trim(); };
    var body = 'Name: ' + v('f-name') + '\nPhone: ' + v('f-phone') + '\nEmail: ' + v('f-email') + '\nPostcode: ' + v('f-pc') +
      '\nService: ' + v('f-svc') + '\n\nMessage:\n' + (v('f-msg') || '(none)');
    window.location.href = 'mailto:info@roadmax.co.uk?subject=' + encodeURIComponent('Callback request: ' + v('f-svc')) + '&body=' + encodeURIComponent(body);
    st.textContent = 'Your email app should now open with your request. Press send to submit it. Urgent? Call 01304 350200.';
  });
})();

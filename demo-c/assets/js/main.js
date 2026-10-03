(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* header scroll + menu */
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var btn = $('#menuBtn'), nav = $('#nav');
  var mq = window.matchMedia('(min-width: 960px)');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
  }
  btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });
  var syncMq = function () { if (mq.matches) setMenu(false); };
  if (mq.addEventListener) mq.addEventListener('change', syncMq);

  /* reveal */
  var rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el, i) { el.style.setProperty('--d', (i % 3) * 0.08 + 's'); io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- coverage (UK map) ---------- */
  var NATIONS = {
    all: { title: 'All of the UK, 24/7', cities: null },
    england: { title: 'England', cities: ['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Plymouth', 'Norwich'] },
    scotland: { title: 'Scotland', cities: ['Glasgow', 'Edinburgh', 'Aberdeen', 'Inverness'] },
    wales: { title: 'Wales', cities: ['Cardiff', 'Swansea'] },
    ni: { title: 'Northern Ireland', cities: ['Belfast'] }
  };
  var tabs = $$('#areaTabs [role=tab]'), pins = $$('#ukMap .pin'), chips = $('#chips'),
      title = $('#areaTitle'), msg = $('#covMsg'), panel = $('#chipPanel'),
      tform = $('#townForm'), search = $('#townSearch'), result = $('#townResult');
  var current = 'all';

  function render(list) {
    chips.innerHTML = '';
    list.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; chips.appendChild(li); });
  }
  function markPins(area) {
    pins.forEach(function (p) {
      var on = area === 'all' || p.getAttribute('data-nation') === area;
      p.classList.toggle('on', on);
      p.classList.toggle('off', !on);
      p.classList.remove('hit');
    });
  }
  function select(area, focusTab) {
    if (!NATIONS[area]) area = 'all';
    current = area;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-area') === area;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on) { panel.setAttribute('aria-labelledby', t.id); if (focusTab) t.focus(); }
    });
    markPins(area);
    title.textContent = NATIONS[area].title;
    var list = NATIONS[area].cities || pins.map(function (p) { return p.getAttribute('data-city'); });
    render(list);
    msg.textContent = area === 'all'
      ? 'England, Scotland, Wales and Northern Ireland, including all of these cities and everywhere in between.'
      : 'We cover ' + NATIONS[area].title + ', including these cities and everywhere in between, day and night.';
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t.getAttribute('data-area')); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(tabs[n].getAttribute('data-area'), true); }
    });
  });

  /* town / postcode check: any sensible place or postcode is covered */
  var PC_FULL = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i, PC_OUT = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/i;
  function makeBtn(cls, href, icon, label, ext) {
    var a = document.createElement('a');
    a.className = 'btn ' + cls; a.href = href;
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    a.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#' + icon + '"/></svg>';
    a.appendChild(document.createTextNode(label));
    return a;
  }
  function showResult(ok, text) {
    result.innerHTML = '';
    result.className = 'town-result ' + (ok ? 'ok' : 'bad');
    var p = document.createElement('p'); p.textContent = text; result.appendChild(p);
    if (ok) {
      var row = document.createElement('div'); row.className = 'tr-cta';
      row.appendChild(makeBtn('btn-red', 'tel:01304350200', 'i-phone', 'Call 01304 350200'));
      row.appendChild(makeBtn('btn-ghost', 'https://wa.me/447842290576', 'i-wa', 'WhatsApp', true));
      result.appendChild(row);
    }
  }
  tform.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = search.value.replace(/\s+/g, ' ').trim();
    search.removeAttribute('aria-invalid');
    if (!v) {
      showResult(false, 'Please type your town, city or postcode and we will check it for you.');
      search.setAttribute('aria-invalid', 'true'); search.focus(); return;
    }
    var letters = (v.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
    if (letters < 2 || v.length > 60 || /[^A-Za-z\u00C0-\u024F0-9 '\u2019,.\-&()]/.test(v)) {
      showResult(false, 'Hmm, that doesn\u2019t look like a UK town or postcode. Try something like \u201cLeeds\u201d or a full postcode.');
      search.setAttribute('aria-invalid', 'true'); search.focus(); return;
    }
    var shown = (PC_FULL.test(v) || PC_OUT.test(v)) ? v.toUpperCase() : v;
    // if it is one of the pinned cities, show it on the map
    var hit = null;
    pins.forEach(function (p) { if (p.getAttribute('data-city').toLowerCase() === v.toLowerCase()) hit = p; });
    if (hit) { select(hit.getAttribute('data-nation')); hit.classList.add('hit'); }
    showResult(true, 'Yes, Road Max covers ' + shown + ', 24/7. We\'ll send the nearest fitter.');
  });
  search.addEventListener('input', function () {
    if (!search.value.trim()) { result.innerHTML = ''; result.className = 'town-result'; search.removeAttribute('aria-invalid'); }
  });
  $$('[data-area-link]').forEach(function (a) {
    a.addEventListener('click', function () { select(a.getAttribute('data-area-link')); });
  });
  select('all');

  /* ---------- carousel ---------- */
  var track = $('#track');
  function step() { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : 300; }
  $('#prev').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
  $('#next').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); }
    else if (e.key === 'Home') { e.preventDefault(); track.scrollTo({ left: 0 }); }
    else if (e.key === 'End') { e.preventDefault(); track.scrollTo({ left: track.scrollWidth }); }
  });

  /* ---------- accordion ---------- */
  var accBtns = $$('.acc-btn');
  accBtns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      document.getElementById(b.getAttribute('aria-controls')).hidden = open;
    });
    b.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowDown') n = (i + 1) % accBtns.length;
      else if (e.key === 'ArrowUp') n = (i - 1 + accBtns.length) % accBtns.length;
      if (n !== null) { e.preventDefault(); accBtns[n].focus(); }
    });
  });

  /* ---------- form (mailto) ---------- */
  var form = $('#qform'), status = $('#formStatus');
  function clearErr(f) { f.classList.remove('err'); var m = $('.emsg', f); if (m) m.remove(); }
  function setErr(input, text) {
    var f = input.closest('.field'); clearErr(f); f.classList.add('err');
    var p = document.createElement('p'); p.className = 'emsg'; p.id = input.id + '-err'; p.textContent = text; f.appendChild(p);
    input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', p.id);
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var bad = null;
    $$('.field', form).forEach(clearErr);
    $$('input,select,textarea', form).forEach(function (i) { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); });
    ['name', 'email', 'phone', 'postcode', 'service'].forEach(function (n) {
      var i = form.elements[n]; var v = i.value.trim(); var m = null;
      if (!v) m = 'Please fill this in.';
      else if (n === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) m = 'Please enter a valid email.';
      else if (n === 'phone' && v.replace(/\D/g, '').length < 10) m = 'Please enter a valid phone number.';
      if (m) { setErr(i, m); if (!bad) bad = i; }
    });
    if (bad) { bad.focus(); return; }
    var g = function (n) { return form.elements[n].value.trim(); };
    var body = 'Name: ' + g('name') + '\nEmail: ' + g('email') + '\nPhone: ' + g('phone') + '\nPostcode: ' + g('postcode') +
      '\nService: ' + g('service') + '\n\nMessage:\n' + (g('message') || '-');
    var url = 'mailto:' + form.dataset.to + '?subject=' + encodeURIComponent('Callback request: ' + g('service') + ' (' + g('postcode') + ')') +
      '&body=' + encodeURIComponent(body);
    status.textContent = 'Opening your email app. If nothing happens, please email info@roadmax.co.uk or call 01304 350200.';
    window.location.href = url;
  });
})();



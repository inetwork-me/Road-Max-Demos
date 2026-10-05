// Road Max — homepage interactions
(function () {
  'use strict';

  var PHONE = '01304350200';
  var WHATSAPP_NUMBER = '447842290576';
  // UK postcode formats: full (e.g. SW1A 1AA, LS1 4AP) or outward code only (e.g. LS1, EH12, BT7).
  var PC_FULL = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/;
  var PC_OUT = /^[A-Z]{1,2}[0-9][A-Z0-9]?$/;

  // Header: transparent over the hero, solid once scrolled
  var header = document.getElementById('site-header');
  function onScroll() {
    var solid = window.scrollY > 40;
    header.classList.toggle('bg-ink/95', solid);
    header.classList.toggle('backdrop-blur', solid);
    header.classList.toggle('border-white/10', solid);
    header.classList.toggle('border-transparent', !solid);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) header.classList.add('bg-ink/95');
    else onScroll();
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.classList.contains('hidden')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  // Postcode coverage checker
  var pcForm = document.getElementById('postcode-form');
  var pcInput = document.getElementById('postcode');
  var pcResult = document.getElementById('postcode-result');
  var liveMapEl = document.getElementById('live-map');
  function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clearHits() {
    if (!liveMapEl) return;
    liveMapEl.querySelectorAll('.hit').forEach(function (el) { el.classList.remove('hit'); });
  }
  function showPc(ok, html) {
    pcResult.classList.remove('hidden');
    pcResult.innerHTML = html;
    if (ok) pcInput.removeAttribute('aria-invalid'); else pcInput.setAttribute('aria-invalid', 'true');
  }
  var CALL_LINKS = 'Call <a class="font-semibold text-white underline" href="tel:' + PHONE + '">01304 350200</a> or ' +
    '<a class="font-semibold text-white underline" href="https://wa.me/' + WHATSAPP_NUMBER + '">WhatsApp us</a>.';
  pcForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearHits();
    var raw = pcInput.value.replace(/\s+/g, ' ').trim();
    var compact = raw.toUpperCase().replace(/\s/g, '');
    if (!raw) {
      showPc(false, 'Please enter your postcode or town, for example <strong class="text-white">LS1 4AP</strong>, <strong class="text-white">EH12</strong> or <strong class="text-white">Cardiff</strong>.');
      pcInput.focus();
      return;
    }
    var shown;
    if (/[0-9]/.test(raw)) {
      // Looks like a postcode attempt
      var full = compact.length >= 5 && PC_FULL.test(compact.slice(0, -3) + ' ' + compact.slice(-3));
      if (full) shown = compact.slice(0, -3) + ' ' + compact.slice(-3);
      else if (PC_OUT.test(compact)) shown = compact;
      else {
        showPc(false, '<strong class="text-white">That doesn\u2019t look like a UK postcode.</strong> Try a full postcode such as <strong class="text-white">M1 1AE</strong>, just the first part such as <strong class="text-white">M1</strong>, or your town.');
        pcInput.focus();
        return;
      }
    } else {
      var letters = (raw.match(/[A-Za-z\u00C0-\u024F]/g) || []).length;
      if (letters < 2 || raw.length > 50 || /[^A-Za-z\u00C0-\u024F '\u2019.,\-&()]/.test(raw)) {
        showPc(false, '<strong class="text-white">We couldn\u2019t read that.</strong> Please type a UK town or city, like <strong class="text-white">Leeds</strong>, or a postcode.');
        pcInput.focus();
        return;
      }
      shown = raw.replace(/\b([a-z])/g, function (m) { return m.toUpperCase(); });
      // Highlight the city on the map if it's one of the pins
      if (liveMapEl) {
        liveMapEl.querySelectorAll('[data-city]').forEach(function (el) {
          if (el.getAttribute('data-city').toLowerCase() === raw.toLowerCase()) el.classList.add('hit');
        });
      }
    }
    showPc(true, '<strong class="text-white">Great news, Road Max covers ' + esc(shown) + ', 24/7.</strong> ' +
      'We\u2019ll dispatch the nearest fitter. ' + CALL_LINKS);
  });
  pcInput.addEventListener('input', function () {
    if (!pcInput.value.trim()) { pcResult.classList.add('hidden'); pcInput.removeAttribute('aria-invalid'); clearHits(); }
  });

  // Callback form: opens WhatsApp with the details pre-filled (no server needed)
  var cbForm = document.getElementById('callback-form');
  var cbError = document.getElementById('cb-error');
  cbForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = cbForm.elements;
    var name = fields.namedItem('name').value.trim();
    var phone = fields.namedItem('phone').value.trim();
    var service = fields.namedItem('service').value;
    if (!name || !phone || !service) { cbError.classList.remove('hidden'); return; }
    cbError.classList.add('hidden');
    var text = 'Hi Road Max, please call me back.\nName: ' + name + '\nPhone: ' + phone + '\nService: ' + service;
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  // Subtle reveal on scroll
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Logo: drop-in on load, then hand control back to the hover effect; slightly smaller once scrolled
  var logo = document.getElementById('logo');
  var logoImg = logo.querySelector('.rm-logo');
  function endEntrance() { logo.classList.remove('is-entering'); }
  logo.addEventListener('animationend', function (e) { if (e.animationName === 'rm-drop') endEntrance(); });
  setTimeout(endEntrance, 1200); // fallback if animationend never fires
  function sizeLogo() {
    var small = window.scrollY > 40;
    logoImg.classList.toggle('h-9', small);
    logoImg.classList.toggle('h-11', !small);
  }
  window.addEventListener('scroll', sizeLogo, { passive: true });
  sizeLogo();

  // Icons draw themselves on (staggered within their group) and star rows pop in when they scroll into view
  var drawables = document.querySelectorAll('.i-draw, .stars');
  function activate(el) {
    if (el.classList.contains('stars')) { el.classList.add('is-on'); return; }
    var group = el.closest('ul, ol, section');
    var siblings = group ? group.querySelectorAll('.i-draw') : [el];
    var index = Array.prototype.indexOf.call(siblings, el);
    el.style.setProperty('--d', (Math.max(index, 0) * 0.12) + 's');
    el.classList.add('is-drawn');
  }
  if ('IntersectionObserver' in window) {
    var iconObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { activate(entry.target); iconObserver.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -30px 0px' });
    drawables.forEach(function (el) { iconObserver.observe(el); });
  } else {
    drawables.forEach(activate);
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth, weighted scrolling (skipped when reduced motion is requested)
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(performance.now());
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || link.getAttribute('href').length < 2) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  }

  // Hero parallax
  var heroImg = document.querySelector('.hero-img');
  function parallax() {
    if (reduceMotion || !heroImg) return;
    var y = Math.min(window.scrollY, 900);
    heroImg.style.translate = '0 ' + (y * 0.25).toFixed(1) + 'px';
  }
  window.addEventListener('scroll', parallax, { passive: true });

  // Intro: the logo fades in, then the curtain lifts (once per visit)
  var hero = document.getElementById('top');
  var intro = document.getElementById('intro');
  function startPage() {
    hero.classList.add('hero-in');
  }
  var skipIntro = document.documentElement.classList.contains('no-intro') || !intro;
  if (skipIntro) {
    if (intro) intro.remove();
    requestAnimationFrame(startPage);
  } else {
    if (lenis) lenis.stop();
    document.documentElement.style.overflow = 'hidden';
    var lifted = false;
    var lift = function () {
      if (lifted) return;
      lifted = true;
      try { sessionStorage.setItem('rm-intro', '1'); } catch (err) { /* private mode */ }
      intro.classList.add('out');
      document.documentElement.style.overflow = '';
      if (lenis) lenis.start();
      setTimeout(startPage, 350);
      setTimeout(function () { intro.remove(); }, 1100);
    };
    intro.addEventListener('click', lift);
    setTimeout(lift, 2600);
  }

  // Coverage map: draw the UK outline when it scrolls into view; freeze SMIL motion for reduced-motion users
  var liveMap = document.getElementById('live-map');
  if (liveMap) {
    var land = liveMap.querySelector('.land');
    if (land && land.getTotalLength) land.style.setProperty('--len', Math.ceil(land.getTotalLength()) + 10);
    if (reduceMotion) {
      liveMap.classList.add('on');
      if (liveMap.pauseAnimations) liveMap.pauseAnimations();
    } else if ('IntersectionObserver' in window) {
      var mapObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { liveMap.classList.add('on'); mapObserver.disconnect(); }
      }, { threshold: 0.25 });
      mapObserver.observe(liveMap);
    } else {
      liveMap.classList.add('on');
    }
  }

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* FXU landing — theme, nav, reveals, tilt, modal */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Theme ─────────────────────────────────────────────── */
  var saved = localStorage.getItem('fxu-theme');
  if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('fxu-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('fxu-theme', 'dark');
    }
  });

  /* ── Nav border on scroll ──────────────────────────────── */
  var nav = document.getElementById('nav');
  var onScrollNav = function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ── Scroll reveals ────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Device tilt: settles flat as it reaches mid-viewport ─ */
  var tiltEls = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]'));
  var ticking = false;

  function applyTilt() {
    ticking = false;
    var vh = window.innerHeight;
    tiltEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      // progress: 0 when element center is below viewport, 1 when at/above center
      var center = r.top + r.height / 2;
      var p = 1 - Math.min(Math.max((center - vh * 0.45) / (vh * 0.55), 0), 1);
      var rx = (1 - p) * 9;            // rotateX: 9deg → 0
      var sc = 0.96 + p * 0.04;        // scale: .96 → 1
      el.style.transform = 'perspective(1200px) rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
    });
  }
  function onScrollTilt() {
    if (!ticking) { ticking = true; requestAnimationFrame(applyTilt); }
  }
  if (tiltEls.length && !reducedMotion) {
    window.addEventListener('scroll', onScrollTilt, { passive: true });
    window.addEventListener('resize', onScrollTilt);
    applyTilt();
  }

  /* ── Waitlist modal ────────────────────────────────────── */
  var modal = document.getElementById('waitlist-modal');
  var formView = document.getElementById('wl-form-view');
  var successView = document.getElementById('wl-success-view');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    // reset to form view each time
    if (formView) formView.hidden = false;
    if (successView) successView.hidden = true;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    var first = modal.querySelector('input');
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-waitlist-open]').forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });
  document.querySelectorAll('[data-waitlist-close]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ── Footer year ───────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

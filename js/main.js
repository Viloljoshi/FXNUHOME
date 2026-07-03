/* FXU landing - theme, nav, split headlines, reveals, scroll-scrubbed hero, spotlight, modal */
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

  /* ── Split headlines into words for stagger ────────────── */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var wi = 0;
    el.textContent = '';
    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.style.setProperty('--wi', wi++);
          s.textContent = part;
          el.appendChild(s);
        });
      } else {
        el.appendChild(node); // keep <br> etc.
      }
    });
  });

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
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ══ Apple-style scroll choreography ═════════════════════
     - Devices settle from a tilted, scaled-back pose to flat
       as they rise through the viewport (scroll-scrubbed, lerped).
     - The hero copy recedes and fades as the product comes
       forward, exactly like Apple product pages.               */
  var tiltItems = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]')).map(function (el) {
    return { el: el, rx: 14, s: 0.94, ty: 26, ry: 0, tgtRx: 14, tgtS: 0.94, tgtTy: 26, tgtRy: 0, hero: el.hasAttribute('data-hero') };
  });
  var heroInner = document.querySelector('.hero-inner');
  var heroState = { y: 0, o: 1, tgtY: 0, tgtO: 1 };
  var mouseX = 0.5;

  function updateTargets() {
    var vh = window.innerHeight;
    var sy = window.scrollY;

    tiltItems.forEach(function (it) {
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -160 || r.top > vh + 160) return;
      var center = r.top + r.height / 2;
      // progress 0 → 1 as the device rises toward the upper-middle of the viewport
      var p = 1 - Math.min(Math.max((center - vh * 0.40) / (vh * 0.62), 0), 1);
      it.tgtRx = (1 - p) * 14;          // rotateX 14° → 0°
      it.tgtS = 0.94 + p * 0.06;        // scale .94 → 1
      it.tgtTy = (1 - p) * 30;          // translateY 30px → 0
      it.tgtRy = it.hero ? (mouseX - 0.5) * 3.5 : 0; // hero leans toward cursor
    });

    // Hero copy recedes as you scroll (parallax up + fade)
    if (heroInner) {
      var hp = Math.min(sy / (vh * 0.85), 1);
      heroState.tgtY = sy * 0.30;
      heroState.tgtO = 1 - hp * 0.75;
    }
  }

  function frame() {
    var k = 0.09;
    tiltItems.forEach(function (it) {
      it.rx += (it.tgtRx - it.rx) * k;
      it.s  += (it.tgtS  - it.s)  * k;
      it.ty += (it.tgtTy - it.ty) * k;
      it.ry += (it.tgtRy - it.ry) * (k * 0.7);
      it.el.style.transform =
        'perspective(1200px) rotateX(' + it.rx.toFixed(3) + 'deg) rotateY(' + it.ry.toFixed(3) +
        'deg) translateY(' + it.ty.toFixed(2) + 'px) scale(' + it.s.toFixed(4) + ')';
    });
    if (heroInner) {
      heroState.y += (heroState.tgtY - heroState.y) * 0.12;
      heroState.o += (heroState.tgtO - heroState.o) * 0.12;
      heroInner.style.transform = 'translateY(' + heroState.y.toFixed(2) + 'px)';
      heroInner.style.opacity = heroState.o.toFixed(3);
    }
    requestAnimationFrame(frame);
  }

  if (tiltItems.length && !reducedMotion) {
    window.addEventListener('scroll', updateTargets, { passive: true });
    window.addEventListener('resize', updateTargets);
    window.addEventListener('pointermove', function (e) {
      mouseX = e.clientX / window.innerWidth;
      updateTargets();
    }, { passive: true });
    updateTargets();
    requestAnimationFrame(frame);
  }

  /* ── Spotlight hover (cursor-tracked radial) ───────────── */
  if (!reducedMotion) {
    document.querySelectorAll('.spot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── Waitlist modal ────────────────────────────────────── */
  var modal = document.getElementById('waitlist-modal');
  var formView = document.getElementById('wl-form-view');
  var successView = document.getElementById('wl-success-view');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
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

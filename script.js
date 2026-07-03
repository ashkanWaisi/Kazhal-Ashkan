/**
 * ============================================================
 *  LUXURY WEDDING WEBSITE — script.js
 *  Ashkan & Kazhal Wedding Welcome Board
 *  Author: Award-Winning Senior Front-End Engineer
 * ============================================================
 */

/* ── Utility: DOM shorthand ── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
(function initLoader() {
  const screen = $('#loading-screen');
  if (!screen) return;

  // After bar animation + small grace, fade out
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
      document.body.style.overflow = '';
    }, 3000);
  });

  // Fallback: always hide after 4s
  setTimeout(() => {
    screen.classList.add('hidden');
    document.body.style.overflow = '';
  }, 4200);
})();

/* ============================================================
   2. PARTICLE SYSTEM — golden floating particles
   ============================================================ */
(function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;

  /* Resize */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* Particle class */
  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 10;
      this.r    = Math.random() * 2.2 + 0.4;
      this.vy   = -(Math.random() * 0.4 + 0.15);
      this.vx   = (Math.random() - 0.5) * 0.25;
      this.life = 0;
      this.maxLife = Math.random() * 200 + 120;
      this.gold = Math.random() > 0.35;
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha    = progress < 0.15
        ? progress / 0.15
        : progress > 0.75
          ? (1 - progress) / 0.25
          : 1;

      ctx.save();
      ctx.globalAlpha = alpha * (this.gold ? 0.55 : 0.30);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.gold ? '#d4af6a' : '#f7efe0';
      ctx.fill();

      // soft glow
      if (this.gold && this.r > 1.2) {
        ctx.globalAlpha = alpha * 0.18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#d4af6a';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* Spawn */
  function spawn() {
    const count = Math.min(Math.floor(W / 18), 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  /* Loop */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  /* Init */
  resize();
  spawn();
  loop();

  window.addEventListener('resize', () => {
    resize();
    spawn();
  });
})();

/* ============================================================
   3. SMOOTH SCROLL
   ============================================================ */
$$('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = $(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   4. INTERSECTION OBSERVER — Scroll Reveal
   ============================================================ */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger children if card group
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // Stagger info cards
  $$('.info-card').forEach((card, i) => {
    card.dataset.delay = i * 120;
    observer.observe(card);
  });

  // Countdown items
  $$('.countdown-item').forEach((item, i) => {
    item.dataset.delay = i * 80;
    observer.observe(item);
  });

  // Generic reveal elements
  $$('.reveal, .section-title, .countdown-label, .buttons-label, .btn-row, .detail-card, .elegant-divider').forEach(el => {
    observer.observe(el);
  });
})();

/* ============================================================
   5. COUNTDOWN TIMER
   ============================================================ */
(function initCountdown() {
  // Wedding date: 1405/4/20 in Jalali = July 11, 2026 in Gregorian
  // Jalali 1405/04/20 → Gregorian: Farvardin=March21, Ordibehesht=April21, Khordad=May22, Tir=June22
  // Tir 1 = June 22, so Tir 20 = July 11, 2026
  const weddingDate = new Date('2026-07-11T18:00:00');

  const els = {
    days:    $('#cd-days'),
    hours:   $('#cd-hours'),
    mins:    $('#cd-mins'),
    secs:    $('#cd-secs'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function animateNum(el, val) {
    if (!el) return;
    const newVal = pad(val);
    if (el.textContent !== newVal) {
      el.classList.remove('flip');
      void el.offsetWidth; // reflow
      el.classList.add('flip');
      el.textContent = newVal;
    }
  }

  function tick() {
    const now  = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      // Wedding day!
      if (els.days)  els.days.textContent  = '00';
      if (els.hours) els.hours.textContent = '00';
      if (els.mins)  els.mins.textContent  = '00';
      if (els.secs)  els.secs.textContent  = '00';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    animateNum(els.days,  d);
    animateNum(els.hours, h);
    animateNum(els.mins,  m);
    animateNum(els.secs,  s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   6. MODAL SYSTEM
   ============================================================ */
(function initModals() {
  /* Modal data */
  const modalData = {
    'modal-address': {
      icon: '📍',
      label: 'مکان برگزاری',
      headline: 'Address',
      body: `
        <strong>باغ تالار ماهور</strong>
        پلیس راه همدان،<br>
        ورودی جاده برازان<br>
        <br>
        <span class="highlight">باغ تالار ماهور</span>
        <br>
        لطفاً مسیر را از قبل بررسی فرمایید
      `,
      link: { text: '🗺 مشاهده در نقشه', href: 'https://maps.app.goo.gl/rLqNvPQbtQeuUJMW8' },
    },
    'modal-time': {
      icon: '🕒',
      label: 'زمان برگزاری',
      headline: 'Schedule',
      body: `
        <strong>تاریخ مراسم</strong>
        ۱۴۰۵ / ۴ / ۲۰<br>
        <br>
        <strong>ساعت برگزاری</strong>
        <span class="highlight">۶ عصر تا ۱ بامداد</span><br>
        <br>
        <strong>ورود عروس و داماد</strong>
        <span class="highlight">ساعت ۸ شب</span>
      `,
    },
    'modal-reception': {
      icon: '🍽',
      label: 'پذیرایی',
      headline: 'Reception',
      body: `
        <strong>به صرف شام و پذیرایی</strong>
        شما را به صمیمانه‌ترین شب زندگی‌مان دعوت می‌کنیم.<br>
        <br>
        میزبانی گرم و پذیرایی ویژه از مهمانان عزیز<br>
        <span class="highlight">در طول مراسم فراهم خواهد بود.</span>
      `,
    },
    'modal-ceremony': {
      icon: '💍',
      label: 'مراسم ازدواج',
      headline: 'Ceremony',
      body: `
        <strong>جشن ازدواج</strong>
        با کمال افتخار، شما را به جشن<br>
        پیوند مقدس <span class="highlight">اشکان و کژال</span> دعوت می‌نماییم.<br>
        <br>
        <strong>حضور شما</strong>
        بزرگ‌ترین هدیه برای ماست
      `,
    },
  };

  /* Open */
  function openModal(id) {
    const overlay = $(`#${id}`);
    const data    = modalData[id];
    if (!overlay || !data) return;

    // Populate
    const iconEl     = overlay.querySelector('.modal-icon');
    const labelEl    = overlay.querySelector('.modal-title');
    const headlineEl = overlay.querySelector('.modal-headline');
    const bodyEl     = overlay.querySelector('.modal-body');
    const linkWrap   = overlay.querySelector('.modal-link-wrap');

    if (iconEl)     iconEl.textContent   = data.icon;
    if (labelEl)    labelEl.textContent  = data.label;
    if (headlineEl) headlineEl.textContent = data.headline;
    if (bodyEl)     bodyEl.innerHTML     = data.body;

    if (linkWrap) {
      if (data.link) {
        linkWrap.style.display = '';
        const a = linkWrap.querySelector('a');
        if (a) {
          a.textContent = data.link.text;
          a.href        = data.link.href;
        }
      } else {
        linkWrap.style.display = 'none';
      }
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trap focus
    const focusable = overlay.querySelectorAll('button, a, [tabindex]');
    if (focusable.length) focusable[0].focus();
  }

  /* Close */
  function closeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* Wire open buttons */
  $$('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });

  /* Wire close buttons and backdrop */
  $$('.modal-overlay').forEach(overlay => {
    overlay.querySelector('.modal-close')
      ?.addEventListener('click', () => closeModal(overlay));

    overlay.querySelector('.modal-backdrop')
      ?.addEventListener('click', () => closeModal(overlay));
  });

  /* ESC key */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      $$('.modal-overlay.active').forEach(closeModal);
    }
  });
})();

/* ============================================================
   7. BACK TO TOP BUTTON
   ============================================================ */
(function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================================
   8. PARALLAX — subtle hero parallax
   ============================================================ */
(function initParallax() {
  const frame = $('.hero-photo-frame');
  const orbs  = $$('.hero-orb');
  if (!frame) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        // Slow the photo frame as user scrolls
        frame.style.transform = `translateY(${sy * 0.12}px)`;

        // Move orbs in opposite directions
        orbs.forEach((orb, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          orb.style.transform = `translateY(${sy * dir * 0.06}px)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================================
   9. MUSIC BUTTON (prepared — toggle state)
   ============================================================ */
(function initMusicBtn() {
  const btn   = $('#music-btn');
  const audio = $('#bg-audio');
  if (!btn) return;

  let playing = false;

  btn.addEventListener('click', () => {
    playing = !playing;
    btn.textContent = playing ? '🔇' : '🎵';
    btn.title       = playing ? 'توقف موسیقی' : 'پخش موسیقی';

    if (audio) {
      if (playing) {
        audio.play().catch(() => { playing = false; btn.textContent = '🎵'; });
      } else {
        audio.pause();
      }
    }
  });
})();

/* ============================================================
   10. ELEGANT NAV — shrink / glow on scroll
   ============================================================ */
(function initNav() {
  const nav = $('#glass-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ============================================================
   11. CARD STAGGER — for info grid
   ============================================================ */
(function cardStagger() {
  const cards = $$('.info-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
  });
})();

/* ============================================================
   12. CURSOR GLOW (desktop only)
   ============================================================ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  Object.assign(glow.style, {
    position:     'fixed',
    width:        '320px',
    height:       '320px',
    borderRadius: '50%',
    background:   'radial-gradient(circle, rgba(212,175,106,0.10) 0%, transparent 70%)',
    pointerEvents:'none',
    zIndex:       '0',
    transform:    'translate(-50%, -50%)',
    transition:   'left 0.08s linear, top 0.08s linear',
    willChange:   'left, top',
  });
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

/* ============================================================
   13. IMAGE ERROR HANDLER — elegant fallback
   ============================================================ */
(function initImageFallback() {
  const heroImg = document.querySelector('.hero-photo-frame img');
  if (!heroImg) return;

  heroImg.addEventListener('error', function() {
    // If image fails to load, show an elegant SVG placeholder
    const frame = this.parentElement;
    this.style.display = 'none';

    const placeholder = document.createElement('div');
    Object.assign(placeholder.style, {
      width:      '100%',
      minHeight:  '480px',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap:        '20px',
      background: 'linear-gradient(160deg, #f7efe0 0%, #fdf8f0 100%)',
      padding:    '60px 40px',
      textAlign:  'center',
    });

    placeholder.innerHTML = `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="38" stroke="#d4af6a" stroke-width="1" opacity="0.6"/>
        <path d="M40 28 C36 20 24 20 24 30 C24 40 40 50 40 50 C40 50 56 40 56 30 C56 20 44 20 40 28Z" fill="#d4af6a" opacity="0.5"/>
        <text x="40" y="68" text-anchor="middle" font-family="'Great Vibes',cursive" font-size="10" fill="#c9993a">A &amp; K</text>
      </svg>
      <div style="font-family:'Great Vibes',cursive; font-size:2.2rem; color:#2c2417; line-height:1.2;">Ashkan &amp; Kazhal</div>
      <div style="font-family:'Vazirmatn',sans-serif; font-size:0.8rem; color:#c9993a; letter-spacing:0.2em; font-weight:600; text-transform:uppercase;">لطفاً تصویر را در پوشه assets قرار دهید</div>
      <div style="font-family:monospace; font-size:0.72rem; color:#6b5232; background:rgba(212,175,106,0.1); padding:8px 16px; border-radius:8px; border:1px solid rgba(212,175,106,0.3);">assets/hero.jpg</div>
    `;

    frame.appendChild(placeholder);
  });
})();

/* ============================================================
   CONSOLE SIGNATURE
   ============================================================ */
console.log('%c ✨ Ashkan & Kazhal — Wedding Welcome Board ✨ ', 
  'background: #d4af6a; color: #fff; padding: 8px 20px; border-radius: 4px; font-size: 13px;');

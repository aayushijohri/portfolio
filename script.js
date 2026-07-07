/* ============================================================
   PORTFOLIO — Vanilla JS (ES6+)  — FINAL POLISH
   No frameworks. No libraries. Everything hand-written.
   ============================================================ */

'use strict';

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── prefers-reduced-motion + visibility API guard ───────── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });

/* ── 1. LOADER ───────────────────────────────────────────── */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  if (sessionStorage.getItem('aj-loaded')) {
    loader.style.display = 'none';
    document.body.classList.add('ready');
    return;
  }

  const hide = () => {
    loader.classList.add('hidden');
    document.body.classList.add('ready');
    sessionStorage.setItem('aj-loaded', '1');
    setTimeout(() => loader.remove(), 600);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 900);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600), { once: true });
  }
})();

/* ── 2. THEME TOGGLE ─────────────────────────────────────── */
(function initTheme() {
  const btn  = $('#theme-btn');
  const html = document.documentElement;
  const saved = localStorage.getItem('aj-theme');
  if (saved) html.dataset.theme = saved;

  btn?.addEventListener('click', () => {
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    html.dataset.theme = next;
    localStorage.setItem('aj-theme', next);
  });
})();

/* ── 3. SCROLL PROGRESS ──────────────────────────────────── */
(function initScrollBar() {
  const bar = $('#scroll-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = total > 0 ? (scrollY / total * 100) + '%' : '0%';
  }, { passive: true });
})();

/* ── 4. NAVBAR: IntersectionObserver — accurate active link ─ */
(function initNavbar() {
  const header   = $('#site-header');
  const links    = $$('.nav-link');
  const sections = $$('section[id]');

  // Scrolled style on header
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', scrollY > 40);
  }, { passive: true });

  // Use IntersectionObserver for precise section detection
  let current = '';
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) current = e.target.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',  // fires when section is 40-55% into viewport
    threshold: 0,
  });

  sections.forEach(sec => io.observe(sec));
})();

/* ── 5. MOBILE MENU ──────────────────────────────────────── */
(function initMobileMenu() {
  const openBtn  = $('#menu-btn');
  const closeBtn = $('#menu-close');
  const overlay  = $('#mobile-menu');
  if (!overlay) return;

  const open = () => {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    openBtn?.classList.add('open');
  };
  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    openBtn?.classList.remove('open');
  };

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  $$('.mobile-link', overlay).forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ── 6. CURSOR GLOW ──────────────────────────────────────── */
(function initCursorGlow() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  if (prefersReducedMotion) return;

  const glow = $('#cursor-glow');
  if (!glow) return;

  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  const loop = () => {
    if (!pageVisible) { requestAnimationFrame(loop); return; }
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    glow.style.transform = `translate3d(${x - 200}px,${y - 200}px,0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

(function initParticles() {
  // Disable on mobile for performance
  if (window.innerWidth < 768 || prefersReducedMotion) {
    $('#particles')?.remove();
    return;
  }

  const canvas = $('#particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, pts = [];
  let canvasVisible = true;

  // Utilize Intersection Observer to pause drawing loop when canvas is off-screen
  const observer = new IntersectionObserver(entries => {
    canvasVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  observer.observe(canvas);

  function createParticle(randomY = false) {
    return {
      x: Math.random() * W,
      y: randomY ? Math.random() * H : H + 10,
      vx: (Math.random() - 0.5) * 0.04,
      vy: -0.06 - Math.random() * 0.08, // Slow float upwards
      r: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.35 + 0.05
    };
  }

  function resize() {
    const oldW = W;
    const oldH = H;
    W = innerWidth;
    H = innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);

    const count = Math.min(45, Math.floor(W * H / 35000));
    if (pts.length === 0) {
      pts = Array.from({ length: count }, () => createParticle(true));
    } else {
      // Re-scale positions on resize proportionally to prevent jumps
      if (oldW && oldH) {
        pts.forEach(p => {
          p.x = (p.x / oldW) * W;
          p.y = (p.y / oldH) * H;
        });
      }
      if (pts.length < count) {
        while (pts.length < count) pts.push(createParticle(true));
      } else if (pts.length > count) {
        pts.splice(count);
      }
    }
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function draw() {
    requestAnimationFrame(draw);
    if (!pageVisible || !canvasVisible) return;

    ctx.clearRect(0, 0, W, H);
    const isLight = document.documentElement.dataset.theme === 'light';

    for (const p of pts) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen boundaries gently or recycle at the bottom
      if (p.y < -10 || p.x < -10 || p.x > W + 10) {
        p.y = H + 10;
        p.x = Math.random() * W;
        p.alpha = 0.05;
      }

      // Premium subtle twinkling alpha breathing
      if (p.alpha < 0.5) p.alpha += 0.001;

      ctx.beginPath();
      // Premium soft violet/indigo coloring with lower opacity
      const color = isLight ? `rgba(99,102,241,${p.alpha * 0.3})` : `rgba(139,92,246,${p.alpha * 0.45})`;
      ctx.fillStyle = color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(draw);
})();

/* ── 8. PREMIUM METEORS ──────────────────────────────────── */
(function initMeteors() {
  if (prefersReducedMotion) return;

  const wrap = $('#meteors');
  if (!wrap) return;

  // Config: 3-5 meteors, spawned one at a time with random intervals
  const TRAIL_LEN = 160;  // px — long, elegant trails

  function spawnMeteor() {
    const m = document.createElement('div');
    m.className = 'meteor-el';

    // Random spawn anywhere along top-right 60% of screen
    const startX = 20 + Math.random() * 60; // % of viewport width
    const startY = Math.random() * 40;       // % of viewport height
    const speed  = 2200 + Math.random() * 1800; // ms — slower = more elegant
    const angle  = 210 + Math.random() * 20; // near 215° ± 10

    Object.assign(m.style, {
      left:   startX + 'vw',
      top:    startY + 'vh',
      opacity: 0,
    });

    wrap.appendChild(m);

    // Fade in, travel, fade out — all via a single controlled animation
    const kf = m.animate([
      { opacity: 0,   transform: `rotate(${angle}deg) translateX(0)` },
      { opacity: 0.7, transform: `rotate(${angle}deg) translateX(${TRAIL_LEN * 0.25}px)`, offset: 0.12 },
      { opacity: 0.5, transform: `rotate(${angle}deg) translateX(${TRAIL_LEN * 0.7}px)`, offset: 0.7 },
      { opacity: 0,   transform: `rotate(${angle}deg) translateX(${TRAIL_LEN * 1.3}px)` },
    ], { duration: speed, easing: 'ease-in', fill: 'forwards' });

    kf.onfinish = () => {
      m.remove();
      // Schedule next with random gap (1.5s – 5s)
      const nextIn = 1500 + Math.random() * 3500;
      setTimeout(spawnMeteor, nextIn);
    };
  }

  // Boot up 3-4 meteors at staggered random intervals
  const initial = [0, 800, 2400, 4100];
  initial.forEach(delay => setTimeout(spawnMeteor, delay));
})();

/* ── 9. TYPING ANIMATION ─────────────────────────────────── */
(function initTyping() {
  const el = $('#typing-el');
  if (!el) return;

  const words = [
    'National Hackathon Winner',
    'AI Engineer',
    'Full Stack Developer',
    'Open Source Contributor'
  ];
  let wordIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const word = words[wordIdx % words.length];

    if (!deleting) {
      el.textContent = word.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      el.textContent = word.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        wordIdx++;
        setTimeout(tick, 220);
        return;
      }
    }

    setTimeout(tick, deleting ? 35 : 70);
  }

  tick();
})();

/* ── 10. SCROLL REVEAL ───────────────────────────────────── */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (prefersReducedMotion) {
    // Immediately show all for accessibility
    els.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => io.observe(el));
})();

/* ── 11. COUNTER ANIMATION ───────────────────────────────── */
(function initCounters() {
  const section = $('#about');
  if (!section) return;

  const items = $$('[data-count]');
  let done = false;

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      items.forEach(el => {
        const target   = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.dec || '0');
        const dur      = prefersReducedMotion ? 0 : 1600;
        const t0       = performance.now();

        const step = (now) => {
          const p    = Math.min(1, (now - t0) / (dur || 1));
          const ease = 1 - Math.pow(1 - p, 3);
          const val  = target * ease;
          el.textContent = decimals ? val.toFixed(decimals) : Math.floor(val);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = decimals ? target.toFixed(decimals) : Math.floor(target);
        };
        requestAnimationFrame(step);
      });
    }
  }, { threshold: 0.3 });

  io.observe(section);
})();

/* ── 12. PROJECT CARD TILT ───────────────────────────────── */
(function initTilt() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  if (prefersReducedMotion) return;

  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (!pageVisible) return;
      const rect = card.getBoundingClientRect();
      const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * -5;
      const ry = ((e.clientX - rect.left) / rect.width  - 0.5) *  5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── 13. HACKATHONS EXPAND / COLLAPSE ────────────────────── */
(function initHackMore() {
  const btn    = $('#hack-more-btn');
  const section = $('#hackathons');
  if (!btn) return;

  const hidden = $$('.hack-hidden-custom');
  let open = false;

  // Ensure hidden items start in collapsed state
  hidden.forEach(el => {
    el.style.display = 'none';
    el.classList.remove('in');
  });

  btn.addEventListener('click', () => {
    open = !open;

    if (open) {
      btn.textContent = 'Show less ↑';
      
      hidden.forEach((el, i) => {
        el.style.display = 'flex';
        // Get target height
        const targetHeight = el.getBoundingClientRect().height;
        
        // Initial setup for height animation
        el.style.height = '0px';
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.overflow = 'hidden';
        el.style.transition = 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        
        void el.offsetHeight; // Force reflow
        
        // Stagger visual expand transition
        setTimeout(() => {
          el.style.height = `${targetHeight}px`;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, i * 30);
        
        // Clean inline styles once animation concludes to keep layout responsive
        const onEnd = (e) => {
          if (e.propertyName === 'height') {
            el.style.height = '';
            el.style.overflow = '';
            el.style.transition = '';
            el.removeEventListener('transitionend', onEnd);
          }
        };
        el.addEventListener('transitionend', onEnd);
      });
    } else {
      btn.textContent = 'Show All Placements (20+ total) ↓';
      
      hidden.forEach((el, i) => {
        const currentHeight = el.getBoundingClientRect().height;
        el.style.height = `${currentHeight}px`;
        el.style.overflow = 'hidden';
        el.style.transition = 'height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        
        void el.offsetHeight;
        
        el.style.height = '0px';
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        
        const onEnd = (e) => {
          if (e.propertyName === 'height') {
            el.style.display = 'none';
            el.style.height = '';
            el.style.opacity = '';
            el.style.transform = '';
            el.style.overflow = '';
            el.style.transition = '';
            el.removeEventListener('transitionend', onEnd);
          }
        };
        el.addEventListener('transitionend', onEnd);
      });
      
      // Stagger scrolling up
      setTimeout(() => {
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    }
  });
})();

/* ── 13b. TABBED SHOWCASE IN HERO ────────────────────────── */
(function initHeroShowcase() {
  const tabs = $$('.window-tab');
  const panels = $$('.window-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');
      
      tabs.forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });

      panels.forEach(p => {
        p.classList.toggle('active', p.id === target);
      });
    });
  });

  // Render mini Git heatmap on Panel 3
  const mapEl = $('#hero-mini-heatmap');
  if (mapEl) {
    const cols = 22; // width
    const rows = 7;  // height
    let html = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        let level = 0;
        if (rand > 0.8) level = 3;
        else if (rand > 0.6) level = 2;
        else if (rand > 0.3) level = 1;
        html += `<span class="heatmap-cell lvl-${level}"></span>`;
      }
    }
    mapEl.innerHTML = html;
  }
})();

/* ── 14. GITHUB STATS ───────────────────────────────────── */
// Static verified metrics displayed via HTML — no client-side fabrication.

/* ── 15. COPY EMAIL + TOAST ──────────────────────────────── */
(function initCopyEmail() {
  const btn   = $('#copy-email-btn');
  const toast = $('#toast');
  if (!btn || !toast) return;

  btn.addEventListener('click', () => {
    const email = 'aayushijohri2025@gmail.com';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(email)
        .then(showToast)
        .catch(legacyCopy);
    } else {
      legacyCopy();
    }

    function legacyCopy() {
      const ta = document.createElement('textarea');
      ta.value = email;
      Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0' });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast();
    }
  });

  let toastTimer;
  function showToast() {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
})();

/* ── 16. BACK TO TOP ─────────────────────────────────────── */
(function initBackTop() {
  const btn = $('#back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

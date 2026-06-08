window.XUZITENG = window.XUZITENG || {};

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ===== Typewriter Effect (deferred) =====
  var startTypewriter = null;
  function initTypewriter() {
    var lines = document.querySelectorAll('.hero-title > span[data-text]');
    var currentLine = 0;
    function typeLine(index) {
      if (index >= lines.length) return;
      var el = lines[index];
      var fullText = el.getAttribute('data-text');
      el.classList.add('typed');
      var ci = 0;
      var iv = setInterval(function () {
        el.textContent = fullText.slice(0, ci + 1);
        ci++;
        if (ci > fullText.length) {
          clearInterval(iv);
          if (index === lines.length - 1) {
            // Last line: keep typed, cursor stays blinking
          } else {
            el.classList.remove('typed');
            el.classList.add('done');
          }
          currentLine++;
          setTimeout(function () { typeLine(currentLine); }, 150);
        }
      }, 80);
    }
    startTypewriter = function () { typeLine(0); };
  }

  // ===== Scroll-down arrow =====
  function initScrollArrow() {
    var arrow = document.querySelector('.hero-decoration');
    if (arrow) {
      arrow.addEventListener('click', function () {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        var target = document.querySelector('.section-home-intro');
        if (target) {
          setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      });
    }
  }

  // ===== Hero Eraser (Canvas) =====
  function initHeroEraser() {
    var hero = document.getElementById('hero');
    var canvas = document.getElementById('hero-canvas');
    if (!hero || !canvas) { console.warn('[Eraser] hero or canvas not found'); return; }

    var ctx = canvas.getContext('2d');
    var BRUSH_DIAMETER = 50;
    var brushRadius = BRUSH_DIAMETER / 2;
    var pending = [];
    var rafId = null;
    console.log('[Eraser] init — hero:', hero.clientWidth + '×' + hero.clientHeight, 'canvas:', canvas.width + '×' + canvas.height);

    function getPinkColor() {
      return getComputedStyle(document.documentElement).getPropertyValue('--color-pink').trim() || '#FF43B4';
    }

    function resize() {
      var rect = hero.getBoundingClientRect();
      var w = Math.floor(rect.width);
      var h = Math.floor(rect.height);
      if (canvas.width === w && canvas.height === h) return;

      var saved = document.createElement('canvas');
      saved.width = canvas.width;
      saved.height = canvas.height;
      saved.getContext('2d').drawImage(canvas, 0, 0);

      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = getPinkColor();
      ctx.fillRect(0, 0, w, h);
      if (saved.width > 0 && saved.height > 0) {
        ctx.drawImage(saved, 0, 0);
      }
    }

    function initCanvas() {
      resize();
      ctx.fillStyle = getPinkColor();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawDot(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawStroke(fromX, fromY, toX, toY) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.lineWidth = BRUSH_DIAMETER;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }

    function flushPending() {
      if (!pending.length) return;
      if (pending.length === 1) {
        drawDot(pending[0].x, pending[0].y);
      } else {
        for (var i = 1; i < pending.length; i++) {
          drawStroke(pending[i - 1].x, pending[i - 1].y, pending[i].x, pending[i].y);
        }
      }
      pending = [];
      rafId = null;
    }

    var firstMove = true;

    initCanvas();
    window.addEventListener('resize', function () { resize(); });

    // Listen on document to avoid any cursor/overlay interference
    document.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right) return;
      if (e.clientY < rect.top  || e.clientY > rect.bottom - 120) return;
      var pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      pending.push(pos);
      if (!rafId) {
        rafId = requestAnimationFrame(flushPending);
        if (firstMove) { console.log('[Eraser] first move at', pos.x.toFixed(0) + ',' + pos.y.toFixed(0)); firstMove = false; }
      }
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      var touch = e.touches[0];
      if (!touch) return;
      var rect = hero.getBoundingClientRect();
      if (touch.clientX < rect.left || touch.clientX > rect.right) return;
      if (touch.clientY < rect.top  || touch.clientY > rect.bottom - 120) return;
      var pos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      pending.push(pos);
      if (!rafId) rafId = requestAnimationFrame(flushPending);
    }, { passive: true });
  }

  // ===== Stamp Effect =====
  function initStampEffect() {
    var STAMP_CURSOR = '主页图片/stamp-cursor.png'; // 印章光标（≤32px，用户替换）
    var STAMP_FULL   = '主页图片/stamp-full.png';   // 盖章大图（用户替换）
    var STAMP_SIZE   = 80;                           // 盖章大小 px，按需调整

    // Ensure body is the positioned ancestor for absolute stamps
    document.body.style.position = 'relative';

    // Replace native cursor — inject !important style to override ALL element cursors
    var cursorStyle = document.createElement('style');
    cursorStyle.textContent = 'body, body * { cursor: url(' + STAMP_CURSOR + ') 16 15, auto !important; }';
    document.head.appendChild(cursorStyle);

    document.addEventListener('click', function (e) {
      var stamp = document.createElement('img');
      stamp.src = STAMP_FULL;
      stamp.alt = '';
      stamp.draggable = false;
      stamp.style.cssText = 'position:absolute;pointer-events:none;z-index:9999;width:' + STAMP_SIZE + 'px;height:auto;opacity:1;';
      stamp.style.left = e.pageX + 'px';
      stamp.style.top  = e.pageY + 'px';

      var deg = (Math.random() - 0.5) * 30; // ±15°
      stamp.style.transform = 'translate(-50%, -50%) rotate(' + deg + 'deg)';

      document.body.appendChild(stamp);

      gsap.to(stamp, {
        opacity: 0,
        duration: 10,
        ease: 'power2.in',
        onComplete: function () { stamp.remove(); }
      });
    });
  }

  // ===== Clock =====
  function updateClock() {
    var d = new Date();
    var t = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    var h = document.getElementById('header-time');
    var f = document.getElementById('footer-time');
    if (h) h.textContent = t;
    if (f) f.textContent = t;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ===== Preloader (fixed 3s countdown) =====
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    var barFill = document.getElementById('bar-fill');
    if (!preloader) return;
    document.body.style.overflow = 'hidden';
    var overlay = preloader.querySelector('.preloader-overlay');
    var numberEl = preloader.querySelector('.preloader-number');
    var digits = [document.getElementById('dig0'), document.getElementById('dig1'), document.getElementById('dig2')];
    var current = [0, 0, 0];
    var duration = 3000;
    var startTime = Date.now();
    var finished = false;

    function animDigit(idx) {
      var d = digits[idx];
      if (!d) return;
      var cur = d.querySelector('.num-current');
      var nxt = d.querySelector('.num-next');
      cur.style.transform = 'translateY(-100%)';
      nxt.style.transform = 'translateY(-100%)';
      setTimeout(function () {
        cur.textContent = current[idx];
        cur.style.transition = 'none';
        cur.style.transform = 'translateY(0)';
        nxt.textContent = (current[idx] + 1) % 10;
        nxt.style.transition = 'none';
        nxt.style.transform = 'translateY(100%)';
        setTimeout(function () {
          cur.style.transition = 'transform 0.6s cubic-bezier(.22, 1, .36, 1)';
          nxt.style.transition = 'transform 0.6s cubic-bezier(.22, 1, .36, 1)';
        }, 50);
      }, 600);
    }

    function setNumber(n) {
      n = Math.min(100, Math.max(0, Math.round(n)));
      var s = n.toString().padStart(3, '0');
      for (var i = 0; i < 3; i++) {
        var val = parseInt(s[i]);
        if (val !== current[i]) { current[i] = val; animDigit(i); }
      }
    }

    function updateBar(pct) { if (barFill) barFill.style.width = (pct * 100) + '%'; }

    function finishPreloader() {
      if (finished) return;
      finished = true;
      window.scrollTo(0, 0);
      updateBar(1);
      setTimeout(function () {
        gsap.to(overlay, { y: '-100%', duration: 1, ease: 'power3.inOut', onComplete: function () { preloader.style.display = 'none'; } });
        gsap.to(numberEl, { opacity: 0, duration: 0.3 });
        // Header entrance
        gsap.fromTo('#main-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2, onComplete: function () {
          document.getElementById('main-header').style.pointerEvents = 'auto';
        }});
        if (startTypewriter) startTypewriter();
        initHeroEraser();
      }, 400);
    }

    function tick() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(1, elapsed / duration);
      setNumber(Math.round(progress * 100));
      updateBar(progress);
      if (progress >= 1) { finishPreloader(); }
    }

    updateBar(0);
    setNumber(0);
    var timer = setInterval(function () {
      if (finished) { clearInterval(timer); return; }
      tick();
    }, 40);
    setTimeout(function () { if (!finished) { setNumber(100); finishPreloader(); } }, 3500);
  }

  // ===== Header scroll behavior =====
  function initHeader() {
    // Header is now always-visible fixed bar — no scroll behavior needed
  }

  // ===== Text reveal (ScrollTrigger) =====
  function initTextReveal() {
    var maskLines = document.querySelectorAll('.t-line-mask .hg-1');
    maskLines.forEach(function (line) {
      ScrollTrigger.create({
        trigger: line.closest('.t-line'),
        start: 'top 85%',
        onEnter: function () { line.classList.add('revealed'); },
        once: true
      });
    });

    // Caption stagger entrance
    ScrollTrigger.create({
      trigger: '.section-home-intro',
      start: 'top 75%',
      onEnter: function () {
        gsap.fromTo('.t-caption', { opacity: 0, x: -15 }, { opacity: 0.6, x: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' });
      },
      once: true
    });

    // 3D Parallax: captions 1.4x / main text 1.15x / bg 0.6x
    var aboutSection = document.querySelector('.section-home-intro');
    var aboutCaptions = document.querySelectorAll('.section-home-intro .t-caption-wrapper');
    var aboutTextLines = document.querySelectorAll('.section-home-intro .t-line-mask');
    if (aboutSection) {
      // Single timeline for synced parallax, shorter range = visible effect
      var aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
      // Captions: fastest (closest layer)
      aboutTl.to(aboutCaptions, { y: -1000, ease: 'none' }, 0);
      // Main text: middle layer
      aboutTl.to(aboutTextLines, { y: -400, ease: 'none' }, 0);
    }
  }

  // ===== Works Carousel =====
  function initWorks() {
    var track = document.getElementById('works-track');
    var viewport = document.getElementById('works-viewport');
    var prevBtn = document.getElementById('works-prev');
    var nextBtn = document.getElementById('works-next');
    if (!track || !viewport) return;

    // 8 fixed DOM cards — never added or removed (per design constraint)
    var cards = track.querySelectorAll('.t-card');
    var cardWidth = cards[0].offsetWidth + 40;
    var halfWidth = (cardWidth * cards.length) / 2;  // recalculated in renderCards

    // ═══ Master project registry — single source of truth ═══
    // Each category ≤ 4 unique cards so 4×2=8 fits the fixed 8-card track.
    // To add a project: add entry here → add article#detail-XX in HTML → add _galleryImages entry
    var projects = {
      '01': { number: '01', title: 'Project One',   tags: ['Brand', 'Design'],  category: 'spatial', representative: true  },
      '02': { number: '02', title: 'Project Two',   tags: ['Spatial', 'Motion'], category: 'spatial', representative: false },
      '03': { number: '03', title: 'Project Three', tags: ['Graphic', 'Concept'], category: 'spatial', representative: true  },
      '04': { number: '04', title: 'Project Four',  tags: ['Brand', 'Motion'],  category: 'spatial', representative: false },
      '05': { number: '05', title: 'Project Five',  tags: ['UI', 'Design'],     category: 'graphic', representative: true  },
      '06': { number: '06', title: 'Project Six',   tags: ['Motion', '3D'],     category: 'graphic', representative: false },
      '07': { number: '07', title: 'Project Seven', tags: ['Editorial', 'Print'], category: 'graphic', representative: false },
      '08': { number: '08', title: 'Project Eight', tags: ['Web', 'Code'],      category: 'graphic', representative: true  }
    };

    // Build a card-data entry from a project registry entry
    function toCardData(id, p) {
      var palette = (p.category === 'spatial') ? ['FF43B4', 'FFF9C7'] : ['000000', 'FF43B4'];
      return {
        img: 'https://placehold.co/600x400/' + palette[0] + '/' + palette[1] + '?text=' + p.number,
        number: p.number,
        title: p.title,
        tags: p.tags,
        detailId: id
      };
    }

    // Derive card sets from master registry — each ≤ 4 unique (4×2=8 fits track)
    var projectIds = Object.keys(projects);
    var cardSets = {
      set1: projectIds.filter(function(id) { return projects[id].representative; }).map(function(id) { return toCardData(id, projects[id]); }),
      set2: projectIds.filter(function(id) { return projects[id].category === 'spatial'; }).map(function(id) { return toCardData(id, projects[id]); }),
      set3: projectIds.filter(function(id) { return projects[id].category === 'graphic'; }).map(function(id) { return toCardData(id, projects[id]); })
    };

    function buildTrackData(set) { return set.concat(set); }

    function renderCards(category) {
      var uniqueSet = cardSets[category];      // array of unique cards (≤ 4)
      var data = buildTrackData(uniqueSet);    // doubled: [A,B,C,D, A,B,C,D]
      var uniqueCount = uniqueSet.length;      // 4 unique → 8 doubled → halfWidth=4*cw

      // Fill each fixed card with its data
      cards.forEach(function (card, i) {
        var d = data[i];
        card.setAttribute('data-detail', d.detailId);
        var img = card.querySelector('.t-card-featured-image');
        if (img) { img.src = d.img; }
        var num = card.querySelector('.t-card-number');
        if (num) { num.textContent = d.number; }
        var title = card.querySelector('.t-card-title');
        if (title) { title.textContent = d.title; }
        var terms = card.querySelectorAll('.t-card-term-name');
        terms.forEach(function (term, j) { if (d.tags[j]) { term.textContent = d.tags[j]; } });
      });

      // Update onclick handlers
      cards.forEach(function (card) {
        var did = card.getAttribute('data-detail');
        card.setAttribute('onclick', did ? "XZT.openDetail('" + did + "')" : '');
      });

      // ── Recalculate geometry (card width may change with different text) ──
      cardWidth = cards[0].offsetWidth + 40;
      halfWidth = uniqueCount * cardWidth;  // 1 full unique set width → seamless wrap

      // Immediately apply position reset (not deferred to next rAF frame)
      marqueeX = 0;
      gsap.set(track, { x: 0 });
      lastTime = 0;
    }

    // Tag filter buttons
    var tagButtons = document.querySelectorAll('.cr-tag .t-tag');
    tagButtons.forEach(function (tag) {
      tag.addEventListener('click', function () {
        var cat = tag.getAttribute('data-category');
        if (!cat || tag.classList.contains('active')) return;
        tagButtons.forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        renderCards(cat);
      });
    });

    // rAF-driven marquee — immune to killable-tween position drift
    var marqueeX = 0;
    var autoSpeed = 100;       // px/s
    var btnSpeed = 600;       // px/s on button hold
    var isHovering = false;
    var buttonHeld = null;    // 'prev' | 'next' | null
    var lastTime = 0;

    // Card click is handled via inline onclick (see HTML: XZT.openDetail)

    // Default: show set1
    renderCards('set1');

    function loop(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      if (buttonHeld === 'prev') {
        marqueeX += btnSpeed * dt;
      } else if (buttonHeld === 'next') {
        marqueeX -= btnSpeed * dt;
      } else if (!isHovering) {
        marqueeX -= autoSpeed * dt;
      }

      // Wrap
      if (marqueeX <= -halfWidth) marqueeX += halfWidth;
      if (marqueeX > 0) marqueeX -= halfWidth;

      gsap.set(track, { x: marqueeX });

      requestAnimationFrame(loop);
    }

    // Buttons: hold to scroll
    function addButtonListeners(btn, direction) {
      btn.addEventListener('mousedown', function () { buttonHeld = direction; });
      btn.addEventListener('mouseup', function () { buttonHeld = null; });
      btn.addEventListener('mouseleave', function () { buttonHeld = null; });
      btn.addEventListener('touchstart', function (e) { e.preventDefault(); buttonHeld = direction; });
      btn.addEventListener('touchend', function () { buttonHeld = null; });
    }

    addButtonListeners(prevBtn, 'prev');
    addButtonListeners(nextBtn, 'next');

    // Per-card: hover scale + 3D tilt
    cards.forEach(function (card) {
      var cleanupTilt = null;

      card.addEventListener('mouseenter', function () {
        isHovering = true;
        track.querySelectorAll('.t-card').forEach(function (c) { gsap.to(c, { scale: c === card ? 1.2 : 0.6, zIndex: c === card ? 10 : 1, duration: 0.4, ease: 'power2.out' }); });

        var image = card.querySelector('.t-card-featured-image');
        var qkRotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' });
        var qkRotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        var qkShadowY = gsap.quickTo(card, 'boxShadow', { duration: 0.5, ease: 'power2.out' });
        if (image) { image.style.transform = 'translateZ(30px)'; }
        function onMove(e) {
          var r = card.getBoundingClientRect();
          var mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
          qkRotY(mx * 48); qkRotX(my * -32);
          qkShadowY((mx * -48) + 'px ' + (my * -40) + 'px 60px rgba(0,0,0,0.28)');
        }
        card.addEventListener('mousemove', onMove);
        cleanupTilt = function () {
          card.removeEventListener('mousemove', onMove);
          gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
          gsap.to(card, { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', duration: 0.6, ease: 'power2.out' });
          if (image) { image.style.transform = ''; }
          cleanupTilt = null;
        };
      });

      card.addEventListener('mouseleave', function () {
        isHovering = false;
        if (cleanupTilt) { cleanupTilt(); cleanupTilt = null; }
        track.querySelectorAll('.t-card').forEach(function (c) { gsap.to(c, { scale: 1, zIndex: 1, duration: 0.3, ease: 'power2.out' }); });
      });
    });

    requestAnimationFrame(loop);

    // Entrance
    ScrollTrigger.create({
      trigger: '.section-featured-works', start: 'top 80%',
      onEnter: function () {
        gsap.fromTo('.text-intro .hg, .text-intro .s-tag-label', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.15 });
        gsap.fromTo('.cr-tag .t-tag', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.07, ease: 'back.out(1.4)', delay: 0.3 });
      }, once: true
    });
  }

  // ===== Break section =====
  function initBreak() {
    // Hover image
    var breakCards = document.querySelectorAll('.list-break .t-card[data-img]');
    var hoverImg = document.getElementById('break-hover-img');
    breakCards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        hoverImg.src = card.getAttribute('data-img');
        hoverImg.classList.add('visible');
      });
      card.addEventListener('mousemove', function (e) {
        hoverImg.style.left = (e.clientX + 20) + 'px';
        hoverImg.style.top = (e.clientY - 90) + 'px';
      });
      card.addEventListener('mouseleave', function () { hoverImg.classList.remove('visible'); });
    });

    // Marquee speed modulation
    ScrollTrigger.create({
      trigger: '.section-break',
      start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        document.querySelectorAll('.section-break .t-marquee .hg').forEach(function (el) {
          el.style.animationDuration = (12 + self.progress * 6) + 's';
        });
      }
    });

    // Section entrance
    ScrollTrigger.create({
      trigger: '.section-break',
      start: 'top 80%',
      onEnter: function () {
        gsap.fromTo('.list-break .t-card', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
      },
      once: true
    });
  }

  // ===== Footer entrance =====
  function initFooter() {
    ScrollTrigger.create({
      trigger: '.main-footer-new',
      start: 'top 90%',
      onEnter: function () {
        gsap.fromTo('.main-footer-new .labels span', { opacity: 0, y: 8 }, { opacity: 0.5, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
        gsap.fromTo('.social-container .nav-item', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out', delay: 0.1 });
        gsap.fromTo('.nav-container .nav-item', { opacity: 0, y: 8 }, { opacity: 0.7, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.2 });
        gsap.fromTo('.footer-metadata span, .footer-metadata .copyright', { opacity: 0 }, { opacity: 0.5, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.3 });
      },
      once: true
    });
  }

  // ===== Back to top =====
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (btn) {
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  }

  // ===== Global XZT namespace for detail panel =====
  window.XZT = {
    // Gallery images per project — edit here to add/change images
    _galleryImages: {
      '01': [
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=01-01',
        'https://placehold.co/1200x675/FFF9C7/FF43B4?text=01-02',
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=01-03'
      ],
      '02': [
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=02-01',
        'https://placehold.co/1200x675/FFF9C7/FF43B4?text=02-02'
      ],
      '03': [
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=03-01',
        'https://placehold.co/1200x675/FFF9C7/FF43B4?text=03-02',
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=03-03'
      ],
      '04': [
        'https://placehold.co/1200x675/FF43B4/FFF9C7?text=04-01',
        'https://placehold.co/1200x675/FFF9C7/FF43B4?text=04-02'
      ],
      '05': [
        'https://placehold.co/1200x675/000000/FF43B4?text=05-01',
        'https://placehold.co/1200x675/FF43B4/000000?text=05-02',
        'https://placehold.co/1200x675/000000/FF43B4?text=05-03'
      ],
      '06': [
        'https://placehold.co/1200x675/000000/FF43B4?text=06-01',
        'https://placehold.co/1200x675/FF43B4/000000?text=06-02'
      ],
      '07': [
        'https://placehold.co/1200x675/000000/FF43B4?text=07-01',
        'https://placehold.co/1200x675/FF43B4/000000?text=07-02',
        'https://placehold.co/1200x675/000000/FF43B4?text=07-03'
      ],
      '08': [
        'https://placehold.co/1200x675/000000/FF43B4?text=08-01',
        'https://placehold.co/1200x675/FF43B4/000000?text=08-02'
      ]
    },

    _currentIdx: {},

    // Open detail panel — fixed overlay slides up from bottom
    openDetail: function (detailId) {
      var panel = document.getElementById('project-detail-panel');
      var article = document.getElementById('detail-' + detailId);
      if (!panel || !article) return;

      // Toggle: close if same article already open
      if (panel.classList.contains('open') && article.classList.contains('active')) {
        this.closeDetail();
        return;
      }

      // Switch to another project
      panel.querySelectorAll('.project-detail').forEach(function (a) { a.classList.remove('active'); });
      article.classList.add('active');

      // Reset gallery to first image
      this._currentIdx[detailId] = 0;
      var track = article.querySelector('.gallery-track');
      if (track) {
        track.style.position = 'relative';
        track.querySelectorAll('.gallery-img').forEach(function (img, i) { if (i > 0) img.remove(); });
        var firstImg = track.querySelector('.gallery-img');
        var imgs = this._galleryImages[detailId];
        if (firstImg && imgs && imgs.length) {
          firstImg.src = imgs[0];
          firstImg.style.position = 'relative';
          firstImg.style.top = '';
          firstImg.style.left = '';
          firstImg.style.width = '100%';
          gsap.set(firstImg, { x: 0 });
        }
      }

      // Show fixed overlay — clear any residual inline display:none
      panel.style.display = '';
      panel.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Animate: slide up from bottom
      gsap.fromTo(panel, { y: '100%' }, { y: '0%', duration: 0.5, ease: 'power2.out' });
    },

    // Close detail — slide overlay down, restore page scroll
    closeDetail: function () {
      var panel = document.getElementById('project-detail-panel');
      if (!panel) return;

      var self = this;

      // Animate: slide down and away
      gsap.to(panel, {
        y: '100%',
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: function () {
          panel.classList.remove('open');
          gsap.set(panel, { y: 0 });
          document.body.style.overflow = '';
          panel.querySelectorAll('.project-detail').forEach(function (a) { a.classList.remove('active'); });
          self._currentIdx = {};
        }
      });
    },

    // Gallery prev/next — infinite loop with horizontal slide
    galleryShift: function (detailId, direction) {
      var article = document.getElementById('detail-' + detailId);
      if (!article) return;
      var imgs = this._galleryImages[detailId];
      if (!imgs || imgs.length < 2) return;
      var track = article.querySelector('.gallery-track');
      var cur = track ? track.querySelector('.gallery-img') : null;
      if (!cur) return;

      var idx = this._currentIdx[detailId] || 0;
      var newIdx = direction === 'prev'
        ? (idx - 1 + imgs.length) % imgs.length
        : (idx + 1) % imgs.length;
      this._currentIdx[detailId] = newIdx;

      var fromX = direction === 'prev' ? '-100%' : '100%';
      var exitX = direction === 'prev' ? '100%' : '-100%';

      // Create new image — absolute positioned, slides in
      var img = document.createElement('img');
      img.className = 'gallery-img';
      img.src = imgs[newIdx];
      img.alt = 'Image ' + (newIdx + 1);
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.display = 'block';

      track.style.position = 'relative';
      // Keep current image relative to maintain track height
      if (cur.style.position !== 'relative') cur.style.position = 'relative';

      // Animate: old exits, new enters
      gsap.to(cur, { x: exitX, duration: 0.4, ease: 'power2.inOut' });
      track.appendChild(img);
      gsap.fromTo(img, { x: fromX }, { x: '0%', duration: 0.4, ease: 'power2.inOut', onComplete: function () {
        // Cleanup: remove old, make new relative to maintain track height
        cur.remove();
        img.style.position = 'relative';
        img.style.top = '';
        img.style.left = '';
      } });
    }
  };

  // Back button + gallery arrows — event delegation on panel
  (function () {
    var panel = document.getElementById('project-detail-panel');
    if (!panel) return;
    panel.addEventListener('click', function (e) {
      if (e.target.closest('.detail-back')) { XZT.closeDetail(); return; }
      var prevBtn = e.target.closest('.gallery-prev');
      var nextBtn = e.target.closest('.gallery-next');
      if (prevBtn || nextBtn) {
        var article = e.target.closest('.project-detail');
        if (article) {
          var did = article.getAttribute('data-project');
          if (did) XZT.galleryShift(did, prevBtn ? 'prev' : 'next');
        }
      }
    });
  })();

  // ===== Smooth anchor scroll =====
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  // ===== Init all =====
  gsap.registerPlugin(ScrollTrigger);
  initPreloader();
  initTypewriter();
  initScrollArrow();
  initHeader();
  initTextReveal();
  initWorks();
  initBreak();
  initFooter();
  initBackToTop();
  initStampEffect();
  initSmoothAnchors();
});

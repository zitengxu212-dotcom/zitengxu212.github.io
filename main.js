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

    var cards = track.querySelectorAll('.t-card');
    var cardWidth = cards[0].offsetWidth + 60;
    var totalCards = cards.length;
    var halfWidth = (cardWidth * totalCards) / 2;

    // rAF-driven marquee — immune to killable-tween position drift
    var marqueeX = 0;
    var autoSpeed = 60;       // px/s
    var btnSpeed = 300;       // px/s on button hold
    var isHovering = false;
    var buttonHeld = null;    // 'prev' | 'next' | null
    var lastTime = 0;

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

    // Per-card: hover scale + 3D tilt (no centering — avoids mouseleave jitter)
    cards.forEach(function (card) {
      var cleanupTilt = null;

      card.addEventListener('mouseenter', function () {
        isHovering = true;
        gsap.to(card, { scale: 1.08, duration: 0.4, ease: 'power2.out', zIndex: 10 });

        var image = card.querySelector('.t-card-featured-image');
        var qkRotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' });
        var qkRotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        var qkShadowY = gsap.quickTo(card, 'boxShadow', { duration: 0.5, ease: 'power2.out' });
        var qkImgX, qkImgY;
        if (image) { image.style.transform = 'translateZ(30px)'; qkImgX = gsap.quickTo(image, 'x', { duration: 0.4, ease: 'power2.out' }); qkImgY = gsap.quickTo(image, 'y', { duration: 0.4, ease: 'power2.out' }); }
        function onMove(e) {
          var r = card.getBoundingClientRect();
          var mx = (e.clientX - r.left) / r.width - 0.5, my = (e.clientY - r.top) / r.height - 0.5;
          qkRotY(mx * 48); qkRotX(my * -32);
          qkShadowY((mx * -48) + 'px ' + (my * -40) + 'px 60px rgba(0,0,0,0.28)');
          if (qkImgX) { qkImgX(mx * 40); qkImgY(my * -32); }
        }
        card.addEventListener('mousemove', onMove);
        cleanupTilt = function () {
          card.removeEventListener('mousemove', onMove);
          gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
          gsap.to(card, { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', duration: 0.6, ease: 'power2.out' });
          if (image) gsap.to(image, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
          cleanupTilt = null;
        };
      });

      card.addEventListener('mouseleave', function () {
        isHovering = false;
        if (cleanupTilt) { cleanupTilt(); cleanupTilt = null; }
        gsap.to(card, { scale: 1, zIndex: 1, duration: 0.3, ease: 'power2.out' });
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

  // ===== Smooth anchor scroll =====
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
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
  initSmoothAnchors();
});

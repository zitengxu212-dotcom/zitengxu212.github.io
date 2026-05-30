window.XUZITENG = window.XUZITENG || {};

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // ===== Typewriter Effect =====
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
          el.classList.remove('typed');
          el.classList.add('done');
          currentLine++;
          setTimeout(function () { typeLine(currentLine); }, 150);
        }
      }, 80);
    }
    typeLine(0);
  }

  // ===== Scroll-down arrow =====
  function initScrollArrow() {
    var arrow = document.querySelector('.hero-decoration');
    if (arrow) {
      arrow.addEventListener('click', function () {
        var target = document.querySelector('.gallery-container');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // ===== GSAP Card Gallery (exact reference) =====
  function initCardGallery() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (!document.querySelector('.cards li')) return;

    gsap.registerPlugin(ScrollTrigger, Draggable);

    var iteration = 0;
    gsap.set('.cards li', {xPercent: 400, opacity: 0, scale: 0});

    var spacing = 0.1,
      snapTime = gsap.utils.snap(spacing),
      cards = gsap.utils.toArray('.cards li'),
      animateFunc = function (element) {
        var tl = gsap.timeline();
        tl.fromTo(element, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false})
          .fromTo(element, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, 0);
        return tl;
      },
      seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc),
      playhead = {offset: 0},
      wrapTime = gsap.utils.wrap(0, seamlessLoop.duration()),
      scrub = gsap.to(playhead, {
        offset: 0,
        onUpdate: function () { seamlessLoop.time(wrapTime(playhead.offset)); },
        duration: 0.5, ease: "power3", paused: true
      }),
      trigger = ScrollTrigger.create({
        trigger: ".gallery-container",
        start: "top top",
        end: "bottom bottom",
        onUpdate: function (self) {
          scrub.vars.offset = self.progress * seamlessLoop.duration();
          scrub.invalidate().restart();
        }
      });

    function scrollToOffset(offset) {
      var progress = offset / seamlessLoop.duration();
      var scrollPos = trigger.start + progress * (trigger.end - trigger.start);
      trigger.scroll(scrollPos);
    }

    document.querySelector(".next").addEventListener("click", function () {
      scrollToOffset(scrub.vars.offset + spacing);
    });
    document.querySelector(".prev").addEventListener("click", function () {
      scrollToOffset(scrub.vars.offset - spacing);
    });

    Draggable.create(".drag-proxy", {
      type: "x", trigger: ".cards",
      onPress: function () { this.startOffset = scrub.vars.offset; },
      onDrag: function () {
        scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
        scrub.invalidate().restart();
      },
      onDragEnd: function () { scrollToOffset(scrub.vars.offset); }
    });

    // Click navigation
    var dragFlag = false;
    document.querySelector('.cards').addEventListener('mousedown', function () { dragFlag = false; });
    document.querySelector('.cards').addEventListener('mousemove', function () { dragFlag = true; });
    document.querySelector('.cards').addEventListener('mouseup', function (e) {
      if (dragFlag) return;
      var card = e.target.closest('li');
      if (!card) return;
      var url = card.getAttribute('data-url');
      if (url && url !== '#') { window.location.href = url; }
    });
    document.querySelector('.cards').addEventListener('touchstart', function () { dragFlag = false; });
    document.querySelector('.cards').addEventListener('touchmove', function () { dragFlag = true; });
    document.querySelector('.cards').addEventListener('touchend', function (e) {
      if (dragFlag) return;
      var card = e.target.closest('li');
      if (!card) return;
      var url = card.getAttribute('data-url');
      if (url && url !== '#') { window.location.href = url; }
    });

    function buildSeamlessLoop(items, sp, af) {
      var overlap = Math.ceil(1 / sp),
        startTime = items.length * sp + 0.5,
        loopTime = (items.length + overlap) * sp + 1,
        rawSequence = gsap.timeline({paused: true}),
        seamless = gsap.timeline({
          paused: true, repeat: -1,
          onRepeat: function () { this._time === this._dur && (this._tTime += this._dur - 0.01); }
        }),
        l = items.length + overlap * 2, time, i, index;
      for (i = 0; i < l; i++) {
        index = i % items.length;
        time = i * sp;
        rawSequence.add(af(items[index]), time);
        i <= items.length && seamless.add("label" + i, time);
      }
      rawSequence.time(startTime);
      seamless.to(rawSequence, { time: loopTime, duration: loopTime - startTime, ease: "none" })
        .fromTo(rawSequence, {time: overlap * sp + 1}, { time: startTime, duration: startTime - (overlap * sp + 1), immediateRender: false, ease: "none" });
      return seamless;
    }
  }

  // ===== Init =====
  initTypewriter();
  initScrollArrow();
  initCardGallery();
});

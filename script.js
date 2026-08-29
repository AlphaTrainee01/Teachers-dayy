/* =========================================================
   TEACHER'S DAY TRIBUTE — SCRIPT
   Sections: State / Particle Background / Scene Navigation /
   Scroll Interaction / Match-the-Lesson Game / Celebration / Init
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- State ---------------- */
  var currentScene = 'intro';
  var isTransitioning = false;

  /* =========================================================
     PARTICLE BACKGROUND (canvas, GPU-light, decorative "chalk dust")
     ========================================================= */
  var canvas = document.getElementById('particleField');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var PARTICLE_COUNT = prefersReducedMotion ? 24 : 60;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.6 + 0.6,
      baseOpacity: Math.random() * 0.5 + 0.25,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.6 + 0.25, // radians / sec
      driftX: (Math.random() - 0.5) * 3,        // px / sec
      driftY: (Math.random() - 0.5) * 3,
      hue: Math.random() > 0.5 ? 'mint' : 'gold'
    };
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(makeParticle());
    }
  }

  var lastFrame = performance.now();

  function drawParticles(now) {
    var dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.phase += p.twinkleSpeed * dt;
      p.x += p.driftX * dt;
      p.y += p.driftY * dt;

      // wrap around edges softly
      if (p.x < -10) p.x = window.innerWidth + 10;
      if (p.x > window.innerWidth + 10) p.x = -10;
      if (p.y < -10) p.y = window.innerHeight + 10;
      if (p.y > window.innerHeight + 10) p.y = -10;

      var twinkle = (Math.sin(p.phase) + 1) / 2; // 0..1
      var opacity = p.baseOpacity * (0.35 + twinkle * 0.65);
      var color = p.hue === 'mint' ? '143, 227, 176' : '242, 200, 121';

      ctx.beginPath();
      ctx.fillStyle = 'rgba(' + color + ', ' + opacity.toFixed(3) + ')';
      ctx.shadowColor = 'rgba(' + color + ', ' + (opacity * 0.8).toFixed(3) + ')';
      ctx.shadowBlur = p.size * 4;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawParticles);
  }

  function startParticles() {
    resizeCanvas();
    initParticles();
    requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', function () {
    resizeCanvas();
  });

  /* =========================================================
     SCENE NAVIGATION
     ========================================================= */
  function goToScene(nextId) {
    if (isTransitioning || nextId === currentScene) return;
    isTransitioning = true;

    var currentEl = document.getElementById(currentScene);
    var nextEl = document.getElementById(nextId);

    var leaveDuration = prefersReducedMotion ? 0 : 350;

    currentEl.classList.add('is-leaving');

    setTimeout(function () {
      currentEl.classList.remove('is-active', 'is-leaving');
      nextEl.classList.add('is-active');
      currentScene = nextId;
      isTransitioning = false;
      // Scroll the new scene into view from the top.
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, leaveDuration);
  }

  // Wire up every [data-next] control.
  document.querySelectorAll('[data-next]').forEach(function (el) {
    el.addEventListener('click', function () {
      goToScene(el.getAttribute('data-next'));
    });
  });

  /* =========================================================
     SCROLL INTERACTION (intro -> lessons)
     ========================================================= */
  var scrollTrigger = document.getElementById('scrollTrigger');
  var scrollOpened = false;

  scrollTrigger.addEventListener('click', function () {
    if (scrollOpened) return;
    scrollOpened = true;

    scrollTrigger.classList.add('is-opening');

    var openDuration = prefersReducedMotion ? 50 : 1050;
    setTimeout(function () {
      goToScene('memories');
    }, openDuration);
  });

  /* =========================================================
     MATCH-THE-LESSON GAME
     ========================================================= */
  var gameGrid = document.getElementById('gameGrid');
  var movesCountEl = document.getElementById('movesCount');
  var shuffleBtn = document.getElementById('shuffleBtn');

  var SYMBOL_DEFS = {
    apple: {
      label: 'apple',
      svg: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M24 20c-4-4-11-4-14 1-3.5 5.5-1 15 5 19 3 2 5 2 9 2s6 0 9-2c6-4 8.5-13.5 5-19-3-5-10-5-14-1z" fill="#C0483E" opacity="0.92"/>' +
        '<path d="M24 20c0-4 1-7 4-9" stroke="#8FE3B0" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="18.5" cy="27" rx="3.4" ry="5.2" fill="#F2C879" opacity="0.35"/>' +
        '</svg>'
    },
    book: {
      label: 'book',
      svg: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M24 14c-4-2.5-9-3-13-1.5v22c4-1.5 9-1 13 1.5 4-2.5 9-3 13-1.5v-22c-4-1.5-9-1-13 1.5z" fill="#F2C879" opacity="0.9"/>' +
        '<path d="M24 14v22" stroke="#12281f" stroke-width="1.4"/>' +
        '<path d="M14 17.5c2.6-1 5.6-1 8 .2M14 23c2.6-1 5.6-1 8 .2M14 28.5c2.6-1 5.6-1 8 .2" stroke="#12281f" stroke-width="1.2" stroke-linecap="round"/>' +
        '</svg>'
    },
    star: {
      label: 'star',
      svg: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M24 8l4.6 10.2 11.2 1.2-8.4 7.6 2.4 11-9.8-5.8-9.8 5.8 2.4-11-8.4-7.6 11.2-1.2z" fill="#8FE3B0" opacity="0.92"/>' +
        '</svg>'
    }
  };

  var SYMBOL_KEYS = Object.keys(SYMBOL_DEFS); // apple, book, star

  var flippedCards = [];
  var matchedCount = 0;
  var moveCount = 0;
  var boardLocked = false;

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = array[i];
      array[i] = array[j];
      array[j] = tmp;
    }
    return array;
  }

  function buildDeck() {
    var deck = SYMBOL_KEYS.concat(SYMBOL_KEYS); // 2 of each = 6 cards
    return shuffle(deck);
  }

  function renderGame() {
    gameGrid.innerHTML = '';
    flippedCards = [];
    matchedCount = 0;
    moveCount = 0;
    boardLocked = false;
    movesCountEl.textContent = '0';

    var deck = buildDeck();

    deck.forEach(function (symbolKey, index) {
      var def = SYMBOL_DEFS[symbolKey];

      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'game-card';
      card.setAttribute('data-symbol', symbolKey);
      card.setAttribute('data-index', String(index));
      card.setAttribute('aria-label', 'Face-down lesson card');
      card.setAttribute('aria-pressed', 'false');

      card.innerHTML =
        '<div class="game-card-inner">' +
          '<div class="game-card-face game-card-front"></div>' +
          '<div class="game-card-face game-card-back">' + def.svg + '</div>' +
        '</div>';

      card.addEventListener('click', function () {
        handleCardClick(card);
      });

      gameGrid.appendChild(card);
    });
  }

  function handleCardClick(card) {
    if (boardLocked) return;
    if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;
    if (flippedCards.length === 2) return;

    card.classList.add('is-flipped');
    card.setAttribute('aria-pressed', 'true');
    card.setAttribute('aria-label', 'Revealed ' + card.getAttribute('data-symbol') + ' card');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moveCount++;
      movesCountEl.textContent = String(moveCount);
      boardLocked = true;
      evaluatePair();
    }
  }

  function evaluatePair() {
    var first = flippedCards[0];
    var second = flippedCards[1];
    var isMatch = first.getAttribute('data-symbol') === second.getAttribute('data-symbol');

    if (isMatch) {
      setTimeout(function () {
        first.classList.add('is-matched');
        second.classList.add('is-matched');
        matchedCount += 2;
        flippedCards = [];
        boardLocked = false;

        if (matchedCount === SYMBOL_KEYS.length * 2) {
          handleGameComplete();
        }
      }, 350);
    } else {
      setTimeout(function () {
        first.classList.remove('is-flipped');
        second.classList.remove('is-flipped');
        first.setAttribute('aria-pressed', 'false');
        second.setAttribute('aria-pressed', 'false');
        first.setAttribute('aria-label', 'Face-down lesson card');
        second.setAttribute('aria-label', 'Face-down lesson card');
        flippedCards = [];
        boardLocked = false;
      }, 850);
    }
  }

  function handleGameComplete() {
    launchCelebrationParticles();
    setTimeout(function () {
      goToScene('surprise');
    }, 900);
  }

  shuffleBtn.addEventListener('click', function () {
    renderGame();
  });

  /* =========================================================
     ELEGANT CELEBRATION (small DOM particle burst, not confetti)
     ========================================================= */
  function launchCelebrationParticles() {
    if (prefersReducedMotion) return;
    var rect = gameGrid.getBoundingClientRect();
    var count = 18;

    for (var i = 0; i < count; i++) {
      var dot = document.createElement('div');
      dot.className = 'celebrate-particle';
      var x = rect.left + Math.random() * rect.width;
      var y = rect.top + Math.random() * rect.height;
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      dot.style.animationDelay = (Math.random() * 0.2) + 's';
      document.body.appendChild(dot);

      (function (el) {
        setTimeout(function () {
          el.remove();
        }, 1400);
      })(dot);
    }
  }

  /* =========================================================
     WATCH IT AGAIN — full state reset
     ========================================================= */
  var watchAgainBtn = document.getElementById('watchAgainBtn');
  watchAgainBtn.addEventListener('click', function () {
    if (isTransitioning) return;
    isTransitioning = true;

    var currentEl = document.getElementById(currentScene);
    var leaveDuration = prefersReducedMotion ? 0 : 350;

    currentEl.classList.add('is-leaving');

    setTimeout(function () {
      // Reset the scroll intro.
      scrollOpened = false;
      scrollTrigger.classList.remove('is-opening');

      // Reset the game board for the next playthrough.
      renderGame();

      // Swap to intro.
      currentEl.classList.remove('is-active', 'is-leaving');
      document.getElementById('intro').classList.add('is-active');
      currentScene = 'intro';
      isTransitioning = false;
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, leaveDuration);
  });

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    startParticles();
    renderGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   Learners Chess — Puzzles
   Standalone puzzle player: four levels, five puzzles each.
   Play the winning line on the board; the opponent's replies are
   played for you. Progress is kept in this browser.
   ============================================================ */
(function () {
  'use strict';

  var C = window.Chess;
  var PUZZLES = window.CHESS_PUZZLES || [];
  var STORAGE_KEY = 'learners-chess-puzzles.progress';
  var GLYPH = { 1: '\u265F', 2: '\u265E', 3: '\u265D', 4: '\u265C', 5: '\u265B', 6: '\u265A' };
  var $ = function (id) { return document.getElementById(id); };

  var boardEl = $('board');
  var statusEl = $('status');
  var levelsEl = $('levels');
  var promoModal = $('promo-modal');
  var promoRow = $('promo-row');

  var solved = {};          // puzzle id -> true
  var level = 1;
  var idx = 0;
  var puzzle = null;
  var game = null;
  var player = 1;           // the solver's colour: 1 white, -1 black
  var flipped = false;
  var sqEls = [];
  var selected = -1;
  var moves = [];
  var last = null;
  var phase = 'player';     // player | done
  var lineIdx = 0;
  var busy = false;
  var pendingPromo = null;
  var hintSq = -1;

  init();

  function init() {
    loadProgress();
    buildLevelTabs();
    bindEvents();
    var first = firstUnsolved(1);
    loadPuzzle(1, first < 0 ? 0 : first);
  }

  // ---------- progress ----------
  function loadProgress() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.solved) solved = p.solved; }
    } catch (e) { /* storage unavailable */ }
  }
  function saveProgress() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ solved: solved })); } catch (e) { /* ignore */ }
  }
  function solvedCount() { return PUZZLES.filter(function (p) { return solved[p.id]; }).length; }
  function puzzlesAtLevel(n) { return PUZZLES.filter(function (p) { return p.level === n; }); }
  function firstUnsolved(n) {
    var list = puzzlesAtLevel(n);
    for (var i = 0; i < list.length; i++) if (!solved[list[i].id]) return i;
    return -1;
  }

  // ---------- level tabs ----------
  function buildLevelTabs() {
    levelsEl.innerHTML = '';
    for (var n = 1; n <= 4; n++) {
      var b = document.createElement('button');
      b.className = 'level-tab';
      b.setAttribute('data-level', String(n));
      b.innerHTML = 'Level ' + n + ' <b data-count="' + n + '">0/5</b>';
      levelsEl.appendChild(b);
    }
    levelsEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var n = +b.getAttribute('data-level');
      var i = firstUnsolved(n);
      loadPuzzle(n, i < 0 ? 0 : i);
    });
  }

  function renderLevelTabs() {
    var btns = levelsEl.querySelectorAll('.level-tab');
    for (var i = 0; i < btns.length; i++) {
      var n = +btns[i].getAttribute('data-level');
      btns[i].classList.toggle('active', n === level);
      var list = puzzlesAtLevel(n);
      var done = list.filter(function (p) { return solved[p.id]; }).length;
      var badge = btns[i].querySelector('[data-count]');
      if (badge) badge.textContent = done + '/' + list.length;
    }
    var total = PUZZLES.length;
    var done = solvedCount();
    $('overall-count').textContent = done + ' / ' + total + ' solved';
    setWidth('overall-bar', total ? (done / total) * 100 : 0);
  }

  function updateProgressUI() {
    var list = puzzlesAtLevel(level);
    var done = list.filter(function (p) { return solved[p.id]; }).length;
    $('level-progress-text').textContent = done + ' of ' + list.length + ' solved';
    setWidth('level-bar', list.length ? (done / list.length) * 100 : 0);
  }

  function setWidth(id, pct) {
    var el = $(id);
    if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  // ---------- board ----------
  function buildBoard() {
    boardEl.innerHTML = '';
    sqEls = new Array(64);
    for (var v = 0; v < 64; v++) {
      var sq = flipped ? 63 - v : v;
      var row = v >> 3, col = v & 7;
      var el = document.createElement('div');
      el.className = 'square ' + (((row + col) % 2 === 0) ? 'light' : 'dark');
      el.dataset.sq = sq;
      if (col === 0) {
        var r = document.createElement('span');
        r.className = 'coord rank'; r.textContent = 8 - (sq >> 3);   // label the real square, so a flipped board stays correct
        el.appendChild(r);
      }
      if (row === 7) {
        var f = document.createElement('span');
        f.className = 'coord file'; f.textContent = 'abcdefgh'[sq & 7];
        el.appendChild(f);
      }
      boardEl.appendChild(el);
      sqEls[sq] = el;
    }
    resizeBoard();
  }

  function resizeBoard() {
    var rect = boardEl.getBoundingClientRect();
    if (rect.width > 0) boardEl.style.fontSize = (rect.width / 8) * 0.78 + 'px';
  }
  window.addEventListener('resize', resizeBoard);

  function renderPieces() {
    if (!game) return;
    for (var sq = 0; sq < 64; sq++) {
      var el = sqEls[sq];
      if (!el) continue;
      var old = el.querySelector('.piece');
      if (old) old.remove();
      var p = game.state.board[sq];
      if (p) {
        var s = document.createElement('span');
        s.className = 'piece ' + (p > 0 ? 'white' : 'black');
        s.textContent = GLYPH[Math.abs(p)];
        el.appendChild(s);
      }
    }
  }

  function renderHighlights() {
    for (var sq = 0; sq < 64; sq++) {
      var el = sqEls[sq];
      if (!el) continue;
      el.classList.remove('selected', 'dot', 'capturable', 'last-from', 'last-to', 'check', 'hint-from', 'hint-to');
      el.removeAttribute('data-movable');
    }
    if (!game) return;
    if (last) {
      sqEls[last.from].classList.add('last-from');
      sqEls[last.to].classList.add('last-to');
    }
    if (selected >= 0) {
      sqEls[selected].classList.add('selected');
      for (var i = 0; i < moves.length; i++) {
        sqEls[moves[i].to].classList.add(moves[i].captured || moves[i].flags === 'e' ? 'capturable' : 'dot');
      }
    }
    if (hintSq >= 0) sqEls[hintSq].classList.add('hint-from');
    if (game.inCheck()) sqEls[game.state.kings[game.state.turn > 0 ? 0 : 1]].classList.add('check');
    if (phase === 'player' && !busy && game.state.turn === player) {
      var all = game.moves();
      for (var j = 0; j < all.length; j++) sqEls[all[j].from].setAttribute('data-movable', '1');
    }
  }

  // ---------- puzzle flow ----------
  function loadPuzzle(n, i) {
    var list = puzzlesAtLevel(n);
    if (!list.length) return;
    level = n;
    idx = ((i % list.length) + list.length) % list.length;
    puzzle = list[idx];
    game = new C.Game(puzzle.fen);
    player = puzzle.player === 'b' ? -1 : 1;
    flipped = player === -1;
    selected = -1; moves = []; last = null; hintSq = -1;
    lineIdx = 0; busy = false; phase = 'player';

    $('puzzle-level').textContent = 'Level ' + puzzle.level;
    $('puzzle-theme').textContent = puzzle.theme;
    $('puzzle-note').textContent = puzzle.note || '';
    $('puzzle-source').textContent = puzzle.source || '';
    $('puzzle-index').textContent = (idx + 1) + ' / ' + list.length;
    $('btn-next').disabled = true;

    renderLevelTabs();
    updateProgressUI();
    buildBoard();
    renderPieces();
    renderHighlights();

    var side = player === 1 ? 'White' : 'Black';
    if (solved[puzzle.id]) status('Already solved \u2014 replay it if you like', 'solved');
    else status(side + ' to move \u2014 play the winning line');

    // a 'line' puzzle can start with the opponent to move: play their move first
    if (game.state.turn !== player) {
      busy = true;
      status('Opponent plays \u2014 watch', 'good');
      setTimeout(function () {
        opponentReply();
        busy = false;
        if (lineIdx >= puzzle.line.length) { solvePuzzle(); return; }
        status(side + ' to move \u2014 play the winning line');
        renderPieces(); renderHighlights();
      }, 650);
    }
  }

  function onSquare(sq) {
    if (!game || phase !== 'player' || busy) return;
    if (game.state.turn !== player) return;
    if (selected >= 0 && moves.some(function (m) { return m.to === sq; })) {
      tryMove(selected, sq);
      return;
    }
    var p = game.state.board[sq];
    if (p && (p > 0) === (player > 0)) {
      selected = sq;
      moves = game.moves(sq);
      hintSq = -1;
    } else {
      selected = -1;
      moves = [];
    }
    renderHighlights();
  }

  function tryMove(from, to) {
    var cands = game.moves().filter(function (m) { return m.from === from && m.to === to; });
    if (!cands.length) return;
    if (cands.length > 1 && cands[0].promotion) {
      pendingPromo = { from: from, to: to };
      openPromo();
      return;
    }
    doMove(from, to, cands[0].promotion || 0);
  }

  function doMove(from, to, promo) {
    game.move(from, to, promo);
    last = { from: from, to: to };
    selected = -1; moves = []; hintSq = -1;
    renderPieces(); renderHighlights();

    var hist = game.state.history;
    var played = hist[hist.length - 1].move.san;
    if (played !== puzzle.line[lineIdx]) { wrongMove(); return; }

    lineIdx++;
    if (lineIdx >= puzzle.line.length) { solvePuzzle(); return; }
    busy = true;
    status('Correct \u2014 keep going', 'good');
    setTimeout(function () {
      opponentReply();
      busy = false;
      if (lineIdx >= puzzle.line.length) { solvePuzzle(); return; }
      status('Your move \u2014 keep going', 'good');
      renderPieces(); renderHighlights();
    }, 420);
  }

  function opponentReply() {
    var san = puzzle.line[lineIdx];
    if (!san) return;
    var all = game.moves();
    for (var i = 0; i < all.length; i++) {
      var m = all[i];
      game.move(m.from, m.to, m.promotion || 0);
      var hist = game.state.history;
      var got = hist[hist.length - 1].move.san;
      game.undo();
      if (got === san) {
        game.move(m.from, m.to, m.promotion || 0);
        last = { from: m.from, to: m.to };
        lineIdx++;
        renderPieces(); renderHighlights();
        return;
      }
    }
  }

  function wrongMove() {
    game.undo();
    last = null; selected = -1; moves = [];
    renderPieces(); renderHighlights();
    status('Not the move \u2014 try again', 'wrong');
    boardEl.classList.add('shake');
    setTimeout(function () { boardEl.classList.remove('shake'); }, 320);
  }

  function solvePuzzle() {
    phase = 'done';
    var already = !!solved[puzzle.id];
    if (!already) { solved[puzzle.id] = true; saveProgress(); }
    status(already ? 'Solved again \u2014 nice' : 'Solved!', 'solved');
    renderLevelTabs(); updateProgressUI();
    $('btn-next').disabled = false;
    renderHighlights();
  }

  function nextPuzzle() {
    var list = puzzlesAtLevel(level);
    var i = firstUnsolved(level);
    if (i < 0) {
      // the level is complete: move to the next level that still has work, else stay
      var n = level;
      for (var k = 1; k <= 4; k++) {
        var cand = ((level - 1 + k) % 4) + 1;
        if (firstUnsolved(cand) >= 0) { n = cand; break; }
      }
      loadPuzzle(n, firstUnsolved(n) < 0 ? 0 : firstUnsolved(n));
      return;
    }
    if (i === idx && list.length > 1) i = (idx + 1) % list.length;
    loadPuzzle(level, i);
  }

  function resetPuzzle() {
    if (!puzzle) return;
    loadPuzzle(level, idx);
  }

  function hint() {
    if (!game || phase !== 'player' || busy) return;
    var san = puzzle.line[lineIdx];
    if (!san) return;
    var all = game.moves();
    for (var i = 0; i < all.length; i++) {
      var m = all[i];
      game.move(m.from, m.to, m.promotion || 0);
      var hist = game.state.history;
      var got = hist[hist.length - 1].move.san;
      game.undo();
      if (got === san) {
        hintSq = m.from;
        renderHighlights();
        status('The highlighted piece makes the key move', 'good');
        return;
      }
    }
  }

  function status(msg, cls) {
    statusEl.className = 'status' + (cls ? ' ' + cls : '');
    statusEl.textContent = msg;
  }

  // ---------- promotion ----------
  function openPromo() {
    var color = player === 1 ? 'white' : 'black';
    promoRow.innerHTML = '';
    [5, 4, 3, 2].forEach(function (type) {
      var b = document.createElement('button');
      b.className = 'promo-btn ' + (color === 'white' ? 'white-piece' : 'black-piece');
      b.textContent = GLYPH[type];
      b.title = { 5: 'Queen', 4: 'Rook', 3: 'Bishop', 2: 'Knight' }[type];
      b.addEventListener('click', function () {
        promoModal.classList.add('hidden');
        if (pendingPromo) {
          var from = pendingPromo.from, to = pendingPromo.to;
          pendingPromo = null;
          doMove(from, to, type);
        }
      });
      promoRow.appendChild(b);
    });
    promoModal.classList.remove('hidden');
  }

  // ---------- events ----------
  function bindEvents() {
    boardEl.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var sqEl = e.target.closest ? e.target.closest('.square') : null;
      if (!sqEl) return;
      onSquare(+sqEl.dataset.sq);
    });
    $('btn-next').addEventListener('click', nextPuzzle);
    $('btn-reset').addEventListener('click', resetPuzzle);
    $('btn-hint').addEventListener('click', hint);
    $('btn-promo-cancel').addEventListener('click', function () {
      promoModal.classList.add('hidden');
      pendingPromo = null;
      selected = -1; moves = [];
      renderHighlights();
    });
  }
})();

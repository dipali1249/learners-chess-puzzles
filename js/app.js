/* ============================================================
   Learners Chess — Training
   Three modes over one board:
     practice  puzzles in four levels
     topics    the same set filtered by theme (calculation,
               endgames, sacrifices, quiet moves) as a session
     guess     replay a game, guess the moves, score the accuracy
   Plus a Monday/Thursday assignment with points and a streak, and an
   optional blindfold drill. Everything is kept in this browser.
   ============================================================ */
(function () {
  'use strict';

  var C = window.Chess;
  var PUZZLES = window.CHESS_PUZZLES || [];
  var GAMES = window.CHESS_GAMES || [];
  var KEY = 'learners-chess-puzzles.progress';        // { solved: {id:true} }
  var TKEY = 'learners-chess-puzzles.training';       // { points, streak, lastDone, days }
  var GLYPH = { 1: '\u265F', 2: '\u265E', 3: '\u265D', 4: '\u265C', 5: '\u265B', 6: '\u265A' };
  var GLYPH_WHITE = { 1: '\u2659', 2: '\u2658', 3: '\u2657', 4: '\u2656', 5: '\u2655', 6: '\u2654' };
  var $ = function (id) { return document.getElementById(id); };

  var TOPICS = [
    { id: 'calculation', label: 'Calculation' },
    { id: 'endgame', label: 'Few pieces' },
    { id: 'sacrifice', label: 'Sacrifices' },
    { id: 'quiet', label: 'Quiet moves' }
  ];
  var POINTS_PER_PUZZLE = 10;
  var POINTS_FOR_SET = 50;

  var boardEl = $('board');
  var statusEl = $('status');
  var levelsEl = $('levels');
  var topicsEl = $('topics');
  var gamesEl = $('games');
  var modesEl = $('modes');
  var promoModal = $('promo-modal');
  var promoRow = $('promo-row');

  var solved = {};
  var training = { points: 0, streak: 0, lastDone: null, days: {} };

  var game = null;
  var player = 1;
  var flipped = false;
  var sqEls = [];
  var selected = -1;
  var moves = [];
  var last = null;
  var busy = false;
  var pendingPromo = null;
  var hintSq = -1;

  var mode = 'practice';
  var list = [];
  var listLabel = 'Level 1';
  var listKind = 'level';        // level | topic | today | game
  var idx = 0;
  var puzzle = null;
  var phase = 'player';
  var lineIdx = 0;

  var guessGame = null;
  var guessIdx = 0;
  var guessTotal = 0;
  var guessHits = 0;

  var blind = false;
  var blindTimer = 0;

  var tagCache = {};

  init();

  function init() {
    loadProgress();
    buildModes();
    buildLevelTabs();
    buildTopicTabs();
    buildGameTabs();
    bindEvents();
    renderToday();
    openPractice(1);
  }

  // ---------- storage ----------
  function loadProgress() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (p && p.solved) solved = p.solved; }
    } catch (e) { /* storage unavailable */ }
    try {
      var raw2 = window.localStorage.getItem(TKEY);
      if (raw2) {
        var t = JSON.parse(raw2);
        if (t) {
          training.points = Number(t.points) || 0;
          training.streak = Number(t.streak) || 0;
          training.lastDone = t.lastDone || null;
          training.days = t.days || {};
        }
      }
    } catch (e2) { /* storage unavailable */ }
  }
  function saveProgress() {
    try { window.localStorage.setItem(KEY, JSON.stringify({ solved: solved })); } catch (e) { /* ignore */ }
    try { window.localStorage.setItem(TKEY, JSON.stringify(training)); } catch (e2) { /* ignore */ }
  }

  function solvedCount() { return PUZZLES.filter(function (p) { return solved[p.id]; }).length; }

  // ---------- puzzle topics, derived from each solution line ----------
  function findSan(g, san) {
    var all = g.moves();
    for (var i = 0; i < all.length; i++) {
      var m = all[i];
      g.move(m.from, m.to, m.promotion || 0);
      var h = g.state.history;
      var got = h[h.length - 1].move.san;
      g.undo();
      if (got === san) return m;
    }
    return null;
  }

  function tagsOf(p) {
    if (tagCache[p.id]) return tagCache[p.id];
    var tags = [];
    var g = new C.Game(p.fen);
    var solver = p.player === 'b' ? -1 : 1;
    var pieces = 0, i;
    for (i = 0; i < 64; i++) if (g.state.board[i]) pieces++;
    var sacrificed = false, quiet = false, solverTo = -1;
    for (var k = 0; k < p.line.length; k++) {
      var mv = findSan(g, p.line[k]);
      if (!mv) break;
      var isSolver = g.state.turn === solver;
      var captured = mv.captured;
      g.move(mv.from, mv.to, mv.promotion || 0);
      if (isSolver) {
        var givesCheck = g.inCheck();
        if (!captured && !givesCheck && k < p.line.length - 1) quiet = true;
        solverTo = mv.to;
      } else if (solverTo >= 0 && mv.to === solverTo && captured) {
        sacrificed = true;
      }
    }
    if (p.line.length >= 3) tags.push('calculation');
    if (pieces <= 18) tags.push('endgame');   // the sparse boards
    if (sacrificed) tags.push('sacrifice');
    if (quiet) tags.push('quiet');
    tagCache[p.id] = tags;
    return tags;
  }

  function puzzlesWithTag(tag) {
    return PUZZLES.filter(function (p) { return tagsOf(p).indexOf(tag) >= 0; })
      .sort(function (a, b) { return a.level - b.level; })
      .slice(0, 10);
  }

  // ---------- the assignment (Monday and Thursday) ----------
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function assignmentKey(from) {
    var x = new Date(from.getTime());
    for (var i = 0; i < 7; i++) {
      var day = x.getDay();                       // 0 Sun .. 6 Sat
      if (day === 1 || day === 4) return dayKey(x);
      x.setDate(x.getDate() - 1);
    }
    return dayKey(from);
  }
  function prevAssignmentKey(key) {
    var d = new Date(key + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    return assignmentKey(d);
  }
  function seededSet(key, n) {
    var seed = 0, i;
    for (i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
    var arr = PUZZLES.slice();
    for (i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      var k = seed % (i + 1);
      var t = arr[i]; arr[i] = arr[k]; arr[k] = t;
    }
    return arr.slice(0, n);
  }
  function todaySet() {
    var key = assignmentKey(new Date());
    return { key: key, list: seededSet(key, 10) };
  }
  function setSolvedCount(setList) {
    return setList.filter(function (p) { return solved[p.id]; }).length;
  }

  function renderToday() {
    var set = todaySet();
    var done = setSolvedCount(set.list);
    var complete = !!training.days[set.key];
    var dayName = new Date(set.key + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long' });
    $('today-title').textContent = dayName + "'s set \u2014 " + set.list.length + ' positions';
    $('today-note').textContent = complete
      ? 'Done \u2014 ' + done + ' of ' + set.list.length + ' solved. Next set on the next Monday or Thursday.'
      : done + ' of ' + set.list.length + ' solved' + (done ? ' \u2014 keep going' : '');
    $('today-points').textContent = String(training.points);
    $('today-streak').textContent = String(training.streak);
    $('btn-today').textContent = done > 0 && !complete ? 'Continue' : (complete ? 'Replay' : 'Start');
  }

  // ---------- nav ----------
  function buildModes() {
    modesEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      setMode(b.getAttribute('data-mode'));
    });
  }
  function setMode(m) {
    mode = m;
    var tabs = modesEl.querySelectorAll('.mode-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-mode') === m);
    }
    levelsEl.classList.toggle('hidden', m !== 'practice');
    topicsEl.classList.toggle('hidden', m !== 'topics');
    gamesEl.classList.toggle('hidden', m !== 'guess');
    $('btn-hint').classList.toggle('hidden', m === 'guess');
    $('btn-blind').classList.toggle('hidden', m === 'guess');
    document.querySelector('.actions').classList.toggle('guess', m === 'guess');
    setBlind(false);
    if (m === 'practice') openPractice(1);
    else if (m === 'topics') openTopic(TOPICS[0].id);
    else openGame(0);
  }

  function buildLevelTabs() {
    levelsEl.innerHTML = '';
    for (var n = 1; n <= 4; n++) {
      var b = document.createElement('button');
      b.className = 'level-tab';
      b.setAttribute('data-level', String(n));
      b.innerHTML = 'Level ' + n + ' <b data-count="' + n + '">0/0</b>';
      levelsEl.appendChild(b);
    }
    levelsEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      openPractice(+b.getAttribute('data-level'));
    });
  }

  function buildTopicTabs() {
    topicsEl.innerHTML = '';
    TOPICS.forEach(function (t) {
      var b = document.createElement('button');
      b.className = 'level-tab';
      b.setAttribute('data-topic', t.id);
      b.innerHTML = t.label + ' <b data-tcount="' + t.id + '">0</b>';
      topicsEl.appendChild(b);
    });
    topicsEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      openTopic(b.getAttribute('data-topic'));
    });
  }

  function buildGameTabs() {
    gamesEl.innerHTML = '';
    GAMES.forEach(function (g, i) {
      var b = document.createElement('button');
      b.className = 'level-tab';
      b.setAttribute('data-game', String(i));
      b.textContent = g.name;
      gamesEl.appendChild(b);
    });
    gamesEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      openGame(+b.getAttribute('data-game'));
    });
  }

  function renderTabs() {
    var btns = levelsEl.querySelectorAll('.level-tab');
    for (var i = 0; i < btns.length; i++) {
      var n = +btns[i].getAttribute('data-level');
      btns[i].classList.toggle('active', listKind === 'level' && n === puzzleLevel());
      var l = PUZZLES.filter(function (p) { return p.level === n; });
      var done = l.filter(function (p) { return solved[p.id]; }).length;
      var badge = btns[i].querySelector('[data-count]');
      if (badge) badge.textContent = done + '/' + l.length;
    }
    var tb = topicsEl.querySelectorAll('.level-tab');
    for (var j = 0; j < tb.length; j++) {
      var tid = tb[j].getAttribute('data-topic');
      tb[j].classList.toggle('active', listKind === 'topic' && listLabel === topicLabel(tid));
      var bd = tb[j].querySelector('[data-tcount]');
      if (bd) bd.textContent = String(puzzlesWithTag(tid).length);
    }
    var gb = gamesEl.querySelectorAll('.level-tab');
    for (var k = 0; k < gb.length; k++) {
      gb[k].classList.toggle('active', listKind === 'game' && +gb[k].getAttribute('data-game') === idx);
    }
    var total = PUZZLES.length, doneAll = solvedCount();
    $('overall-count').textContent = doneAll + ' / ' + total + ' solved';
    setWidth('overall-bar', total ? (doneAll / total) * 100 : 0);
  }

  function topicLabel(id) {
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].id === id) return TOPICS[i].label;
    return id;
  }
  function puzzleLevel() { return puzzle ? puzzle.level : 1; }

  function setWidth(id, pct) {
    var el = $(id);
    if (el) el.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function renderSessionProgress() {
    var done = list.filter(function (p) { return solved[p.id]; }).length;
    $('progress-label').textContent = listLabel + ' progress';
    $('level-progress-text').textContent = done + ' of ' + list.length + ' solved';
    setWidth('level-bar', list.length ? (done / list.length) * 100 : 0);
  }

  // ---------- opening a list ----------
  function openPractice(n) {
    list = PUZZLES.filter(function (p) { return p.level === n; });
    listKind = 'level';
    listLabel = 'Level ' + n;
    startList(0);
  }
  function openTopic(id) {
    list = puzzlesWithTag(id);
    listKind = 'topic';
    listLabel = topicLabel(id);
    if (!list.length) { status('No positions tagged ' + topicLabel(id) + ' yet', 'wrong'); return; }
    startList(0);
  }
  function openToday() {
    var set = todaySet();
    list = set.list;
    listKind = 'today';
    listLabel = "Today's set";
    startList(0);
  }

  function startList(i) {
    setModeKeepingList();
    idx = 0;
    loadPuzzle(i || 0);
  }
  function setModeKeepingList() {
    mode = 'practice';
    var tabs = modesEl.querySelectorAll('.mode-tab');
    for (var i = 0; i < tabs.length; i++) {
      var m = tabs[i].getAttribute('data-mode');
      tabs[i].classList.toggle('active', m === (listKind === 'topic' ? 'topics' : 'practice'));
    }
    levelsEl.classList.toggle('hidden', listKind !== 'level');
    topicsEl.classList.toggle('hidden', listKind !== 'topic');
    gamesEl.classList.add('hidden');
    $('btn-hint').classList.remove('hidden');
    $('btn-blind').classList.remove('hidden');
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
        r.className = 'coord rank';
        r.textContent = 8 - (sq >> 3);
        el.appendChild(r);
      }
      if (row === 7) {
        var f = document.createElement('span');
        f.className = 'coord file';
        f.textContent = 'abcdefgh'[sq & 7];
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
        s.textContent = (p > 0 ? GLYPH_WHITE : GLYPH)[Math.abs(p)];
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

  // ---------- blindfold ----------
  function setBlind(on) {
    blind = !!on;
    if (blindTimer) { clearTimeout(blindTimer); blindTimer = 0; }
    boardEl.classList.remove('hidden-pieces');
    $('blind-note').classList.add('hidden');
    $('btn-blind').textContent = 'Blindfold: ' + (blind ? 'on' : 'off');
    if (blind && mode !== 'guess' && game) {
      boardEl.classList.remove('hidden-pieces');
      blindTimer = setTimeout(function () {
        if (!blind) return;
        boardEl.classList.add('hidden-pieces');
        $('blind-note').classList.remove('hidden');
      }, 4000);
    }
  }
  function peek(ms) {
    if (!blind) return;
    boardEl.classList.remove('hidden-pieces');
    if (blindTimer) clearTimeout(blindTimer);
    blindTimer = setTimeout(function () {
      if (!blind) return;
      boardEl.classList.add('hidden-pieces');
      $('blind-note').classList.remove('hidden');
    }, ms || 2000);
  }

  // ---------- puzzle flow ----------
  function loadPuzzle(i) {
    if (!list.length) return;
    mode = 'practice';
    idx = ((i % list.length) + list.length) % list.length;
    puzzle = list[idx];
    game = new C.Game(puzzle.fen);
    player = puzzle.player === 'b' ? -1 : 1;
    flipped = player === -1;
    selected = -1; moves = []; last = null; hintSq = -1;
    lineIdx = 0; busy = false; phase = 'player';

    $('puzzle-level').textContent = listLabel;
    $('puzzle-theme').textContent = puzzle.theme;
    $('puzzle-note').textContent = puzzle.note || '';
    $('puzzle-source').textContent = puzzle.source || '';
    $('puzzle-index').textContent = (idx + 1) + ' / ' + list.length;
    $('btn-next').textContent = 'Next';
    $('btn-next').disabled = true;
    $('btn-reset').textContent = 'Reset';

    renderTabs();
    renderSessionProgress();
    buildBoard();
    renderPieces();
    renderHighlights();
    setBlind(blind);

    var side = player === 1 ? 'White' : 'Black';
    if (solved[puzzle.id]) status('Already solved \u2014 replay it if you like', 'solved');
    else status(side + ' to move \u2014 play the winning line');

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
    var m = findSan(game, san);
    if (!m) return;
    game.move(m.from, m.to, m.promotion || 0);
    last = { from: m.from, to: m.to };
    lineIdx++;
    renderPieces(); renderHighlights();
  }

  function wrongMove() {
    game.undo();
    last = null; selected = -1; moves = [];
    renderPieces(); renderHighlights();
    status('Not the move \u2014 try again', 'wrong');
    peek(2000);
    boardEl.classList.add('shake');
    setTimeout(function () { boardEl.classList.remove('shake'); }, 320);
  }

  function solvePuzzle() {
    phase = 'done';
    var already = !!solved[puzzle.id];
    if (!already) {
      solved[puzzle.id] = true;
      training.points += POINTS_PER_PUZZLE;
      saveProgress();
    }
    status(already ? 'Solved again \u2014 nice' : 'Solved!  +' + POINTS_PER_PUZZLE + ' points', 'solved');
    renderTabs(); renderSessionProgress();
    $('btn-next').disabled = false;
    renderHighlights();
    completeSetIfDone();
    renderToday();
  }

  function completeSetIfDone() {
    if (listKind !== 'today') return;
    var set = todaySet();
    var done = setSolvedCount(set.list);
    if (done < set.list.length) return;
    if (training.days[set.key]) return;
    training.days[set.key] = true;
    training.points += POINTS_FOR_SET;
    training.streak = (training.lastDone === prevAssignmentKey(set.key)) ? training.streak + 1 : 1;
    training.lastDone = set.key;
    saveProgress();
    status('Set complete!  +' + POINTS_FOR_SET + ' bonus points \u2014 streak ' + training.streak, 'solved');
  }

  function nextPuzzle() {
    if (mode === 'guess') { finishGuess(); return; }
    if (!list.length) return;
    var i = -1;
    for (var k = 1; k <= list.length; k++) {
      var cand = (idx + k) % list.length;
      if (!solved[list[cand].id]) { i = cand; break; }
    }
    if (i < 0) i = (idx + 1) % list.length;
    loadPuzzle(i);
  }

  function resetPuzzle() {
    if (mode === 'guess') { openGame(idx); return; }
    if (!puzzle) return;
    loadPuzzle(idx);
  }

  function hint() {
    if (!game || mode === 'guess' || phase !== 'player' || busy) return;
    var san = puzzle.line[lineIdx];
    if (!san) return;
    var m = findSan(game, san);
    if (!m) return;
    hintSq = m.from;
    renderHighlights();
    status('The highlighted piece makes the key move', 'good');
    peek(1500);
  }

  function status(msg, cls) {
    statusEl.className = 'status' + (cls ? ' ' + cls : '');
    statusEl.textContent = msg;
  }

  // ---------- guess the move ----------
  function openGame(i) {
    if (!GAMES.length) return;
    mode = 'guess';
    listKind = 'game';
    idx = ((i % GAMES.length) + GAMES.length) % GAMES.length;
    guessGame = GAMES[idx];
    game = new C.Game();
    player = 1;
    flipped = false;
    selected = -1; moves = []; last = null; hintSq = -1;
    busy = false; phase = 'player';
    guessIdx = 0; guessTotal = 0; guessHits = 0;

    list = [];
    listLabel = guessGame.name;
    $('puzzle-level').textContent = guessGame.name;
    $('puzzle-theme').textContent = 'Guess the move';
    $('puzzle-note').textContent = guessGame.note || '';
    $('puzzle-source').textContent = 'Guess White\u2019s moves. The game\u2019s move is shown when you miss.';
    $('puzzle-index').textContent = guessGame.moves.length + ' plies';
    $('btn-next').textContent = 'Finish & score';
    $('btn-next').disabled = false;
    $('btn-reset').textContent = 'Restart';
    $('progress-label').textContent = 'Accuracy';
    $('level-progress-text').textContent = '\u2014';
    setWidth('level-bar', 0);

    renderTabs();
    buildBoard();
    renderPieces();
    renderHighlights();
    setBlind(false);
    status('Guess White\u2019s first move');
  }

  function guessAdvance() {
    if (!guessGame) return;
    if (guessIdx >= guessGame.moves.length) { finishGuess(); return; }
    if (game.state.turn === player) {
      phase = 'player';
      status('Your move \u2014 guess White\u2019s move (' + guessHits + ' of ' + guessTotal + ' so far)');
      renderHighlights();
      return;
    }
    phase = 'wait';
    busy = true;
    renderHighlights();
    setTimeout(function () {
      var m = findSan(game, guessGame.moves[guessIdx]);
      if (!m) { finishGuess(); return; }
      game.move(m.from, m.to, m.promotion || 0);
      last = { from: m.from, to: m.to };
      guessIdx++;
      busy = false;
      renderPieces(); renderHighlights();
      guessAdvance();
    }, 500);
  }

  function guessPlay(from, to) {
    var cands = game.moves().filter(function (m) { return m.from === from && m.to === to; });
    if (!cands.length) return;
    var mv = game.move(from, to, cands[0].promotion || 0);
    var played = game.state.history[game.state.history.length - 1].move.san;
    var want = guessGame.moves[guessIdx];
    guessTotal++;
    var hit = played === want;
    var moveNo = Math.floor(guessIdx / 2) + 1;
    if (hit) {
      guessHits++;
      last = { from: from, to: to };
      $('puzzle-source').textContent = 'Move ' + moveNo + ': spot on \u2014 ' + played;
      status('Spot on \u2014 ' + played, 'good');
    } else {
      game.undo();
      var m = findSan(game, want);
      if (m) { game.move(m.from, m.to, m.promotion || 0); last = { from: m.from, to: m.to }; }
      $('puzzle-source').textContent = 'Move ' + moveNo + ': the game played ' + want + ' \u2014 you guessed ' + played;
      status('The game played ' + want + ' (you: ' + played + ')', 'wrong');
    }
    guessIdx++;
    selected = -1; moves = [];
    renderPieces(); renderHighlights();
    var pct = guessTotal ? Math.round((guessHits / guessTotal) * 100) : 0;
    $('level-progress-text').textContent = guessHits + ' of ' + guessTotal + ' \u2014 ' + pct + '%';
    setWidth('level-bar', pct);
    busy = true;
    setTimeout(function () { busy = false; guessAdvance(); }, hit ? 350 : 750);
  }

  function finishGuess() {
    if (!guessGame) return;
    phase = 'done';
    var pct = guessTotal ? Math.round((guessHits / guessTotal) * 100) : 0;
    if (guessTotal) {
      training.points += guessHits * 5;
      saveProgress();
      renderToday();
    }
    status('You matched ' + guessHits + ' of ' + guessTotal + ' moves \u2014 ' + pct + '%', 'solved');
    $('level-progress-text').textContent = guessHits + ' of ' + guessTotal + ' \u2014 ' + pct + '%';
    setWidth('level-bar', pct);
    renderHighlights();
  }

  // ---------- promotion ----------
  function openPromo() {
    var color = player === 1 ? 'white' : 'black';
    promoRow.innerHTML = '';
    [5, 4, 3, 2].forEach(function (type) {
      var b = document.createElement('button');
      b.className = 'promo-btn ' + (color === 'white' ? 'white-piece' : 'black-piece');
      b.textContent = (player === 1 ? GLYPH_WHITE : GLYPH)[type];
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
      var sq = +sqEl.dataset.sq;
      if (mode === 'guess') {
        if (busy || phase !== 'player' || game.state.turn !== player) return;
        if (selected >= 0 && moves.some(function (m) { return m.to === sq; })) {
          guessPlay(selected, sq);
          return;
        }
        var gp = game.state.board[sq];
        if (gp && (gp > 0) === (player > 0)) { selected = sq; moves = game.moves(sq); }
        else { selected = -1; moves = []; }
        renderHighlights();
        return;
      }
      onSquare(sq);
    });
    $('btn-next').addEventListener('click', nextPuzzle);
    $('btn-reset').addEventListener('click', resetPuzzle);
    $('btn-hint').addEventListener('click', hint);
    $('btn-blind').addEventListener('click', function () { setBlind(!blind); });
    $('btn-today').addEventListener('click', openToday);
    $('btn-promo-cancel').addEventListener('click', function () {
      promoModal.classList.add('hidden');
      pendingPromo = null;
      selected = -1; moves = [];
      renderHighlights();
    });
  }
})();

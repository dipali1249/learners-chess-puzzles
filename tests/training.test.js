/* Checks the guess-the-move data and the topic derivation. */
'use strict';
const assert = require('assert');
const Chess = require('../js/engine.js');
const GAMES = require('../js/games.js');
const PUZZLES = require('../js/puzzles.js');

function playSan(g, san) {
  for (const m of g.moves()) {
    g.move(m.from, m.to, m.promotion || 0);
    const got = g.state.history[g.state.history.length - 1].move.san;
    g.undo();
    if (got === san) { g.move(m.from, m.to, m.promotion || 0); return true; }
  }
  return false;
}

// ---- guess-the-move games ----
assert.ok(GAMES.length >= 2, 'at least two games');
const openingNames = Chess.Openings.list.map(o => o.name);
for (const gm of GAMES) {
  assert.ok(gm.id && gm.name && Array.isArray(gm.moves), 'game has id, name, moves');
  assert.ok(gm.moves.length >= 40, gm.name + ' is long enough to guess through');
  const g = new Chess.Game();
  for (const san of gm.moves) assert.ok(playSan(g, san), gm.name + ': ' + san + ' is legal');
  assert.ok(openingNames.indexOf(gm.name) >= 0, gm.name + ' is a book opening');
}
console.log('guess-the-move games OK (' + GAMES.length + ' games, every move legal)');

// ---- topics derive from the solutions ----
function findSan(g, san) {
  for (const m of g.moves()) {
    g.move(m.from, m.to, m.promotion || 0);
    const got = g.state.history[g.state.history.length - 1].move.san;
    g.undo();
    if (got === san) return m;
  }
  return null;
}
function tagsOf(p) {
  const tags = [];
  const g = new Chess.Game(p.fen);
  const solver = p.player === 'b' ? -1 : 1;
  let pieces = 0, i;
  for (i = 0; i < 64; i++) if (g.state.board[i]) pieces++;
  let sacrificed = false, quiet = false, solverTo = -1;
  for (let k = 0; k < p.line.length; k++) {
    const mv = findSan(g, p.line[k]);
    if (!mv) break;
    const isSolver = g.state.turn === solver;
    const captured = mv.captured;
    g.move(mv.from, mv.to, mv.promotion || 0);
    if (isSolver) {
      if (!captured && !g.inCheck() && k < p.line.length - 1) quiet = true;
      solverTo = mv.to;
    } else if (solverTo >= 0 && mv.to === solverTo && captured) {
      sacrificed = true;
    }
  }
  if (p.line.length >= 3) tags.push('calculation');
  if (pieces <= 18) tags.push('endgame');
  if (sacrificed) tags.push('sacrifice');
  if (quiet) tags.push('quiet');
  return tags;
}
const counts = { calculation: 0, endgame: 0, sacrifice: 0, quiet: 0 };
for (const p of PUZZLES) for (const t of tagsOf(p)) counts[t]++;
for (const t of Object.keys(counts)) assert.ok(counts[t] >= 5, t + ' has a usable set (' + counts[t] + ')');
console.log('topics OK', JSON.stringify(counts));

console.log('\nAll training tests passed.');

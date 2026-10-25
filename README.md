# Learners Chess — puzzle set and training

The training side of [Learners Chess](https://github.com/dipali1249/chess-game):
72 puzzles in four levels, plus three ways to work through them — topic sets,
guess-the-move and a blindfold drill — with a Monday/Thursday assignment,
points and a streak.

Live at **[dipali1249.github.io/learners-chess-puzzles](https://dipali1249.github.io/learners-chess-puzzles/)**.

## Layout

```
js/puzzles.js          # the puzzle set (UMD — exposes window.CHESS_PUZZLES)
js/games.js            # guess-the-move games (UMD — exposes window.CHESS_GAMES)
js/engine.js           # a vendored copy of the game's engine
js/app.js              # the training app: modes, assignment, points, streak
tests/puzzles.test.js  # re-checks the structure and plays every solution line
tests/training.test.js # replays every guess-the-move game and re-derives the topics
index.html             # the standalone training page
```

## Run the validators

```bash
node tests/puzzles.test.js
node tests/training.test.js
```

## Modes

**Puzzles** — the four levels, each a difficulty tier:

- **level 1** — mate in one, lighter positions
- **level 2** — mate in one, heavier positions
- **level 3** — mate in two, lighter positions
- **level 4** — mate in two, heavier positions

**Topics** — the same set re-filtered by what the solution actually does. The tags
are derived from each line, not hand-labelled, so they stay true if the set changes:
`calculation` (a line of three plies or more), `sacrifice` (the solver gives a piece
that is taken back), `quiet` (a non-capture, non-check move before the finish) and
`few pieces` (18 or fewer on the board — the closest thing this set has to endgames).

**Guess the move** — replay a game and guess White's moves. A guess that matches the
game scores; a miss shows what was actually played and the move continues from there.
Accuracy and points are tallied as you go. Each game opens with a book line and
continues as engine self-play, so every move is legal — the validator replays all of
them on every run.

**Blindfold** — turn it on and the pieces are shown for four seconds, then hidden.
Play the solution from memory; a wrong move flashes the position back. Works in the
puzzle and topic modes.

## Assignment, points and streak

A fresh assignment drops every **Monday and Thursday** (the most recent one stays
available in between). It is ten positions drawn from the whole set, chosen
deterministically from the date, so the same day always gives the same set. Solving a
position is worth **10 points**; finishing an assignment adds **50** and advances the
streak. Everything is kept in `localStorage` — no accounts, no server.

## Sources

Chess.com daily puzzles, Lichess puzzles (CC0), two classics from the connected
knowledge base (Martin Gardner's chess chapter), and mate puzzles **generated and
verified with the game's own engine** — each generated line is replayed by the
validator on every run, so the set is self-checking.

The guess-the-move games are engine self-play from a book opening, not master games.
Drop real PGNs into `js/games.js` to swap them in — the validator will check them.

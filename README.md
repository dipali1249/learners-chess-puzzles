# Learners Chess — puzzle set

The puzzle set for the [Learners Chess](https://github.com/dipali1249/chess-game)
game: 72 puzzles in four levels. Every puzzle is a real position with a solution
line.

## Layout

```
js/puzzles.js         # the puzzle set (UMD — exposes window.CHESS_PUZZLES)
js/engine.js          # a vendored copy of the game's engine, used to validate the set
tests/puzzles.test.js # re-checks the structure and plays every solution line
index.html            # the standalone puzzle player
```

## Run the validator

```bash
node tests/puzzles.test.js
```

## Levels

The four levels are difficulty tiers:

- **level 1** — mate in one, lighter positions
- **level 2** — mate in one, heavier positions
- **level 3** — mate in two, lighter positions
- **level 4** — mate in two, heavier positions

The first 20 puzzles were originally grouped by the game situation that used to
unlock them (base / queens exchanged / two pawns down / king in check).

## Sources

Chess.com daily puzzles, Lichess puzzles (CC0), two classics from the connected
knowledge base (Martin Gardner's chess chapter), and mate puzzles **generated and
verified with the game's own engine** — each generated line is replayed by the
validator on every run, so the set is self-checking.

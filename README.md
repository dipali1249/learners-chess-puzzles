# Learners Chess — puzzle set

The puzzle set for the [Learners Chess](https://github.com/dipali1249/chess-game) game:
20 puzzles in four levels, five per level. Every puzzle is a real position with a
solution line.

## Layout

```
js/puzzles.js         # the puzzle set (UMD — exposes window.CHESS_PUZZLES)
js/engine.js          # a vendored copy of the game's engine, used to validate the set
tests/puzzles.test.js # re-checks the structure and plays every solution line
```

## Run the validator

```bash
node tests/puzzles.test.js
```

## Levels

Each level unlocks as a match develops, and the highest unlocked level is used first:

- **level 1** — the base level, available from the opening
- **level 2** — unlocks once the queens are exchanged
- **level 3** — unlocks when the player is two pawns down (material)
- **level 4** — unlocks while the player's king is in check

Sources: Chess.com daily puzzles, Lichess puzzles (CC0), and two classics from the
connected knowledge base (Martin Gardner's chess chapter).

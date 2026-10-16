/* Learners Chess — puzzle set: 72 puzzles in four levels.

   Levels are difficulty tiers:
     level 1  mate in one, lighter positions
     level 2  mate in one, heavier positions
     level 3  mate in two, lighter positions
     level 4  mate in two, heavier positions
   The first 20 were grouped by the game situation that used to unlock them
   (base / queens exchanged / two pawns down / king in check).

   kind:     "line"     — play the solution on the board.
   player:   the colour the solver plays (the opponent's replies are played
             for them if the puzzle starts on the other side).
   line:     the reference solution in SAN.

   Sources: Chess.com daily puzzles, Lichess puzzles (CC0), two classics from the
   connected knowledge base (Martin Gardner's chess chapter), and mate puzzles
   generated and verified with the game's own engine.
   tests/puzzles.test.js re-checks every line on each run. */
(function (global) {
  'use strict';

  var PUZZLES = [
    {
      "level": 1,
      "id": "L1a",
      "theme": "Discovering Victory",
      "source": "Chess.com daily puzzle — 2025-05-12",
      "kind": "line",
      "fen": "8/p5b1/q2k2p1/3P1b2/PRP2P1p/B6P/4r1P1/7K w - - 0 1",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Rb7#"
      ]
    },
    {
      "level": 1,
      "id": "L1b",
      "theme": "Mate in 1",
      "source": "Chess.com daily puzzle — 2012-05-06",
      "kind": "line",
      "fen": "r1bqkb1r/ppp2ppp/3p4/3Bp3/3nP3/5Q2/PPPP1PPP/R1B1K1NR w KQkq - 0 1",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qxf7#"
      ]
    },
    {
      "level": 1,
      "id": "L1c",
      "theme": "Underpromotion",
      "source": "Chess.com daily puzzle — 2011-02-06",
      "kind": "line",
      "fen": "bb6/k1P5/nnPpp3/p1Br1pNN/p2r1pR1/3qp1PP/6K1/6RQ w - - 0 1",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one, but not with a queen.",
      "line": [
        "c8=N#"
      ]
    },
    {
      "level": 1,
      "id": "L1d",
      "theme": "Back-rank finish",
      "source": "Lichess puzzle oY29r (rating 1078)",
      "kind": "line",
      "fen": "R7/2p4k/6p1/3B1ppp/3b4/4qP2/1PP1Q1PP/5K2 b - - 1 25",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qg1#"
      ]
    },
    {
      "level": 1,
      "id": "L1e",
      "theme": "Fork the king and rook",
      "source": "Lichess puzzle csSfA (rating 1139)",
      "kind": "line",
      "fen": "r1q1k2r/1b2bp1p/pp3n2/1N2Q3/3p4/3P3P/PPP2PP1/R3KB1R w KQkq - 1 16",
      "player": "w",
      "note": "White to play — win material with a check.",
      "line": [
        "Nd6+",
        "Kf8",
        "Nxc8"
      ]
    },
    {
      "level": 2,
      "id": "L2a",
      "theme": "Order of Capture",
      "source": "Chess.com daily puzzle — 2010-03-16",
      "kind": "line",
      "fen": "2r2rk1/Bpnbppbp/2np2p1/3N4/2P1P3/1P4PP/P1N2PB1/3RR1K1 b - - 0 1",
      "player": "b",
      "note": "Black to play — the captures only work in one order.",
      "line": [
        "Nxd5",
        "exd5",
        "Nxa7"
      ]
    },
    {
      "level": 2,
      "id": "L2b",
      "theme": "Where Did Everybody Go?",
      "source": "Chess.com daily puzzle — 2026-09-01",
      "kind": "line",
      "fen": "rnb1k2r/ppp2pp1/3qp2p/8/1b1P4/2B3P1/PP2PPBP/R2QK1NR w KQkq - 0 1",
      "player": "w",
      "note": "White to play — a forcing sequence of trades that wins a piece.",
      "line": [
        "Qa4+",
        "Nc6",
        "Bxc6+",
        "Qxc6",
        "Qxc6+",
        "bxc6",
        "Bxb4"
      ]
    },
    {
      "level": 2,
      "id": "L2c",
      "theme": "Showtime!",
      "source": "Chess.com daily puzzle — 2025-09-26",
      "kind": "line",
      "fen": "1n3rk1/3pQ1pb/2p4p/4N2r/1R1Bq2P/8/5PP1/6K1 w - - 0 1",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — a forcing sequence that finishes with mate.",
      "line": [
        "Qxf8+",
        "Kxf8",
        "Bc5+",
        "d6",
        "Bxd6+",
        "Ke8",
        "Rxb8#"
      ]
    },
    {
      "level": 2,
      "id": "L2d",
      "theme": "Take the loose rook",
      "source": "Lichess puzzle mJDcO (rating 1321)",
      "kind": "line",
      "fen": "5rk1/p1Q3pp/8/3p4/3q1R2/8/P1P3PP/R6K b - - 0 21",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — a short forced mate.",
      "line": [
        "Qxa1+",
        "Rf1",
        "Qxf1#"
      ]
    },
    {
      "level": 2,
      "id": "L2e",
      "theme": "White Wins",
      "source": "Chess.com daily puzzle — 2014-04-11",
      "kind": "line",
      "fen": "4r1k1/pb2r1pp/1ppq1p2/4N3/3PRP2/2P3P1/PPQ4P/4R1K1 w - - 0 1",
      "player": "w",
      "note": "White to play — a queen sacrifice opens the door.",
      "line": [
        "Qb3+",
        "Kf8",
        "Qf7+",
        "Rxf7",
        "Ng6+",
        "Kg8",
        "Rxe8+"
      ]
    },
    {
      "level": 3,
      "id": "L3a",
      "theme": "Thread the Needle",
      "source": "Chess.com daily puzzle — 2026-10-14",
      "kind": "line",
      "fen": "1q6/2p4k/1p5p/1P4p1/4rp2/2R5/6PP/2Q4K w - - 0 1",
      "player": "w",
      "note": "White to play — a quiet move sets up the win.",
      "line": [
        "Qb1",
        "Qa8",
        "Rc4",
        "Kg7",
        "Rxe4"
      ]
    },
    {
      "level": 3,
      "id": "L3b",
      "theme": "When Keres Attacks",
      "source": "Chess.com daily puzzle — 2022-01-07",
      "kind": "line",
      "fen": "1r2rk2/3b1pp1/p1p1p2p/q3P3/5Q1P/2NB2R1/PPP3P1/2K5 w - - 2 21",
      "player": "w",
      "note": "White to play — break through on the kingside.",
      "line": [
        "Rxg7",
        "Kxg7",
        "Qf6+",
        "Kg8",
        "Qxh6",
        "f5",
        "exf6"
      ]
    },
    {
      "level": 3,
      "id": "L3c",
      "theme": "X-ray attack",
      "source": "Lichess puzzle tewjc (rating 1493)",
      "kind": "line",
      "fen": "r5k1/Rp3p1p/2b2qp1/3pr3/8/4P2P/2PN1PP1/Q3K2R b K - 0 19",
      "player": "b",
      "note": "Black to play — the rook goes through the pawn.",
      "line": [
        "Rxe3+",
        "fxe3",
        "Qxa1+",
        "Rxa1",
        "Rxa1+"
      ]
    },
    {
      "level": 3,
      "id": "L3d",
      "theme": "Pin and win",
      "source": "Lichess puzzle 0kDWS (rating 1947)",
      "kind": "line",
      "fen": "1r6/1PN5/3p4/3nkpp1/1R6/P7/K1P5/8 w - - 1 50",
      "player": "w",
      "note": "White to play — convert the pawn with a pin.",
      "line": [
        "Rb5",
        "Rxb7",
        "Rxb7"
      ]
    },
    {
      "level": 3,
      "id": "L3e",
      "theme": "Mutilated Score Sheet",
      "source": "Martin Gardner, chess chapter — Problem 12.13",
      "kind": "line",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "player": "b",
      "endsInMate": true,
      "note": "White's moves survived on an 1897 score sheet; Black's were burned away. Reconstruct Black's four-move mate.",
      "line": [
        "f3",
        "e5",
        "Kf2",
        "Qf6",
        "Kg3",
        "Qxf3+",
        "Kh4",
        "Be7#"
      ]
    },
    {
      "level": 4,
      "id": "L4a",
      "theme": "Forcing the Opponent's Hand",
      "source": "Chess.com daily puzzle — 2009-03-07",
      "kind": "line",
      "fen": "7k/6pP/6P1/4p3/4Pp1p/1p2pPpP/1P2P1K1/2B3NQ w KQkq - 0 1",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — a long forced sequence ending in mate.",
      "line": [
        "Bxe3",
        "fxe3",
        "f4",
        "exf4",
        "Kf3",
        "g2",
        "Kxg2",
        "f3+",
        "exf3",
        "e2",
        "Qh2",
        "e1=Q",
        "Qb8#"
      ]
    },
    {
      "level": 4,
      "id": "L4b",
      "theme": "White to Draw",
      "source": "Chess.com daily puzzle — 2008-02-13",
      "kind": "line",
      "fen": "2k5/2P4K/1P3p2/6p1/6n1/8/5P2/8 w KQkq - 0 1",
      "player": "w",
      "note": "White to play — a study: find the saving line.",
      "line": [
        "f3",
        "Ne5",
        "Kg7",
        "Nxf3",
        "Kxf6",
        "g4",
        "Kf5",
        "g3",
        "Kg4",
        "g2",
        "Kh3",
        "g1=Q",
        "b7+",
        "Kxb7",
        "c8=Q+"
      ]
    },
    {
      "level": 4,
      "id": "L4c",
      "theme": "Skewer",
      "source": "Lichess puzzle sUNKR (rating 1827)",
      "kind": "line",
      "fen": "2RR4/5pk1/5n1q/pp6/5p2/1P4P1/PB3PKP/4r3 w - - 0 40",
      "player": "w",
      "note": "White to play — drive the king and win the queen.",
      "line": [
        "Rg8+",
        "Kh7",
        "Rh8+",
        "Kg6",
        "Rxh6+"
      ]
    },
    {
      "level": 4,
      "id": "L4d",
      "theme": "Eccentric Chess",
      "source": "Martin Gardner, chess chapter — Problem 12.8",
      "kind": "line",
      "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      "player": "w",
      "note": "Construct the game in which each side plays its knight four times — and both king's knights are captured on move four.",
      "line": [
        "Nf3",
        "d5",
        "Ne5",
        "Nf6",
        "Nc6",
        "Nfd7",
        "Nxb8",
        "Nxb8"
      ]
    },
    {
      "level": 4,
      "id": "L4e",
      "theme": "Fork on the back rank",
      "source": "Lichess puzzle Ciis7 (rating 1982)",
      "kind": "line",
      "fen": "2r5/2r2pk1/3qpnp1/pB1pN2p/Pn1P4/1QR1PPP1/4K1P1/2R5 b - - 1 1",
      "player": "b",
      "note": "Black to play — win material with a fork.",
      "line": [
        "Na2",
        "Rxc7",
        "Nxc1+",
        "Rxc1",
        "Rxc1"
      ]
    },
    {
      "level": 2,
      "id": "G01",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn2bbnr/pp3kp1/3p4/2p1ppqp/2P4P/1P1P1P2/P1RBP1P1/3QKBNR b K - 2 15",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qg3#"
      ]
    },
    {
      "level": 2,
      "id": "G02",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn1qkbnr/p1ppp1p1/bQ5p/5p2/1p2P3/N7/PP1P1PPP/R1B1KBNR w KQkq - 2 8",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qg6#"
      ]
    },
    {
      "level": 1,
      "id": "G03",
      "theme": "Mate in 1 — bishop",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1bk4/3p2br/p5p1/qpPp2Pp/3N2B1/8/PPPB2KP/3RQ2R w - - 7 27",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Bxa5#"
      ]
    },
    {
      "level": 2,
      "id": "G04",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn3bnr/p1pkpp1p/b2p2p1/Pp2q3/1B2P3/1P4PN/R1PPKP1P/3Q1B1R b - - 0 16",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxe4#"
      ]
    },
    {
      "level": 1,
      "id": "G05",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r3kbn1/1p3pp1/4p2r/p1pp4/2P1PNbq/N5P1/PP1nBPKP/R1BQ1R2 b q - 2 13",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxh2#"
      ]
    },
    {
      "level": 2,
      "id": "G06",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1nbqkbnr/rp1pp2p/5p2/p1p3B1/4P3/3P2P1/PPP2P1P/RN1QKBNR w KQk - 1 8",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qh5#"
      ]
    },
    {
      "level": 2,
      "id": "G07",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2rq1bnr/p1p1p1p1/5k1p/1p2Np2/1P1pQPP1/P1P4B/1B1PP2P/RN1K2R1 w - - 1 21",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qxf5#"
      ]
    },
    {
      "level": 1,
      "id": "G08",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2r2r2/1p1b1kbp/1qQ2p2/p3p1p1/2p1n3/NP5P/P2PBPK1/R1B3NR b - - 0 22",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxf2#"
      ]
    },
    {
      "level": 1,
      "id": "G09",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1k2b1r/p6p/2p1p3/7n/q2PNPpP/R5n1/3BR1N1/2Kb4 b - - 2 30",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qc2#"
      ]
    },
    {
      "level": 2,
      "id": "G10",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1kbnr/pppn1ppp/4p2B/3p4/7q/3P1PP1/PPPNP3/R2QKBNR b KQkq - 0 6",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxg3#"
      ]
    },
    {
      "level": 2,
      "id": "G11",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2bqkbn1/1pppp1p1/2n1rpr1/p7/2P1P1Q1/N2B3p/PP1PNPPP/1RB1K2R w - - 10 13",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qxg6#"
      ]
    },
    {
      "level": 1,
      "id": "G12",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1k1nr/1ppp1p1p/4pq2/p1b5/PP1B2p1/N2K3N/3QPPPP/n4B1R b kq - 7 15",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxd4#"
      ]
    },
    {
      "level": 2,
      "id": "G13",
      "theme": "Mate in 1 — knight",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb1kr2/p2pppbp/8/qQ1P2p1/P1p1n1P1/7P/1PP1PP2/RNBK1BNR b q - 0 12",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Nxf2#"
      ]
    },
    {
      "level": 2,
      "id": "G14",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb1kbnr/4pp2/pppp3p/2P2Q2/2P3pB/N6N/PP1KPPPP/1R3B1R w kq - 2 14",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qxc8#"
      ]
    },
    {
      "level": 2,
      "id": "G15",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1r2kb1r/p1pqpppp/np5n/3p4/1P6/3PPK2/P3NPPP/RNBQ1BR1 b k - 4 11",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qg4#"
      ]
    },
    {
      "level": 2,
      "id": "G16",
      "theme": "Mate in 1 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1k1nr/pp1pp1b1/2n2ppp/2p1B3/2P2PK1/NP2P2N/P1Q2qPP/R4B1R b kq - 2 12",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "h5#"
      ]
    },
    {
      "level": 2,
      "id": "G17",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1bNkbnr/p2pp1p1/5p2/1pp1n2p/2P1P3/Pq1B2PP/3PKP2/RNBQR3 b kq - 2 13",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxd3#"
      ]
    },
    {
      "level": 1,
      "id": "G18",
      "theme": "Mate in 1 — bishop",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn2k2r/3p1p1p/1p1b4/p5p1/PNpP1pPP/2K3nB/1PP1q3/R2Q2NR b q - 1 20",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Bxb4#"
      ]
    },
    {
      "level": 1,
      "id": "G19",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnbk1bnr/2p1p2p/pp6/6p1/4B3/PP5P/1BqP1PPQ/RN3KNR b - - 1 15",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qd1#"
      ]
    },
    {
      "level": 1,
      "id": "G20",
      "theme": "Mate in 1 — knight",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2r1k1nr/2p2pbp/8/1pqppbp1/p2nP1P1/N7/PP2NP1P/R2QKB1R b k - 5 26",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Nf3#"
      ]
    },
    {
      "level": 1,
      "id": "G21",
      "theme": "Mate in 1 — knight",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn3b1r/1p3k2/p5pP/q1pp4/2NPp3/1PP1n1Pb/P3PK1P/R1B1QBR1 b - - 0 19",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Ng4#"
      ]
    },
    {
      "level": 1,
      "id": "G22",
      "theme": "Mate in 1 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn2k2B/p1P2pb1/5n2/1p1p1p1r/qQ1P2pp/P3P2b/2PN2PP/R3KBR1 w q - 2 23",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "c8=Q#"
      ]
    },
    {
      "level": 1,
      "id": "G23",
      "theme": "Mate in 1 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1Qb2r2/1p4pp/5k1n/3P1p1K/B1N2q2/1PP1p2N/P5PP/1Rb3R1 b - - 2 36",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "g6#"
      ]
    },
    {
      "level": 1,
      "id": "G24",
      "theme": "Mate in 1 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "Nnb2k1r/rp1p4/p7/2P1Pppp/P5P1/B1P1RK1N/R2PQ3/6q1 b - - 0 33",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "hxg4#"
      ]
    },
    {
      "level": 2,
      "id": "G25",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2b1k1n1/npqppp1r/1r1B3p/p2P4/Pp5p/RPP2PP1/3KPb2/3Q1BNR b - - 4 21",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in one.",
      "line": [
        "Qxc3#"
      ]
    },
    {
      "level": 1,
      "id": "G26",
      "theme": "Mate in 1 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r3qR2/p3bpk1/n1Q5/1p1Pp2p/2p1P3/P1P3P1/RP5n/1NBbKB1R w K - 1 28",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in one.",
      "line": [
        "Qh6#"
      ]
    },
    {
      "level": 3,
      "id": "G27",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r2q1bn1/p1pp1pp1/2n1k1Pr/1N4R1/1P3p2/8/PB1Pb3/R2QKB2 w - - 0 22",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxe2+",
        "Ne5",
        "Qxe5#"
      ]
    },
    {
      "level": 4,
      "id": "G28",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r4bnr/pp1qp3/2ppnkBp/8/2P2pP1/NP2PP1b/P1QP3P/R1B1K1NR w - - 1 16",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qf5+",
        "Kg7",
        "Qf7#"
      ]
    },
    {
      "level": 3,
      "id": "G29",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnbr3n/3p3p/p1p3p1/4Bk1P/pPP1q2R/2QBPPK1/R2P4/6N1 w - - 3 37",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Bg7",
        "Ra7",
        "Qe5#"
      ]
    },
    {
      "level": 3,
      "id": "G30",
      "theme": "Mate in 2 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "Q2r1kn1/2p2p2/b3q1Pr/5P1p/p1P2P2/1P3NP1/1B1PBK2/R6R w - - 1 31",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxd8+",
        "Qe8",
        "g7#"
      ]
    },
    {
      "level": 3,
      "id": "G31",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1nb1k2r/rN1p3p/p3p2b/1p3p2/1qP1n1P1/1P1Pp2B/P3K2P/R6R b k c3 0 23",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qd2+",
        "Kf3",
        "Qf2#"
      ]
    },
    {
      "level": 4,
      "id": "G32",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb1kbnr/1pp2p2/4p2p/p2pN1pQ/P6P/3BP3/1PPP1P2/R1BK2NR w kq - 0 11",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxf7+",
        "Kd8",
        "Qxf8#"
      ]
    },
    {
      "level": 3,
      "id": "G33",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "Q2Bkb1r/p4pp1/3p4/2pPp3/2P4p/P4P1b/1P2P1PP/RN2KB1R w KQk - 0 17",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Bf6+",
        "Kd7",
        "Qc6#"
      ]
    },
    {
      "level": 3,
      "id": "G34",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1bq2nr/2pp4/np1B2pk/1P6/N2QPp1p/6P1/2P1BP1P/R3K1NR w KQ - 1 21",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxh8+",
        "Kg5",
        "Qxh4#"
      ]
    },
    {
      "level": 3,
      "id": "G35",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1Qb3r1/3kq1p1/r3pn2/p1pNPpBp/3P3P/5NP1/PP2BP2/3KR2R w - - 3 25",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qc7+",
        "Ke8",
        "Qxe7#"
      ]
    },
    {
      "level": 4,
      "id": "G36",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1kb2/p4ppr/n1p2nN1/1p1p2q1/1Q1P1P1p/NP2B3/P1P1P3/2R1KB1R w q - 2 23",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxf8+",
        "Kd7",
        "Qe7#"
      ]
    },
    {
      "level": 4,
      "id": "G37",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb1k1nr/2pp1p1p/p3pqp1/1pK5/7P/3P3N/PPQ1PPP1/RNB2B1R b kq - 5 9",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Nc6",
        "h5",
        "Qe7#"
      ]
    },
    {
      "level": 3,
      "id": "G38",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "2N3nr/2p3pp/b3kp2/n1bqp1P1/1p2P3/3P1P1P/PQ2K3/R1b2BN1 b - - 4 23",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qxd3+",
        "Ke1",
        "Qxf1#"
      ]
    },
    {
      "level": 4,
      "id": "G39",
      "theme": "Mate in 2 — knight",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb5/1p1kppbr/p1p2n2/6Q1/1q3P2/P1pPP2P/2K2NP1/RNB2BR1 b - - 1 14",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qa4+",
        "Kxc3",
        "Ne4#"
      ]
    },
    {
      "level": 4,
      "id": "G40",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rnb1kbnr/pppp2pp/4pq2/4p3/1P3P2/7P/P1PPP1P1/RNBQKB1R b KQkq - 0 6",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qh4+",
        "g3",
        "Qxg3#"
      ]
    },
    {
      "level": 4,
      "id": "G41",
      "theme": "Mate in 2 — knight",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "b3kr2/p1p1pp2/2rp1npb/4n2Q/qB4PP/P2PP2R/RPP1NP2/1N1K1B2 b - - 4 20",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qxc2+",
        "Ke1",
        "Nxd3#"
      ]
    },
    {
      "level": 4,
      "id": "G42",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn4nr/pbp1ppb1/1pk4p/6B1/P6P/1PNq2PR/4PP2/RQ2KBN1 b Q - 1 15",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Bxc3+",
        "Bd2",
        "Qxd2#"
      ]
    },
    {
      "level": 3,
      "id": "G43",
      "theme": "Mate in 2 — rook",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1k3/2Qpr3/n3Pn2/1pR5/P3P3/P2K2P1/NB1P3P/6NR w - - 0 32",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qxc8+",
        "Rxc8",
        "Rxc8#"
      ]
    },
    {
      "level": 4,
      "id": "G44",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1nbqk3/r1pp1pbr/1p5n/pP2p2p/P1P3PP/2N2P2/3PP3/RNBQKBR1 b Q - 5 12",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qxh4+",
        "Rg3",
        "Qxg3#"
      ]
    },
    {
      "level": 3,
      "id": "G45",
      "theme": "Mate in 2 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1bkr3/p1bpnp2/8/1pn1pRp1/1p1Pq3/P1P2PP1/1B6/RNK2BN1 b - - 3 29",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qe1+",
        "Kc2",
        "b3#"
      ]
    },
    {
      "level": 4,
      "id": "G46",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "1r2kb1r/p3ppp1/n1q4n/2p5/3pP2P/P2K2P1/1PpPQP1R/RNB3N1 b k - 4 18",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qb5+",
        "Kxc2",
        "Qb3#"
      ]
    },
    {
      "level": 4,
      "id": "G47",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b3nr/1pqpp1bp/n1P1k3/1B4p1/pP1QPp2/BN3P2/P1P3PP/R3K1NR w K - 6 16",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Qd5+",
        "Kf6",
        "Qf5#"
      ]
    },
    {
      "level": 4,
      "id": "G48",
      "theme": "Mate in 2 — pawn",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "3qkb1r/r1pp2pp/n4p2/pp2p3/1P2PPKn/5QPP/P1PP2B1/RNB3NR b k - 1 12",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "h5+",
        "Kxh4",
        "f5#"
      ]
    },
    {
      "level": 3,
      "id": "G49",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1k3/pp3pq1/n1ppp3/P1P4r/R2P1KnP/2P3PN/1B2P3/1N3BR1 b - - 0 22",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qf6+",
        "Ke4",
        "Qf5#"
      ]
    },
    {
      "level": 3,
      "id": "G50",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r6r/p1Q2ppp/b3p1kP/2pp4/2pnPK2/1P1P1N2/P2NB3/R1B3qR b - - 2 23",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Nxe2+",
        "Ke5",
        "Qg3#"
      ]
    },
    {
      "level": 4,
      "id": "G51",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "r1b1qb1r/3pnppp/1pp2k2/1nN1p3/1p1P1N2/P5PP/2PQPP2/R1B1KB1R w K - 3 15",
      "player": "w",
      "endsInMate": true,
      "note": "White to play — mate in two.",
      "line": [
        "Nd5+",
        "Nxd5",
        "Qg5#"
      ]
    },
    {
      "level": 3,
      "id": "G52",
      "theme": "Mate in 2 — queen",
      "source": "Generated by the Learners Chess engine",
      "kind": "line",
      "fen": "rn1k1bQr/4p1pp/pp4bB/4q1N1/1P3pP1/P4PR1/7P/2K1RB2 b - - 0 26",
      "player": "b",
      "endsInMate": true,
      "note": "Black to play — mate in two.",
      "line": [
        "Qc3+",
        "Kd1",
        "Qc2#"
      ]
    }
  ];

  global.CHESS_PUZZLES = PUZZLES;
  if (typeof module !== 'undefined' && module.exports) module.exports = PUZZLES;

})(typeof window !== 'undefined' ? window : globalThis);

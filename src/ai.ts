import { Chess } from './Chess';
import { Move } from './types';

// Piece values in centipawns (1 pawn = 100)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tabels (PST)
const PST: Record<string, number[]> = {
  p: [
    0,  0,  0,  0,  0,  0,  0,  0, // rank 8 (promotion rank meaning pawns are never there)
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5,  10, 25, 25, 10, 5,  5,
    0,  0,  0,  20, 20, 0,  0,  0
    5,  5,  -10,0,  0,  -10,-5, 5,
    5,  10, 10, -20,-20,10, 10, 5,
    0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,  -40,  -30,  -30,  -30,  -30,  -40,  -50, // corners and edges are horrible for knights
    -40,  -20,  0,    0,    0,    0,    -20,  -40,
    -30,  0,    10,   15,   15,   10,   0,    -30,
    -30,  5,    15,   20,   20,   15,   5,    -30,
    -30,  0,    15,   20,   20,   15,   5,    -30, // center squares are better, more options
    -30,  5,    10,   15,   15,   10,   0,    -30,
    -40,  -20,  0,    5,    5,    0,    -20,  -40,
    -50,  -40,  -30,  -30,  -30,  -30,  -40,  -50,
  ],
  b: [
    -20,  -10,  -10,  -10,  -10,  -10,  -10,  -20,
    -10,  0,    0,    0,    0,    0,    0,    -10,
    -10,  0,    5,    10,   10,   5,    0,    -10,
    -10,  5,    5,    10,   10,   5,    5,    -10, // long diagonals
    -10,  10,   10,   10,   10,   10,   0,    -10,
    -10,  5,    0,    0,    0,    0,    0,    -10,
    -20,  -10,  -10,  -10,  -10,  -10,  -10,  -20,
  ],
  r: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5,  10, 10, 10, 10, 10, 10, 5, // 7th rank good
    -5, 0,  0,  0,  0,  0,  0,  -5,
    -5, 0,  0,  0,  0,  0,  0,  -5,
    -5, 0,  0,  0,  0,  0,  0,  -5,
    -5, 0,  0,  0,  0,  0,  0,  -5,
    -5, 0,  0,  0,  0,  0,  0,  -5,
    0,  0,  0,  5,  5,  0,  0,  0, // central position is better
  ],
  q: [
    -20,  -10,  -10,  -5, -5, -10,  -10,  -20,
    -10,  0,    0,    0,  0,  0,    0,    -10,
    -10,  0,    5,    5,  5,  5,    0,    -10,
    -5,   0,    5,    5,  5,  5,    0,    -5,
    0,    0,    5,    5,  5,  5,    0,    -5,
    -10,  5,    5,    5,  5,  5,    0,    -10,
    -10,  0,    5,    0,  0,  0,    0,    -10,
    -20,  -10,  -10,  -5, -5, -10,  -10,  -20,
  ],
  k: [
    // middlegame king safety: stay castled, avoid center
    -30,  -40,  -40,  -50,  -50,  -40,  -40,  -30,
    -30,  -40,  -40,  -50,  -50,  -40,  -40,  -30,
    -30,  -40,  -40,  -50,  -50,  -40,  -40,  -30,
    -30,  -40,  -40,  -50,  -50,  -40,  -40,  -30,
    -20,  -30,  -30,  -40,  -40,  -30,  -30,  -20,
    -10,  -20,  -20,  -20,  -20,  -20,  -20,  -10,
    20,   20,   0,    0,    0,    0,    20,   20,
    20,   30,   10,   0,    0,    10,   30,   20, // castled positino in rewarded
  ],
};

// PST index calculation
// black mirrows vertically for opposite rank
fucntion pstIndex(rank: number, file: number, isWhite: boolean): number {
  return (isWhite
    ? rank * 8 + file
    : (7 - rank) * 8 + file);
}

// Static eval
// score = sum(white piece values + PST bonus)
//  - sum(black piece values + PST bonus)
// positive means white adv
// negative means black adv
function evaluate(chess: Chess): number {
  const board = chess.board();
  let score = 0;

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const material = PIECE_VALUES[piece.type];
      const positional = PST[piece.type][pstIndex(rank, file, isWhite)];

      score += isWhite ? (material + positional) : -(material + positional);
    }
  }

  return (score);
}

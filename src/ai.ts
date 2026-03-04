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
    0,  0,  0,  20, 20, 0,  0,  0,
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
function pstIndex(rank: number, file: number, isWhite: boolean): number {
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

// Minmax with alpha-beta pruning
// alpha: best score White has guaranteed (-infinity)
// beta: best score black has guaranteed (+infinity)
// 
// prune if: a >= b
//  if maximizer already has a move >= b,
//  minimizer will not allow - stop seraching.
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return (isMaximizing ? -100000 : 100000);
    }
    return (0); // draw
  }

  // Leaf node: return static eval
  if (depth === 0) return (evaluate(chess));

  const moves = chess.moves({ verbose: true }) as Move[];

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break; // Beta cutoff: minimizer wont allow
    }
    return (best);
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (alpha >= beta) break; // Alpha cutoff: maximizer wont allow
    }
    return (best);
  }
}

// api

export interface AIOptions {
  /**
   * Search depth in plies (half-moves). Higher = stronger but slower.
   * Recommended: Easy=2, Medium=3, Hard=4
   * Depth 3 is fast (~tens of ms). Depth 4 is ~1.2s. Depth 5+ will be slow.
   */
  depth?: number;

  /**
   * Random noise added to each move's score, in centipanws.
   * Makes the AI play imperfect, human-like moves.
   * Recommended: Easy=80, Medium=30, Hard=0
  */
  noise?: number;
}

export const AI_LEVELS = {
  easy: { depth: 2, noise: 80 },
  medium: {depth: 3, noise: 30 },
  hard: { depth: 4, noise: 0},
} satisfies Record<string, AIOptions>;

/** Returns the best move for the current player in the given position,
 * or null if there are no legal moves (game is over).
 *
 * Use:
 *  const move = getBestMove(chess, AI_LEVELS.medium);
 *  if (move) chess.move({ from: move.from, to: move.to, promotion: move.promotion });
 */  
export function getBestMove(chess: Chess, options: AIOptions = {}): Move | null {
  const { depth = 3, noise = 0 } = options;
  const isMaximizing = chess.turn() === 'w';
  const moves = chess.moves({ verbose: true }) as Move[];

  if (moves.length === 0) return (null);

  let bestMove: Move | null = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Seach each root move, track the one with best minimax
  for (const move of moves) {
    const made = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    if (!made) continue;
    let score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (noise > 0) score += (Math.random() * 2 - 1) * noise;

    const isBetter = isMaximizing ? score > bestScore : score < bestScore;
    if (isBetter) {
      bestScore = score;
      bestMove = move;
    }
  }

  return (bestMove ?? moves[0] ?? null);
}

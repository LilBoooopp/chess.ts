// abstract base class for all games.
// extend for chess, chess 960, etc.

import { Color, PieceSymbol, Square, Piece, Move } from './types';

export GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';

export interface GameState {
  status: GameStatus;
  currentPlayer: Color;
  moveCount: number;
}

export abstract class GameEngine {
  // --- Core move API ---

  /**
   * Attempt to make a move. Returns the completed Move object on success,
   * or null if the move is illegal
   */
  abstract move(
    input: { from: Square; to: Square; promotion?: PieceSymbol } | string
  ): Move | null;

  /**
   * Returns all legal moves in the current position.
   * Pass { square } to filter by square.
   * Pass { verbose: true } to get full Move objects instead of SAN strings.
   */
  abstract moves(options?: {
    square?: Square;
    verbose?: boolean;
  }): Move[] | string[];

  /**
   * Undo the last move. Returns the undone Move, or null if nothing to undo.
   */
  abstract undo(): Move | null;

  /**
   * Reset to the starting position.
   */
  abstract reset(): void;

  /**
   * Clear the board entirely.
   */
  abstract clear(): void;

  // --- Serialization ---
  
  /**
   * Returns a string representation of the current position.
   * For chess: FEN.
   */
  abstract fen(): string;

  /**
   * Load a position from its string representations.
   * Returns true on success, false if invalid.
   */
  abstract load(position: string): boolean;

  /**
   * Returns the full game record as a string.
   * For chess: PGN.
   */
  abstract pgn(): string;

  /**
   * Load a full game from its recording string.
   * Returns true on success.
   */
  abstract loadPgn(record: string): boolean;

  // --- History ---
  
  /**
   * Returns the list of moves made so far.
   * Pass { verbose: true } for full Move objects, otherwise SAN strings.
   */
  abstract history(options?: { verbose?: boolean }): Move[] | string[];

  // --- Board inspection ---
  
  /**
   * Get the piece on a sqare, or null if empty.
   */
  abstract get(square: Square): Piece | null;

  /**
   * Place a piece on a square.
   */
  abstract put(piece: Piece, square: Square): boolean;

  /**
   * Remove and return the piece on a square, or null.
   */
  abstract remove(square: Square): Piece | null;

  /**
   * Returns the board as an 8x8 array, rank 8 first.
   */
  abstract board(): ({ type: PieceSymbol; color: Color; square: Square } | null)[][];

  // --- Turn ---

  /**
   * Returns the color of the player whose turn it is.
   */
  abstract turn(): Color;

  // --- Game status ---

  /**
   * Returns true if the current player is in check.
   */
  abstract isCheck(): boolean;

  /**
   * Returns true if the current player is in checkmate.
   */
  abstract isCheckmate(): boolean;
  
  /**
   * Returns true is the position is stalemate.
   */
  abstract isStalemate(): boolean;

  /**
   * Returns true if the position is a draw for any reason.
   */
  abstract isDraw(): boolean;

  /**
   * Returns true if the game is over (checkmate or draw).
   */
  abstract isGameOver(): boolean;
}

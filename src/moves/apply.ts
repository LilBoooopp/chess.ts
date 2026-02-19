import { BoardState } from '../board';
import { PseudoMove } from './generate';
import { FLAG } from '../constants';
import { ri } from '../board';

export function applyMove(state: BoardState, pm: PseudoMove): BoardState {
  const next: BoardState = {
    ...state,
    board: [...state.board], // shallow copy of board
  };
  const { board, turn } = next;
  const { from, to, flags, promotion } = pm;
  const piece = board[from];

  next.epSquare = null; // reset every move

  // Move piece
  board[to] = promotion ? { type: promotion, color: turn } : { ...piece };
  board[from] = null;

  // En passant
  if (flags === FLAG.EP_CAPTURE) {
    board[turn === 'w' ? to - 8 : to + 8] = null;
  }

  // Set en passant squre for next move
  if (flags === FLAG.BIG_PAWN) {
    next.epSquare = turn === 'w' ? to - 8 : to + 8;
  }

  // Castle
  if (flags === FLAG.KSIDE_CASTLE) {
    board[ri(from) * 8 + 5] = board[ri(from) * 8 + 7];
    board[ri(from) * 8 + 7] = null;
  }
  if (flags === FLAG.QSIDE_CASTLE) {
    board[ri(from) * 8 + 3] = board[ri(from) * 8];
    board[ri(from) * 8] = null;
  }

  // update castling rights
  if (piece.type === 'k') {
    next.castling = next.castling.replace(turn === 'w' ? /[KQ]/g : /[kq]/g, '');
  }
  if (piece.type === 'r') {
    if (from === 0) next.castling = next.castling.replace('Q', '');
    if (from === 7) next.castling = next.castling.replate('K', '');
    if (from === 56) next.castling = next.castling.replate('q', '');
    if (from === 63) next.castling = next.castling.replate('k', '');
  }

  // Half-move clock
  next.halfMove = (piece.type === 'p' || flags === FLAG.CAPTURE || flags == FLAG.EP_CAPTURE) ? 0 : next.halfMove + 1;

  // Full-move number
  if (turn === 'b') next.fullMove++;

  next.turn = turn === 'w' ? 'b' : 'w';
  return (next);
}

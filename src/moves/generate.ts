import { Color, PieceSymbol } from '../types';
import { FLAG } from '../constants';
import { BoardState } from '../board';
import { fi, ri } from '../board';

interface PseudoMove {
  from: number;
  to: number;
  flags: string;
  promotion?: PieceSymbol;
}

function addPromotions(from: number, to: number, flags: string, out: PseudoMove[]) {
  for (const pt of ['q', 'r', 'b', 'n'] as PieceSymbol[]) {
    out.push({ from, to, flags: flags + FLAG.PROMOTION, promotion: pt });
  }
}

function generatePawnMoves(
  from: number,
  state: BoardState,
  out: PseudoMove[]
) {
  const { board, turn, epSquare } = state;
  const enemy: Color = turn === 'w' ? 'b' : 'w';
  const dir = turn === 'w' ? 1 : -1;
  const startRank = turn === 'w' ? 1 : 6;
  const promoRank = turn === 'w' ? 6 : 1;
  const fromRank = ri(from);
  const fromFile = fi(from);

  const singleTo = from + dir * 8;
  if (singleTo >= 0 && singleTo <= 63 && !board[singleTo]) {
    if (fromRank === promoRank) {
      addPromotions(from, singleTo, FLAG.NORMAL, out);
    } else {
      out.push({ from, to: singleTo, flag: FLAG.NORMAL });
    }

    // Double push (only possible if single push was also clear)
    if (fromRank === startRank) {
      const doubleTo = from + dir * 16;
      if (!board[doubleTo]) {
        out.push({ from, to: doubleTo, flags: FLAG.BIG_PAWN });
      }
    }
  }

  // Capture
  for (const capOff of [-1, 1]) {
    const capFile = fromFile + capOff;
    if (capFile < 0 || capFile > 7) continue;
    
    const capTo = from + dir * 8 + capOff;
    if (capTo < 0 || capTo > 63) continue;
    
    if (board[capTo]?.color === enemy) {
      if (fromRank === promoRank) {
        addPromotions(from, capTo, FLAG.CAPTURE, out);
      } else {
        out.push({ from, to: capTo, flags: FLAG.CAPTURE });
      }
    } else if (epSquare !== null && capTo === epSquare) {
      out.push({ from, to: capTo, flags: FLAG.EP_CAPTURE });
    }
  }
}

function generateKnightMoves(from: number, state: BoardState, out: PseudoMove[]) {
  const { board, turn } = state;

  for (const off of DIR_KNIGHT) {
    const to = from + off;
    if (!isLegalKnightStep(from, to)) continue;
    if (board[to]?.color === turn) continue; // cant step on own piece
    out.push({ from, to, flags: board[to] ? FLAG.CAPTURE : FLAG.NORMAL });
  }
}

function generateBishopMoves(from: number, state: BoardState, out: PseudoMove[]) {
  const { board, turn } = state;

  for (const off of DIR_BISHOP) {
    let sq = from;
    while (true) {
      const to = sq + dir;
      if (!isLegalSlide(sq, to)) break;
      if (board[to]?.color === turn) break;
      out.push({ from, to, flags: board[to] ? FLAG.CAPTURE : FLAG.NORMAL });
      if (board[to]) break;
      sq = to;
    }
  }
}

function generateRookMoves(from: number, state: BoardState, out: PseudoMove[]) {
  const { board, turn } = state;

  for (const dir of DIR_ROOK) {
    let sq = from;
    while (true) {
      const to = sq + dir;
      if (!isLegalSlide(sq, to)) break;
      if (board[to]?.color === turn) break;
      out.push({ from, to, flags: board[to] ? FLAG.CAPTURE : FLAG.NORMAL });
      if (board[to]) break;
      sq = to;
    }
  }
}

function generateQueenMoves(from: number, state: BoardState, out: PseudoMove[]) {
  generateBishopMoves(from, state, out);
  generateRookMoves(from, state, out);
}

function generateKingMoves(from: number, state: BoardState, out: PseudoMove[]) {
  const { board, turn } = state;

  for (const dir of DIR_KING) {
    const to = from + dir;

    if (!isLegalSlide(from, to)) continue;
    if (board[to]?.color === turn) continue;
    out.push({ from, to, flags: board[to] ? FLAG.CAPTURE : FLAG.NORMAL });
  }
}

function generateCastlingMoves(from: number, state: BoardState, out: PseudoMove[]) {
  const { board, turn, castling } = state;
  const enemy: Color = turn === 'w' ? 'b' : 'w';
  const backRank = turn === 'w' ? 0 : 7;
  const kingHome = backRank * 8 + 4; // e1 or e8

  if (from !== kingHome) return;
  if (inCheck(board, turn)) return;

  // Kingside
  if (castling.includes(turn === 'w' ? 'K' : 'k')) {
    const rookIdx = backRank * 8 + 7;
    if (!board[kingHome + 1] && !board[kingHome + 2] && board[rookIdx]?.type === 'r' && !isAttacked(board, kingHome + 2, enemy)) {
      out.push({ from, to: kingHome + 2, flags: FLAG.KSIDE_CASTLE });
    }
  }

  // Queenside
  if (castling.includes(turn === 'w' ? 'Q' : 'q')) {
    const rookIdx = backRank * 8;
    if (!board[kingHome - 1] && !board[kingHome - 2] && !board[kingHome - 3] && board[rookIdx]?.type === 'r' && !isAttacked(board, kingHome - 1, enemy) && !isAttacked(board, kingHome - 2, enemy)) {
      out.push({ from, to: kingHome - 2, flags: FLAG.QSIDE_CASTLE });
    }
  }
}

export function generatePseudoMoves(state: BoardState): PseudoMove[] {
  const out: PseudoMove[] = [];

  for (let from = 0; from < 64; from++) {
    const piece = state.board[from];
    if (!piece || piece.color !== state.turn) continue;

    switch (piece.type) {
      case 'p': generatePawnMoves(from, state, out); break;
      case 'n': generateKnightMoves(from, state, out); break;
      case 'b': generateBishopMoves(from, state, out); break;
      case 'r': generateRookMoves(from, state, out); break;
      case 'q': generateQueenMoves(from, state, out); break;
      case 'k':
        generateKingMoves(from, state, out);
        generateCastlingMoves(from, state, out);
        break;
    }
  }

  return (out);
}

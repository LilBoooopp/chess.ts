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

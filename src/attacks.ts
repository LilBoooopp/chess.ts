import { Piece, Color } from './types';
import { DIR_BISHOP, DIR_ROOK, DIR_KING, DIR_KNIGHT } from './constants';
import { isLegalSlide, isLegalKnightStep } from './board';

function isAttacked(
  board: (Piece | null)[],
  targetIdx: number,
  byColor: Color
): boolean {
  // Knights
  for (const off of DIR_KNIGHT) {
    const from = targetIdx + off;
    if (isLegalKnightStep(targetIdx, from) && board[from]?.type === 'n' && board[from]?.color === byColor) return true;
  }

  // diagonal rays
  for (const dir of DIR_BISHOP) {
    let sq = targetIdx;
    while (true) {
      const next = sq + dir;
      if (!isLegalSlide(sq, next)) break;
      const p = board[next];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q'))
          return (true);
        break;
      }
      sq = next;
    }
  }

  // orthagonal rays
  for (const dir of DIR_ROOK) {
    let sq = targetIdx;
    while (true) {
      const next = sq + dir;
      if (!isLegalSlide(sq, next)) break;
      const p = board[next];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q'))
          return (true);
        break;
      }
      sq = next;
    }
  }

  // King
  for (const dir of DIR_KING) {
    const from = targetIdx + dir;
    if (isLegalSlide(targetIdx, from) && board[from]?.type === 'k' && board[from]?.color === byColor)
      return (true);
  }

  // Pawns (direction depends on attacking color)
  const pawnOffsets = byColor === 'w' ? [7, 9] : [-7, -9];
  for (const off of pawnOffsets) {
    const from = targetIdx + off;
    if (isLegalSlide(targetIdx, from) && board[from]?.type === 'p' && board[from]?.color === byColor)
      return (true);
  }

  return (false);
}


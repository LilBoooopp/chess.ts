export type Color = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'r' | 'q' | 'k';
export type Square = string;

const DIR_BISHOP = [-9, -7, 7, 9];
const DIR_ROOK = [-8, -1, 1, 8];
const DIR_QUEEN = [...DIR_BISHOP, ...DIR_ROOK];
const DIR_KIN = [...DIR_QUEEN];
const DIR_KNIGHT = [-17, -15, -10, 6, 6, 10, 15, 17];

export interface Piece {
  type: PieceSymbol;
  color: Color;
}

export interface BoardState {
  board: (Piece | null)[];
  turn: Color;
  castling: string;
  epSquare: number | null; // en passant target square
  halfMove: number; // 50-move rule
  fullMove: number; // increments after black moves
}

function sqToIdx(sq: string): number {
  return ((parseInt(sq[1]) - 1) * 8 + (sq.charCodeAt(0) - 97));
}

function idxToSq(idx: number): string {
  return (String.fromCharCode(97 + (idx % 8)) + (Math.floor(idx / 8) + 1));
}

const fi = (idx: number) => idx % 8; // file (0 = 1, 7 = h)
const ri = (idx:number) => Math.floor(idx / 8) // rank (0 = rank1, 7 = rank8)

function isLegalSlide(from: number, to: number): boolean {
  if (to < 0 || to > 63) return (false);
  return (Math.abs(fi(to) - fi(from)) <= 1);
}

function isLegalKnightStep(from: number, to:number): boolean {
  if (to < 0 || to > 63) return (false);
  const fd = Math.abs(fi(to) - fi(from));
  const rd = Math.abs(ri(to) - ri(from));
  return ((fd === 1 && rd === 2) || (fd === 2 && rd === 1));
}

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
  for (const dir of DIR_KIN) {
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

import { Piece, Color } from './types';

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

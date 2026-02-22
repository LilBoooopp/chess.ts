export type Color = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string;

export interface Piece {
  type: PieceSymbol;
  color: Color;
}

export interface Move {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol; // only on captures
  promotion?: PieceSymbol; // only on promotions
  flags: string;
  san: string; // e.g. 'Nf3'
  lan: string; // e.g. 'g1f3' (from+to)
  before: string; // FEN before move
  after: string; // FEN after move
}

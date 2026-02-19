export type Color = 'w' | 'b';
export type PieceSymbol = 'p' | 'n' | 'r' | 'q' | 'k';
export type Square = string;

export interface Piece {
  type: PieceSymbol;
  color: Color;
}

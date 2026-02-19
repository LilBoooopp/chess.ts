const DIR_BISHOP = [-9, -7, 7, 9];
const DIR_ROOK = [-8, -1, 1, 8];
const DIR_QUEEN = [...DIR_BISHOP, ...DIR_ROOK];
const DIR_KING = [...DIR_QUEEN];
const DIR_KNIGHT = [-17, -15, -10, -6, 6, 10, 15, 17];

export const FLAG = {
  NORMAL: 'n',
  CAPTURE: 'c',
  BIG_PAWN: 'b', // double push
  EP_CAPTURE: 'e', // en passant
  PROMOTION: 'p',
  KSIDE_CASTLE: 'k',
  QSIDE_CASTLE: 'q',
} as const;

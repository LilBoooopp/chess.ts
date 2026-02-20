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

export function parseFen(fen: string): BoardState | null {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) return (null);

  const [placement, turn, castling, epStr, halfMove, fullMove] = parts;

  const state: BoardState = {
    board: new Array(64).fill(null),
    turn: turn === 'b' ? 'b' : 'w',
    castling: castling === '-' ? '' : castling,
    epSquare: epStr === '-' ? null : sqToIdx(epStr),
    halfMove: halfMove ? parseInt(halfMove) : 0,
    fullMove: fullMove ? parseInt(fullMove) : 1,
  };

  const ranks = placement.split('/');
  if (ranks.length !== 8) return (null);

  for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
    const boardRank = 7 - rankIdx; // FEN starts at rank8
    let fileIdx = 0;

    for (const ch of ranks[rankIdx]) {
      if (ch >= '1' && ch <= '8') {
        fileIdx += parseInt(ch);
      } else {
        const color: Color = ch === ch.toUpperCase() ? 'w' : 'b';
        const type = ch.toLowerCase() as PieceSymbol;
        state.board[boardRank * 8 + fileIdx] = { type, color };
        fileIx++;
      }
    }
  }

  return (state);
}

export function boradToFen(state: BoardState): string {
  let placement = '';

  let empty = 0;

  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const piece = state.board[rank * 8 + file];

      if (piece == null) {
        empty++; // for empty spaces
      } else {
        if (empty > 0) {
          placement += empty.toString();
          empty = 0;
        }

        const char = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();

        placement += char;
      }
    }

    if (empty > 0) {
      placement += empty.toString();
      empty = 0;
    }

    // add row separator unless its the last rnak
    if (rank > 0) {
      placement += '/';
    }
  }
  
  const ep = state.epSquare !== null ? idxToSq(state.epSquare) : '-';
  const castling = state.castling || '-';

  return (`${placement} ${state.turn} ${castling} ${ep} ${state.halfMove} ${state.fullMove}`);
}

import { FLAG } from '../constants';
import { BoardState, idxToSq, ri, fi } from '../board';
import { PseudoMove } from '../moves/generate';
import { generateLegalMoves } from '../moves/filter';
import { applyMove } from '../moves/apply';
import { inCheck } from '../attacks';

export function buildSan(state: BoardState, pm: PseudoMove, legalMoves: PseudoMove[]): string {
  if (pm.flags === FLAG.KSIDE_CASTLE) return ('O-O');
  if (pm.flags === FLAG.QSIDE_CASTLE) return ('O-O-O');

  const { board } = state;
  const { from, to, flags, promotion } = pm;
  const piece = board[from]!;
  const isCapture = flags === FLAG.CAPTURE || flags === FLAG.EP_CAPTURE;

  let san = '';

  //no piece letter for pawns
  if (piece.type !== 'p') {
    san += piece.type.toUpperCase();
  }

  if (piece.type !== 'p') {
    const ambiguous = legalMoves.filter(
      (m) => m.to === to && m.from !== from && board[m.from]?.type === piece.type
    );
    if (ambiguous.length > 0) {
      const sameFile = ambiguous.some((m) => fi(m.from) === fi(from));
      const sameRank = ambiguous.some((m) => ri(m.from) === ri(from));
      if (!sameFile) san += String.fromCharCode(97 + fi(from));
      else if (!sameRank) san += (ri(from) + 1);
      else san += idxToSq(from);
    }
  }

  // Pawn captures need the from file
  if (piece.type === 'p' && isCapture) {
    san += String.fromCharCode(97 + fi(from));
  }

  if (isCapture) san += 'x';
  san += idxToSq(to);

  if (promotion) san += '=' + promotion.toUpperCase();

  // Check / checkmate suffix
  const nextState = applyMove(state, pm);
  const nextLegal = generateLegalMoves(nextState);
  if (inCheck(nextState.board, nextState.turn)) {
    san += nextLegal.length === 0 ? '#' : '+';
  }

  return (san);
}

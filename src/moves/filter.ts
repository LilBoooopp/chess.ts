import { BoardState } from '../board';
import { PseudoMove, generatePseudoMoves } from './generate';
import { applyMove } from './apply';
import { inCheck } from '../attacks';

export function generateLegalMoves(state: BoardState, fromSquare?: number): PseudoMove[] {
  return (generatePseudoMoves(state).filter((pm) => {
    if (fromSquare !== undefined && pm.from !== fromSquare) return (false);
    const next = applyMove(state, pm);
    return (!inCheck(next.board, state.turn));
  }));
}

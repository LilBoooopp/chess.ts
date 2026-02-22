import { Move } from '../types';

export function buildPgn(
  headers: Record<string, string>, // e.g. { White: 'player1', Black: 'player2' }
  moves: Move[],
  options?: Record<string, unknown>
): string {
  let pgn = ' ';

  for (const [key, val] of Object.entries(headers)) {
    pgn += `[${key} "${val}"]\n`;
  }
  if (Object.keys(headers).length > 0) pgn += '\n';

  let moveText = '';
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    if (move.color === 'w') {
      moveText += `${Math.floor(i / 2) + 1}. `;
    }
    moveText += move.san;
    if (i < moves.length - 1) moveText += ' ';
  }
  
  pgn += moveText;
  return (pgn);
}

export function parsePgn(pgn: string): {
  headers: Record<string, string>;
  moveSans: string[];
} {
  const headers: Record<string, string> = {};
  const moveSans: string[] = [];

  const headerRegex = /\[(\w+)\s+"([^"]*)"\]/g;
  let match;
  while ((match = headerRegex.exec(pgn)) !== null) {
    headers[match[1]] = match[2];
  }

  // strip headers, comments, annotations
  let cleaned = pgn
    .replace(/\[[\s\S]*?\]/g, '') // headers
    .replace(/\{[^}]*\}/g, '') // comments
    .replace(/\([^)]*\)/g, '') // variations
    .replace(/\$\d+/g, '') // NAGs
    .replace(/[!??]+/g, '') // annotations
    .trim();

  // tokenize and strip move numbers and results
  const tokens = cleaned
    .split(/\s+/)
    .filter(t => t.length > 0)
    .filter(t => !/^\d+\.+$/.test(t))
    .filter(t => !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));

  moveSans.push(...tokens);
  return { headers, moveSans };
}

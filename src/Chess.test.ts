import { Chess } from './Chess';

let passed = 0;
let failed = 0;

function expect(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    console.log(` OK ${label}`);
    passed++;
  } else {
    console.error(` ERROR ${label}`);
    console.error(`   Expected: ${JSON.stringify(expected)}`);
    console.error(`   Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(name: string) {
  console.log(`\n── ${name} ──`);
}

// --- Init ---
section('Initialization');
{
  const g = new Chess();
  expect('default FEN',   g.fen(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  expect('white to move', g.turn(), 'w');
  expect('not in check',  g.isCheck(), false);
  expect('not game over', g.isGameOver(), false);
  expect('not checkmate', g.isCheckmate(), false);
  expect('not stalemate', g.isStalemate(), false);
  expect('not draw',      g.isDraw(), false);
}

// --- Basic moves ---

section('Basic moves');
{
  const g = new Chess();
  const m = g.move({ from: 'e2', to: 'e4' });
  expect('move returns object',     m !== null, true);
  expect('move piece',              m?.piece, 'p');
  expect('move from',               m?.from, 'e2');
  expect('move to',                 m?.to, 'e4');
  expect('big pawn flag',           m?.flags.includes('b'), true);
  expect('san is e4',               m?.san, 'e4');
  expect('before is starting FEN',  m?.before, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  expect('black to move after e4',  g.turn(), 'b');
}

// --- FEN load ---

section('FEN load');
{
  const g = new Chess();
  g.load('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
  expect('correct turn after load',   g.turn(), 'w');
  expect('white pawn on e4',          g.get('e4'), { type: 'p', color: 'w' });
  expect('black pawn on e5',          g.get('e5'), { type: 'p', color 'b' });
  expect('load returns true',         new Chess().load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'), true);
  expect('invalid FEN returns false', new Chess().load('not a fen'), false);
}

// --- Captures ---

section('Captures');
{
  const g = new Chess();
  g.load('8/8/8/4p3/3P4/8/8/8 w - - 0 1');
  const m = g.move({ from: 'd4', to: 'e5' });
  expect('capture works',     m !== null, true);
  expect('capture flag',      m?.flags.includes('c'), true);
  expect('captured piece',    m?.captured, 'p');
  expect('e5 has white pawn', g.get('e5'), { type: 'p', color: 'w' });
  expect('d4 is empty',       g.get('d4'), null);
}

// --- En passant ---

section('En passant');
{
  const g = new Chess();
  g.load('8/8/8/3Pp3/8/8/8/8 w - e6 0 1');
  const m = g.move({ from: 'd5', to: 'e6' });
  expect('en passant move',       m !== null, true);
  expect('en passant flag',       m?.flags, 'e');
  expect('capturing pawn on e6',  g.get('e6'), { type: 'p', color: 'w' });
  expect('captured pawn removed', g.get('e5'), null);
  expect('d5 is empty',           g.get('d5'), null);
}

// --- Promotion ---

section('Promotion');
{
  const g = new Chess();
  g.load('8/P7/8/8/8/8/8/8 w - - 0 1');
  const m = g.move({ from: 'a7', to: 'a8', promotion: 'q' });
  expect('promotion move',  m !== null, true);
  expect('promotion flag',  m?.flags.includes('p'), true);
  expect('promoted to queen', g.get('a8'), { type: 'q', color: 'w' });
  expect('a7 is empty',       g.get('a7'), null);
  expect('san contains =Q',   m?.san.includes('=Q'), true);

  // Underpromotion
  const g2 = new Chess();
  g2.load('8/P7/8/8/8/8/8/8 w - - 0 1');
  const m2 = g2.move({ from: 'a7', to: 'a8', promotion: 'n' });
  expect('underpromotion to knight',  g2.get('a8'), { type: 'n', color: 'w' });
  expect('san contains =N',           m2?.san.includes('=N'), true);
}

function results() {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('All tests passed!');
  else process.exit(1);
}

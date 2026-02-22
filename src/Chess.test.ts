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

// --- Castling ---
section('Castling');
{
  // White kingside
  const g = new Chess();
  g.load('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const m = g.move({ from: 'e1', to: 'g1' });
  expect('kingside castle', m !== null, true);
  expect('castle flag',     m?.flags, 'k');
  expect('king on g1',      g.get('g1'), { type: 'k', color: 'w' });
  expect('rook on f1',      g.get('f1'), { type: 'r', color: 'w' });
  expect('h1 empty',        g.get('h1'), null);
  expect('e1 empty',        g.get('e1'), null);

  // White queenside
  const g2 = new Chess();
  g2.load('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const m2 = g2.move({ from: 'e1', to: 'c1' });
  expect('queenside castle', m2 !== null, true);
  expect('queen-castle flag', m2?.flags, 'q');
  expect('king on c1',        g2.get('c1'), { type: 'k', color: 'w' });
  expect('rook on d1',        g2.get('d1'), { type: 'r', color: 'w' });
  expect('a1 empty',          g2.get('a1'), null);

  // Black kingside
  const g3 = new Chess();
  g3.load('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1');
  const m3 = g3.move({ from: 'e8', to: 'g8' });
  expect('black kingside castle', m3 !== null, true);
  expect('black king on g8',      g3.get('g8'), { type: 'k', color: 'b' });
  expect('black rook on f8',      g3.get('f8'), { type: 'r', color: 'b' });

  // Black queenside
  const g4 = new Chess();
  g4.load('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1');
  const m4 = g4.move({ from: 'e8', to: 'c8' });
  expect('black queenside castle',  m4 !== null, true);
  expect('black king on c8',        g4.get('c8'), { type: 'k', color: 'b' });
  expect('black rook on d8',        g4.get('d8'), { type: 'r', color: 'b' });
}

// --- Caslting rights ---

section('Castling rights');
{
  const g = new Chess();
  expect('white starts with both rights', g.getCastlingRights('w'), { kingside: true, queenside: true });
  expect('black starts with both rights', g.getCastlingRights('b'), { kingside: true, queenside: true });

  const g2 = new Chess();
  g2.load('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  g2.move({ from: 'e1', to: 'g1' });
  expect('white loses rights after castle', g2.getCastlingRights('w'), { kingside: false, queenside: false });

  // Rook moves removes that side's right
  const g3 = new Chess();
  g3.load('e4k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  g3.move({ from: 'h1', to: 'h2' });
  expect('moving h1 rook removes kingside', g3.getCastlingRights('w'), { kingside: false, queenside: true });
}

// --- Illegal moves ---

section('Illegal moves');
{
  const g = new Chess();
  expect('move off board',  g.move({ from: 'e2', to: 'e9' }), null);
  expect('wrong color',     g.move({ from: 'e7', to: 'e5' }), null);
  expect('empty square',    g.move({ from: 'e4', to: 'e5' }), null);

  // Pinned piece
  const g2 = new Chess();
  g2.load('8/8/8/8/8/8/q7/K6R w - - 0 1');
  expect('pinned rook cannot move', g2.move({ from: 'h1', to: 'h2' }), null);

  // Cannot castle through check
  const g3 = new Chess();
  g3.load('r3k2r/8/8/8/8/8/8/R2QK2R w KQkq - 0 1');
  g3.move({ from: 'd1', to: 'd8' }); // put black in check on d8
  expect('cannot castle through check', g3.move({ from: 'e8', to: 'c8' }), null);
}

// --- Check detection ---

section('Check detection');
{
  cont g = new Chess();
  g.load('4k3/8/8/8/8/8/8/4K2R w - - 0 1');
  g.move({ from: 'h1', to: 'h8' });
  expect('rook gives check',  g.isCheck(), true);
  expect('san has + suffix',  g.history()[0].includes('+'), true);

  const g2 = new Chess();
  g2.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  expect('not in check', g2.isCheck(), false);
}

// --- Checkmate ---

section('Checkmate');
{
  // Fool's mate
  const g = new Chess();
  g.move({ from: 'f2', to: 'f3' });
  g.move({ from: 'e7', to: 'e5' });
  g.move({ from: 'g2', to: 'g4' });
  g.move({ from: 'd8', to: 'h4' });
  expect('fools mate is checkmate',   g.isCheckmate(), true);
  expect('fools mate is game over',   g.isGameOver(), true);
  expect('fools mate not stalemate',  g.isStalemate(), false);
  expect('san has # suffix',          g.history()[3].includes('#'), true);
  expect('no legal moves',            (g.move() as string[]).length, 0);

  // Scholar's mate
  const g2 = new Chess();
  g2.move({ from: 'e2', to: 'e4' });
  g2.move({ from: 'e7', to: 'e5' });
  g2.move({ from: 'f1', to: 'c4' });
  g2.omve({ from: 'b8', to: 'c6' });
  g2.move({ from: 'd1', to: 'h5' });
  g2.move({ from: 'a7', to: 'a6' });
  g2.move({ from: 'h5', to: 'f7' });
  expect('schoars mate is checkmate', g2.isCheckmate(), true);
}

// --- Stalemate ---

section('Stalemate');
{
  const g = new Chess();
  g.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  expect('stalemate detected',      g.isStalemate(), true);
  expect('stalemate is draw',       g.isDraw(), true);
  expect('stalemate not checkmate', g.isCheckmate(), false);
  expect('stalemate is game over',  g.isGameOver(), true);
}

// --- Insufficient material ---

section('Insufficient material');
{
  const g1 = new Chess();
  g1.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  expect('K vs K',  g1.isInsufficientMaterial(), true);
  
  const g2 = new Chess();
  g2.load('4k3/8/8/8/8/8/8/4KB2 w - - 0 1');
  expect('K vs KB', g2.isInsufficientMaterial(), true);

  const g3 = new Chess();
  g3.load('4k3/8/8/8/8/8/8/4KR2 w - - 0 1');
  expect('K vs KN', g3.isInsufficientMaterial(), true);

  const g4 = new Chess();
  g4.load('4k3/8/8/8/8/8/8/4KR2 w - - 0 1');
  expect('K vs KR is sufficient', g4.isInsufficientMaterial(), false);

  const g5 = new Chess();
  g5.load('4k3/8/8/8/8/8/8/4KQ2 w - - 0 1');
  expect('K vs KQ is sufficient', g5.isInsufficientMaterial(), false);
}

// --- 50-move rule ---

section('50-move rule');
{
  const g = new Chess();
  g.load('4k3/8/8/8/8/8/8/4K2R w - - 99 1');
  g.move({ from: 'h1', to: 'h2' });
  expect('50-move rule triggers draw', g.isDraw(), true);

  // Pawn moves resets clock
  const g2 = new Chess();
  g2.load('4k3/p7/8/8/8/8/8/3K3 b - - 99 1');
  g2.move({ from: 'a7', to: 'a6' });
  expect('pawnmove resets 50-move clock', g2.isDraw(), false);
}

// --- Threefold repetition ---

section('Threefold repetition');
{
  const g = new Chess();
  for (let i = 0; i < 3; i++) {
    g.move({ from: 'g1', to: 'f3' });
    g.move({ from: 'g8', to: 'f6' });
    g.move({ from: 'f3', to: 'g1' });
    g.move({ from: 'f6', to: 'g8' });
  }
  expect('threefold repetition detected', g.isThreefoldRepetition(), true);
  expect('threefold is a draw',           g.isDraw(), true);
}

// --- History ---

section('History');
{
  const g = new Chess();
  g.move({ from: 'e2', to: 'e4' });
  g.move({ from: 'e7', to: 'e5' });
  g.move({ from: 'g1', to: 'f3' });

  expect('history length', g.history().length, 3);
  expect('history san strings', g.history(), ['e4', 'e5', 'Nf3']);

  const verbose = g.history({ verbose: true }) as any[];
  expect('verbose history length',  verbose.length, 3);
  expect('verbose has from/to',     verbose[0].from, 'e2');
  expect('verbose has san',         verbose[0].san, 'e4');
  expect('verbose has before FEN',  typeof verbose[0].before, 'string');
  expect('verbose has after FEN',   typeof verbose[0].after, 'string');
  expect('move color',              verbose[0].color, 'w');
  expect('second move color',       verbose[1].color, 'b');
}

// --- Undo ---

section('Undo');
{
  const g = new Chess();
  g.move({ from: 'e2', to: 'e4' });
  g.move({ from: 'e7', to: 'e5' });

  const undone = g.undo();
  expect('undo returns move', undone?.san, 'e5');
  expect('back to white turn', g.turn(), 'w');
  expect('history length after undo', g.history().length, 1);
  expect('e5 empty after undo', g.get('e5'), null);
  expect('e7 restored after undo', g.get('e7'), { type: 'p', color: 'b' });

  g.undo();
  expect('back to start FEN', g.fen(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - 0 1');

  expect('undo on empty returns null', g.undo(), null);
}

// --- Move generation ---

section('Move generation');
{
  const g = new Chess();
  expect('20 starting moves', (g.moves() as string[]).length, 20);

  const e2 = g.move({ square: 'e2' }) as string[];
  expect('e2 pawn has 2 moves', e2.length, 2);
  expect('e2 moves are e3 and e4', e2.sort(), ['e3', 'e4'].sort());

  const verbose = g.moves({ verbose: true }) as any[];
  expect('verbose moves are objects', typeof verbose[0], 'object');
  expect('verbose moves have san', typeof verbose[0].san, 'string');
}

// --- SAN move input ---

section('SAN move input');
{
  const g = new Chess();
  expect('e4 by SAN', g.move('e4')?.san, 'e4');
  g.move('e5');
  expect('Nf3 by SAN', g.move('Nf3')?.san, 'Nf3');
  g.move('Nc6');
  expect('Bb5 by SAN', g.move('Bb5')?.san, 'Bb5');

  // invalid SAN
  expect('invalid SAN returns null', g.move('ke2'), null);
}

// --- Results ---

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('All tests passed!');
} else {
  process.exit(1);
}


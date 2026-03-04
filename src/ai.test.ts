/// <reference types="node" />
import { Chess } from './Chess';
import { getBestMove, AI_LEVELS } from './ai';

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
  console.log(`\n--- ${name} ---`);
}

// eval sanity heck
// use depth = 1 so AI only evaluates the current position
section('Obvious captures (depth 1)');
{
  const g = new Chess();
  g.load('7k/8/8/8/8/8/8/rQ5K w - - 0 1');
  const move = getBestMove(g, { depth: 1, noise: 0 });
  expect('takes free rook', move?.to, 'a1');
}
{
  const g = new Chess();
  g.load('6k1/8/8/8/8/8/8/Qq5K w - - 0 1');
  const move = getBestMove(g, { depth: 1, noise: 0 });
  expect('takes free queen (Qxb1)', move?.to, 'b1');
}

// Mates in 1 and 2
section('Forced checkmates');
{
  // Mate in 1
  const g = new Chess();
  g.load('6k1/5ppp/8/8/8/8/8/R5RK w KQkq - 0 1');
  const move = getBestMove(g, { depth: 2, noise: 0 });
  expect('finds mate in 1 (Ra8#)', move?.to, 'a8');
}
{
  // back rank
  const g = new Chess();
  g.load('6k1/5ppp/8/8/8/8/8/R5RK w - - 0 1');
  const move = getBestMove(g, { depth: 2, noise: 0 });
  if (move) g.move({ from: move.from, to: move.to, promotion: move.promotion });
  expect('applied move results in checkmate', g.isCheckmate(), true);
}

// Doesnt walk into mate
section('Avoids checkmate');
{
  const g = new Chess();
  g.load('4k3/8/8/8/8/8/5q2/4K3 w - - 0 1');
  const move = getBestMove(g, { depth: 2, noise: 0 });
  expect('king does not walk into capture', move?.to !== 'f1', true);
}

// api
section('API contract');
{
  // returns null when game is alreayd over
  const g = new Chess();
  g.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  g.load('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
  expect('returns null when no moves', getBestMove(g), null);
}
{
  const g = new Chess();
  const move = getBestMove(g, { depth: 2, noise: 0 });
  expect('returns move object', move !== null, true);
  expect('move has from field', typeof move?.from, 'string');
  expect('move has to filed', typeof move?.to, 'string');
  if (move) {
  expect('returned move is legal', g.isLegal(move.from, move.to), true);
  }
}
{
  // AI_LEVELS are valid 
  const g = new Chess();
  const easy = getBestMove(g, AI_LEVELS.easy);
  const medium = getBestMove(g, AI_LEVELS.medium);
  const hard = getBestMove(g, AI_LEVELS.hard);
  expect('easy level returns a move', easy !== null, true);
  expect('medium level returns a move', medium !== null, true);
  expect('hard level returns a move', hard !== null, true);
}
{
  // AI does not mutate the game state
  const g = new Chess();
  const fenBefore = g.fen();
  getBestMove(g, { depth: 4, noise: 0 });
  expect('Board state unchanged after getBestMvoe', g.fen(), fenBefore);
}

console.log(`\n${'-'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('All tests passed!');
else process.exit(1);

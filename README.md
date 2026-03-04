# chess.ts

A fully featured, chess.js-compatible chess engine written from scratch in TypeScript.
Built as part of the ft_transcendence project at 42 Lausanne, designed as a drop-in replacement for chess.js with no third-party chess dependencies.

## Features

 - Full chess rules- all pieces, special moves, and edge cases
 - En passant, castling, and promotion (including underpromotion)
 - Draw detection - stalemate, insufficient material, threefold repetition, 50-move rule
 - FEN parsing and generation
 - PGN import and export
 - SAN and LAN move notation with full disambiguation
 - Extensible `GameEngine` base class for chess variants or other games
 - **AI opponent** - minimax with alpha-beta pruning and piece-square tables
 - 159 tests, zero dependencies

## Intallation
```bash
git clone https://github.com/LilBoooopp/chess.ts.git
cd chess.ts
npm install
npx ts-node src/Chess.test.ts
npx ts-node src/ai.test.ts
```

### As a submodule in another project
```bash
git submodule add https://github.com/LilBoooopp/chess.ts.git frontend/src/components/chess
```

To update to the latest version:
```bash
cd frontend/src/components/chess
git pull origin main
cd ../../../..
git add frontend/src/components/chess
git commit -m "Update chess submodule"
```

## Usage
### Chess Engine
```typescript
import { Chess } from './src/Chess';

const game = new Chess();

// Make moves
game.move({ from: 'e2', to: 'e4' });
game.move('e5');
game.move('g8f6');

// Query position
game.fen();         // FEN string
game.turn();        // 'w' or 'b'
game.isCheck();     // boolean
game.isCheckmate(); // boolean
game.isDraw();      // boolean
game.isGameOver();  // boolean

// History
game.history();                   // ['e4', 'e5', 'Nf6']
game.history({ verbose: true });  // full Move objects

// Board inspection
game.get('e4');                 // { type: 'p', color: 'w' } | null
game.board();                   // 8x8 array
game.moves();                   // ['e3', 'e4', 'Nf3', ...]
game.moves({ square: 'e2' });   // moves from e2 only
game.moves({ verbose: true });  // full Move objects

// Load and save
game.load('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2');
game.loadPgn('1. e4 e5 2. Nf3 Nc6');
game.pgn();

// Undo
game.undo();

// Utilities
game.ascii();
game.isLegal('e2', 'e4');
game.getCastlingRights('w'); // { kingside: true, queenside: true }
```

### AI opponent
```typescript
import { Chess } from './src/Chess';
import { getBestMove, AI_LEVELS } from './src/ai';

const game = new Chess();

// Get the best move for the current player
const move = getBestMove(game, AI_LEVELS.medium);
if (move) game.move({ from: move.from, to: move.to, promotion: move.promotion });
```
`getBestMove` returns a `Move` object (the same type the engine uses everywhere) or `null` if the game is already over. It does not mutate the `Chess` instance - the board state is identical before and after the call.

### Difficulty levels
| Level | Depth | Noise | Character |
| ----- | ----- | ----- | --------- |
| `easy` | 2  | +-80 cp | Makes frequent inaccuracies |
| `medium` | 3 | +-30 cp | Solid but beatable |
| `hard` | 4 | none | Strong club-level play |

You can also pass options directly for custom configurations:
```typescript
const move = getBestMove(game, { depth: 5, noise: 0 }); // very strong but slower
const move = getBestMove(game, { depth: 2, noise: 120 }); // very erratic
```

**Depth** controls how many half-moves ahead the AI looks. Each additional ply roughly multiplies thinking time by the branching factor (~5-6 with alpha-beta pruning). Depth 3 is fast (tens of ms), depth 4 is ~1-2 seconds, depth 5+ may be slow for real-time use.

**Noise** adds a small randomw offset (in centipawns) to each candidate move's score at the root. This prevents robotic identical play and simulates human imprecision. It is applied once at the root only - adding noice at every depth would compound and produce incoherent play.

## Running Tests
```bash
# Engine tests (147 tests)
npx ts-node src/Chess.test.ts

# AI tests (12 tests)
npx ts-node src/ai.test.ts
```

## Drop-in Replacement for chess.js

Change one line in your project:
```typescript
// Before:
import { Chess } from 'chess.js'

// After:
import { Chess } from '../chess.ts/src/Chess';
```

All existing method calls remain identical.

## Architecture

The engine is split into focused modules - each file has one responsibility.
```
src/
├── GameEngine.ts        # Abstract base class — the contract all games must fulfil
├── Chess.ts             # Public API — orchestrates all modules below
├── ai.ts                # AI opponent - minimax, alpha-beta pruning, evaluation
├── types.ts             # Shared types: Color, PieceSymbol, Piece, Move
├── constants.ts         # Direction offsets, FLAG values
├── board.ts             # BoardState, FEN parsing/generation, square indexing
├── attacks.ts           # isAttacked, inCheck, findKing
├── moves/
│   ├── generate.ts      # Pseudo-legal move generation for all piece types
│   ├── filter.ts        # Legal move filtering — removes moves that leave king in check
│   └── apply.ts         # Executes a move on the board, updates all state
├── notation/
│   ├── san.ts           # Standard Algebraic Notation generation
│   └── pgn.ts           # PGN export and import
├── Chess.test.ts        # 147 tests covering all rules and edge cases
└── ai.test.ts           # 12 tests covering AI correctness and API contract
```

### Key design decisions

**Flat 64-element array** - the board is stored as `(Piece | null)[]` with index `rank * 8 + file`. This makes piece movement arithmetic simple - a room moving up one rank is always `index + 8`, a diagonal step is `index + 9`, etc.

**Two-stage move generation** - moves are first generated pseudo-legally (can the piece physically reach that square?) then filtered by applying each move to a copy of the board and checking if the kind is left in check. This keeps each stage simple and easy to debug independently.

**Inward attack detection** - rather than asking "what can each enemy piece attack?", `isAttacked` shoots rays outward from the target square and checks what it hits. This is faster and avoids iterating the whole board for every check query.

**Snapshot-based undo** - `Chess.move()` saves a complete copy of the BoardState before applying each move. Chess.undo() pops and restores it in O(1). This makes AI search fast - at depth 4 with thousands of `move()`/`undo()` calls, there is no replay overhead.

**AI as a pure layer** - `ai.ts` only calls the public `Chess` API (`moves()`, `move()`, `undo()`, `isGameOver()`, `isCheckmate()`, `board()`). It has no access to internal board state and no knowledge of move generation. Adding a different evaluation function or search algorithm requires no changes to the engine.

**`GameEngine` base class** - `Chess` extends an abstract `GameEngine` class that defines the interface any two-player game must implement. Adding a new game (Chess960, Crazyhouse, or something entirely different) means extending `GameEngine` and implementing its abstract methods.

### How the AI works

The AI uses **minimax search** - it explores a tree of future positions to a fixed depth, assuming both players play optimally. At each node:
 * If it is White's turn (maximizing): pick the child with the highest score
 * If it is Black's turn (minimizing): pick the child with the lowest score

Positions are scored by the **evaluation function**: the sum of all White piece values minus all Black piece values, adjusted by **Piece-Square Tables** (PSTs) that encode positional knowledge - a knight on e4 is worth more than a knight on a1, a king near the center in the middlegame is penalised, and so on. Scores are in centipawns (1 pawn = 100).

**Alpha-beta pruning** makes this practical. Two bounds, α and β, are passed through the recursion. If the maximizer already ahs a guaranteed score >= β, the minimizer will never allow that branch - so the search stops early. With good move ordering this reduces the effective branching factor from ~40 to ~√30 ≈ 5.5, allowing depth-4 search in roughly the same time as a naive depth-3 search.

### Adding a chess variant

1. Create `src/YourVariant.ts`
2. `export class YourVariant extends GameEngine`
3. Implement all abstract methods - at minimum `move()`, `moves()`, `fen()`, `load()`, `turn()`, `isCheck()`, `isCheckmate()`, `isStalemate()`, `isDraw()`, `isGameOver()`, `history()`, `undo()`, `reset()`, `clear()`, `get()`, `put()`, `remove()`, `board()`, `pgn()`, `loadPgn()`
4. Reuse anything from `board.ts`, `attacks.ts` `moves/` that still applies
5. Add a test file following the pattern in `Chess.test.ts`

## License

MIT

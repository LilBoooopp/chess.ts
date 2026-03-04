# Contributing

Contributions are welcome - bug fixes, new features, additional tests, or documentation improvements.

## Getting started
```bash
git clone git@github.com:LilBoooopp/chess.ts.git
cd chess.ts
npm install
npx ts-node src/Chess.test.ts # make sure all tests pass before you start
```

## Project structure

Read the architecture section in the README before making changes. Each file has a signle responsibility - keep it that way. If you're unsure where something belongs, open an issue and ask.

## Making changes

1. Fork the repository
2. Create a branch - `git switch -c your-feature-name`
3. Make your changes
4. Add or update tests in `Chess.test.ts` or `ai.test.ts`
5. Run the test suite - all tests must pass
6. Open a pull request with a clear description of what changed and why

## Code style

- TypeScript strict mode is enabled - no `any` types, no implicit nulls
- Always use `===` not `==`
- Export only what other files need - keep internals private
- Arrow functions for short utilities, named functions for anything with logic
- Put types in `types.ts`, constans in `constants.ts` - don't scatter them

## Adding tests

Tests live in `Chess.test.ts` and use the minimal harness at the top of that file
Follow the existing pattern:
```typescript
section('Your feature');
{
  const g = new Chess();
  g.load('your test position in FEN');
  expect('decription of what you are testing', g.someMethod(), expectedValue);
}
```

Use FEN positions to set up specific scenarios rather than playing many moves to reach them - it makes tests faster and easier to understand.

**Always verify your FEN positions manually before commiting**. A common source of bugs in tests is a position that looks correct but has a king in unexpected check, a piece blocking a ray, or an illegal arrangement. Use game.ascii() to visually confirm the board looks as intended, and trace each expected move to make sure it is actually legal in that position.

## Adding AI test
AI tests live in `ai.test.ts` and follow the same harness. A few additional guidelines:

**Use deterministic setups.** Always pass `{ noise: 0 }` in tests - noise is random by design and will cause test to fail intermittently. Only test noise behaviour qualitatively (e.g. "the AI plays differently across runs") if needed, never with `expect()`.

**Keep depth low.** Use `depth: 1` for evaluation sanity checks (does the AI take a free piece?), `depth: 2` for mate-in-one detection. Higher depths slow the test suite and are better suited for manual play testing.

## Reporting bugs

Open an issue with:
 - The FEN position where the bug occurs
 - The move or method call that triggers it
 - What you expected vs what actually happened

A failing test case that reproduces the bug is even better.

## What to work on

Some areas that could use improvement:

**Engine**
 - **Chess960** - castling rules differ, would make a good first variant
 - **Performance** - move generation could use bitboards for speed
 - **Validation** - `load()` could validate that the FEN represents a legal position
 - **PGN** - support for comments, variations, and NAG annotations
 - **More tests** - especially for edge cases in SAN disambiguation

**AI**
 - Move ordering - trying captures and checks first dramatically improves alpha-beta cutoffs
 - Quiescence search - extend search on captures to avoid evaluating positions mid-exchange
 - Endgametables - separate PSTs for king activity in the endgame
 - Opening book - a small table of common openings to vary early play

## Questions

Open an issue - no question is too small.

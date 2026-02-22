# Contributing

Contributions are welcome - bug fixes, new features, additional tests, or documentation improvements.

## Getting started
```bash
git clone
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
4. Add or update tests in `Chess.test.ts`
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

## Reporting bugs

Open an issue with:
 - The FEN position where the bug occurs
 - The move or method call that triggers it
 - What you expected vs what actually happened

A failing test case that reproduces the bug is even better.

## What to work on

Some areas that could use improvement:

 - **Chess960** - castling rules differ, would make a good first variant
 - **Performance** - move generation could use bitboards for speed
 - **Validation** - `load()` could validate that the FEN represents a legal position
 - **PGN** - support for comments, variations, and NAG annotations
 - **More tests** - especially for edge cases in SAN disambiguation

## Questions

Open an issue - no question is too small.

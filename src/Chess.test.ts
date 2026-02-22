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

function results() {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('All tests passed!');
  else process.exit(1);
}

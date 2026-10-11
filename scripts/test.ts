/**
 * Root test runner (`pnpm test` → `vpr :test`): every package's plain `test`
 * script, with the live per-package display, warn/error distillation and
 * session logs — see test-runner.ts.
 */
import { runTestRunner } from './test-runner'

void runTestRunner({
  script: 'test',
  scope: 'tests',
  title: 'Integration & invariant tests',
})

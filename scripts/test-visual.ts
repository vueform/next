/**
 * Root visual-test runner (`pnpm test-visual` → `vpr :test-visual`): every
 * package's `test-visual` script (Playwright screenshot suites), with the
 * live per-package display — see test-runner.ts. Only the errors log is
 * written, and only when something fails.
 */
import { runTestRunner } from './test-runner'

void runTestRunner({
  script: 'test-visual',
  scope: 'tests-visual',
  title: 'Visual tests',
  kind: 'playwright',
  logs: 'errors-only',
})

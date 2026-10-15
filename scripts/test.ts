/**
 * Root test runner (`pnpm test` → `vpr :test`): every package's plain `test`
 * script, with the live per-package display, warn/error distillation and
 * session logs — see test-runner.ts.
 */

// Tests run source through the vitest factory, which lives in utils' DIST —
// and the runner's display does too. Under vp the task's dependsOn builds
// it; on a fresh checkout run `pnpm exec vpr :build:utils` first.

const { runTestRunner } = await import('./test-runner')
await runTestRunner({
  script: 'test',
  scope: 'tests',
  title: 'Integration & invariant tests',
})

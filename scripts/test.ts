/**
 * Root test runner (`pnpm test` → `vpr :test`): every package's plain `test`
 * script, with the live per-package display, warn/error distillation and
 * session logs — see test-runner.ts.
 */
import { ensureUtilsDist } from './ensure-utils'

// Tests run source through the vitest factory, which lives in utils' DIST —
// and the runner's display does too. Warm it before the dynamic import.
ensureUtilsDist()

async function main(): Promise<void> {
  const { runTestRunner } = await import('./test-runner')
  await runTestRunner({
    script: 'test',
    scope: 'tests',
    title: 'Integration & invariant tests',
  })
}

void main()

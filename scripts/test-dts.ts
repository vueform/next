/**
 * Root dts-test runner (`pnpm test-dts` → `vpr :test-dts`): every package's
 * `test-dts` script (source-level type assertions), with the live
 * per-package display, warn/error distillation and session logs — see
 * test-runner.ts.
 */
import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

const { runTestRunner } = await import('./test-runner')
await runTestRunner({
  script: 'test-dts',
  scope: 'tests-dts',
  title: 'DTS tests',
})

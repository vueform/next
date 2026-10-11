/**
 * Root smoke runner (`pnpm test-smoke`): every adapter's `test-smoke` CLI
 * through the shared fan-out — see smoke-root.ts for the pack/cache model
 * and the flag handling.
 */
import { runSmokeRoot } from './smoke-root'

void runSmokeRoot({ script: 'test-smoke', tag: 'smoke' })

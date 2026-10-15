#!/usr/bin/env node
/**
 * `vfd smoke`: runs the smoke suite of the invoking adapter package (see
 * `smoke/cli.ts` for the flag model and `smoke/envs.ts` for the env matrix).
 * Runs from the adapter's own directory against its canonical
 * `tests/smoke/` content, typically as its `test-smoke` script:
 *
 *     pnpm --filter @vueform/<adapter> test-smoke [--env <name>] [--build]
 */
import { runSmokeCli } from './smoke'

void runSmokeCli()

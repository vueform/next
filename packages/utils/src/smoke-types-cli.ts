#!/usr/bin/env node
/**
 * `vfd smoke-types`: runs the smoke-types suite of the invoking adapter
 * package (see `smoke/types-cli.ts` for the flag model and
 * `smoke/types-envs.ts` for the env matrix). Runs from the adapter's own
 * directory against its canonical `tests/smoke/` content, typically as its
 * `test-smoke-types` script:
 *
 *     pnpm --filter @vueform/<adapter> test-smoke-types [--env <name>] [--build]
 */
import { runSmokeTypesCli } from './smoke'

void runSmokeTypesCli()

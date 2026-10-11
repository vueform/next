#!/usr/bin/env node
/**
 * `vf-smoke-types`: runs the smoke-types suite of the invoking adapter
 * package (see `smoke/typesCli.ts` for the flag model and
 * `smoke/typesEnvs.ts` for the env matrix). Runs from the adapter's own
 * directory against its canonical `tests/smoke/` content, typically as its
 * `test-smoke-types` script:
 *
 *     pnpm --filter @vueform/<adapter> test-smoke-types [--env <name>] [--build]
 */
import { runSmokeTypesCli } from './smoke'

void runSmokeTypesCli()

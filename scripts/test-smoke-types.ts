/**
 * Root smoke-types runner (`pnpm test-smoke-types`): the dist-types pipeline.
 * First the attw gate through its GUI (scripts/attw.ts — same rows as the
 * standalone `pnpm attw`, cached via `vpr :attw`), then every adapter's
 * `test-smoke-types` CLI through the shared fan-out: real consumer
 * typechecks of the same tarballs (see `@vueform/utils/smoke` typesEnvs.ts
 * for the env matrix).
 *
 * attw checks that the shipped types RESOLVE; the consumer envs check that
 * their CONTENTS hold up. Both gates report before the run fails.
 */
import { spawnSync } from 'node:child_process'

import { runSmokeRoot } from './smoke-root'

const attwGui = (repoRoot: string): Promise<boolean> => {
  const result = spawnSync('pnpm', ['exec', 'tsx', 'scripts/attw.ts'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  return Promise.resolve(result.status === 0)
}

void runSmokeRoot({
  script: 'test-smoke-types',
  tag: 'smoke-types',
  gate: attwGui,
})

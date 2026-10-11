import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The playground lib imports `@vueform/utils` from its DIST — make sure it
 * is current before `./lib` loads (entries import the lib dynamically after
 * calling this). Invoked here with captured output (vp-cached, instant on a
 * warm hit) instead of a `vpr … &&` prefix in the root scripts, so a cache
 * replay does not dump the original build log before an interactive command.
 */
export function ensureUtilsDist(): void {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
  )
  const build = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (build.status !== 0) {
    console.error(build.stdout + build.stderr)
    process.exit(build.status ?? 1)
  }
}

/**
 * Builds `@vueform/utils`' dist before anything imports it. The root runners
 * resolve utils through the workspace link to its DIST, which does not exist
 * on a fresh clone — every entry point calls this first and only then
 * `await import`s the modules that need it (tsx hoists static imports, so a
 * static import of `./runner`/`./terminal` would crash before any code runs).
 *
 * Self-contained on purpose (node builtins only). Invoked as a vp task
 * (cached, instant on a warm hit) rather than wired as a vp dependsOn, so the
 * runners keep the real TTY and their live displays work.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

export function ensureUtilsDist(): void {
  const build = spawnSync('pnpm', ['exec', 'vpr', ':build:utils'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  if (build.status !== 0) {
    console.error(build.stdout + build.stderr)
    process.exit(build.status ?? 1)
  }
}

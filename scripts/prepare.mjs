/**
 * Runs on every `pnpm install` (the `prepare` lifecycle script): wires up the
 * per-clone git integration contributors can't get from repo content alone,
 * because git refuses to auto-activate executable config from a clone. Two
 * pieces: the husky hooks under .husky/ (lint-staged, commitlint, and the
 * pre-push auto-sync of CI-regenerated content) and the `regenlocal` merge
 * driver that .gitattributes references, which resolves pull/rebase conflicts
 * in CI-regenerated paths to the local side. A clone that skipped prepare
 * degrades gracefully — git falls back to ordinary conflicts. Linked
 * worktrees share the clone's config, so one run covers them.
 *
 * Deliberately a no-op in CI: the workflows commit and push regenerated
 * artifacts under their own push discipline, and neither the lint hooks nor
 * the pre-push auto-sync may interfere with the bot's git operations.
 */
import { spawnSync } from 'node:child_process'

if (process.env.CI) process.exit(0)

const run = (cmd, args) =>
  spawnSync(cmd, args, {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

// A registry/tarball install has no repo to configure.
if (spawnSync('git', ['rev-parse', '--is-inside-work-tree']).status !== 0) {
  process.exit(0)
}

const husky = run('pnpm', ['exec', 'husky'])
// During a rebase %B is the side being replayed (the LOCAL work); see the
// comment in .gitattributes.
const driver = run('git', ['config', 'merge.regenlocal.driver', 'cp -- %B %A'])

process.exit(husky.status || driver.status || 0)

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findPackageDir } from './project.mjs'

/**
 * "Settling" brings just-written copies in line with the project's own
 * formatting, so the user's format-on-save won't change them afterwards (which
 * would trip the hash-based modified/conflict checks). Provenance hashes are
 * taken AFTER settling — they describe the file as it landed in the project.
 */

// Borrows the project's own prettier install (the CLI is zero-dependency, same
// pattern as autoregister's typescript borrow). Null when not installed.
async function loadPrettier(cwd) {
  const dir = findPackageDir('prettier', cwd)

  if (!dir) return null

  try {
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
    const mod = await import(
      pathToFileURL(path.join(dir, pkg.main ?? 'index.cjs')).href
    )
    return mod.default ?? mod
  } catch {
    return null
  }
}

/**
 * Formats the given files (absolute paths) with the project's prettier — only
 * when prettier is installed AND an explicit project config resolves for the
 * file (factory defaults are never applied: without a config there is nothing
 * safe to match). Only the passed files are touched, never anything else in the
 * project. Returns the number of files rewritten; failures are silent — the
 * copies are already correct, settling is cosmetic.
 */
export async function settleFiles(cwd, absPaths) {
  let settled = 0

  try {
    const prettier = await loadPrettier(cwd)

    if (!prettier) return 0

    for (const abs of absPaths) {
      const config = await prettier.resolveConfig(abs)

      if (!config) continue

      const source = readFileSync(abs, 'utf8')
      const formatted = await prettier.format(source, {
        ...config,
        filepath: abs,
      })

      if (formatted !== source) {
        writeFileSync(abs, formatted)
        settled++
      }
    }
  } catch {
    return settled
  }

  return settled
}

/**
 * Runs the user's `postCopy` command from vueform.config.json once per copy
 * run, from the project root. `{files}` in the command is replaced with the
 * shell-quoted list of written files (project-relative); without the
 * placeholder the command runs as-is. Returns true when the command exited 0.
 */
export function runPostCopy(cwd, command, relPaths) {
  const files = relPaths
    .map((rel) => `'${rel.replace(/'/g, `'\\''`)}'`)
    .join(' ')
  const resolved = command.includes('{files}')
    ? command.replaceAll('{files}', files)
    : command

  const result = spawnSync(resolved, {
    shell: true,
    cwd,
    stdio: 'inherit',
  })

  return result.status === 0
}

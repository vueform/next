#!/usr/bin/env node
/**
 * `vf-validate-build`: validates the invoking adapter package's per-component
 * styles.ts imports against the classes its components emit (see
 * `validateBuild.ts`). Runs from the adapter's own directory as the second
 * half of its `build` script (`vite build && vf-validate-build`), so a drifted
 * styles.ts fails the build.
 *
 *     vf-validate-build [--verbose] [--suggest]
 *
 * - `--verbose` print each component's declared and matched providers
 * - `--suggest` print inferred styles.ts content per component instead of
 *   validating — used to seed/refresh the sidecars
 */
import { validateBuild } from './validateBuild'

const args = process.argv.slice(2)

try {
  const problems = validateBuild({
    packageDir: process.cwd(),
    verbose: args.includes('--verbose'),
    suggest: args.includes('--suggest'),
  })
  process.exit(problems ? 1 : 0)
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

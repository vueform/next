#!/usr/bin/env node
/**
 * `vf-validate-source`: validates the invoking adapter package's per-component
 * styles.ts imports against the classes its components emit (see
 * `validateSource.ts`). Works purely from the sources (chunks are compiled
 * from `src/scss` on the fly), so it runs from the adapter's own directory as
 * the FIRST half of its `build` script (`vf-validate-source && vite build`) —
 * a drifted styles.ts fails the build before anything is bundled.
 *
 *     vf-validate-source [--verbose] [--suggest]
 *
 * - `--verbose` print each component's declared and matched providers
 * - `--suggest` print inferred styles.ts content per component instead of
 *   validating — used to seed/refresh the sidecars
 */
import { validateSource } from './validateSource'

const args = process.argv.slice(2)

try {
  const problems = validateSource({
    packageDir: process.cwd(),
    verbose: args.includes('--verbose'),
    suggest: args.includes('--suggest'),
  })
  process.exit(problems ? 1 : 0)
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

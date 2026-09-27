#!/usr/bin/env node
/**
 * `vf-registry`: regenerates the invoking adapter package's `registry` folder
 * (see `registry.ts`). Runs from the adapter's own directory, typically as its
 * `registry` script:
 *
 *     pnpm registry [ComponentName ...] [--check]
 */
import { generateRegistry } from './registry'

const args = process.argv.slice(2)

generateRegistry({
  packageDir: process.cwd(),
  components: args.filter((arg) => !arg.startsWith('--')),
  check: args.includes('--check'),
}).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})

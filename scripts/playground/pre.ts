import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after
// the warm-up above — dynamically, inside an async main (this file is
// CJS-compiled; top-level await is not available without type: module).
async function main(): Promise<void> {
  const { ensureReady, parseArgs, preview, resolveCombos } =
    await import('./lib')

  const tag = 'pg:pre'
  const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
  const [combo] = resolveCombos(tag, parsed)

  ensureReady(tag, combo)
  preview(tag, combo)
}

void main()

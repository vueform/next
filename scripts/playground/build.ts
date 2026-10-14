import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after the
// warm-up above — dynamically: a static import would be hoisted above it.
const { build, ensureReady, parseArgs, resolveCombos } = await import('./lib')

const tag = 'pg:build'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  ensureReady(tag, combo)
  build(tag, combo)
}

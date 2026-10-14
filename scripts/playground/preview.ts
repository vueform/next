import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after the
// warm-up above — dynamically: a static import would be hoisted above it.
const { ensureReady, parseArgs, previewOnly, resolveCombos } =
  await import('./lib')

const tag = 'pg:preview'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
previewOnly(tag, combo)

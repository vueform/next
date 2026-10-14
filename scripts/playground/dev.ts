import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after the
// warm-up above — dynamically: a static import would be hoisted above it.
const { dev, ensureReady, parseArgs, resolveCombos } = await import('./lib')

const tag = 'pg'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
dev(tag, combo)

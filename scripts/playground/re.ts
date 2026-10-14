import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after the
// warm-up above — dynamically: a static import would be hoisted above it.
const { parseArgs, resolveCombos, up } = await import('./lib')

const tag = 'pg:re'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  up(tag, combo, { force: true })
}

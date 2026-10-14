import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after the
// warm-up above — dynamically: a static import would be hoisted above it.
const { parseArgs, resolveCombos, up } = await import('./lib')

const tag = 'pg:up'
const parsed = parseArgs(process.argv.slice(2), {
  tag,
  extraFlags: ['force'],
})
const force = parsed.flags.has('force')

let created = 0

for (const combo of resolveCombos(tag, parsed)) {
  if (up(tag, combo, { force })) created++
}

if (!created) {
  console.log(`[${tag}] Done. Nothing new was created.`)
}

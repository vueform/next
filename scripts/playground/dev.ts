// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
const { dev, ensureReady, parseArgs, resolveCombos } = await import('./lib')

const tag = 'pg'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
dev(tag, combo)

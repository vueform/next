// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
const { ensureReady, parseArgs, previewOnly, resolveCombos } =
  await import('./lib')

const tag = 'pg:preview'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
previewOnly(tag, combo)

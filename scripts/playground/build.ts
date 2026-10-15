// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
const { build, ensureReady, parseArgs, resolveCombos } = await import('./lib')

const tag = 'pg:build'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  ensureReady(tag, combo)
  build(tag, combo)
}

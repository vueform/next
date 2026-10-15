// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
const { parseArgs, resolveCombos, up } = await import('./lib')

const tag = 'pg:re'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  up(tag, combo, { force: true })
}

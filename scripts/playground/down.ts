// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
const { down, existingCombos, parseArgs, resolveCombos } = await import('./lib')

const tag = 'pg:down'
const argv = process.argv.slice(2)

// No flags: tear down every existing playground across all modes.
// With flags: only the selected adapter/mode combos.
const combos = argv.length
  ? resolveCombos(tag, parseArgs(argv, { tag }))
  : existingCombos()

if (!combos.length) {
  console.log(`[${tag}] No playgrounds found in .playgrounds.`)
  process.exit(0)
}

let removed = 0

for (const combo of combos) {
  if (down(tag, combo)) removed++
}

if (!removed) {
  console.log(`[${tag}] Nothing was removed.`)
}

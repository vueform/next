import {
  down,
  existingCombos,
  parseArgs,
  repoRoot,
  resolveCombos,
  run,
} from './lib'

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
let workspaceRemoved = false

for (const combo of combos) {
  if (down(tag, combo)) {
    removed++
    if (!combo.standalone) workspaceRemoved = true
  }
}

if (!removed) {
  console.log(`[${tag}] Nothing was removed.`)
}

// Workspace playgrounds are importers in the root lockfile; re-sync it so
// their entries don't linger after removal.
if (workspaceRemoved) {
  console.log(`[${tag}] Syncing root lockfile...`)
  run('pnpm', ['install'], repoRoot)
}

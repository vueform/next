import { build, ensureReady, parseArgs, resolveCombos } from './lib'

const tag = 'pg:build'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  ensureReady(tag, combo)
  build(tag, combo)
}

import { parseArgs, resolveCombos, up } from './lib'

const tag = 'pg:re'
const parsed = parseArgs(process.argv.slice(2), { tag })

for (const combo of resolveCombos(tag, parsed)) {
  up(tag, combo, { force: true })
}

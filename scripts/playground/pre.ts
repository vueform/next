import { ensureReady, parseArgs, preview, resolveCombos } from './lib'

const tag = 'pg:pre'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
preview(tag, combo)

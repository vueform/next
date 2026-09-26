import { dev, ensureReady, parseArgs, resolveCombos } from './lib'

const tag = 'pg'
const parsed = parseArgs(process.argv.slice(2), { tag, singleAdapter: true })
const [combo] = resolveCombos(tag, parsed)

ensureReady(tag, combo)
dev(tag, combo)

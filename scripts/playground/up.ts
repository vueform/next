import { ensureUtilsDist } from './ensure-utils'

ensureUtilsDist()

// The lib imports @vueform/utils from its dist, so it loads only after
// the warm-up above — dynamically, inside an async main (this file is
// CJS-compiled; top-level await is not available without type: module).
async function main(): Promise<void> {
  const { parseArgs, resolveCombos, up } = await import('./lib')

  const tag = 'pg:up'
  const parsed = parseArgs(process.argv.slice(2), {
    tag,
    extraFlags: ['force'],
  })
  const force = parsed.flags.has('force')

  let created = 0

  for (const combo of resolveCombos(tag, parsed)) {
    if (up(tag, combo, { force })) created++
  }

  if (!created) {
    console.log(`[${tag}] Done. Nothing new was created.`)
  }
}

void main()

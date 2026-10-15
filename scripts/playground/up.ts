// The lib imports @vueform/utils from its dist (pre-built: vp dependsOn in
// tasks, `vpr :build:utils` on a fresh checkout).
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

import { pkgRun } from './run.js'

// `--vdom` / `--vapor` select the corresponding package script instead of the
// full `build` (which runs both dists where a vapor config exists). The flags
// are stripped so pkg-run doesn't pass them through to vite.
const MODES: Record<string, string> = {
  vdom: 'build:vdom',
  vapor: 'build:vapor',
}
const mode = process.argv.slice(2).find((a) => MODES[a.slice(2)])

if (mode) {
  process.argv = process.argv.filter((a) => a !== mode)
}

const scriptName = mode ? MODES[mode.slice(2)] : 'build'

pkgRun(scriptName, {
  defaults: ['core', 'ui', 'primevue'],
  groups: {
    vite: ['vite'],
    tools: ['devtools'],
  },
})

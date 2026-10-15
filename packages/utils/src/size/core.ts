import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Scenario } from './types'

/**
 * The building-blocks suite measures what each module, rule and locale adds on
 * top of the smallest possible build (`createVueform({ modules: { model } })`),
 * one item at a time. Modules, rules and locales live in `@vueform/core` and
 * are re-exported unchanged by every adapter, so this suite runs once against
 * `@vueform/core` and its numbers apply to all adapters.
 */

/**
 * Reads the registrable module names from modules/modules.ts (the source of
 * the `/modules` subpath) except the always-required `model`. Directories
 * under `src/modules/` are not the public list: some hold helper-only
 * surfaces with no module export (devtools).
 */
function moduleNames(pkgDir: string): string[] {
  const source = readFileSync(resolve(pkgDir, 'src/modules/modules.ts'), 'utf8')
  return [...source.matchAll(/export \{ (\w+) \} from/g)]
    .map((m) => m[1])
    .filter((name) => name !== 'model')
    .sort()
}

/**
 * Reads the public rule names from rules/index.ts. Some rules are exported
 * under an alias (`export { in_ as in }`), so the public name is the last
 * identifier of the export clause.
 */
function ruleNames(pkgDir: string): string[] {
  const source = readFileSync(resolve(pkgDir, 'src/rules/index.ts'), 'utf8')
  return [...source.matchAll(/export \{ (?:\w+ as )?(\w+) \} from/g)]
    .map((m) => m[1])
    .sort()
}

/**
 * Lists every locale of the core package.
 */
function localeNames(pkgDir: string): string[] {
  const dir = resolve(pkgDir, 'src/locales')
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts') && name !== 'index.ts')
    .map((name) => name.replace(/\.ts$/, ''))
    .sort()
}

/**
 * Entry with an explicit module list plus at most one extra building block. No
 * modules at all is a valid build target (`core`) even though the model module
 * is required at runtime — sizes are measured on builds, not running apps.
 * Rules are always imported under an alias because some public rule names
 * (`in`) are reserved words.
 */
function coreEntry(
  pkg: string,
  extra: { modules?: string[]; rule?: string; locale?: string } = {}
): string {
  const modules = extra.modules ?? []

  const imports = [
    `import { createVueform } from '${pkg}'`,
    ...(extra.locale
      ? [`import { ${extra.locale} } from '${pkg}/locales'`]
      : []),
    ...(modules.length
      ? [`import { ${modules.join(', ')} } from '${pkg}/modules'`]
      : []),
    ...(extra.rule
      ? [`import { ${extra.rule} as rule } from '${pkg}/rules'`]
      : []),
  ]

  const config = [
    `modules: {${modules.length ? ` ${modules.join(', ')} ` : ''}},`,
    ...(extra.rule ? [`rules: { '${extra.rule}': rule },`] : []),
    ...(extra.locale ? [`locales: { ${extra.locale} },`] : []),
  ]

  return `import { createApp } from 'vue'
${imports.join('\n')}
import App from './App.vue'

createApp(App)
  .use(
    createVueform({
${config.map((line) => `      ${line}`).join('\n')}
    })
  )
  .mount('#app')
`
}

export function coreScenarios(pkgDir: string, pkg: string): Scenario[] {
  const fixed: Scenario[] = [
    {
      name: 'baseline',
      group: 'fixed',
      description: 'Vite app only, no Vueform',
      entry: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`,
    },
    {
      name: 'core',
      group: 'fixed',
      description:
        'bare createVueform with no modules — the smallest possible import (not functional on its own: the model module is required at runtime)',
      entry: coreEntry(pkg),
    },
    {
      name: 'model',
      group: 'fixed',
      description:
        'core plus the required model module — the smallest build that actually works',
      entry: coreEntry(pkg, { modules: ['model'] }),
    },
  ]

  const modules: Scenario[] = [
    {
      // The other modules are measured next to model; model itself is what
      // the `model` build adds over the bare `core` build.
      name: 'module+model',
      group: 'module',
      item: 'model',
      base: 'core',
      description: 'the required model module alone, measured against core',
      entry: coreEntry(pkg, { modules: ['model'] }),
    },
    ...moduleNames(pkgDir).map((name): Scenario => ({
      name: `module+${name}`,
      group: 'module',
      item: name,
      base: 'model',
      // CSS is only counted where the theme module is registered.
      themed: name === 'theme',
      description: `model plus the ${name} module`,
      entry: coreEntry(pkg, { modules: ['model', name] }),
    })),
  ]

  // Directly measured all-included builds for the Total rows: modules and
  // rules share code, so the sum of the individual deltas over-counts it.
  const totals: Scenario[] = [
    {
      name: 'modules-all',
      group: 'ref',
      base: 'core',
      themed: true,
      description: 'every module registered — the Total row of Per-module cost',
      entry: `import { createApp } from 'vue'
import { createVueform } from '${pkg}'
import * as modules from '${pkg}/modules'
import App from './App.vue'

createApp(App)
  .use(createVueform({ modules }))
  .mount('#app')
`,
    },
    {
      name: 'rules-all',
      group: 'ref',
      base: 'model',
      description: 'model plus every rule — the Total row of Per-rule cost',
      entry: `import { createApp } from 'vue'
import { createVueform } from '${pkg}'
import { model } from '${pkg}/modules'
import * as rules from '${pkg}/rules'
import App from './App.vue'

createApp(App)
  .use(createVueform({ modules: { model }, rules }))
  .mount('#app')
`,
    },
  ]

  const rules: Scenario[] = ruleNames(pkgDir).map((name) => ({
    name: `rule+${name}`,
    group: 'rule',
    item: name,
    base: 'model',
    description: `model plus the ${name} rule`,
    entry: coreEntry(pkg, { modules: ['model'], rule: name }),
  }))

  const locales: Scenario[] = localeNames(pkgDir).map((name) => ({
    name: `locale+${name}`,
    group: 'locale',
    item: name,
    base: 'model',
    description: `model plus the ${name} locale`,
    entry: coreEntry(pkg, { modules: ['model'], locale: name }),
  }))

  return [...fixed, ...modules, ...totals, ...rules, ...locales]
}

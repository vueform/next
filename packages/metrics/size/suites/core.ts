import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Scenario } from '../lib/types'

const PKG = '@vueform/core'

/**
 * The building-blocks suite measures what each module, rule and locale adds on
 * top of the smallest possible build (`createVueform({ modules: { model } })`),
 * one item at a time. Modules, rules and locales live in `@vueform/core` and
 * are re-exported unchanged by every adapter, so this suite runs once against
 * `@vueform/core` and its numbers apply to all adapters.
 */

/**
 * Lists every module directory of the core package except the always-required
 * `model`.
 */
function moduleNames(monorepoRoot: string): string[] {
  const dir = resolve(monorepoRoot, 'packages/core/src/modules')
  return readdirSync(dir)
    .filter(
      (name) => name !== 'model' && statSync(resolve(dir, name)).isDirectory()
    )
    .sort()
}

/**
 * Reads the public rule names from rules/index.ts. Some rules are exported
 * under an alias (`export { in_ as in }`), so the public name is the last
 * identifier of the export clause.
 */
function ruleNames(monorepoRoot: string): string[] {
  const source = readFileSync(
    resolve(monorepoRoot, 'packages/core/src/rules/index.ts'),
    'utf8'
  )
  return [...source.matchAll(/export \{ (?:\w+ as )?(\w+) \} from/g)]
    .map((m) => m[1])
    .sort()
}

/**
 * Lists every locale of the core package.
 */
function localeNames(monorepoRoot: string): string[] {
  const dir = resolve(monorepoRoot, 'packages/core/src/locales')
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
  extra: { modules?: string[]; rule?: string; locale?: string } = {}
): string {
  const modules = extra.modules ?? []

  const imports = [
    `import { createVueform } from '${PKG}'`,
    ...(extra.locale
      ? [`import { ${extra.locale} } from '${PKG}/locales'`]
      : []),
    ...(modules.length
      ? [`import { ${modules.join(', ')} } from '${PKG}/modules'`]
      : []),
    ...(extra.rule
      ? [`import { ${extra.rule} as rule } from '${PKG}/rules'`]
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

export function coreScenarios(monorepoRoot: string): Scenario[] {
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
      entry: coreEntry(),
    },
    {
      name: 'model',
      group: 'fixed',
      description:
        'core plus the required model module — the smallest build that actually works',
      entry: coreEntry({ modules: ['model'] }),
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
      entry: coreEntry({ modules: ['model'] }),
    },
    ...moduleNames(monorepoRoot).map(
      (name): Scenario => ({
        name: `module+${name}`,
        group: 'module',
        item: name,
        base: 'model',
        // CSS is only counted where the theme module is registered.
        themed: name === 'theme',
        description: `model plus the ${name} module`,
        entry: coreEntry({ modules: ['model', name] }),
      })
    ),
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
import { createVueform } from '${PKG}'
import * as modules from '${PKG}/modules'
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
import { createVueform } from '${PKG}'
import { model } from '${PKG}/modules'
import * as rules from '${PKG}/rules'
import App from './App.vue'

createApp(App)
  .use(createVueform({ modules: { model }, rules }))
  .mount('#app')
`,
    },
  ]

  const rules: Scenario[] = ruleNames(monorepoRoot).map((name) => ({
    name: `rule+${name}`,
    group: 'rule',
    item: name,
    base: 'model',
    description: `model plus the ${name} rule`,
    entry: coreEntry({ modules: ['model'], rule: name }),
  }))

  const locales: Scenario[] = localeNames(monorepoRoot).map((name) => ({
    name: `locale+${name}`,
    group: 'locale',
    item: name,
    base: 'model',
    description: `model plus the ${name} locale`,
    entry: coreEntry({ modules: ['model'], locale: name }),
  }))

  return [...fixed, ...modules, ...totals, ...rules, ...locales]
}

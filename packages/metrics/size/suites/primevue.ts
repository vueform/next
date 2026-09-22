import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { pvDeps } from '../lib/pv-deps'
import type { Scenario } from '../lib/types'

const PKG = '@vueform/primevue'

/**
 * Every scenario except the plain baseline installs PrimeVue the way a real app
 * does: config + Aura preset + primeicons + the Tooltip directive that
 * createVueform registers anyway.
 */
const SHELL_IMPORTS = `import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Tooltip from 'primevue/tooltip'
import 'primeicons/primeicons.css'`

const SHELL_USE = `  .directive('tooltip', Tooltip)
  .use(PrimeVue, { theme: { preset: Aura } })`

/**
 * Lists every component directory of the primevue package.
 */
function allComponents(monorepoRoot: string): string[] {
  const dir = resolve(monorepoRoot, 'packages/primevue/src/components')
  return readdirSync(dir)
    .filter(
      (name) =>
        name.startsWith('Vf') && statSync(resolve(dir, name)).isDirectory()
    )
    .sort()
}

/**
 * Full-featured entry: theme, en_US locale, modules and rules are always
 * included; only the registered components vary.
 */
function createVueformEntry(options: {
  componentImports: string
  componentsValue: string
}): string {
  const { componentImports, componentsValue } = options

  const imports = [
    SHELL_IMPORTS,
    `import { createVueform } from '${PKG}'`,
    `import { en_US } from '${PKG}/locales'`,
    componentImports,
    `import * as rules from '${PKG}/rules'`,
    `import * as modules from '${PKG}/modules'`,
    `import { theme } from '${PKG}/themes'`,
  ].filter(Boolean)

  const config = [
    'locales: { en_US },',
    'theme,',
    `components: ${componentsValue},`,
    'modules,',
    'rules,',
  ]

  return `import { createApp } from 'vue'
${imports.join('\n')}
import App from './App.vue'

createApp(App)
${SHELL_USE}
  .use(
    createVueform({
${config.map((line) => `      ${line}`).join('\n')}
    })
  )
  .mount('#app')
`
}

/**
 * Entry that registers every component via its individual default entry point,
 * optionally excluding one (see the ui scenarios for why individual imports are
 * used instead of the barrel).
 */
function allComponentsEntry(components: string[], exclude?: string): string {
  const included = components.filter((name) => name !== exclude)
  return createVueformEntry({
    componentImports: included
      .map((name) => `import ${name} from '${PKG}/components/${name}'`)
      .join('\n'),
    componentsValue: `{ ${included.join(', ')} }`,
  })
}

/**
 * Minimal build with the theme module registered, optionally plus the theme
 * entry (tokens + structural CSS) — the base and subject of the Themes table.
 */
function themeEntry(withTheme = false): string {
  return `import { createApp } from 'vue'
${SHELL_IMPORTS}
import { createVueform } from '${PKG}'
import { model, theme } from '${PKG}/modules'
${withTheme ? `import { theme as pvTheme } from '${PKG}/themes'\n` : ''}import App from './App.vue'

createApp(App)
${SHELL_USE}
  .use(
    createVueform({
      modules: { model, theme },
${withTheme ? '      theme: pvTheme,\n' : ''}    })
  )
  .mount('#app')
`
}

/**
 * Full-featured entry with no components at all — the base of the per-component
 * Total row.
 */
function baseEntry(): string {
  return createVueformEntry({
    componentImports: '',
    componentsValue: '{}',
  })
}

/**
 * PrimeVue-only entry: the shell plus the given raw primevue/* modules,
 * registered on the app so the bundler retains them — no Vueform at all.
 */
function pvEntry(deps: string[]): string {
  const imports = deps.map(
    (dep, index) => `import Pv${index} from 'primevue/${dep}'`
  )
  const registrations = deps.map(
    (_, index) => `app.component('Pv${index}', Pv${index})`
  )

  return `import { createApp } from 'vue'
${SHELL_IMPORTS}
${imports.join('\n')}${imports.length ? '\n' : ''}import App from './App.vue'

const app = createApp(App)
app.directive('tooltip', Tooltip)
app.use(PrimeVue, { theme: { preset: Aura } })
${registrations.join('\n')}${registrations.length ? '\n' : ''}app.mount('#app')
`
}

export function primevueScenarios(monorepoRoot: string): Scenario[] {
  const all = allComponents(monorepoRoot)

  // PrimeVue-only reference scenarios, deduplicated by module set: many Vf
  // components add no new primevue/* module, so their reference is identical
  // to an existing one and doesn't need a separate build.
  const pvScenarios: Scenario[] = []
  const pvByDeps = new Map<string, string>()

  function ensurePv(name: string, components: string[]): string {
    const deps = pvDeps(monorepoRoot, components)
    const key = deps.join(',')
    const existing = pvByDeps.get(key)
    if (existing) return existing

    pvByDeps.set(key, name)
    pvScenarios.push({
      name,
      group: 'pv',
      description: `PrimeVue-only reference (${deps.length} primevue modules, no Vueform)`,
      entry: pvEntry(deps),
    })
    return name
  }

  const pvShell = ensurePv('pv-shell', [])
  const pvFull = ensurePv('pv-full', all)

  const fixed: Scenario[] = [
    {
      name: 'baseline',
      group: 'fixed',
      description: 'Vite app only, no Vueform, no PrimeVue',
      entry: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`,
    },
    {
      name: 'core',
      group: 'fixed',
      pv: pvShell,
      description:
        'bare createVueform with no modules — the smallest possible import (not functional on its own: the model module is required at runtime)',
      entry: `import { createApp } from 'vue'
${SHELL_IMPORTS}
import { createVueform } from '${PKG}'
import App from './App.vue'

createApp(App)
${SHELL_USE}
  .use(createVueform({ modules: {} }))
  .mount('#app')
`,
    },
    {
      name: 'model',
      group: 'fixed',
      pv: pvShell,
      description:
        'core plus the required model module — the smallest build that actually works',
      entry: `import { createApp } from 'vue'
${SHELL_IMPORTS}
import { createVueform } from '${PKG}'
import { model } from '${PKG}/modules'
import App from './App.vue'

createApp(App)
${SHELL_USE}
  .use(createVueform({ modules: { model } }))
  .mount('#app')
`,
    },
    {
      name: 'full',
      group: 'fixed',
      themed: true,
      pv: pvFull,
      description:
        'the full modular build — theme (tokens + CSS), en_US locale, every module, rule and component',
      entry: allComponentsEntry(all),
    },
  ]

  const refs: Scenario[] = [
    {
      name: 'components-base',
      group: 'ref',
      themed: true,
      pv: pvShell,
      description:
        'per-component reference: theme + en_US locale + modules + rules, with no components at all',
      entry: baseEntry(),
    },
    {
      name: 'themes-base',
      group: 'ref',
      themed: true,
      description:
        'per-theme reference: model + theme modules, no theme registered',
      entry: themeEntry(),
    },
  ]

  const themes: Scenario[] = [
    {
      name: 'theme+default',
      group: 'theme',
      item: 'default',
      themed: true,
      base: 'themes-base',
      description: 'themes-base plus the default theme (tokens + CSS)',
      entry: themeEntry(true),
    },
  ]

  const componentRemove: Scenario[] = all.map((name) => ({
    name: `all-minus-${name}`,
    group: 'component-remove',
    component: name,
    pv: ensurePv(
      `pv-all-minus-${name}`,
      all.filter((component) => component !== name)
    ),
    description: `full scenario without ${name}`,
    entry: allComponentsEntry(all, name),
  }))

  return [...fixed, ...refs, ...themes, ...componentRemove, ...pvScenarios]
}

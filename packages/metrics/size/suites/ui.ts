import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Scenario } from '../lib/types'

const PKG = '@vueform/ui'

/**
 * Lists every component directory of the ui package.
 */
function allComponents(monorepoRoot: string): string[] {
  const dir = resolve(monorepoRoot, 'packages/ui/src/components')
  return readdirSync(dir)
    .filter(
      (name) =>
        name.startsWith('Vf') && statSync(resolve(dir, name)).isDirectory()
    )
    .sort()
}

/**
 * Extra code injected into a generated entry, used by suites that build on top
 * of the ui scenarios (e.g. plugins).
 */
export interface EntryExtras {
  /**
   * Additional import lines.
   */
  imports?: string[]
  /**
   * Additional createVueform() config lines (must end with a comma).
   */
  config?: string[]
  /**
   * Statements placed between the imports and createApp().
   */
  statements?: string[]
}

/**
 * Full-featured entry: theme, en_US locale, modules and rules are always
 * included; only the registered components vary.
 */
function createVueformEntry(options: {
  componentImports: string
  componentsValue: string
  extras?: EntryExtras
}): string {
  const { componentImports, componentsValue, extras = {} } = options

  const imports = [
    `import { createVueform } from '${PKG}'`,
    `import { en_US } from '${PKG}/locales'`,
    componentImports,
    ...(extras.imports ?? []),
    `import * as rules from '${PKG}/rules'`,
    `import * as modules from '${PKG}/modules'`,
    `import { origin as theme } from '${PKG}/themes'`,
  ].filter(Boolean)

  const config = [
    'locales: { en_US },',
    'theme,',
    `components: ${componentsValue},`,
    'modules,',
    'rules,',
    ...(extras.config ?? []),
  ]

  const statements = extras.statements?.length
    ? `${extras.statements.join('\n')}\n\n`
    : ''

  return `import { createApp } from 'vue'
${imports.join('\n')}
import App from './App.vue'

${statements}createApp(App)
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
 * optionally excluding one. Using individual imports for both the "all"
 * reference and the "all minus X" scenarios keeps their module graphs identical
 * apart from the excluded component, which is what makes the removal-savings
 * delta meaningful.
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
 * The ui `full` scenario's entry with optional extra code, so other suites
 * (e.g. plugins) can build on the exact same base and stay in sync with it.
 */
export function uiFullEntry(
  monorepoRoot: string,
  extras?: EntryExtras
): string {
  const all = allComponents(monorepoRoot)
  return createVueformEntry({
    componentImports: all
      .map((name) => `import ${name} from '${PKG}/components/${name}'`)
      .join('\n'),
    componentsValue: `{ ${all.join(', ')} }`,
    extras,
  })
}

/**
 * Lists every theme of the ui package: theme files that export a theme named
 * after themselves (barrels like index.ts or tokens.ts export no such const).
 */
function themeNames(monorepoRoot: string): string[] {
  const dir = resolve(monorepoRoot, 'packages/ui/src/themes')
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ts'))
    .map((name) => name.replace(/\.ts$/, ''))
    .filter((name) =>
      readFileSync(resolve(dir, `${name}.ts`), 'utf8').includes(
        `export const ${name} `
      )
    )
    .sort()
}

/**
 * Minimal build with the theme module registered, optionally plus one theme
 * entry (tokens + structural CSS) — the base and subjects of the Themes table.
 */
function themeEntry(theme?: string): string {
  return `import { createApp } from 'vue'
import { createVueform } from '${PKG}'
import { model, theme } from '${PKG}/modules'
${theme ? `import { ${theme} } from '${PKG}/themes'\n` : ''}import App from './App.vue'

createApp(App)
  .use(
    createVueform({
      modules: { model, theme },
${theme ? `      theme: ${theme},\n` : ''}    })
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

export function uiScenarios(monorepoRoot: string): Scenario[] {
  const all = allComponents(monorepoRoot)

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
      entry: `import { createApp } from 'vue'
import { createVueform } from '${PKG}'
import App from './App.vue'

createApp(App)
  .use(createVueform({ modules: {} }))
  .mount('#app')
`,
    },
    {
      name: 'model',
      group: 'fixed',
      description:
        'core plus the required model module — the smallest build that actually works',
      entry: `import { createApp } from 'vue'
import { createVueform } from '${PKG}'
import { model } from '${PKG}/modules'
import App from './App.vue'

createApp(App)
  .use(createVueform({ modules: { model } }))
  .mount('#app')
`,
    },
    {
      name: 'full',
      group: 'fixed',
      themed: true,
      description:
        'the full modular build — Origin theme (tokens + CSS), en_US locale, every module, rule and component',
      entry: allComponentsEntry(all),
    },
  ]

  const refs: Scenario[] = [
    {
      name: 'components-base',
      group: 'ref',
      themed: true,
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

  const themes: Scenario[] = themeNames(monorepoRoot).map((name) => ({
    name: `theme+${name}`,
    group: 'theme',
    item: name,
    themed: true,
    base: 'themes-base',
    description: `themes-base plus the ${name} theme tokens`,
    entry: themeEntry(name),
  }))

  const componentRemove: Scenario[] = all.map((name) => ({
    name: `all-minus-${name}`,
    group: 'component-remove',
    component: name,
    description: `full scenario without ${name}`,
    entry: allComponentsEntry(all, name),
  }))

  return [...fixed, ...refs, ...themes, ...componentRemove]
}

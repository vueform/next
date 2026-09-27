import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { pvDeps } from './pvDeps'
import type { Scenario, SizeConfig } from './types'

/**
 * The adapter suite measures the bare core entry (`createVueform` imported
 * from the adapter, nothing installed), each component and each theme.
 *
 * The PrimeVue adapter's scenarios additionally install PrimeVue itself the
 * way a real app does (config + Aura preset + primeicons + Tooltip), and every
 * delta gets a matched PrimeVue-only reference build so reports can split it
 * into a raw-PrimeVue part and a Vueform part.
 */

/**
 * App shell code (PrimeVue adapter): imports and `app.use()` lines installing
 * the third-party library every scenario except the plain baseline needs.
 */
interface Shell {
  imports: string
  use: string
}

const PV_SHELL: Shell = {
  imports: `import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import Tooltip from 'primevue/tooltip'
import 'primeicons/primeicons.css'`,
  use: `  .directive('tooltip', Tooltip)
  .use(PrimeVue, { theme: { preset: Aura } })`,
}

/**
 * Extra code injected into a generated entry, used by suites that build on top
 * of the adapter scenarios (e.g. plugins).
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
 * Lists every theme of an adapter package: theme files that export a theme
 * named after themselves (barrels like index.ts or tokens.ts export no such
 * const). Adapters with a single unnamed theme (PrimeVue's `theme` lives in
 * tokens.ts) match nothing here and fall back to their default theme export.
 */
function themeNames(pkgDir: string): string[] {
  const dir = resolve(pkgDir, 'src/themes')
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
 * Full-featured entry: theme, en_US locale, modules and rules are always
 * included; only the registered components vary.
 */
function createVueformEntry(options: {
  pkg: string
  theme: string
  shell?: Shell
  componentImports: string
  componentsValue: string
  extras?: EntryExtras
}): string {
  const { pkg, theme, shell, componentImports, componentsValue, extras = {} } =
    options

  const imports = [
    ...(shell ? [shell.imports] : []),
    `import { createVueform } from '${pkg}'`,
    `import { en_US } from '${pkg}/locales'`,
    componentImports,
    ...(extras.imports ?? []),
    `import * as rules from '${pkg}/rules'`,
    `import * as modules from '${pkg}/modules'`,
    `import { ${theme === 'theme' ? 'theme' : `${theme} as theme`} } from '${pkg}/themes'`,
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
${shell ? `${shell.use}\n` : ''}  .use(
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
function allComponentsEntry(
  pkg: string,
  theme: string,
  shell: Shell | undefined,
  components: string[],
  exclude?: string
): string {
  const included = components.filter((name) => name !== exclude)
  return createVueformEntry({
    pkg,
    theme,
    shell,
    componentImports: included
      .map((name) => `import ${name} from '${pkg}/components/${name}'`)
      .join('\n'),
    componentsValue: `{ ${included.join(', ')} }`,
  })
}

/**
 * Minimal build with the theme module registered, optionally plus one theme
 * entry (tokens + structural CSS) — the base and subjects of the Themes table.
 */
function themeEntry(
  pkg: string,
  shell: Shell | undefined,
  theme?: string
): string {
  const themeImport = theme
    ? `import { ${theme === 'theme' ? 'theme as vfTheme' : `${theme} as vfTheme`} } from '${pkg}/themes'\n`
    : ''

  return `import { createApp } from 'vue'
${shell ? `${shell.imports}\n` : ''}import { createVueform } from '${pkg}'
import { model, theme } from '${pkg}/modules'
${themeImport}import App from './App.vue'

createApp(App)
${shell ? `${shell.use}\n` : ''}  .use(
    createVueform({
      modules: { model, theme },
${theme ? '      theme: vfTheme,\n' : ''}    })
  )
  .mount('#app')
`
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
${PV_SHELL.imports}
${imports.join('\n')}${imports.length ? '\n' : ''}import App from './App.vue'

const app = createApp(App)
app.directive('tooltip', Tooltip)
app.use(PrimeVue, { theme: { preset: Aura } })
${registrations.join('\n')}${registrations.length ? '\n' : ''}app.mount('#app')
`
}

/**
 * Lists every component directory of an adapter package.
 */
export function adapterComponents(pkgDir: string): string[] {
  const dir = resolve(pkgDir, 'src/components')
  return readdirSync(dir)
    .filter(
      (name) =>
        name.startsWith('Vf') && statSync(resolve(dir, name)).isDirectory()
    )
    .sort()
}

/**
 * An adapter's `full` scenario entry with optional extra code, so other suites
 * (e.g. plugins) can build on the exact same base and stay in sync with it.
 */
export function adapterFullEntry(
  pkgDir: string,
  pkg: string,
  config: SizeConfig,
  extras?: EntryExtras
): string {
  const all = adapterComponents(pkgDir)
  return createVueformEntry({
    pkg,
    theme: config.defaultTheme ?? 'origin',
    shell: pkg === '@vueform/primevue' ? PV_SHELL : undefined,
    componentImports: all
      .map((name) => `import ${name} from '${pkg}/components/${name}'`)
      .join('\n'),
    componentsValue: `{ ${all.join(', ')} }`,
    extras,
  })
}

export function adapterScenarios(
  pkgDir: string,
  pkg: string,
  config: SizeConfig
): Scenario[] {
  const isPv = pkg === '@vueform/primevue'
  const shell = isPv ? PV_SHELL : undefined
  const defaultTheme = config.defaultTheme ?? 'origin'
  const all = adapterComponents(pkgDir)

  // PrimeVue-only reference scenarios, deduplicated by module set: many Vf
  // components add no new primevue/* module, so their reference is identical
  // to an existing one and doesn't need a separate build.
  const pvScenarios: Scenario[] = []
  const pvByDeps = new Map<string, string>()

  function ensurePv(name: string, components: string[]): string | undefined {
    if (!isPv) return undefined

    const deps = pvDeps(pkgDir, components)
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
      description: `Vite app only, no Vueform${isPv ? ', no PrimeVue' : ''}`,
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
${shell ? `${shell.imports}\n` : ''}import { createVueform } from '${pkg}'
import App from './App.vue'

createApp(App)
${shell ? `${shell.use}\n` : ''}  .use(createVueform({ modules: {} }))
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
${shell ? `${shell.imports}\n` : ''}import { createVueform } from '${pkg}'
import { model } from '${pkg}/modules'
import App from './App.vue'

createApp(App)
${shell ? `${shell.use}\n` : ''}  .use(createVueform({ modules: { model } }))
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
      entry: allComponentsEntry(pkg, defaultTheme, shell, all),
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
      entry: createVueformEntry({
        pkg,
        theme: defaultTheme,
        shell,
        componentImports: '',
        componentsValue: '{}',
      }),
    },
    {
      name: 'themes-base',
      group: 'ref',
      themed: true,
      description:
        'per-theme reference: model + theme modules, no theme registered',
      entry: themeEntry(pkg, shell),
    },
  ]

  // Adapters with named theme files get one scenario per theme; adapters with
  // a single default theme export (PrimeVue) get a single `theme+default` row.
  const named = themeNames(pkgDir)
  const themes: Scenario[] = named.length
    ? named.map((name) => ({
        name: `theme+${name}`,
        group: 'theme' as const,
        item: name,
        themed: true,
        base: 'themes-base',
        description: `themes-base plus the ${name} theme tokens`,
        entry: themeEntry(pkg, shell, name),
      }))
    : [
        {
          name: 'theme+default',
          group: 'theme' as const,
          item: 'default',
          themed: true,
          base: 'themes-base',
          description: 'themes-base plus the default theme (tokens + CSS)',
          entry: themeEntry(pkg, shell, defaultTheme),
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
    entry: allComponentsEntry(pkg, defaultTheme, shell, all, name),
  }))

  return [...fixed, ...refs, ...themes, ...componentRemove, ...pvScenarios]
}

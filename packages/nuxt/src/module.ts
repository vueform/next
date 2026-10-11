import { existsSync } from 'node:fs'
import { join, resolve as pathResolve } from 'node:path'

import {
  addPlugin,
  addTemplate,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { consola } from 'consola'
import { addDependency } from 'nypm'

import type {
  AdapterName,
  InstallAdapterMode,
  ModuleOptions,
  UiModuleOptions,
} from './types'
import {
  detectPackageManager,
  getInstallCommand,
  isPackageInstalled,
  resolveAdapterComponents,
  resolveAdapterRules,
  resolvePackageDir,
} from './utils'

const UI_THEMES = ['origin', 'material'] as const

interface AdapterPreset {
  pkg: string
  transpile: string[]
  themeImport(options: ModuleOptions, rootDir: string): string
  /**
   * Packages the adapter builds on that the module offers to install when none
   * of them is present in any form. Never registered automatically — only
   * installed (with consent) and recommended.
   */
  companions?: { packages: string[]; hint: string }
}

const PRESETS: Record<AdapterName, AdapterPreset> = {
  ui: {
    pkg: '@vueform/ui',
    transpile: ['@vueform/core', '@vueform/ui'],
    themeImport(options, rootDir) {
      const theme = (options as UiModuleOptions).theme ?? 'origin'
      if ((UI_THEMES as readonly string[]).includes(theme)) {
        return `import { ${theme} as theme } from '@vueform/ui/themes'`
      }
      // Anything else is a module specifier with a default token-map export.
      // Relative paths anchor to the project root (the generated file lives
      // in the build dir).
      const specifier = theme.startsWith('.')
        ? pathResolve(rootDir, theme)
        : theme
      return `import theme from ${JSON.stringify(specifier)}`
    },
  },
  primevue: {
    pkg: '@vueform/primevue',
    transpile: ['@vueform/core', '@vueform/primevue'],
    themeImport() {
      return `import { theme } from '@vueform/primevue/themes'`
    },
    companions: {
      packages: ['primevue', '@primeuix/themes', '@primevue/nuxt-module'],
      hint:
        `PrimeVue installed. Add '@primevue/nuxt-module' to your nuxt.config ` +
        `\`modules\` and configure a theme (see https://primevue.org/nuxt).`,
    },
  },
}

interface TemplateOptions {
  adapterPkg: string
  themeImport: string
  locales: string[]
  components: string[]
  allComponentCount: number
  rules: string[]
  allRuleCount: number
  inlineConfig?: Record<string, any>
}

function generateConfigTemplate(opts: TemplateOptions): string {
  const lines: string[] = []

  const localeImports = opts.locales.join(', ')
  lines.push(`import { createVueform } from '${opts.adapterPkg}'`)
  lines.push(`import { ${localeImports} } from '${opts.adapterPkg}/locales'`)

  if (opts.components.length === opts.allComponentCount) {
    lines.push(`import * as components from '${opts.adapterPkg}/components'`)
  } else {
    const named = opts.components.join(', ')
    lines.push(`import { ${named} } from '${opts.adapterPkg}/components'`)
  }

  if (opts.rules.length === opts.allRuleCount) {
    lines.push(`import * as rules from '${opts.adapterPkg}/rules'`)
  } else {
    const ruleImports = opts.rules.map((r) => (r === 'in' ? 'in as in_' : r))
    lines.push(
      `import { ${ruleImports.join(', ')} } from '${opts.adapterPkg}/rules'`
    )
  }

  lines.push(`import * as modules from '${opts.adapterPkg}/modules'`)

  lines.push(opts.themeImport)

  lines.push(`import userConfig from '#vueform-user-config'`)

  lines.push('')

  if (opts.inlineConfig && Object.keys(opts.inlineConfig).length > 0) {
    lines.push(
      `const inlineConfig = ${JSON.stringify(opts.inlineConfig, null, 2)}`
    )
  } else {
    lines.push(`const inlineConfig = {}`)
  }

  lines.push('')

  if (opts.components.length !== opts.allComponentCount) {
    lines.push(`const resolvedComponents = { ${opts.components.join(', ')} }`)
  }

  if (opts.rules.length !== opts.allRuleCount) {
    const ruleEntries = opts.rules.map((r) => (r === 'in' ? 'in: in_' : r))
    lines.push(`const resolvedRules = { ${ruleEntries.join(', ')} }`)
  }

  lines.push('')

  const localesObj = `{ ${opts.locales.join(', ')} }`

  const componentsRef =
    opts.components.length === opts.allComponentCount
      ? 'components'
      : 'resolvedComponents'
  const rulesRef =
    opts.rules.length === opts.allRuleCount ? 'rules' : 'resolvedRules'

  lines.push(`export default function createPlugin() {`)
  lines.push(`  return createVueform({`)
  lines.push(`    theme,`)
  lines.push(`    components: ${componentsRef},`)
  lines.push(`    rules: ${rulesRef},`)
  lines.push(`    modules,`)
  lines.push(`    locales: ${localesObj},`)
  if (opts.locales.length > 1) {
    lines.push(`    locale: '${opts.locales[0]}',`)
  }
  lines.push(`    ...inlineConfig,`)
  lines.push(`    ...userConfig,`)
  lines.push(`  })`)
  lines.push(`}`)
  lines.push('')

  return lines.join('\n')
}

/**
 * Whether the current process can ask the user something and change their
 * dependencies: an interactive dev session, not CI or a production build.
 */
function canInstallInteractively(nuxt: Nuxt): boolean {
  return !!(nuxt.options.dev && process.stdout.isTTY && !process.env.CI)
}

/**
 * Makes sure `pkg` is installed, according to `mode`: prompt for consent
 * (default), install without asking, or fail with the install command. Returns
 * true when an install ran (the dev server must restart to pick up the new
 * package).
 */
async function ensureInstalled(
  nuxt: Nuxt,
  pkgs: string[],
  mode: InstallAdapterMode,
  reason: string
): Promise<boolean> {
  const rootDir = nuxt.options.rootDir
  const pm = detectPackageManager(rootDir)
  const commands = pkgs
    .map((pkg) => `  ${getInstallCommand(pm, pkg)}`)
    .join('\n')
  const failure = `[@vueform/nuxt] ${reason}\n\nInstall with:\n\n${commands}\n`

  if (mode === 'never' || !canInstallInteractively(nuxt)) {
    throw new Error(failure)
  }

  if (mode === 'prompt') {
    const confirmed = await consola.prompt(
      `[@vueform/nuxt] ${reason} Install ${pkgs.join(', ')} now?`,
      { type: 'confirm', cancel: 'null' }
    )
    if (confirmed !== true) throw new Error(failure)
  }

  for (const pkg of pkgs) {
    consola.start(`[@vueform/nuxt] Installing ${pkg}...`)
    await addDependency(pkg, { cwd: rootDir })
  }
  consola.success(`[@vueform/nuxt] Installed ${pkgs.join(', ')}.`)

  return true
}

// Re-exported so the public option/type surface lands in the built
// declarations (module-builder bundles from this entry; `index.ts` is the
// source-mode entry only).
export type * from './types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@vueform/nuxt',
    configKey: 'vueform',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: { css: true } as Partial<ModuleOptions>,
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const rootDir = nuxt.options.rootDir

    const preset = options.adapter && PRESETS[options.adapter]
    if (!preset) {
      throw new Error(
        `[@vueform/nuxt] Set \`vueform.adapter\` to one of: ${Object.keys(PRESETS).join(', ')}.`
      )
    }
    const adapterPkg = preset.pkg
    const installMode = options.installAdapter ?? 'prompt'

    if (
      !isPackageInstalled(rootDir, adapterPkg) &&
      !resolvePackageDir(rootDir, adapterPkg)
    ) {
      await ensureInstalled(
        nuxt,
        [adapterPkg],
        installMode,
        `The "${options.adapter}" adapter needs the "${adapterPkg}" package.`
      )
      // Resolution state predates the install — restart to pick it up.
      await nuxt.callHook('restart', { hard: true })
      return
    }

    // The adapter's own foundation (e.g. PrimeVue for @vueform/primevue):
    // when none of it is present in any form, offer to install it. It is
    // never registered automatically — the user may integrate it any way
    // they like (module, plugin, manual setup).
    if (preset.companions) {
      const [corePkg] = preset.companions.packages
      if (
        !isPackageInstalled(rootDir, corePkg) &&
        !resolvePackageDir(rootDir, corePkg)
      ) {
        await ensureInstalled(
          nuxt,
          preset.companions.packages,
          installMode,
          `The "${options.adapter}" adapter builds on "${corePkg}", which is not installed.`
        )
        consola.info(`[@vueform/nuxt] ${preset.companions.hint}`)
        await nuxt.callHook('restart', { hard: true })
        return
      }
    }

    const adapterDir = resolvePackageDir(rootDir, adapterPkg)
    if (!adapterDir) {
      throw new Error(
        `[@vueform/nuxt] Could not resolve "${adapterPkg}" package directory.`
      )
    }

    const locales = [
      ...new Set(options.locales?.length ? options.locales : ['en_US']),
    ]

    const allComponents = resolveAdapterComponents(adapterDir)
    let components: string[]

    if (options.include?.length) {
      components = options.include
    } else if (options.exclude?.length) {
      const excluded = new Set<string>(options.exclude)
      components = allComponents.filter((c) => !excluded.has(c))
    } else {
      components = allComponents
    }

    const allRules = resolveAdapterRules(adapterDir)
    let rules: string[]

    if (Array.isArray(options.rules)) {
      rules = options.rules
    } else if (options.rules?.include) {
      rules = options.rules.include
    } else if (options.rules?.exclude) {
      const excluded = new Set<string>(options.rules.exclude)
      rules = allRules.filter((r) => !excluded.has(r))
    } else {
      rules = allRules
    }

    const configPathBase = options.configPath ?? './vueform.config'
    const configPathTs = pathResolve(rootDir, `${configPathBase}.ts`)
    const configPathJs = pathResolve(rootDir, `${configPathBase}.js`)
    const hasConfigFile = existsSync(configPathTs) || existsSync(configPathJs)
    const configFilePath = existsSync(configPathTs)
      ? configPathTs
      : configPathJs

    if (!hasConfigFile) {
      addTemplate({
        filename: 'vueform/user-config.ts',
        getContents: () => 'export default {}\n',
      })
      nuxt.options.alias['#vueform-user-config'] = join(
        nuxt.options.buildDir,
        'vueform/user-config'
      )
    } else {
      nuxt.options.alias['#vueform-user-config'] = configFilePath
    }

    addTemplate({
      filename: 'vueform/resolved-config.ts',
      getContents: () =>
        generateConfigTemplate({
          adapterPkg,
          themeImport: preset.themeImport(options, rootDir),
          locales,
          components,
          allComponentCount: allComponents.length,
          rules,
          allRuleCount: allRules.length,
          inlineConfig: options.config,
        }),
    })

    nuxt.options.alias['#vueform-resolved-config'] = join(
      nuxt.options.buildDir,
      'vueform/resolved-config'
    )

    const hasCustomComponents = !!(
      options.include?.length || options.exclude?.length
    )

    addTypeTemplate({
      filename: 'types/vueform.d.ts',
      getContents: () => {
        if (hasCustomComponents) {
          return (
            components
              .map((c) => `import '${adapterPkg}/components/${c}'`)
              .join('\n') + '\n'
          )
        }
        return `import '${adapterPkg}/components'\n`
      },
    })

    nuxt.options.build.transpile.push(...preset.transpile)

    if (isPackageInstalled(rootDir, '@vueform/dompurify')) {
      nuxt.options.vite ??= {}
      nuxt.options.vite.ssr ??= {}
      ;((nuxt.options.vite.ssr.external ??= []) as string[]).push(
        'isomorphic-dompurify'
      )
    }

    addPlugin(resolve('./runtime/plugin'))
  },
})

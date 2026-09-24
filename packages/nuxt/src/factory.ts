import { existsSync } from 'node:fs'
import { join, resolve as pathResolve } from 'node:path'
import {
  addPlugin,
  addTemplate,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import {
  detectPackageManager,
  getInstallCommand,
  isPackageInstalled,
  resolveAdapterComponents,
  resolveAdapterRules,
  resolvePackageDir,
} from './utils'
import type { BaseModuleOptions } from './types'
import type { NuxtModule } from '@nuxt/schema'

export interface AdapterNuxtConfig<
  TOptions extends BaseModuleOptions<string> = BaseModuleOptions,
> {
  meta: { name: string; configKey: string }
  adapterPkg: string
  transpile: string[]
  defaults: Partial<TOptions>
  generateThemeImport(opts: {
    css: boolean
    options: TOptions
    rootDir: string
  }): string
}

export function createVueformNuxtModule<
  TOptions extends BaseModuleOptions<string> = BaseModuleOptions,
>(config: AdapterNuxtConfig<TOptions>): NuxtModule<TOptions, TOptions, false> {
  return defineNuxtModule<TOptions>({
    meta: config.meta,
    defaults: config.defaults as any,
    setup(options, nuxt) {
      const { resolve } = createResolver(import.meta.url)
      const rootDir = nuxt.options.rootDir
      const adapterPkg = config.adapterPkg

      if (!isPackageInstalled(rootDir, adapterPkg)) {
        const pm = detectPackageManager(rootDir)
        const cmd = getInstallCommand(pm, adapterPkg)
        throw new Error(
          `[${config.meta.name}] The adapter package "${adapterPkg}" is not installed.\n\n` +
            `  ${cmd}\n`
        )
      }

      const adapterDir = resolvePackageDir(rootDir, adapterPkg)
      if (!adapterDir) {
        throw new Error(
          `[${config.meta.name}] Could not resolve "${adapterPkg}" package directory.`
        )
      }

      const locales = [
        ...new Set(options.locales?.length ? options.locales : ['en_US']),
      ]

      const allComponents = resolveAdapterComponents(adapterDir)
      let components: string[]

      if (Array.isArray(options.components)) {
        components = options.components
      } else if (options.components?.include) {
        components = options.components.include
      } else if (options.components?.exclude) {
        const excluded = new Set(options.components.exclude)
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
            themeImport: config.generateThemeImport({
              css: options.css !== false,
              options,
              rootDir,
            }),
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
        options.components &&
        (Array.isArray(options.components) ||
          options.components.include ||
          options.components.exclude)
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

      nuxt.options.build.transpile.push(...config.transpile)

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

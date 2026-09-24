import { resolve as pathResolve } from 'node:path'
import {
  createVueformNuxtModule,
  type BaseModuleOptions,
} from '@vueform/core/nuxt'

const BUILT_IN_THEMES = ['origin', 'material'] as const

type ThemeName = (typeof BUILT_IN_THEMES)[number]

// The generated name-only union — referencing the component barrel instead
// would load every component's d.ts and activate ALL type augmentations.
type ComponentName = import('@vueform/ui/components/names').ComponentNames

export interface ModuleOptions extends BaseModuleOptions<ComponentName> {
  /**
   * A built-in theme name (`origin`, `material`) — or a module specifier whose
   * default export is the token map (`~/themes/midnight`, a package name, or a
   * path relative to the project root).
   */
  theme?: ThemeName | (string & {})
}

export default createVueformNuxtModule<ModuleOptions>({
  meta: { name: '@vueform/ui', configKey: 'vueform' },
  adapterPkg: '@vueform/ui',
  transpile: ['@vueform/core', '@vueform/ui'],
  defaults: { css: true, theme: 'origin' },
  generateThemeImport({ options, rootDir }) {
    const theme = options.theme ?? 'origin'
    if ((BUILT_IN_THEMES as readonly string[]).includes(theme)) {
      return `import { ${theme} as theme } from '@vueform/ui/themes'`
    }
    // Anything else is a module specifier with a default token-map export.
    // Relative paths anchor to the project root (the generated file lives in
    // the build dir).
    const specifier = theme.startsWith('.')
      ? pathResolve(rootDir, theme)
      : theme
    return `import theme from ${JSON.stringify(specifier)}`
  },
})

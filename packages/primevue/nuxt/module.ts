import {
  createVueformNuxtModule,
  type BaseModuleOptions,
} from '@vueform/core/nuxt'

// The generated name-only union — referencing the component barrel instead
// would load every component's d.ts and activate ALL type augmentations.
type ComponentName = import('@vueform/primevue/components/names').ComponentNames

export type ModuleOptions = BaseModuleOptions<ComponentName>

export default createVueformNuxtModule<ModuleOptions>({
  meta: { name: '@vueform/primevue', configKey: 'vueform' },
  adapterPkg: '@vueform/primevue',
  transpile: ['@vueform/core', '@vueform/primevue'],
  defaults: { css: true },
  generateThemeImport() {
    return `import { theme } from '@vueform/primevue/themes'`
  },
})

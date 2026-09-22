/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

declare module 'virtual:vf-active-adapter' {
  import type { AdapterEntry } from './adapters/types'

  const entry: AdapterEntry
  export default entry
}

declare module '@vueform/core' {
  import type { App } from 'vue'

  export const en_US: Record<string, any>

  export function createVueform(config: {
    locales: Record<string, any>
    locale: string
    components?: Record<string, any>
  }): { install: (app: App) => void }
}

declare module '@vueform/core/components' {
  const components: Record<string, any>
  export = components
}

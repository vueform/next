/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

// Vite aliases (config.mts) pointing at generated JSON: components/classes
// come from the api-extractor tree at the repo root (.api/<adapter>),
// keywords/types from the docs generator (docs/.generated/<adapter>).
declare module 'virtual:vf-generated/components' {
  const data: Record<string, any>
  export default data
}

declare module 'virtual:vf-generated/classes' {
  const data: Record<string, any>
  export default data
}

declare module 'virtual:vf-generated/keywords' {
  const data: Record<string, unknown>
  export default data
}

declare module 'virtual:vf-generated/types' {
  const data: string[]
  export default data
}

declare module 'virtual:vf-active-adapter' {
  import type { AdapterEntry } from './adapters/types'

  const entry: AdapterEntry
  export default entry
}

declare module '@vueform/core' {
  import type { App } from 'vue'

  export const en_US: Record<string, any>

  export const fetchHttpAdapter: unknown
  export const nativeDateAdapter: unknown

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

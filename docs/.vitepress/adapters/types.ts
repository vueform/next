import type { App } from 'vue'

export interface AdapterEntry {
  components: Record<string, any>
  rules?: Record<string, any>
  modules?: Record<string, any>
  defaultConfig: Record<string, any>
  theme?: Record<string, any>
  createVueform: (config: any) => { install: (app: App) => void }
  install?(app: App): void
  icon?(name: string): string
}

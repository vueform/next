declare const __VF_ADAPTERS__: AdapterOption[]

export interface AdapterOption {
  key: string
  label: string
  host: string
  devPort?: number
}

/**
 * The adapters known to the docs, injected at build time from docs/config.json
 * (`adapters` — key, displayName, host).
 */
export const adapters: AdapterOption[] = __VF_ADAPTERS__

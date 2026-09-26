/**
 * The packages the scrapers scan. The docs keep their own registry
 * (docs/config.json) for presentation concerns (hosts, sidebar configs, type
 * page output dirs); this one holds only what scraping needs.
 */

/**
 * Where core lives — a fact of the monorepo, not adapter configuration.
 * Scrapers read core from here and fall back here when an adapter has no own
 * copy of something.
 */
export const corePackage = 'packages/core'

export interface AdapterDef {
  /**
   * The adapter's own package directory relative to the monorepo root.
   */
  path: string
  /**
   * Core element type → adapter element type renames, applied to blueprint
   * types (mirrored by the adapter's `overrides.types` map in
   * docs/config.json).
   */
  typeOverrides?: Record<string, string>
}

export const adapters: Record<string, AdapterDef> = {
  // "ui" is the core-based default adapter: its structural data is scraped
  // from @vueform/core (the corePackage fallback); its own package holds only
  // styles, config and re-exports.
  ui: {
    path: 'packages/ui',
  },
  primevue: {
    path: 'packages/primevue',
    typeOverrides: {
      text: 'input-text',
      checkboxes: 'checkbox-group',
      radios: 'radio-button-group',
      radio: 'radio-button',
    },
  },
}

export const nonCoreAdapters = Object.entries(adapters).filter(
  ([name]) => name !== 'ui'
)

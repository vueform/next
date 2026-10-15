/**
 * The packages the extractors scan. The docs keep their own registry
 * (docs/config.json) for presentation concerns (hosts, sidebar configs, type
 * page output dirs); this one holds only what extraction needs.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'

import { pkgRoot } from './paths'

/**
 * Where core lives — a fact of the monorepo, not adapter configuration.
 * Extractors read core from here and fall back here when an adapter has no own
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
  /**
   * Hand-maintained descriptions for gaps in third-party docblocks the
   * adapter cannot fix upstream — flat keys: the output file, then the node
   * path exactly as missing.json prints it (`blueprints.date-picker.…`,
   * `components.VfInputMask.…`). Set onto empty descriptions; stale
   * entries warn.
   */
  missingDescriptions?: Record<string, string>
}

/**
 * The adapter registry lives in ../config.json. Of note there: "ui" is the
 * core-based default adapter — its structural data is extracted from
 * @vueform/core (the corePackage fallback); its own package holds only
 * styles, config and re-exports.
 */
export const adapters: Record<string, AdapterDef> = JSON.parse(
  fs.readFileSync(path.join(pkgRoot, 'config.json'), 'utf8')
).adapters

export const nonCoreAdapters = Object.entries(adapters).filter(
  ([name]) => name !== 'ui'
)

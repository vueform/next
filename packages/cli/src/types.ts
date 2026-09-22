import type { ParsedArgs } from './args.js'
import type { Output } from './output.js'

/**
 * Canonical registry shapes — mirrors the JSON Schemas in
 * `packages/core/.schemas/` (registry.json for the index, registry-item.json
 * for manifests). Update together with a `schemaVersion` bump.
 */

export interface RegistryIndexEntry {
  name: string
  type: 'component'
  description?: string
  element?: boolean
}

export interface RegistryIndex {
  $schema?: string
  schemaVersion: number
  package: string
  version: string
  items: RegistryIndexEntry[]
}

export interface RegistryFile {
  path: string
  target: string
  kind: 'component' | 'types' | 'style'
  optional?: boolean
  hash: string
}

export interface RegistryClone {
  path: string
  blueprint: string
  hash: string
  docs?: string
}

export interface RegistryItem {
  $schema?: string
  schemaVersion: number
  name: string
  type: 'component'
  package: string
  version: string
  description?: string
  files: RegistryFile[]
  imports?: string[]
  dependencies?: Record<string, string>
  registryDependencies?: string[]
  styles?: string[]
  register?: { component: string; import: string }
  docs?: string
  element?: boolean
  clone?: RegistryClone
}

/**
 * A successfully located adapter registry.
 */
export interface Registry {
  /**
   * Discriminant vs RegistryError — commands branch on `registry.error`.
   */
  error?: undefined
  package: string
  dir: string
  index: RegistryIndex
}

/**
 * `loadRegistry` failure surface.
 */
export interface RegistryError {
  error: 'no-package' | 'no-registry' | 'invalid' | 'version'
  package?: string
  found?: unknown
}

/**
 * vueform.config.json — the CLI's own config file (mirrors schema.json).
 */
export interface CopyEntry {
  package: string
  version: string
  files: Record<string, { hash: string; registryHash?: string }>
}

export interface CloneEntry {
  base: string
  type: string
  package: string
  version: string
  files: Record<string, { hash: string }>
}

export interface CliConfig {
  $schema?: string
  componentsDir?: string
  autoRegister?: boolean
  postCopy?: string
  copies?: Record<string, CopyEntry>
  clones?: Record<string, CloneEntry>
  [key: string]: unknown
}

/**
 * Context handed to every command's `run`.
 */
export interface CommandContext extends ParsedArgs {
  out: Output
}

/**
 * One CLI command's definition (usage line, flags, runner).
 */
export interface Command {
  name: string
  usage: string
  description: string
  flags?: [string, string][]
  examples?: string[]
  valueFlags?: string[]
  run(ctx: CommandContext): void | Promise<void>
}

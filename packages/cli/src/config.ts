import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { detectProjectType } from './project.js'
import type { CliConfig, CloneEntry, CopyEntry } from './types.js'

// vueform.config.json is the CLI's own config file — it does not hold the
// Vueform instance config (defineConfig), only CLI settings. The $schema
// field points at the schema shipped with @vueform/cli for editor
// autocomplete and validation.
export const CONFIG_FILENAME = 'vueform.config.json'

const SCHEMA_PATH = './node_modules/@vueform/cli/schema.json'

// schema.json sits next to dist/ in the installed package.
const OWN_SCHEMA = fileURLToPath(new URL('../schema.json', import.meta.url))

/**
 * The `$schema` value for a project's config file. Hoisting installs (npm,
 * yarn) expose @vueform/cli at the project's root node_modules even when it
 * arrives transitively (adapter → core → cli); isolated installs (pnpm) don't, so the
 * schema shipped with this very package is referenced by relative path instead.
 * Both resolve locally in editors — no network needed.
 */
function schemaRef(configPath: string): string {
  const projectDir = path.dirname(path.resolve(configPath))
  const hoisted = path.join(projectDir, SCHEMA_PATH)

  if (existsSync(hoisted) || !existsSync(OWN_SCHEMA)) return SCHEMA_PATH

  const rel = path.relative(projectDir, OWN_SCHEMA).split(path.sep).join('/')

  // Outside the project (global install, npx cache): the hoisted path is the
  // least-wrong pointer — it starts resolving once the package is installed.
  return rel.startsWith('..') ? SCHEMA_PATH : `./${rel}`
}

function readConfig(configPath: string): CliConfig | null | 'invalid' {
  if (!existsSync(configPath)) return null

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'))
    return config && typeof config === 'object' ? config : {}
  } catch {
    return 'invalid'
  }
}

/**
 * Reads `componentsDir` out of a vueform.config.json. Returns null when the
 * file is missing, unreadable, or doesn't hold the key.
 */
export function readComponentsDir(configPath: string) {
  const config = readConfig(configPath)

  if (!config || config === 'invalid') return null

  return typeof config.componentsDir === 'string' ? config.componentsDir : null
}

export function componentsDirSnippet(dir: string) {
  return `"componentsDir": "${dir}"`
}

/**
 * Stores `componentsDir` in the config file, creating it when missing and
 * merging into it otherwise. Returns 'created', 'updated', or 'manual' when the
 * existing file isn't valid JSON.
 */
export function saveComponentsDir(configPath: string, dir: string) {
  const existing = readConfig(configPath)

  if (existing === 'invalid') return 'manual'

  const config = {
    $schema: schemaRef(configPath),
    ...existing,
    componentsDir: dir,
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  return existing ? 'updated' : 'created'
}

/**
 * Records copied components' provenance under the config's `copies` key (source
 * package, version, per-file hashes), merging with existing entries. `entries`
 * is a map of component name → entry. Returns 'manual' when the config file
 * isn't valid JSON.
 */
export function recordCopies(
  configPath: string,
  entries: Record<string, CopyEntry>
) {
  const existing = readConfig(configPath)

  if (existing === 'invalid') return 'manual'

  const config = { $schema: schemaRef(configPath), ...existing }
  config.copies = { ...config.copies, ...entries }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  return existing ? 'updated' : 'created'
}

/**
 * Records a cloned element under the config's `clones` key (base component,
 * type, source package/version, per-file hashes). Returns 'manual' when the
 * config file isn't valid JSON.
 */
export function recordClone(
  configPath: string,
  name: string,
  entry: CloneEntry
) {
  const existing = readConfig(configPath)

  if (existing === 'invalid') return 'manual'

  const config = { $schema: schemaRef(configPath), ...existing }
  config.clones = { ...config.clones, [name]: entry }

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  return existing ? 'updated' : 'created'
}

/**
 * Removes entries from one of the config's provenance maps (`copies` or
 * `clones`). Drops the key entirely when empty. Returns true when the file was
 * rewritten; false when nothing was tracked (or the config is missing or
 * invalid).
 */
export function forgetEntries(
  configPath: string,
  key: 'copies' | 'clones',
  names: string[]
) {
  const existing = readConfig(configPath)

  if (!existing || existing === 'invalid' || !existing[key]) return false

  const config = { $schema: schemaRef(configPath), ...existing }
  const entries: Record<string, CopyEntry | CloneEntry> = { ...config[key] }
  let changed = false

  for (const name of names) {
    if (name in entries) {
      delete entries[name]
      changed = true
    }
  }

  if (!changed) return false

  if (Object.keys(entries).length) {
    ;(config as Record<string, unknown>)[key] = entries
  } else delete config[key]

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  return true
}

/**
 * Reads one top-level config value; null when the file is missing/invalid.
 */
export function getConfigValue(configPath: string, key: string) {
  const config = readConfig(configPath)
  return !config || config === 'invalid' ? null : (config[key] ?? null)
}

/**
 * Sets one top-level config value, merging with the existing file. Returns
 * 'manual' when the file isn't valid JSON.
 */
export function setConfigValue(
  configPath: string,
  key: string,
  value: unknown
) {
  const existing = readConfig(configPath)

  if (existing === 'invalid') return 'manual'

  const config = { $schema: schemaRef(configPath), ...existing, [key]: value }
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

  return existing ? 'updated' : 'created'
}

/**
 * Recommends a components directory: everything the CLI generates lives under a
 * single `vueform` directory in the project (components today, other generators
 * later) — `src/vueform/components` for Vite / src-based projects,
 * `vueform/components` otherwise (Nuxt, no src).
 */
export function recommendDir(cwd: string) {
  const exists = (...segments: string[]) =>
    existsSync(path.join(cwd, ...segments))
  const type = detectProjectType(cwd)

  if (type === 'nuxt') return 'vueform/components'
  if (type === 'vite' || exists('src')) return 'src/vueform/components'

  return 'vueform/components'
}

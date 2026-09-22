import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

export const ADAPTERS = ['@vueform/ui', '@vueform/primevue']

export const VUEFORM_PACKAGES = ['@vueform/core', ...ADAPTERS, '@vueform/cli']

/**
 * Finds an installed package's directory by walking node_modules upwards from
 * `from`. Resolved via the directories directly (instead of require.resolve)
 * because the packages' `exports` fields don't expose ./package.json.
 */
export function findPackageDir(name, from) {
  let dir = from

  while (true) {
    const candidate = path.join(dir, 'node_modules', name)

    if (existsSync(path.join(candidate, 'package.json'))) return candidate

    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

export function packageVersion(name, from) {
  const dir = findPackageDir(name, from)

  if (!dir) return null

  try {
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
    return pkg.version ?? null
  } catch {
    return null
  }
}

/**
 * The Vueform adapter package the project depends on (declared in
 * package.json), or null when none is found.
 */
export function detectAdapter(cwd) {
  try {
    const pkg = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    return ADAPTERS.find((name) => deps[name]) ?? null
  } catch {
    return null
  }
}

/**
 * The project type based on the build tool's config file: 'nuxt', 'vite', or
 * null when neither is recognized.
 */
export function detectProjectType(cwd) {
  const configOf = (tool) =>
    ['ts', 'js', 'mts', 'mjs'].some((ext) =>
      existsSync(path.join(cwd, `${tool}.config.${ext}`))
    )

  if (configOf('nuxt')) return 'nuxt'
  if (configOf('vite')) return 'vite'

  return null
}

const LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
]

export function detectPackageManager(cwd) {
  let dir = cwd

  while (true) {
    for (const [file, manager] of LOCKFILES) {
      if (existsSync(path.join(dir, file))) return manager
    }

    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * Lists the Vf* components of the installed adapter by scanning its dist/src
 * components directory — the fallback for adapter versions that ship no
 * registry. @vueform/core is never a source of copies (unsupported as a direct
 * dependency).
 */
export function listComponents(cwd) {
  const name = detectAdapter(cwd)

  if (!name) return null

  const pkgDir = findPackageDir(name, cwd)

  if (!pkgDir) return null

  for (const base of ['dist', 'src']) {
    const componentsDir = path.join(pkgDir, base, 'components')

    if (!existsSync(componentsDir)) continue

    const components = readdirSync(componentsDir)
      .filter(
        (entry) =>
          entry.startsWith('Vf') &&
          statSync(path.join(componentsDir, entry)).isDirectory()
      )
      .sort()

    if (components.length) {
      return {
        package: name,
        version: packageVersion(name, cwd),
        components,
      }
    }
  }

  return { package: name, version: packageVersion(name, cwd), components: [] }
}

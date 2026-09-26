import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * Resolves rule names when the adapter re-exports from @vueform/core/rules.
 */
function resolveRulesFromReExport(pkgDir: string, _content: string): string[] {
  const coreRulesBarrel = [
    resolve(
      pkgDir,
      'node_modules/@vueform/core/dist/modules/validation/rules/index.d.ts'
    ),
    resolve(pkgDir, 'node_modules/@vueform/core/dist/defaultRules.d.ts'),
    resolve(pkgDir, '../core/dist/modules/validation/rules/index.d.ts'),
    resolve(pkgDir, '../core/src/modules/validation/rules/index.ts'),
    resolve(pkgDir, '../core/src/rules/index.ts'),
  ]

  for (const barrelPath of coreRulesBarrel) {
    if (!existsSync(barrelPath)) continue

    const content = readFileSync(barrelPath, 'utf-8')
    const rules: string[] = []

    const exportMatches = content.matchAll(
      /export\s*\{\s*(\w+)(?:\s+as\s+(\w+))?\s*\}/g
    )
    for (const match of exportMatches) {
      const exportedName = match[2] ?? match[1]
      rules.push(exportedName)
    }

    return rules.sort()
  }

  return []
}

/**
 * Detects the package manager used in the project based on lockfile presence.
 */
export function detectPackageManager(
  rootDir: string
): 'pnpm' | 'npm' | 'yarn' | 'bun' {
  if (existsSync(resolve(rootDir, 'pnpm-lock.yaml'))) return 'pnpm'
  if (
    existsSync(resolve(rootDir, 'bun.lockb')) ||
    existsSync(resolve(rootDir, 'bun.lock'))
  )
    return 'bun'
  if (existsSync(resolve(rootDir, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

/**
 * Returns the install command for a given package manager and package name.
 */
export function getInstallCommand(
  pm: 'pnpm' | 'npm' | 'yarn' | 'bun',
  pkg: string
): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${pkg}`
    case 'yarn':
      return `yarn add ${pkg}`
    case 'bun':
      return `bun add ${pkg}`
    default:
      return `npm install ${pkg}`
  }
}

/**
 * Checks whether a package can be resolved from the project root.
 */
export function isPackageInstalled(rootDir: string, pkg: string): boolean {
  try {
    const pkgPath = resolve(rootDir, 'package.json')
    if (!existsSync(pkgPath)) return false

    const projectPkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const allDeps = {
      ...projectPkg.dependencies,
      ...projectPkg.devDependencies,
    }

    return pkg in allDeps
  } catch {
    return false
  }
}

/**
 * Resolves the root directory of an installed package by locating its
 * package.json via require.resolve-like traversal.
 */
export function resolvePackageDir(rootDir: string, pkg: string): string | null {
  const candidates = [
    resolve(rootDir, 'node_modules', pkg),
    resolve(rootDir, 'node_modules', '.pnpm', 'node_modules', pkg),
  ]

  for (const candidate of candidates) {
    if (existsSync(resolve(candidate, 'package.json'))) {
      return candidate
    }
  }

  try {
    const entryPath = resolve(rootDir, 'node_modules', pkg, 'package.json')
    if (existsSync(entryPath)) {
      return dirname(entryPath)
    }
  } catch {}

  return null
}

/**
 * Reads all component names from an adapter package by scanning its
 * dist/components or src/components directory.
 */
export function resolveAdapterComponents(pkgDir: string): string[] {
  const distDir = resolve(pkgDir, 'dist/components')
  const srcDir = resolve(pkgDir, 'src/components')

  const dir = existsSync(distDir) ? distDir : existsSync(srcDir) ? srcDir : null
  if (!dir) return []

  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('Vf'))
    .map((d) => d.name)
    .sort()
}

/**
 * Reads all rule names from the adapter's rules export by parsing the barrel
 * file for named export identifiers.
 */
export function resolveAdapterRules(pkgDir: string): string[] {
  const candidates = [
    resolve(pkgDir, 'dist/rules.d.ts'),
    resolve(pkgDir, 'dist/rules.mjs'),
    resolve(pkgDir, 'src/rules.ts'),
  ]

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue

    const content = readFileSync(filePath, 'utf-8')

    if (content.includes('export *')) {
      return resolveRulesFromReExport(pkgDir, content)
    }

    const matches = content.matchAll(/export\s*\{\s*(\w+)/g)
    const rules: string[] = []
    for (const match of matches) {
      const name = match[1]
      if (name === 'in_') continue
      rules.push(name)
    }
    return rules.sort()
  }

  return []
}

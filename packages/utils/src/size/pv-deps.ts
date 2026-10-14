import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Discovers the runtime `primevue/*` modules a Vf component pulls into the
 * bundle by scanning the .vue sources of its component directory. Type-only
 * imports (types.ts) are ignored since they never reach the bundle.
 */
export function componentPvDeps(pkgDir: string, component: string): string[] {
  const dir = resolve(pkgDir, 'src/components', component)
  if (!existsSync(dir)) return []

  const deps = new Set<string>()

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.vue')) continue
    const source = readFileSync(resolve(dir, file), 'utf8')
    for (const match of source.matchAll(
      /^import\s+\w+\s+from\s+'primevue\/([\w-]+)'/gm
    )) {
      deps.add(match[1])
    }
  }

  return [...deps].sort()
}

/**
 * Union of the PrimeVue modules used by a set of Vf components.
 */
export function pvDeps(pkgDir: string, components: string[]): string[] {
  const deps = new Set<string>()
  for (const component of components) {
    for (const dep of componentPvDeps(pkgDir, component)) {
      deps.add(dep)
    }
  }
  return [...deps].sort()
}

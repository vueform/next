export interface TokenJsonEntry {
  group: string
  subgroup?: string
  key: string
  default: string
  dark?: string
  description?: string
  file?: string
  line?: number
}

export function camelToKebab(str: string): string {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-z]{2,})(\d)/g, '$1-$2')
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')
    .toLowerCase()
}

export function tokenToCssVar(key: string): string {
  return `--vf-${camelToKebab(key)}`
}

/**
 * Discover token group names from the tokens.ts source in declaration order.
 * Filters out `dark` (overrides, not a standalone group).
 */
export function discoverTokenGroups(source: string): string[] {
  const groups: string[] = []
  const re = /^export\s+const\s+(\w+)\s*=/gm
  let m
  while ((m = re.exec(source)) !== null) {
    const name = m[1]
    if (name !== 'dark') groups.push(name)
  }
  return groups
}

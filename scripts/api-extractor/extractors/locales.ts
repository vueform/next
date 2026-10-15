import * as fs from 'node:fs'
import * as path from 'node:path'

import { corePackage } from '../lib/adapters'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

const { scope } = parseScope(process.argv.slice(2))
const LOCALES_DIR = path.join(monorepoRoot, corePackage, 'src/locales')

interface LocaleEntry {
  /**
   * The locale code, same as the object key.
   */
  key: string
  /**
   * The locale's display name in its own language (docblock @name).
   */
  name?: string
  /**
   * The locale's flag emoji (docblock @flag).
   */
  flag?: string
  /**
   * The docblock's prose description.
   */
  description: string
  /**
   * Repo-relative `path:line` of the locale's docblock (anchored at line 1 by
   * construction).
   */
  loc: string
}

/**
 * Parses the file's leading docblock: prose description plus the @name and
 *
 * @flag tags.
 */
function parseDocblock(source: string): Omit<LocaleEntry, 'key' | 'loc'> {
  const match = source.match(/^\/\*\*([\s\S]*?)\*\//)
  if (!match) return { description: '' }
  const lines = match[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())

  const out: Omit<LocaleEntry, 'key' | 'loc'> = { description: '' }
  const prose: string[] = []
  for (const line of lines) {
    const tag = line.match(/^@(name|flag)\s+(.*)$/)
    if (tag) {
      out[tag[1] as 'name' | 'flag'] = tag[2].trim()
    } else if (line && !line.startsWith('@')) {
      prose.push(line)
    }
  }
  out.description = prose.join(' ').trim()
  return out
}

function main() {
  const codes = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace('.ts', ''))
    .sort()

  const locales: Record<string, LocaleEntry> = {}
  for (const code of codes) {
    const filePath = path.join(LOCALES_DIR, `${code}.ts`)
    const source = fs.readFileSync(filePath, 'utf-8')
    locales[code] = {
      key: code,
      ...parseDocblock(source),
      loc: `${path.relative(monorepoRoot, filePath)}:1`,
    }
  }

  fs.mkdirSync(generatedDir, { recursive: true })
  fs.writeFileSync(
    path.join(generatedDir, 'locales.json'),
    JSON.stringify(locales, null, 2) + '\n'
  )

  console.log(`[locales] Generated locales.json with ${codes.length} locales`)
}

if (scope.core) {
  main()
} else {
  console.log('[locales] core not in scope, skipped')
}

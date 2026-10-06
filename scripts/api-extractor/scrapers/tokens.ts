import * as fs from 'node:fs'
import * as path from 'node:path'

import {
  discoverTokenGroups,
  tokenToCssVar,
  type TokenJsonEntry,
} from '@vueform/utils'

import { nonCoreAdapters } from '../lib/adapters'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const TOKENS_FILE = path.join(ROOT, 'packages/core/src/tokens/index.ts')
const GENERATED_DIR = generatedDir

// ---------------------------------------------------------------------------
// Token parsing
// ---------------------------------------------------------------------------

function parseAllTokenGroups(
  source: string,
  relPath: string
): Record<string, TokenJsonEntry> {
  const result: Record<string, TokenJsonEntry> = {}
  const groups = discoverTokenGroups(source)

  for (const groupName of groups) {
    const exportRegex = new RegExp(
      `export\\s+const\\s+${groupName}\\s*=\\s*\\{([\\s\\S]*?)\\n\\}`
    )
    const match = source.match(exportRegex)
    if (!match) continue

    const body = match[1]
    const bodyStartOffset = source.indexOf(body)
    const bodyStartLine = source.slice(0, bodyStartOffset).split('\n').length
    const lines = body.split('\n')
    let i = 0
    let currentSubgroup: string | undefined = undefined

    while (i < lines.length) {
      const line = lines[i]

      if (line.match(/^\s*\/\*\*/)) {
        // Capture docblock content
        const docLines: string[] = []
        const startLine = lines[i]
        if (startLine.match(/\*\/\s*$/)) {
          // Single-line docblock
          docLines.push(
            startLine
              .replace(/^\s*\/\*\*\s*/, '')
              .replace(/\s*\*\/\s*$/, '')
              .trim()
          )
          i++
        } else {
          i++
          while (i < lines.length && !lines[i].includes('*/')) {
            const cleaned = lines[i].replace(/^\s*\*\s?/, '').trim()
            if (cleaned && !cleaned.startsWith('@')) {
              docLines.push(cleaned)
            }
            i++
          }
          i++
        }

        // Skip comment-only lines, then check if next is a token key
        let j = i
        while (
          j < lines.length &&
          (lines[j].trim() === '' || lines[j].match(/^\s*\/\//))
        )
          j++

        if (j < lines.length) {
          const keyMatch = lines[j].match(/^\s*(\w+)\s*:\s*(.*)/)
          if (keyMatch) {
            const key = keyMatch[1]
            let value = keyMatch[2].trim().replace(/,\s*$/, '')

            if (!value) {
              let k = j + 1
              while (k < lines.length) {
                const nextLine = lines[k].trim()
                if (
                  !nextLine ||
                  nextLine.startsWith('//') ||
                  nextLine.startsWith('/*')
                ) {
                  k++
                  continue
                }
                value = nextLine.replace(/,\s*$/, '')
                break
              }
              i = k + 1
            } else if (
              (value.split("'").length - 1) % 2 !== 0 ||
              (value.split('"').length - 1) % 2 !== 0
            ) {
              let k = j + 1
              while (k < lines.length) {
                value += '\n' + lines[k]
                if (
                  (value.split("'").length - 1) % 2 === 0 &&
                  (value.split('"').length - 1) % 2 === 0
                )
                  break
                k++
              }
              value = value.trim().replace(/,\s*$/, '')
              i = k + 1
            } else {
              i = j + 1
            }

            if (
              (value.startsWith("'") && value.endsWith("'")) ||
              (value.startsWith('"') && value.endsWith('"'))
            ) {
              value = value.slice(1, -1)
            }

            const cssVar = tokenToCssVar(key)
            const description = docLines.join(' ') || undefined
            result[cssVar] = {
              group: groupName,
              ...(currentSubgroup ? { subgroup: currentSubgroup } : {}),
              key,
              default: value,
              ...(description ? { description } : {}),
              file: relPath,
              line: bodyStartLine + j,
            }
            continue
          }
        }
        continue
      }

      if (line.match(/^\s*\/\//)) {
        const sectionMatch = line.match(/\/\/\s*={3,}\s+(.+?)\s+={3,}/)
        if (sectionMatch) {
          currentSubgroup = sectionMatch[1].trim()
        }
        i++
        continue
      }

      const keyMatch = line.match(/^\s*(\w+)\s*:\s*(.*)/)
      if (keyMatch) {
        const key = keyMatch[1]
        let value = keyMatch[2].trim()

        value = value.replace(/,\s*$/, '')

        if (!value) {
          i++
          while (i < lines.length) {
            const nextLine = lines[i].trim()
            if (
              !nextLine ||
              nextLine.startsWith('//') ||
              nextLine.startsWith('/*')
            ) {
              i++
              continue
            }
            value = nextLine.replace(/,\s*$/, '')
            break
          }
        } else if (
          (value.split("'").length - 1) % 2 !== 0 ||
          (value.split('"').length - 1) % 2 !== 0
        ) {
          i++
          while (i < lines.length) {
            value += '\n' + lines[i]
            const singleQuotes = (value.split("'").length - 1) % 2
            const doubleQuotes = (value.split('"').length - 1) % 2
            if (singleQuotes === 0 && doubleQuotes === 0) break
            i++
          }
          value = value.trim().replace(/,\s*$/, '')
        }

        if (
          (value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }

        const cssVar = tokenToCssVar(key)
        result[cssVar] = {
          group: groupName,
          key,
          default: value,
          file: relPath,
          line: bodyStartLine + i,
        }
      }

      i++
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Adapter token parsing
// ---------------------------------------------------------------------------

/**
 * Parse an adapter's tokens.ts for direct property assignments that are NOT
 * spread from core groups (i.e. custom adapter-only tokens).
 */
function parseAdapterTokens(
  source: string,
  coreTokens: Record<string, TokenJsonEntry>,
  relPath: string
): Record<string, TokenJsonEntry> {
  const result: Record<string, TokenJsonEntry> = {}

  // Core token entries by camelCase key: an adapter redeclaring a core key
  // overrides it (its own default/dark/docs win, the rest is inherited).
  const coreByKey = new Map(
    Object.values(coreTokens).map((entry) => [entry.key, entry])
  )

  const constRegex = /(?:^|\n)\s*const\s+(\w+)\s*=\s*\{([\s\S]*?)\n\}/g
  let constMatch

  while ((constMatch = constRegex.exec(source)) !== null) {
    const blockName = constMatch[1]
    // A `…Dark` block holds dark-mode overrides: its values attach to the
    // already-collected entries as `dark` instead of becoming entries.
    const isDarkBlock = /dark$/i.test(blockName)
    const body = constMatch[2]
    const bodyStartOffset = constMatch.index + constMatch[0].indexOf(body)
    const bodyStartLine = source.slice(0, bodyStartOffset).split('\n').length
    const lines = body.split('\n')
    let i = 0
    let currentSubgroup: string | undefined = undefined

    while (i < lines.length) {
      const line = lines[i]

      if (line.match(/^\s*\.\.\./)) {
        i++
        continue
      }
      if (line.match(/^\s*\/\//)) {
        const sectionMatch = line.match(/\/\/\s*={3,}\s+(.+?)\s+={3,}/)
        if (sectionMatch) {
          currentSubgroup = sectionMatch[1].trim()
        }
        i++
        continue
      }
      if (line.match(/^\s*\/\*\*/)) {
        // Capture docblock content
        const docLines: string[] = []
        if (line.match(/\*\/\s*$/)) {
          docLines.push(
            line
              .replace(/^\s*\/\*\*\s*/, '')
              .replace(/\s*\*\/\s*$/, '')
              .trim()
          )
          i++
        } else {
          i++
          while (i < lines.length && !lines[i].includes('*/')) {
            const cleaned = lines[i].replace(/^\s*\*\s?/, '').trim()
            if (cleaned && !cleaned.startsWith('@')) {
              docLines.push(cleaned)
            }
            i++
          }
          i++
        }

        // Find the next token key
        let j = i
        while (
          j < lines.length &&
          (lines[j].trim() === '' || lines[j].match(/^\s*\/\//))
        )
          j++

        if (j < lines.length) {
          const keyMatch = lines[j].match(/^\s*(\w+)\s*:\s*(.*)/)
          if (keyMatch) {
            const key = keyMatch[1]

            let value = keyMatch[2].trim().replace(/,\s*$/, '')

            if (!value) {
              let k = j + 1
              while (k < lines.length) {
                const nextLine = lines[k].trim()
                if (
                  !nextLine ||
                  nextLine.startsWith('//') ||
                  nextLine.startsWith('/*')
                ) {
                  k++
                  continue
                }
                value = nextLine.replace(/,\s*$/, '')
                break
              }
              i = k + 1
            } else if (
              (value.split("'").length - 1) % 2 !== 0 ||
              (value.split('"').length - 1) % 2 !== 0
            ) {
              let k = j + 1
              while (k < lines.length) {
                value += '\n' + lines[k]
                if (
                  (value.split("'").length - 1) % 2 === 0 &&
                  (value.split('"').length - 1) % 2 === 0
                )
                  break
                k++
              }
              value = value.trim().replace(/,\s*$/, '')
              i = k + 1
            } else {
              i = j + 1
            }

            if (
              (value.startsWith("'") && value.endsWith("'")) ||
              (value.startsWith('"') && value.endsWith('"'))
            ) {
              value = value.slice(1, -1)
            }

            const cssVar = tokenToCssVar(key)
            const coreEntry = coreByKey.get(key)
            if (isDarkBlock) {
              if (result[cssVar]) {
                result[cssVar].dark = value
              } else if (coreEntry) {
                result[cssVar] = { ...coreEntry, dark: value }
              }
              continue
            }
            const description = docLines.join(' ') || undefined
            result[cssVar] = coreEntry
              ? {
                  ...coreEntry,
                  ...(currentSubgroup ? { subgroup: currentSubgroup } : {}),
                  default: value,
                  ...(description ? { description } : {}),
                  file: relPath,
                  line: bodyStartLine + j,
                }
              : {
                  group: blockName,
                  ...(currentSubgroup ? { subgroup: currentSubgroup } : {}),
                  key,
                  default: value,
                  ...(description ? { description } : {}),
                  file: relPath,
                  line: bodyStartLine + j,
                }
            continue
          }
        }
        continue
      }

      const keyMatch = line.match(/^\s*(\w+)\s*:\s*(.*)/)
      if (keyMatch) {
        const key = keyMatch[1]

        let value = keyMatch[2].trim().replace(/,\s*$/, '')

        if (!value) {
          i++
          while (i < lines.length) {
            const nextLine = lines[i].trim()
            if (
              !nextLine ||
              nextLine.startsWith('//') ||
              nextLine.startsWith('/*')
            ) {
              i++
              continue
            }
            value = nextLine.replace(/,\s*$/, '')
            break
          }
        } else if (
          (value.split("'").length - 1) % 2 !== 0 ||
          (value.split('"').length - 1) % 2 !== 0
        ) {
          i++
          while (i < lines.length) {
            value += '\n' + lines[i]
            if (
              (value.split("'").length - 1) % 2 === 0 &&
              (value.split('"').length - 1) % 2 === 0
            )
              break
            i++
          }
          value = value.trim().replace(/,\s*$/, '')
        }

        if (
          (value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))
        ) {
          value = value.slice(1, -1)
        }

        const cssVar = tokenToCssVar(key)
        const coreEntry = coreByKey.get(key)
        if (isDarkBlock) {
          if (result[cssVar]) {
            result[cssVar].dark = value
          } else if (coreEntry) {
            result[cssVar] = { ...coreEntry, dark: value }
          }
          i++
          continue
        }
        result[cssVar] = coreEntry
          ? {
              ...coreEntry,
              ...(currentSubgroup ? { subgroup: currentSubgroup } : {}),
              default: value,
              file: relPath,
              line: bodyStartLine + i,
            }
          : {
              group: blockName,
              ...(currentSubgroup ? { subgroup: currentSubgroup } : {}),
              key,
              default: value,
              file: relPath,
              line: bodyStartLine + i,
            }
      }

      i++
    }
  }

  return result
}

/**
 * Parse the `export const dark = { ... }` block and return a map of key →
 * value.
 */
function parseDarkOverrides(source: string): Record<string, string> {
  const exportRegex = /export\s+const\s+dark\s*=\s*\{([\s\S]*?)\n\}/
  const match = source.match(exportRegex)
  if (!match) return {}

  const body = match[1]
  const lines = body.split('\n')
  const overrides: Record<string, string> = {}
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.match(/^\s*\/\//) || line.match(/^\s*$/)) {
      i++
      continue
    }

    const keyMatch = line.match(/^\s*(\w+)\s*:\s*(.*)/)
    if (keyMatch) {
      const key = keyMatch[1]
      let value = keyMatch[2].trim().replace(/,\s*$/, '')

      if (!value) {
        i++
        while (i < lines.length) {
          const nextLine = lines[i].trim()
          if (!nextLine || nextLine.startsWith('//')) {
            i++
            continue
          }
          value = nextLine.replace(/,\s*$/, '')
          break
        }
      } else if (
        (value.split("'").length - 1) % 2 !== 0 ||
        (value.split('"').length - 1) % 2 !== 0
      ) {
        i++
        while (i < lines.length) {
          value += '\n' + lines[i]
          if (
            (value.split("'").length - 1) % 2 === 0 &&
            (value.split('"').length - 1) % 2 === 0
          )
            break
          i++
        }
        value = value.trim().replace(/,\s*$/, '')
      }

      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1)
      }

      overrides[key] = value
    }

    i++
  }

  return overrides
}

// ---------------------------------------------------------------------------
// Internal CSS var discovery
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const source = fs.readFileSync(TOKENS_FILE, 'utf-8')
  const coreRelPath = path.relative(ROOT, TOKENS_FILE)
  const tokensJson = parseAllTokenGroups(source, coreRelPath)

  // Merge dark overrides
  const darkOverrides = parseDarkOverrides(source)
  for (const [cssVar, entry] of Object.entries(tokensJson)) {
    if (darkOverrides[entry.key] !== undefined) {
      const {
        group,
        subgroup,
        key,
        default: def,
        description,
        file,
        line,
      } = entry
      tokensJson[cssVar] = {
        group,
        ...(subgroup ? { subgroup } : {}),
        key,
        default: def,
        dark: darkOverrides[entry.key],
        ...(description ? { description } : {}),
        ...(file ? { file } : {}),
        ...(line ? { line } : {}),
      }
    }
  }

  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(GENERATED_DIR, 'tokens.json'),
      JSON.stringify(tokensJson, null, 2)
    )
  }

  console.log(
    `[tokens] Generated tokens.json with ${Object.keys(tokensJson).length} tokens`
  )

  // Adapter tokens

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterTokensFile = [
      path.join(ROOT, adapterDef.path, 'src/themes/tokens.ts'),
      path.join(ROOT, adapterDef.path, 'src/tokens.ts'),
    ].find((file) => fs.existsSync(file))
    if (!adapterTokensFile) continue

    const adapterSource = fs.readFileSync(adapterTokensFile, 'utf-8')
    const adapterRelPath = path.relative(ROOT, adapterTokensFile)
    const adapterTokens = parseAdapterTokens(
      adapterSource,
      tokensJson,
      adapterRelPath
    )

    const adapterDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterDir, 'tokens.json'),
      JSON.stringify(adapterTokens, null, 2)
    )

    console.log(
      `[tokens] ${adapterName}: ${Object.keys(adapterTokens).length} custom token(s)`
    )
  }
}

main()

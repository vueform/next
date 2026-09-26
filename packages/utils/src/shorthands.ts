import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

export interface ShorthandPropsOptions {
  /**
   * Module specifier used when importing `PartProps` / `ClassProps` /
   * `ReclassProps` in the emitted `shorthands.d.ts`.
   *
   * Examples: `'../../types'` (core) or `'@vueform/core'` (adapters).
   */
  helpersFrom: string
}

const MARKER = '#shorthands'

/**
 * Keywords / builtins that never need to be imported into a generated generics
 * header.
 */
const IGNORED_IDENTIFIERS = new Set([
  'extends',
  'keyof',
  'typeof',
  'infer',
  'in',
  'string',
  'number',
  'boolean',
  'symbol',
  'bigint',
  'object',
  'any',
  'unknown',
  'never',
  'undefined',
  'null',
  'void',
  'true',
  'false',
  'Record',
  'Partial',
  'Required',
  'Readonly',
  'Pick',
  'Omit',
  'Exclude',
  'Extract',
  'NonNullable',
  'Array',
  'ReadonlyArray',
])

function extractGenericsHeader(content: string, start: number): string {
  let depth = 0
  for (let i = start; i < content.length; i++) {
    const char = content[i]
    if (char === '<') depth++
    else if (char === '>' && content[i - 1] !== '=') {
      depth--
      if (depth === 0) return content.slice(start, i + 1)
    }
  }
  throw new Error('Unbalanced generics header')
}

function splitTopLevel(inner: string): string[] {
  const parts: string[] = []
  let buf = ''
  let depth = 0
  for (let i = 0; i < inner.length; i++) {
    const char = inner[i]
    if ('<([{'.includes(char)) depth++
    else if ('>)]}'.includes(char) && inner[i - 1] !== '=') depth--
    if (char === ',' && depth === 0) {
      parts.push(buf)
      buf = ''
    } else {
      buf += char
    }
  }
  if (buf.trim()) parts.push(buf)
  return parts.map((p) => p.trim()).filter(Boolean)
}

function parseImports(
  content: string
): Map<string, { source: string; spec: string }> {
  const map = new Map<string, { source: string; spec: string }>()
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    const source = match[2]
    for (const raw of match[1].split(',')) {
      const spec = raw.replace(/\btype\b/g, '').trim()
      if (!spec) continue
      const asMatch = spec.match(/^(\w+)\s+as\s+(\w+)$/)
      if (asMatch) {
        map.set(asMatch[2], {
          source,
          spec: `${asMatch[1]} as ${asMatch[2]}`,
        })
      } else {
        map.set(spec, { source, spec })
      }
    }
  }
  return map
}

/**
 * Parse the props generics header (if any) from a component's `types.d.ts`, and
 * collect any extra imports needed to restate constraints/defaults.
 *
 * The merge target is `${component}Props` when it is an interface. When it is a
 * type alias (e.g. `LoosenProps<...GenericProps, ...>`), aliases cannot be
 * declaration-merged, so the target falls back to the
 * `${component}GenericProps` interface — the alias derives its keys from it, so
 * the injected shorthands still surface on `${component}Props`.
 */
function parsePropsGenerics(
  component: string,
  typesDts: string
):
  | { target: string; generics: string; extraImportLines: string[] }
  | { error: string } {
  let target = `${component}Props`
  let propsMatch = new RegExp(
    `export\\s+interface\\s+${component}Props\\b`
  ).exec(typesDts)
  if (!propsMatch) {
    if (new RegExp(`export\\s+type\\s+${component}Props\\b`).test(typesDts)) {
      target = `${component}GenericProps`
      propsMatch = new RegExp(`export\\s+interface\\s+${target}\\b`).exec(
        typesDts
      )
      if (!propsMatch) {
        return {
          error:
            `"export type ${component}Props" found but no ` +
            `"export interface ${target}" to merge into`,
        }
      }
    } else {
      return {
        error: `no "export interface ${component}Props" or "export type ${component}Props"`,
      }
    }
  }

  for (const suffix of ['Parts', 'Classes', 'Context']) {
    const memberRe = new RegExp(
      `export\\s+(?:interface|type)\\s+${component}${suffix}\\b`
    )
    if (!memberRe.test(typesDts)) {
      return { error: `no exported ${component}${suffix}` }
    }
  }

  let generics = ''
  const extraImports = new Map<string, Set<string>>()
  const afterProps = propsMatch.index + propsMatch[0].length
  const next = typesDts.slice(afterProps).match(/\S/)
  if (next && next[0] === '<') {
    const headerStart = afterProps + typesDts.slice(afterProps).indexOf('<')
    generics = extractGenericsHeader(typesDts, headerStart)

    const inner = generics.slice(1, -1)
    const params = splitTopLevel(inner)
    const paramNames = new Set(
      params.map((p) => (p.match(/^(\w+)/) ?? [])[1]).filter(Boolean)
    )

    const imports = parseImports(typesDts)
    const identifiers = inner.match(/[A-Za-z_$][\w$]*/g) ?? []
    for (const id of identifiers) {
      if (paramNames.has(id) || IGNORED_IDENTIFIERS.has(id)) continue
      const imported = imports.get(id)
      if (imported) {
        if (!extraImports.has(imported.source)) {
          extraImports.set(imported.source, new Set())
        }
        extraImports.get(imported.source)!.add(imported.spec)
      } else if (
        new RegExp(`export\\s+(?:interface|type)\\s+${id}\\b`).test(typesDts)
      ) {
        if (!extraImports.has('./types')) extraImports.set('./types', new Set())
        extraImports.get('./types')!.add(id)
      } else {
        return {
          error: `cannot resolve import for generics identifier "${id}"`,
        }
      }
    }
  }

  const extraImportLines = [...extraImports.entries()]
    .map(
      ([source, specs]) =>
        `import type { ${[...specs].sort().join(', ')} } from '${source}';`
    )
    .sort()

  return { target, generics, extraImportLines }
}

function buildShorthandsDts(
  component: string,
  target: string,
  helpersFrom: string,
  generics: string,
  extraImportLines: string[]
): string {
  const lines = [
    '/**',
    ' * AUTO-GENERATED by @vueform/utils — do not edit.',
    ' *',
    ' * Adds `part:*` / `class:*` / `reclass:*` shorthand attr types to the',
    " * component's props interface via declaration merging. Pulled in by the",
    " * `#shorthands` marker import on the component's default tier entry",
    ' * (styled.ts / unstyled.ts), rewritten to this file.',
    ' */',
    "import type { ClassProps, PartProps, ReclassProps } from '" +
      helpersFrom +
      "';",
    'import type { ' +
      component +
      'Classes, ' +
      component +
      'Context, ' +
      component +
      "Parts } from './types';",
    ...extraImportLines,
    '',
    "declare module './types' {",
    '    interface ' +
      target +
      generics +
      ' extends PartProps<' +
      component +
      'Parts, ' +
      component +
      'Context>, ClassProps<' +
      component +
      'Classes, ' +
      component +
      'Context>, ReclassProps<' +
      component +
      'Classes, ' +
      component +
      'Context> {',
    '    }',
    '}',
    '',
  ]
  return lines.join('\n')
}

/**
 * For each component tier entry d.ts under dist (`styled.d.ts` or
 * `unstyled.d.ts`) that still references `#shorthands`, write `shorthands.d.ts`
 * beside it and rewrite the import to `./shorthands`.
 */
function stripMarkerFromDts(paths: string[]): void {
  for (const path of paths) {
    const stripped = stripShorthandMarkerFromCode(readFileSync(path, 'utf-8'))
    writeFileSync(path, stripped)
  }
}

/**
 * Strip the runtime `#shorthands` marker import from emitted JS chunks.
 */
export function stripShorthandMarkerFromCode(code: string): string {
  return code
    .replace(/^import\s+['"]#shorthands['"]\s*;?\s*\n?/gm, '')
    .replace(/\nimport\s+['"]#shorthands['"]\s*;?/g, '')
}

export function injectShorthandPropsDts(
  distDir: string,
  options: ShorthandPropsOptions
): { written: number; skipped: string[] } {
  const componentsDir = resolve(distDir, 'components')
  if (!existsSync(componentsDir)) {
    return { written: 0, skipped: ['no dist/components'] }
  }

  let written = 0
  const skipped: string[] = []

  for (const entry of readdirSync(componentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('Vf')) continue

    const component = entry.name
    const componentDir = join(componentsDir, component)
    const tierDts = ['styled.d.ts', 'unstyled.d.ts']
      .map((name) => join(componentDir, name))
      .filter((path) => existsSync(path))
    const typesDtsPath = join(componentDir, 'types.d.ts')

    if (tierDts.length === 0) {
      skipped.push(component + ': no styled/unstyled d.ts')
      continue
    }

    // The marker may sit on either tier entry (or both) — a tier that
    // re-exports the marked one picks the augmentation up transitively.
    const markedDts = tierDts.filter((path) =>
      readFileSync(path, 'utf-8').includes(MARKER)
    )
    const augment = markedDts.length ? readFileSync(markedDts[0], 'utf-8') : ''
    if (!augment.includes(MARKER)) {
      skipped.push(component + ': no ' + MARKER + ' marker')
      continue
    }

    // No local types.d.ts: nothing to generate — a component re-exporting
    // another package's tier entry gets that package's generated shorthand
    // augmentation transitively. Strip any marker so the shipped d.ts
    // carries no unresolvable import.
    if (!existsSync(typesDtsPath)) {
      stripMarkerFromDts(markedDts)
      skipped.push(component + ': no types.d.ts (marker stripped)')
      continue
    }

    const typesDts = readFileSync(typesDtsPath, 'utf-8')
    const parsed = parsePropsGenerics(component, typesDts)
    if ('error' in parsed) {
      stripMarkerFromDts(markedDts)
      skipped.push(component + ': ' + parsed.error + ' (marker stripped)')
      continue
    }

    const content = buildShorthandsDts(
      component,
      parsed.target,
      options.helpersFrom,
      parsed.generics,
      parsed.extraImportLines
    )

    writeFileSync(join(componentDir, 'shorthands.d.ts'), content)

    for (const path of markedDts) {
      const rewritten = readFileSync(path, 'utf-8').replace(
        /import\s+['"]#shorthands['"]\s*;?/g,
        "import './shorthands';"
      )
      writeFileSync(path, rewritten)
    }
    written++
  }

  return { written, skipped }
}

/**
 * @internal — exposed for tests / diagnostics
 */
export function _relativeForLog(from: string, to: string): string {
  return relative(from, to)
}

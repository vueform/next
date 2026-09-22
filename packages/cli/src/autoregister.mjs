import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { findPackageDir } from './project.mjs'

const IDENT = 'localComponents'

/**
 * The manual-registration snippet for the barrel at `dir` (cwd-relative).
 */
export function registrationSnippet(dir) {
  const barrelImport = dir.startsWith('.') ? dir : `./${dir}`

  return [
    'Register the generated barrel in your Vueform setup:',
    '',
    `  import ${IDENT} from '${barrelImport}'`,
    '',
    '  createVueform({',
    `    components: { ...${IDENT} },`,
    '  })',
  ].join('\n')
}

const ENTRY_CANDIDATES = [
  'src/main.ts',
  'src/main.js',
  'src/main.mjs',
  'main.ts',
  'main.js',
]

// The CLI itself is zero-dependency: the AST work borrows the project's own
// typescript install (present in effectively every Vite+TS project). Its
// absence is simply one more gate failure → the printed snippet.
async function loadTs(cwd) {
  const dir = findPackageDir('typescript', cwd)

  if (!dir) return null

  try {
    const mod = await import(
      pathToFileURL(path.join(dir, 'lib', 'typescript.js')).href
    )
    return mod.default ?? mod
  } catch {
    return null
  }
}

function findEntry(cwd) {
  for (const rel of ENTRY_CANDIDATES) {
    const abs = path.join(cwd, rel)
    if (existsSync(abs)) return { rel, abs }
  }

  return null
}

function impossible(reason) {
  return { status: 'impossible', reason }
}

/**
 * Decides whether the project's entry file can be safely edited to register the
 * components barrel, without applying anything. Returns one of:
 *
 * - `{ status: 'registered' }` — the barrel is already imported there
 * - `{ status: 'impossible', reason }` — a safety gate failed; don't ask
 * - `{ status: 'possible', rel, preview, apply }` — `apply()` performs the two
 *   minimal text insertions (import + spread), preserving formatting
 *
 * Gates: exactly one `createVueform(...)` call, argument absent or an inline
 * object literal, `components` (when present) a plain object literal, and the
 * `vueformComponents` identifier unused.
 */
export async function planAutoRegister(cwd, componentsDir) {
  const ts = await loadTs(cwd)

  if (!ts) return impossible('typescript is not installed in this project')

  const entry = findEntry(cwd)

  if (!entry) return impossible('no src/main.ts (or main.js) found')

  const source = readFileSync(entry.abs, 'utf8')

  if (!source.includes('createVueform')) {
    return impossible(`${entry.rel} doesn't reference createVueform`)
  }

  let barrelPath = path
    .relative(path.dirname(entry.abs), path.resolve(cwd, componentsDir))
    .split(path.sep)
    .join('/')
  if (!barrelPath.startsWith('.')) barrelPath = `./${barrelPath}`

  if (new RegExp(`\\b${IDENT}\\b`).test(source)) {
    return source.includes(`'${barrelPath}'`) ||
      source.includes(`"${barrelPath}"`)
      ? { status: 'registered', rel: entry.rel }
      : impossible(`${entry.rel} already uses the ${IDENT} identifier`)
  }

  const sf = ts.createSourceFile(
    entry.rel,
    source,
    ts.ScriptTarget.Latest,
    true
  )

  const calls = []
  const walk = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'createVueform'
    ) {
      calls.push(node)
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)

  if (calls.length !== 1) {
    return impossible(
      calls.length
        ? `${entry.rel} calls createVueform more than once`
        : `${entry.rel} doesn't call createVueform`
    )
  }

  const call = calls[0]
  let insertPos
  let insertText

  if (call.arguments.length === 0) {
    insertPos = call.arguments.pos
    insertText = `{ components: { ...${IDENT} } }`
  } else {
    const [arg] = call.arguments

    if (!ts.isObjectLiteralExpression(arg)) {
      return impossible(
        `createVueform's argument in ${entry.rel} is not an inline object`
      )
    }

    const components = arg.properties.find(
      (prop) =>
        (ts.isPropertyAssignment(prop) ||
          ts.isShorthandPropertyAssignment(prop)) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'components'
    )

    // Mimics the line indentation of an object's first property so the
    // inserted line reads as hand-written; '' when it sits on the `{` line.
    const indentOf = (objectLiteral) => {
      const [first] = objectLiteral.properties
      if (!first) return null
      const start = first.getStart(sf)
      if (!source.slice(objectLiteral.properties.pos, start).includes('\n')) {
        return null
      }
      const lineStart = source.lastIndexOf('\n', start) + 1
      return source.slice(lineStart, start).match(/^[ \t]*/)[0]
    }

    if (!components) {
      const indent = indentOf(arg)
      insertPos = arg.properties.pos
      insertText = indent
        ? `\n${indent}components: { ...${IDENT} },`
        : ` components: { ...${IDENT} },`
    } else if (
      ts.isPropertyAssignment(components) &&
      ts.isObjectLiteralExpression(components.initializer)
    ) {
      // Inserted right after the object's `{` — before the user's entries,
      // so their explicit registrations keep precedence over the barrel.
      const indent = indentOf(components.initializer)
      insertPos = components.initializer.properties.pos
      insertText = indent ? `\n${indent}...${IDENT},` : ` ...${IDENT},`
    } else {
      return impossible(
        `the components option in ${entry.rel} is not an inline object`
      )
    }
  }

  let importEnd = 0
  for (const statement of sf.statements) {
    if (ts.isImportDeclaration(statement)) importEnd = statement.end
  }

  const importText =
    importEnd === 0
      ? `import ${IDENT} from '${barrelPath}'\n`
      : `\nimport ${IDENT} from '${barrelPath}'`

  return {
    status: 'possible',
    rel: entry.rel,
    preview: [
      `+ import ${IDENT} from '${barrelPath}'`,
      `+ components: { ...${IDENT} }  (in createVueform)`,
    ],
    apply() {
      const edits = [
        [importEnd, importText],
        [insertPos, insertText],
      ].sort((a, b) => b[0] - a[0])

      let updated = source
      for (const [pos, text] of edits) {
        updated = updated.slice(0, pos) + text + updated.slice(pos)
      }

      writeFileSync(entry.abs, updated)
    },
  }
}

/**
 * Decides whether the entry file's automatic barrel registration can be safely
 * removed. Returns one of:
 *
 * - `{ status: 'not-registered' }` — no barrel import in the entry file
 * - `{ status: 'impossible', reason }` — found, but not safely removable
 * - `{ status: 'possible', rel, preview, apply }` — `apply()` deletes the import
 *   and the `...<ident>` spread (or the whole `components` property when the
 *   spread is its only member)
 */
export async function planUnregister(cwd, componentsDir) {
  const entry = findEntry(cwd)

  if (!entry) return { status: 'not-registered' }

  const source = readFileSync(entry.abs, 'utf8')

  let barrelPath = path
    .relative(path.dirname(entry.abs), path.resolve(cwd, componentsDir))
    .split(path.sep)
    .join('/')
  if (!barrelPath.startsWith('.')) barrelPath = `./${barrelPath}`

  if (
    !source.includes(`'${barrelPath}'`) &&
    !source.includes(`"${barrelPath}"`)
  ) {
    return { status: 'not-registered' }
  }

  const ts = await loadTs(cwd)

  if (!ts) {
    return {
      status: 'impossible',
      reason: 'typescript is not installed in this project',
    }
  }

  const sf = ts.createSourceFile(
    entry.rel,
    source,
    ts.ScriptTarget.Latest,
    true
  )

  let importDecl = null

  for (const statement of sf.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.text === barrelPath &&
      statement.importClause?.name
    ) {
      importDecl = statement
      break
    }
  }

  if (!importDecl) {
    return {
      status: 'impossible',
      reason: `${entry.rel} references the barrel but not via a default import`,
    }
  }

  const ident = importDecl.importClause.name.text
  const spreads = []
  let otherUses = 0

  const walk = (node) => {
    if (ts.isIdentifier(node) && node.text === ident) {
      const parent = node.parent
      if (parent === importDecl.importClause) {
        // the import itself
      } else if (
        ts.isSpreadAssignment(parent) &&
        ts.isObjectLiteralExpression(parent.parent)
      ) {
        spreads.push(parent)
      } else {
        otherUses++
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)

  if (!spreads.length) {
    return {
      status: 'impossible',
      reason: `${entry.rel} imports the barrel but no \`...${ident}\` spread was found`,
    }
  }

  if (otherUses > 0) {
    return {
      status: 'impossible',
      reason: `${ident} is used elsewhere in ${entry.rel}`,
    }
  }

  // Build deletion ranges: [start, end) — widened to whole `components`
  // property when the spread is its only member, and to trailing commas.
  const ranges = []

  const importStart = importDecl.getStart(sf)
  let importEnd = importDecl.end
  if (source[importEnd] === '\n') importEnd++
  ranges.push([importStart, importEnd])

  for (const spread of spreads) {
    const objectLiteral = spread.parent
    const property = objectLiteral.parent
    const removeWholeProperty =
      objectLiteral.properties.length === 1 &&
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'components'

    const node = removeWholeProperty ? property : spread
    let start = node.getStart(sf)
    let end = node.end

    // Swallow the trailing comma and following whitespace on the same line.
    while (source[end] === ',' || source[end] === ' ') end++
    if (source[end] === '\n') {
      // Also swallow the rest of the (now empty) line's indentation.
      let lineEnd = end + 1
      while (source[lineEnd] === ' ' || source[lineEnd] === '\t') lineEnd++
      if (source[lineEnd] !== '\n') end = lineEnd
      else end = end + 1
    }

    ranges.push([start, end])
  }

  return {
    status: 'possible',
    rel: entry.rel,
    preview: [
      `- import ${ident} from '${barrelPath}'`,
      `- components: { ...${ident} } spread`,
    ],
    apply() {
      let updated = source
      for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) {
        updated = updated.slice(0, start) + updated.slice(end)
      }
      writeFileSync(entry.abs, updated)
    },
  }
}

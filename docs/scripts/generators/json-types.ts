import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as prettier from 'prettier'
import * as ts from 'typescript'

// =============== PATHS ================

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const GENERATED_DIR = path.join(DOCS_ROOT, '.generated')

interface AdapterDef {
  path: string
  typesOutputDir: string
  host: string
  config: string
}

const DOCS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'config.json'), 'utf-8')
)

const adapters: Record<string, AdapterDef> = DOCS_CONFIG.adapters

const coreAdapter = adapters.ui
// Core's location is a fact of the monorepo, not adapter configuration.
const CORE_DIR = path.join(ROOT, 'packages/core')
const CORE_SRC = path.join(CORE_DIR, 'src')
const CORE_OUTPUT_DIR = path.join(DOCS_ROOT, coreAdapter.typesOutputDir)
const BLUEPRINTS_SRC_DIR = path.join(CORE_SRC, 'blueprints')

const nonCoreAdapters = Object.entries(adapters).filter(([k]) => k !== 'ui')

// ============= EXCLUSIONS =============

const EXCLUDED_DIRS: string[] = (
  (DOCS_CONFIG.skipTypeExportFolders ?? []) as string[]
).map((rel) => path.join(CORE_SRC, rel))

/**
 * Runtime exports whose docblock carries `@skipTypeExport` are left out of the
 * generated type pages.
 */
function hasSkipTypeExportTag(node: ts.Node): boolean {
  return ts
    .getJSDocTags(node)
    .some((tag) => tag.tagName.text === 'skipTypeExport')
}

// ============= TS PROGRAM =============

function createProgram(pkgDir: string) {
  const configPath = path.join(pkgDir, 'tsconfig.json')
  const raw = ts.readConfigFile(configPath, ts.sys.readFile)

  if (raw.error) {
    throw new Error(
      `Failed to read ${configPath}: ${ts.flattenDiagnosticMessageText(raw.error.messageText, '\n')}`
    )
  }

  const parsed = ts.parseJsonConfigFileContent(
    raw.config,
    ts.sys,
    path.dirname(configPath),
    undefined,
    configPath
  )
  const program = ts.createProgram(parsed.fileNames, parsed.options)

  return { program, checker: program.getTypeChecker() }
}

// ========= HELPERS =========

function isExported(node: ts.Node): boolean {
  return !!(
    ts.getCombinedModifierFlags(node as ts.Declaration) &
    ts.ModifierFlags.Export
  )
}

function extractLeadingJsDoc(
  node: ts.Node,
  sourceFile: ts.SourceFile
): string | undefined {
  const sourceText = sourceFile.getFullText()
  const commentRanges = ts.getLeadingCommentRanges(
    sourceText,
    node.getFullStart()
  )

  if (!commentRanges) return undefined

  for (const range of commentRanges) {
    const comment = sourceText.slice(range.pos, range.end)
    if (comment.startsWith('/**')) {
      return comment
    }
  }

  return undefined
}

function extractDeclarationText(
  node: ts.Declaration,
  sourceFile: ts.SourceFile
): string {
  const sourceText = sourceFile.getFullText()
  const nodeStart = node.getStart(sourceFile)
  const nodeEnd = node.getEnd()

  let textStart = nodeStart

  const commentRanges = ts.getLeadingCommentRanges(
    sourceText,
    node.getFullStart()
  )
  if (commentRanges) {
    for (const range of commentRanges) {
      const comment = sourceText.slice(range.pos, range.end)
      if (comment.startsWith('/**')) {
        textStart = range.pos
        break
      }
    }
  }

  return sourceText.slice(textStart, nodeEnd).trimEnd()
}

function hasOwnTypeDeclarations(sourceFile: ts.SourceFile): boolean {
  for (const node of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      return true
    }
  }
  return false
}

function stripExport(text: string): string {
  return text.replace(/\bexport\s+/, '')
}

function stripInternalTags(code: string): string {
  return code.replace(
    /^\s*\*\s*@(?:category|related|private|skipTypeExport)\b.*$/gm,
    ''
  )
}

function stripUnderscorePrefix(code: string): string {
  return code.replace(/\b_([a-zA-Z]\w*)/g, '$1')
}

/**
 * Wraps TypeScript source in a fenced code block whose fence is longer than any
 * backtick run inside the source, so a ````` example inside a docblock cannot
 * close the block early.
 */
function fenceTs(code: string): string {
  const longest = Math.max(
    2,
    ...[...code.matchAll(/`+/g)].map((m) => m[0].length)
  )
  const fence = '`'.repeat(longest + 1)
  return `${fence}ts\n${code}\n${fence}\n`
}

/**
 * Extracts the source text of a function signature up to (but not including)
 * the body. For overload signatures (no body) returns the full text.
 */
function extractFunctionSignatureText(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile
): string {
  const sourceText = sourceFile.getFullText()
  const nodeStart = node.getStart(sourceFile)

  if (!node.body) {
    return sourceText.slice(nodeStart, node.getEnd()).trimEnd()
  }

  const bodyStart = node.body.getStart(sourceFile)
  let sig = sourceText.slice(nodeStart, bodyStart).trimEnd()

  if (sig.endsWith('{')) {
    sig = sig.slice(0, -1).trimEnd()
  }

  return sig
}

function typeToString(
  type: ts.Type,
  enclosingNode: ts.Node,
  checker: ts.TypeChecker
): string {
  return checker.typeToString(
    type,
    enclosingNode,
    ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.MultilineObjectLiterals |
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
  )
}

function inferReturnType(
  node: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): string | undefined {
  if (node.type) return undefined

  const sig = checker.getSignatureFromDeclaration(node)
  if (!sig) return undefined

  const returnType = checker.getReturnTypeOfSignature(sig)

  return typeToString(returnType, node, checker)
}

function findReturnStatement(
  node: ts.FunctionDeclaration
): ts.ReturnStatement | undefined {
  if (!node.body) return undefined

  for (let i = node.body.statements.length - 1; i >= 0; i--) {
    const stmt = node.body.statements[i]
    if (ts.isReturnStatement(stmt)) return stmt
  }

  return undefined
}

/**
 * Given a property symbol, recursively traces through declaration kinds
 * (ShorthandPropertyAssignment, BindingElement, VariableDeclaration) to find
 * the first JSDoc block attached to the underlying declaration.
 */
function tracePropertyJsDoc(
  propSymbol: ts.Symbol,
  checker: ts.TypeChecker,
  depth = 0
): string | undefined {
  if (depth > 6) return undefined

  const propDecls = propSymbol.getDeclarations()
  if (!propDecls?.length) return undefined

  for (const propDecl of propDecls) {
    const sf = propDecl.getSourceFile()

    const directDoc = extractLeadingJsDoc(propDecl, sf)
    if (directDoc) return directDoc

    if (ts.isVariableDeclaration(propDecl)) {
      const parentStmt = propDecl.parent?.parent
      if (parentStmt && ts.isVariableStatement(parentStmt)) {
        const doc = extractLeadingJsDoc(parentStmt, sf)
        if (doc) return doc
      }
    }

    if (ts.isShorthandPropertyAssignment(propDecl)) {
      const valSymbol = checker.getShorthandAssignmentValueSymbol(propDecl)
      if (!valSymbol) continue

      const doc = tracePropertyJsDoc(valSymbol, checker, depth + 1)
      if (doc) return doc
    }

    if (ts.isBindingElement(propDecl)) {
      const pattern = propDecl.parent
      if (!ts.isObjectBindingPattern(pattern)) continue
      const varDecl = pattern.parent
      if (!ts.isVariableDeclaration(varDecl) || !varDecl.initializer) continue

      const sourceName =
        propDecl.propertyName && ts.isIdentifier(propDecl.propertyName)
          ? propDecl.propertyName.text
          : ts.isIdentifier(propDecl.name)
            ? propDecl.name.text
            : undefined
      if (!sourceName) continue

      const initType = checker.getTypeAtLocation(varDecl.initializer)
      const innerProp = initType.getProperty(sourceName)
      if (!innerProp) continue

      const doc = tracePropertyJsDoc(innerProp, checker, depth + 1)
      if (doc) return doc
    }
  }

  return undefined
}

function resolveLocalJsDoc(
  name: string,
  func: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  checker?: ts.TypeChecker
): string | undefined {
  if (!func.body) return undefined

  for (const stmt of func.body.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === name) {
      const doc = extractLeadingJsDoc(stmt, sourceFile)
      if (doc) return doc
      continue
    }

    if (!ts.isVariableStatement(stmt)) continue

    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === name) {
        return extractLeadingJsDoc(stmt, sourceFile)
      }

      if (checker && ts.isObjectBindingPattern(decl.name) && decl.initializer) {
        const bindingEl = decl.name.elements.find(
          (el) => ts.isIdentifier(el.name) && el.name.text === name
        )
        if (!bindingEl) continue

        const sourcePropName =
          bindingEl.propertyName && ts.isIdentifier(bindingEl.propertyName)
            ? bindingEl.propertyName.text
            : name

        const initType = checker.getTypeAtLocation(decl.initializer)
        const propSymbol = initType.getProperty(sourcePropName)
        if (!propSymbol) continue

        const doc = tracePropertyJsDoc(propSymbol, checker)
        if (doc) return doc
      }
    }
  }

  return undefined
}

function flattenCallExpressions(expr: ts.CallExpression): ts.CallExpression[] {
  const calls: ts.CallExpression[] = [expr]
  for (const arg of expr.arguments) {
    if (ts.isCallExpression(arg)) {
      calls.push(...flattenCallExpressions(arg))
    }
  }
  return calls
}

function resolveSpreadSources(
  objLiteral: ts.ObjectLiteralExpression,
  func: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  visited = new Set<ts.FunctionDeclaration>()
): { func: ts.FunctionDeclaration; sf: ts.SourceFile }[] {
  const results: { func: ts.FunctionDeclaration; sf: ts.SourceFile }[] = []

  for (const prop of objLiteral.properties) {
    if (!ts.isSpreadAssignment(prop)) continue

    const expr = prop.expression
    if (!ts.isIdentifier(expr)) continue

    const varName = expr.text
    if (!func.body) continue

    for (const stmt of func.body.statements) {
      if (!ts.isVariableStatement(stmt)) continue
      for (const decl of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name) || decl.name.text !== varName) continue
        if (!decl.initializer || !ts.isCallExpression(decl.initializer))
          continue

        const allCalls = flattenCallExpressions(decl.initializer)

        for (const call of allCalls) {
          let symbol = checker.getSymbolAtLocation(call.expression)
          if (!symbol) continue

          if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = checker.getAliasedSymbol(symbol)
          }

          const declarations = symbol.getDeclarations()
          if (!declarations?.length) continue

          for (const d of declarations) {
            if (!ts.isFunctionDeclaration(d) || visited.has(d)) continue
            visited.add(d)
            results.push({ func: d, sf: d.getSourceFile() })

            const innerRet = findReturnStatement(d)
            if (!innerRet?.expression) continue

            let innerObj: ts.ObjectLiteralExpression | undefined
            if (ts.isObjectLiteralExpression(innerRet.expression)) {
              innerObj = innerRet.expression
            } else if (
              ts.isCallExpression(innerRet.expression) &&
              innerRet.expression.arguments.length >= 1 &&
              ts.isObjectLiteralExpression(innerRet.expression.arguments[0])
            ) {
              innerObj = innerRet.expression
                .arguments[0] as ts.ObjectLiteralExpression
            }

            if (innerObj) {
              results.push(
                ...resolveSpreadSources(innerObj, d, checker, visited)
              )
            }
          }
        }
      }
    }
  }

  return results
}

function inferAnnotatedReturnType(
  node: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): string | undefined {
  if (node.type) return undefined

  const retStmt = findReturnStatement(node)
  if (!retStmt?.expression) return undefined

  let objLiteral: ts.ObjectLiteralExpression | undefined

  if (ts.isObjectLiteralExpression(retStmt.expression)) {
    objLiteral = retStmt.expression
  } else if (
    ts.isCallExpression(retStmt.expression) &&
    retStmt.expression.arguments.length >= 1 &&
    ts.isObjectLiteralExpression(retStmt.expression.arguments[0])
  ) {
    objLiteral = retStmt.expression.arguments[0] as ts.ObjectLiteralExpression
  }

  if (!objLiteral) return undefined

  const sig = checker.getSignatureFromDeclaration(node)
  if (!sig) return undefined

  const returnType = checker.getReturnTypeOfSignature(sig)
  const props = returnType.getProperties()

  if (!props.length) return undefined

  const spreadSources = resolveSpreadSources(objLiteral, node, checker)

  const resolveJsDoc = (propName: string): string | undefined => {
    const local = resolveLocalJsDoc(propName, node, sourceFile, checker)
    if (local) return local

    for (const src of spreadSources) {
      const doc = resolveLocalJsDoc(propName, src.func, src.sf, checker)
      if (doc) return doc
    }

    return undefined
  }

  const hasAnyJsDoc = objLiteral.properties.some((prop) => {
    if (ts.isSpreadAssignment(prop)) {
      return spreadSources.length > 0
    }
    if (
      !ts.isShorthandPropertyAssignment(prop) &&
      !ts.isPropertyAssignment(prop)
    )
      return false
    const name = prop.name?.getText(sourceFile)
    return name ? !!resolveJsDoc(name) : false
  })

  if (!hasAnyJsDoc) return undefined

  const lines: string[] = ['{']
  let prevHadDoc = false

  for (const prop of props) {
    const propType = checker.getTypeOfSymbolAtLocation(prop, node)
    const propTypeStr = typeToString(propType, node, checker)
    const jsDoc = resolveJsDoc(prop.name)

    if (jsDoc) {
      lines.push('')
      for (const line of jsDoc.split('\n')) {
        lines.push(`  ${line}`)
      }
      prevHadDoc = true
    } else if (prevHadDoc) {
      lines.push('')
      prevHadDoc = false
    }

    lines.push(`  ${prop.name}: ${propTypeStr}`)
  }

  lines.push('}')
  return lines.join('\n')
}

function buildFunctionEntry(
  signatures: ts.FunctionDeclaration[],
  implementation: ts.FunctionDeclaration | undefined,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): string {
  const groups: string[] = []

  if (signatures.length > 0) {
    for (const sig of signatures) {
      const jsDoc = extractLeadingJsDoc(sig, sourceFile)
      const sigText = extractFunctionSignatureText(sig, sourceFile)
      const parts: string[] = []

      if (jsDoc) parts.push(jsDoc)
      parts.push(stripExport(sigText))
      groups.push(parts.join('\n'))
    }
  } else if (implementation) {
    const jsDoc = extractLeadingJsDoc(implementation, sourceFile)
    let sigText = extractFunctionSignatureText(implementation, sourceFile)

    const annotated = inferAnnotatedReturnType(
      implementation,
      checker,
      sourceFile
    )
    if (annotated) {
      sigText = `${sigText}: ${annotated}`
    } else {
      const inferred = inferReturnType(implementation, checker)
      if (inferred) {
        sigText = `${sigText}: ${inferred}`
      }
    }

    const parts: string[] = []
    if (jsDoc) parts.push(jsDoc)
    parts.push(stripExport(sigText))
    groups.push(parts.join('\n'))
  }

  return groups.join('\n\n')
}

function buildVariableEntry(
  decl: ts.VariableDeclaration,
  statement: ts.VariableStatement,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): string {
  const parts: string[] = []

  const jsDoc = extractLeadingJsDoc(statement, sourceFile)
  if (jsDoc) parts.push(jsDoc)

  const symbol = checker.getSymbolAtLocation(decl.name)
  if (!symbol) return ''

  const type = checker.getTypeOfSymbolAtLocation(symbol, decl)
  const typeStr = typeToString(type, decl, checker)

  const keyword =
    statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let'

  parts.push(`${keyword} ${decl.name.getText(sourceFile)}: ${typeStr}`)

  return parts.join('\n')
}

// ======== BLUEPRINT PRETTIFICATION ========

function extractBlueprintFactories(
  decl: ts.VariableDeclaration,
  checker: ts.TypeChecker
): ts.FunctionDeclaration[] {
  const result: ts.FunctionDeclaration[] = []

  if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return result

  const arg = decl.initializer.arguments[0]
  if (!arg || !ts.isArrowFunction(arg)) return result

  let expr: ts.Expression | undefined
  const body = arg.body

  if (ts.isBlock(body)) {
    for (let i = body.statements.length - 1; i >= 0; i--) {
      const stmt = body.statements[i]
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        expr = stmt.expression
        break
      }
    }
  } else {
    expr = body as ts.Expression
  }

  if (expr && ts.isParenthesizedExpression(expr)) {
    expr = expr.expression
  }

  if (!expr || !ts.isObjectLiteralExpression(expr)) return result

  for (const prop of expr.properties) {
    if (!ts.isSpreadAssignment(prop)) continue
    if (!ts.isCallExpression(prop.expression)) continue

    const call = prop.expression
    if (call.arguments.length < 3) continue

    const arrayArg = call.arguments[2]
    if (!ts.isArrayLiteralExpression(arrayArg)) continue

    for (const elem of arrayArg.elements) {
      if (!ts.isIdentifier(elem)) continue

      let sym = checker.getSymbolAtLocation(elem)
      if (!sym) continue
      if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)

      const decls = sym.getDeclarations()
      if (!decls) continue

      for (const d of decls) {
        if (ts.isFunctionDeclaration(d)) result.push(d)
      }
    }
  }

  return result
}

function buildFactoryJsDocMap(
  factories: ts.FunctionDeclaration[],
  checker: ts.TypeChecker
): Map<string, string> {
  const map = new Map<string, string>()

  for (const factory of factories) {
    const sf = factory.getSourceFile()
    const retStmt = findReturnStatement(factory)
    if (!retStmt?.expression) continue

    let objLiteral: ts.ObjectLiteralExpression | undefined
    if (ts.isObjectLiteralExpression(retStmt.expression)) {
      objLiteral = retStmt.expression
    }
    if (!objLiteral) continue

    for (const prop of objLiteral.properties) {
      let propName: string | undefined

      if (ts.isShorthandPropertyAssignment(prop)) {
        propName = prop.name.text
      } else if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
        propName = prop.name.text
      }

      if (!propName || map.has(propName)) continue

      const doc = resolveLocalJsDoc(propName, factory, sf, checker)
      if (doc) map.set(propName, doc)
    }
  }

  return map
}

function buildConcreteTypeMap(
  factories: ts.FunctionDeclaration[],
  checker: ts.TypeChecker
): Map<string, string> {
  const map = new Map<string, string>()

  for (const factory of factories) {
    const sig = checker.getSignatureFromDeclaration(factory)
    if (!sig) continue

    const retType = checker.getReturnTypeOfSignature(sig)

    for (const prop of retType.getProperties()) {
      if (map.has(prop.name)) continue

      const propType = checker.getTypeOfSymbolAtLocation(prop, factory)
      map.set(prop.name, typeToString(propType, factory, checker))
    }
  }

  return map
}

function buildBlueprintCallableEntry(
  decl: ts.VariableDeclaration,
  statement: ts.VariableStatement,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  defineEventsFn?: ts.FunctionDeclaration
): string | undefined {
  const symbol = checker.getSymbolAtLocation(decl.name)
  if (!symbol) return undefined

  const type = checker.getTypeOfSymbolAtLocation(symbol, decl)
  const callSignatures = type.getCallSignatures()
  if (callSignatures.length === 0) return undefined

  const sig = callSignatures[callSignatures.length - 1]
  const returnType = checker.getReturnTypeOfSignature(sig)
  const returnProps = returnType.getProperties()

  if (returnProps.length < 10) return undefined

  const factories = extractBlueprintFactories(decl, checker)
  const allSources = defineEventsFn
    ? [...factories, defineEventsFn]
    : [...factories]

  const jsDocMap = buildFactoryJsDocMap(allSources, checker)
  const concreteTypeMap = buildConcreteTypeMap(allSources, checker)

  const typeParams = sig.getTypeParameters()
  let typeParamStr = ''
  if (typeParams && typeParams.length > 0) {
    const tpParts = typeParams.map((tp) => {
      const constraint = checker.getBaseConstraintOfType(tp)
      if (constraint) {
        return `${tp.symbol.name} extends ${typeToString(constraint, decl, checker)}`
      }
      return tp.symbol.name
    })
    typeParamStr = `<${tpParts.join(', ')}>`
  }

  const params = sig.getParameters()
  const paramParts = params.map((p) => {
    const pType = checker.getTypeOfSymbolAtLocation(p, decl)
    return `${p.name}: ${typeToString(pType, decl, checker)}`
  })

  const returnLines: string[] = ['{']
  let prevHadDoc = false

  for (const prop of returnProps) {
    const propTypeStr =
      concreteTypeMap.get(prop.name) ??
      typeToString(checker.getTypeOfSymbolAtLocation(prop, decl), decl, checker)

    let doc = tracePropertyJsDoc(prop, checker)
    if (!doc) doc = jsDocMap.get(prop.name)

    if (doc) {
      returnLines.push('')
      for (const line of doc.split('\n')) {
        returnLines.push(`  ${line}`)
      }
      prevHadDoc = true
    } else if (prevHadDoc) {
      returnLines.push('')
      prevHadDoc = false
    }

    returnLines.push(`  ${prop.name}: ${propTypeStr}`)
  }

  returnLines.push('}')

  const keyword =
    statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : 'let'
  const name = decl.name.getText(sourceFile)

  const parts: string[] = []
  const jsDoc = extractLeadingJsDoc(statement, sourceFile)
  if (jsDoc) parts.push(jsDoc)

  parts.push(
    `${keyword} ${name}: ${typeParamStr}(${paramParts.join(', ')}) => ${returnLines.join('\n')}`
  )

  return parts.join('\n')
}

// ================ FORMATTING ================

async function formatTS(code: string, prettierConfig: prettier.Options) {
  try {
    const formatted = await prettier.format(code, {
      ...prettierConfig,
      parser: 'typescript',
    })
    return formatted.trimEnd()
  } catch {
    return code
  }
}

// ================ PHASE 1: CORE TYPES ================

type FnGroup = {
  overloads: ts.FunctionDeclaration[]
  implementation: ts.FunctionDeclaration | undefined
  sourceFile: ts.SourceFile
}

async function phase1(prettierConfig: prettier.Options): Promise<Set<string>> {
  console.log('Phase 1: Core types...')

  const { program, checker } = createProgram(CORE_DIR)
  const seen = new Set<string>()
  let written = 0
  let skippedDuplicates = 0

  fs.rmSync(CORE_OUTPUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(CORE_OUTPUT_DIR, { recursive: true })

  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (sf) =>
        sf.fileName.startsWith(CORE_SRC + '/') &&
        !EXCLUDED_DIRS.some((dir) => sf.fileName.startsWith(dir + '/'))
    )
    .filter(
      (sf) => !sf.fileName.endsWith('/index.ts') || hasOwnTypeDeclarations(sf)
    )
    .sort((a, b) => a.fileName.localeCompare(b.fileName))

  // Locate the defineEvents function for blueprint event property JSDoc
  let defineEventsFn: ts.FunctionDeclaration | undefined
  for (const sf of sourceFiles) {
    ts.forEachChild(sf, (node) => {
      if (
        ts.isFunctionDeclaration(node) &&
        isExported(node) &&
        node.name?.text === 'defineEvents'
      ) {
        defineEventsFn = node
      }
    })
    if (defineEventsFn) break
  }

  for (const sourceFile of sourceFiles) {
    const isBlueprint = sourceFile.fileName.startsWith(BLUEPRINTS_SRC_DIR + '/')

    // --- Interfaces & Type Aliases (exported + non-exported) ---
    for (const node of sourceFile.statements) {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node))
        continue

      const name = node.name.text
      if (seen.has(name)) {
        skippedDuplicates++
        continue
      }

      seen.add(name)

      let declText = extractDeclarationText(node, sourceFile)
      declText = declText.replace(/\bexport\s+/, '')

      const formatted = await formatTS(
        stripInternalTags(declText),
        prettierConfig
      )
      const content = fenceTs(stripUnderscorePrefix(formatted))
      const outPath = path.join(CORE_OUTPUT_DIR, `${name}.md`)

      fs.writeFileSync(outPath, content)
      written++
    }

    // --- Exported Functions (with overload grouping) ---
    const fnGroups = new Map<string, FnGroup>()

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && isExported(node) && node.name) {
        const name = node.name.text
        let group = fnGroups.get(name)

        if (!group) {
          group = {
            overloads: [],
            implementation: undefined,
            sourceFile,
          }
          fnGroups.set(name, group)
        }

        if (node.body) {
          group.implementation = node
        } else {
          group.overloads.push(node)
        }
      }
    })

    for (const [name, group] of fnGroups) {
      if (
        seen.has(name) ||
        [group.implementation, ...group.overloads].some(
          (n) => n && hasSkipTypeExportTag(n)
        )
      ) {
        skippedDuplicates++
        continue
      }

      seen.add(name)

      const entry = buildFunctionEntry(
        group.overloads,
        group.implementation,
        checker,
        sourceFile
      )

      if (!entry) continue

      const formatted = await formatTS(stripInternalTags(entry), prettierConfig)
      const content = fenceTs(stripUnderscorePrefix(formatted))
      const outPath = path.join(CORE_OUTPUT_DIR, `${name}.md`)

      fs.writeFileSync(outPath, content)
      written++
    }

    // --- Exported Variables ---
    const varEntries: { name: string; entry: string }[] = []

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isVariableStatement(node)) return
      if (!isExported(node)) return

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue

        const name = decl.name.text
        if (seen.has(name) || hasSkipTypeExportTag(node)) {
          skippedDuplicates++
          return
        }

        seen.add(name)

        const entry = isBlueprint
          ? buildBlueprintCallableEntry(
              decl,
              node,
              checker,
              sourceFile,
              defineEventsFn
            ) || buildVariableEntry(decl, node, checker, sourceFile)
          : buildVariableEntry(decl, node, checker, sourceFile)

        if (entry) varEntries.push({ name, entry })
      }
    })

    for (const { name, entry } of varEntries) {
      const formatted = await formatTS(stripInternalTags(entry), prettierConfig)
      const content = fenceTs(stripUnderscorePrefix(formatted))
      const outPath = path.join(CORE_OUTPUT_DIR, `${name}.md`)

      fs.writeFileSync(outPath, content)
      written++
    }
  }

  console.log(
    `  Phase 1: ${written} written${skippedDuplicates ? `, ${skippedDuplicates} duplicate(s) skipped` : ''}`
  )

  return seen
}

// ================ PHASE 2: ADAPTER TYPES ================

async function phase2(
  adapterName: string,
  adapterDef: AdapterDef,
  coreSeen: Set<string>,
  prettierConfig: prettier.Options
): Promise<Set<string>> {
  console.log(`Phase 2: Adapter types (${adapterName})...`)

  const adapterDir = path.join(ROOT, adapterDef.path)
  const adapterSrc = path.join(adapterDir, 'src')
  const outputDir = path.join(DOCS_ROOT, adapterDef.typesOutputDir)

  const { program, checker } = createProgram(adapterDir)
  const adapterSeen = new Set<string>()
  let written = 0
  let skipped = 0

  fs.rmSync(outputDir, { recursive: true, force: true })
  fs.mkdirSync(outputDir, { recursive: true })

  const sourceFiles = program
    .getSourceFiles()
    .filter(
      (sf) =>
        sf.fileName.startsWith(adapterSrc + '/') &&
        (!sf.fileName.endsWith('/index.ts') || hasOwnTypeDeclarations(sf))
    )
    .sort((a, b) => a.fileName.localeCompare(b.fileName))

  for (const sourceFile of sourceFiles) {
    // --- Interfaces & Type Aliases ---
    for (const node of sourceFile.statements) {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node))
        continue

      const name = node.name.text
      if (coreSeen.has(name) || adapterSeen.has(name)) {
        skipped++
        continue
      }

      adapterSeen.add(name)

      let declText = extractDeclarationText(node, sourceFile)
      declText = declText.replace(/\bexport\s+/, '')

      const formatted = await formatTS(
        stripInternalTags(declText),
        prettierConfig
      )
      const content = fenceTs(stripUnderscorePrefix(formatted))
      const outPath = path.join(outputDir, `${name}.md`)

      fs.writeFileSync(outPath, content)
      written++
    }

    // --- Exported Functions ---
    const fnGroups = new Map<string, FnGroup>()

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && isExported(node) && node.name) {
        const name = node.name.text
        let group = fnGroups.get(name)

        if (!group) {
          group = {
            overloads: [],
            implementation: undefined,
            sourceFile,
          }
          fnGroups.set(name, group)
        }

        if (node.body) {
          group.implementation = node
        } else {
          group.overloads.push(node)
        }
      }
    })

    for (const [name, group] of fnGroups) {
      if (coreSeen.has(name) || adapterSeen.has(name)) {
        skipped++
        continue
      }

      adapterSeen.add(name)

      const entry = buildFunctionEntry(
        group.overloads,
        group.implementation,
        checker,
        sourceFile
      )

      if (!entry) continue

      const formatted = await formatTS(stripInternalTags(entry), prettierConfig)
      const content = fenceTs(stripUnderscorePrefix(formatted))
      const outPath = path.join(outputDir, `${name}.md`)

      fs.writeFileSync(outPath, content)
      written++
    }

    // --- Exported Variables ---
    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isVariableStatement(node)) return
      if (!isExported(node)) return

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue

        const name = decl.name.text
        if (
          coreSeen.has(name) ||
          adapterSeen.has(name) ||
          hasSkipTypeExportTag(node)
        ) {
          skipped++
          return
        }

        adapterSeen.add(name)

        const entry = buildVariableEntry(decl, node, checker, sourceFile)
        if (!entry) return

        void (async () => {
          const formatted = await formatTS(
            stripInternalTags(entry),
            prettierConfig
          )
          const content = fenceTs(stripUnderscorePrefix(formatted))
          const outPath = path.join(outputDir, `${name}.md`)
          fs.writeFileSync(outPath, content)
        })()

        written++
      }
    })
  }

  console.log(
    `  Phase 2 (${adapterName}): ${written} written${skipped ? `, ${skipped} skipped (already in core)` : ''}`
  )

  return adapterSeen
}

// ================ PHASE 3: JSON MANIFESTS ================

function collectMdNames(dir: string): string[] {
  const names: string[] = []
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.md')) {
        names.push(file.replace(/\.md$/, ''))
      }
    }
  }
  return names.sort()
}

function phase3(): void {
  console.log('Phase 3: JSON manifests...')

  const coreDir = path.join(GENERATED_DIR, 'core')
  fs.mkdirSync(coreDir, { recursive: true })

  const coreNames = collectMdNames(CORE_OUTPUT_DIR)
  fs.writeFileSync(
    path.join(coreDir, 'types.json'),
    JSON.stringify(coreNames, null, 2) + '\n'
  )

  const logs = [`core/types.json (${coreNames.length})`]

  // Adapter manifests merge the core names with the adapter's own type pages.
  for (const [name, def] of Object.entries(adapters)) {
    const adapterOutputDir = path.join(DOCS_ROOT, def.typesOutputDir)
    const adapterDir = path.join(GENERATED_DIR, name)
    fs.mkdirSync(adapterDir, { recursive: true })

    const adapterNames = collectMdNames(adapterOutputDir)
    const merged = [...new Set([...coreNames, ...adapterNames])].sort()
    fs.writeFileSync(
      path.join(adapterDir, 'types.json'),
      JSON.stringify(merged, null, 2) + '\n'
    )

    logs.push(`${name}/types.json (${merged.length})`)
  }

  console.log(`  Phase 3: ${logs.join(', ')}`)
}

// ================ MAIN ================

async function main() {
  const prettierConfig =
    (await prettier.resolveConfig(path.join(ROOT, 'package.json'), {
      editorconfig: true,
    })) ?? {}

  const coreSeen = await phase1(prettierConfig)

  for (const [name, def] of nonCoreAdapters) {
    await phase2(name, def, coreSeen, prettierConfig)
  }

  phase3()

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import * as fs from 'node:fs'
import * as path from 'node:path'

import * as ts from 'typescript'

import { monorepoRoot } from './paths'

// =============== TYPES ================

export interface ParamInfo {
  type: string
  description: string
  loc?: string
}

export interface PropInfo {
  type: string
  description: string
  loc?: string
  required?: true
  private?: true
  default?: unknown
  source?: 'vueform' | 'adapter' | 'html'
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

export interface EventInfo {
  description: string
  loc?: string
  params?: Record<string, ParamInfo>
}

export interface PartInfo {
  type: string
  description: string
  loc?: string
  tag?: string
  params?: Record<string, ParamInfo>
}

export interface SlotParamInfo {
  type: string
  description: string
  loc?: string
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

export interface SlotInfo {
  description: string
  loc?: string
  exposes?: string
  inherits?: string
  params?: Record<string, SlotParamInfo>
}

export interface ClassParamExpanded {
  type: Record<string, { type: string; description: string; loc?: string }>
  description: string
  loc?: string
}

export interface ClassInfo {
  type: string
  description: string
  loc?: string
  default?: string
  params?: Record<string, string | ClassParamExpanded>
}

export interface ApiMemberInfo {
  type: string
  description: string
  loc?: string
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

export interface AdapterPropVersion {
  type: string
  description: string
  loc?: string
}

export interface AdapterTypeInfo {
  typeName: string
  componentName: string
  omittedProps: string[]
  overwrittenProps: Record<string, AdapterPropVersion>
  unavailableProps: Record<string, AdapterPropVersion>
}

export interface ComponentEntry {
  blueprint: string
  /**
   * Present (true) on element components — those rendering <VfLayout>.
   */
  element?: boolean
  props: Record<string, PropInfo>
  events: Record<string, EventInfo>
  parts: Record<string, PartInfo>
  slots: Record<string, SlotInfo>
  classes: Record<string, ClassInfo>
  api?: Record<string, ApiMemberInfo>
  adapterFeatures?: string[]
  adapterTypeInfo?: AdapterTypeInfo
}

export interface DefaultEntry {
  value: unknown
  isUndefined: boolean
}

// ============= TS PROGRAM =============

export function createProgram(packageDir: string) {
  // The packages' tsconfig.json is a solution file (`files: []` +
  // `references`) — the sources live in the app leg's include.
  const appConfigPath = path.join(packageDir, 'tsconfig.app.json')
  const configPath = fs.existsSync(appConfigPath)
    ? appConfigPath
    : path.join(packageDir, 'tsconfig.json')
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

// ================ LOC =================

/**
 * Repo-relative `path:line` of a node's start (leading trivia skipped, so
 * the line is the declaration itself — where a missing JSDoc block would
 * be written). Emitted as the `loc` field next to every description-bearing
 * node of the generated jsons.
 */
export function loc(node: ts.Node): string {
  const sourceFile = node.getSourceFile()
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
  return `${path.relative(monorepoRoot, sourceFile.fileName)}:${line + 1}`
}

// ============ JSDOC HELPERS ===========

export function singleLine(s: string): string {
  return s.replace(/\s*\n\s*/g, ' ').trim()
}

export function getSymbolDescription(
  symbol: ts.Symbol,
  checker: ts.TypeChecker
): string {
  const raw = symbol
    .getDocumentationComment(checker)
    .map((p) => p.text)
    .join('')

  return raw
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .split('\n\n')
    .map((paragraph) => paragraph.replace(/\n/g, ' '))
    .join('\n\n')
}

export function getJSDocParamDescriptions(node: ts.Node): Map<string, string> {
  const result = new Map<string, string>()

  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(entry) || !entry.tags) continue

    for (const tag of entry.tags) {
      if (
        !ts.isJSDocParameterTag(tag) ||
        !tag.name ||
        !ts.isIdentifier(tag.name)
      )
        continue

      const comment =
        typeof tag.comment === 'string'
          ? tag.comment
          : (tag.comment?.map((c) => c.text || '').join('') ?? '')

      result.set(tag.name.text, singleLine(comment))
    }
  }

  return result
}

export function getNodeJSDocDescription(node: ts.Node): string {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (ts.isJSDoc(entry) && entry.comment) {
      const text =
        typeof entry.comment === 'string'
          ? entry.comment
          : entry.comment.map((c) => c.text || '').join('')
      const line = singleLine(text)
      if (line) return line
    }
  }
  return ''
}

export function getJSDocTag(
  node: ts.Node,
  tagName: string
): string | undefined {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(entry) || !entry.tags) continue

    for (const tag of entry.tags) {
      if (tag.tagName.text === tagName) {
        const comment =
          typeof tag.comment === 'string'
            ? tag.comment
            : (tag.comment?.map((c) => c.text || '').join('') ?? '')
        return comment.trim()
      }
    }
  }

  return undefined
}

/**
 * The name a call refers to across module boundaries: the aliased export's name
 * for imports, the identifier's own name for declarations in other files, and
 * undefined for locals of the same file — locals have no scraped entry a `from`
 * reference could point at.
 */
export function importedCalleeName(
  id: ts.Identifier,
  checker: ts.TypeChecker
): string | undefined {
  const sym = checker.getSymbolAtLocation(id)
  if (!sym) return undefined
  if (sym.flags & ts.SymbolFlags.Alias) {
    return checker.getAliasedSymbol(sym).name
  }
  const decl = sym.declarations?.[0]
  return decl && decl.getSourceFile() !== id.getSourceFile()
    ? sym.name
    : undefined
}

// ============ TYPE HELPERS ============

export const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

export function isFunctionLikeType(type: ts.Type): boolean {
  const inner = type.getNonNullableType()
  return !inner.isUnion() && inner.getCallSignatures().length > 0
}

export function getPropertyTypeInfo(
  propSymbol: ts.Symbol,
  decl: ts.Declaration,
  checker: ts.TypeChecker
): { typeText: string; isFunction: boolean } {
  const resolved = checker.getTypeOfSymbolAtLocation(propSymbol, decl)

  if (isFunctionLikeType(resolved)) {
    return { typeText: 'function', isFunction: true }
  }

  if (ts.isPropertySignature(decl) && decl.type) {
    let text = decl.type
      .getText(decl.getSourceFile())
      .replace(/\s+/g, ' ')
      .replace(/<\s*\|\s*/g, '<')
      .replace(/<\s+/g, '<')
      .replace(/\s+>/g, '>')
      .replace(/^\|\s*/, '')
      .trim()

    if (ts.isTypeReferenceNode(decl.type) && !decl.type.typeArguments) {
      const sym = checker.getSymbolAtLocation(decl.type.typeName)
      const tpDecl = sym?.declarations?.find(ts.isTypeParameterDeclaration) as
        | ts.TypeParameterDeclaration
        | undefined

      if (tpDecl?.constraint) {
        text = tpDecl.constraint
          .getText(tpDecl.getSourceFile())
          .replace(/\s+/g, ' ')
          .replace(/<\s*\|\s*/g, '<')
          .replace(/<\s+/g, '<')
          .replace(/\s+>/g, '>')
          .replace(/^\|\s*/, '')
          .trim()
      }
    }

    return { typeText: text, isFunction: false }
  }

  return {
    typeText: checker.typeToString(resolved, decl, TYPE_FORMAT_FLAGS),
    isFunction: false,
  }
}

export function getFunctionParams(
  type: ts.Type,
  decl: ts.Declaration,
  checker: ts.TypeChecker
): Record<string, ParamInfo> | undefined {
  const sigs = type.getNonNullableType().getCallSignatures()
  if (!sigs.length) return undefined

  const jsdoc = getJSDocParamDescriptions(decl)
  const params: Record<string, ParamInfo> = {}

  for (const param of sigs[0].getParameters()) {
    const paramType = checker.getTypeOfSymbolAtLocation(param, decl)
    const paramDecl = param.getDeclarations()?.[0]
    params[param.name] = {
      type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
      description: jsdoc.get(param.name) ?? '',
      ...(paramDecl ? { loc: loc(paramDecl) } : {}),
    }
  }

  return Object.keys(params).length ? params : undefined
}

export function getFunctionReturnType(
  type: ts.Type,
  checker: ts.TypeChecker
): string | undefined {
  const sigs = type.getNonNullableType().getCallSignatures()
  if (!sigs.length) return undefined

  let returnType = checker.getReturnTypeOfSignature(sigs[0])

  if (returnType.isTypeParameter()) {
    returnType =
      returnType.getDefault() ?? returnType.getConstraint() ?? returnType
  }

  return checker.typeToString(returnType, undefined, TYPE_FORMAT_FLAGS)
}

export function getEventParams(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
  locationNode?: ts.Node
): Record<string, ParamInfo> | undefined {
  const decl = symbol.getDeclarations()?.[0]

  if (decl) {
    const jsdoc = getJSDocParamDescriptions(decl)

    if (
      ts.isPropertySignature(decl) &&
      decl.type &&
      ts.isTupleTypeNode(decl.type)
    ) {
      const params: Record<string, ParamInfo> = {}

      for (const elem of decl.type.elements) {
        if (ts.isNamedTupleMember(elem)) {
          params[elem.name.text] = {
            type: elem.type
              .getText(decl.getSourceFile())
              .replace(/\s+/g, ' ')
              .replace(/<\s*\|\s*/g, '<')
              .replace(/<\s+/g, '<')
              .replace(/\s+>/g, '>')
              .replace(/^\|\s*/, '')
              .trim(),
            description: jsdoc.get(elem.name.text) ?? '',
            loc: loc(elem),
          }
        }
      }

      if (Object.keys(params).length) return params
    }

    if (jsdoc.size) {
      const params: Record<string, ParamInfo> = {}
      for (const [name, desc] of jsdoc) {
        params[name] = { type: 'any', description: desc }
      }
      return params
    }
  }

  if (locationNode) {
    const resolvedType = checker.getTypeOfSymbolAtLocation(
      symbol,
      locationNode
    ) as ts.TypeReference
    if (
      resolvedType.target &&
      (resolvedType.target as any).fixedLength !== undefined
    ) {
      const typeArgs = checker.getTypeArguments(resolvedType)
      const labeledDecls = (resolvedType.target as ts.TupleType)
        .labeledElementDeclarations
      if (labeledDecls && typeArgs) {
        const params: Record<string, ParamInfo> = {}
        for (let i = 0; i < labeledDecls.length; i++) {
          const label = labeledDecls[i]
          if (!label) continue
          const name = label.name.getText(label.getSourceFile())
          const paramType = typeArgs[i]
          params[name] = {
            type: paramType
              ? checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS)
              : 'any',
            description: '',
            loc: loc(label),
          }
        }
        if (Object.keys(params).length) return params
      }
    }
  }

  return undefined
}

// ============== DEFAULTS ==============

export function extractDefaults(
  sourceFile: ts.SourceFile
): Map<string, DefaultEntry> {
  const defaults = new Map<string, DefaultEntry>()

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'defaults' &&
      node.initializer &&
      ts.isCallExpression(node.initializer)
    ) {
      const arg = node.initializer.arguments[0]
      if (arg && ts.isObjectLiteralExpression(arg)) {
        parseDefaultsObject(arg, sourceFile, defaults)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return defaults
}

function parseDefaultsObject(
  obj: ts.ObjectLiteralExpression,
  sf: ts.SourceFile,
  out: Map<string, DefaultEntry>
) {
  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue

    const name = prop.name.text
    const init = prop.initializer

    if (
      init.kind === ts.SyntaxKind.UndefinedKeyword ||
      (ts.isIdentifier(init) && init.text === 'undefined')
    ) {
      out.set(name, { value: undefined, isUndefined: true })
    } else if (init.kind === ts.SyntaxKind.TrueKeyword) {
      out.set(name, { value: true, isUndefined: false })
    } else if (init.kind === ts.SyntaxKind.FalseKeyword) {
      out.set(name, { value: false, isUndefined: false })
    } else if (init.kind === ts.SyntaxKind.NullKeyword) {
      out.set(name, { value: null, isUndefined: false })
    } else if (ts.isNumericLiteral(init)) {
      out.set(name, { value: Number(init.text), isUndefined: false })
    } else if (ts.isStringLiteral(init)) {
      out.set(name, { value: init.text, isUndefined: false })
    } else if (
      ts.isPrefixUnaryExpression(init) &&
      init.operator === ts.SyntaxKind.MinusToken &&
      ts.isNumericLiteral(init.operand)
    ) {
      out.set(name, { value: -Number(init.operand.text), isUndefined: false })
    } else if (ts.isArrowFunction(init)) {
      const val = evalArrowReturn(init, sf)
      out.set(
        name,
        val !== undefined
          ? { value: val, isUndefined: false }
          : { value: undefined, isUndefined: true }
      )
    } else {
      out.set(name, { value: init.getText(sf).trim(), isUndefined: false })
    }
  }
}

function printUntypedArrow(fn: ts.ArrowFunction, sf: ts.SourceFile): string {
  const params = fn.parameters.map((p) => p.name.getText(sf)).join(', ')
  const body = fn.body.getText(sf).trim()
  return `(${params}) => ${body}`
}

function evalArrowReturn(
  arrow: ts.ArrowFunction,
  sf: ts.SourceFile
): unknown | undefined {
  const { body } = arrow

  if (ts.isArrayLiteralExpression(body)) return evalArray(body, sf)

  if (ts.isParenthesizedExpression(body)) {
    if (ts.isObjectLiteralExpression(body.expression))
      return evalObject(body.expression, sf)
    if (ts.isArrowFunction(body.expression))
      return printUntypedArrow(body.expression, sf)
  }

  if (ts.isArrowFunction(body)) return printUntypedArrow(body, sf)

  if (ts.isFunctionExpression(body)) return body.getText(sf).trim()

  return undefined
}

function evalArray(
  arr: ts.ArrayLiteralExpression,
  sf: ts.SourceFile
): unknown[] {
  return arr.elements.map((el) => {
    if (ts.isStringLiteral(el)) return el.text
    if (ts.isNumericLiteral(el)) return Number(el.text)
    if (el.kind === ts.SyntaxKind.TrueKeyword) return true
    if (el.kind === ts.SyntaxKind.FalseKeyword) return false
    if (el.kind === ts.SyntaxKind.NullKeyword) return null
    return el.getText(sf).trim()
  })
}

function evalObject(
  obj: ts.ObjectLiteralExpression,
  sf: ts.SourceFile
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue
    const val = ts.isAsExpression(prop.initializer)
      ? prop.initializer.expression
      : prop.initializer

    if (ts.isStringLiteral(val)) result[prop.name.text] = val.text
    else if (ts.isNumericLiteral(val)) result[prop.name.text] = Number(val.text)
    else if (val.kind === ts.SyntaxKind.TrueKeyword)
      result[prop.name.text] = true
    else if (val.kind === ts.SyntaxKind.FalseKeyword)
      result[prop.name.text] = false
    else result[prop.name.text] = val.getText(sf).trim()
  }

  return result
}

// ============= BLUEPRINT ==============

export function extractBlueprintName(sourceFile: ts.SourceFile): string {
  let blueprintName = ''

  ts.forEachChild(sourceFile, (node) => {
    const specifierNode =
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
        ? node.moduleSpecifier
        : undefined

    if (specifierNode) {
      const match = specifierNode.text.match(
        /(?:[~@]\/blueprints|#\w[\w-]*\/blueprints|@vueform\/core\/blueprints)\/(.+)$/
      )
      if (match) {
        blueprintName = match[1]
      }
    }
  })

  return blueprintName
}

// =========== COMPONENT PROPS ==========

const UNWRAP_PROP_TYPES = new Set([
  'PartsProp',
  'ClassesProp',
  'ReclassProp',
  'ViewProp',
  'SlotsProp',
])

export function extractComponentProps(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration,
  defaults: Map<string, DefaultEntry>
): Record<string, PropInfo> {
  const result: Record<string, PropInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    if (propSym.name.includes(':')) continue

    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    let { typeText, isFunction } = getPropertyTypeInfo(propSym, decl, checker)

    if (
      ts.isPropertySignature(decl) &&
      decl.type &&
      ts.isTypeReferenceNode(decl.type)
    ) {
      const typeName = decl.type.typeName.getText(decl.getSourceFile())
      if (UNWRAP_PROP_TYPES.has(typeName) && decl.type.typeArguments?.length) {
        typeText = decl.type.typeArguments[0]
          .getText(decl.getSourceFile())
          .replace(/\s+/g, ' ')
          .replace(/<\s*\|\s*/g, '<')
          .replace(/<\s+/g, '<')
          .replace(/\s+>/g, '>')
          .replace(/^\|\s*/, '')
          .trim()
      }
    }

    const description = getSymbolDescription(propSym, checker)
    const info: PropInfo = { type: typeText, description, loc: loc(decl) }

    if (ts.isPropertySignature(decl) && !decl.questionToken) {
      info.required = true
    }

    if (getJSDocTag(decl, 'private') !== undefined) {
      info.private = true
    }

    const def = defaults.get(propSym.name)
    if (def && !def.isUndefined) {
      info.default = def.value
    } else if (!def && typeText === 'boolean') {
      info.default = false
    }

    if (isFunction) {
      const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
      const params = getFunctionParams(resolved, decl, checker)
      if (params) info.params = params
      const ret = getFunctionReturnType(resolved, checker)
      if (ret) info.returns = { type: ret }
    }

    result[propSym.name] = info
  }

  return result
}

// ======== ADAPTER PROP SOURCES ========

/**
 * Classifies each prop in the interface by its declaration source:
 *
 * - 'vueform': declared in the project's own packages
 * - 'adapter': declared in the adapter UI library (e.g. primevue)
 * - 'html': declared in Vue/DOM/TS lib types (generic HTML attributes)
 */
export function classifyPropSources(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration,
  adapterPackage: string
): Record<string, 'vueform' | 'adapter' | 'html'> {
  const result: Record<string, 'vueform' | 'adapter' | 'html'> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    if (propSym.name.includes(':')) continue

    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const fileName = decl.getSourceFile().fileName

    if (fileName.includes(`node_modules/${adapterPackage}`)) {
      result[propSym.name] = 'adapter'
    } else if (fileName.includes('node_modules/')) {
      result[propSym.name] = 'html'
    } else {
      result[propSym.name] = 'vueform'
    }
  }

  return result
}

function collectStringLiterals(node: ts.TypeNode, out: string[]): void {
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    out.push(node.literal.text)
  } else if (ts.isUnionTypeNode(node)) {
    for (const member of node.types) {
      collectStringLiterals(member, out)
    }
  }
}

/**
 * Parses the heritage clause of a Props interface to find `Omit<AdapterType,
 * ...>` and returns info about the adapter type: its name, component name,
 * omitted props, overwritten (modified) props, and unavailable props.
 *
 * If the `Omit<>` is not found directly, it traverses into parent interfaces
 * (e.g. blueprint Props) to locate it.
 */
export function extractAdapterTypeInfo(
  interfaceDecl: ts.InterfaceDeclaration,
  adapterPackage: string,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  finalProps: Record<string, PropInfo>,
  blueprintDecl?: ts.InterfaceDeclaration,
  blueprintSourceFile?: ts.SourceFile
): AdapterTypeInfo | undefined {
  const result = extractAdapterTypeInfoFromInterface(
    interfaceDecl,
    adapterPackage,
    sourceFile,
    checker,
    finalProps
  )
  if (result) return result

  if (blueprintDecl && blueprintSourceFile) {
    return extractAdapterTypeInfoFromInterface(
      blueprintDecl,
      adapterPackage,
      blueprintSourceFile,
      checker,
      finalProps
    )
  }

  return undefined
}

function extractAdapterTypeInfoFromInterface(
  interfaceDecl: ts.InterfaceDeclaration,
  adapterPackage: string,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  finalProps: Record<string, PropInfo>
): AdapterTypeInfo | undefined {
  if (!interfaceDecl.heritageClauses) return undefined

  for (const clause of interfaceDecl.heritageClauses) {
    for (const typeExpr of clause.types) {
      const expr = typeExpr.expression
      if (!ts.isIdentifier(expr) || expr.text !== 'Omit') continue

      const typeArgs = typeExpr.typeArguments
      if (!typeArgs || typeArgs.length < 2) continue

      const firstArg = typeArgs[0]
      const firstArgText = firstArg.getText(sourceFile)

      if (!isAdapterImport(firstArgText, sourceFile, adapterPackage)) continue

      const omitted: string[] = []
      collectStringLiterals(typeArgs[1], omitted)

      const componentName = firstArgText.replace(/Props$/, '')

      const overwrittenProps: Record<string, AdapterPropVersion> = {}
      const unavailableProps: Record<string, AdapterPropVersion> = {}
      const adapterType = checker.getTypeAtLocation(firstArg)
      if (adapterType) {
        for (const name of omitted) {
          const propSym = adapterType.getProperty(name)
          if (!propSym) continue

          const decl = propSym.getDeclarations()?.[0]
          if (!decl) continue

          const { typeText } = getPropertyTypeInfo(propSym, decl, checker)
          const description = getSymbolDescription(propSym, checker)
          const version: AdapterPropVersion = {
            type: typeText,
            description,
            loc: loc(decl),
          }

          if (finalProps[name]) {
            overwrittenProps[name] = version
          } else {
            unavailableProps[name] = version
          }
        }
      }

      return {
        typeName: firstArgText,
        componentName,
        omittedProps: omitted,
        overwrittenProps,
        unavailableProps,
      }
    }
  }

  return undefined
}

function isAdapterImport(
  typeName: string,
  sourceFile: ts.SourceFile,
  adapterPackage: string
): boolean {
  for (const stmt of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !stmt.importClause?.namedBindings ||
      !ts.isNamedImports(stmt.importClause.namedBindings)
    )
      continue

    const moduleSpec = (stmt.moduleSpecifier as ts.StringLiteral).text
    if (!moduleSpec.startsWith(adapterPackage)) continue

    for (const el of stmt.importClause.namedBindings.elements) {
      if (el.name.text === typeName) return true
    }
  }

  return false
}

// ============== EVENTS ================

export function extractEvents(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration
): Record<string, EventInfo> {
  const result: Record<string, EventInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const description = getSymbolDescription(propSym, checker)
    const params = getEventParams(propSym, checker, interfaceDecl)
    const decl = propSym.getDeclarations()?.[0]

    const info: EventInfo = { description, loc: loc(decl ?? interfaceDecl) }
    if (params) info.params = params

    result[propSym.name] = info
  }

  return result
}

// =============== PARTS ================

export function extractParts(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration
): Record<string, PartInfo> {
  const result: Record<string, PartInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const description = getSymbolDescription(propSym, checker)
    const tag = getJSDocTag(decl, 'tag')

    const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
    const isFunc = isFunctionLikeType(resolved.getNonNullableType())

    let partType: string
    if (isFunc) {
      partType = 'function'
    } else if (ts.isPropertySignature(decl) && decl.type) {
      const typeText = decl.type
        .getText(decl.getSourceFile())
        .replace(/\s+/g, ' ')
        .replace(/<\s*\|\s*/g, '<')
        .replace(/<\s+/g, '<')
        .replace(/\s+>/g, '>')
        .replace(/^\|\s*/, '')
        .trim()
      if (typeText.startsWith('PartOf<')) {
        partType = 'object'
      } else {
        partType = checker.typeToString(
          resolved.getNonNullableType(),
          decl,
          TYPE_FORMAT_FLAGS
        )
      }
    } else {
      partType = checker.typeToString(
        resolved.getNonNullableType(),
        decl,
        TYPE_FORMAT_FLAGS
      )
    }

    const info: PartInfo = { type: partType, description, loc: loc(decl) }
    if (tag) info.tag = tag

    if (isFunc) {
      const params = getFunctionParams(
        resolved.getNonNullableType(),
        decl,
        checker
      )
      if (params) info.params = params
    }

    result[propSym.name] = info
  }

  return result
}

// =============== SLOTS ================

export function extractSlots(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration
): Record<string, SlotInfo> {
  const result: Record<string, SlotInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const description = getSymbolDescription(propSym, checker)
    const contextTag = getJSDocTag(decl, 'context')
    const exposes = getJSDocTag(decl, 'exposes')
    const inherits = getJSDocTag(decl, 'inherits')

    const info: SlotInfo = { description, loc: loc(decl) }

    if (contextTag !== undefined || exposes !== undefined) {
      info.exposes = exposes || 'context'
    } else if (inherits) {
      info.inherits = inherits
    } else {
      const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
      const sigs = resolved.getNonNullableType().getCallSignatures()

      if (sigs.length && sigs[0].getParameters().length) {
        const paramSym = sigs[0].getParameters()[0]
        const paramType = checker.getTypeOfSymbolAtLocation(paramSym, decl)

        if (paramType.getProperties().length) {
          const params: Record<string, SlotParamInfo> = {}

          for (const memberSym of paramType.getProperties()) {
            const memberDecl = memberSym.getDeclarations()?.[0]
            if (!memberDecl) continue

            const memberDesc = getSymbolDescription(memberSym, checker)
            const memberType = checker.getTypeOfSymbolAtLocation(
              memberSym,
              memberDecl
            )
            const memberIsFunc = isFunctionLikeType(memberType)

            if (memberIsFunc) {
              const member: SlotParamInfo = {
                type: 'function',
                description: memberDesc,
                loc: loc(memberDecl),
              }
              const funcParams = getFunctionParams(
                memberType,
                memberDecl,
                checker
              )
              if (funcParams) member.params = funcParams
              const ret = getFunctionReturnType(memberType, checker)
              if (ret) member.returns = { type: ret }
              params[memberSym.name] = member
            } else {
              let memberTypeText: string
              if (ts.isPropertySignature(memberDecl) && memberDecl.type) {
                memberTypeText = memberDecl.type
                  .getText(memberDecl.getSourceFile())
                  .replace(/\s+/g, ' ')
                  .replace(/<\s*\|\s*/g, '<')
                  .replace(/<\s+/g, '<')
                  .replace(/\s+>/g, '>')
                  .replace(/^\|\s*/, '')
                  .trim()
              } else {
                memberTypeText = checker.typeToString(
                  memberType,
                  memberDecl,
                  TYPE_FORMAT_FLAGS
                )
              }

              params[memberSym.name] = {
                type: memberTypeText,
                description: memberDesc,
                loc: loc(memberDecl),
              }
            }
          }

          if (Object.keys(params).length) info.params = params
        }
      }
    }

    result[propSym.name] = info
  }

  return result
}

// =============== VIEWS ================

// ============== CLASSES ===============

function shouldExpandType(type: ts.Type): boolean {
  const symbol = type.getSymbol() || type.aliasSymbol
  if (!symbol) return false

  const decl = symbol.getDeclarations()?.[0]
  if (!decl) return false

  const isExported =
    (ts.getCombinedModifierFlags(decl as ts.Declaration) &
      ts.ModifierFlags.Export) !==
    0
  if (isExported) return false

  return type.getProperties().length > 0 && !type.getCallSignatures().length
}

export function extractClassTypes(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration
): Record<string, ClassInfo> {
  const result: Record<string, ClassInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const description = getSymbolDescription(propSym, checker)
    const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
    const isFunc = isFunctionLikeType(resolved)

    const info: ClassInfo = {
      type: isFunc ? 'function' : 'ClassValue',
      description,
      loc: loc(decl),
    }

    if (isFunc) {
      const jsdoc = getJSDocParamDescriptions(decl)
      const sigs = resolved.getNonNullableType().getCallSignatures()

      if (sigs.length) {
        const params: Record<string, string | ClassParamExpanded> = {}

        for (const paramSym of sigs[0].getParameters()) {
          const paramType = checker.getTypeOfSymbolAtLocation(paramSym, decl)
          const paramDesc = jsdoc.get(paramSym.name) ?? ''

          if (shouldExpandType(paramType)) {
            const expanded: ClassParamExpanded['type'] = {}

            for (const memberSym of paramType.getProperties()) {
              const memberDecl = memberSym.getDeclarations()?.[0]
              if (!memberDecl) continue

              let memberTypeText: string
              if (ts.isPropertySignature(memberDecl) && memberDecl.type) {
                memberTypeText = memberDecl.type
                  .getText(memberDecl.getSourceFile())
                  .replace(/\s+/g, ' ')
                  .replace(/<\s*\|\s*/g, '<')
                  .replace(/<\s+/g, '<')
                  .replace(/\s+>/g, '>')
                  .replace(/^\|\s*/, '')
                  .trim()
              } else {
                memberTypeText = checker.typeToString(
                  checker.getTypeOfSymbolAtLocation(memberSym, memberDecl),
                  memberDecl,
                  TYPE_FORMAT_FLAGS
                )
              }

              expanded[memberSym.name] = {
                type: memberTypeText,
                description: getSymbolDescription(memberSym, checker),
                loc: loc(memberDecl),
              }
            }

            const paramDecl = paramSym.getDeclarations()?.[0]
            params[paramSym.name] = {
              type: expanded,
              description: paramDesc,
              ...(paramDecl ? { loc: loc(paramDecl) } : {}),
            }
          } else {
            params[paramSym.name] = paramDesc
          }
        }

        if (Object.keys(params).length) info.params = params
      }
    }

    result[propSym.name] = info
  }

  return result
}

// ========== CLASS DEFAULTS ============

export function parseBaseVfLayoutClasses(
  program: ts.Program,
  filePath: string,
  varName: string
): Record<string, string> {
  const sf = program.getSourceFile(filePath)
  if (!sf) return {}

  const result: Record<string, string> = {}

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === varName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name))
          continue
        if (ts.isStringLiteral(prop.initializer)) {
          result[prop.name.text] = prop.initializer.text
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return result
}

/**
 * Parse an adapter config.ts to extract class defaults from
 * baseClasses['*element']. Returns a record mapping class slot names (root,
 * panel, label, etc.) to their default class string with conditional classes
 * marked with `?`.
 */
export function parseConfigElementClasses(
  configPath: string
): Record<string, string> {
  if (!fs.existsSync(configPath)) return {}
  const content = fs.readFileSync(configPath, 'utf-8')

  const sf = ts.createSourceFile(
    'config.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  )

  const result: Record<string, string> = {}

  let elementObj: ts.ObjectLiteralExpression | undefined

  function findElementBlock(node: ts.Node) {
    if (elementObj) return
    if (
      ts.isPropertyAssignment(node) &&
      ((ts.isStringLiteral(node.name) && node.name.text === '*element') ||
        (ts.isComputedPropertyName(node.name) &&
          ts.isStringLiteral(node.name.expression) &&
          node.name.expression.text === '*element'))
    ) {
      if (ts.isObjectLiteralExpression(node.initializer)) {
        elementObj = node.initializer
      }
    }
    ts.forEachChild(node, findElementBlock)
  }
  findElementBlock(sf)

  if (!elementObj) return {}

  for (const prop of elementObj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const key = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : null
    if (!key) continue

    const classStr = extractConfigClassDefault(prop.initializer)
    if (classStr) {
      result[key] = classStr
    }
  }

  return result
}

function extractConfigClassDefault(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const vfClasses = node.text.split(/\s+/).filter((c) => c.startsWith('vf-'))
    return vfClasses.length > 0 ? vfClasses.join(' ') : null
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    const returnObj = findReturnObject(node)
    if (!returnObj) return null
    return extractClassesFromObject(returnObj)
  }

  return null
}

function findReturnObject(
  fn: ts.ArrowFunction | ts.FunctionExpression
): ts.ObjectLiteralExpression | null {
  if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) {
    if (ts.isObjectLiteralExpression(fn.body)) return fn.body
    if (
      ts.isParenthesizedExpression(fn.body) &&
      ts.isObjectLiteralExpression(fn.body.expression)
    )
      return fn.body.expression
    return null
  }

  if (fn.body && ts.isBlock(fn.body)) {
    for (const stmt of fn.body.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        if (ts.isObjectLiteralExpression(stmt.expression))
          return stmt.expression
        if (
          ts.isParenthesizedExpression(stmt.expression) &&
          ts.isObjectLiteralExpression(stmt.expression.expression)
        )
          return stmt.expression.expression
      }
    }
  }

  return null
}

function extractClassesFromObject(
  obj: ts.ObjectLiteralExpression
): string | null {
  const classes: string[] = []

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue

    let className: string | null = null
    if (
      ts.isStringLiteral(prop.name) ||
      ts.isNoSubstitutionTemplateLiteral(prop.name)
    ) {
      className = prop.name.text
    } else if (
      ts.isComputedPropertyName(prop.name) &&
      (ts.isStringLiteral(prop.name.expression) ||
        ts.isNoSubstitutionTemplateLiteral(prop.name.expression))
    ) {
      className = prop.name.expression.text
    }

    if (!className || !className.startsWith('vf-')) continue

    const isAlwaysOn = prop.initializer.kind === ts.SyntaxKind.TrueKeyword
    classes.push(isAlwaysOn ? className : `${className}?`)
  }

  return classes.length > 0 ? classes.join(' ') : null
}

/**
 * Extracts the base per-part classes from a package's VfLayout.vue
 * `useLayoutClasses({...})` map: string values verbatim, function values via
 * their returned conditional class map (conditional classes suffixed with ?).
 */
export function parseLayoutBaseClasses(
  packageDir: string
): Record<string, string> {
  const vuePath = path.join(packageDir, 'src/components/VfLayout/VfLayout.vue')
  if (!fs.existsSync(vuePath)) return {}

  const content = fs.readFileSync(vuePath, 'utf-8')
  const scriptMatch = content.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return {}

  const sf = ts.createSourceFile(
    'script.ts',
    scriptMatch[1],
    ts.ScriptTarget.Latest,
    true
  )

  let call: ts.CallExpression | undefined
  function findCall(node: ts.Node) {
    if (call) return
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useLayoutClasses'
    ) {
      call = node
    }
    ts.forEachChild(node, findCall)
  }
  findCall(sf)

  const arg = call?.arguments[0]
  if (!arg || !ts.isObjectLiteralExpression(arg)) return {}

  const result: Record<string, string> = {}
  for (const prop of arg.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const key = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : null
    if (!key) continue

    const classStr = extractConfigClassDefault(prop.initializer)
    if (classStr) {
      result[key] = classStr
    }
  }

  return result
}

export function extractClassDefaults(
  componentName: string,
  componentDir: string,
  baseClasses: Record<string, string>,
  baseClassesVarName = 'VfLayoutClasses'
): Record<string, string> {
  if (componentName === 'VfLayout' && Object.keys(baseClasses).length > 0) {
    return { ...baseClasses }
  }

  const vuePath = path.join(componentDir, `${componentName}.vue`)
  if (!fs.existsSync(vuePath)) return {}

  const content = fs.readFileSync(vuePath, 'utf-8')

  const scriptMatch = content.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) return {}

  const scriptContent = scriptMatch[1]
  const sf = ts.createSourceFile(
    'script.ts',
    scriptContent,
    ts.ScriptTarget.Latest,
    true
  )

  let useClassesCall: ts.CallExpression | undefined
  function findUseClasses(node: ts.Node) {
    if (useClassesCall) return
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useClasses'
    ) {
      useClassesCall = node
    }
    ts.forEachChild(node, findUseClasses)
  }
  findUseClasses(sf)

  if (!useClassesCall) return {}

  let usesBaseClasses = false
  let factoryArg: ts.Expression | undefined

  const args = useClassesCall.arguments
  if (
    args.length === 1 &&
    (ts.isArrowFunction(args[0]) || ts.isFunctionExpression(args[0]))
  ) {
    factoryArg = args[0]
  } else if (args.length === 3) {
    usesBaseClasses =
      ts.isIdentifier(args[1]) &&
      (args[1].text === baseClassesVarName ||
        args[1].text === 'VfLayoutClasses' ||
        args[1].text === 'BaseVfLayoutClasses')
    factoryArg = args[2]
  } else if (
    args.length === 2 &&
    (ts.isArrowFunction(args[1]) || ts.isFunctionExpression(args[1]))
  ) {
    factoryArg = args[1]
  }

  if (
    !factoryArg ||
    (!ts.isArrowFunction(factoryArg) && !ts.isFunctionExpression(factoryArg))
  )
    return {}

  const factory = factoryArg as ts.ArrowFunction | ts.FunctionExpression
  let obj: ts.ObjectLiteralExpression | undefined

  if (ts.isArrowFunction(factory) && !ts.isBlock(factory.body)) {
    if (
      ts.isParenthesizedExpression(factory.body) &&
      ts.isObjectLiteralExpression(factory.body.expression)
    ) {
      obj = factory.body.expression
    }
  } else if (factory.body && ts.isBlock(factory.body)) {
    for (const stmt of factory.body.statements) {
      if (ts.isReturnStatement(stmt) && stmt.expression) {
        if (ts.isObjectLiteralExpression(stmt.expression)) {
          obj = stmt.expression
        } else if (
          ts.isParenthesizedExpression(stmt.expression) &&
          ts.isObjectLiteralExpression(stmt.expression.expression)
        ) {
          obj = stmt.expression.expression
        }
        break
      }
    }
  }

  if (!obj) return {}

  const componentDefaults: Record<string, string> = {}

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const name = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : null
    if (!name) continue

    const classStr = resolveClassDefault(prop.initializer, sf)
    if (classStr) {
      componentDefaults[name] = classStr
    }
  }

  if (!usesBaseClasses) return componentDefaults

  const merged: Record<string, string> = { ...baseClasses }

  for (const [key, value] of Object.entries(componentDefaults)) {
    if (merged[key]) {
      merged[key] = deduplicateClasses(`${merged[key]} ${value}`)
    } else {
      merged[key] = value
    }
  }

  return merged
}

function resolveClassDefault(
  expr: ts.Expression,
  sf: ts.SourceFile
): string | undefined {
  if (ts.isStringLiteral(expr)) {
    return expr.text
  }

  if (ts.isObjectLiteralExpression(expr)) {
    return resolveObjectClasses(expr)
  }

  if (ts.isArrayLiteralExpression(expr)) {
    return resolveArrayClasses(expr, sf)
  }

  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
    return resolveClassFromFunctionBody(expr, sf)
  }

  return undefined
}

function resolveObjectClasses(obj: ts.ObjectLiteralExpression): string {
  const classes: string[] = []

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue

    let name: string | undefined
    if (ts.isStringLiteral(prop.name)) {
      name = prop.name.text
    } else if (ts.isIdentifier(prop.name)) {
      name = prop.name.text
    }

    if (!name) continue

    if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
      classes.push(name)
    } else {
      classes.push(`${name}?`)
    }
  }

  return classes.join(' ')
}

function resolveArrayClasses(
  arr: ts.ArrayLiteralExpression,
  sf: ts.SourceFile
): string {
  const parts: string[] = []

  for (const elem of arr.elements) {
    if (ts.isStringLiteral(elem)) {
      parts.push(elem.text)
    } else if (ts.isObjectLiteralExpression(elem)) {
      const objClasses = resolveObjectClasses(elem)
      if (objClasses) parts.push(objClasses)
    } else if (
      ts.isTemplateExpression(elem) ||
      ts.isNoSubstitutionTemplateLiteral(elem)
    ) {
      parts.push(elem.getText(sf))
    }
  }

  return parts.join(' ')
}

function resolveClassFromFunctionBody(
  fn: ts.ArrowFunction | ts.FunctionExpression,
  sf: ts.SourceFile
): string | undefined {
  if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) {
    if (ts.isArrayLiteralExpression(fn.body)) {
      return resolveArrayClasses(fn.body, sf)
    }
    if (ts.isObjectLiteralExpression(fn.body)) {
      return resolveObjectClasses(fn.body)
    }
    if (ts.isParenthesizedExpression(fn.body)) {
      if (ts.isObjectLiteralExpression(fn.body.expression)) {
        return resolveObjectClasses(fn.body.expression)
      }
      if (ts.isArrayLiteralExpression(fn.body.expression)) {
        return resolveArrayClasses(fn.body.expression, sf)
      }
    }
  }

  return undefined
}

export function deduplicateClasses(classStr: string): string {
  const seen = new Set<string>()
  const result: string[] = []

  for (const cls of classStr.split(' ')) {
    if (!cls) continue
    const key = cls.replace(/\?$/, '')
    if (!seen.has(key)) {
      seen.add(key)
      result.push(cls)
    }
  }

  return result.join(' ')
}

// =========== COMPONENT API ============

export function extractComponentApi(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Record<string, ApiMemberInfo> | undefined {
  const returnObj = findUseExtendReturn(sourceFile)
  if (!returnObj) return undefined

  const api: Record<string, ApiMemberInfo> = {}

  for (const prop of returnObj.properties) {
    if (ts.isSpreadAssignment(prop)) continue

    if (ts.isShorthandPropertyAssignment(prop)) {
      const symbol = checker.getShorthandAssignmentValueSymbol(prop)
      if (!symbol) continue

      const decl = symbol.getDeclarations()?.[0]
      if (!decl) continue

      const description = getSymbolDescription(symbol, checker)
      if (!description) continue

      const memberType = checker.getTypeOfSymbolAtLocation(symbol, decl)
      const isFunc = isFunctionLikeType(memberType)
      const typeStr = isFunc
        ? 'function'
        : checker.typeToString(memberType, decl, TYPE_FORMAT_FLAGS)

      const member: ApiMemberInfo = {
        type: typeStr,
        description,
        loc: loc(decl),
      }

      if (isFunc) {
        const params = getFunctionParams(memberType, decl, checker)
        if (params) member.params = params
        const ret = getFunctionReturnType(memberType, checker)
        if (ret) member.returns = { type: ret }
      }

      api[prop.name.text] = member
    } else if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      const description = getNodeJSDocDescription(prop)
      if (!description) continue

      const exprType = checker.getTypeAtLocation(prop.initializer)
      const isFunc = isFunctionLikeType(exprType)
      const typeStr = isFunc
        ? 'function'
        : checker.typeToString(exprType, prop, TYPE_FORMAT_FLAGS)

      const member: ApiMemberInfo = {
        type: typeStr,
        description,
        loc: loc(prop),
      }

      if (isFunc) {
        const jsdoc = getJSDocParamDescriptions(prop)
        if (jsdoc.size) {
          const params: Record<string, ParamInfo> = {}
          const sigs = exprType.getNonNullableType().getCallSignatures()
          const sigParams = sigs[0]?.getParameters() ?? []

          for (const sp of sigParams) {
            const pt = checker.getTypeOfSymbolAtLocation(sp, prop)
            const spDecl = sp.getDeclarations()?.[0]
            params[sp.name] = {
              type: checker.typeToString(pt, undefined, TYPE_FORMAT_FLAGS),
              description: jsdoc.get(sp.name) ?? '',
              ...(spDecl ? { loc: loc(spDecl) } : {}),
            }
          }
          if (Object.keys(params).length) member.params = params
        }
        const ret = getFunctionReturnType(exprType, checker)
        if (ret) member.returns = { type: ret }
      }

      api[prop.name.text] = member
    }
  }

  return Object.keys(api).length ? api : undefined
}

function findUseExtendReturn(
  sourceFile: ts.SourceFile
): ts.ObjectLiteralExpression | undefined {
  let result: ts.ObjectLiteralExpression | undefined

  function visit(node: ts.Node) {
    if (result) return

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useExtend'
    ) {
      const fn = node.arguments[1]
      if (!fn || (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)))
        return

      if (fn.body && ts.isBlock(fn.body)) {
        for (let i = fn.body.statements.length - 1; i >= 0; i--) {
          const stmt = fn.body.statements[i]
          if (!ts.isReturnStatement(stmt) || !stmt.expression) continue

          if (ts.isObjectLiteralExpression(stmt.expression)) {
            result = stmt.expression
          } else if (
            ts.isParenthesizedExpression(stmt.expression) &&
            ts.isObjectLiteralExpression(stmt.expression.expression)
          ) {
            result = stmt.expression.expression
          }
          return
        }
      } else if (
        ts.isParenthesizedExpression(fn.body) &&
        ts.isObjectLiteralExpression(fn.body.expression)
      ) {
        result = fn.body.expression
      } else if (ts.isObjectLiteralExpression(fn.body)) {
        result = fn.body
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return result
}

// =========== AUGMENTATIONS ============

function findDeclareModuleInterface(
  sourceFile: ts.SourceFile,
  moduleName: string,
  interfaceName: string
): ts.InterfaceDeclaration | undefined {
  for (const stmt of sourceFile.statements) {
    if (
      ts.isModuleDeclaration(stmt) &&
      ts.isStringLiteral(stmt.name) &&
      stmt.name.text === moduleName &&
      stmt.body &&
      ts.isModuleBlock(stmt.body)
    ) {
      for (const inner of stmt.body.statements) {
        if (
          ts.isInterfaceDeclaration(inner) &&
          inner.name.text === interfaceName
        ) {
          return inner
        }
      }
    }
  }
  return undefined
}

export interface BaseAugmentations {
  slots: Record<string, SlotInfo>
  parts: Record<string, PartInfo>
  classes: Record<string, ClassInfo>
}

/**
 * Parses an adapter's `src/features/augment.ts` and extracts the augmented
 * `BaseElementSlots`, `BaseElementParts`, and `BaseElementClasses` members.
 * Returns `null` if the file doesn't exist.
 */
export function extractBaseAugmentations(
  adapterPackageDir: string
): BaseAugmentations | null {
  const augmentPath = path.join(adapterPackageDir, 'src/features/augment.ts')
  if (!fs.existsSync(augmentPath)) return null

  const { program, checker } = createProgram(adapterPackageDir)
  const sourceFile = program.getSourceFile(augmentPath)
  if (!sourceFile) return null

  const slotsDecl = findDeclareModuleInterface(
    sourceFile,
    '@vueform/core',
    'BaseElementSlots'
  )
  const partsDecl = findDeclareModuleInterface(
    sourceFile,
    '@vueform/core',
    'BaseElementParts'
  )
  const classesDecl = findDeclareModuleInterface(
    sourceFile,
    '@vueform/core',
    'BaseElementClasses'
  )

  return {
    slots: slotsDecl ? extractSlots(checker, slotsDecl) : {},
    parts: partsDecl ? extractParts(checker, partsDecl) : {},
    classes: classesDecl ? extractClassTypes(checker, classesDecl) : {},
  }
}

// =============== UTILS ================

export function findInterface(
  sourceFile: ts.SourceFile,
  name: string
): ts.InterfaceDeclaration | undefined {
  let found: ts.InterfaceDeclaration | undefined
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
      found = node
    }
  })
  return found
}

/**
 * Detects adapter factory names referenced in a useFeatures call inside an
 * api.ts file. Looks for identifiers imported from the adapter's own factories
 * module.
 */
export function extractAdapterFeatureNames(
  apiSourceFile: ts.SourceFile
): string[] {
  const localImports = new Set<string>()

  ts.forEachChild(apiSourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text
      if (
        specifier.includes('/factories') ||
        specifier.includes('/composables')
      ) {
        const clause = node.importClause
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const el of clause.namedBindings.elements) {
            localImports.add(el.name.text)
          }
        }
      }
    }
  })

  const names: string[] = []

  function collectFromUseArg(arg: ts.Expression) {
    if (ts.isIdentifier(arg) && localImports.has(arg.text)) {
      names.push(arg.text)
    } else if (
      ts.isCallExpression(arg) &&
      ts.isIdentifier(arg.expression) &&
      localImports.has(arg.expression.text)
    ) {
      names.push(arg.expression.text)
    }
  }

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      // Builder: … .use(makeX())
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'use' &&
        node.arguments[0]
      ) {
        collectFromUseArg(node.arguments[0])
      }

      // Legacy array form: useFeatures(props, events, [makeX, …])
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'useFeatures'
      ) {
        const arrayArg = node.arguments[2]
        if (arrayArg && ts.isArrayLiteralExpression(arrayArg)) {
          for (const elem of arrayArg.elements) {
            collectFromUseArg(elem)
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(apiSourceFile)
  return names
}

// ======= FORWARDED EVENT DESCRIPTIONS ========

function kebabToCamel(s: string): string {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/**
 * Resolves descriptions for forwarded events by looking at the original adapter
 * emits type referenced in `ForwardedEvents<EmitsType, ...>` heritage. Walks
 * one level of heritage to find ForwardedEvents.
 */
export function resolveForwardedEventDescriptions(
  checker: ts.TypeChecker,
  eventsDecl: ts.InterfaceDeclaration
): Record<string, string> {
  const result: Record<string, string> = {}

  function searchHeritage(decl: ts.InterfaceDeclaration): void {
    if (!decl.heritageClauses) return
    const sf = decl.getSourceFile()

    for (const clause of decl.heritageClauses) {
      for (const typeExpr of clause.types) {
        const exprText = typeExpr.expression.getText(sf)

        if (exprText === 'ForwardedEvents') {
          const typeArgs = typeExpr.typeArguments
          if (!typeArgs || typeArgs.length < 1) continue

          const emitsType = checker.getTypeAtLocation(typeArgs[0])
          if (!emitsType) continue

          for (const prop of emitsType.getProperties()) {
            const docs = prop.getDocumentationComment(checker)
            const desc = docs.map((d) => d.text).join('')
            if (desc) {
              result[kebabToCamel(prop.name)] = desc
                .split('\n')
                .map((l) => l.trim())
                .join('\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim()
                .split('\n\n')
                .map((paragraph) => paragraph.replace(/\n/g, ' '))
                .join('\n\n')
            }
          }
          continue
        }

        const hType = checker.getTypeAtLocation(typeExpr)
        const hSym = hType.getSymbol()
        if (hSym) {
          const hDecl = hSym.getDeclarations()?.[0]
          if (hDecl && ts.isInterfaceDeclaration(hDecl)) {
            searchHeritage(hDecl)
          }
        }
      }
    }
  }

  searchHeritage(eventsDecl)
  return result
}

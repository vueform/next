import * as fs from 'node:fs'
import * as path from 'node:path'

import * as ts from 'typescript'

import { corePackage, adapters, nonCoreAdapters } from '../lib/adapters'
import { createProgram, loc } from '../lib/extract'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)

const SKIP_FILES = new Set(['types.ts', 'index.ts'])

// =============== TYPES ================

interface ParamInfo {
  type: string
  description: string
  loc?: string
}

interface PropInfo {
  type: string
  description: string
  loc?: string
  required?: true
  private?: true
  default?: unknown
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

interface EventInfo {
  description: string
  loc?: string
  params: Record<string, ParamInfo>
}

interface ApiMemberInfo {
  type: string
  description: string
  loc?: string
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

interface BlueprintEntry {
  description?: string
  loc?: string
  props: Record<string, PropInfo>
  events: Record<string, EventInfo>
  features?: string[]
  api?: Record<string, ApiMemberInfo>
}

interface DefaultEntry {
  value: unknown
  isUndefined: boolean
}

// ============= TS PROGRAM =============

// ============ JSDOC HELPERS ===========

function singleLine(s: string): string {
  return s.replace(/\s*\n\s*/g, ' ').trim()
}

function getSymbolDescription(
  symbol: ts.Symbol,
  checker: ts.TypeChecker
): string {
  return singleLine(
    symbol
      .getDocumentationComment(checker)
      .map((p) => p.text)
      .join('')
  )
}

function getJSDocParamDescriptions(node: ts.Node): Map<string, string> {
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

function getNodeJSDocDescription(node: ts.Node): string {
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

function getJSDocTag(node: ts.Node, tagName: string): string | undefined {
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

// ============ TYPE HELPERS ============

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

function isFunctionLikeType(type: ts.Type): boolean {
  const inner = type.getNonNullableType()
  return !inner.isUnion() && inner.getCallSignatures().length > 0
}

function getPropertyTypeInfo(
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

function getFunctionParams(
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

function getFunctionReturnType(
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

function getEventParams(
  symbol: ts.Symbol,
  _checker: ts.TypeChecker
): Record<string, ParamInfo> | undefined {
  const decl = symbol.getDeclarations()?.[0]
  if (!decl) return undefined

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

  return undefined
}

// =========== PROPS & EVENTS ===========

function extractProps(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
  defaults: Map<string, DefaultEntry>
): Record<string, PropInfo> {
  const result: Record<string, PropInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = ts.isTypeAliasDeclaration(interfaceDecl)
    ? checker.getTypeAtLocation(interfaceDecl.type)
    : checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const { typeText, isFunction } = getPropertyTypeInfo(propSym, decl, checker)
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

function extractEvents(
  checker: ts.TypeChecker,
  interfaceDecl: ts.InterfaceDeclaration
): Record<string, EventInfo> {
  const result: Record<string, EventInfo> = {}
  const sym = checker.getSymbolAtLocation(interfaceDecl.name)
  if (!sym) return result

  const type = checker.getDeclaredTypeOfSymbol(sym)

  for (const propSym of type.getProperties()) {
    const description = getSymbolDescription(propSym, checker)
    const params = getEventParams(propSym, checker)
    // Mapped-type members (forwarded adapter events) have no declaration of
    // their own — anchor those on the Emits interface instead.
    const decl = propSym.getDeclarations()?.[0] ?? interfaceDecl

    const info: EventInfo = {
      description,
      loc: loc(decl),
      params: params ?? {},
    }

    result[propSym.name] = info
  }

  return result
}

// ============== DEFAULTS ==============

function extractDefaults(sourceFile: ts.SourceFile): Map<string, DefaultEntry> {
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
    const val = unwrapAs(prop.initializer)

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

function unwrapAs(node: ts.Expression): ts.Expression {
  return ts.isAsExpression(node) ? node.expression : node
}

// ============= FACTORIES ==============

/**
 * Walks a `useFeatures(…).use(…).build()` chain and collects factory names from
 * each `.use(…)` argument.
 */
function extractFeaturesFromBuilderChain(
  node: ts.Expression
): string[] | undefined {
  const names: string[] = []
  let current: ts.Expression = unwrapAs(node)

  while (ts.isCallExpression(current)) {
    const expr = current.expression
    if (
      ts.isPropertyAccessExpression(expr) &&
      (expr.name.text === 'use' || expr.name.text === 'build')
    ) {
      if (expr.name.text === 'use' && current.arguments[0]) {
        const arg = unwrapAs(current.arguments[0])
        if (ts.isIdentifier(arg)) {
          names.unshift(arg.text)
        } else if (
          ts.isCallExpression(arg) &&
          ts.isIdentifier(arg.expression)
        ) {
          names.unshift(arg.expression.text)
        }
      }
      current = unwrapAs(expr.expression)
      continue
    }
    if (ts.isIdentifier(expr) && expr.text === 'useFeatures') {
      return names.length ? names : undefined
    }
    break
  }

  return undefined
}

function extractFeatures(sourceFile: ts.SourceFile): string[] | undefined {
  let result: string[] | undefined

  function visit(node: ts.Node) {
    if (result) return
    if (ts.isCallExpression(node)) {
      // Builder: useFeatures(…).use(makeX()).build()
      const fromBuilder = extractFeaturesFromBuilderChain(node)
      if (fromBuilder) {
        result = fromBuilder
        return
      }

      // Legacy array form (kept for older snapshots / examples)
      if (
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'useFeatures'
      ) {
        const arr = node.arguments[2]
        if (arr && ts.isArrayLiteralExpression(arr)) {
          const names: string[] = []
          for (const elem of arr.elements) {
            if (ts.isIdentifier(elem)) {
              names.push(elem.text)
            } else if (
              ts.isCallExpression(elem) &&
              ts.isIdentifier(elem.expression)
            ) {
              names.push(elem.expression.text)
            }
          }
          result = names
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return result
}

// ================ API =================

function isEventsSpread(
  spread: ts.SpreadAssignment,
  checker: ts.TypeChecker
): boolean {
  const expr = spread.expression
  if (!ts.isIdentifier(expr) || expr.text !== 'events') return false

  const sym = checker.getSymbolAtLocation(expr)
  if (!sym) return false

  const type = checker.getTypeOfSymbolAtLocation(sym, spread)
  const props = type.getProperties().map((p) => p.name)
  return props.includes('fire') && props.includes('fireAsync')
}

function resolveDescriptionChain(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
  depth = 0
): string {
  if (depth > 5) return ''

  const description = getSymbolDescription(symbol, checker)
  if (description) return description

  const decl = symbol.getDeclarations()?.[0]
  if (!decl) return ''

  if (ts.isBindingElement(decl)) {
    const bp = decl.parent
    if (!ts.isObjectBindingPattern(bp)) return ''
    const vd = bp.parent
    if (!ts.isVariableDeclaration(vd) || !vd.initializer) return ''
    const initType = checker.getTypeAtLocation(vd.initializer)
    const originSym = initType.getProperty(symbol.name)
    if (originSym) return resolveDescriptionChain(originSym, checker, depth + 1)
  }

  if (ts.isShorthandPropertyAssignment(decl)) {
    const valueSym = checker.getShorthandAssignmentValueSymbol(decl)
    if (valueSym) return resolveDescriptionChain(valueSym, checker, depth + 1)
  }

  return ''
}

function resolveOriginalSymbol(
  propSym: ts.Symbol,
  checker: ts.TypeChecker
): { symbol: ts.Symbol; decl: ts.Declaration } | undefined {
  const decl = propSym.getDeclarations()?.[0]
  if (!decl) return undefined

  if (ts.isShorthandPropertyAssignment(decl)) {
    const valueSym = checker.getShorthandAssignmentValueSymbol(decl)
    if (valueSym) {
      const valueDecl = valueSym.getDeclarations()?.[0]
      if (valueDecl) return { symbol: valueSym, decl: valueDecl }
    }
  }

  return { symbol: propSym, decl }
}

function extractSpreadMembers(
  spread: ts.SpreadAssignment,
  checker: ts.TypeChecker
): Record<string, ApiMemberInfo> {
  const result: Record<string, ApiMemberInfo> = {}
  const type = checker.getTypeAtLocation(spread.expression)

  for (const propSym of type.getProperties()) {
    const resolved = resolveOriginalSymbol(propSym, checker)
    if (!resolved) continue

    const { symbol, decl } = resolved
    const description = getSymbolDescription(symbol, checker)
    if (!description) continue

    const memberType = checker.getTypeOfSymbolAtLocation(symbol, decl)
    const isFunc = isFunctionLikeType(memberType)
    const typeStr = isFunc
      ? 'function'
      : checker.typeToString(memberType, decl, TYPE_FORMAT_FLAGS)

    const member: ApiMemberInfo = { type: typeStr, description, loc: loc(decl) }

    if (isFunc) {
      const params = getFunctionParams(memberType, decl, checker)
      if (params) member.params = params
      const ret = getFunctionReturnType(memberType, checker)
      if (ret) member.returns = { type: ret }
    }

    result[propSym.name] = member
  }

  return result
}

function extractApi(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): Record<string, ApiMemberInfo> | undefined {
  const returnObj = findApiReturnObject(sourceFile)
  if (!returnObj) return undefined

  const api: Record<string, ApiMemberInfo> = {}

  for (const prop of returnObj.properties) {
    if (ts.isSpreadAssignment(prop)) {
      if (isEventsSpread(prop, checker)) {
        Object.assign(api, extractSpreadMembers(prop, checker))
      }
      continue
    }

    if (ts.isShorthandPropertyAssignment(prop)) {
      const symbol = checker.getShorthandAssignmentValueSymbol(prop)
      if (!symbol) continue

      const decl = symbol.getDeclarations()?.[0]
      if (!decl) continue

      const description = resolveDescriptionChain(symbol, checker)

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

function unwrapExpr(expr: ts.Expression): ts.Expression {
  while (
    ts.isAsExpression(expr) ||
    ts.isSatisfiesExpression(expr) ||
    ts.isParenthesizedExpression(expr) ||
    ts.isTypeAssertionExpression(expr)
  ) {
    expr = expr.expression
  }
  return expr
}

function objectLiteralFromReturn(
  body: ts.ConciseBody | undefined
): ts.ObjectLiteralExpression | undefined {
  if (!body) return undefined

  if (ts.isObjectLiteralExpression(body)) return body

  if (ts.isParenthesizedExpression(body)) {
    const inner = unwrapExpr(body.expression)
    if (ts.isObjectLiteralExpression(inner)) return inner
  }

  if (!ts.isBlock(body)) return undefined

  for (let i = body.statements.length - 1; i >= 0; i--) {
    const stmt = body.statements[i]
    if (!ts.isReturnStatement(stmt) || !stmt.expression) continue
    const expr = unwrapExpr(stmt.expression)
    if (ts.isObjectLiteralExpression(expr)) return expr
    return undefined
  }

  return undefined
}

function findNamedFunctionReturn(
  sourceFile: ts.SourceFile,
  name: string
): ts.ObjectLiteralExpression | undefined {
  let result: ts.ObjectLiteralExpression | undefined

  function visit(node: ts.Node) {
    if (result) return

    if (ts.isFunctionDeclaration(node) && node.name?.text === name) {
      result = objectLiteralFromReturn(node.body)
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return result
}

function findApiReturnObject(
  sourceFile: ts.SourceFile
): ts.ObjectLiteralExpression | undefined {
  return (
    findDefineComponentReturn(sourceFile) ??
    findNamedFunctionReturn(sourceFile, 'setup') ??
    findNamedFunctionReturn(sourceFile, 'blueprint')
  )
}

function findDefineComponentReturn(
  sourceFile: ts.SourceFile
): ts.ObjectLiteralExpression | undefined {
  let result: ts.ObjectLiteralExpression | undefined

  function visit(node: ts.Node) {
    if (result) return

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'defineComponent'
    ) {
      const fn = node.arguments[0]
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

// ========== BLUEPRINT DESC ============

function extractBlueprintDescription(sourceFile: ts.SourceFile): {
  description: string
  loc?: string
} {
  let description = ''
  let statementLoc: string | undefined

  ts.forEachChild(sourceFile, (node) => {
    if (statementLoc) return

    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length === 1
    ) {
      const decl = node.declarationList.declarations[0]
      if (ts.isIdentifier(decl.name) && decl.name.text === 'useBlueprint') {
        description = getNodeJSDocDescription(node)
        statementLoc = loc(node)
      }
    }
  })

  return { description, loc: statementLoc }
}

// ============= EXTRACTION =============

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * kebab-case blueprint file name → PascalCase type prefix (`auto-complete` →
 * `AutoComplete`).
 */
function pascalize(s: string): string {
  return s.split('-').map(capitalize).join('')
}

function findInterface(
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
 * Finds a Props or Emits interface either locally in the source file
 * (`pascalize(name) + suffix`) or, when a blueprint imports its type from a
 * separate file instead of declaring it, by searching the imported type symbols
 * for one ending with the given suffix.
 */
function findInterfaceOrImported(
  sourceFile: ts.SourceFile,
  localName: string,
  suffix: 'Props' | 'Emits',
  _program: ts.Program,
  checker: ts.TypeChecker
): ts.InterfaceDeclaration | undefined {
  const local = findInterface(sourceFile, localName)
  if (local) return local

  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt) || !stmt.importClause) continue
    const bindings = stmt.importClause.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue

    for (const spec of bindings.elements) {
      const importedName = (spec.propertyName ?? spec.name).text
      if (!importedName.endsWith(suffix)) continue

      let sym = checker.getSymbolAtLocation(spec.name)
      if (!sym) continue
      if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym)

      const decls = sym.getDeclarations()
      if (!decls) continue

      for (const d of decls) {
        if (ts.isInterfaceDeclaration(d)) return d
      }
    }
  }

  return undefined
}

function findLocalTypeAlias(
  sourceFile: ts.SourceFile,
  name: string
): ts.TypeAliasDeclaration | undefined {
  let found: ts.TypeAliasDeclaration | undefined
  ts.forEachChild(sourceFile, (node) => {
    if (!found && ts.isTypeAliasDeclaration(node) && node.name.text === name) {
      found = node
    }
  })
  return found
}

function extractBlueprints(
  pkgDir: string,
  blueprintsDir: string
): Record<string, BlueprintEntry> {
  const { program, checker } = createProgram(pkgDir)

  const files = fs
    .readdirSync(blueprintsDir)
    .filter((f) => f.endsWith('.ts') && !SKIP_FILES.has(f))
    .sort()

  const output: Record<string, BlueprintEntry> = {}

  for (const file of files) {
    const filePath = path.join(blueprintsDir, file)
    const sourceFile = program.getSourceFile(filePath)

    if (!sourceFile) continue

    const blueprintName = path.basename(file, '.ts')
    const propsName = `${pascalize(blueprintName)}Props`
    const eventsName = `${pascalize(blueprintName)}Emits`

    const propsDecl = findInterfaceOrImported(
      sourceFile,
      propsName,
      'Props',
      program,
      checker
    )
    const eventsDecl = findInterfaceOrImported(
      sourceFile,
      eventsName,
      'Emits',
      program,
      checker
    )
    const defaults = extractDefaults(sourceFile)

    let props = propsDecl ? extractProps(checker, propsDecl, defaults) : {}

    // A generic props interface with conditional heritage (OptionsModelProp
    // and friends) may not expand uninstantiated — when the file provides the
    // widest instantiation as a `Loose<Name>Props` alias and it yields more
    // props, prefer it.
    const looseDecl = findLocalTypeAlias(sourceFile, `Loose${propsName}`)
    if (looseDecl) {
      const looseProps = extractProps(checker, looseDecl, defaults)
      if (Object.keys(looseProps).length > Object.keys(props).length) {
        props = looseProps
      }
    }
    const events = eventsDecl ? extractEvents(checker, eventsDecl) : {}

    if (!Object.keys(props).length && !Object.keys(events).length) continue

    const { description, loc: blueprintLoc } =
      extractBlueprintDescription(sourceFile)
    // Entries historically carry no description key — description and its
    // loc are emitted only when a blueprint actually documents itself.
    const entry: BlueprintEntry = {
      ...(description && blueprintLoc
        ? { description, loc: blueprintLoc }
        : {}),
      props,
      events,
    }

    const features = extractFeatures(sourceFile)
    if (features) entry.features = features

    const api = extractApi(checker, sourceFile)
    if (api) entry.api = api

    output[blueprintName] = entry
  }

  return output
}

// ============= DEEP MERGE =============

/**
 * Applies adapter type overrides (e.g. `{ text: 'input-text' }`) to a copy of
 * the core blueprints: renames keys that the adapter replaces with
 * differently-named blueprints.
 */
function applyTypeRenames(
  core: Record<string, BlueprintEntry>,
  renames: Record<string, string>
): Record<string, BlueprintEntry> {
  const result: Record<string, BlueprintEntry> = {}

  for (const [name, entry] of Object.entries(core)) {
    const newName = renames[name] ?? name
    result[newName] = JSON.parse(JSON.stringify(entry))
  }

  return result
}

function deepMergeBlueprints(
  base: Record<string, BlueprintEntry>,
  adapter: Record<string, BlueprintEntry>
): Record<string, BlueprintEntry> {
  const result: Record<string, BlueprintEntry> = JSON.parse(
    JSON.stringify(base)
  )

  for (const [name, adapterEntry] of Object.entries(adapter)) {
    if (!result[name]) {
      result[name] = adapterEntry
      continue
    }

    const baseEntry = result[name]

    for (const [propName, propInfo] of Object.entries(adapterEntry.props)) {
      baseEntry.props[propName] = propInfo
    }

    for (const [eventName, eventInfo] of Object.entries(adapterEntry.events)) {
      baseEntry.events[eventName] = eventInfo
    }

    if (adapterEntry.features) {
      if (baseEntry.features) {
        const merged = [...baseEntry.features]
        for (const f of adapterEntry.features) {
          if (!merged.includes(f)) merged.push(f)
        }
        baseEntry.features = merged
      } else {
        baseEntry.features = adapterEntry.features
      }
    }

    if (adapterEntry.api) {
      baseEntry.api = adapterEntry.api
    }
  }

  return result
}

// =========== ADAPTER CONFIG ============

function loadAdapterOverrides(adapterName: string): {
  types: Record<string, string>
} {
  return { types: adapters[adapterName]?.typeOverrides ?? {} }
}

// ================ MAIN ================

function main() {
  const coreBlueprintsDir = path.join(CORE_DIR, 'src/blueprints')
  const coreBlueprints = extractBlueprints(CORE_DIR, coreBlueprintsDir)

  if (scope.core) {
    const coreOutputDir = path.join(GENERATED_DIR, '_ui')
    fs.mkdirSync(coreOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(coreOutputDir, 'blueprints.json'),
      JSON.stringify(coreBlueprints, null, 2) + '\n'
    )
  }

  const coreCount = Object.keys(coreBlueprints).length
  const coreProps = Object.values(coreBlueprints).reduce(
    (sum, e) => sum + Object.keys(e.props).length,
    0
  )
  const coreEvents = Object.values(coreBlueprints).reduce(
    (sum, e) => sum + Object.keys(e.events).length,
    0
  )
  console.log(
    `ui/blueprints: ${coreCount} extracted, ${coreProps} props, ${coreEvents} events`
  )

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterBlueprintsDir = path.join(adapterDir, 'src/blueprints')

    const overrides = loadAdapterOverrides(adapterName)
    const renamedCore = applyTypeRenames(coreBlueprints, overrides.types)

    let merged: Record<string, BlueprintEntry>

    if (fs.existsSync(adapterBlueprintsDir)) {
      const adapterBlueprints = extractBlueprints(
        adapterDir,
        adapterBlueprintsDir
      )
      merged = deepMergeBlueprints(renamedCore, adapterBlueprints)
    } else {
      merged = renamedCore
    }

    const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterOutputDir, 'blueprints.json'),
      JSON.stringify(merged, null, 2) + '\n'
    )

    const count = Object.keys(merged).length
    const totalProps = Object.values(merged).reduce(
      (sum, e) => sum + Object.keys(e.props).length,
      0
    )
    const totalEvents = Object.values(merged).reduce(
      (sum, e) => sum + Object.keys(e.events).length,
      0
    )
    console.log(
      `${adapterName}/blueprints: ${count} extracted, ${totalProps} props, ${totalEvents} events`
    )
  }

  // Remove old root-level blueprints.json if it exists
  const oldFile = path.join(GENERATED_DIR, 'blueprints.json')
  if (fs.existsSync(oldFile)) {
    fs.rmSync(oldFile)
    console.log('Removed old blueprints.json')
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

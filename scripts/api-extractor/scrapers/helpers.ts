import * as fs from 'node:fs'
import * as path from 'node:path'

import * as ts from 'typescript'

import { corePackage, nonCoreAdapters } from '../lib/adapters.js'
import { createProgram, importedCalleeName } from '../lib/extract.js'
import { generatedDir, monorepoRoot } from '../lib/paths.js'
import { parseScope } from '../lib/scope.js'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)

const SKIP_FILES = new Set(['types.ts', 'index.ts'])

// =============== TYPES ================

interface ParamInfo {
  type: string | Record<string, any>
  description: string
  required?: true
  rest?: true
  default?: unknown
}

interface OverloadInfo {
  description: string
  params: Record<string, ParamInfo>
  returns: { type: string }
}

interface HelperEntry {
  type: 'function'
  description: string
  category?: string
  private?: true
  params?: Record<string, ParamInfo>
  returns?: any
  overloads?: any[]
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

  if (ts.isFunctionDeclaration(node) && node.name && node.parent) {
    const name = node.name.text
    const siblings = ts.isSourceFile(node.parent)
      ? node.parent.statements
      : ts.isBlock(node.parent)
        ? node.parent.statements
        : undefined

    if (siblings) {
      for (const sibling of siblings) {
        if (
          ts.isFunctionDeclaration(sibling) &&
          sibling.name?.text === name &&
          sibling !== node
        ) {
          for (const entry of ts.getJSDocCommentsAndTags(sibling)) {
            if (ts.isJSDoc(entry) && entry.comment) {
              const text =
                typeof entry.comment === 'string'
                  ? entry.comment
                  : entry.comment.map((c) => c.text || '').join('')
              const line = singleLine(text)
              if (line) return line
            }
          }
        }
      }
    }
  }

  return ''
}

function hasJSDocTag(node: ts.Node, tagName: string): boolean {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(entry) || !entry.tags) continue

    for (const tag of entry.tags) {
      if (tag.tagName.text === tagName) return true
    }
  }

  return false
}

/**
 * True when any same-named top-level function declaration (overload signature
 * or implementation) carries the tag — an overloaded function's docblock
 * usually sits on its signatures, not the implementation the scraper visits.
 */
function fnDeclarationsHaveTag(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  tagName: string
): boolean {
  const name = node.name?.text
  if (!name) return hasJSDocTag(node, tagName)
  let found = false
  ts.forEachChild(sourceFile, (n) => {
    if (found) return
    if (
      ts.isFunctionDeclaration(n) &&
      n.name?.text === name &&
      hasJSDocTag(n, tagName)
    ) {
      found = true
    }
  })
  return found
}

function getJSDocCategoryFromNode(node: ts.Node): string | undefined {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(entry) || !entry.tags) continue

    for (const tag of entry.tags) {
      if (tag.tagName.text !== 'category') continue

      const comment =
        typeof tag.comment === 'string'
          ? tag.comment
          : (tag.comment?.map((c) => c.text || '').join('') ?? '')

      const value = comment.trim()
      if (value) return value
    }
  }

  return undefined
}

function getJSDocCategory(node: ts.FunctionDeclaration): string | undefined {
  const direct = getJSDocCategoryFromNode(node)
  if (direct) return direct

  if (!node.name || !node.parent) return undefined

  const name = node.name.text
  const siblings = ts.isSourceFile(node.parent)
    ? node.parent.statements
    : ts.isBlock(node.parent)
      ? node.parent.statements
      : undefined

  if (!siblings) return undefined

  for (const sibling of siblings) {
    if (
      ts.isFunctionDeclaration(sibling) &&
      sibling.name?.text === name &&
      sibling !== node
    ) {
      const cat = getJSDocCategoryFromNode(sibling)
      if (cat) return cat
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

function resolveGenericParamType(
  param: ts.ParameterDeclaration,
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): string {
  if (!param.type) {
    const paramType = checker.getTypeAtLocation(param)
    return checker.typeToString(paramType, param, TYPE_FORMAT_FLAGS)
  }

  const typeText = param.type
    .getText(param.getSourceFile())
    .replace(/\s+/g, ' ')
    .trim()

  if (ts.isTypeReferenceNode(param.type) && !param.type.typeArguments) {
    const sym = checker.getSymbolAtLocation(param.type.typeName)
    const tpDecl = sym?.declarations?.find(ts.isTypeParameterDeclaration) as
      | ts.TypeParameterDeclaration
      | undefined

    if (tpDecl && funcDecl.typeParameters?.includes(tpDecl)) {
      if (tpDecl.constraint) {
        const constraintText = tpDecl.constraint
          .getText(tpDecl.getSourceFile())
          .replace(/\s+/g, ' ')
          .trim()
        if (!ts.isTypeLiteralNode(tpDecl.constraint)) {
          return constraintText
        }
      }
      return typeText
    }
  }

  if (
    ts.isTypeReferenceNode(param.type) &&
    param.type.typeName.getText(param.getSourceFile()) === 'Readonly'
  ) {
    const inner = param.type.typeArguments?.[0]
    if (inner && ts.isTypeReferenceNode(inner) && !inner.typeArguments) {
      const sym = checker.getSymbolAtLocation(inner.typeName)
      const tpDecl = sym?.declarations?.find(ts.isTypeParameterDeclaration) as
        | ts.TypeParameterDeclaration
        | undefined
      if (tpDecl && funcDecl.typeParameters?.includes(tpDecl)) {
        return `Readonly<${inner.getText(param.getSourceFile())}>`
      }
    }
  }

  return typeText
}

function resolveRestElementType(
  typeText: string,
  funcDecl: ts.FunctionDeclaration,
  _checker: ts.TypeChecker
): string {
  const stripped = typeText
    .replace(/^\[\.\.\./, '')
    .replace(/\]$/, '')
    .trim()

  for (const tp of funcDecl.typeParameters ?? []) {
    if (tp.name.text === stripped && tp.constraint) {
      const constraintText = tp.constraint
        .getText(tp.getSourceFile())
        .replace(/\s+/g, ' ')
        .trim()
      const arrayElementMatch =
        constraintText.match(/^\((.+)\)\[\]$/) ||
        constraintText.match(/^(.+)\[\]$/)
      if (arrayElementMatch) {
        return arrayElementMatch[1]
      }
      if (ts.isArrayTypeNode(tp.constraint)) {
        return tp.constraint.elementType
          .getText(tp.getSourceFile())
          .replace(/\s+/g, ' ')
          .trim()
      }
    }
  }

  return stripped
}

function getFunctionReturnTypeFromSig(
  sig: ts.Signature,
  checker: ts.TypeChecker
): string {
  let returnType = checker.getReturnTypeOfSignature(sig)

  if (returnType.isTypeParameter()) {
    returnType =
      returnType.getDefault() ?? returnType.getConstraint() ?? returnType
  }

  return checker.typeToString(returnType, undefined, TYPE_FORMAT_FLAGS)
}

// ======= PARAM TYPE EXPANSION ========

function isNonExportedObjectType(
  paramDecl: ts.ParameterDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): boolean {
  if (!paramDecl.type) return false

  const typeNode = paramDecl.type
  if (!ts.isTypeReferenceNode(typeNode)) return false

  const sym = checker.getSymbolAtLocation(typeNode.typeName)
  if (!sym || !sym.declarations?.length) return false

  const decl = sym.declarations[0]

  if (!ts.isTypeAliasDeclaration(decl) && !ts.isInterfaceDeclaration(decl))
    return false
  if (!decl.getSourceFile().fileName.includes(sourceFile.fileName)) return false

  const isExported = !!(
    ts.getCombinedModifierFlags(decl) & ts.ModifierFlags.Export
  )
  if (isExported) return false

  const resolvedType = checker.getDeclaredTypeOfSymbol(sym)

  if (resolvedType.isUnion() || resolvedType.isIntersection()) return false
  if (
    resolvedType.flags & ts.TypeFlags.StringLike ||
    resolvedType.flags & ts.TypeFlags.NumberLike
  )
    return false

  return resolvedType.getProperties().length > 0
}

function expandObjectType(
  type: ts.Type,
  checker: ts.TypeChecker,
  _typeDecl: ts.Node
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const propSym of type.getProperties()) {
    const propDecl = propSym.getDeclarations()?.[0]
    if (!propDecl) continue

    const description = getSymbolDescription(propSym, checker)
    const propType = checker.getTypeOfSymbolAtLocation(propSym, propDecl)
    const sigs = propType.getNonNullableType().getCallSignatures()

    if (sigs.length > 1) {
      const overloads = extractCallSignatureOverloads(sigs, propDecl, checker)
      const entry: any = { type: 'function', description }
      if (overloads.length) entry.overloads = overloads

      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken) {
        entry.required = true
      }

      result[propSym.name] = entry
    } else if (sigs.length === 1 && isFunctionLikeType(propType)) {
      const entry: any = { type: 'function', description }

      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken) {
        entry.required = true
      }

      const params = extractSigParams(sigs[0], propDecl, checker)
      if (params && Object.keys(params).length) entry.params = params
      const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
      if (ret) entry.returns = { type: ret }

      result[propSym.name] = entry
    } else {
      const typeText = getPropertyTypeText(propSym, propDecl, checker)
      const entry: any = { type: typeText, description }

      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken) {
        entry.required = true
      }

      result[propSym.name] = entry
    }
  }

  return result
}

function extractCallSignatureOverloads(
  sigs: readonly ts.Signature[],
  contextNode: ts.Node,
  checker: ts.TypeChecker
): OverloadInfo[] {
  const overloads: OverloadInfo[] = []

  for (const sig of sigs) {
    const sigDecl = sig.getDeclaration()
    const description = getNodeJSDocDescription(sigDecl)
    const jsdoc = getJSDocParamDescriptions(sigDecl)
    const params: Record<string, ParamInfo> = {}

    for (const param of sig.getParameters()) {
      const paramType = checker.getTypeOfSymbolAtLocation(param, contextNode)
      params[param.name] = {
        type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
        description: jsdoc.get(param.name) ?? '',
      }
    }

    const ret = getFunctionReturnTypeFromSig(sig, checker)

    overloads.push({
      description,
      params,
      returns: { type: ret },
    })
  }

  return overloads
}

function extractSigParams(
  sig: ts.Signature,
  contextNode: ts.Node,
  checker: ts.TypeChecker
): Record<string, ParamInfo> | undefined {
  const jsdoc = getJSDocParamDescriptions(sig.getDeclaration())
  const params: Record<string, ParamInfo> = {}

  for (const param of sig.getParameters()) {
    const paramType = checker.getTypeOfSymbolAtLocation(param, contextNode)
    params[param.name] = {
      type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
      description: jsdoc.get(param.name) ?? '',
    }
  }

  return Object.keys(params).length ? params : undefined
}

function getPropertyTypeText(
  propSym: ts.Symbol,
  decl: ts.Declaration,
  checker: ts.TypeChecker
): string {
  if (ts.isPropertySignature(decl) && decl.type) {
    return decl.type.getText(decl.getSourceFile()).replace(/\s+/g, ' ').trim()
  }

  const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
  return checker.typeToString(resolved, decl, TYPE_FORMAT_FLAGS)
}

// ======== RETURN TYPE ANALYSIS ========

function findReturnStatement(
  funcDecl: ts.FunctionDeclaration
): ts.ReturnStatement | undefined {
  if (!funcDecl.body) return undefined

  for (let i = funcDecl.body.statements.length - 1; i >= 0; i--) {
    const stmt = funcDecl.body.statements[i]
    if (ts.isReturnStatement(stmt)) return stmt
  }

  return undefined
}

function isSingleReturnCall(
  funcDecl: ts.FunctionDeclaration
): { callee: string; node: ts.Identifier } | undefined {
  const ret = findReturnStatement(funcDecl)
  if (!ret?.expression) return undefined

  if (
    ts.isCallExpression(ret.expression) &&
    ts.isIdentifier(ret.expression.expression)
  ) {
    const bodyStatements = funcDecl.body!.statements
    const nonReturn = bodyStatements.filter((s) => !ts.isReturnStatement(s))

    const hasOnlySimpleStatements = nonReturn.every(
      (s) =>
        ts.isVariableStatement(s) ||
        ts.isIfStatement(s) ||
        ts.isExpressionStatement(s) ||
        ts.isThrowStatement(s)
    )

    if (hasOnlySimpleStatements) {
      return {
        callee: ret.expression.expression.text,
        node: ret.expression.expression,
      }
    }
  }

  return undefined
}

function getReturnObjectLiteral(
  funcDecl: ts.FunctionDeclaration
): ts.ObjectLiteralExpression | undefined {
  const ret = findReturnStatement(funcDecl)
  if (!ret?.expression) return undefined

  if (ts.isObjectLiteralExpression(ret.expression)) {
    return ret.expression
  }

  if (
    ts.isCallExpression(ret.expression) &&
    ts.isIdentifier(ret.expression.expression) &&
    ret.expression.expression.text === 'proxyRefs' &&
    ret.expression.arguments[0] &&
    ts.isObjectLiteralExpression(ret.expression.arguments[0])
  ) {
    return ret.expression.arguments[0] as ts.ObjectLiteralExpression
  }

  return undefined
}

function extractReturnMembers(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  isProxyRefs: boolean
): Record<string, any> | undefined {
  const obj = getReturnObjectLiteral(funcDecl)
  if (!obj) return undefined

  const result: Record<string, any> = {}

  for (const prop of obj.properties) {
    if (ts.isSpreadAssignment(prop)) continue

    const propName = ts.isIdentifier((prop as any).name)
      ? (prop as any).name.text
      : ts.isStringLiteral((prop as any).name)
        ? (prop as any).name.text
        : null

    if (!propName) continue

    if (ts.isShorthandPropertyAssignment(prop)) {
      const symbol = checker.getShorthandAssignmentValueSymbol(prop)
      if (!symbol) continue

      const localDecl = symbol.getDeclarations()?.[0]
      if (!localDecl) continue

      const description = getSymbolDescription(symbol, checker)
      const memberType = checker.getTypeOfSymbolAtLocation(symbol, localDecl)
      const isFunc = isFunctionLikeType(memberType)

      let typeStr: string
      if (isFunc) {
        typeStr = 'function'
      } else if (isProxyRefs) {
        typeStr = unwrapRefType(
          checker.typeToString(memberType, localDecl, TYPE_FORMAT_FLAGS)
        )
      } else {
        typeStr = checker.typeToString(memberType, localDecl, TYPE_FORMAT_FLAGS)
      }

      const entry: any = { type: typeStr, description }

      if (hasJSDocTag(localDecl, 'private')) {
        entry.private = true
      }

      if (isFunc) {
        const sigs = memberType.getNonNullableType().getCallSignatures()
        if (sigs.length > 0) {
          const jsdoc = getJSDocParamDescriptions(localDecl)
          const params: Record<string, ParamInfo> = {}

          for (const sp of sigs[0].getParameters()) {
            const spDecl = sp.getDeclarations()?.[0]
            const pt = checker.getTypeOfSymbolAtLocation(sp, localDecl)

            const paramEntry: ParamInfo = {
              type: checker.typeToString(pt, undefined, TYPE_FORMAT_FLAGS),
              description: jsdoc.get(sp.name) ?? '',
            }

            if (spDecl && ts.isParameter(spDecl) && spDecl.initializer) {
              const defVal = evalSimpleDefault(spDecl.initializer)
              if (defVal !== undefined) paramEntry.default = defVal
            }

            params[sp.name] = paramEntry
          }

          if (Object.keys(params).length) entry.params = params
          const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
          if (ret) entry.returns = { type: ret }
        }
      }

      result[propName] = entry
    } else if (ts.isPropertyAssignment(prop)) {
      const description = getNodeJSDocDescription(prop)
      const exprType = checker.getTypeAtLocation(prop.initializer)
      const isFunc = isFunctionLikeType(exprType)

      let typeStr: string
      if (isFunc) {
        typeStr = 'function'
      } else if (isProxyRefs) {
        typeStr = unwrapRefType(
          checker.typeToString(exprType, prop, TYPE_FORMAT_FLAGS)
        )
      } else {
        typeStr = checker.typeToString(exprType, prop, TYPE_FORMAT_FLAGS)
      }

      const entry: any = { type: typeStr, description }

      if (hasJSDocTag(prop, 'private')) {
        entry.private = true
      }

      if (isFunc) {
        const jsdoc = getJSDocParamDescriptions(prop)
        const sigs = exprType.getNonNullableType().getCallSignatures()
        if (sigs.length > 0) {
          const params: Record<string, ParamInfo> = {}
          for (const sp of sigs[0].getParameters()) {
            const pt = checker.getTypeOfSymbolAtLocation(sp, prop)
            params[sp.name] = {
              type: checker.typeToString(pt, undefined, TYPE_FORMAT_FLAGS),
              description: jsdoc.get(sp.name) ?? '',
            }
          }
          if (Object.keys(params).length) entry.params = params
          const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
          if (ret) entry.returns = { type: ret }
        }
      }

      result[propName] = entry
    }
  }

  return Object.keys(result).length ? result : undefined
}

function unwrapRefType(typeStr: string): string {
  const refMatch = typeStr.match(/^Ref<(.+?)(?:,\s*.+)?>$/)
  if (refMatch) return refMatch[1]

  const computedMatch = typeStr.match(/^ComputedRef<(.+)>$/)
  if (computedMatch) return computedMatch[1]

  return typeStr
}

function evalSimpleDefault(expr: ts.Expression): unknown | undefined {
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false
  if (expr.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isNumericLiteral(expr)) return Number(expr.text)
  if (ts.isStringLiteral(expr)) return expr.text
  return undefined
}

// ==== FUNCTION-LEVEL OVERLOADS ====

function detectConditionalRestOverloads(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  _sourceFile: ts.SourceFile
): any[] | undefined {
  if (!funcDecl.parameters.length) return undefined

  const lastParam = funcDecl.parameters[funcDecl.parameters.length - 1]
  if (!lastParam.dotDotDotToken) return undefined
  if (!lastParam.type || !ts.isTypeReferenceNode(lastParam.type))
    return undefined

  const typeSym = checker.getSymbolAtLocation(lastParam.type.typeName)
  if (!typeSym?.declarations?.length) return undefined

  const typeDecl = typeSym.declarations[0]
  if (!ts.isTypeAliasDeclaration(typeDecl)) return undefined

  if (!ts.isConditionalTypeNode(typeDecl.type)) return undefined

  const condType = typeDecl.type
  const branches: ts.TupleTypeNode[] = []

  function collectBranches(node: ts.TypeNode) {
    if (ts.isConditionalTypeNode(node)) {
      collectBranches(node.trueType)
      collectBranches(node.falseType)
    } else if (ts.isTupleTypeNode(node)) {
      branches.push(node)
    }
  }

  collectBranches(condType)

  if (branches.length < 2) return undefined

  const overloads: any[] = []

  for (const branch of branches) {
    const branchDesc = ''
    const params: Record<string, ParamInfo> = {}

    for (const elem of branch.elements) {
      if (ts.isNamedTupleMember(elem)) {
        const elemName = elem.name.text
        const elemTypeNode = elem.type

        if (ts.isTypeReferenceNode(elemTypeNode)) {
          const elemTypeSym = checker.getSymbolAtLocation(elemTypeNode.typeName)
          if (elemTypeSym) {
            const elemType = checker.getDeclaredTypeOfSymbol(elemTypeSym)
            const isNonExported = !(
              ts.getCombinedModifierFlags(
                elemTypeSym.declarations![0] as ts.Declaration
              ) & ts.ModifierFlags.Export
            )

            if (isNonExported && elemType.getProperties().length > 0) {
              const expanded = expandObjectType(
                elemType,
                checker,
                elemTypeSym.declarations![0]
              )
              const paramDesc = getSymbolDescription(elemTypeSym, checker)
              params[elemName] = {
                type: expanded,
                description: paramDesc,
                required: true,
              }
              continue
            }
          }
        }

        const typeText = elemTypeNode
          .getText(typeDecl.getSourceFile())
          .replace(/\s+/g, ' ')
          .trim()
        const isOptional = !!elem.questionToken
        const entry: ParamInfo = {
          type: typeText,
          description: '',
        }
        if (!isOptional) entry.required = true
        params[elemName] = entry
      }
    }

    overloads.push({ description: branchDesc, params })
  }

  return overloads.length >= 2 ? overloads : undefined
}

function extractReturnFunctionType(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): any | undefined {
  const ret = findReturnStatement(funcDecl)
  if (!ret?.expression) return undefined

  if (ts.isIdentifier(ret.expression)) {
    const sym = checker.getSymbolAtLocation(ret.expression)
    if (!sym) return undefined

    const decl = sym.getDeclarations()?.[0]
    if (!decl) return undefined

    const retType = checker.getTypeOfSymbolAtLocation(sym, decl)
    if (!isFunctionLikeType(retType)) return undefined

    const sigs = retType.getNonNullableType().getCallSignatures()

    if (hasTsOverloads(decl)) {
      const overloads = extractTsOverloads(decl, checker)
      if (overloads.length) {
        return { type: 'function', overloads }
      }
    }

    if (sigs.length > 1) {
      const overloads = extractCallSignatureOverloads(sigs, decl, checker)
      if (overloads.length) {
        return { type: 'function', overloads }
      }
    }

    if (sigs.length === 1) {
      const result: any = { type: 'function' }
      const params = extractSigParams(sigs[0], decl, checker)
      if (params && Object.keys(params).length) result.params = params
      const retStr = getFunctionReturnTypeFromSig(sigs[0], checker)
      if (retStr) result.returns = { type: retStr }
      return result
    }
  }

  return undefined
}

function hasTsOverloads(node: ts.Node): boolean {
  if (!ts.isFunctionDeclaration(node)) return false
  const parent = node.parent
  if (!ts.isBlock(parent) && !ts.isSourceFile(parent)) return false

  const name = node.name?.text
  if (!name) return false

  let overloadCount = 0
  for (const sibling of (parent as ts.Block | ts.SourceFile).statements) {
    if (ts.isFunctionDeclaration(sibling) && sibling.name?.text === name) {
      overloadCount++
    }
  }

  return overloadCount > 1
}

function extractTsOverloads(
  node: ts.Node,
  checker: ts.TypeChecker
): OverloadInfo[] {
  if (!ts.isFunctionDeclaration(node)) return []

  const name = node.name?.text
  if (!name) return []

  const parent = node.parent
  if (!ts.isBlock(parent) && !ts.isSourceFile(parent)) return []

  const overloads: OverloadInfo[] = []

  for (const sibling of (parent as ts.Block | ts.SourceFile).statements) {
    if (!ts.isFunctionDeclaration(sibling) || sibling.name?.text !== name)
      continue
    if (sibling.body) continue

    const description = getNodeJSDocDescription(sibling)
    const jsdoc = getJSDocParamDescriptions(sibling)
    const sig = checker.getSignatureFromDeclaration(sibling)
    if (!sig) continue

    const params: Record<string, ParamInfo> = {}
    for (const p of sig.getParameters()) {
      const pType = checker.getTypeOfSymbolAtLocation(p, sibling)
      params[p.name] = {
        type: checker.typeToString(pType, undefined, TYPE_FORMAT_FLAGS),
        description: jsdoc.get(p.name) ?? '',
      }
    }

    overloads.push({
      description,
      params,
      returns: { type: getFunctionReturnTypeFromSig(sig, checker) },
    })
  }

  return overloads
}

// =============== RESOLVE RETURNS ================

function resolveReturns(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  _sourceFile: ts.SourceFile
): any | undefined {
  const sig = checker.getSignatureFromDeclaration(funcDecl)
  if (!sig) return undefined

  const returnType = checker.getReturnTypeOfSignature(sig)
  const returnTypeStr = checker.typeToString(
    returnType,
    funcDecl,
    TYPE_FORMAT_FLAGS
  )

  if (returnTypeStr === 'void') {
    return { type: 'void' }
  }

  const singleCall = isSingleReturnCall(funcDecl)
  if (singleCall) {
    // Reference the callee's own entry only when it is a separately scraped
    // composable/factory (imported from another module). A local closure that
    // happens to match the naming — createRule's `make` — has no entry a
    // reference could point at, so it falls through to ordinary resolution.
    const callee = importedCalleeName(singleCall.node, checker)
    if (callee && /^use[A-Z]\w*Context$/.test(callee)) {
      const contextName = callee.replace(/^use/, '').replace(/Context$/, '')
      const lower = contextName.charAt(0).toLowerCase() + contextName.slice(1)
      return { from: `contexts.${lower}` }
    }
    if (callee && /^use[A-Z]/.test(callee)) {
      return { from: `composables.${callee}` }
    }
    if (callee && /^make[A-Z]/.test(callee)) {
      return { from: `features.${callee}` }
    }
  }

  const retStmt = findReturnStatement(funcDecl)
  const isProxyRefs =
    retStmt?.expression &&
    ts.isCallExpression(retStmt.expression) &&
    ts.isIdentifier(retStmt.expression.expression) &&
    retStmt.expression.expression.text === 'proxyRefs'

  const objLiteral = getReturnObjectLiteral(funcDecl)
  if (objLiteral) {
    const members = extractReturnMembers(funcDecl, checker, !!isProxyRefs)
    if (members) {
      return { type: members }
    }
  }

  const funcReturn = extractReturnFunctionType(funcDecl, checker)
  if (funcReturn) {
    return funcReturn
  }

  if (funcDecl.type) {
    const typeText = funcDecl.type
      .getText(funcDecl.getSourceFile())
      .replace(/\s+/g, ' ')
      .trim()
    return { type: typeText }
  }

  if (retStmt?.expression && ts.isAsExpression(retStmt.expression)) {
    const asTypeText = retStmt.expression.type
      .getText(retStmt.getSourceFile())
      .replace(/\s+/g, ' ')
      .trim()
    return { type: asTypeText }
  }

  return { type: returnTypeStr }
}

// ================ SCANNING ================

function scanHelpers(
  helpersDir: string,
  program: ts.Program,
  checker: ts.TypeChecker
): Record<string, HelperEntry> {
  const output: Record<string, HelperEntry> = {}

  if (!fs.existsSync(helpersDir)) return output

  const files = fs
    .readdirSync(helpersDir)
    .filter((f) => f.endsWith('.ts') && !SKIP_FILES.has(f))
    .sort()

  for (const file of files) {
    const filePath = path.join(helpersDir, file)
    const sourceFile = program.getSourceFile(filePath)

    if (!sourceFile) {
      throw new Error(`File not found in program: ${file}`)
    }

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isFunctionDeclaration(node) || !node.name) return
      if (!node.body) return

      const modifiers = ts.getCombinedModifierFlags(node)
      if (!(modifiers & ts.ModifierFlags.Export)) return

      const funcName = node.name.text

      if (output[funcName]) return

      const description = getNodeJSDocDescription(node)
      const jsdoc = getJSDocParamDescriptions(node)
      const category = getJSDocCategory(node)
      const isPrivate = fnDeclarationsHaveTag(node, sourceFile, 'private')

      const entry: HelperEntry = { type: 'function', description }

      if (category) {
        entry.category = category
      }

      if (isPrivate) {
        entry.private = true
      }

      // Detect TS overloads
      if (hasTsOverloads(node)) {
        const overloads = extractTsOverloads(node, checker)
        if (overloads.length) {
          entry.overloads = overloads

          const returns = resolveReturns(node, checker, sourceFile)
          if (returns) entry.returns = returns

          output[funcName] = entry
          return
        }
      }

      // Detect conditional rest overloads
      const condOverloads = detectConditionalRestOverloads(
        node,
        checker,
        sourceFile
      )
      if (condOverloads) {
        entry.overloads = condOverloads

        const returns = resolveReturns(node, checker, sourceFile)
        if (returns) entry.returns = returns

        output[funcName] = entry
        return
      }

      // Extract params
      const params: Record<string, ParamInfo> = {}
      for (const param of node.parameters) {
        if (
          !ts.isIdentifier(param.name) &&
          !ts.isObjectBindingPattern(param.name)
        )
          continue

        const paramName = ts.isIdentifier(param.name)
          ? param.name.text.replace(/^_/, '')
          : 'options'

        const paramDesc =
          jsdoc.get(paramName) ||
          jsdoc.get(ts.isIdentifier(param.name) ? param.name.text : '') ||
          ''
        const isRest = !!param.dotDotDotToken
        const isOptional = !!param.questionToken || !!param.initializer

        if (isNonExportedObjectType(param, checker, sourceFile)) {
          const paramType = checker.getTypeAtLocation(param)
          const expanded = expandObjectType(paramType, checker, param)

          const paramEntry: ParamInfo = {
            type: expanded,
            description: paramDesc,
          }
          if (!isOptional && !isRest) paramEntry.required = true
          if (isRest) paramEntry.rest = true

          params[paramName] = paramEntry
        } else {
          const typeText = resolveGenericParamType(param, node, checker)

          if (isRest) {
            const innerType = resolveRestElementType(typeText, node, checker)
            const paramEntry: ParamInfo = {
              type: innerType,
              description: paramDesc,
              rest: true,
            }
            if (!isOptional) paramEntry.required = true
            params[paramName] = paramEntry
          } else {
            const paramEntry: ParamInfo = {
              type: typeText,
              description: paramDesc,
            }
            if (!isOptional) paramEntry.required = true
            params[paramName] = paramEntry
          }
        }
      }

      if (Object.keys(params).length) {
        entry.params = params
      }

      const returns = resolveReturns(node, checker, sourceFile)
      if (returns) entry.returns = returns

      output[funcName] = entry
    })
  }

  return output
}

// ================ MAIN ================

function main() {
  // 1. Extract core helpers
  const { program: coreProgram, checker: coreChecker } = createProgram(CORE_DIR)
  const coreHelpersDir = path.join(CORE_DIR, 'src/helpers')
  const coreHelpers = scanHelpers(coreHelpersDir, coreProgram, coreChecker)

  // 2. Write core helpers
  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(GENERATED_DIR, 'helpers.json'),
      JSON.stringify(coreHelpers, null, 2) + '\n'
    )
  }

  const coreCount = Object.keys(coreHelpers).length
  const coreWithOverloads = Object.values(coreHelpers).filter(
    (e) => e.overloads
  ).length
  console.log(
    `helpers: ${coreCount} extracted, ${coreWithOverloads} with overloads`
  )

  // 3. Process non-core adapters
  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterHelpersDir = path.join(adapterDir, 'src/helpers')

    if (!fs.existsSync(adapterHelpersDir)) {
      console.log(`${adapterName}/helpers: skipped (no helpers directory)`)
      continue
    }

    const { program: adapterProgram, checker: adapterChecker } =
      createProgram(adapterDir)
    const adapterHelpers = scanHelpers(
      adapterHelpersDir,
      adapterProgram,
      adapterChecker
    )

    // Filter out helpers that already exist in core
    const adapterOnly: Record<string, HelperEntry> = {}
    for (const [name, entry] of Object.entries(adapterHelpers)) {
      if (!coreHelpers[name]) {
        adapterOnly[name] = entry
      }
    }

    const adapterCount = Object.keys(adapterOnly).length
    if (adapterCount === 0) {
      console.log(`${adapterName}/helpers: skipped (no adapter-only helpers)`)
      continue
    }

    const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterOutputDir, 'helpers.json'),
      JSON.stringify(adapterOnly, null, 2) + '\n'
    )

    const withOverloads = Object.values(adapterOnly).filter(
      (e) => e.overloads
    ).length
    console.log(
      `${adapterName}/helpers: ${adapterCount} extracted, ${withOverloads} with overloads`
    )
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

import * as fs from 'node:fs'
import * as path from 'node:path'

import * as ts from 'typescript'

import { corePackage, nonCoreAdapters } from '../lib/adapters.js'
import {
  addOverloadParamDescriptions,
  createProgram,
  getJSDocParamDescriptions,
  getSymbolDescription,
  importedCalleeName,
  loc,
} from '../lib/extract.js'
import { generatedDir, monorepoRoot } from '../lib/paths.js'
import { parseScope } from '../lib/scope.js'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)

// =============== TYPES ================

interface ParamInfo {
  type: string | Record<string, any>
  description: string
  loc?: string
  required?: true
  rest?: true
  default?: unknown
}

interface OverloadInfo {
  description: string
  loc?: string
  params: Record<string, ParamInfo>
  returns: { type: string }
}

interface ComposableEntry {
  type: 'function'
  private?: true
  description: string
  loc?: string
  params?: Record<string, ParamInfo>
  returns?: any
  overloads?: any[]
}

// ============= TS PROGRAM =============

// ============ JSDOC HELPERS ===========

function singleLine(s: string): string {
  return s.replace(/\s*\n\s*/g, ' ').trim()
}

function extractJSDocRaw(node: ts.Node): string | null {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (ts.isJSDoc(entry) && entry.comment) {
      return typeof entry.comment === 'string'
        ? entry.comment
        : entry.comment.map((c) => c.text || '').join('')
    }
  }
  return null
}

function preserveParagraphs(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((para) => {
      const lines = para.split('\n').map((l) => l.trim())
      const result: string[] = []
      let buf = ''

      for (const line of lines) {
        if (line.startsWith('- ')) {
          if (buf) {
            result.push(buf.trim())
            buf = ''
          }
          result.push(line)
        } else {
          buf += (buf ? ' ' : '') + line
        }
      }
      if (buf) result.push(buf.trim())

      return result.filter((l) => l.length > 0).join('\n')
    })
    .filter((p) => p.length > 0)
    .join('\n\n')
}

function getNodeJSDocDescription(node: ts.Node): string {
  const raw = extractJSDocRaw(node)
  if (raw) {
    const line = singleLine(raw)
    if (line) return line
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

function getNodeJSDocDescriptionMultiline(node: ts.Node): string {
  const raw = extractJSDocRaw(node)
  if (raw) {
    const text = preserveParagraphs(raw)
    if (text) return text
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
          const siblingRaw = extractJSDocRaw(sibling)
          if (siblingRaw) {
            const text = preserveParagraphs(siblingRaw)
            if (text) return text
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
 * usually sits on its signatures, not the implementation the extractor visits.
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

function isExpandableObjectType(
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

  const resolvedType = checker.getDeclaredTypeOfSymbol(sym)

  if (resolvedType.isUnion()) return false
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
      const entry: any = { type: 'function', description, loc: loc(propDecl) }
      if (overloads.length) entry.overloads = overloads

      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken) {
        entry.required = true
      }

      result[propSym.name] = entry
    } else if (sigs.length === 1 && isFunctionLikeType(propType)) {
      const entry: any = { type: 'function', description, loc: loc(propDecl) }

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
      const entry: any = { type: typeText, description, loc: loc(propDecl) }

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
      const paramDecl = param.getDeclarations()?.[0]
      const isRest =
        paramDecl && ts.isParameter(paramDecl) && !!paramDecl.dotDotDotToken

      if (isRest && isTupleType(paramType)) {
        const target = paramType.target as ts.TupleType
        const labeledDecls = target.labeledElementDeclarations
        const elementTypes = checker.getTypeArguments(paramType)

        for (let i = 0; i < elementTypes.length; i++) {
          const label = labeledDecls?.[i]
          const elemName =
            label && ts.isNamedTupleMember(label)
              ? label.name.text
              : `${param.name}${i}`
          // The signature is often a generic mapped fn (FeatureFire) whose
          // docblock cannot name consumer labels — those `@param` tags live
          // on the tuple's owning property (the event-map member).
          const ownerDocs = label
            ? getJSDocParamDescriptions(
                ts.findAncestor(label, ts.isPropertySignature) ?? label
              )
            : undefined
          params[elemName] = {
            type: checker.typeToString(
              elementTypes[i],
              undefined,
              TYPE_FORMAT_FLAGS
            ),
            description: jsdoc.get(elemName) || ownerDocs?.get(elemName) || '',
            ...(label ? { loc: loc(label) } : {}),
          }
        }
      } else {
        params[param.name] = {
          type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
          description: jsdoc.get(param.name) ?? '',
          ...(paramDecl ? { loc: loc(paramDecl) } : {}),
        }
      }
    }

    const ret = getFunctionReturnTypeFromSig(sig, checker)

    // Skip catch-all guard signatures where `e` is a union of all event names
    const eParam = params.e
    if (eParam && eParam.type.includes('|')) continue

    overloads.push({
      description,
      loc: loc(sigDecl),
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
  // A property's function type carries no JSDoc of its own — the `@param`
  // tags live on the owning property signature (the contextNode).
  const ownerDocs = getJSDocParamDescriptions(contextNode)
  const params: Record<string, ParamInfo> = {}

  for (const param of sig.getParameters()) {
    const paramType = checker.getTypeOfSymbolAtLocation(param, contextNode)
    const paramDecl = param.getDeclarations()?.[0]
    params[param.name] = {
      type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
      description: jsdoc.get(param.name) || ownerDocs.get(param.name) || '',
      ...(paramDecl ? { loc: loc(paramDecl) } : {}),
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

function buildFromPath(callee: string, imported: boolean): string | undefined {
  // createContext binds its accessor locally as `_use<Name>Context` and the
  // module re-exports it under the public name — normalize to the published
  // contexts.json entry (`contexts.<name>.use<Name>Context`).
  const name = callee.replace(/^_+/, '')

  if (/^use[A-Z]\w*Context$/.test(name)) {
    const contextName = name.replace(/^use/, '').replace(/Context$/, '')
    const lower = contextName.charAt(0).toLowerCase() + contextName.slice(1)
    return `contexts.${lower}`
  }

  // Other callees must be separately extracted composables — imported from
  // another module. A local closure has no entry a reference could point at.
  if (imported && /^use[A-Z]/.test(name) && name !== 'useService') {
    return `composables.${name}`
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

interface EventMapEntry {
  name: string
  description: string
  loc: string
  params: Array<{
    name: string
    type: string
    description: string
    loc?: string
  }>
}

interface DefineEventsInfo {
  destructuredNames: Set<string>
  events: EventMapEntry[]
}

const FIRE_MEMBERS = new Set(['fire', 'fireAsync'])
const LISTENER_MEMBERS = new Set(['on', 'off', 'onBefore', 'onAfter'])

function traceDefineEvents(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): DefineEventsInfo | null {
  let result: DefineEventsInfo | null = null

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === 'defineEvents'
    ) {
      const names = new Set<string>()
      for (const element of node.name.elements) {
        if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
          names.add(element.name.text)
        }
      }

      const events = extractEventMapFromCall(node.initializer, checker)
      result = { destructuredNames: names, events }
    }
    ts.forEachChild(node, visit)
  }

  if (funcDecl.body) visit(funcDecl.body)
  return result
}

function isTupleType(type: ts.Type): type is ts.TypeReference {
  const target = (type as ts.TypeReference).target
  if (!target) return false
  return (target.objectFlags & ts.ObjectFlags.Tuple) !== 0
}

function extractEventMapFromCall(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): EventMapEntry[] {
  const typeArgs = call.typeArguments
  if (!typeArgs || typeArgs.length === 0) return []

  const eventsType = checker.getTypeFromTypeNode(typeArgs[0])
  const entries: EventMapEntry[] = []

  for (const prop of eventsType.getProperties()) {
    const eventName = prop.name
    const decl = prop.getDeclarations()?.[0]
    if (!decl) continue

    const description = getSymbolDescription(prop, checker)
    const jsdocParams = getJSDocParamDescriptions(decl)

    const memberType = checker.getTypeOfSymbolAtLocation(prop, decl)

    const params: EventMapEntry['params'] = []

    if (isTupleType(memberType)) {
      const target = memberType.target as ts.TupleType
      const labeledDecls = target.labeledElementDeclarations
      const elementTypes = checker.getTypeArguments(memberType)

      for (let i = 0; i < elementTypes.length; i++) {
        const label = labeledDecls?.[i]
        const paramName =
          label && ts.isNamedTupleMember(label) ? label.name.text : `arg${i}`
        const paramType = checker.typeToString(
          elementTypes[i],
          undefined,
          TYPE_FORMAT_FLAGS
        )
        params.push({
          name: paramName,
          type: paramType,
          description: jsdocParams.get(paramName) ?? '',
          ...(label && ts.isNamedTupleMember(label) ? { loc: loc(label) } : {}),
        })
      }
    }

    entries.push({ name: eventName, description, loc: loc(decl), params })
  }

  return entries
}

function buildDefineEventsOverloads(
  memberName: string,
  events: EventMapEntry[]
): any {
  const isFire = FIRE_MEMBERS.has(memberName)
  const isListener = LISTENER_MEMBERS.has(memberName)
  if (!isFire && !isListener) return null

  const overloads: OverloadInfo[] = []

  for (const event of events) {
    const params: Record<string, ParamInfo> = {
      e: { type: `"${event.name}"`, description: 'The event name.' },
    }

    if (isFire) {
      for (const p of event.params) {
        params[p.name] = {
          type: p.type,
          description: p.description,
          ...(p.loc ? { loc: p.loc } : {}),
        }
      }
    } else {
      const cbArgs = event.params.map((p) => `${p.name}: ${p.type}`).join(', ')
      params.callback = {
        type: `(${cbArgs}) => any`,
        description: 'The event callback.',
      }
    }

    overloads.push({
      description: event.description,
      loc: event.loc,
      params,
      returns: { type: 'void' },
    })
  }

  const description = isFire
    ? 'Fires an event synchronously.'
    : memberName === 'on'
      ? 'Subscribes a callback to a specific event.'
      : memberName === 'off'
        ? 'Removes a previously registered event callback.'
        : memberName === 'onBefore'
          ? 'Registers a callback that runs before the main event listeners.'
          : 'Registers a callback that runs after the main event listeners.'

  return {
    type: 'function',
    description,
    overloads,
  }
}

function traceBindingElementSource(
  localDecl: ts.Declaration
): string | undefined {
  if (!ts.isBindingElement(localDecl)) return undefined

  const bindingPattern = localDecl.parent
  if (!ts.isObjectBindingPattern(bindingPattern)) return undefined

  const varDecl = bindingPattern.parent
  if (!ts.isVariableDeclaration(varDecl) || !varDecl.initializer)
    return undefined
  if (!ts.isCallExpression(varDecl.initializer)) return undefined

  const callExpr = varDecl.initializer
  if (!ts.isIdentifier(callExpr.expression)) return undefined

  const calleeName = callExpr.expression.text

  const originalName =
    localDecl.propertyName && ts.isIdentifier(localDecl.propertyName)
      ? localDecl.propertyName.text
      : ts.isIdentifier(localDecl.name)
        ? localDecl.name.text
        : undefined

  if (!originalName) return undefined

  if (calleeName.startsWith('make')) {
    return `factories.${calleeName}.${originalName}`
  }

  if (calleeName.startsWith('use')) {
    return `composables.${calleeName}.${originalName}`
  }

  return undefined
}

function getReturnTypeDescriptions(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): Map<string, string> {
  const map = new Map<string, string>()
  const returnTypeNode = funcDecl.type
  if (!returnTypeNode) return map

  const returnType = checker.getTypeFromTypeNode(returnTypeNode)
  for (const prop of returnType.getProperties()) {
    const desc = prop
      .getDocumentationComment(checker)
      .map((p) => p.text)
      .join('')
      .trim()
    if (desc) map.set(prop.name, singleLine(desc))
  }
  return map
}

/**
 * Per member: the `@param` docs declared on the annotated return type's
 * property — the public type is the single source for return-member param
 * docs, so implementations need no mirrored docblocks.
 */
function getReturnTypeParamDocs(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker
): Map<string, Map<string, string>> {
  const map = new Map<string, Map<string, string>>()
  const returnTypeNode = funcDecl.type
  if (!returnTypeNode) return map

  const returnType = checker.getTypeFromTypeNode(returnTypeNode)
  for (const prop of returnType.getProperties()) {
    const decl = prop.getDeclarations()?.[0]
    if (!decl) continue
    const docs = getJSDocParamDescriptions(decl)
    if (docs.size) map.set(prop.name, docs)
  }
  return map
}

function extractReturnMembers(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  isProxyRefs: boolean
): Record<string, any> | undefined {
  const obj = getReturnObjectLiteral(funcDecl)
  if (!obj) return undefined

  const defineEventsInfo = traceDefineEvents(funcDecl, checker)
  const returnTypeDescs = getReturnTypeDescriptions(funcDecl, checker)
  const returnTypeParamDocs = getReturnTypeParamDocs(funcDecl, checker)
  const result: Record<string, any> = {}

  for (const prop of obj.properties) {
    if (ts.isSpreadAssignment(prop)) continue

    const propName = ts.isIdentifier((prop as any).name)
      ? (prop as any).name.text
      : ts.isStringLiteral((prop as any).name)
        ? (prop as any).name.text
        : null

    if (!propName) continue

    if (defineEventsInfo?.destructuredNames.has(propName)) {
      if (defineEventsInfo.events.length > 0) {
        const entry = buildDefineEventsOverloads(
          propName,
          defineEventsInfo.events
        )
        if (entry) {
          result[propName] = entry
          continue
        }
      }
      result[propName] = { from: `helpers.defineEvents.${propName}` }
      continue
    }

    if (ts.isShorthandPropertyAssignment(prop)) {
      const symbol = checker.getShorthandAssignmentValueSymbol(prop)
      if (!symbol) continue

      const localDecl = symbol.getDeclarations()?.[0]
      if (!localDecl) continue

      const description =
        getSymbolDescription(symbol, checker) ||
        getNodeJSDocDescription(prop) ||
        returnTypeDescs.get(propName) ||
        ''

      if (!description && ts.isBindingElement(localDecl)) {
        const fromPath = traceBindingElementSource(localDecl)
        if (fromPath) {
          result[propName] = { from: fromPath }
          continue
        }
      }

      const memberType = checker.getTypeOfSymbolAtLocation(symbol, localDecl)

      const isPrivate = hasJSDocTag(localDecl, 'private')

      if (hasTsOverloads(localDecl)) {
        const overloads = extractTsOverloads(localDecl, checker)
        const entry: any = {
          type: 'function',
          description,
          loc: loc(localDecl),
        }
        if (isPrivate) entry.private = true
        if (overloads.length) entry.overloads = overloads
        result[propName] = entry
        continue
      }

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

      const entry: any = { type: typeStr, description, loc: loc(localDecl) }

      if (isPrivate) {
        entry.private = true
      }

      if (isFunc) {
        const sigs = memberType.getNonNullableType().getCallSignatures()
        if (sigs.length > 0) {
          const funcDecl = localDecl
          const jsdoc = getJSDocParamDescriptions(funcDecl)
          const params: Record<string, ParamInfo> = {}

          for (const sp of sigs[0].getParameters()) {
            const spDecl = sp.getDeclarations()?.[0]
            const pt = checker.getTypeOfSymbolAtLocation(sp, localDecl)
            const paramName = sp.name

            const paramEntry: ParamInfo = {
              type: checker.typeToString(pt, undefined, TYPE_FORMAT_FLAGS),
              description:
                jsdoc.get(paramName) ||
                returnTypeParamDocs.get(propName)?.get(paramName) ||
                '',
              ...(spDecl ? { loc: loc(spDecl) } : {}),
            }

            if (spDecl && ts.isParameter(spDecl) && spDecl.initializer) {
              const defVal = evalSimpleDefault(spDecl.initializer)
              if (defVal !== undefined) paramEntry.default = defVal
            }

            params[paramName] = paramEntry
          }

          if (Object.keys(params).length) entry.params = params
          const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
          if (ret) entry.returns = { type: ret }
        }
      }

      result[propName] = entry
    } else if (ts.isPropertyAssignment(prop)) {
      const description =
        getNodeJSDocDescription(prop) || returnTypeDescs.get(propName) || ''
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

      const entry: any = { type: typeStr, description, loc: loc(prop) }

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
            const spDecl = sp.getDeclarations()?.[0]
            params[sp.name] = {
              type: checker.typeToString(pt, undefined, TYPE_FORMAT_FLAGS),
              description:
                jsdoc.get(sp.name) ||
                returnTypeParamDocs.get(propName)?.get(sp.name) ||
                '',
              ...(spDecl ? { loc: loc(spDecl) } : {}),
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
      const pDecl = p.getDeclarations()?.[0]
      params[p.name] = {
        type: checker.typeToString(pType, undefined, TYPE_FORMAT_FLAGS),
        description: jsdoc.get(p.name) ?? '',
        ...(pDecl ? { loc: loc(pDecl) } : {}),
      }
    }

    overloads.push({
      description,
      loc: loc(sibling),
      params,
      returns: { type: getFunctionReturnTypeFromSig(sig, checker) },
    })
  }

  return overloads
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
                loc: loc(elemTypeSym.declarations![0]),
                ...(elem.questionToken ? {} : { required: true }),
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
          loc: loc(elem),
        }
        if (!isOptional) entry.required = true
        params[elemName] = entry
      }
    }

    overloads.push({ description: branchDesc, loc: loc(branch), params })
  }

  return overloads.length >= 2 ? overloads : undefined
}

// ======= RETURN TYPE FOR useDynamicPropFactory-style =======

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

// ================ RETURNS ================

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
    const imported = importedCalleeName(singleCall.node, checker)
    const fromPath = buildFromPath(
      imported ?? singleCall.callee,
      imported !== undefined
    )
    if (fromPath) {
      return { from: fromPath }
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

function scanDirectory(
  dir: string,
  program: ts.Program,
  checker: ts.TypeChecker,
  output: Record<string, ComposableEntry>,
  fileFilter: (f: string) => boolean
) {
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir).filter(fileFilter).sort()

  for (const file of files) {
    const filePath = path.join(dir, file)
    const sourceFile = program.getSourceFile(filePath)

    if (!sourceFile) {
      throw new Error(`File not found in program: ${file}`)
    }

    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isFunctionDeclaration(node) || !node.name) return
      if (!node.name.text.startsWith('use')) return
      if (!node.body) return

      const modifiers = ts.getCombinedModifierFlags(node)
      if (!(modifiers & ts.ModifierFlags.Export)) return

      const funcName = node.name.text

      if (output[funcName]) return

      const description = getNodeJSDocDescriptionMultiline(node)
      const jsdoc = addOverloadParamDescriptions(
        getJSDocParamDescriptions(node),
        node,
        sourceFile
      )

      const entry: ComposableEntry = {
        type: 'function',
        description,
        loc: loc(node),
      }
      if (fnDeclarationsHaveTag(node, sourceFile, 'private')) {
        entry.private = true
      }

      const overloads = detectConditionalRestOverloads(
        node,
        checker,
        sourceFile
      )
      if (overloads) {
        entry.overloads = overloads

        const returns = resolveReturns(node, checker, sourceFile)
        if (returns) entry.returns = returns

        output[funcName] = entry
        return
      }

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

        if (isExpandableObjectType(param, checker, sourceFile)) {
          const paramType = checker.getTypeAtLocation(param)
          const expanded = expandObjectType(paramType, checker, param)

          const paramEntry: ParamInfo = {
            type: expanded,
            description: paramDesc,
            loc: loc(param),
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
              loc: loc(param),
              rest: true,
            }
            if (!isOptional) paramEntry.required = true
            params[paramName] = paramEntry
          } else {
            const paramEntry: ParamInfo = {
              type: typeText,
              description: paramDesc,
              loc: loc(param),
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
}

// ================ MAIN ================

function main() {
  const { program: coreProgram, checker: coreChecker } = createProgram(CORE_DIR)

  const coreOutput: Record<string, ComposableEntry> = {}

  scanDirectory(
    path.join(CORE_DIR, 'src/composables'),
    coreProgram,
    coreChecker,
    coreOutput,
    (f) => f.startsWith('use') && f.endsWith('.ts')
  )

  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    const coreOutputFile = path.join(GENERATED_DIR, 'composables.json')
    fs.writeFileSync(coreOutputFile, JSON.stringify(coreOutput, null, 2) + '\n')
  }

  const coreCount = Object.keys(coreOutput).length
  const coreWithOverloads = Object.values(coreOutput).filter(
    (e) => e.overloads
  ).length
  console.log(
    `composables: ${coreCount} extracted, ${coreWithOverloads} with overloads`
  )

  const coreNames = new Set(Object.keys(coreOutput))

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterComposablesDir = path.join(adapterDir, 'src/composables')

    if (!fs.existsSync(adapterComposablesDir)) {
      console.log(
        `${adapterName}/composables: skipped (no composables directory)`
      )
      continue
    }

    const { program: adapterProgram, checker: adapterChecker } =
      createProgram(adapterDir)

    const adapterOutput: Record<string, ComposableEntry> = {}

    scanDirectory(
      adapterComposablesDir,
      adapterProgram,
      adapterChecker,
      adapterOutput,
      (f) => f.startsWith('use') && f.endsWith('.ts')
    )

    const adapterOnly: Record<string, ComposableEntry> = {}
    for (const [name, entry] of Object.entries(adapterOutput)) {
      if (!coreNames.has(name)) {
        adapterOnly[name] = entry
      }
    }

    const adapterOnlyCount = Object.keys(adapterOnly).length

    if (adapterOnlyCount > 0) {
      const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
      fs.mkdirSync(adapterOutputDir, { recursive: true })
      fs.writeFileSync(
        path.join(adapterOutputDir, 'composables.json'),
        JSON.stringify(adapterOnly, null, 2) + '\n'
      )
      const withOverloads = Object.values(adapterOnly).filter(
        (e) => e.overloads
      ).length
      console.log(
        `${adapterName}/composables: ${adapterOnlyCount} adapter-only, ${withOverloads} with overloads`
      )
    } else {
      console.log(`${adapterName}/composables: no adapter-specific composables`)
    }
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

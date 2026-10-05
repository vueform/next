import * as fs from 'node:fs'
import * as path from 'node:path'
import * as ts from 'typescript'
import { corePackage, nonCoreAdapters } from '../lib/adapters.js'
import { importedCalleeName } from '../lib/extract.js'

import { updateIssues, type Issue } from '../lib/issues.js'
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
  required?: true
  default?: unknown
}

interface OverloadInfo {
  description: string
  params: Record<string, ParamInfo>
  returns: { type: string }
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

function hasJSDocTag(node: ts.Node, tagName: string): boolean {
  for (const entry of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(entry) || !entry.tags) continue

    for (const tag of entry.tags) {
      if (tag.tagName.text === tagName) return true
    }
  }

  return false
}

// ============ TYPE HELPERS ============

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

function collectTypeParamMap(
  funcDecl: ts.FunctionLikeDeclaration,
  _checker: ts.TypeChecker
): Map<string, string> {
  const map = new Map<string, string>()
  if (!funcDecl.typeParameters) return map

  for (const tp of funcDecl.typeParameters) {
    const name = tp.name.text
    let resolved = 'any'
    if (tp.constraint) {
      resolved = tp.constraint.getText(funcDecl.getSourceFile()).trim()
    } else if (tp.default) {
      resolved = tp.default.getText(funcDecl.getSourceFile()).trim()
    }
    map.set(name, resolved)
  }
  return map
}

function resolveCallReturnType(
  decl: ts.Declaration,
  checker: ts.TypeChecker
): string | undefined {
  if (!ts.isVariableDeclaration(decl) || !decl.initializer) return undefined
  if (!ts.isCallExpression(decl.initializer)) return undefined

  const sig = checker.getResolvedSignature(decl.initializer)
  if (sig) {
    const ret = checker.getReturnTypeOfSignature(sig)
    if (!(ret.flags & ts.TypeFlags.Any)) {
      return checker.typeToString(ret, undefined, TYPE_FORMAT_FLAGS)
    }
  }

  return resolveCreateContextTypeName(decl.initializer, checker)
}

function resolveCreateContextTypeName(
  call: ts.CallExpression,
  checker: ts.TypeChecker
): string | undefined {
  let calledSym = checker.getSymbolAtLocation(call.expression)
  if (!calledSym) return undefined

  if (calledSym.flags & ts.SymbolFlags.Alias) {
    calledSym = checker.getAliasedSymbol(calledSym)
  }

  const fnDecl = calledSym.getDeclarations()?.[0]
  if (!fnDecl) return undefined

  let contextDecl: ts.VariableDeclaration | undefined
  if (ts.isBindingElement(fnDecl)) {
    const bindingPattern = fnDecl.parent
    if (ts.isArrayBindingPattern(bindingPattern)) {
      const varDecl = bindingPattern.parent
      if (ts.isVariableDeclaration(varDecl)) contextDecl = varDecl
    }
  }

  if (
    !contextDecl?.initializer ||
    !ts.isCallExpression(contextDecl.initializer)
  )
    return undefined

  const initCall = contextDecl.initializer
  const initSym = checker.getSymbolAtLocation(initCall.expression)
  if (!initSym || initSym.name !== 'createContext') return undefined
  if (!initCall.typeArguments || initCall.typeArguments.length === 0)
    return undefined

  const typeName = initCall.typeArguments[0]
    .getText(contextDecl.getSourceFile())
    .trim()

  const bindingIndex = ts.isBindingElement(fnDecl)
    ? (fnDecl.parent as ts.ArrayBindingPattern).elements.indexOf(fnDecl)
    : -1

  if (bindingIndex === 0) {
    return `${typeName} | undefined`
  }

  return typeName
}

function replaceTypeParams(
  typeStr: string,
  tpMap: Map<string, string>
): string {
  if (tpMap.size === 0) return typeStr

  for (const [param, constraint] of tpMap) {
    typeStr = typeStr.replace(new RegExp(`\\b${param}\\b`, 'g'), constraint)
  }
  return typeStr
}

function isFunctionLikeType(type: ts.Type): boolean {
  const inner = type.getNonNullableType()
  return !inner.isUnion() && inner.getCallSignatures().length > 0
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

function evalSimpleDefault(expr: ts.Expression): unknown | undefined {
  if (expr.kind === ts.SyntaxKind.TrueKeyword) return true
  if (expr.kind === ts.SyntaxKind.FalseKeyword) return false
  if (expr.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isNumericLiteral(expr)) return Number(expr.text)
  if (ts.isStringLiteral(expr)) return expr.text
  return undefined
}

// ===== RETURNS-OF PARSING (AST) ======

interface ReturnsOfEntry {
  factoryName: string
  picks: string[]
  /**
   * True for picks from ReturnsOf's second argument — deps the feature works
   * without.
   */
  optional?: boolean
}

function parseReturnsOfFromTypeNode(
  typeNode: ts.TypeNode,
  sourceFile: ts.SourceFile
): ReturnsOfEntry[] {
  const results: ReturnsOfEntry[] = []

  function walk(node: ts.TypeNode) {
    if (ts.isIntersectionTypeNode(node)) {
      for (const member of node.types) walk(member)
      return
    }

    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText(sourceFile)
      if (
        name === 'ReturnsOf' &&
        node.typeArguments &&
        node.typeArguments.length >= 1 &&
        node.typeArguments.length <= 2
      ) {
        // ReturnsOf<Pairs, OptionalPairs?> — both arguments are pair
        // tuples; picks from the second one are optional deps.
        node.typeArguments.forEach((tupleArg, argIndex) => {
          if (!ts.isTupleTypeNode(tupleArg)) return
          for (const elem of tupleArg.elements) {
            const pair = parsePairTuple(elem, sourceFile)
            if (pair) {
              if (argIndex === 1) pair.optional = true
              results.push(pair)
            }
          }
        })
      }
    }
  }

  walk(typeNode)
  return results
}

function parsePairTuple(
  node: ts.TypeNode,
  sourceFile: ts.SourceFile
): ReturnsOfEntry | undefined {
  if (!ts.isTupleTypeNode(node) || node.elements.length < 2) return undefined

  const [factoryTypeNode, picksNode] = node.elements

  let factoryName: string | undefined
  if (ts.isTypeQueryNode(factoryTypeNode)) {
    factoryName = factoryTypeNode.exprName.getText(sourceFile)
  }

  if (!factoryName) return undefined

  const picks: string[] = []
  if (ts.isTupleTypeNode(picksNode)) {
    for (const pickElem of picksNode.elements) {
      if (
        ts.isLiteralTypeNode(pickElem) &&
        ts.isStringLiteral(pickElem.literal)
      ) {
        picks.push(pickElem.literal.text)
      }
    }
  }

  return { factoryName, picks }
}

// ===== OPTIONS / LEG EXPANSION ======

function expandOptionsType(
  optionsType: ts.Type,
  optionsTypeNode: ts.TypeNode | undefined,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  funcDecl: ts.FunctionLikeDeclaration
): Record<string, any> {
  const result: Record<string, any> = {}

  const legs = ['props', 'deps', 'events'] as const

  for (const legName of legs) {
    const legSym = optionsType.getProperty(legName)
    if (!legSym) continue

    const legDecl = legSym.getDeclarations()?.[0]
    if (!legDecl) continue

    const legType = checker.getTypeOfSymbolAtLocation(legSym, legDecl)

    if (legName === 'deps') {
      const legTypeNode = resolveLegTypeNode(
        optionsTypeNode,
        'deps',
        1,
        sourceFile
      )
      const depsResult = expandDepsLeg(
        legType,
        legDecl,
        checker,
        sourceFile,
        legTypeNode
      )
      if (Object.keys(depsResult).length) {
        result.deps = depsResult
      }
    } else if (legName === 'events') {
      const eventsResult = expandEventsLeg(legType, legDecl, checker)
      if (Object.keys(eventsResult).length) {
        result.events = eventsResult
      }
    } else {
      const propsResult = expandPropsLeg(legType, legDecl, checker, funcDecl)
      if (Object.keys(propsResult).length) {
        result.props = propsResult
      }
    }
  }

  return result
}

function expandPropsLeg(
  type: ts.Type,
  _contextDecl: ts.Declaration,
  checker: ts.TypeChecker,
  funcDecl: ts.FunctionLikeDeclaration
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
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    } else if (sigs.length === 1 && isFunctionLikeType(propType)) {
      const entry: any = { type: 'function', description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      const params = extractSigParams(sigs[0], propDecl, checker)
      if (params && Object.keys(params).length) entry.params = params
      const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
      if (ret) entry.returns = { type: ret }
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    } else {
      let typeText = getPropertyTypeText(propSym, propDecl, checker)

      if (funcDecl.typeParameters) {
        for (const tp of funcDecl.typeParameters) {
          if (typeText.includes(tp.name.text) && tp.constraint) {
            const constraint = tp.constraint
              .getText(tp.getSourceFile())
              .replace(/\s+/g, ' ')
              .trim()
            typeText = typeText.replace(
              new RegExp(`\\b${tp.name.text}\\b`, 'g'),
              constraint
            )
          }
        }
      }

      const entry: any = { type: typeText, description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    }
  }

  return result
}

/**
 * The type node that declares a leg, resolved through indirection: a leg
 * declared as `FeatureContext<P, MakeXOptions['deps'], …>` reaches its
 * ReturnsOf node via the indexed access into the same-file options alias.
 */
/**
 * Resolves an `Alias['leg']` indexed access into the property's declared type
 * node, looking the alias up in the same source file.
 */
function resolveIndexedAccessNode(
  node: ts.IndexedAccessTypeNode,
  legName: string,
  sourceFile: ts.SourceFile
): ts.TypeNode | undefined {
  if (
    !ts.isLiteralTypeNode(node.indexType) ||
    !ts.isStringLiteral(node.indexType.literal) ||
    node.indexType.literal.text !== legName
  )
    return undefined
  if (!ts.isTypeReferenceNode(node.objectType)) return undefined

  const aliasName = node.objectType.typeName.getText(sourceFile)

  let found: ts.TypeNode | undefined
  ts.forEachChild(sourceFile, (child) => {
    if (found) return
    let literal: ts.TypeNode | undefined
    if (ts.isTypeAliasDeclaration(child) && child.name.text === aliasName) {
      literal = child.type
    }
    if (!literal || !ts.isTypeLiteralNode(literal)) return
    for (const member of literal.members) {
      if (
        ts.isPropertySignature(member) &&
        ts.isIdentifier(member.name) &&
        member.name.text === legName &&
        member.type
      ) {
        found = member.type
      }
    }
  })

  return found
}

function resolveLegTypeNode(
  optionsTypeNode: ts.TypeNode | undefined,
  legName: string,
  legIndex: number,
  sourceFile: ts.SourceFile
): ts.TypeNode | undefined {
  if (!optionsTypeNode || !ts.isTypeReferenceNode(optionsTypeNode))
    return undefined
  if (optionsTypeNode.typeName.getText(sourceFile) !== 'FeatureContext')
    return undefined

  const arg = optionsTypeNode.typeArguments?.[legIndex]
  if (!arg || !ts.isIndexedAccessTypeNode(arg)) return undefined
  return resolveIndexedAccessNode(arg, legName, sourceFile)
}

function expandDepsLeg(
  type: ts.Type,
  legDecl: ts.Declaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  legTypeNode?: ts.TypeNode
): Record<string, any> {
  const result: Record<string, any> = {}

  const returnsOfEntries = new Map<
    string,
    { factoryName: string; optional?: boolean }
  >()

  let declaredType =
    legTypeNode ?? (ts.isPropertySignature(legDecl) ? legDecl.type : undefined)
  // A leg declared inline as `deps: MakeXOptions['deps']` reaches its
  // ReturnsOf node through the indexed access into the options alias.
  if (declaredType && ts.isIndexedAccessTypeNode(declaredType)) {
    declaredType =
      resolveIndexedAccessNode(declaredType, 'deps', sourceFile) ?? declaredType
  }
  if (declaredType) {
    const entries = parseReturnsOfFromTypeNode(declaredType, sourceFile)
    for (const entry of entries) {
      for (const pick of entry.picks) {
        returnsOfEntries.set(pick, {
          factoryName: entry.factoryName,
          optional: entry.optional,
        })
      }
    }
  }

  for (const propSym of type.getProperties()) {
    const propDecl = propSym.getDeclarations()?.[0]
    if (!propDecl) continue

    const factorySource = returnsOfEntries.get(propSym.name)
    if (factorySource) {
      result[propSym.name] = {
        from: `features.${factorySource.factoryName}.${propSym.name}`,
        // Deps are required by default; picks from ReturnsOf's second
        // argument are the optional ones and stay unflagged.
        ...(factorySource.optional ? {} : { required: true }),
      }
      continue
    }

    const description = getSymbolDescription(propSym, checker)
    const propType = checker.getTypeOfSymbolAtLocation(propSym, propDecl)
    const sigs = propType.getNonNullableType().getCallSignatures()

    if (sigs.length > 1) {
      const overloads = extractCallSignatureOverloads(sigs, propDecl, checker)
      const entry: any = { type: 'function', description }
      if (overloads.length) entry.overloads = overloads
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    } else if (sigs.length === 1 && isFunctionLikeType(propType)) {
      const entry: any = { type: 'function', description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      const params = extractSigParams(sigs[0], propDecl, checker)
      if (params && Object.keys(params).length) entry.params = params
      const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
      if (ret) entry.returns = { type: ret }
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    } else {
      const typeText = getPropertyTypeText(propSym, propDecl, checker)
      const entry: any = { type: typeText, description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      markUndocumented(entry, propDecl)
      result[propSym.name] = entry
    }
  }

  return result
}

function expandEventsLeg(
  type: ts.Type,
  _legDecl: ts.Declaration,
  checker: ts.TypeChecker
): Record<string, any> {
  const result: Record<string, any> = {}

  // The events leg exposes the event bus (fire, on, off, …) — the event
  // inventory lives in the `fire` overloads: one signature per event, whose
  // first param is the event name literal and second the labeled args tuple.
  // The output is the plain inventory: event name → description + params.
  const fireSym = type.getProperty('fire')
  const fireDecl = fireSym?.getDeclarations()?.[0]
  if (!fireSym || !fireDecl) return result

  const fireType = checker.getTypeOfSymbolAtLocation(fireSym, fireDecl)

  for (const sig of fireType.getNonNullableType().getCallSignatures()) {
    const sigParams = sig.getParameters()
    if (!sigParams.length) continue

    const eDecl = sigParams[0].getDeclarations()?.[0] ?? fireDecl
    const eType = checker.getTypeOfSymbolAtLocation(sigParams[0], eDecl)
    if (!eType.isStringLiteral()) continue

    const eventName = eType.value
    // Overloads are ordered most-specific first; keep the first per event.
    if (result[eventName]) continue

    const description = getNodeJSDocDescription(sig.getDeclaration())

    const eventParams: Record<string, any> = {}
    if (sigParams[1]) {
      const argsDecl = sigParams[1].getDeclarations()?.[0] ?? fireDecl
      const argsType = checker.getTypeOfSymbolAtLocation(
        sigParams[1],
        argsDecl
      ) as ts.TypeReference
      const target = argsType.target as ts.TupleType | undefined
      if (target?.labeledElementDeclarations) {
        const typeArgs = checker.getTypeArguments(argsType)
        target.labeledElementDeclarations.forEach((label, i) => {
          if (!label || !typeArgs[i]) return
          const name = label.name.getText(label.getSourceFile())
          eventParams[name] = {
            type: checker.typeToString(
              typeArgs[i],
              undefined,
              TYPE_FORMAT_FLAGS
            ),
            description: '',
          }
        })
      }
    }

    const entry: any = { description }
    if (Object.keys(eventParams).length) entry.params = eventParams
    markUndocumented(entry, sig.getDeclaration())
    result[eventName] = entry
  }

  return result
}

// ===== RESOLVE OPTIONS TYPE NODE =====

function resolveOptionsTypeForInlineIntersection(
  funcDecl: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker,
  _sourceFile: ts.SourceFile
): { optionsType: ts.Type; typeNode: ts.TypeNode | undefined } | undefined {
  if (!funcDecl.parameters.length) return undefined
  const param = funcDecl.parameters[0]

  const optionsType = checker.getTypeAtLocation(param)
  const typeNode = param.type

  return { optionsType, typeNode }
}

// ======= RETURN TYPE ANALYSIS ========

function findReturnStatement(body: ts.Block): ts.ReturnStatement | undefined {
  for (let i = body.statements.length - 1; i >= 0; i--) {
    const stmt = body.statements[i]
    if (ts.isReturnStatement(stmt)) return stmt
  }
  return undefined
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

function getReturnObjectLiteral(
  funcDecl: ts.FunctionLikeDeclaration
): ts.ObjectLiteralExpression | undefined {
  const body = funcDecl.body
  if (!body) return undefined

  if (ts.isBlock(body)) {
    const ret = findReturnStatement(body)
    if (!ret?.expression) return undefined
    // `return { … } as MakeXReturn<P>` and friends still count.
    const expr = unwrapExpr(ret.expression)
    if (ts.isObjectLiteralExpression(expr)) {
      return expr
    }
    return undefined
  }

  if (ts.isObjectLiteralExpression(body)) {
    return body
  }

  return undefined
}

function traceSpreadSource(
  spreadExpr: ts.Expression,
  funcDecl: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker
):
  | { kind: 'factory'; name: string }
  | { kind: 'composable'; name: string }
  | { kind: 'variable'; name: string }
  | undefined {
  if (!ts.isIdentifier(spreadExpr)) return undefined

  const varName = spreadExpr.text
  const body = funcDecl.body
  if (!body || !ts.isBlock(body)) return undefined

  for (const stmt of body.statements) {
    if (!ts.isVariableStatement(stmt)) continue

    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== varName) continue
      if (!decl.initializer) continue

      if (ts.isCallExpression(decl.initializer)) {
        // Only reference callees that are separately scraped entries —
        // imported from another module. A local closure that matches the
        // make*/use* naming has no entry a `from` ref could point at.
        let calleeName: string | undefined
        let rawCalleeName: string | undefined

        if (ts.isIdentifier(decl.initializer.expression)) {
          rawCalleeName = decl.initializer.expression.text
          calleeName = importedCalleeName(decl.initializer.expression, checker)
        }

        if (calleeName?.startsWith('make')) {
          return { kind: 'factory', name: calleeName }
        }

        if (
          rawCalleeName === 'withoutInitializers' &&
          decl.initializer.arguments[0]
        ) {
          const innerCall = decl.initializer.arguments[0]
          if (
            ts.isCallExpression(innerCall) &&
            ts.isIdentifier(innerCall.expression)
          ) {
            const innerName = importedCalleeName(innerCall.expression, checker)
            if (innerName?.startsWith('use')) {
              return { kind: 'composable', name: innerName }
            }
          }
        }

        if (calleeName?.startsWith('use')) {
          return { kind: 'composable', name: calleeName }
        }
      }

      return { kind: 'variable', name: varName }
    }
  }

  return undefined
}

function resolveSpreadMembers(
  source:
    | { kind: 'factory'; name: string }
    | { kind: 'composable'; name: string },
  spreadExpr: ts.Expression,
  checker: ts.TypeChecker
): Record<string, any> {
  const result: Record<string, any> = {}
  const spreadType = checker.getTypeAtLocation(spreadExpr)

  for (const prop of spreadType.getProperties()) {
    const prefix = source.kind === 'factory' ? 'features' : 'composables'
    result[prop.name] = { from: `${prefix}.${source.name}.${prop.name}` }
  }

  return result
}

function applyTypeParamReplacements(
  result: Record<string, any>,
  tpMap: Map<string, string>
): void {
  if (tpMap.size === 0) return

  for (const entry of Object.values(result)) {
    if (entry.from) continue
    if (typeof entry.type === 'string' && entry.type !== 'function') {
      entry.type = replaceTypeParams(entry.type, tpMap)
    }
    if (entry.params) {
      for (const p of Object.values(entry.params) as any[]) {
        if (typeof p.type === 'string')
          p.type = replaceTypeParams(p.type, tpMap)
      }
    }
    if (entry.returns && typeof entry.returns.type === 'string') {
      entry.returns.type = replaceTypeParams(entry.returns.type, tpMap)
    }
  }
}

function traceBindingElementSource(
  localDecl: ts.Declaration,
  checker: ts.TypeChecker
): string | undefined {
  if (!ts.isBindingElement(localDecl)) return undefined

  const bindingPattern = localDecl.parent
  if (!ts.isObjectBindingPattern(bindingPattern)) return undefined

  const varDecl = bindingPattern.parent
  if (!ts.isVariableDeclaration(varDecl) || !varDecl.initializer)
    return undefined
  if (!ts.isCallExpression(varDecl.initializer)) return undefined

  const callExpr = varDecl.initializer
  // A curried feature call (`makeItems(config)({ … })`) resolves through the
  // inner call's identifier.
  const calleeIdent = ts.isIdentifier(callExpr.expression)
    ? callExpr.expression
    : ts.isCallExpression(callExpr.expression) &&
        ts.isIdentifier(callExpr.expression.expression)
      ? callExpr.expression.expression
      : undefined
  if (!calleeIdent) return undefined

  // Only reference callees that are separately scraped entries (see
  // traceSpreadSource).
  const calleeName = importedCalleeName(calleeIdent, checker)
  if (!calleeName) return undefined

  const originalName =
    localDecl.propertyName && ts.isIdentifier(localDecl.propertyName)
      ? localDecl.propertyName.text
      : ts.isIdentifier(localDecl.name)
        ? localDecl.name.text
        : undefined

  if (!originalName) return undefined

  if (calleeName.startsWith('make')) {
    return `features.${calleeName}.${originalName}`
  }

  if (calleeName.startsWith('use')) {
    return `composables.${calleeName}.${originalName}`
  }

  return undefined
}

function extractReturnMembersFromCall(
  funcDecl: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker
): Record<string, any> | undefined {
  const body = funcDecl.body
  if (!body || !ts.isBlock(body)) return undefined
  const ret = findReturnStatement(body)
  if (!ret?.expression) return undefined

  const callExpr = unwrapExpr(ret.expression)
  if (!ts.isCallExpression(callExpr)) return undefined

  // Only reference callees that are separately scraped entries (see
  // traceSpreadSource).
  let calleeName: string | undefined

  if (ts.isIdentifier(callExpr.expression)) {
    calleeName = importedCalleeName(callExpr.expression, checker)
  }

  if (!calleeName) return undefined

  let prefix: string | undefined
  if (calleeName.startsWith('use')) prefix = 'composables'
  else if (calleeName.startsWith('make')) prefix = 'features'

  if (!prefix) return undefined

  const calleeType = checker.getTypeAtLocation(callExpr.expression)
  const sigs = calleeType.getCallSignatures()
  const returnType = sigs.length
    ? checker.getReturnTypeOfSignature(sigs[sigs.length - 1])
    : checker.getTypeAtLocation(callExpr)

  const result: Record<string, any> = {}

  for (const prop of returnType.getProperties()) {
    result[prop.name] = { from: `${prefix}.${calleeName}.${prop.name}` }
  }

  return Object.keys(result).length ? result : undefined
}

function extractReturnMembers(
  funcDecl: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker
): Record<string, any> | undefined {
  const obj = getReturnObjectLiteral(funcDecl)
  if (!obj) return extractReturnMembersFromCall(funcDecl, checker)

  const tpMap = collectTypeParamMap(funcDecl, checker)
  const result: Record<string, any> = {}

  for (const prop of obj.properties) {
    if (ts.isSpreadAssignment(prop)) {
      const source = traceSpreadSource(prop.expression, funcDecl, checker)
      if (
        source &&
        (source.kind === 'factory' || source.kind === 'composable')
      ) {
        const members = resolveSpreadMembers(source, prop.expression, checker)
        Object.assign(result, members)
      } else {
        const spreadType = checker.getTypeAtLocation(prop.expression)
        for (const spreadProp of spreadType.getProperties()) {
          const spreadDecl = spreadProp.getDeclarations()?.[0]
          if (!spreadDecl) continue
          const desc = getSymbolDescription(spreadProp, checker)
          const memberType = checker.getTypeOfSymbolAtLocation(
            spreadProp,
            spreadDecl
          )
          const isFunc = isFunctionLikeType(memberType)

          const isPrivate = hasJSDocTag(spreadDecl, 'private')

          if (isFunc) {
            const entry: any = { type: 'function', description: desc }
            if (isPrivate) entry.private = true
            const sigs = memberType.getNonNullableType().getCallSignatures()
            if (sigs.length > 0) {
              const jsdoc = getJSDocParamDescriptions(spreadDecl)
              const params: Record<string, ParamInfo> = {}
              for (const sp of sigs[0].getParameters()) {
                const spDecl = sp.getDeclarations()?.[0]
                const pt = checker.getTypeOfSymbolAtLocation(sp, spreadDecl)
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
            markUndocumented(entry, spreadDecl)
            result[spreadProp.name] = entry
          } else {
            const entry: any = {
              type: checker.typeToString(
                memberType,
                spreadDecl,
                TYPE_FORMAT_FLAGS
              ),
              description: desc,
            }
            if (isPrivate) entry.private = true
            markUndocumented(entry, spreadDecl)
            result[spreadProp.name] = entry
          }
        }
      }
      continue
    }

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

      if (!description && ts.isBindingElement(localDecl)) {
        const fromPath = traceBindingElementSource(localDecl, checker)
        if (fromPath) {
          result[propName] = { from: fromPath }
          continue
        }
      }

      // A member holding a whole call result of an imported composable or
      // feature (`const messageBag = useMessageBag()`) carries a reference to
      // that entry alongside its own type.
      let wholeCallRef: string | undefined
      if (
        ts.isVariableDeclaration(localDecl) &&
        localDecl.initializer &&
        ts.isCallExpression(localDecl.initializer) &&
        ts.isIdentifier(localDecl.initializer.expression)
      ) {
        const callee = importedCalleeName(
          localDecl.initializer.expression,
          checker
        )
        if (callee && /^use[A-Z]\w*Context$/.test(callee)) {
          // Context accessors live in contexts.json, keyed by context name.
          const contextName = callee.replace(/^use/, '').replace(/Context$/, '')
          wholeCallRef = `contexts.${
            contextName.charAt(0).toLowerCase() + contextName.slice(1)
          }`
        } else if (callee && /^use[A-Z]/.test(callee)) {
          wholeCallRef = `composables.${callee}`
        } else if (callee && /^make[A-Z]/.test(callee)) {
          wholeCallRef = `features.${callee}`
        }
      }

      const memberType = checker.getTypeOfSymbolAtLocation(symbol, localDecl)
      const isFunc = isFunctionLikeType(memberType)

      let typeStr: string
      if (memberType.flags & ts.TypeFlags.Any) {
        typeStr = resolveCallReturnType(localDecl, checker) ?? 'any'
      } else {
        typeStr = isFunc
          ? 'function'
          : checker.typeToString(memberType, localDecl, TYPE_FORMAT_FLAGS)
      }
      const entry: any = { type: typeStr, description }
      if (wholeCallRef) entry.from = wholeCallRef

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

      markUndocumented(entry, localDecl)
      result[propName] = entry
    } else if (ts.isPropertyAssignment(prop)) {
      const description = getNodeJSDocDescription(prop)
      const exprType = checker.getTypeAtLocation(prop.initializer)
      const isFunc = isFunctionLikeType(exprType)
      const typeStr = isFunc
        ? 'function'
        : checker.typeToString(exprType, prop, TYPE_FORMAT_FLAGS)
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

      markUndocumented(entry, prop)
      result[propName] = entry
    }
  }

  applyTypeParamReplacements(result, tpMap)

  return Object.keys(result).length ? result : undefined
}

// ========= BLUEPRINT ENRICHMENT ========

interface BlueprintPropInfo {
  type: string
  description: string
  required?: true
  private?: true
  default?: unknown
  params?: Record<string, { type: string; description: string }>
  returns?: { type: string }
}

interface BlueprintEventInfo {
  description: string
  params?: Record<string, { type: string; description: string }>
}

interface BlueprintEntry {
  props: Record<string, BlueprintPropInfo>
  events: Record<string, BlueprintEventInfo>
  features?: string[]
}

/**
 * Fills empty prop and event descriptions of each feature from the blueprints
 * that list the feature among their `features`. A description is inherited only
 * when those blueprints agree (one distinct value) — ambiguity among the using
 * blueprints leaves it empty for `pnpm extract:validate` to flag.
 */
function enrichFromUsingBlueprints(
  output: Record<string, any>,
  blueprintsPath: string | undefined
): number {
  if (!blueprintsPath || !fs.existsSync(blueprintsPath)) return 0

  const blueprints: Record<string, BlueprintEntry> = JSON.parse(
    fs.readFileSync(blueprintsPath, 'utf-8')
  )

  let enriched = 0

  const unanimous = (values: (string | undefined)[]): string | undefined => {
    const distinct = new Set(values.filter(Boolean) as string[])
    return distinct.size === 1 ? [...distinct][0] : undefined
  }

  for (const [featureName, entry] of Object.entries(output)) {
    const usingBps = Object.values(blueprints).filter((bp) =>
      bp.features?.includes(featureName)
    )
    if (!usingBps.length) continue

    const props = entry.props
    if (props) {
      for (const [propName, prop] of Object.entries<any>(props)) {
        if (prop.description) continue
        const distinct = new Set(
          usingBps
            .map((bp) => bp.props?.[propName]?.description)
            .filter(Boolean)
        )
        if (distinct.size === 1) {
          prop.description = [...distinct][0]
          enriched++
        } else if (distinct.size > 1 && !prop.reason) {
          prop.reason = 'ambiguous'
        }
      }
    }

    const events = entry.events
    if (events) {
      for (const [eventName, event] of Object.entries<any>(events)) {
        const bpEvents = usingBps
          .map((bp) => bp.events?.[eventName])
          .filter(Boolean) as BlueprintEventInfo[]
        if (!bpEvents.length) continue

        if (!event.description) {
          const distinct = new Set(
            bpEvents.map((e) => e.description).filter(Boolean)
          )
          if (distinct.size === 1) {
            event.description = [...distinct][0]
            enriched++
          } else if (distinct.size > 1 && !event.reason) {
            event.reason = 'ambiguous'
          }
        }

        for (const [paramName, param] of Object.entries<any>(
          event.params ?? {}
        )) {
          if (param.description) continue
          const description = unanimous(
            bpEvents.map((e) => e.params?.[paramName]?.description)
          )
          if (description) {
            param.description = description
            enriched++
          }
        }
      }
    }
  }

  return enriched
}

/**
 * Get the set of allowed return keys from the declared type annotation on a
 * factory const. For overloaded factory interfaces like MakeDataFeature, uses
 * the last call signature (the broadest overload). Resolves through the inner
 * function's return type to get the actual member keys.
 */
function getDeclaredReturnKeys(
  decl: ts.VariableDeclaration,
  checker: ts.TypeChecker
): Set<string> | undefined {
  if (!decl.type) return undefined

  const declaredType = checker.getTypeAtLocation(decl.type)
  const sigs = declaredType.getCallSignatures()
  if (!sigs.length) return undefined

  const lastSig = sigs[sigs.length - 1]
  const outerReturn = checker.getReturnTypeOfSignature(lastSig)

  const innerSigs = outerReturn.getCallSignatures()
  if (!innerSigs.length) return undefined

  const innerReturn = checker.getReturnTypeOfSignature(innerSigs[0])
  const keys = new Set<string>()
  for (const prop of innerReturn.getProperties()) {
    keys.add(prop.name)
  }

  return keys.size > 0 ? keys : undefined
}

// ====== FACTORY EXTRACTION ==========

/**
 * Given the outer function passed to defineFeature, find the inner function
 * (the one that takes options and returns the actual members).
 *
 * Patterns handled:
 *
 * 1. Arrow returning arrow: `() => (options) => { return {...} }`
 * 2. Arrow with config returning arrow: `(config?) => (options) => { return {...}
 *    }`
 * 3. Arrow block returning named function: `() => { function inner(options) {...}
 *    return inner }`
 */
function findInnerFunction(
  outerFn: ts.Expression
): ts.FunctionLikeDeclaration | undefined {
  if (!ts.isArrowFunction(outerFn) && !ts.isFunctionExpression(outerFn))
    return undefined

  const body = outerFn.body

  if (!ts.isBlock(body)) {
    if (ts.isArrowFunction(body) || ts.isFunctionExpression(body)) {
      return body
    }
    if (ts.isParenthesizedExpression(body)) {
      const inner = body.expression
      if (ts.isArrowFunction(inner) || ts.isFunctionExpression(inner)) {
        return inner
      }
    }
    return undefined
  }

  const ret = findReturnStatement(body)
  if (!ret?.expression) return undefined

  if (
    ts.isArrowFunction(ret.expression) ||
    ts.isFunctionExpression(ret.expression)
  ) {
    return ret.expression
  }

  if (ts.isIdentifier(ret.expression)) {
    const returnedName = ret.expression.text
    for (const stmt of body.statements) {
      if (ts.isFunctionDeclaration(stmt) && stmt.name?.text === returnedName) {
        return stmt
      }
      if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (
            ts.isIdentifier(decl.name) &&
            decl.name.text === returnedName &&
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer))
          ) {
            return decl.initializer
          }
        }
      }
    }
  }

  return undefined
}

/**
 * Check if a call expression is a defineFeature(...) call.
 */
function makeFactoryAliasEntry(
  _funcName: string,
  targetName: string,
  description: string,
  delegateCall: ts.CallExpression,
  checker: ts.TypeChecker
): any {
  let aliasReturnKeys: Set<string> | undefined
  const delegateSig = checker.getResolvedSignature(delegateCall)
  if (delegateSig) {
    const delegateReturn = checker.getReturnTypeOfSignature(delegateSig)
    const innerSigs = delegateReturn.getCallSignatures()
    if (innerSigs.length) {
      const innerReturn = checker.getReturnTypeOfSignature(innerSigs[0])
      aliasReturnKeys = new Set<string>()
      for (const prop of innerReturn.getProperties()) {
        aliasReturnKeys.add(prop.name)
      }
    }
  }

  return {
    type: 'function',
    description,
    aliasOf: targetName,
    _aliasReturnKeys: aliasReturnKeys,
  }
}

function isMakeCall(
  expr: ts.Expression | undefined
): expr is ts.CallExpression {
  if (!expr) return false
  const call = unwrapExpr(expr)
  return (
    ts.isCallExpression(call) &&
    ts.isIdentifier(call.expression) &&
    call.expression.text.startsWith('make')
  )
}

function isDefineFactoryCall(expr: ts.Expression): expr is ts.CallExpression {
  return (
    ts.isCallExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === 'defineFeature'
  )
}

/**
 * Recursively collect absolute paths of `make*.ts` factory files under `dir`.
 */
function findMakeFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const results: string[] = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findMakeFiles(fullPath))
    } else if (entry.isFile() && /^make\w+\.ts$/.test(entry.name)) {
      results.push(fullPath)
    }
  }

  return results.sort((a, b) =>
    path.basename(a).localeCompare(path.basename(b))
  )
}

function extractFactories(
  program: ts.Program,
  checker: ts.TypeChecker,
  factoriesDir: string
): { output: Record<string, any>; totalReturns: number } {
  const files = findMakeFiles(factoriesDir)

  const output: Record<string, any> = {}
  let totalReturns = 0

  for (const filePath of files) {
    const sourceFile = program.getSourceFile(filePath)

    if (!sourceFile) {
      throw new Error(`File not found in program: ${filePath}`)
    }

    ts.forEachChild(sourceFile, (node) => {
      // Handle old-style: export function makeX(...) { ... }
      if (ts.isFunctionDeclaration(node) && node.name) {
        if (!node.name.text.startsWith('make')) return
        if (!node.body) return

        const modifiers = ts.getCombinedModifierFlags(node)
        if (!(modifiers & ts.ModifierFlags.Export)) return

        const funcName = node.name.text
        const description = getNodeJSDocDescription(node)

        const entry: any = { type: 'function', description }

        if (node.parameters.length > 0) {
          const resolved = resolveOptionsTypeForInlineIntersection(
            node,
            checker,
            sourceFile
          )

          if (resolved) {
            const optionsExpanded = expandOptionsType(
              resolved.optionsType,
              resolved.typeNode,
              checker,
              sourceFile,
              node
            )

            if (Object.keys(optionsExpanded).length) {
              Object.assign(entry, optionsExpanded)
            }
          }
        }

        const returns = extractReturnMembers(node, checker)
        if (returns) {
          entry.returns = returns
          totalReturns += Object.keys(returns).length
          output[funcName] = entry
          return
        }

        const ret = findReturnStatement(node.body)
        if (isMakeCall(ret?.expression)) {
          const call = unwrapExpr(ret!.expression) as ts.CallExpression
          output[funcName] = makeFactoryAliasEntry(
            funcName,
            (call.expression as ts.Identifier).text,
            description,
            call,
            checker
          )
          return
        }

        output[funcName] = entry
        return
      }

      // Handle new-style: export const makeX = defineFeature(...)
      if (!ts.isVariableStatement(node)) return

      const modifiers = node.modifiers
      const isExported = modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      )
      if (!isExported) return

      for (const decl of node.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue
        if (!decl.name.text.startsWith('make')) continue
        if (!decl.initializer) continue

        if (isDefineFactoryCall(decl.initializer)) {
          const funcName = decl.name.text
          const outerArg = decl.initializer.arguments[0]
          if (!outerArg) continue

          const innerFn = findInnerFunction(outerArg)
          if (!innerFn) continue

          const description =
            getNodeJSDocDescription(node) || getNodeJSDocDescription(innerFn)

          const entry: any = { type: 'function', description }

          const config = extractConfig(outerArg, checker, sourceFile)
          if (config) entry.config = config

          if (innerFn.parameters.length > 0) {
            const resolved = resolveOptionsTypeForInlineIntersection(
              innerFn,
              checker,
              sourceFile
            )

            if (resolved) {
              const optionsExpanded = expandOptionsType(
                resolved.optionsType,
                resolved.typeNode,
                checker,
                sourceFile,
                innerFn
              )

              if (Object.keys(optionsExpanded).length) {
                Object.assign(entry, optionsExpanded)
              }
            }
          }

          const returns = extractReturnMembers(innerFn, checker)
          if (returns) {
            const allowedKeys = getDeclaredReturnKeys(decl, checker)
            if (allowedKeys) {
              entry._unfilteredReturns = { ...returns }
              for (const key of Object.keys(returns)) {
                if (!allowedKeys.has(key)) delete returns[key]
              }
            }
            entry.returns = returns
            totalReturns += Object.keys(returns).length
          }

          output[funcName] = entry
          continue
        }

        // Handle factory aliases: export const makeXData = () => makeY(config)
        if (
          ts.isArrowFunction(decl.initializer) ||
          ts.isFunctionExpression(decl.initializer)
        ) {
          const aliasBody = decl.initializer.body
          let delegateExpr: ts.Expression | undefined

          if (!ts.isBlock(aliasBody)) {
            delegateExpr = aliasBody
          } else {
            delegateExpr = findReturnStatement(aliasBody)?.expression
          }

          if (isMakeCall(delegateExpr)) {
            const call = unwrapExpr(delegateExpr) as ts.CallExpression
            output[decl.name.text] = makeFactoryAliasEntry(
              decl.name.text,
              (call.expression as ts.Identifier).text,
              getNodeJSDocDescription(node),
              call,
              checker
            )
          }
        }
      }
    })
  }

  // Resolve aliases: copy returns from the target factory, filtered by overload
  for (const [, entry] of Object.entries(output)) {
    if (entry.aliasOf && output[entry.aliasOf]) {
      const target = output[entry.aliasOf]
      if (target.returns) {
        const aliasKeys: Set<string> | undefined = entry._aliasReturnKeys
        const sourceReturns = target._unfilteredReturns || target.returns || {}
        if (aliasKeys && aliasKeys.size > 0) {
          const filtered: Record<string, any> = {}
          for (const [k, v] of Object.entries(sourceReturns)) {
            if (aliasKeys.has(k)) filtered[k] = v
          }
          entry.returns = filtered
          totalReturns += Object.keys(filtered).length
        } else {
          entry.returns = { ...sourceReturns }
          totalReturns += Object.keys(sourceReturns).length
        }
      }
      for (const key of ['props', 'deps', 'events']) {
        if (target[key] !== undefined && entry[key] === undefined) {
          entry[key] = target[key]
        }
      }
      delete entry.aliasOf
      delete entry._aliasReturnKeys
    } else if (entry.aliasOf) {
      delete entry.aliasOf
      delete entry._aliasReturnKeys
    }
  }

  // Clean up internal fields
  for (const entry of Object.values(output)) {
    delete entry._unfilteredReturns
  }

  return { output, totalReturns }
}

/**
 * Resolves remaining undescribed deps to their origin: a dep is by definition
 * another feature's return, so a name concretely returned (not itself a
 * reference) by exactly one other feature becomes a `from` reference to it.
 * Ambiguous or unmatched deps stay as they are and `pnpm extract:validate`
 * flags them for a manual description.
 */
function resolveDepOrigins(
  output: Record<string, any>,
  featureSets: Record<string, any>[]
): void {
  const merged: Record<string, any> = {}
  for (const set of featureSets) Object.assign(merged, set)

  const origins = new Map<string, Set<string>>()
  const refOrigins = new Map<string, Set<string>>()
  for (const [featureName, entry] of Object.entries(merged)) {
    const members = entry.returns
    if (!members || typeof members !== 'object') continue
    for (const [memberName, member] of Object.entries(members) as [
      string,
      any,
    ][]) {
      const target = member.from ? refOrigins : origins
      if (!target.has(memberName)) target.set(memberName, new Set())
      target.get(memberName)!.add(featureName)
    }
  }

  for (const [featureName, entry] of Object.entries(output)) {
    const deps = entry.deps
    if (!deps) continue
    for (const [depName, dep] of Object.entries(deps) as [string, any][]) {
      if (dep.from || dep.description) continue
      // Prefer features that return the member concretely; fall back to
      // ones re-exposing it via a reference (the chain still resolves).
      let candidates = new Set(origins.get(depName) ?? [])
      candidates.delete(featureName)
      if (!candidates.size) {
        candidates = new Set(refOrigins.get(depName) ?? [])
        candidates.delete(featureName)
      }
      if (candidates.size === 1) {
        deps[depName] = {
          from: `features.${[...candidates][0]}.${depName}`,
          required: true,
        }
      } else if (candidates.size > 1 && !dep.reason) {
        dep.reason = 'ambiguous'
      }
    }
  }
}

/**
 * The feature's config: the outer `defineFeature((config?: MakeXConfig) => …)`
 * parameter, with its members expanded. Follows the features convention —
 * required by default, `optional: true` marks `?`-declared ones.
 */
function extractConfig(
  outerArg: ts.Expression,
  checker: ts.TypeChecker,
  _sourceFile: ts.SourceFile
): Record<string, any> | undefined {
  if (!ts.isArrowFunction(outerArg) && !ts.isFunctionExpression(outerArg)) {
    return undefined
  }

  const param = outerArg.parameters[0]
  if (!param) return undefined

  const members: Record<string, any> = {}
  const paramType = checker.getTypeAtLocation(param)
  for (const propSym of paramType.getNonNullableType().getProperties()) {
    const propDecl = propSym.getDeclarations()?.[0]
    if (!propDecl) continue

    const member: any = {
      type: getPropertyTypeText(propSym, propDecl, checker),
      description: getSymbolDescription(propSym, checker),
    }
    if (ts.isPropertySignature(propDecl) && !propDecl.questionToken) {
      member.required = true
    }
    markUndocumented(member, propDecl)
    members[propSym.name] = member
  }

  return Object.keys(members).length ? members : undefined
}

/**
 * Stamps an undocumented member with its source location so `pnpm
 * extract:validate` can print a clickable `file:line`. Pruned again once
 * enrichment fills the description or the member resolves to a `from`
 * reference.
 */
function markUndocumented(entry: any, decl: ts.Node | undefined): void {
  if (!decl || entry.description || entry.from) return
  const sf = decl.getSourceFile()
  entry.file = path.relative(ROOT, sf.fileName)
  entry.line = sf.getLineAndCharacterOfPosition(decl.getStart()).line + 1
  // A docblock holding only `@write` deliberately marks the member writable
  // but leaves it undescribed.
  if (hasJSDocTag(decl, 'write')) entry.reason = 'flagged'
}

function collectIssues(output: Record<string, any>): Issue[] {
  const issues: Issue[] = []

  const take = (name: string, member: any) => {
    if (!member || typeof member !== 'object') return
    const undocumented = !member.description && !member.from
    if (undocumented) {
      issues.push({
        name,
        reason: member.reason ?? 'missing',
        ...(member.file ? { file: member.file, line: member.line } : {}),
      })
    }
    delete member.file
    delete member.line
    delete member.reason
  }

  for (const [featureName, entry] of Object.entries(output)) {
    const options = entry
    for (const section of ['props', 'deps', 'events']) {
      for (const [memberName, member] of Object.entries<any>(
        options[section] ?? {}
      )) {
        take(`${featureName}.${section}.${memberName}`, member)
      }
    }
    for (const [memberName, member] of Object.entries<any>(
      entry.returns ?? {}
    )) {
      take(`${featureName}.returns.${memberName}`, member)
    }
    for (const [memberName, member] of Object.entries<any>(
      entry.config ?? {}
    )) {
      take(`${featureName}.config.${memberName}`, member)
    }
  }

  return issues
}

// ================ MAIN ================

function main() {
  const coreFactoriesDir = path.join(CORE_DIR, 'src/features')
  // Raw output of the blueprints scraper when running under the
  // orchestrator, the assembled tree when running standalone afterwards.
  const coreBlueprintsPath = [
    path.join(GENERATED_DIR, '_ui/blueprints.json'),
    path.join(GENERATED_DIR, 'core/blueprints.json'),
  ].find((file) => fs.existsSync(file))
  const coreOutputFile = path.join(GENERATED_DIR, 'features.json')

  const { program: coreProgram, checker: coreChecker } = createProgram(CORE_DIR)

  const { output: coreOutput, totalReturns: coreTotalReturns } =
    extractFactories(coreProgram, coreChecker, coreFactoriesDir)

  const enrichedCount = enrichFromUsingBlueprints(
    coreOutput,
    coreBlueprintsPath
  )
  resolveDepOrigins(coreOutput, [coreOutput])
  if (scope.core) {
    updateIssues('core', collectIssues(coreOutput))
  } else {
    collectIssues(coreOutput)
  }

  if (scope.core) {
    fs.mkdirSync(path.dirname(coreOutputFile), { recursive: true })
    fs.writeFileSync(coreOutputFile, JSON.stringify(coreOutput, null, 2) + '\n')
  }

  const coreCount = Object.keys(coreOutput).length
  console.log(
    `features: ${coreCount} extracted, ${coreTotalReturns} return members total` +
      (enrichedCount
        ? `, ${enrichedCount} descriptions inherited from blueprints`
        : '')
  )

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const featuresDir = path.join(adapterDir, 'src/features')
    const factoriesDir = fs.existsSync(featuresDir)
      ? featuresDir
      : path.join(adapterDir, 'src/factories')

    if (!fs.existsSync(factoriesDir)) {
      console.log(`  ${adapterName}: no features/factories directory, skipping`)
      continue
    }

    const { program: adapterProgram, checker: adapterChecker } =
      createProgram(adapterDir)

    const { output: adapterOutput, totalReturns: adapterTotalReturns } =
      extractFactories(adapterProgram, adapterChecker, factoriesDir)

    const adapterBlueprintsPath = [
      path.join(GENERATED_DIR, `${adapterName}/blueprints.json`),
      path.join(GENERATED_DIR, `${adapterName}/blueprints.json`),
    ].find((file) => fs.existsSync(file))
    const adapterEnriched = enrichFromUsingBlueprints(
      adapterOutput,
      adapterBlueprintsPath
    )
    resolveDepOrigins(adapterOutput, [coreOutput, adapterOutput])
    updateIssues(adapterName, collectIssues(adapterOutput))

    const outputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    const outputFile = path.join(outputDir, 'features.json')

    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(outputFile, JSON.stringify(adapterOutput, null, 2) + '\n')

    const adapterCount = Object.keys(adapterOutput).length
    console.log(
      `  ${adapterName}: ${adapterCount} extracted, ${adapterTotalReturns} return members total` +
        (adapterEnriched
          ? `, ${adapterEnriched} descriptions inherited from blueprints`
          : '')
    )
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

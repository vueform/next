import * as fs from 'node:fs'
import * as path from 'node:path'

import * as ts from 'typescript'

import { corePackage, nonCoreAdapters } from '../lib/adapters'
import { createProgram } from '../lib/extract'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)

const EXCLUDED_FILES = new Set(['index.ts', 'createContext.ts'])

// =============== TYPES ================

interface ParamInfo {
  type: string | Record<string, any>
  description: string
  required?: true
}

interface OverloadInfo {
  description: string
  params: Record<string, ParamInfo>
  returns: { type: string }
}

interface FunctionEntry {
  type: 'function'
  description: string
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

interface ContextEntry {
  description: string
  params?: Record<string, any>
  returns?: Record<string, any>
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

// ============ TYPE HELPERS ============

const TYPE_FORMAT_FLAGS =
  ts.TypeFormatFlags.NoTruncation |
  ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

function isFunctionLikeType(type: ts.Type): boolean {
  const inner = type.getNonNullableType()
  return !inner.isUnion() && inner.getCallSignatures().length > 0
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

// ======= INLINE OBJECT EXPANSION ========

function expandObjectType(
  type: ts.Type,
  checker: ts.TypeChecker
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
      result[propSym.name] = entry
    } else if (sigs.length === 1 && isFunctionLikeType(propType)) {
      const entry: any = { type: 'function', description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      const params = extractSigParams(sigs[0], propDecl, checker)
      if (params && Object.keys(params).length) entry.params = params
      const ret = getFunctionReturnTypeFromSig(sigs[0], checker)
      if (ret) entry.returns = { type: ret }
      result[propSym.name] = entry
    } else {
      const typeText = getPropertyTypeText(propSym, propDecl, checker)
      const entry: any = { type: typeText, description }
      if (ts.isPropertySignature(propDecl) && !propDecl.questionToken)
        entry.required = true
      result[propSym.name] = entry
    }
  }

  return result
}

function isInlineObjectParam(param: ts.ParameterDeclaration): boolean {
  if (!param.type) return false
  return ts.isTypeLiteralNode(param.type)
}

// ===== FUNCTION DECLARATION PROCESSING =====

function processFunctionDeclaration(
  funcDecl: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): FunctionEntry {
  const description = getNodeJSDocDescription(funcDecl)
  const jsdoc = getJSDocParamDescriptions(funcDecl)
  const entry: FunctionEntry = { type: 'function', description }

  const params: Record<string, ParamInfo> = {}

  for (const param of funcDecl.parameters) {
    if (!ts.isIdentifier(param.name) && !ts.isObjectBindingPattern(param.name))
      continue

    const paramName = ts.isIdentifier(param.name)
      ? param.name.text.replace(/^_/, '')
      : 'options'
    const paramDesc =
      jsdoc.get(paramName) ||
      jsdoc.get(ts.isIdentifier(param.name) ? param.name.text : '') ||
      ''
    const isOptional = !!param.questionToken || !!param.initializer

    if (isInlineObjectParam(param)) {
      const paramType = checker.getTypeAtLocation(param)
      const expanded = expandObjectType(paramType, checker)
      const paramEntry: ParamInfo = { type: expanded, description: paramDesc }
      if (!isOptional) paramEntry.required = true
      params[paramName] = paramEntry
    } else {
      let typeText: string
      if (param.type) {
        typeText = param.type.getText(sourceFile).replace(/\s+/g, ' ').trim()
      } else {
        const paramType = checker.getTypeAtLocation(param)
        typeText = checker.typeToString(paramType, param, TYPE_FORMAT_FLAGS)
      }

      const paramEntry: ParamInfo = { type: typeText, description: paramDesc }
      if (!isOptional) paramEntry.required = true
      params[paramName] = paramEntry
    }
  }

  if (Object.keys(params).length) {
    entry.params = params
  }

  const sig = checker.getSignatureFromDeclaration(funcDecl)
  if (sig) {
    const returnTypeStr = getFunctionReturnTypeFromSig(sig, checker)
    entry.returns = { type: returnTypeStr }
  }

  return entry
}

// ===== RE-EXPORTED BINDING PROCESSING =====

function processReExportedBinding(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): FunctionEntry | undefined {
  const symType = checker.getTypeOfSymbolAtLocation(symbol, sourceFile)

  if (!isFunctionLikeType(symType)) return undefined

  const sigs = symType.getNonNullableType().getCallSignatures()
  if (sigs.length === 0) return undefined

  const description = getSymbolDescription(symbol, checker)
  const entry: FunctionEntry = { type: 'function', description }

  const sig = sigs[0]
  const sigDecl = sig.getDeclaration()
  const jsdoc = getJSDocParamDescriptions(sigDecl)
  const params: Record<string, ParamInfo> = {}

  for (const param of sig.getParameters()) {
    const paramDecl = param.getDeclarations()?.[0]
    const paramType = checker.getTypeOfSymbolAtLocation(
      param,
      paramDecl ?? sourceFile
    )
    const isOptional =
      paramDecl &&
      ts.isParameter(paramDecl) &&
      (!!paramDecl.questionToken || !!paramDecl.initializer)

    const paramEntry: ParamInfo = {
      type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
      description: jsdoc.get(param.name) ?? '',
    }
    if (!isOptional) paramEntry.required = true

    params[param.name] = paramEntry
  }

  if (Object.keys(params).length) {
    entry.params = params
  }

  const returnTypeStr = getFunctionReturnTypeFromSig(sig, checker)
  entry.returns = { type: returnTypeStr }

  return entry
}

// ============= EXTRACTION =============

function extractContexts(
  pkgDir: string,
  contextsDir: string
): Record<string, ContextEntry> {
  const { program, checker } = createProgram(pkgDir)

  const files = fs
    .readdirSync(contextsDir)
    .filter((f) => f.endsWith('.ts') && !EXCLUDED_FILES.has(f))
    .sort()

  const output: Record<string, ContextEntry> = {}

  for (const file of files) {
    const moduleName = file.replace(/\.ts$/, '')
    const filePath = path.join(contextsDir, file)
    const sourceFile = program.getSourceFile(filePath)

    if (!sourceFile) {
      throw new Error(`File not found in program: ${file}`)
    }

    const moduleEntries: Record<string, FunctionEntry> = {}
    const processedNames = new Set<string>()

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name && node.body) {
        const modifiers = ts.getCombinedModifierFlags(node)
        if (!(modifiers & ts.ModifierFlags.Export)) return

        const funcName = node.name.text
        moduleEntries[funcName] = processFunctionDeclaration(
          node,
          checker,
          sourceFile
        )
        processedNames.add(funcName)
      }

      if (
        ts.isExportDeclaration(node) &&
        node.exportClause &&
        ts.isNamedExports(node.exportClause)
      ) {
        for (const specifier of node.exportClause.elements) {
          const exportedName = specifier.name.text
          if (processedNames.has(exportedName)) continue

          const sym = checker.getSymbolAtLocation(
            specifier.propertyName ?? specifier.name
          )
          if (!sym) continue

          const resolved =
            sym.flags & ts.SymbolFlags.Alias
              ? checker.getAliasedSymbol(sym)
              : sym
          const entry = processReExportedBinding(resolved, checker, sourceFile)
          if (entry) {
            moduleEntries[exportedName] = entry
            processedNames.add(exportedName)
          }
        }
      }
    })

    // The published shape: the context's creation params and what consuming
    // it returns — not the raw export list.
    const pascal =
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1) + 'Context'
    const createFn = moduleEntries[`create${pascal}`]
    const useFn = moduleEntries[`use${pascal}`]

    if (createFn || useFn) {
      const entry: ContextEntry = {
        description: createFn?.description ?? useFn?.description ?? '',
      }
      if (createFn?.params) entry.params = createFn.params
      if (useFn?.returns) {
        entry.returns = {
          ...useFn.returns,
          ...(useFn.description ? { description: useFn.description } : {}),
        }
      }
      output[moduleName] = entry
    }
  }

  return output
}

// ================ MAIN ================

function main() {
  const coreContextsDir = path.join(CORE_DIR, 'src/contexts')
  const coreContexts = extractContexts(CORE_DIR, coreContextsDir)

  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(GENERATED_DIR, 'contexts.json'),
      JSON.stringify(coreContexts, null, 2) + '\n'
    )
  }

  console.log(`contexts: ${Object.keys(coreContexts).length} contexts`)

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterContextsDir = path.join(adapterDir, 'src/contexts')

    if (!fs.existsSync(adapterContextsDir)) {
      console.log(`${adapterName}/contexts: skipped (no contexts directory)`)
      continue
    }

    const adapterContexts = extractContexts(adapterDir, adapterContextsDir)

    const adapterOnly: Record<string, ContextEntry> = {}
    for (const [contextName, entry] of Object.entries(adapterContexts)) {
      if (!coreContexts[contextName]) {
        adapterOnly[contextName] = entry
      }
    }

    if (!Object.keys(adapterOnly).length) {
      console.log(`${adapterName}/contexts: skipped (no adapter-only contexts)`)
      continue
    }

    const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterOutputDir, 'contexts.json'),
      JSON.stringify(adapterOnly, null, 2) + '\n'
    )

    console.log(
      `${adapterName}/contexts: ${Object.keys(adapterOnly).length} contexts`
    )
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

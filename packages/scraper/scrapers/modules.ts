import * as fs from 'node:fs'
import * as path from 'node:path'
import * as ts from 'typescript'
import { corePackage, nonCoreAdapters } from '../lib/adapters'
import { generatedDir, monorepoRoot } from '../lib/paths'
import { parseScope } from '../lib/scope'

// =============== PATHS ================

const { scope } = parseScope(process.argv.slice(2))
const ROOT = monorepoRoot
const GENERATED_DIR = generatedDir
const CORE_DIR = path.join(ROOT, corePackage)

// =============== TYPES ================

interface ParamInfo {
  type: string
  description: string
}

interface MemberInfo {
  type: string
  description: string
  private?: true
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

interface CallInfo {
  description: string
  params?: Record<string, ParamInfo>
  returns?: { type: string }
}

interface ModuleEntry {
  description: string
  interface: string
  api: Record<string, MemberInfo>
  call?: CallInfo
}

// ============= TS PROGRAM =============

function createProgram(pkgDir: string) {
  const configPath = path.join(pkgDir, '.tsconfig', 'tsconfig.dev.json')
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
    const text = decl.type
      .getText(decl.getSourceFile())
      .replace(/\s+/g, ' ')
      .trim()

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
    params[param.name] = {
      type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
      description: jsdoc.get(param.name) ?? '',
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

// =========== MODULE EXTRACTION ===========

function extractModuleInterface(
  checker: ts.TypeChecker,
  interfaceSymbol: ts.Symbol,
  _interfaceDecl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration
): { members: Record<string, MemberInfo>; call?: CallInfo } {
  const members: Record<string, MemberInfo> = {}
  let call: CallInfo | undefined

  const type = checker.getDeclaredTypeOfSymbol(interfaceSymbol)

  // Extract call signatures (for callable interfaces like DateModule)
  const callSigs = type.getCallSignatures()
  if (callSigs.length > 0) {
    const sig = callSigs[0]
    const sigDecl = sig.getDeclaration()
    const description = getNodeJSDocDescription(sigDecl)
    const jsdoc = getJSDocParamDescriptions(sigDecl)
    const params: Record<string, ParamInfo> = {}

    for (const param of sig.getParameters()) {
      const paramType = checker.getTypeOfSymbolAtLocation(param, sigDecl)
      params[param.name] = {
        type: checker.typeToString(paramType, undefined, TYPE_FORMAT_FLAGS),
        description: jsdoc.get(param.name) ?? '',
      }
    }

    let returnType = checker.getReturnTypeOfSignature(sig)
    if (returnType.isTypeParameter()) {
      returnType =
        returnType.getDefault() ?? returnType.getConstraint() ?? returnType
    }

    call = { description }
    if (Object.keys(params).length) call.params = params
    const retStr = checker.typeToString(
      returnType,
      undefined,
      TYPE_FORMAT_FLAGS
    )
    if (retStr && retStr !== 'void') call.returns = { type: retStr }
  }

  // Extract property members
  for (const propSym of type.getProperties()) {
    const decl = propSym.getDeclarations()?.[0]
    if (!decl) continue

    const { typeText, isFunction } = getPropertyTypeInfo(propSym, decl, checker)
    const description = getSymbolDescription(propSym, checker)

    const member: MemberInfo = { type: typeText, description }

    if (hasJSDocTag(decl, 'private')) {
      member.private = true
    }

    if (isFunction) {
      const resolved = checker.getTypeOfSymbolAtLocation(propSym, decl)
      const params = getFunctionParams(resolved, decl, checker)
      if (params) member.params = params
      const ret = getFunctionReturnType(resolved, checker)
      if (ret) member.returns = { type: ret }
    }

    members[propSym.name] = member
  }

  return { members, call }
}

function findModuleInterface(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile
):
  | {
      symbol: ts.Symbol
      decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration
      name: string
    }
  | undefined {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!moduleSymbol) return undefined

  const exports = checker.getExportsOfModule(moduleSymbol)

  for (const exp of exports) {
    if (!exp.name.endsWith('Module') || exp.name.endsWith('ModuleOptions')) {
      continue
    }

    let resolved = exp
    if (resolved.flags & ts.SymbolFlags.Alias) {
      resolved = checker.getAliasedSymbol(resolved)
    }

    const decls = resolved.getDeclarations()
    if (!decls) continue

    for (const d of decls) {
      if (ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d)) {
        return { symbol: resolved, decl: d, name: exp.name }
      }
    }
  }

  return undefined
}

// ============= EXTRACTION =============

function extractModules(
  pkgDir: string,
  modulesDir: string
): Record<string, ModuleEntry> {
  const { program, checker } = createProgram(pkgDir)

  const entries = fs.readdirSync(modulesDir, { withFileTypes: true })
  const subdirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const output: Record<string, ModuleEntry> = {}

  for (const dirName of subdirs) {
    const indexPath = path.join(modulesDir, dirName, 'index.ts')
    if (!fs.existsSync(indexPath)) continue

    const sourceFile = program.getSourceFile(indexPath)
    if (!sourceFile) continue

    const found = findModuleInterface(checker, sourceFile)
    if (!found) continue

    const { symbol, decl, name: interfaceName } = found
    const description = getSymbolDescription(symbol, checker)
    const { members, call } = extractModuleInterface(checker, symbol, decl)

    const moduleName = dirName
    const entry: ModuleEntry = {
      description,
      interface: interfaceName,
      api: members,
    }

    if (call) entry.call = call

    output[moduleName] = entry
  }

  return output
}

// ================ MAIN ================

function main() {
  const coreModulesDir = path.join(CORE_DIR, 'src/modules')

  if (!fs.existsSync(coreModulesDir)) {
    throw new Error(`Core modules directory not found: ${coreModulesDir}`)
  }

  const coreModules = extractModules(CORE_DIR, coreModulesDir)

  if (scope.core) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(GENERATED_DIR, 'modules.json'),
      JSON.stringify(coreModules, null, 2) + '\n'
    )
  }

  const moduleCount = Object.keys(coreModules).length
  const memberCount = Object.values(coreModules).reduce(
    (sum, e) => sum + Object.keys(e.api).length,
    0
  )
  console.log(`modules.json: ${moduleCount} modules, ${memberCount} members`)

  for (const [adapterName, adapterDef] of nonCoreAdapters) {
    if (!scope.adapters.includes(adapterName)) continue
    const adapterDir = path.join(ROOT, adapterDef.path)
    const adapterModulesDir = path.join(adapterDir, 'src/modules')

    if (!fs.existsSync(adapterModulesDir)) {
      console.log(`${adapterName}/modules: no modules directory, skipping`)
      continue
    }

    const adapterModules = extractModules(adapterDir, adapterModulesDir)

    if (!Object.keys(adapterModules).length) {
      console.log(
        `${adapterName}/modules: no adapter-specific modules, skipping`
      )
      continue
    }

    const adapterOutputDir = path.join(GENERATED_DIR, `_${adapterName}`)
    fs.mkdirSync(adapterOutputDir, { recursive: true })
    fs.writeFileSync(
      path.join(adapterOutputDir, 'modules.json'),
      JSON.stringify(adapterModules, null, 2) + '\n'
    )

    const count = Object.keys(adapterModules).length
    const members = Object.values(adapterModules).reduce(
      (sum, e) => sum + Object.keys(e.api).length,
      0
    )
    console.log(`${adapterName}/modules: ${count} modules, ${members} members`)
  }
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}

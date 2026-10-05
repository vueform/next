/**
 * Dist manifest snapshot and diff (`pnpm manifest` / `pnpm manifest:diff`):
 * records, per package, every dist file's size, a normalized content hash, and
 * — for JS modules — the export/import topology (the invariant that must
 * survive a bundler swap, unlike formatting-sensitive content hashes). The
 * `.d.ts` surface is additionally concatenated into a human-diffable
 * `<pkg>.dts.txt`. The `.api` extractor output, when present, is snapshotted
 * the same way under the virtual `api` target.
 *
 * Snapshots live in `.baseline/` (committed) and act as the reference the
 * toolchain migration is verified against:
 *
 * pnpm manifest # snapshot current dists into .baseline/ pnpm manifest --from
 * <root> # snapshot another checkout's dists pnpm manifest:diff # compare
 * current dists against .baseline/ pnpm manifest:diff --semantic # ignore
 * hash-only JS changes (reformatting)
 *
 * Both modes accept package ids (e.g. `core primevue`) to narrow the set. The
 * diff exits non-zero on any difference; with `--semantic`, hash-only changes
 * in `.mjs`/`.js` files are reported but tolerated (expected across bundler
 * swaps), while file-list, export/import, `.d.ts`, css and exports-map
 * differences always fail.
 */
import { createHash } from 'node:crypto'
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { dim, discoverPackages, green, red, repoRoot, yellow } from './runner'

interface FileEntry {
  bytes: number
  /**
   * Hash of the whitespace-normalized content.
   */
  hash: string
  /**
   * Exported names (JS modules only); `* from <specifier>` for re-export-alls.
   */
  exports?: string[]
  /**
   * Unique static import/re-export specifiers (JS modules only).
   */
  imports?: string[]
}

interface ExportsMapReport {
  checked: number
  patterns: number
  missing: string[]
}

interface Manifest {
  package: string
  fileCount: number
  exportsMap?: ExportsMapReport
  files: Record<string, FileEntry>
}

const baselineDir = join(repoRoot, '.baseline')

const isJsModule = (path: string) =>
  /\.(mjs|cjs|js)$/.test(path) && !/\.d\.(ts|mts|cts)$/.test(path)

const isDts = (path: string) => /\.d\.(ts|mts|cts)$/.test(path)

const normalize = (content: string) =>
  content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim()

const hashContent = (content: string) =>
  createHash('sha256').update(normalize(content)).digest('hex').slice(0, 16)

/**
 * Static export names and import specifiers of a JS module, via the TypeScript
 * parser (syntax only, no type information).
 */
function moduleSurface(path: string, content: string) {
  const source = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.JS
  )
  const exports = new Set<string>()
  const imports = new Set<string>()

  const hasExportModifier = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    ts
      .getModifiers(node)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      imports.add((statement.moduleSpecifier as ts.StringLiteral).text)
    } else if (ts.isExportDeclaration(statement)) {
      const from =
        statement.moduleSpecifier &&
        (statement.moduleSpecifier as ts.StringLiteral).text
      if (from) imports.add(from)
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          exports.add(element.name.text)
        }
      } else if (
        statement.exportClause &&
        ts.isNamespaceExport(statement.exportClause)
      ) {
        exports.add(statement.exportClause.name.text)
      } else if (from) {
        exports.add(`* from ${from}`)
      }
    } else if (ts.isExportAssignment(statement)) {
      exports.add('default')
    } else if (hasExportModifier(statement)) {
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            exports.add(declaration.name.text)
          }
        }
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        const isDefault = ts
          .getModifiers(statement)
          ?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
        exports.add(isDefault ? 'default' : statement.name.text)
      }
    }
  }
  return {
    exports: [...exports].sort(),
    imports: [...imports].sort(),
  }
}

function listFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listFiles(path))
    else if (entry.isFile()) files.push(path)
  }
  return files
}

/**
 * Every relative path in an `exports`-style map (nested condition objects),
 * split into concrete paths (existence-checked) and `*` patterns (counted).
 */
function exportsMapReport(
  manifest: Record<string, any>,
  pkgDir: string
): ExportsMapReport {
  const targets = new Set<string>()
  const walk = (value: unknown) => {
    if (typeof value === 'string') {
      if (value.startsWith('./')) targets.add(value)
    } else if (value && typeof value === 'object') {
      for (const nested of Object.values(value)) walk(nested)
    }
  }
  walk(manifest.exports)
  for (const key of ['main', 'module', 'types'] as const) {
    if (typeof manifest[key] === 'string') targets.add(manifest[key])
  }
  const report: ExportsMapReport = { checked: 0, patterns: 0, missing: [] }
  for (const target of [...targets].sort()) {
    if (target.includes('*')) {
      report.patterns++
      continue
    }
    report.checked++
    if (!existsSync(join(pkgDir, target))) report.missing.push(target)
  }
  return report
}

interface Target {
  id: string
  name: string
  /**
   * Directory whose files are recorded (dist, or `.api` for the api target).
   */
  dir: string
  /**
   * Package dir for the exports-map check; absent for the api target.
   */
  pkgDir?: string
  manifest?: Record<string, any>
}

function discoverTargets(root: string): Target[] {
  const targets: Target[] = []
  for (const entry of readdirSync(join(root, 'packages'), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue
    const pkgDir = join(root, 'packages', entry.name)
    let manifest: Record<string, any>
    try {
      manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
    } catch {
      continue
    }
    targets.push({
      id: entry.name,
      name: manifest.name,
      dir: join(pkgDir, 'dist'),
      pkgDir,
      manifest,
    })
  }
  targets.sort((a, b) => a.id.localeCompare(b.id))
  targets.push({ id: 'api', name: '.api', dir: join(root, '.api') })
  return targets
}

function buildManifest(target: Target): Manifest {
  const files: Record<string, FileEntry> = {}
  const dtsChunks: string[] = []
  for (const path of listFiles(target.dir).sort()) {
    const relPath = relative(target.dir, path)
    // Incremental-typecheck artifact (utils' `check` writes it into dist):
    // not a build output, ignored so it can't dirty the diff gate.
    if (relPath.endsWith('.tsbuildinfo')) continue
    const content = readFileSync(path, 'utf8')
    const entry: FileEntry = {
      bytes: Buffer.byteLength(content),
      hash: hashContent(content),
    }
    if (isJsModule(relPath)) {
      const surface = moduleSurface(relPath, content)
      entry.exports = surface.exports
      entry.imports = surface.imports
    }
    if (isDts(relPath)) dtsChunks.push(`//// ${relPath}\n${content}`)
    files[relPath] = entry
  }
  return {
    package: target.name,
    fileCount: Object.keys(files).length,
    ...(target.pkgDir && target.manifest
      ? { exportsMap: exportsMapReport(target.manifest, target.pkgDir) }
      : {}),
    files,
    // Written separately so the JSON stays line-diffable:
    ...(dtsChunks.length ? { __dts: dtsChunks.join('\n') } : {}),
  } as Manifest & { __dts?: string }
}

const setDiff = (before: string[] = [], after: string[] = []) => ({
  removed: before.filter((item) => !after.includes(item)),
  added: after.filter((item) => !before.includes(item)),
})

interface DiffStats {
  semantic: number
  contentOnly: number
}

function diffManifest(
  baseline: Manifest,
  current: Manifest,
  semanticMode: boolean
): DiffStats {
  const stats: DiffStats = { semantic: 0, contentOnly: 0 }
  const lines: string[] = []
  const basePaths = Object.keys(baseline.files)
  const currentPaths = Object.keys(current.files)

  for (const path of basePaths) {
    if (!(path in current.files)) {
      lines.push(red(`  - ${path} (removed)`))
      stats.semantic++
    }
  }
  for (const path of currentPaths) {
    if (!(path in baseline.files)) {
      lines.push(red(`  + ${path} (added)`))
      stats.semantic++
    }
  }

  let bytesBefore = 0
  let bytesAfter = 0
  for (const path of basePaths) {
    const before = baseline.files[path]
    const after = current.files[path]
    if (!after) continue
    bytesBefore += before.bytes
    bytesAfter += after.bytes

    const exportsDiff = setDiff(before.exports, after.exports)
    const importsDiff = setDiff(before.imports, after.imports)
    for (const name of exportsDiff.removed) {
      lines.push(red(`  ${path}: export removed: ${name}`))
      stats.semantic++
    }
    for (const name of exportsDiff.added) {
      lines.push(yellow(`  ${path}: export added: ${name}`))
      stats.semantic++
    }
    for (const name of importsDiff.removed) {
      lines.push(red(`  ${path}: import removed: ${name}`))
      stats.semantic++
    }
    for (const name of importsDiff.added) {
      lines.push(yellow(`  ${path}: import added: ${name}`))
      stats.semantic++
    }

    if (before.hash !== after.hash) {
      if (isJsModule(path) && semanticMode) {
        stats.contentOnly++
      } else if (isJsModule(path)) {
        stats.contentOnly++
        lines.push(dim(`  ${path}: content changed`))
      } else {
        // d.ts / css / scss shims: content is the surface — always semantic.
        lines.push(red(`  ${path}: content changed`))
        stats.semantic++
      }
    }
  }

  // Only NEWLY missing exports-map targets fail the diff — targets already
  // missing in the baseline are pre-existing gaps, recorded but not a
  // regression of the change under test.
  const knownMissing = baseline.exportsMap?.missing ?? []
  for (const target of current.exportsMap?.missing ?? []) {
    if (knownMissing.includes(target)) continue
    lines.push(red(`  exports map target missing: ${target}`))
    stats.semantic++
  }

  if (lines.length || stats.contentOnly) {
    console.log(`\n${current.package}`)
    for (const line of lines) console.log(line)
    if (stats.contentOnly) {
      console.log(
        dim(
          `  ${stats.contentOnly} JS file(s) with content-only changes` +
            (semanticMode ? ' (tolerated by --semantic)' : '')
        )
      )
    }
    const delta = bytesAfter - bytesBefore
    if (delta !== 0) {
      const sign = delta > 0 ? '+' : ''
      console.log(dim(`  total bytes: ${sign}${delta}`))
    }
  }
  return stats
}

function main() {
  const args = process.argv.slice(2)
  const diffMode = args.includes('--diff')
  const semanticMode = args.includes('--semantic')
  const fromArg = args.find((arg) => arg.startsWith('--from'))
  const fromRoot = fromArg
    ? resolve(
        fromArg.includes('=')
          ? fromArg.split('=')[1]
          : args[args.indexOf(fromArg) + 1]
      )
    : repoRoot
  const selectors = args.filter(
    (arg, index) =>
      !arg.startsWith('--') &&
      !(
        fromArg &&
        !fromArg.includes('=') &&
        index === args.indexOf(fromArg) + 1
      )
  )

  const known = new Set(discoverPackages().map((pkg) => pkg.id))
  for (const selector of selectors) {
    if (selector !== 'api' && !known.has(selector)) {
      console.error(`Unknown package "${selector}".`)
      process.exit(1)
    }
  }

  const targets = discoverTargets(fromRoot).filter(
    (target) => selectors.length === 0 || selectors.includes(target.id)
  )

  if (diffMode) {
    let semantic = 0
    let contentOnly = 0
    let compared = 0
    for (const target of targets) {
      const baselinePath = join(baselineDir, `${target.id}.manifest.json`)
      if (!existsSync(baselinePath)) continue
      if (!existsSync(target.dir)) {
        console.log(red(`\n${target.name}: dist missing (baseline exists)`))
        semantic++
        continue
      }
      compared++
      const baseline: Manifest = JSON.parse(readFileSync(baselinePath, 'utf8'))
      const current = buildManifest(target) as Manifest & { __dts?: string }
      delete (current as { __dts?: string }).__dts
      const stats = diffManifest(baseline, current, semanticMode)
      semantic += stats.semantic
      contentOnly += stats.contentOnly
    }
    if (semantic === 0 && (semanticMode || contentOnly === 0)) {
      console.log(
        green(
          `\n✓ ${compared} manifest(s) match` +
            (semanticMode && contentOnly
              ? ` (${contentOnly} content-only JS changes tolerated)`
              : '')
        )
      )
      return
    }
    console.error(
      red(
        `\n✗ manifest diff: ${semantic} semantic difference(s), ${contentOnly} content-only`
      )
    )
    process.exit(1)
  }

  mkdirSync(baselineDir, { recursive: true })
  let written = 0
  for (const target of targets) {
    if (!existsSync(target.dir)) {
      console.log(
        yellow(`${target.id}: no ${relative(fromRoot, target.dir)} — skipped`)
      )
      continue
    }
    const manifest = buildManifest(target) as Manifest & { __dts?: string }
    const dts = manifest.__dts
    delete manifest.__dts
    writeFileSync(
      join(baselineDir, `${target.id}.manifest.json`),
      `${JSON.stringify(manifest, null, 2)}\n`
    )
    if (dts)
      writeFileSync(join(baselineDir, `${target.id}.dts.txt`), `${dts}\n`)
    console.log(
      green(`${target.id}: ${manifest.fileCount} files`) +
        (manifest.exportsMap?.missing.length
          ? red(
              ` — ${manifest.exportsMap.missing.length} exports target(s) MISSING`
            )
          : '')
    )
    written++
  }
  console.log(
    dim(`\nWrote ${written} manifest(s) to .baseline/ (from ${fromRoot}).`)
  )
}

main()

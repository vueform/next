/**
 * Shared runner for SFC template type tests — named-test reporting for the
 * `*.vue` files in a package's `tests/dts` directory. A raw-source asset
 * directory (like `visual-test`), outside `src` on purpose: it imports `vitest`
 * (ESM-only), which this package's CJS build can't compile or require — the
 * `./type-test` export serves it as-is, the consuming test run compiles it
 * through Vite, and the consumer's type-test gate typechecks it.
 *
 * Usage, from a `tests/dts/vue-sfc.test.ts` (picked up by the vitest factory's
 * `test-dts` project):
 *
 * ```ts
 * import { dirname } from 'node:path'
 * import { fileURLToPath } from 'node:url'
 * import { vueSfcTypeTests } from '@vueform/utils/type-test'
 *
 * vueSfcTypeTests({ dir: dirname(fileURLToPath(import.meta.url)) })
 * ```
 *
 * The package's `tests/dts/tsconfig.json` must exclude `*.vue` (so the
 * typecheck pass doesn't double-report them as unnamed source errors) and a
 * sibling `tsconfig.vue.json` must re-include them; this runner typechecks that
 * program with one `vue-tsc` run and maps the diagnostics to tests:
 *
 * - every `<!-- ✅: … -->` / `<!-- ❌: … -->` template marker becomes its own test,
 *   failing on any diagnostic between it and the next marker (a stale
 *   `@vue-expect-error` is a diagnostic too, so ❌ cases cannot rot silently);
 * - a file without markers gets a single whole-file test;
 * - diagnostics outside every marked range (e.g. in `<script setup>`) land in the
 *   file's "outside marked cases" test.
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { promisify } from 'node:util'

import { beforeAll, describe, expect, test } from 'vitest'

export interface VueSfcTypeTestsOptions {
  /**
   * Absolute path of the directory holding the `*.vue` type tests and their
   * `tsconfig.vue.json` (typically the caller's own directory).
   */
  dir: string
  /**
   * The owning package's root. Defaults to the nearest ancestor of `dir` with a
   * `package.json`.
   */
  packageDir?: string
  /**
   * The SFC program's tsconfig, absolute. Defaults to
   * `<dir>/tsconfig.vue.json`.
   */
  tsconfig?: string
}

interface Diagnostic {
  /**
   * Package-relative path as vue-tsc prints it, e.g.
   * `tests/dts/select-context.vue`.
   */
  file: string
  line: number
  text: string
}

interface SfcCase {
  name: string
  start: number
  end: number
}

function nearestPackageDir(dir: string): string {
  let current = dir
  while (true) {
    if (existsSync(join(current, 'package.json'))) return current
    const parent = dirname(current)
    if (parent === current) return dir
    current = parent
  }
}

/**
 * One case per `✅` / `❌` marker; a case spans from its marker to the line
 * before the next one.
 */
function parseCases(source: string): SfcCase[] {
  const markers: { name: string; line: number }[] = []
  source.split('\n').forEach((line, index) => {
    const marker = line.match(/<!--\s*(✅|❌)\s*:?\s*(.*?)\s*-->/u)
    if (marker) {
      markers.push({ name: `${marker[1]} ${marker[2]}`, line: index + 1 })
    }
  })
  return markers.map((marker, index) => ({
    name: marker.name,
    start: marker.line,
    end: markers[index + 1] ? markers[index + 1].line - 1 : Infinity,
  }))
}

/**
 * `path(line,col): error TScode: message`, with indented continuation lines
 * folded into the preceding diagnostic.
 */
function parseDiagnostics(output: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  for (const line of output.split('\n')) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\): (error TS\d+: .*)$/)
    if (match) {
      diagnostics.push({
        file: match[1],
        line: Number(match[2]),
        text: `${match[2]}:${match[3]} ${match[4]}`,
      })
    } else if (diagnostics.length && line.startsWith(' ') && line.trim()) {
      diagnostics[diagnostics.length - 1].text += `\n    ${line.trim()}`
    }
  }
  return diagnostics
}

/**
 * Registers the describe/test blocks for every `*.vue` file in `options.dir`.
 * Call at the top level of a `*.test.ts` file.
 */
export function vueSfcTypeTests(options: VueSfcTypeTestsOptions): void {
  const { dir } = options
  const packageDir = options.packageDir ?? nearestPackageDir(dir)
  const tsconfig = options.tsconfig ?? join(dir, 'tsconfig.vue.json')

  let diagnostics: Diagnostic[] = []

  beforeAll(async () => {
    try {
      await promisify(execFile)(
        'pnpm',
        ['exec', 'vue-tsc', '--noEmit', '-p', tsconfig],
        { cwd: packageDir, maxBuffer: 16 * 1024 * 1024 }
      )
    } catch (error) {
      const { stdout, stderr } = error as { stdout?: string; stderr?: string }
      diagnostics = parseDiagnostics(`${stdout ?? ''}\n${stderr ?? ''}`)
      if (diagnostics.length === 0) throw error
    }
  }, 180_000)

  const vueFiles = readdirSync(dir)
    .filter((file) => file.endsWith('.vue'))
    .sort()

  const report = (matched: Diagnostic[]) =>
    matched.map((diagnostic) => diagnostic.text).join('\n')

  for (const file of vueFiles) {
    const cases = parseCases(readFileSync(join(dir, file), 'utf8'))
    const relPath = relative(packageDir, join(dir, file))

    describe(file, () => {
      const within = (predicate: (line: number) => boolean) =>
        diagnostics.filter(
          (diagnostic) =>
            diagnostic.file === relPath && predicate(diagnostic.line)
        )

      if (cases.length === 0) {
        test('template typechecks', () => {
          expect(report(within(() => true))).toBe('')
        })
        return
      }

      for (const sfcCase of cases) {
        test(sfcCase.name, () => {
          expect(
            report(
              within((line) => line >= sfcCase.start && line <= sfcCase.end)
            )
          ).toBe('')
        })
      }

      test('outside marked cases', () => {
        expect(report(within((line) => line < cases[0].start))).toBe('')
      })
    })
  }

  test('no stray diagnostics outside the SFC tests', () => {
    const known = new Set(
      vueFiles.map((file) => relative(packageDir, join(dir, file)))
    )
    expect(
      report(diagnostics.filter((diagnostic) => !known.has(diagnostic.file)))
    ).toBe('')
  })
}

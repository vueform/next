import {
  replaceWildcardsExpr,
  type ExpressionAdapter,
  type ExpressionEngine,
  type ExpressionModuleOptions,
  isDev,
  isProd,
} from '@vueform/core'
import { Parser } from 'expr-eval-fork'

import * as builtinFunctions from './functions'
import type { ExpressionFunctionContext } from './functions'

// Vueform uses dot notation for array indices (list.0.name) but expr-eval
// uses bracket notation (list[0].name). Trailing `.*` / `.0` must convert
// too (`SUM(amounts.*)` → `SUM(amounts[*])`); `\b` cannot, because `*` is
// not a word character.
function dotToBracket(expression: string): string {
  return expression.replace(/\.(\d+|\*)(?=\.|$|[^a-zA-Z0-9_-])/g, '[$1]')
}

// expr-eval's variables({ withMembers: true }) doesn't traverse into
// bracket-accessed indices. Converting to dot-notation placeholders
// (list[0].name → list._0_.name) makes them look like regular member
// access so they appear in the extracted variable list.
function bracketToPlaceholder(expression: string): string {
  return expression
    .replace(/\[([0-9*])+\]/g, '._$1_')
    .replace(/\[([0-9*])+\]\./g, '._$1_.')
}

function placeholderToDot(path: string): string {
  return path.replace(/\._([0-9]+)_/g, '.$1').replace(/\._([0-9]+)_\./g, '.$1.')
}

// expr-eval only recognises lowercase `and`/`or`/`not`. Normalise common
// uppercase variants (AND, OR, NOT) so users can write either form.
function normalizeLogicalOps(expression: string): string {
  return expression
    .replace(/\bAND\b/g, 'and')
    .replace(/\bOR\b/g, 'or')
    .replace(/\bNOT\b/g, 'not')
}

// Shorthand syntax for referencing element props: `path@prop` desugars to
// PROP("path", "prop") and `@prop` to SELF("prop"), e.g.
// `nested.select@selectedLabel` or `@label`. Both the path and the prop may
// contain dot segments; the path may also contain numeric and `*` segments,
// and the prop may contain `[n]` index segments (e.g. `@model[0]`).
const AT_REF_RE =
  /([a-zA-Z_][\w-]*(?:\.(?:[\w-]+|\*))*)?@([a-zA-Z_$][\w$]*(?:\.[\w$]+|\[\d+\])*)/g

// Splitting on string literals keeps quoted content (emails, "@" in plain
// text) untouched by the shorthand desugaring. Odd segments are literals.
const STRING_LITERAL_RE = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/

function desugarAtRefs(expression: string): string {
  if (!expression.includes('@')) return expression

  return expression
    .split(STRING_LITERAL_RE)
    .map((segment, i) =>
      i % 2 === 1
        ? segment
        : segment.replace(AT_REF_RE, (_, path, prop) =>
            path ? `PROP("${path}", "${prop}")` : `SELF("${prop}")`
          )
    )
    .join('')
}

const QUOTED_ARGS_RE = /\b(SELF|PROP)\(([^)]*)\)/g

function autoQuoteFunctionArgs(expression: string): string {
  return expression.replace(QUOTED_ARGS_RE, (_, func, args) => {
    const quoted = args
      .split(',')
      .map((a: string) => {
        a = a.trim()
        return /^["']/.test(a) ? a : `"${a}"`
      })
      .join(', ')
    return `${func}(${quoted})`
  })
}

const WILDCARD_RE =
  /([a-zA-Z_]\w*(?:\[\d+\](?:\.[a-zA-Z_]\w*)*)*)\[\*\]((?:\.[a-zA-Z_]\w*(?:\[\d+\])*)*)/g

/**
 * Replaces wildcard array paths (`items[*].price`) with a comma-separated list
 * of concrete indexed paths (`items[0].price, items[1].price, …`) by inspecting
 * the live form data.
 *
 * This is necessary because expr-eval has no concept of iterating over arrays.
 * Expressions like `SUM(items[*].price)` must be rewritten to
 * `SUM(items[0].price, items[1].price, …)` before the parser can evaluate them.
 * When the referenced array is empty the wildcard is replaced with `0` so
 * aggregate functions still receive a valid operand.
 */
function expandWildcards(
  expression: string,
  data: Record<string, any>,
  resolvePath?: (dotPath: string) => string | undefined
): string {
  if (!expression.includes('[*]')) return expression

  const patterns = new Map<string, { arrayPath: string; suffix: string }>()
  let match

  while ((match = WILDCARD_RE.exec(expression)) !== null) {
    patterns.set(match[0], { arrayPath: match[1], suffix: match[2] })
  }

  let result = expression

  for (const [pattern, { arrayPath, suffix }] of patterns) {
    const dotPath = arrayPath.replace(/\[(\d+)\]/g, '.$1')
    let arr: any = readPath(data, dotPath)

    // A tree-path root (`billing.items[*]` for a list inside a data-less
    // container) misses in the data — resolve it through the element registry
    // to the list's data path, only to count rows; the expanded terms keep the
    // tree spelling and resolve through the same alias step as plain refs.
    if (!Array.isArray(arr) && resolvePath) {
      const aliasPath = resolvePath(dotPath)
      if (aliasPath && aliasPath !== dotPath) {
        arr = readPath(data, aliasPath)
      }
    }

    if (!Array.isArray(arr)) continue

    const expanded =
      arr
        .map((_: any, i: number) => `${arrayPath}[${i}]${suffix}`)
        .join(', ') || '0'

    result = result.split(pattern).join(expanded)
  }

  return result
}

// Reads a dot path (numeric segments included) from plain data.
function readPath(data: Record<string, any>, path: string): any {
  let current: any = data

  for (const key of path.split('.')) {
    if (current == null) return undefined
    current = current[key]
  }

  return current
}

// Writes `value` at a dot path into `target`, cloning each traversed branch so
// the live (reactive) model object underneath is never mutated.
function setAlias(target: Record<string, any>, path: string, value: any): void {
  const segments = path.split('.')
  let current = target

  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i]
    const existing = current[key]

    current[key] = Array.isArray(existing)
      ? existing.slice()
      : existing && typeof existing === 'object'
        ? { ...existing }
        : {}
    current = current[key]
  }

  current[segments[segments.length - 1]] = value
}

/**
 * expr-eval expression adapter: builds the low-level `ExpressionEngine`
 * (single-expression evaluation and path extraction) — the `{…}` chain format,
 * warnings, and normalization are owned by core's `createExpression`.
 * Registered automatically by the `@vueform/expr-eval` plugin, or manually via
 * `config.$expression.adapter = exprEvalAdapter`.
 */
export const exprEvalAdapter: ExpressionAdapter = (
  options: ExpressionModuleOptions,
  vueform
): ExpressionEngine => {
  // The owning instance (for module doorway resolution) plus per-evaluation
  // state — functions read the date / locale modules through the doorways at
  // call time, so install order and registration timing don't matter.
  const evalContext: ExpressionFunctionContext = { vueform }

  const resolvedFunctions: Record<string, Function> = {}

  Object.entries({ ...builtinFunctions, ...options.functions }).forEach(
    ([name, func]) => {
      resolvedFunctions[name] = (func as any)(evalContext)
    }
  )

  const parser = new Parser({
    operators: {
      logical: true,
      comparison: true,
      in: true,
      assignment: false,
    },
  })

  Object.keys(parser.functions).forEach((func) => delete parser.functions[func])

  Object.entries(resolvedFunctions).forEach(([name, func]) => {
    parser.functions[name] = func
    parser.functions[name].toString = () => name
  })

  Object.entries(options.consts || {}).forEach(([name, value]) => {
    parser.consts[name] = value
  })

  const tryParse = (expression: string) => {
    try {
      return parser.parse(expression)
    } catch {
      return undefined
    }
  }

  function evaluate(
    expression: string,
    data?: Record<string, any>,
    context$?: any
  ): string | undefined {
    evalContext.el$ = context$
    // Expression is app-scoped; bind the active form from the resolve context
    // (element.form$ or the form context itself when resolving at form level).
    evalContext.form$ =
      context$?.form$ ??
      (typeof context$?.find === 'function' ? context$ : undefined)

    try {
      const parsed = parse(expression, context$?.path || '', data)

      if (!parsed) return undefined

      const dataPath = context$?.dataPath

      if (containsSelf(parsed, dataPath)) {
        throw new Error(
          `Expression cannot reference its own data path (\`${dataPath}\`)`
        )
      }

      // Tree-path value references: dotted variables that miss in the data
      // are looked up in the element registry (the same lookup `find()` and
      // `PROP()` use) and, when the element's data path differs — a child of
      // a data-less container — its value is aliased into the evaluation data
      // under the tree spelling. Data-first, so resolutions that already work
      // never change.
      let evalData = data || {}
      const form$ = evalContext.form$

      if (form$ && data) {
        for (const variable of valueVarsOf(parsed)) {
          if (!variable.includes('.')) continue

          if (readPath(data, variable) !== undefined) {
            warnIfShadowed(variable)
            continue
          }

          const aliasPath = (form$ as any).find?.(variable)?.dataPath
          if (!aliasPath || aliasPath === variable) continue

          if (dataPath && aliasPath === dataPath) {
            throw new Error(
              `Expression cannot reference its own data path (\`${dataPath}\`)`
            )
          }

          if (evalData === data) evalData = { ...data }
          setAlias(evalData, variable, readPath(data, aliasPath))
        }
      }

      return String((parsed as any).evaluate(evalData))
    } finally {
      evalContext.el$ = undefined
      evalContext.form$ = undefined
    }
  }

  const parse = (
    expression: string,
    path?: string,
    data?: Record<string, any>
  ): unknown | undefined => {
    expression = desugarAtRefs(expression)
    expression = autoQuoteFunctionArgs(expression)
    expression = normalizeLogicalOps(expression)
    expression = dotToBracket(expression)

    if (path) {
      expression = replaceWildcardsExpr(expression, path)
    }

    if (data && expression.includes('[*]')) {
      // The registry resolver is bound only during `evaluate` (evalContext) —
      // `variables()` calls parse without it and skips the alias fallback.
      expression = expandWildcards(
        expression,
        data,
        (dotPath) => (evalContext.form$ as any)?.find?.(dotPath)?.dataPath
      )
    }

    const parsed = tryParse(expression)

    if (!parsed && options.debug !== false && isDev()) {
      console.warn(`[Vueform warn]: Failed to parse expression "${expression}"`)
    }

    return parsed
  }

  const PROP_PATH_RE = /\bPROP\(\s*["']([^"']+)["']/g

  // Element paths referenced through PROP() calls with quoted (or desugared)
  // path arguments. These are string literals in the parsed expression, so
  // `variables()` doesn't report them, yet consumers like expression tracking
  // and circular-reference detection must know about them.
  const extractPropPaths = (parsed: unknown): string[] => {
    const str = (parsed as any).toString()
    if (!str.includes('PROP(')) return []

    const result: string[] = []
    let match

    while ((match = PROP_PATH_RE.exec(str)) !== null) {
      result.push(placeholderToDot(match[1].replace(/\[(\d+)\]/g, '.$1')))
    }

    return result
  }

  const variables = (expression: string, path?: string): string[] => {
    const result: string[] = []

    if (!path) {
      const parsed = parse(expression)
      if (parsed) {
        result.push(...(parsed as any).variables({ withMembers: true }))
        result.push(...extractPropPaths(parsed))
      }
    } else {
      const e = bracketToPlaceholder(
        replaceWildcardsExpr(dotToBracket(desugarAtRefs(expression)), path)
      )
      const parsed = tryParse(e)
      if (parsed) {
        result.push(
          ...(parsed as any)
            .variables({ withMembers: true })
            .map(placeholderToDot)
        )
        result.push(...extractPropPaths(parsed))
      }
    }

    return result
  }

  // Dev-only ambiguity check: a value reference that resolves in the data may
  // ALSO spell a different element's tree path (a child of a data-less
  // container reusing the name). The data value wins — unchanged behavior —
  // but silently, so flag the collision once per path.
  const ambiguityChecked = new Set<string>()

  const warnIfShadowed = (variable: string) => {
    if (isProd() || options.debug === false) return

    const form$ = evalContext.form$ as any
    if (!form$?.find || ambiguityChecked.has(variable)) return

    ambiguityChecked.add(variable)

    const aliasPath = form$.find(variable)?.dataPath
    if (aliasPath && aliasPath !== variable) {
      console.warn(
        `[Vueform warn]: Ambiguous reference "{${variable}}": it resolves ` +
          `as a data path, but a different element's tree path also spells ` +
          `"${variable}" (its data path is "${aliasPath}"). The data value ` +
          `is used — rename one of the fields to disambiguate.`
      )
    }
  }

  // Value variables (PROP() string paths excluded) of an already-parsed
  // expression, as dot paths. Derived from the AST's serialized form — where
  // wildcards are already expanded and row indices resolved — and memoized by
  // it, so the re-parse runs once per distinct expression shape.
  const valueVarsCache = new Map<string, string[]>()

  const valueVarsOf = (parsed: unknown): string[] => {
    const serialized = (parsed as any).toString()
    let vars = valueVarsCache.get(serialized)

    if (!vars) {
      const reparsed = tryParse(bracketToPlaceholder(serialized))
      vars = reparsed
        ? ((reparsed as any)
            .variables({ withMembers: true })
            .map(placeholderToDot) as string[])
        : []
      valueVarsCache.set(serialized, vars)
    }

    return vars
  }

  // The self-reference guard works on the parsed AST's serialized form (post
  // desugar/normalize), so it lives engine-side; `evaluate` throws and core's
  // warning queue handles it like any other evaluation error.
  const containsSelf = (parsed: unknown, dataPath?: string) =>
    !dataPath
      ? false
      : variables((parsed as any).toString(), dataPath).includes(dataPath)

  return {
    evaluate,
    variables,
  }
}

/**
 * @deprecated Use `exprEvalAdapter`.
 */
export const $expression = exprEvalAdapter

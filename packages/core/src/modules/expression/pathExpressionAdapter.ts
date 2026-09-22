import { get, warn, isDev } from '~/utils'
import type { ExpressionAdapter, ExpressionEngine } from './types'

let warnedUnsupported = false

const SIMPLE_PATH_RE = /^[A-Za-z_$][\w$]*(?:\.(?:[A-Za-z_$][\w$]*|\d+))*$/

function warnUnsupported() {
  if (warnedUnsupported) return

  warnedUnsupported = true

  if (isDev()) {
    warn(
      'Operators, function calls, and other expression ' +
        'syntax require an expression engine. Install `@vueform/expr-eval` ' +
        'and register it via `createVueform({ plugins: [exprEval()] })`.'
    )
  }
}

function isSimplePath(expression: string) {
  return SIMPLE_PATH_RE.test(expression)
}

/**
 * The built-in path-only expression adapter: no dependencies, resolves simple
 * `{path}` interpolation against form data (`name`, `user.name`,
 * `list.0.name`). Operators, function calls, and other syntax are left literal
 * and warn once in dev to install `@vueform/expr-eval`. Register it via
 * `$expression: { adapter: pathExpressionAdapter }` (the ui / primevue entries
 * do so by default).
 */
export const pathExpressionAdapter: ExpressionAdapter = (options) => {
  // Dev-only: paths already flagged (or cleared) by the ambiguity check below.
  const ambiguityChecked = new Set<string>()

  const evaluate: ExpressionEngine['evaluate'] = (
    expression,
    data,
    context$
  ) => {
    const path = expression.trim()

    if (!isSimplePath(path)) {
      if (options?.debug !== false) {
        warnUnsupported()
      }

      return `{${expression}}`
    }

    if (!data) return undefined

    const form$ = () =>
      context$?.form$ ??
      (typeof context$?.find === 'function' ? context$ : undefined)

    let value = get(data, path)

    // Dev-only ambiguity check: a path that resolves in the data may ALSO
    // spell a different element's tree path (a child of a data-less container
    // reusing the name). The data value wins — unchanged behavior — but
    // silently, so flag the collision once per path.
    if (
      isDev() &&
      options?.debug !== false &&
      value != null &&
      path.includes('.') &&
      !ambiguityChecked.has(path)
    ) {
      const finder = form$()

      if (finder?.find) {
        ambiguityChecked.add(path)
        const aliasPath = finder.find(path)?.dataPath

        if (aliasPath && aliasPath !== path) {
          warn(
            `Ambiguous reference "{${path}}": it resolves ` +
              `as a data path, but a different element's tree path also ` +
              `spells "${path}" (its data path is "${aliasPath}"). The data ` +
              `value is used — rename one of the fields to disambiguate.`
          )
        }
      }
    }

    // A dotted path that misses in the data may be a tree path whose element
    // owns a different data path (a child of a data-less container) — resolve
    // it through the element registry, the same lookup `find()` uses.
    // Data-first, so resolutions that already work never change.
    if (value == null && path.includes('.')) {
      const aliasPath = form$()?.find?.(path)?.dataPath

      if (aliasPath && aliasPath !== path) {
        value = get(data, aliasPath)
      }
    }

    if (value == null) return undefined

    return String(value)
  }

  const variables: ExpressionEngine['variables'] = (expression) => {
    const path = expression.trim()
    return isSimplePath(path) ? [path] : []
  }

  return { evaluate, variables }
}

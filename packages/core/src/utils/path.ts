import { escapeRegExp } from './string'
import { warn } from './warn'

/**
 * Result of splitting a dot-notation path into its first segment and remainder.
 */
type PathSplit = {
  before: string
  index: number
  after?: string
}

/**
 * Splits a dot-notation path into keys. Returns `null` (not `[]`) for a
 * denylisted prototype path so callers can refuse it outright — an empty key
 * list means "the root", and a denylisted path resolving to the root would leak
 * the whole object instead of nothing.
 */
function _parsePath(path: string): string[] | null {
  if (path == null || path === '') return []
  if (
    path.includes('__proto__') ||
    path.includes('constructor') ||
    path.includes('prototype')
  ) {
    warn('Attempted access to prototype path disallowed:', path)
    return null
  }
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter((key) => key !== '')
}

function _isNumericKey(value: string): boolean {
  return /^\d+$/.test(value)
}

/**
 * Replaces `.*` wildcard segments in a path with numeric indices extracted from
 * a fill path.
 *
 * @param fillable The path containing `.*` wildcards.
 * @param fill The concrete path whose numeric segments fill the wildcards.
 */
export function replaceWildcards(fillable: string, fill: string): string {
  if (!fill.match(/\.([0-9]+)(?![a-zA-Z]+)/g)) {
    return fillable
  }

  fill.match(/\.([0-9]+)(?![a-zA-Z]+)/g)?.forEach((match) => {
    fillable = fillable.replace('.*', match)
  })

  return fillable
}

/**
 * Replaces `[*]` wildcard segments in an expression path with numeric indices
 * from a fill path.
 *
 * @param fillable The expression path containing `[*]` wildcards.
 * @param fill The concrete path whose numeric segments fill the wildcards.
 * @param brackets Whether to use bracket notation (`[n]`) or dot notation
 *   (`.n`).
 */
export function replaceWildcardsExpr(
  fillable: string,
  fill: string,
  brackets = true
) {
  if (!fillable.includes('[*]')) {
    return fillable
  }

  const fillParts = fill.split('.')
  const keys: Record<string, string> = {}

  fillParts.forEach((part, i) => {
    if (!/^[0-9]+$/.test(part)) {
      return
    }

    keys[fillParts[i - 1]] = part
  })

  Object.keys(keys).forEach((key) => {
    // Element names are schema-supplied — escape them so a name carrying regex
    // metacharacters can't throw or inject a pathological pattern.
    fillable = fillable.replace(
      new RegExp(`(?<![a-zA-Z0-9_-])${escapeRegExp(key)}\\[\\*\\]`, 'g'),
      brackets ? `${key}[${keys[key]}]` : `${key}.${keys[key]}`
    )
  })

  return fillable
}

/**
 * Splits a dot-separated path at the last numeric index segment.
 *
 * @param path The dot-separated path to split.
 */
export function splitByLastIndex(path: string): PathSplit | undefined {
  const parts = path.split('.')
  const lastIndexPos = [...parts].reverse().findIndex((p) => /^[0-9]+$/.test(p))

  if (lastIndexPos === -1) {
    return undefined
  }

  const indexPos = parts.length - 1 - lastIndexPos

  const before = parts.slice(0, indexPos).join('.') || ''
  const index = Number(parts[indexPos])
  const after = parts.slice(indexPos + 1).join('.') || undefined

  return { before, index, after }
}

/**
 * Retrieves a deeply nested value from an object or array using a dot-separated
 * path.
 *
 * @param obj The source object or array.
 * @param path Dot-separated path or array of keys.
 * @param defaultValue Value returned when the path does not resolve.
 */
export function get(
  obj: Record<string, any> | any[],
  path: string | string[],
  defaultValue: any = undefined
): any {
  if (obj == null) return defaultValue
  const keys = Array.isArray(path) ? path : _parsePath(path)
  if (keys === null) return defaultValue
  if (keys.length === 0) return obj === undefined ? defaultValue : obj

  let current: any = obj
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (current == null) return defaultValue

    const hasKey = Object.prototype.hasOwnProperty.call(current, key)

    if (!hasKey) {
      // Register a reactive dependency on the missing key — a consumer
      // resolving `{field}` before the field exists must re-run when it
      // appears. The own-property check above goes through the proxy's
      // `getOwnPropertyDescriptor` trap, the one operation Vue does not
      // track; the `in` operator hits the tracked `has` trap for exactly
      // this key (and, unlike a value read, never invokes getters on the
      // prototype chain). Inherited values are still never returned.
      if (typeof current === 'object') void (key in current)

      const isArrayIndex =
        _isNumericKey(key) &&
        (Array.isArray(current) ||
          (typeof current === 'object' && typeof current.length === 'number'))

      if (!isArrayIndex || current[key] === undefined) return defaultValue
    }

    current = current[key]
  }

  return current === undefined ? defaultValue : current
}

/**
 * Sets a deeply nested value in an object or array using a dot-separated path,
 * creating intermediate containers as needed.
 *
 * @param obj The target object or array.
 * @param path Dot-separated path or array of keys.
 * @param value The value to set.
 */
export function set(
  obj: Record<string, any> | any[],
  path: string | string[],
  value: any
): Record<string, any> | any[] {
  if (obj == null || typeof obj !== 'object') return obj

  const keys = Array.isArray(path) ? path : _parsePath(path)
  if (keys === null) return obj
  if (keys.length === 0) {
    warn('Empty path provided to `set()`, cannot replace the root object')
    return obj
  }

  let current: any = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const nextKey = keys[i + 1]

    if (current[key] == null || typeof current[key] !== 'object') {
      const isNextKeyNumeric = _isNumericKey(nextKey)
      current[key] = isNextKeyNumeric ? [] : {}
    }

    current = current[key]
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return obj
}

/**
 * Removes a deeply nested value from an object or array using a dot-separated
 * path.
 *
 * @param obj The target object or array.
 * @param path Dot-separated path or array of keys.
 */
export function unset(
  obj: Record<string, any> | any[],
  path: string | string[]
): boolean {
  if (obj == null || typeof obj !== 'object') return false

  const keys = Array.isArray(path) ? path : _parsePath(path)
  if (keys === null || keys.length === 0) return false

  let current: any = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current == null || typeof current !== 'object') return false

    const hasKey = Object.prototype.hasOwnProperty.call(current, key)

    const nextStep = hasKey ? current[key] : undefined

    if (nextStep == null || typeof nextStep !== 'object') {
      if (nextStep === undefined && hasKey) return false
      if (!hasKey) return true
    }

    current = nextStep
  }

  const lastKey = keys[keys.length - 1]
  if (current == null || typeof current !== 'object') return true

  const hasKey = Object.prototype.hasOwnProperty.call(current, lastKey)

  if (!hasKey) return true

  if (Array.isArray(current) && _isNumericKey(lastKey)) {
    const index = parseInt(lastKey, 10)
    if (index >= 0 && index < current.length) {
      current.splice(index, 1)
      return true
    } else {
      return true
    }
  } else {
    delete current[lastKey]
    return true
  }
}

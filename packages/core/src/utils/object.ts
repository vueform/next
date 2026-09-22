import { mergeClasses } from './classes'
import { isForbiddenKey } from './guards'
import { camelToKebab } from './string'
import { warn } from './warn'

/**
 * A plain object with string keys and unknown values.
 */
type PlainObj = Record<string, unknown>

function _mergeDepth(
  a: PlainObj,
  b: PlainObj,
  depth: number,
  maxDepth: number
): PlainObj {
  const out: PlainObj = { ...a }

  for (const key of Object.keys(b)) {
    if (isForbiddenKey(key)) continue

    const bv = b[key]
    const av = out[key]

    if (isPlainObject(av) && isPlainObject(bv) && depth < maxDepth) {
      out[key] = _mergeDepth(
        av as PlainObj,
        bv as PlainObj,
        depth + 1,
        maxDepth
      )
      continue
    }

    if (isPlainObject(bv)) {
      out[key] = { ...bv }
      continue
    }

    if (Array.isArray(bv)) {
      out[key] = [...bv]
    } else {
      out[key] = bv as unknown
    }
  }

  return out
}

/**
 * Checks whether a value is a plain object (not an array, Date, RegExp, File,
 * etc.).
 *
 * @param value The value to test.
 */
export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    ArrayBuffer.isView(value) ||
    value instanceof ArrayBuffer
  ) {
    return false
  }
  if (typeof File === 'function' && value instanceof File) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}

/**
 * Deep clones a value, supporting primitives, Date, File, arrays, and plain
 * objects.
 *
 * @param value The value to clone.
 */
export function clone<T>(value: T): T {
  if (
    value === null ||
    typeof value === 'undefined' ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'function') {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T
  }

  if (typeof File !== 'undefined' && value instanceof File) {
    return new File([value], value.name, {
      type: value.type,
      lastModified: value.lastModified,
    }) as unknown as T
  }

  if (
    typeof value === 'object' &&
    value &&
    (value as any).constructor?.name === 'File'
  ) {
    warn('File detected but not supported in Node, skipping:', value)
    return undefined as unknown as T
  }

  if (Array.isArray(value)) {
    return value.map(clone) as unknown as T
  }

  if (typeof value === 'object') {
    const result: any = {}

    for (const key of Object.keys(value as object)) {
      if (isForbiddenKey(key)) continue

      const val = (value as any)[key]
      result[key] = clone(val)
    }

    return result
  }

  warn(`Skipping unsupported type "${typeof value}" during clone`, value)
  return undefined as unknown as T
}

/**
 * Deep equality check. Uses recursive comparison for objects and arrays,
 * falling back to strict equality for primitives.
 *
 * @param a First value.
 * @param b Second value.
 */
export function equals(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || a === undefined || b === undefined)
    return false
  if (typeof a !== typeof b) return false

  if (typeof a !== 'object') return a === b

  if (a instanceof File || b instanceof File) {
    if (!(a instanceof File) || !(b instanceof File)) return false
    return (
      a.name === b.name &&
      a.size === b.size &&
      a.type === b.type &&
      a.lastModified === b.lastModified
    )
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== (b as unknown[]).length) return false
    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], (b as unknown[])[i])) return false
    }
    return true
  }

  if (Array.isArray(b)) return false

  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const keysA = Object.keys(aObj)
  const keysB = Object.keys(bObj)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (!equals(aObj[key], bObj[key])) return false
  }

  return true
}

/**
 * Type-safe wrapper around `Object.entries` that preserves key and value types.
 *
 * @param obj The object to extract entries from.
 */
export function typedEntries<T extends object, K extends keyof T>(
  obj?: T
): [K, T[K]][] {
  return Object.entries(obj || {}) as [K, T[K]][]
}

/**
 * Type-safe wrapper around `Object.keys` that returns typed key array.
 *
 * @param o The object to extract keys from.
 */
export function typedKeys<T extends object>(o: T) {
  return Object.keys(o) as Array<keyof T>
}

/**
 * Returns the first argument that is not `undefined`.
 *
 * @param args Values to coalesce.
 */
export function coalesce(...args: any[]) {
  return args.find((arg) => arg !== undefined)
}

/**
 * Checks whether a raw props object contains a property by camelCase or
 * kebab-case name.
 *
 * @param raw The raw props object.
 * @param key The property name to check.
 */
export function hasRawProp(raw: Record<string, any>, key: string) {
  if (Object.prototype.hasOwnProperty.call(raw, key)) return true

  const kebab = camelToKebab(key)
  if (Object.prototype.hasOwnProperty.call(raw, kebab)) return true

  const camel = kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return Object.prototype.hasOwnProperty.call(raw, camel)
}

/**
 * Whether a plain object is a Vue component definition — a compiled SFC or a
 * `defineComponent` result — as opposed to a data object. Such values must be
 * treated atomically by prop merging: merging two definitions' keys produces a
 * broken hybrid component.
 *
 * @param value The plain object to test.
 */
export function isComponentDefinition(value: Record<string, unknown>): boolean {
  return (
    '__v_skip' in value || // markRaw()'d
    'setup' in value ||
    'render' in value ||
    'ssrRender' in value ||
    '__name' in value ||
    typeof value.template === 'string'
  )
}

/**
 * Merges two prop values with special handling for `classes` and `presets`.
 * Plain objects merge shallowly, except component definitions (a `template`,
 * `layout`, or slot component), which replace as a whole.
 *
 * @param a The base value.
 * @param b The overriding value.
 * @param prop The property name (used for special merge strategies).
 * @param merge Whether to merge or replace.
 */
export function mergeProp(a: any, b: any, prop: string, merge = true) {
  if (b === undefined) return a
  if (!merge) return b
  if (a === undefined) return b
  if (a === b) return a
  if (prop === 'classes') return mergeClasses(a, [b])
  if (prop === 'presets' && merge) return [...a, ...b]
  if (!isPlainObject(a) || !isPlainObject(b)) return b
  if (isComponentDefinition(a) || isComponentDefinition(b)) return b
  return { ...a, ...b }
}

/**
 * Deeply merges two plain objects up to a maximum nesting depth.
 *
 * @param target The base object.
 * @param source The source object to merge in.
 * @param maxDepth Maximum recursion depth for merging nested objects.
 */
export function mergeUntilDepth<T extends PlainObj, U extends PlainObj>(
  target: T,
  source: U,
  maxDepth = Infinity
): T & U {
  return _mergeDepth(target, source, 0, maxDepth) as T & U
}

/**
 * Recursively merges `data` into `current`: when both are plain objects their
 * keys are merged, otherwise `data` overrides `current`.
 *
 * @param current The existing value to merge into.
 * @param data The incoming value to merge or override with.
 */
export function mergeOrReplace(current: any, data: any): any {
  if (!isPlainObject(current) || !isPlainObject(data)) return data

  const result: Record<string, any> = { ...current }
  for (const key of Object.keys(data)) {
    if (isForbiddenKey(key)) continue

    result[key] = mergeOrReplace(current[key], data[key])
  }

  return result
}

/**
 * Deeply merges multiple source objects into a target with unlimited depth.
 * Plain objects are recursively merged, arrays are concatenated, and all other
 * values are overwritten by the last source that defines them.
 *
 * @param target The base object to merge into (not mutated).
 * @param sources One or more source objects to merge from left to right.
 */
export function merge<T extends PlainObj>(
  target: T,
  ...sources: PlainObj[]
): T {
  let out: PlainObj = target ? { ...target } : {}

  for (const source of sources) {
    if (!isPlainObject(source)) continue

    for (const key of Object.keys(source)) {
      if (isForbiddenKey(key)) continue

      const sv = source[key]
      const tv = out[key]

      if (isPlainObject(tv) && isPlainObject(sv)) {
        out[key] = merge(tv as PlainObj, sv as PlainObj)
      } else if (Array.isArray(tv) && Array.isArray(sv)) {
        out[key] = [...tv, ...sv]
      } else if (Array.isArray(sv)) {
        out[key] = [...sv]
      } else if (isPlainObject(sv)) {
        out[key] = merge({} as PlainObj, sv as PlainObj)
      } else {
        out[key] = sv
      }
    }
  }

  return out as T
}

/**
 * Reads a property as an **own** property only: the value when the object
 * carries the key itself, `undefined` otherwise — the prototype chain never
 * answers. Use it wherever an untrusted or semi-trusted string indexes into an
 * object (config policy flags, rule registries): an inherited value from a
 * polluted `Object.prototype` (via a pollution bug in any other library on the
 * page) must never satisfy the read.
 *
 * @param obj The object to read from.
 * @param key The property key.
 */
export function own<T extends object, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined
}

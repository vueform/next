import { isRef, unref } from 'vue'
import { joinMaybeArrays } from './array'
import { isForbiddenKey } from './guards'

/**
 * Resolves refs anywhere inside a class value: the value itself, array members,
 * and the condition values of conditional objects. A functional class value is
 * wrapped so its result is resolved when it is called. Refs are read at resolve
 * time, so running inside a tracked computation (or a render effect, for
 * functions) keeps the resolved value reactive.
 *
 * @param value The class value to resolve.
 */
export function unrefClass(value: any): any {
  if (isRef(value)) {
    return unrefClass(value.value)
  } else if (typeof value === 'function') {
    return (...args: any[]) => unrefClass(value(...args))
  } else if (Array.isArray(value)) {
    return value.map(unrefClass)
  } else if (value && typeof value === 'object') {
    const resolved: Record<string, any> = {}
    for (const key in value) {
      resolved[key] = unref(value[key])
    }
    return resolved
  }

  return value
}

/**
 * Merges two class values (strings, arrays, or functions) into a single
 * combined value.
 *
 * @param a The base class value.
 * @param b The class value to merge in.
 */
export function mergeClass(a: any, b: any) {
  if (!b) {
    return a
  } else if (!a) {
    return b
  } else if (typeof a === 'string' && typeof b === 'string') {
    return a.length ? (b.length ? `${a} ${b}` : a) : b
  } else if (typeof a === 'function') {
    return (...args: any[]) =>
      mergeClass(a(...args), typeof b === 'function' ? b(...args) : b)
  } else if (typeof b === 'function') {
    // A static base merged with a functional addition stays callable: the
    // static side rides along and the merge resolves per call.
    return (...args: any[]) => mergeClass(a, b(...args))
  } else {
    return joinMaybeArrays(a, b)
  }
}

/**
 * Merges a base classes record with an array of additions, combining values per
 * key.
 *
 * @param base The base classes record.
 * @param additions Array of class records to merge into the base.
 */
export function mergeClasses(
  base: Record<string, any>,
  additions: Record<string, any>[]
) {
  const classes = { ...base }

  additions.forEach((addition) => {
    for (const key in addition) {
      if (isForbiddenKey(key)) continue

      classes[key] = mergeClass(classes[key], addition[key])
    }
  })

  return classes
}

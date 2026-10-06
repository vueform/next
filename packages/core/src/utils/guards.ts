import { toRaw } from 'vue'

import type { StandardSchemaV1 } from '#core/types'

/**
 * Checks whether a value has the shape of a File object (name, lastModified,
 * size, type).
 *
 * @param obj The value to test.
 */
export function isFile(obj: any) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.lastModified === 'number' &&
    typeof obj.size === 'number' &&
    typeof obj.type === 'string'
  )
}

/**
 * Checks whether a value is considered filled (not undefined, null, false, or
 * empty string).
 *
 * @param value The value to test.
 */
export function isFilled(value: any) {
  return (
    value !== undefined && value !== null && value !== false && value !== ''
  )
}

/**
 * Checks whether a value is a Standard Schema V1 implementation (Zod 3.24+,
 * Valibot, ArkType, …). Must run before plain-object or function checks when
 * classifying rule entries — Valibot schemas are plain objects and ArkType
 * schemas are callable.
 *
 * @param value The value to test.
 */
export function isStandardSchema(value: any): value is StandardSchemaV1 {
  if (
    value == null ||
    (typeof value !== 'object' && typeof value !== 'function') ||
    !('~standard' in value)
  ) {
    return false
  }
  // Read `~standard` off the raw object: Zod 4 resolves it via a lazy getter
  // that caches `this`-bound props, and a reactive-proxy `this` would poison
  // that cache (its internals are non-configurable, so proxy reads throw).
  return (toRaw(value) as any)['~standard']?.version === 1
}

/**
 * Whether a key must never be walked into or assigned during object merges,
 * clones, or normalization. Assigning an own `__proto__` key from parsed JSON
 * (`obj[key] = v`) triggers the `Object.prototype.__proto__` accessor and
 * silently re-points the object's prototype — untrusted data (server responses,
 * stored drafts, schemas) must not carry that power.
 *
 * @param key The object key to test.
 */
export function isForbiddenKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype'
}

/**
 * Checks whether a value is valid JSON by attempting to parse it.
 *
 * @param input The value to test.
 */
export function isJson(input: any) {
  try {
    JSON.parse(input)
  } catch {
    return false
  }

  return true
}

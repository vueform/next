import type { createEvents } from '#src/helpers'

import type { makeEngine } from './engine'
import type { ModelInstance, ModelStore } from './types'

// Every `useModel` instance carries one hidden record with its internals:
// the store (shared with an attaching form), the headless engine, and the
// event emitter. The symbol doubles as the instance brand. Non-enumerable, so
// it never shows up in key walks or JSON.
const INTERNALS: unique symbol = Symbol('vueform.model')

export type ModelInternals = {
  store: ModelStore
  engine: ReturnType<typeof makeEngine>
  events: ReturnType<typeof createEvents>
}

export function setInternals(instance: object, internals: ModelInternals) {
  Object.defineProperty(instance, INTERNALS, {
    value: internals,
    enumerable: false,
  })
}

export function getInternals(instance: ModelInstance<any>): ModelInternals {
  return (instance as unknown as { [INTERNALS]: ModelInternals })[INTERNALS]
}

/**
 * Whether a value is a `useModel` instance. VfForm checks `modelValue` with it
 * to attach the instance's store directly instead of cloning the data.
 *
 * @param value The value to check.
 */
export function hasModelStore(value: any): value is ModelInstance {
  return !!value && typeof value === 'object' && INTERNALS in value
}

/**
 * Returns the underlying model store of a `useModel` instance. Module-internal.
 *
 * @param instance The model instance to unwrap.
 */
export function getModelStore(instance: ModelInstance<any>): ModelStore {
  return getInternals(instance).store
}

/**
 * Returns the internal event emitter of a `useModel` instance, or `undefined`
 * for non-instance values. The form blueprint fires its events into it so
 * instance-level subscriptions keep firing while a form owns submission.
 *
 * @param value The candidate `useModel` instance.
 */
export function getModelEvents(
  value: any
): ReturnType<typeof createEvents> | undefined {
  if (!hasModelStore(value)) return undefined
  return getInternals(value).events
}

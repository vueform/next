import { ref } from 'vue'

import { useConfig, useCurrentInstance } from '#src/composables'
import type { UnionToIntersection } from '#src/types'
import {
  isThenable,
  toKebabCase,
  toPascalCase,
  getInstanceRawProp,
} from '#src/utils'

/**
 * Converts a Vue emit declaration record into a map of event names to their
 * argument tuples, extracting rest-parameter types where available.
 */
export type TypeEmitsToOptions<T extends Record<string, any>> = {
  [K in keyof T & string]: T[K] extends [...args: infer Args] ? Args : any[]
}

/**
 * Registers or removes a callback for a specific event.
 */
export type EventListener<TEvents extends Record<string, any[]>> =
  /**
   * Registers or removes a callback for a specific event.
   *
   * @param e The event name.
   * @param callback The handler to register or remove.
   */
  <E extends keyof TEvents>(
    e: E,
    callback: (...args: TEvents[E]) => any
  ) => void

type FireSignature<K extends string, TArgs extends any[]> =
  /**
   * Fires the event with its typed arguments.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  (e: K, ...args: TArgs) => any

/**
 * Builds a `fire` signature from an event-name-to-argument-tuple map. Combines
 * per-event overloads (for typed arguments and autocomplete) with a union-name
 * guard signature so that a factory declaring an event name absent from the
 * blueprint's events is caught at compile time.
 */
export type FeatureFire<TEvents extends Record<string, any[]>> =
  UnionToIntersection<
    {
      [K in keyof TEvents & string]: FireSignature<K, TEvents[K]>
    }[keyof TEvents & string]
  > &
    ((e: keyof TEvents & string, ...args: any[]) => any)

type ListenerSignature<K extends string, TArgs extends any[]> =
  /**
   * Registers or removes a callback for the event.
   *
   * @param e The event name.
   * @param callback The handler to register or remove.
   */
  (e: K, callback: (...args: TArgs) => any) => void

/**
 * Builds a listener registration signature (`on`, `off`, `onBefore`, `onAfter`)
 * from an event-name-to-argument-tuple map. Like `FeatureFire`, it combines
 * per-event overloads with a union-name guard so that a factory referencing an
 * event absent from the blueprint's events is caught at compile time.
 */
export type FeatureListener<TEvents extends Record<string, any[]>> =
  UnionToIntersection<
    {
      [K in keyof TEvents & string]: ListenerSignature<K, TEvents[K]>
    }[keyof TEvents & string]
  > &
    ((e: keyof TEvents & string, callback: (...args: any[]) => any) => void)

/**
 * The events object a factory receives, typed from an event-name-to-argument
 * map. Each member is name-guarded so that referencing an event absent from the
 * blueprint's events fails to compile.
 */
export type FeatureEvents<TEvents extends Record<string, any[]>> = {
  /**
   * Fires an event with its typed arguments.
   */
  fire: FeatureFire<TEvents>

  /**
   * Fires an event asynchronously, awaiting each callback and short-circuiting
   * when any returns `false`.
   */
  fireAsync: FeatureFire<TEvents>

  /**
   * Subscribes a callback to an event.
   */
  on: FeatureListener<TEvents>

  /**
   * Removes a previously registered event callback.
   */
  off: FeatureListener<TEvents>

  /**
   * Registers a callback that runs before the main event listeners.
   */
  onBefore: FeatureListener<TEvents>

  /**
   * Registers a callback that runs after the main event listeners.
   */
  onAfter: FeatureListener<TEvents>

  /**
   * Whether any callback is currently registered for the given event, either
   * via `on` / `onBefore` / `onAfter` or as a component prop listener.
   *
   * @param e The event name.
   */
  hasListeners?: (e: keyof TEvents & string) => boolean
}

/**
 * The return type of `defineEvents`, providing fire, on, off, onBefore, and
 * onAfter methods.
 */
export type DefineEvents<T extends Record<string, any>> = ReturnType<
  typeof defineEvents<T>
>

/**
 * Creates a typed event system with synchronous and async firing, listener
 * registration, and before/after hooks.
 *
 * @private
 */
export function defineEvents<
  T extends Record<string, any>,
  TEvents extends TypeEmitsToOptions<T> = TypeEmitsToOptions<T>,
>() {
  const { nativeEmit } = useConfig()
  const instance = useCurrentInstance()
  const vm = useCurrentInstance()

  const listeners = ref<Record<string, ((...args: any[]) => any)[]>>({})
  const befores = ref<Record<string, ((...args: any[]) => any)[]>>({})
  const afters = ref<Record<string, ((...args: any[]) => any)[]>>({})
  const prevented = ref(false)
  /**
   * Whether an async event is currently being processed.
   */
  const eventInProgress = ref(false)

  /**
   * Fires an event synchronously, invoking before, listener, and after
   * callbacks in order and emitting a native Vue event.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  const fire = <E extends keyof TEvents>(e: E, ...args: TEvents[E]) => {
    const event = toKebabCase(String(e))

    for (const callbacks of [befores.value, listeners.value, afters.value]) {
      for (const callback of callbacks[event] || []) {
        callback(...args)
      }
    }

    if (nativeEmit) {
      vm.emit(event, ...args)
    } else {
      const listener =
        getInstanceRawProp(instance, `on${toPascalCase(event)}`) ||
        getInstanceRawProp(instance, `on-${toKebabCase(event)}`)

      if (typeof listener === 'function') {
        listener(...args)
      }
    }
  }

  /**
   * Fires an event asynchronously, awaiting each callback and short-circuiting
   * when any returns `false`.
   *
   * @param e The event name.
   * @param args The event arguments forwarded to each callback.
   */
  const fireAsync = async <E extends keyof TEvents>(
    e: E,
    ...args: TEvents[E]
  ) => {
    prevented.value = false

    let lastResult: any

    const event = toKebabCase(String(e))

    for (const callbacks of [befores.value, listeners.value, afters.value]) {
      for (const callback of callbacks[event] || []) {
        const rawResult = callback(...args)

        if (isThenable(rawResult)) {
          eventInProgress.value = true
        }

        const callbackResult = isThenable(rawResult)
          ? await rawResult
          : rawResult

        if (callbackResult === false) {
          eventInProgress.value = false
          return false
        }

        if (callbackResult !== undefined) {
          lastResult = callbackResult
        }
      }
    }

    if (nativeEmit) {
      vm.emit(event, ...args)
    } else {
      const listener =
        getInstanceRawProp(instance, `on${toPascalCase(event)}`) ||
        getInstanceRawProp(instance, `on-${toKebabCase(event)}`)

      if (typeof listener === 'function') {
        const rawListenerResult = listener(...args)
        const listenerResult = isThenable(rawListenerResult)
          ? await rawListenerResult
          : rawListenerResult

        if (listenerResult === false) {
          eventInProgress.value = false
          return false
        }

        if (listenerResult !== undefined) {
          lastResult = listenerResult
        }
      }
    }

    eventInProgress.value = false

    return lastResult !== undefined ? lastResult : true
  }

  /**
   * Subscribes a callback to a specific event.
   *
   * @param e The event name.
   * @param callback The handler to invoke when the event fires.
   */
  const on: EventListener<TEvents> = (e, callback) => {
    const event = toKebabCase(String(e))

    if (!listeners.value[event]) {
      listeners.value[event] = []
    }

    listeners.value[event].push(callback)
  }

  /**
   * Removes a previously registered event callback.
   *
   * @param e The event name.
   * @param callback The handler to remove. Omit to remove all listeners for the
   *   event.
   */
  const off: EventListener<TEvents> = (e, callback) => {
    const event = toKebabCase(String(e))

    const allListeners = [befores.value, listeners.value, afters.value]

    allListeners.forEach((listeners) => {
      if (!listeners[event]) return

      if (callback) {
        listeners[event] = listeners[event].filter(
          (l: any) => l.toString() !== callback.toString()
        )
      } else {
        delete listeners[event]
      }
    })
  }

  /**
   * Registers a callback that runs before the main event listeners.
   *
   * @param e The event name.
   * @param callback The handler to invoke before the event fires.
   */
  const onBefore: EventListener<TEvents> = (e, callback) => {
    const event = toKebabCase(String(e))

    if (!befores.value[event]) {
      befores.value[event] = []
    }

    befores.value[event].push(callback)
  }

  /**
   * Registers a callback that runs after the main event listeners.
   *
   * @param e The event name.
   * @param callback The handler to invoke after the event fires.
   */
  const onAfter: EventListener<TEvents> = (e, callback) => {
    const event = toKebabCase(String(e))

    if (!afters.value[event]) {
      afters.value[event] = []
    }

    afters.value[event].push(callback)
  }

  /**
   * Whether any callback is currently registered for the given event, either
   * via `on` / `onBefore` / `onAfter` or as a component prop listener (`@event`
   * in the template). Lets producers skip expensive payload preparation when
   * nothing would receive it.
   *
   * @param e The event name.
   */
  const hasListeners = (e: keyof TEvents & string) => {
    const event = toKebabCase(String(e))

    if (
      befores.value[event]?.length ||
      listeners.value[event]?.length ||
      afters.value[event]?.length
    ) {
      return true
    }

    return (
      typeof (
        getInstanceRawProp(instance, `on${toPascalCase(event)}`) ||
        getInstanceRawProp(instance, `on-${event}`)
      ) === 'function'
    )
  }

  return {
    fire,
    fireAsync,
    on,
    off,
    onBefore,
    onAfter,
    hasListeners,
    eventInProgress,
  }
}

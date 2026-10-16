// @todo: move to utils?
import {
  hasInjectionContext,
  inject,
  provide,
  type App,
  type InjectionKey,
} from 'vue'

import { getGenericInstance, type GenericInstance } from '#src/utils'

/**
 * Key used to provide or inject a typed context, as a Vue `InjectionKey` or
 * string.
 */
type ContextKey<T> = InjectionKey<T> | string

/**
 * Locally provided state per component instance, so a context provided during
 * setup can be injected by the same component.
 */
const localProvidedStateMap = new WeakMap<
  GenericInstance,
  Record<string | symbol, unknown>
>()

/**
 * Injects a context provided by an ancestor component or by the current
 * component itself. Returns `undefined` when no injection context is
 * available.
 *
 * @param key The key of the context to inject.
 */
function useContext<T>(key: ContextKey<T>): T | undefined {
  const instance = getGenericInstance()

  if (instance) {
    const localState = localProvidedStateMap.get(instance)
    if (localState && (key as string | symbol) in localState) {
      return localState[key as string | symbol] as T
    }
  }

  if (hasInjectionContext()) {
    return inject<T>(key, undefined as unknown as T)
  }

  return undefined
}

/**
 * Provides a context to all descendant components and to the providing
 * component itself.
 *
 * @private
 * @param key The key of the context to provide.
 * @param context The context to provide.
 * @param app The Vue app instance to provide the context to.
 */
export function provideContext<T>(key: ContextKey<T>, context: T, app?: App) {
  if (app) {
    app.provide(key, context)
    return context
  }

  const instance = getGenericInstance()

  if (instance) {
    let localState = localProvidedStateMap.get(instance)
    if (!localState) {
      localState = Object.create(null) as Record<string | symbol, unknown>
      localProvidedStateMap.set(instance, localState)
    }
    localState[key as string | symbol] = context
  }

  provide(key, context)

  return context
}

/**
 * Creates a new context for providing and injecting data.
 *
 * @private
 * @param key The key of the context to create.
 */
export function createContext<T>(_key: ContextKey<T>) {
  function _provideContext(context: T, app?: App) {
    return provideContext<T>(_key, context, app)
  }

  function _useContext(key = _key) {
    return useContext<T>(key)
  }

  return [_useContext, _provideContext] as const
}

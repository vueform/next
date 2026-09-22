import {
  shallowReactive,
  unref,
  type MaybeRef,
  type ShallowReactive,
  type Ref,
} from 'vue'
import { defineEvents } from '~/helpers'
import type { ElementName, StatefulElement } from '~/types'
import { lazyComputed } from '~/utils'

/**
 * Event map for child element registration and unregistration.
 */
type VueformChildrenEmits = {
  /**
   * A child element has been registered at the given path.
   *
   * @param path The full path of the registered child element.
   * @param context$ The registered child element's component context.
   */
  register: [path: string, context$: any]
  /**
   * A child element has been unregistered from the given path.
   *
   * @param path The full path of the unregistered child element.
   * @param instance The specific instance being unregistered, when the removal
   *   should be identity-guarded.
   */
  unregister: [path: string, instance?: any]
}

/**
 * Options for `useChildren`.
 */
type UseChildrenOptions = {
  /**
   * Also keep a map of every registered descendant keyed by full path, not only
   * direct children. Used by the form to expose `elements$`.
   */
  flat?: boolean
}

/**
 * Registry of child element instances within a container or form.
 */
export type VueformChildren = {
  /**
   * The reactive map of all registered child element instances, keyed by their
   * relative path.
   */
  children$: ShallowReactive<Map<ElementName, any>>

  /**
   * Map of every registered descendant keyed by full path. Only present when
   * `useChildren` is created with `flat: true`.
   */
  flatChildren$?: ShallowReactive<Map<string, any>>

  /**
   * A computed list of all registered stateful (non-static) child element
   * instances. Created on first access.
   */
  statefulChildren$: Ref<any[]>

  /**
   * A computed list of all available (visible) stateful child element
   * instances. Created on first access.
   */
  availableStatefulChildren$: Ref<any[]>

  /**
   * A computed list of all available (visible) stateful and hoisted child
   * element instances. Created on first access.
   */
  hoistedChildren$: Ref<any[]>

  /**
   * Registers a child element context at the given path.
   *
   * @param path The full path of the child element.
   * @param context$ The child element's component context.
   */
  register: (path: string, context$: any) => void

  /**
   * Unregisters a child element at the given path.
   *
   * @param path The full path of the child element to remove.
   * @param instance When provided, the entry is only removed if it still
   *   belongs to this instance (prevents deleting a sibling's registration
   *   after paths were re-keyed by a reorder).
   */
  unregister: (path: string, instance?: any) => void

  /**
   * Subscribes a callback to a children registry event.
   */
  on: {
    /**
     * Listens for child element registration.
     *
     * @param e The event name.
     * @param callback The handler invoked with the child's path and component
     *   context.
     */
    (e: 'register', callback: (path: string, context$: any) => any): any

    /**
     * Listens for child element unregistration.
     *
     * @param e The event name.
     * @param callback The handler invoked with the child's path and optionally
     *   the specific instance being unregistered.
     */
    (e: 'unregister', callback: (path: string, instance?: any) => any): any
  }

  /**
   * Unsubscribes a callback from a children registry event.
   */
  off: {
    /**
     * Stops listening for child element registration.
     *
     * @param e The event name.
     * @param callback The handler previously registered with `on`.
     */
    (e: 'register', callback: (path: string, context$: any) => any): any

    /**
     * Stops listening for child element unregistration.
     *
     * @param e The event name.
     * @param callback The handler previously registered with `on`.
     */
    (e: 'unregister', callback: (path: string, instance?: any) => any): any
  }
}

/**
 * Manages a registry of child element instances within a container or form,
 * providing reactive lists and event hooks. Derived child lists are lazy
 * computeds — they are not allocated until first read.
 *
 * @param namespace Optional base path used to compute relative child paths.
 * @param options Optional registry flags.
 * @related useContainer
 * @private
 */
export function useChildren(
  namespace?: MaybeRef<string>,
  options?: UseChildrenOptions
): VueformChildren {
  const { on, off, fire } = defineEvents<VueformChildrenEmits>()

  /**
   * The reactive map of all registered child element instances, keyed by their
   * relative path.
   */
  const children$ = shallowReactive(new Map<ElementName, any>())

  /**
   * Map of every registered descendant keyed by full path.
   */
  const flatChildren$ = options?.flat
    ? shallowReactive(new Map<string, any>())
    : undefined

  /**
   * A computed list of all registered stateful (non-static) child element
   * instances.
   */
  const statefulChildren$ = lazyComputed(
    () =>
      [...children$.values()].filter((c$) => !c$.isStatic) as StatefulElement[]
  )

  /**
   * A computed list of all available (visible) stateful child element
   * instances.
   */
  const availableStatefulChildren$ = lazyComputed(
    () =>
      [...children$.values()].filter(
        ({ available, isStatic }) => available && !isStatic
      ) as StatefulElement[]
  )

  /**
   * A computed list of all available (visible) stateful and hoisted child
   * element instances.
   */
  const hoistedChildren$ = lazyComputed(
    () =>
      availableStatefulChildren$.value.filter(
        ({ hoisted }) => hoisted
      ) as StatefulElement[]
  )

  /**
   * Registers a child element instance at the given path.
   *
   * @param path The full path of the child element.
   * @param context$ The child element's component context.
   */
  const register = (path: string, context$: any) => {
    const { relativePath, furtherNested } = getRelativePath(path)
    if (!furtherNested) children$.set(relativePath, context$)
    if (flatChildren$) flatChildren$.set(path, context$)
    fire('register', path, context$)
  }

  /**
   * Unregisters a child element instance at the given path.
   *
   * @param path The full path of the child element to remove.
   * @param instance When provided, the entry is only removed if it still
   *   belongs to this instance (prevents deleting a sibling's registration
   *   after paths were re-keyed by a reorder).
   */
  const unregister = (path: string, instance?: any) => {
    const { relativePath, furtherNested } = getRelativePath(path)
    if (
      !furtherNested &&
      (instance === undefined || children$.get(relativePath) === instance)
    ) {
      children$.delete(relativePath)
    }
    if (
      flatChildren$ &&
      (instance === undefined || flatChildren$.get(path) === instance)
    ) {
      flatChildren$.delete(path)
    }
    fire('unregister', path, instance)
  }

  const getRelativePath = (path: string) => {
    const relativePath = path.substr(
      (unref(namespace) !== undefined ? `${unref(namespace)}.` : '').length
    )

    return {
      relativePath,
      furtherNested: relativePath.includes('.'),
    }
  }

  return {
    children$,
    ...(flatChildren$ ? { flatChildren$ } : {}),
    statefulChildren$,
    availableStatefulChildren$,
    hoistedChildren$,
    register,
    unregister,
    on,
    off,
  }
}

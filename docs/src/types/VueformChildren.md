```ts
/**
 * Registry of child element instances within a container or form.
 */
type VueformChildren = {
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
```

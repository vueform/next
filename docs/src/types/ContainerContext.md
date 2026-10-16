```ts
/**
 * Context for a container component (form, list, group, etc.) managing child
 * registration, model, and visibility.
 */
type ContainerContext = {
  /**
   * The unique identifier of the container component.
   */
  id: Ref<string>

  /**
   * The children registry managing child element instances.
   */
  children?: VueformChildren

  /**
   * The reactive model value managed by this container.
   */
  model: Ref<any>

  /**
   * The pager instance when the container uses pagination (e.g. steps).
   */
  pager?: Ref<Pager | undefined>

  /**
   * Whether the container is available (not excluded by conditions).
   */
  available: Ref<boolean>

  /**
   * Whether the container is visible in the DOM.
   */
  visible: Ref<boolean>

  /**
   * Whether the container is disabled, propagating to all children.
   */
  disabled: Ref<boolean>

  /**
   * The dot-separated path used for data binding.
   */
  dataPath: Ref<string>

  /**
   * The dot-separated path used for element lookup.
   */
  path: Ref<string>

  /**
   * The container type identifier (e.g. `root`, `list`, `group`).
   */
  type: keyof ContainerTypes

  /**
   * Registers a child element context within this container.
   *
   * @param context$ The child element context$ to register.
   * @param path The element's lookup path.
   * @param dataPath The element's data-binding path.
   * @param initialModel The initial model value for the element.
   */
  register: (
    context$: any,
    path: string,
    dataPath?: string,
    initialModel?: any
  ) => void

  /**
   * Unregisters a child element from this container.
   *
   * @param path The element's lookup path.
   * @param dataPath The element's data-binding path.
   * @param instance When provided, registry entries are only removed if they
   *   still belong to this instance (prevents deleting a sibling's registration
   *   after paths were re-keyed by a reorder).
   */
  unregister: (path: string, dataPath?: string, instance?: any) => void

  /**
   * Updates the model value at the given data path.
   *
   * @param dataPath The dot-separated data path to update.
   * @param value The new value to set.
   */
  update: (dataPath: string, value: any) => void

  /**
   * Subscribes a callback to changes at the given absolute data path. Delegates
   * up the container chain to the root model's path-keyed registry. Returns an
   * unsubscribe function.
   *
   * @param dataPath The absolute dot-separated data path to listen on.
   * @param cb The callback invoked when the path's subtree changes.
   */
  subscribe: (dataPath: string, cb: () => void) => () => void
}
```

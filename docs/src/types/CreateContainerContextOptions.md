```ts
/**
 * Options for creating a container element context.
 */
type CreateContainerContextOptions = {
  /**
   * The container type identifier (e.g. `root`, `list`, `group`).
   */
  type: keyof ContainerTypes

  /**
   * The unique identifier of the container component.
   */
  id: Ref<string>

  /**
   * The reactive model value managed by this container.
   */
  model: Ref<any>

  /**
   * The dot-separated path used for data binding.
   */
  dataPath?: MaybeRef<string>

  /**
   * The dot-separated path used for element lookup.
   */
  path?: MaybeRef<string>

  /**
   * The pager instance when the container uses pagination.
   */
  pager?: MaybeRef<Pager | undefined>

  /**
   * Whether the container is available (not excluded by conditions).
   */
  available?: MaybeRef<boolean>

  /**
   * Whether the container is visible in the DOM.
   */
  visible?: MaybeRef<boolean>

  /**
   * Whether the container is disabled, propagating to all children.
   */
  disabled?: MaybeRef<boolean>

  /**
   * The children registry for managing child element instances.
   */
  children?: VueformChildren

  /**
   * The parent container context to delegate registration to.
   */
  container?: ContainerContext

  /**
   * Custom register function overriding the default registration behavior.
   *
   * @param context$ The child element context to register.
   * @param path The element's lookup path.
   * @param dataPath The element's data-binding path.
   * @param initialModel The initial model value for the element.
   */
  register?: (
    context$: any,
    path: string,
    dataPath?: string,
    initialModel?: any
  ) => void

  /**
   * Custom unregister function overriding the default unregistration behavior.
   *
   * @param path The element's lookup path.
   * @param dataPath The element's data-binding path.
   * @param instance When provided, registry entries are only removed if they
   *   still belong to this instance.
   */
  unregister?: (path: string, dataPath?: string, instance?: any) => void

  /**
   * Custom update function overriding the default model update behavior.
   *
   * @param dataPath The dot-separated data path to update.
   * @param value The new value to set.
   */
  update?: (dataPath: string, value: any) => void

  /**
   * Custom subscribe function overriding the default delegation to the parent
   * container. Provided by the root container to expose the root model's
   * path-keyed change registry.
   *
   * @param dataPath The absolute dot-separated data path to listen on.
   * @param cb The callback invoked when the path's subtree changes.
   */
  subscribe?: (dataPath: string, cb: () => void) => () => void
}
```

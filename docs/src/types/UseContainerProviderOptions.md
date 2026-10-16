```ts
/**
 * Configuration for the container provider factory that creates and provides a
 * container context for child elements.
 */
type UseContainerProviderOptions = {
  /**
   * The parent container context to delegate registration to.
   */
  container: ContainerContext

  /**
   * The children registry for tracking child instances.
   */
  children: VueformChildren

  /**
   * The container type identifier. Defaults to `'input'` for transparent
   * passthrough containers.
   */
  type?: keyof ContainerTypes

  /**
   * The unique identifier of the container. Falls back to the parent
   * container's id when not provided.
   */
  id?: Ref<string>

  /**
   * The reactive model value for this container. Falls back to the parent
   * container's model when not provided.
   */
  model?: Ref<any>

  /**
   * Whether the container is available (not excluded by conditions). Falls back
   * to the parent container's value when not provided.
   */
  available?: MaybeRef<boolean>

  /**
   * Whether the container is visible in the DOM. Falls back to the parent
   * container's value when not provided.
   */
  visible?: MaybeRef<boolean>

  /**
   * Whether the container is disabled. Falls back to the parent container's
   * value when not provided.
   */
  disabled?: MaybeRef<boolean>

  /**
   * The dot-separated path used for data binding. Falls back to the parent
   * container's value when not provided.
   */
  dataPath?: MaybeRef<string>

  /**
   * The dot-separated path used for element lookup. Falls back to the parent
   * container's value when not provided.
   */
  path?: MaybeRef<string>

  /**
   * The pager instance when the container uses pagination. Falls back to the
   * parent container's pager when not provided.
   */
  pager?: MaybeRef<Pager | undefined>

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
}
```

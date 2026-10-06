import { toRef, unref, type MaybeRef, type Ref } from 'vue'

import type { Pager, VueformChildren } from '#core/composables'
import { createContext } from '#core/helpers'

/**
 * Context for a container component (form, list, group, etc.) managing child
 * registration, model, and visibility.
 */
export type ContainerContext = {
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

/**
 * Maps container type identifiers to their corresponding component types.
 */
export interface ContainerTypes {
  /**
   * The root form container.
   */
  root: any

  /**
   * A holder group container (eg. checkboxes and radios).
   */
  holder: any

  /**
   * A grid layout container.
   */
  grid: any

  /**
   * A list container managing repeatable elements.
   */
  list: any

  /**
   * A matrix container for tabular input layouts.
   */
  matrix: any

  /**
   * A group container.
   */
  group: any

  /**
   * A transparent input container forwarding registration to its parent while
   * tracking opted-in descendants (e.g. addons) that push their errors up.
   */
  input: any
}

const [_useContainerContext, provideContainerContext] =
  createContext<ContainerContext>('vueform-container')

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

/**
 * Creates and provides a container context with child registration, model
 * binding, and visibility tracking.
 *
 * @param options Container context configuration including type, model, and
 *   optional parent container.
 */
export function createContainerContext(
  options: CreateContainerContextOptions
): ContainerContext {
  const register =
    options.register ||
    ((instance: any, path: string, dataPath?: string, initialModel?: any) => {
      options.children?.register(path, instance)
      options.container?.register(instance, path, dataPath, initialModel)
    })

  const unregister =
    options.unregister ||
    ((path: string, dataPath?: string, instance?: any) => {
      options.children?.unregister(path, instance)
      options.container?.unregister(path, dataPath, instance)
    })

  const update =
    options.update ||
    options.container?.update ||
    (() => {
      throw new Error('`update()` is not defined for this container context')
    })

  const subscribe =
    options.subscribe || options.container?.subscribe || (() => () => {})

  const containerContext = {
    id: options.id,
    type: options.type,
    children: options.children || options.container?.children,
    model: options.model,
    pager: toRef(() => unref(options.pager)),
    available: toRef(() => unref(options.available) ?? true),
    visible: toRef(() => unref(options.visible) ?? true),
    disabled: toRef(() => unref(options.disabled) ?? false),
    dataPath: toRef(() => unref(options.dataPath) ?? ''),
    path: toRef(() => unref(options.path) ?? ''),
    register,
    unregister,
    update,
    subscribe,
  }

  provideContainerContext(containerContext)

  return containerContext
}

/**
 * Injects the nearest ancestor container's context, providing access to the
 * container's model, child registration, and visibility state.
 *
 * @context
 */
export function useContainerContext(): ContainerContext | undefined {
  return _useContainerContext()
}

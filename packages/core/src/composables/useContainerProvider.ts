import type { MaybeRef, Ref } from 'vue'

import type { Pager, VueformChildren } from '#src/composables'
import {
  createContainerContext,
  type ContainerContext,
  type ContainerTypes,
} from '#src/contexts'

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

/**
 * Provides a container context that either transparently forwards registration
 * to the parent container or creates a specialized container with custom model,
 * registration, and update logic.
 *
 * @private
 * @param options The container provider configuration.
 */
export function useContainerProvider(options: UseContainerProviderOptions) {
  const {
    container,
    children,
    type = 'input',
    id,
    model,
    available,
    visible,
    disabled,
    dataPath,
    path,
    pager,
    register,
    unregister,
    update,
  } = options

  createContainerContext({
    type,
    id: id ?? container.id,
    model: model ?? container.model,
    dataPath: dataPath ?? container.dataPath,
    path: path ?? container.path,
    pager: pager ?? container.pager,
    available: available ?? container.available,
    visible: visible ?? container.visible,
    disabled: disabled ?? container.disabled,
    children,
    container,
    ...(register && { register }),
    ...(unregister && { unregister }),
    ...(update && { update }),
  })
}

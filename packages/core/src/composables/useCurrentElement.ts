import { computed, onMounted, onUpdated, shallowRef } from 'vue'

import { getGenericInstance, getInstanceRootNode } from '#core/utils'

/**
 * Returns a reactive ref to the current component's root DOM node, refreshed on
 * mount and after updates. Vapor-generic replacement for vueuse's
 * `useCurrentElement`, which reads `instance.proxy.$el` and throws inside Vapor
 * components.
 *
 * @private
 */
export function useCurrentElement<T extends Node = HTMLElement>() {
  const instance = getGenericInstance()
  const trigger = shallowRef(0)

  onMounted(() => {
    trigger.value++
  })
  onUpdated(() => {
    trigger.value++
  })

  return computed(() => {
    void trigger.value
    return (instance ? getInstanceRootNode(instance) : null) as T | null
  })
}

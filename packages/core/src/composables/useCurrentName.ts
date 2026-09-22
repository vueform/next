import type { ComponentNames } from '~/types'
import { getComponentDef, getGenericInstance } from '~/utils'

/**
 * Returns the registered component name of the current component instance (VDOM
 * or Vapor).
 *
 * @private
 */
export function useCurrentName() {
  const vm = getGenericInstance()
  if (!vm) {
    throw new Error('`useCurrentName()` must be called within setup() context')
  }
  return (getComponentDef(vm).name ||
    (vm.type as { name?: string }).name ||
    '') as ComponentNames
}

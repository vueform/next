import { getGenericInstance } from '~/utils'

/**
 * Returns the current component instance (VDOM or Vapor), throwing if called
 * outside of a setup context.
 *
 * @private
 */
export function useCurrentInstance() {
  const vm = getGenericInstance()

  if (!vm) {
    throw new Error(
      '`useCurrentInstance()` must be called within setup() context'
    )
  }

  return vm
}

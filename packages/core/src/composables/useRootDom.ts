import { toRef } from 'vue'
import { useCurrentElement } from './useCurrentElement'
import { rootDomOf } from '#core/utils'

/**
 * Returns a reactive ref to the root DOM element of the current component.
 *
 * @private
 */
export function useRootDom() {
  const $el = useCurrentElement()

  return toRef(() => rootDomOf($el))
}

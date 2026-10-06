import { toRef } from 'vue'

import { rootDomOf } from '#core/utils'

import { useCurrentElement } from './useCurrentElement'

/**
 * Returns a reactive ref to the root DOM element of the current component.
 *
 * @private
 */
export function useRootDom() {
  const $el = useCurrentElement()

  return toRef(() => rootDomOf($el))
}

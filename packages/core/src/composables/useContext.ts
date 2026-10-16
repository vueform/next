import { useComponentContext } from '#src/contexts'
import type { ComponentNames, ContextOf } from '#src/types'

/**
 * Returns the public context of the nearest Vueform component — the same object
 * it passes to the `#template` slot and the one event handlers receive as
 * `context$`.
 *
 * @param name The component name used for type inference.
 */
export function useContext<T extends ComponentNames>(_name: T): ContextOf<T> {
  return useComponentContext() as ContextOf<T>
}

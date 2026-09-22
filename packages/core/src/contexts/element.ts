import { useComponentContext } from '~/contexts'
import { createContext } from '~/helpers'
import type { UnknownElement } from '~/types'

const [_useElementContext, provideElementContext] =
  createContext<UnknownElement>('vueform-element')

/**
 * Creates and provides the element context from the current component context.
 */
export function createElementContext(): UnknownElement {
  const el$ = useComponentContext()

  provideElementContext(el$)

  return el$
}

/**
 * Injects the nearest ancestor element's context, providing access to the
 * element's state, model, and API.
 *
 * @context
 */
export function useElementContext(): UnknownElement | undefined {
  return _useElementContext()
}

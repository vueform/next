import { useContainerProvider } from '~/composables'
import type { makeElement } from '~/features'
import { defineFeature } from '~/helpers'
import type { ReturnsOf } from '~/types'

/**
 * Configuration for the provider factory wiring container context for child
 * elements.
 */
type MakeProviderOptions = {
  deps: ReturnsOf<[[typeof makeElement, ['container', 'children']]]>
}

/**
 * Provides container context to child elements via the parent container and
 * children registry from the element factory.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
export const makeProvider = defineFeature(
  () =>
    ({ deps }: MakeProviderOptions) => {
      const { container, children } = deps

      useContainerProvider({ container, children })

      return {}
    }
)

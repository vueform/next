import { useComponentContext } from '#src/contexts'
import { defineFeature, type FeatureEvents } from '#src/helpers'
import type { LooseContext } from '#src/types'

/**
 * Configuration for the key handlers factory wiring keyboard event handlers.
 */
type MakeKeyHandlersOptions = {
  events: FeatureEvents<{
    keydown: [event: Event, context$: LooseContext]
    keyup: [event: Event, context$: LooseContext]
    keypress: [event: Event, context$: LooseContext]
  }>
}

/**
 * Provides keyboard event handlers that fire keydown, keyup, and keypress
 * events on the element.
 *
 * @param options Factory options containing the event system.
 */
export const makeKeyHandlers = defineFeature(
  () =>
    ({ events }: MakeKeyHandlersOptions) => {
      const { fire } = events
      const context$ = useComponentContext()

      // ============== METHODS ===============

      /**
       * Fires the keydown event on the element.
       *
       * @param e The keyboard event.
       */
      const handleKeydown = (e: Event) => fire('keydown', e, context$)

      /**
       * Fires the keyup event on the element.
       *
       * @param e The keyboard event.
       */
      const handleKeyup = (e: Event) => fire('keyup', e, context$)

      /**
       * Fires the keypress event on the element.
       *
       * @param e The keyboard event.
       */
      const handleKeypress = (e: Event) => fire('keypress', e, context$)

      return {
        handleKeydown,
        handleKeyup,
        handleKeypress,
      }
    }
)

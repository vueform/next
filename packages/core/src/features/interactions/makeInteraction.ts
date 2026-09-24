import { ref } from 'vue'
import { useRootDom } from '@core/composables'
import { useComponentContext } from '@core/contexts'
import { defineFeature, type FeatureEvents } from '@core/helpers'

/**
 * Configuration for the focusable factory enabling programmatic focus and
 * related behavior.
 */
type MakeInteractionOptions = {
  events: FeatureEvents<{
    blur: [context$: any]
    focus: [context$: any]
  }>
}

/**
 * Provides focus state tracking and focus event firing for elements.
 *
 * @param options Factory options containing dependencies and the event system.
 */
export const makeInteraction = defineFeature(
  () =>
    ({ events }: MakeInteractionOptions) => {
      const { on } = events
      const root = useRootDom()
      const context$ = useComponentContext()

      /**
       * Whether the element is currently focused.
       */
      const focused = ref(false)

      /**
       * Whether the element has been touched (blurred) by the user.
       */
      const touched = ref(false)

      /**
       * Whether the element has been visited (focused) by the user.
       */
      const visited = ref(false)

      /**
       * Fires the blur event on the element.
       *
       * @param {Event} e - The blur event object.
       */
      const handleBlur = (e: Event) => {
        if (!root.value) return
        const next = (
          'relatedTarget' in e ? e.relatedTarget || null : null
        ) as Node | null
        if (next && root.value.contains(next)) return
        events.fire('blur', context$)
      }

      /**
       * Handles focus by setting the focused state and firing the focus event.
       *
       * @param {Event} e - The focus event object.
       */
      const handleFocus = (e: Event) => {
        const _e = e
        if (focused.value) return
        events.fire('focus', context$)
      }

      on('focus', () => {
        focused.value = true
        visited.value = true
      })

      on('blur', () => {
        focused.value = false
        touched.value = true
      })

      return {
        focused,
        touched,
        visited,
        handleBlur,
        handleFocus,
      }
    }
)

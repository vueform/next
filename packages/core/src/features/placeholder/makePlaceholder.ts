import { computed } from 'vue'
import { useDynamicProp, useFallbackProp } from '@core/composables'
import { useComponentContext } from '@core/contexts'
import { defineFeature } from '@core/helpers'
import type { ShowRequiredProp, TProp } from '@core/types'

/**
 * Configuration for the placeholder factory supplying resolved placeholder text
 * for inputs.
 */
type MakePlaceholderOptions = {
  props: {
    placeholder: TProp | undefined
  }
}

/**
 * Resolves the placeholder text for input elements.
 *
 * @param options Factory options containing element props.
 */
export const makePlaceholder = defineFeature(
  () =>
    ({ props }: MakePlaceholderOptions) => {
      const context$ = useComponentContext()
      const showRequired = useFallbackProp<ShowRequiredProp>('showRequired')

      // ============== COMPUTED ==============

      /**
       * The resolved placeholder text, supporting static strings and dynamic
       * text props.
       */
      const placeholder = useDynamicProp('placeholder', props, {
        localize: true,
        required: computed(
          () =>
            !!showRequired.value &&
            showRequired.value.includes('placeholder') &&
            !!context$?.required
        ),
      })

      return {
        placeholder,
      }
    }
)

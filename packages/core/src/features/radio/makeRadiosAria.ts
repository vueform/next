import { computed } from 'vue'
import { type makeLayout, type makeData } from '~/features'
import { defineFeature } from '~/helpers'
import type { ReturnsOf } from '~/types'

/**
 * Configuration for the radios group ARIA factory resolving invalid, required,
 * and describedby attributes.
 */
type MakeRadiosAriaOptions = {
  deps: ReturnsOf<
    [
      [typeof makeLayout, ['errorId']],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}

/**
 * Provides computed ARIA attributes for a radio group container.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
export const makeRadiosAria = defineFeature(
  () =>
    ({ deps }: MakeRadiosAriaOptions) => {
      const { invalid, required, hasError, errorId } = deps

      /**
       * ARIA attributes for the radio group, including invalid, required, and
       * describedby states.
       */
      const radioAria = computed(() => ({
        'aria-invalid': invalid.value,
        'aria-required': required.value,
        'aria-describedby': hasError.value ? errorId.value : undefined,
      }))

      return {
        radioAria,
      }
    }
)

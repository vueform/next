import { computed } from 'vue'
import type { ReturnsOf } from '#core/types'
import { type makeLayout, type makeData } from '#core/features'
import { defineFeature } from '#core/helpers'

/**
 * Configuration for the checkboxes group ARIA factory resolving invalid,
 * required, and describedby attributes.
 */
type MakeCheckboxesAriaOptions = {
  deps: ReturnsOf<
    [
      [typeof makeLayout, ['errorId']],
      [typeof makeData, ['invalid', 'required', 'hasError']],
    ]
  >
}

/**
 * Provides computed ARIA attributes for a checkbox group container.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
export const makeCheckboxesAria = defineFeature(
  () =>
    ({ deps }: MakeCheckboxesAriaOptions) => {
      const { invalid, required, hasError, errorId } = deps

      /**
       * Computed ARIA attributes for the checkbox group (invalid, required,
       * describedby).
       */
      const checkboxAria = computed(() => ({
        'aria-invalid': invalid.value,
        'aria-required': required.value,
        'aria-describedby': hasError.value ? errorId.value : undefined,
      }))

      return {
        checkboxAria,
      }
    }
)

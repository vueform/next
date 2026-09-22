import { computed } from 'vue'
import { type makeLayout, type makeData, type makeText } from '~/features'
import { defineFeature } from '~/helpers'
import type { AriaProp, ReturnsOf, TProp } from '~/types'

/**
 * Configuration for the checkbox ARIA factory resolving describedby, invalid,
 * required, and busy attributes.
 */
type MakeCheckboxAriaOptions = {
  props: {
    aria: AriaProp | undefined
    label: TProp | undefined
    help: TProp | undefined
    description: TProp | undefined
  }

  deps: ReturnsOf<
    [
      [typeof makeLayout, ['labelId', 'helpId', 'descriptionId', 'errorId']],
      [typeof makeData, ['hasError', 'busy', 'required']],
      [typeof makeText, ['text']],
    ]
  >
}

/**
 * Provides computed ARIA attributes for a checkbox input.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeCheckboxAria = defineFeature(
  () =>
    ({ props, deps }: MakeCheckboxAriaOptions) => {
      const {
        labelId,
        helpId,
        descriptionId,
        errorId,
        hasError,
        busy,
        required,
        text,
      } = deps

      /**
       * Computed ARIA attributes for the checkbox (describedby, invalid,
       * required, busy).
       */
      const aria = computed(() => {
        return {
          'aria-describedby':
            [
              text?.value && !!props.label ? labelId.value : null,
              !!props.help ? helpId.value : null,
              !!props.description ? descriptionId.value : null,
              hasError.value ? errorId.value : null,
            ]
              .filter((d) => !!d)
              .join(' ') || undefined,
          'aria-invalid': hasError.value || undefined,
          'aria-required': required.value || undefined,
          'aria-busy': busy.value || undefined,
          ...props.aria,
        }
      })

      return {
        aria,
      }
    }
)

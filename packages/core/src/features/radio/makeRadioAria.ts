import { computed } from 'vue'

import { type makeLayout, type makeData, type makeText } from '#core/features'
import { defineFeature } from '#core/helpers'
import type { AriaProp, ReturnsOf, TProp } from '#core/types'

/**
 * Configuration for the radio ARIA factory resolving describedby, invalid,
 * required, and busy attributes.
 */
type MakeRadioAriaOptions = {
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
 * Provides computed ARIA attributes for a radio input.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeRadioAria = defineFeature(
  () =>
    ({ props, deps }: MakeRadioAriaOptions) => {
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
       * ARIA attributes for the radio input, including describedby, invalid,
       * required, and busy states.
       */
      const aria = computed(() => {
        return {
          'aria-describedby':
            [
              text?.value ? labelId.value : null,
              props.help ? helpId.value : null,
              props.description ? descriptionId.value : null,
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

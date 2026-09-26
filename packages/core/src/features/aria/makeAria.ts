import { computed } from 'vue'
import type { AriaProp, ReturnsOf } from '#core/types'
import { type makeLayout, type makeData } from '#core/features'
import { defineFeature } from '#core/helpers'

/**
 * Configuration for the ARIA factory wiring ARIA attributes and described-by
 * relationships.
 */
type MakeAriaOptions = {
  props: {
    aria: AriaProp | undefined
  }
  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        ['helpId', 'descriptionId', 'errorId', 'help', 'description'],
      ],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}

/**
 * Provides default computed ARIA attributes for elements that rely on generic
 * layout features (help, description, error regions) and have no
 * element-specific ARIA needs.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeAria = defineFeature(
  () =>
    ({ deps, props }: MakeAriaOptions) => {
      const {
        help,
        description,
        helpId,
        descriptionId,
        errorId,
        hasError,
        busy,
        required,
      } = deps

      /**
       * Computed ARIA attributes (describedby, labelledby, invalid, required,
       * busy) derived from element state and props, keyed by aria attr names.
       */
      const aria = computed(() => {
        return {
          'aria-describedby':
            [
              help.value ? helpId.value : null,
              description.value ? descriptionId.value : null,
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

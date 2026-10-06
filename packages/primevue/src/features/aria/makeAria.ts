import {
  defineFeature,
  type AriaProp,
  type ReturnsOf,
  type makeData,
  type makeLayout,
} from '@vueform/core'
import { computed } from 'vue'

import { type makeFloatLabel, type makeIfta } from '#primevue/features'

/**
 * Configuration for the PrimeVue ARIA factory wiring describedby with float
 * label and IFTA awareness.
 */
type MakeAriaOptions = {
  props: {
    aria: AriaProp | undefined
  }
  deps: ReturnsOf<
    [
      [
        typeof makeLayout,
        [
          'labelId',
          'helpId',
          'descriptionId',
          'errorId',
          'label',
          'help',
          'description',
        ],
      ],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ],
    [[typeof makeFloatLabel, ['floatLabel']], [typeof makeIfta, ['ifta']]]
  >
}

/**
 * Provides computed ARIA attributes for PrimeVue adapter elements, including
 * float-label and IFTA-aware describedby that references the label region when
 * the input uses a floating or in-field label.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeAria = defineFeature(
  () =>
    ({ props, deps }: MakeAriaOptions) => {
      const {
        label,
        help,
        description,
        labelId,
        helpId,
        descriptionId,
        errorId,
        hasError,
        busy,
        required,
        floatLabel,
        ifta,
      } = deps

      /**
       * Computed ARIA attributes (describedby, labelledby, invalid, required,
       * busy) derived from element state and props.
       */
      const aria = computed(() => ({
        'aria-describedby':
          [
            (ifta?.value !== undefined || floatLabel?.value !== undefined) &&
            !!label.value
              ? labelId.value
              : null,
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
      }))

      return {
        aria,
      }
    }
)

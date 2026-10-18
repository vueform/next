import {
  buildDescribedBy,
  buildLayoutBags,
  defineFeature,
  type AriaA11y,
  type ReturnsOf,
  type makeData,
  type makeLayout,
} from '@vueform/core'
import { computed } from 'vue'

import { type makeFloatLabel, type makeIfta } from '#src/features'

/**
 * Configuration for the PrimeVue ARIA factory wiring describedby with float
 * label and IFTA awareness.
 */
type MakeAriaOptions = {
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
 * Provides the part-keyed accessibility bindings for PrimeVue adapter
 * elements: the `input` bag carries ARIA state (describedby, invalid,
 * required, busy) with a float-label/IFTA-aware describedby that references
 * the label region when the input uses a floating or in-field label, and the
 * layout bags (label, help, description, error) carry the ids and roles their
 * regions must render with.
 *
 * @param options Factory options containing element dependencies.
 */
export const makeAria = defineFeature(() => ({ deps }: MakeAriaOptions) => {
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
   * Part-keyed accessibility bindings: ARIA attributes for the input and
   * ids/roles for the layout-rendered label, help, description, and error
   * parts.
   */
  const a11yBindings = computed<AriaA11y>(() => ({
    input: {
      'aria-describedby': buildDescribedBy([
        (ifta?.value !== undefined || floatLabel?.value !== undefined) &&
        !!label.value
          ? labelId.value
          : null,
        help.value ? helpId.value : null,
        description.value ? descriptionId.value : null,
        hasError.value ? errorId.value : null,
      ]),
      'aria-invalid': hasError.value || undefined,
      'aria-required': required.value || undefined,
      'aria-busy': busy.value || undefined,
    },
    ...buildLayoutBags({
      labelId: labelId.value,
      helpId: helpId.value,
      descriptionId: descriptionId.value,
      errorId: errorId.value,
    }),
  }))

  return {
    a11yBindings,
  }
})

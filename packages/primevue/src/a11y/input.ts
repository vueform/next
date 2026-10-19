import {
  buildDescribedBy,
  buildLayoutBags,
  type InputAriaA11y,
} from '@vueform/core'

import { labelDescribes, type LayoutPatternApi } from './layout'

/**
 * A11y pattern for PrimeVue adapter elements: the `input` bag carries ARIA
 * state (describedby, invalid, required, busy) with a float-label/IFTA-aware
 * describedby that references the label region when the input uses a floating
 * or in-field label, and the layout bags (label, help, description, errors)
 * carry the ids and roles their regions must render with.
 *
 * Register with `useA11y(inputAria())`.
 */
export const inputAria =
  () =>
  (api: LayoutPatternApi): InputAriaA11y => ({
    input: {
      'aria-describedby': buildDescribedBy([
        labelDescribes(api) ? api.labelId.value : null,
        api.help.value ? api.helpId.value : null,
        api.description.value ? api.descriptionId.value : null,
        api.hasError.value ? api.errorId.value : null,
      ]),
      'aria-invalid': api.hasError.value || undefined,
      'aria-required': api.required.value || undefined,
      'aria-busy': api.busy.value || undefined,
    },
    ...buildLayoutBags({
      labelId: api.labelId.value,
      helpId: api.helpId.value,
      descriptionId: api.descriptionId.value,
      errorId: api.errorId.value,
    }),
  })

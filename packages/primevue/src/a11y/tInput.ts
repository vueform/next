import {
  buildDescribedBy,
  buildLayoutBags,
  type TAriaA11y,
} from '@vueform/core'
import type { Ref } from 'vue'

import { labelDescribes, type LayoutPatternApi } from './layout'

/**
 * A11y pattern for translatable PrimeVue text inputs: the `input` bag
 * additionally references the editing-language live region and carries the
 * input's `lang`, with the same float-label/IFTA-aware describedby as
 * `inputAria`.
 *
 * Register with `useA11y(tInputAria())`.
 */
export const tInputAria =
  () =>
  (
    api: LayoutPatternApi & {
      language: Ref<string>
      languageId: Ref<string>
      translatable: Ref<boolean>
    }
  ): TAriaA11y => ({
    input: {
      'aria-describedby': buildDescribedBy([
        labelDescribes(api) ? api.labelId.value : null,
        api.translatable.value ? api.languageId.value : null,
        api.props.help ? api.helpId.value : null,
        api.props.description ? api.descriptionId.value : null,
        api.hasError.value ? api.errorId.value : null,
      ]),
      'aria-invalid': api.hasError.value || undefined,
      'aria-required': api.required.value || undefined,
      'aria-busy': api.busy.value || undefined,
      lang: api.translatable.value ? api.language.value : undefined,
    },
    ...buildLayoutBags({
      labelId: api.labelId.value,
      helpId: api.helpId.value,
      descriptionId: api.descriptionId.value,
      errorId: api.errorId.value,
    }),
  })

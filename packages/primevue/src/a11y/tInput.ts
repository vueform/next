import {
  buildDescribedBy,
  layoutRegionBindings,
  type BindingDefsOf,
  type LayoutRegionBindings,
  type TInputAriaBag,
} from '@vueform/core'
import type { Ref } from 'vue'

import { labelDescribes, type LayoutPatternApi } from './layout'

/**
 * Binding pattern for translatable PrimeVue text inputs: the `input` entry
 * carries the input's `lang` for the active editing language, with the same
 * float-label/IFTA-aware describedby as `inputAria`.
 *
 * Register with `useBindings(tInputAria(api))`.
 *
 * @param api The component api slice the entries read.
 */
export const tInputAria = (
  api: LayoutPatternApi & {
    language: Ref<string>
    translatable: Ref<boolean>
  }
): BindingDefsOf<LayoutRegionBindings & { input: TInputAriaBag }> => ({
  // Annotated so excess-property checking fires on the literal (see
  // `inputAria`).
  input: (): TInputAriaBag => ({
    'aria-describedby': buildDescribedBy([
      labelDescribes(api) ? api.labelId.value : null,
      api.props.help ? api.helpId.value : null,
      api.props.description ? api.descriptionId.value : null,
      api.hasError.value ? api.errorId.value : null,
    ]),
    'aria-invalid': api.hasError.value || undefined,
    'aria-required': api.required.value || undefined,
    'aria-busy': api.busy.value || undefined,
    lang: api.translatable.value ? api.language.value : undefined,
  }),
  ...layoutRegionBindings(api),
})

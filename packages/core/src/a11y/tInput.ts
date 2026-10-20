import type { Ref } from 'vue'

import type { BindingDefsOf } from '#src/composables'
import type { Prettify } from '#src/types/utils.ts'
import { buildDescribedBy } from '#src/utils'

import type { InputAriaBag } from './input'
import {
  layoutRegionBindings,
  showsHelp,
  type LayoutPatternApi,
  type LayoutRegionBindings,
} from './layout'

/**
 * Part-keyed binding entries produced by the `tInputAria` pattern for
 * translatable text inputs: the `input` entry additionally references the
 * editing-language live region and carries the input's `lang`.
 */
/**
 * The attribute bag the `tInputAria` pattern resolves for the `input` part:
 * the `inputAria` state plus the active editing language.
 */
export interface TInputAriaBag extends InputAriaBag {
  lang?: string
}

/**
 * Binding pattern for translatable text inputs: the `input` entry
 * additionally references the editing-language live region and carries the
 * input's `lang`.
 *
 * Register with `useBindings(tInputAria(api))`.
 *
 * @param api The component api slice the entries read.
 */
export const tInputAria = (
  api: LayoutPatternApi & {
    language: Ref<string>
    languageId: Ref<string | undefined>
    translatable: Ref<boolean>
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
): Prettify<
  BindingDefsOf<LayoutRegionBindings & { input: TInputAriaBag }>
> => ({
  input: (): TInputAriaBag => ({
    'aria-describedby':
      api.props.layout !== false
        ? buildDescribedBy([
            api.translatable.value ? api.languageId.value : null,
            showsHelp(api) ? api.helpId.value : null,
            api.description.value ? api.descriptionId.value : null,
            api.hasError.value ? api.errorId.value : null,
          ])
        : undefined,
    'aria-invalid': api.hasError.value || undefined,
    'aria-required': api.required.value || undefined,
    'aria-busy': api.busy.value || undefined,
    lang: api.translatable.value ? api.language.value : undefined,
  }),
  ...layoutRegionBindings(api),
})

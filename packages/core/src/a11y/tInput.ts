import type { Ref } from 'vue'

import { buildDescribedBy } from '#src/utils'

import type { InputAriaA11y } from './input'
import { buildLayoutBags, showsHelp, type LayoutPatternApi } from './layout'

/**
 * Part-keyed accessibility bindings produced by the `tInputAria` pattern for
 * translatable text inputs: the `input` bag additionally references the
 * editing-language live region and carries the input's `lang`.
 */
export interface TAriaA11y extends InputAriaA11y {
  /**
   * ARIA state for the input control, including the active editing language.
   */
  input: {
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
    'aria-busy'?: true
    lang?: string
  }
}

/**
 * A11y pattern for translatable text inputs: the `input` bag additionally
 * references the editing-language live region and carries the input's `lang`.
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
      hasError: Ref<boolean>
      busy: Ref<boolean>
      required: Ref<boolean>
    }
  ): TAriaA11y => ({
    input: {
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
    },
    ...buildLayoutBags({
      labelId: api.labelId.value,
      helpId: api.helpId.value,
      descriptionId: api.descriptionId.value,
      errorId: api.errorId.value,
    }),
  })

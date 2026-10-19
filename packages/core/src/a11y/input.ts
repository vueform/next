import type { Ref } from 'vue'

import { buildDescribedBy } from '#src/utils'

import {
  buildLayoutBags,
  showsHelp,
  type A11yLayoutBags,
  type LayoutPatternApi,
} from './layout'

/**
 * Part-keyed accessibility bindings produced by the `inputAria` pattern for
 * single-input elements: the `input` bag's ARIA state plus the layout parts'
 * ids and roles.
 */
export interface InputAriaA11y extends A11yLayoutBags {
  /**
   * ARIA state for the input control: describedby to the rendered
   * help/description/error regions, plus invalid, required, and busy state.
   */
  input: {
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
    'aria-busy'?: true
  }
}

/**
 * A11y pattern for single-input elements: the `input` bag carries ARIA state
 * (describedby, invalid, required, busy), and the layout bags (label, help,
 * description, errors) carry the ids and roles their regions must render
 * with.
 *
 * Register with `useA11y(inputAria())`.
 */
export const inputAria =
  () =>
  (
    api: LayoutPatternApi & {
      hasError: Ref<boolean>
      busy: Ref<boolean>
      required: Ref<boolean>
    }
  ): InputAriaA11y => ({
    input: {
      'aria-describedby':
        api.props.layout !== false
          ? buildDescribedBy([
              showsHelp(api) ? api.helpId.value : null,
              api.description.value ? api.descriptionId.value : null,
              api.hasError.value ? api.errorId.value : null,
            ])
          : undefined,
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

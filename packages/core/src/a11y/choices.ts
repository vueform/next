import type { Ref } from 'vue'

import { buildDescribedBy } from '#src/utils'

import {
  buildLayoutBags,
  showsHelp,
  type A11yLayoutBags,
  type LayoutPatternApi,
} from './layout'

/**
 * Part-keyed accessibility bindings produced by the `choicesAria` pattern for
 * choice-group elements: the `wrapper` bag carries the group container's
 * role, labelling, describedby, and group-level state.
 */
export interface GroupAriaA11y extends A11yLayoutBags {
  /**
   * Role, labelling, and ARIA state for the group container.
   */
  wrapper: {
    role: 'group' | 'radiogroup'
    'aria-labelledby'?: string
    'aria-label'?: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
  }
}

/**
 * A11y pattern for choice-group elements: the `wrapper` bag carries the group
 * container's role, labelling (labelledby when a label renders, aria-label
 * fallback otherwise), describedby, and group-level state.
 *
 * Register with `useA11y(choicesAria({ role: 'radiogroup' }))`.
 *
 * @param config `role` picks the container role (`'group'` by default,
 *   `'radiogroup'` for radio groups).
 */
export const choicesAria =
  (config?: {
    /**
     * The group container's ARIA role: `'group'` (default) for checkbox
     * groups, `'radiogroup'` for radio groups.
     */
    role?: 'group' | 'radiogroup'
  }) =>
  (
    api: LayoutPatternApi & {
      genericName: Ref<string>
      invalid: Ref<boolean>
      required: Ref<boolean>
      hasError: Ref<boolean>
    }
  ): GroupAriaA11y => ({
    wrapper: {
      role: config?.role ?? 'group',
      // A slot-only label resolves to '' but still renders, so the test is
      // against undefined, not truthiness.
      'aria-labelledby':
        api.label.value !== undefined ? api.labelId.value : undefined,
      'aria-label':
        api.label.value === undefined ? api.genericName.value : undefined,
      'aria-describedby': buildDescribedBy([
        showsHelp(api) ? api.helpId.value : null,
        api.description.value ? api.descriptionId.value : null,
        api.hasError.value ? api.errorId.value : null,
      ]),
      'aria-invalid': api.invalid.value || undefined,
      'aria-required': api.required.value || undefined,
    },
    ...buildLayoutBags({
      labelId: api.labelId.value,
      helpId: api.helpId.value,
      descriptionId: api.descriptionId.value,
      errorId: api.errorId.value,
    }),
  })

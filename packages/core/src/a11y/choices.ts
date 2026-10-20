import type { Ref } from 'vue'

import type { BindingDefsOf } from '#src/composables'
import { buildDescribedBy } from '#src/utils'

import {
  layoutRegionBindings,
  showsHelp,
  type LayoutPatternApi,
  type LayoutRegionBindings,
} from './layout'

/**
 * The attribute bag the `choicesAria` pattern resolves for the `wrapper`
 * part: the group container's role, labelling, describedby, and group-level
 * state. Components whose `wrapper` entry merges their own attributes on top
 * compose it (`() => { ... } & ChoicesAriaBag`). The entry producing it is a
 * zero-argument resolver on purpose: it reads child-aggregating state
 * (`invalid`, `hasError`), which must resolve in the wrapper's own render
 * effect — never inside a shared computed that children's vapor dynamic prop
 * sources pull, where it would close a reactive cycle (aggregate ->
 * children's validation -> child props -> this component's bindings) that
 * Vue 3.6's dirty-check walk cannot terminate on.
 */
export interface ChoicesAriaBag {
  role: 'group' | 'radiogroup'
  'aria-labelledby'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
}

/**
 * Binding pattern for choice-group elements: the `wrapper` entry carries the
 * group container's role, labelling (labelledby when a label renders,
 * aria-label fallback otherwise), describedby, and group-level state.
 *
 * Register with `useBindings(choicesAria(api, { role: 'radiogroup' }))`.
 *
 * @param api The component api slice the entries read.
 * @param config `role` picks the container role (`'group'` by default,
 *   `'radiogroup'` for radio groups).
 */
export const choicesAria = (
  api: LayoutPatternApi & {
    genericName: Ref<string>
    invalid: Ref<boolean>
    required: Ref<boolean>
    hasError: Ref<boolean>
  },
  config?: {
    /**
     * The group container's ARIA role: `'group'` (default) for checkbox
     * groups, `'radiogroup'` for radio groups.
     */
    role?: 'group' | 'radiogroup'
  }
): BindingDefsOf<LayoutRegionBindings & { wrapper: ChoicesAriaBag }> => ({
  // Annotated so excess-property checking fires on the literal (see
  // `inputAria`).
  wrapper: (): ChoicesAriaBag => ({
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
  }),
  ...layoutRegionBindings(api),
})

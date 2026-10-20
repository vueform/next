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
 * The attribute bag the `inputAria` pattern resolves for the `input` part:
 * describedby to the rendered help/description/error regions, plus invalid,
 * required, and busy state. Components whose `input` entry merges their own
 * attributes on top compose it (`() => { ... } & InputAriaBag`).
 */
export interface InputAriaBag {
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
  'aria-busy'?: true
}

/**
 * Binding pattern for single-input elements: the `input` entry carries ARIA
 * state (describedby, invalid, required, busy), and the layout entries
 * (label, help, description, errors) carry the ids and roles their regions
 * must render with.
 *
 * Register with `useBindings(inputAria(api))`. The entries read
 * child-aggregating state (`hasError`), which is exactly why they are
 * zero-argument resolvers: the reads run in each part's own render effect,
 * never inside a shared computed that children's vapor prop sources pull.
 *
 * @param api The component api slice the entries read.
 */
export const inputAria = (
  api: LayoutPatternApi & {
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
): BindingDefsOf<LayoutRegionBindings & { input: InputAriaBag }> => ({
  // The explicit return annotation puts the bag type directly on the literal,
  // where excess-property checking fires — `BindingDefsOf`'s conditional
  // mapped type cannot propagate contextual typing this deep, and the bag's
  // all-optional props would otherwise let a misspelled attribute through.
  input: (): InputAriaBag => ({
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
  }),
  ...layoutRegionBindings(api),
})

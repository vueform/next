import {
  buildDescribedBy,
  layoutRegionBindings,
  type BindingDefsOf,
  type InputAriaBag,
  type LayoutRegionBindings,
} from '@vueform/core'

import { labelDescribes, type LayoutPatternApi } from './layout'

/**
 * Binding pattern for PrimeVue adapter elements: the `input` entry carries
 * ARIA state (describedby, invalid, required, busy) with a
 * float-label/IFTA-aware describedby that references the label region when
 * the input uses a floating or in-field label, and the layout entries (label,
 * help, description, errors) carry the ids and roles their regions must
 * render with.
 *
 * Register with `useBindings(inputAria(api))`. The entries read
 * child-aggregating state (`hasError`), which is exactly why they are
 * zero-argument resolvers: the reads run in each part's own render effect,
 * never inside a shared computed that children's vapor prop sources pull.
 *
 * @param api The component api slice the entries read.
 */
export const inputAria = (
  api: LayoutPatternApi
): BindingDefsOf<LayoutRegionBindings & { input: InputAriaBag }> => ({
  // The explicit return annotation puts the bag type directly on the literal,
  // where excess-property checking fires — `BindingDefsOf`'s conditional
  // mapped type cannot propagate contextual typing this deep, and the bag's
  // all-optional props would otherwise let a misspelled attribute through.
  input: (): InputAriaBag => ({
    'aria-describedby': buildDescribedBy([
      labelDescribes(api) ? api.labelId.value : null,
      api.help.value ? api.helpId.value : null,
      api.description.value ? api.descriptionId.value : null,
      api.hasError.value ? api.errorId.value : null,
    ]),
    'aria-invalid': api.hasError.value || undefined,
    'aria-required': api.required.value || undefined,
    'aria-busy': api.busy.value || undefined,
  }),
  ...layoutRegionBindings(api),
})

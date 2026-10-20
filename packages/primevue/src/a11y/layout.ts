import type { Ref } from 'vue'

/**
 * The slice of a component api the PrimeVue a11y patterns read. Patterns build
 * part-keyed binding definitions whose entries are zero-argument resolvers:
 * every `.value` read runs at the part's consuming site (its own render
 * effect), never while the definition is registered or merged.
 */
export interface LayoutPatternApi {
  props: {
    /**
     * The element's help text, when given.
     */
    help?: unknown

    /**
     * The element's description text, when given.
     */
    description?: unknown
  }
  label: Ref<string | undefined>
  help: Ref<unknown>
  description: Ref<unknown>
  labelId: Ref<string>
  helpId: Ref<string>
  descriptionId: Ref<string>
  errorId: Ref<string>
  hasError: Ref<boolean>
  busy: Ref<boolean>
  required: Ref<boolean>
  floatLabel?: Ref<unknown>
  ifta?: Ref<unknown>
}

/**
 * Whether the input uses a floating or in-field (IFTA) label, in which case
 * the label region is referenced from `aria-describedby`.
 */
export const labelDescribes = (api: LayoutPatternApi) =>
  (api.ifta?.value !== undefined || api.floatLabel?.value !== undefined) &&
  !!api.label.value

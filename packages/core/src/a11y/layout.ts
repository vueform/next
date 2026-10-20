import type { Ref } from 'vue'

import type { BindingDefsOf } from '#src/composables'

/**
 * Resolved binding bags for the layout-rendered parts (label, help,
 * description, error): the ids the control's `aria-describedby` /
 * `aria-labelledby` point at, and the error region's alert role. The runtime
 * pattern supplies them as zero-argument resolvers (a definition-side
 * freedom), so they resolve at each part's consuming site while the keys stay
 * static.
 */
export interface LayoutRegionBindings {
  /**
   * The label element's id, referenced by `aria-labelledby` relationships.
   */
  label: {
    id: string
  }

  /**
   * The help region's id, referenced by `aria-describedby` when help renders.
   */
  help: {
    id: string
  }

  /**
   * The description region's id, referenced by `aria-describedby`.
   */
  description: {
    id: string
  }

  /**
   * The errors container's id and alert role, referenced by
   * `aria-describedby` while the element has errors. Keyed `errors` to match
   * the part it binds to (the per-error item part is `error`).
   */
  errors: {
    id: string
    role: 'alert'
  }
}

/**
 * The slice of a component api every layout-aware binding pattern reads.
 * Patterns build part-keyed definitions whose entries are zero-argument
 * resolvers: every `.value` read runs at the part's consuming site (its own
 * render effect), never while the definition is registered or merged.
 */
export interface LayoutPatternApi {
  props: {
    /**
     * When `false`, the element renders without its layout (no label, help,
     * description, or error regions), so no describedby relationship can be
     * established.
     */
    layout?: unknown

    /**
     * When `true`, the label group (which also hosts the help region) is not
     * rendered.
     */
    hideLabel?: boolean
  }
  label: Ref<string | undefined>
  help: Ref<unknown>
  description: Ref<unknown>
  labelId: Ref<string>
  helpId: Ref<string>
  descriptionId: Ref<string>
  errorId: Ref<string>
}

/**
 * Resolves whether the help region currently renders: it lives inside the
 * label group, so it only exists when the label does.
 */
export const showsHelp = (api: LayoutPatternApi) =>
  !!api.help.value && api.label.value !== undefined && !api.props.hideLabel

/**
 * Binding entries for the layout-rendered parts (label, help, description,
 * error) so slot users replacing those regions keep the id relationships the
 * input's `aria-describedby` points at.
 *
 * @param api The component api carrying the layout region ids.
 */
export const layoutRegionBindings = (
  api: Pick<
    LayoutPatternApi,
    'labelId' | 'helpId' | 'descriptionId' | 'errorId'
  >
): BindingDefsOf<LayoutRegionBindings> => ({
  label: (): LayoutRegionBindings['label'] => ({ id: api.labelId.value }),
  help: (): LayoutRegionBindings['help'] => ({ id: api.helpId.value }),
  description: (): LayoutRegionBindings['description'] => ({
    id: api.descriptionId.value,
  }),
  errors: (): LayoutRegionBindings['errors'] => ({
    id: api.errorId.value,
    role: 'alert',
  }),
})

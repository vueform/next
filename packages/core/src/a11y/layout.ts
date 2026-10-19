import type { Ref } from 'vue'

/**
 * Binding bags for the layout-rendered parts (label, help, description,
 * error): the ids the control's `aria-describedby` / `aria-labelledby` point
 * at, and the error region's alert role.
 */
export interface A11yLayoutBags {
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
 * The slice of a component api every layout-aware a11y pattern reads.
 * Patterns are invoked inside the `useA11y` merged computed, so every
 * `.value` read stays tracked.
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
 * Binding bags for the layout-rendered parts (label, help, description,
 * error) so slot users replacing those regions keep the id relationships the
 * input's `aria-describedby` points at.
 *
 * @param ids Resolved ids of the layout regions.
 */
export const buildLayoutBags = (ids: {
  labelId: string
  helpId: string
  descriptionId: string
  errorId: string
}): A11yLayoutBags => ({
  label: { id: ids.labelId },
  help: { id: ids.helpId },
  description: { id: ids.descriptionId },
  errors: { id: ids.errorId, role: 'alert' },
})

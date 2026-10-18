// Type-only: erased at compile time, so the runtime module graph stays
// acyclic (blueprints import the aria features, not the reverse).
import type { FileListItem } from '#src/blueprints/file'

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
   * The error region's id and alert role, referenced by `aria-describedby`
   * while the element has errors.
   */
  error: {
    id: string
    role: 'alert'
  }
}

/**
 * Part-keyed accessibility bindings provided by `makeAria` for single-input
 * elements: the `input` bag's ARIA state plus the layout parts' ids and roles.
 */
export interface AriaA11y extends A11yLayoutBags {
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
 * Part-keyed accessibility bindings provided by `makeTAria` for translatable
 * text inputs: the `input` bag additionally references the editing-language
 * live region and carries the input's `lang`.
 */
export interface TAriaA11y extends AriaA11y {
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
 * Part-keyed accessibility bindings provided by `makeGroupAria` for
 * choice-group elements: the `group` bag carries the container's role,
 * labelling, describedby, and group-level state.
 */
export interface GroupAriaA11y extends A11yLayoutBags {
  /**
   * Role, labelling, and ARIA state for the group container.
   */
  group: {
    role: 'group' | 'radiogroup'
    'aria-labelledby'?: string
    'aria-label'?: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
  }
}

/**
 * Part-keyed accessibility bindings provided by `makeButtonAria`: the `button`
 * bag carries native/ARIA disabled state (native on `<button>`,
 * `aria-disabled` on anchors), busy state, the icon-only accessible name, and
 * describedby.
 */
export interface ButtonAriaA11y extends A11yLayoutBags {
  /**
   * Native/ARIA state for the button control.
   */
  button: {
    disabled?: true
    'aria-disabled'?: true
    'aria-busy'?: true
    'aria-label'?: string
    'aria-describedby'?: string
  }
}

/**
 * Part-keyed accessibility bindings provided by `makeFileAria`: the input's
 * bags plus the per-file remove control's bag, a function of the file index.
 */
export interface FileAriaA11y extends AriaA11y {
  /**
   * The per-file remove control's localized accessible name.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  remove: (
    file: FileListItem,
    index: number
  ) => {
    'aria-label': string
  }
}

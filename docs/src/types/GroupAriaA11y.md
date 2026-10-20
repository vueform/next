```ts
/**
 * Part-keyed accessibility bindings produced by the `choicesAria` pattern for
 * choice-group elements: the `wrapper` bag carries the group container's
 * role, labelling, describedby, and group-level state.
 */
interface GroupAriaA11y extends A11yLayoutBags {
  /**
   * Role, labelling, and ARIA state for the group container. Functional on
   * purpose: the bag reads aggregate validation state (`invalid`,
   * `hasError`), which must resolve in the wrapper's own render effect —
   * never inside the merged a11y computed. Children's vapor dynamic prop
   * sources subscribe to that computed, so an eager read closes a reactive
   * cycle (invalid -> children's validation -> child props -> this
   * component's bindings) that Vue 3.6's dirty-check walk cannot terminate
   * on.
   */
  wrapper: () => {
    role: 'group' | 'radiogroup'
    'aria-labelledby'?: string
    'aria-label'?: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
  }
}
```

```ts
/**
 * Part-keyed accessibility bindings produced by the `choicesAria` pattern for
 * choice-group elements: the `wrapper` bag carries the group container's
 * role, labelling, describedby, and group-level state.
 */
interface GroupAriaA11y extends A11yLayoutBags {
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
```
